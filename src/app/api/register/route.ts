// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import PendingUser from '@/lib/models/PendingUser'; // NEU!
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // NEU!
import { EmailService } from '@/lib/email/emailService';

// Sicheren Token generieren
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(req: Request) {
  const { firstName, lastName, email, password } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Alle Felder sind erforderlich' },
      { status: 400 }
    );
  }

  await connectToDB();

  try {
    // Prüfen ob User bereits existiert (in echter User-DB)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'E-Mail wird bereits verwendet' },
        { status: 409 }
      );
    }

    // Prüfen ob bereits ein pending User existiert
    const existingPendingUser = await PendingUser.findOne({
      email: email.toLowerCase(),
    });
    if (existingPendingUser) {
      // Alten pending User löschen
      await PendingUser.deleteOne({ email: email.toLowerCase() });
      console.log('Alter pending User gelöscht für:', email);
    }

    // Passwort hashen
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Sicheren Verification Token generieren
    const verificationToken = generateVerificationToken();

    // Temporären User erstellen (NICHT in User-Collection!)
    const pendingUser = new PendingUser({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      verificationToken,
    });

    // OTP generieren (über PendingUser-Model)
    const otp = pendingUser.generateOTP();

    // Pending User speichern
    await pendingUser.save();

    console.log('Pending User erstellt:', {
      email: pendingUser.email,
      token: verificationToken,
      otp: otp,
    });

    // OTP-E-Mail senden
    try {
      await EmailService.sendOTPEmail({
        email: email.toLowerCase(),
        firstName,
        lastName,
        otp,
      });

      console.log('OTP-E-Mail erfolgreich versendet');
    } catch (emailError) {
      console.error('OTP-E-Mail-Versand-Fehler:', emailError);
      // Pending User löschen bei E-Mail-Fehler
      await PendingUser.deleteOne({ _id: pendingUser._id });

      return NextResponse.json(
        {
          success: false,
          message: 'E-Mail-Versand fehlgeschlagen. Bitte versuche es erneut.',
          requiresVerification: false,
          emailSent: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Registrierung gestartet! Prüfe deine E-Mails für den Bestätigungscode.',
      requiresVerification: true,
      verificationToken, // NEU: Sicherer Token statt E-Mail!
      emailSent: true,
    });
  } catch (error) {
    console.error('Registrierungsfehler:', error);
    return NextResponse.json(
      { error: 'Registrierung fehlgeschlagen. Bitte versuche es erneut.' },
      { status: 500 }
    );
  }
}
