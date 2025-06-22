// src/app/api/send-otp-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName, otp } = await request.json();

    if (!email || !firstName || !otp) {
      return NextResponse.json(
        { error: 'E-Mail, Name und OTP sind erforderlich' },
        { status: 400 }
      );
    }

    const result = await EmailService.sendOTPEmail({
      email,
      firstName,
      lastName: lastName || '',
      otp,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP-E-Mail erfolgreich versendet',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('OTP-E-Mail Fehler:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'OTP-E-Mail konnte nicht versendet werden',
      },
      { status: 500 }
    );
  }
}
