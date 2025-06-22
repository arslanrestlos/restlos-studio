// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { EmailService } from '@/lib/email/emailService';

export async function POST(req: Request) {
  const { firstName, lastName, email, password } = await req.json();

  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { error: 'Alle Felder sind erforderlich' },
      { status: 400 }
    );
  }

  await connectToDB();

  // Prüfen ob User bereits existiert
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json(
      { error: 'E-Mail wird bereits verwendet' },
      { status: 409 }
    );
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Neuen User erstellen
  const newUser = new User({
    firstName,
    lastName,
    email: email.toLowerCase(),
    role: 'user',
    password: hashedPassword,
    approved: false, // Weiterhin Admin-Freischaltung erforderlich
    isVerified: false, // E-Mail-Verifizierung via OTP erforderlich
    isActive: true,
  });

  try {
    // OTP generieren
    const otp = newUser.generateOTP();

    // User in Datenbank speichern
    await newUser.save();

    // OTP-E-Mail senden über EmailService
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
      // User trotzdem erstellt, aber Warnung
      return NextResponse.json({
        success: true,
        message:
          'Registrierung erfolgreich, aber E-Mail-Versand fehlgeschlagen. Bitte kontaktiere den Support.',
        requiresVerification: true,
        email: email.toLowerCase(),
        emailSent: false,
      });
    }

    return NextResponse.json({
      success: true,
      message:
        'Registrierung erfolgreich! Prüfe deine E-Mails für den Bestätigungscode.',
      requiresVerification: true,
      email: email.toLowerCase(),
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
