// src/app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'E-Mail und OTP sind erforderlich' },
        { status: 400 }
      );
    }

    await connectToDB();

    // User suchen (unverifiziert)
    const user = await User.findOne({
      email: email.toLowerCase(),
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Account nicht gefunden oder bereits verifiziert' },
        { status: 404 }
      );
    }

    // OTP-Verifizierung mit Model-Methode
    if (!user.verifyOTP(otp)) {
      if (user.isOTPExpired()) {
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

    // Account verifizieren
    user.isVerified = true;
    user.clearOTP(); // OTP löschen
    await user.save();

    console.log(`Account verifiziert: ${user.email}`);

    // Bestätigungs-E-Mail senden (dass Verifizierung erfolgreich)
    try {
      await EmailService.sendVerificationSuccessEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
      console.log('Verification Success E-Mail gesendet');
    } catch (emailError) {
      console.error('Verification Success E-Mail Fehler:', emailError);
      // Nicht kritisch - Verifizierung trotzdem erfolgreich
    }

    return NextResponse.json({
      success: true,
      message:
        'E-Mail erfolgreich bestätigt! Dein Account wird nun von unserem Team geprüft.',
    });
  } catch (error) {
    console.error('OTP-Verifizierungsfehler:', error);
    return NextResponse.json(
      { error: 'Verifizierung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
