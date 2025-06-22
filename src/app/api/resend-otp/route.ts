// src/app/api/resend-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import PendingUser from '@/lib/models/PendingUser';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { verificationToken } = await request.json();

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Verification-Token ist erforderlich' },
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

    // Rate Limiting - nur alle 2 Minuten
    if (pendingUser.otpExpires) {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const otpCreatedAt = new Date(
        pendingUser.otpExpires.getTime() - 15 * 60 * 1000
      ); // OTP wurde vor 15 Min erstellt

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

    // Neuen OTP generieren mit PendingUser-Model-Methode
    const newOtp = pendingUser.generateOTP();
    await pendingUser.save();

    // Neue OTP-E-Mail senden über EmailService
    try {
      await EmailService.sendOTPEmail({
        email: pendingUser.email,
        firstName: pendingUser.firstName,
        lastName: pendingUser.lastName,
        otp: newOtp,
      });

      console.log(`Neuer OTP gesendet an: ${pendingUser.email}`);
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
