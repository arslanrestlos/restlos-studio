// src/app/api/send-verification-success-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'E-Mail und Name sind erforderlich' },
        { status: 400 }
      );
    }

    const result = await EmailService.sendVerificationSuccessEmail({
      email,
      firstName,
      lastName: lastName || '',
    });

    return NextResponse.json({
      success: true,
      message: 'Bestätigungs-E-Mail erfolgreich versendet',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Bestätigungs-E-Mail Fehler:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Bestätigungs-E-Mail konnte nicht versendet werden',
      },
      { status: 500 }
    );
  }
}
