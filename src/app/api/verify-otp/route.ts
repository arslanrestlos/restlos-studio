// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import PendingUser from '@/lib/models/PendingUser';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { verificationToken, otp } = await request.json();

    if (!verificationToken || !otp) {
      return NextResponse.json(
        { error: 'Verification-Token und OTP sind erforderlich' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Pending User mit Token suchen
    const pendingUser = await PendingUser.findOne({
      verificationToken: verificationToken,
    });

    if (!pendingUser) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Verifizierungslink' },
        { status: 404 }
      );
    }

    // OTP-Verifizierung mit Model-Methode
    if (!pendingUser.verifyOTP(otp)) {
      if (pendingUser.isOTPExpired()) {
        return NextResponse.json(
          {
            error:
              'Der Code ist abgelaufen. Bitte fordere einen neuen Code an.',
          },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: 'Ungültiger Code. Bitte prüfe deine Eingabe.' },
        { status: 400 }
      );
    }

    // Prüfen ob User inzwischen erstellt wurde (Sicherheitscheck)
    const existingUser = await User.findOne({ email: pendingUser.email });
    if (existingUser) {
      // Pending User löschen
      await PendingUser.deleteOne({ _id: pendingUser._id });
      return NextResponse.json(
        { error: 'E-Mail wird bereits verwendet' },
        { status: 409 }
      );
    }

    // JETZT ERST den echten User erstellen
    const newUser = new User({
      firstName: pendingUser.firstName,
      lastName: pendingUser.lastName,
      email: pendingUser.email,
      password: pendingUser.password, // Bereits gehashed
      role: 'user',
      approved: false, // Weiterhin Admin-Freischaltung erforderlich
      isVerified: true, // E-Mail ist jetzt verifiziert
      isActive: true,
    });

    await newUser.save();

    // Pending User löschen
    await PendingUser.deleteOne({ _id: pendingUser._id });

    console.log(`User erfolgreich erstellt und verifiziert: ${newUser.email}`);

    // Professionelle Bestätigungs-E-Mail senden
    try {
      await EmailService.sendVerificationSuccessEmail({
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });
      console.log('Verification Success E-Mail gesendet');
    } catch (emailError) {
      console.error('Verification Success E-Mail Fehler:', emailError);
      // Nicht kritisch - User ist trotzdem erstellt
    }

    return NextResponse.json({
      success: true,
      message:
        'E-Mail erfolgreich bestätigt! Dein Account wurde erstellt und wird nun von unserem Team geprüft.',
    });
  } catch (error) {
    console.error('OTP-Verifizierungsfehler:', error);
    return NextResponse.json(
      { error: 'Verifizierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
