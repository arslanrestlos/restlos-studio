// src/app/api/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'E-Mail ist erforderlich' },
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

    // Rate Limiting - nur alle 2 Minuten
    if (user.otpExpires) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const otpCreatedAt = new Date(user.otpExpires.getTime() - 15 * 60 * 1000); // OTP wurde vor 15 Min erstellt

      if (otpCreatedAt > twoMinutesAgo) {
        const waitTime = Math.ceil(
          (otpCreatedAt.getTime() - twoMinutesAgo.getTime()) / 1000 / 60
        );
        return NextResponse.json(
          {
            error: `Bitte warte noch ${waitTime} Minute(n) bevor du einen neuen Code anforderst.`,
          },
          { status: 429 }
        );
      }
    }

    // Neuen OTP generieren mit Model-Methode
    const newOtp = user.generateOTP();
    await user.save();

    // Neue OTP-E-Mail senden über EmailService
    try {
      await EmailService.sendOTPEmail({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        otp: newOtp,
      });

      console.log(`Neuer OTP gesendet an: ${user.email}`);
    } catch (emailError) {
      console.error('OTP-Resend E-Mail Fehler:', emailError);
      return NextResponse.json(
        { error: 'Neuer Code konnte nicht gesendet werden' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Neuer Code wurde gesendet! Prüfe deine E-Mails.',
    });
  } catch (error) {
    console.error('OTP-Resend Fehler:', error);
    return NextResponse.json(
      { error: 'Neuer Code konnte nicht angefordert werden' },
      { status: 500 }
    );
  }
}
