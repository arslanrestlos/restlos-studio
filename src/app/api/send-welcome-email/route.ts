// src/app/api/send-welcome-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, lastName } = await request.json();

    console.log('=== Welcome E-Mail Request ===');
    console.log('Email:', email);
    console.log('Name:', firstName, lastName);

    if (!email || !firstName) {
      return NextResponse.json(
        { error: 'E-Mail und Name sind erforderlich' },
        { status: 400 }
      );
    }

    // Email-Format validieren
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    // Welcome-E-Mail über EmailService mit professionellem Template senden
    const result = await EmailService.sendWelcomeEmail({
      email,
      firstName,
      lastName: lastName || '',
    });

    console.log('Welcome-E-Mail erfolgreich versendet:', result.messageId);

    return NextResponse.json({
      success: true,
      message: 'Willkommens-E-Mail erfolgreich versendet',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('=== Willkommens-E-Mail Fehler ===');
    console.error('Error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Willkommens-E-Mail konnte nicht versendet werden',
        debug: {
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
        },
      },
      { status: 500 }
    );
  }
}
