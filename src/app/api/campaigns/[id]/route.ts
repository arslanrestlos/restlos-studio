// app/api/campaigns/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/lib/mongodb';
import Campaign from '@/lib/models/Campaign';
import User from '@/lib/models/User';
import {
  UpdateCampaignRequest,
  isValidChannel,
  isValidStatus,
  isValidMetaAdType,
  isValidGoogleAdType,
} from '@/lib/types/campaign';

// GET /api/campaigns/[id] - Einzelne Kampagne abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    await connectToDB();

    // User anhand E-Mail finden
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const campaign = await Campaign.findOne({
      _id: params.id,
      createdBy: user._id, // Nur eigene Kampagnen
    }).populate('createdBy', 'firstName lastName email');

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Kampagne nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error: any) {
    console.error('GET /api/campaigns/[id] error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Ungültige Kampagnen-ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Laden der Kampagne' },
      { status: 500 }
    );
  }
}

// PUT /api/campaigns/[id] - Kampagne bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔥 PUT /api/campaigns/[id] - Start für ID:', params.id);

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    await connectToDB();

    // User anhand E-Mail finden
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    const body: UpdateCampaignRequest = await request.json();
    console.log('📦 Update Body:', body);

    // Validierung
    const validationError = validateUpdateData(body);
    if (validationError) {
      console.log('❌ Validierungsfehler:', validationError);
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Kampagne finden und prüfen ob Benutzer Berechtigung hat
    const existingCampaign = await Campaign.findOne({
      _id: params.id,
      createdBy: user._id,
    });

    if (!existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kampagne nicht gefunden oder keine Berechtigung',
        },
        { status: 404 }
      );
    }

    // Auktionsnummer Duplikat prüfen (falls geändert)
    if (
      body.auctionNumber &&
      body.auctionNumber !== existingCampaign.auctionNumber
    ) {
      const duplicateCampaign = await Campaign.findOne({
        auctionNumber: body.auctionNumber,
        _id: { $ne: params.id },
      });

      if (duplicateCampaign) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Eine andere Kampagne mit dieser Auktionsnummer existiert bereits',
          },
          { status: 409 }
        );
      }
    }

    // Status automatisch aktualisieren basierend auf Enddatum
    if (body.endDate) {
      const endDate = new Date(body.endDate);
      const now = new Date();

      if (endDate <= now && existingCampaign.status === 'active') {
        body.status = 'ended';
      } else if (endDate > now && existingCampaign.status === 'ended') {
        body.status = 'planned';
      }
    }

    // Kampagne aktualisieren
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      params.id,
      {
        ...body,
        updatedAt: new Date(),
      },
      {
        new: true, // Rückgabe des aktualisierten Dokuments
        runValidators: true, // MongoDB Validatoren ausführen
      }
    ).populate('createdBy', 'firstName lastName email');

    console.log('✅ Kampagne aktualisiert:', updatedCampaign?._id);

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
    });
  } catch (error: any) {
    console.error('PUT /api/campaigns/[id] error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Ungültige Kampagnen-ID' },
        { status: 400 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Aktualisieren der Kampagne' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Kampagne löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    await connectToDB();

    // User anhand E-Mail finden
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Benutzer nicht gefunden' },
        { status: 404 }
      );
    }

    // Kampagne finden und löschen (nur wenn Benutzer berechtigt ist)
    const deletedCampaign = await Campaign.findOneAndDelete({
      _id: params.id,
      createdBy: user._id,
    });

    if (!deletedCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Kampagne nicht gefunden oder keine Berechtigung',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kampagne erfolgreich gelöscht',
    });
  } catch (error: any) {
    console.error('DELETE /api/campaigns/[id] error:', error);

    if (error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Ungültige Kampagnen-ID' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Löschen der Kampagne' },
      { status: 500 }
    );
  }
}

// Validierung für Updates
function validateUpdateData(data: UpdateCampaignRequest): string | null {
  // Nur validieren was vorhanden ist (partial update)

  if (data.auctionNumber !== undefined && !data.auctionNumber.trim()) {
    return 'Auktionsnummer darf nicht leer sein';
  }

  if (data.auctionLink !== undefined) {
    if (!data.auctionLink.trim()) {
      return 'Auktionslink darf nicht leer sein';
    }
    try {
      new URL(data.auctionLink);
    } catch {
      return 'Auktionslink muss eine gültige URL sein';
    }
  }

  if (data.endDate !== undefined) {
    const endDate = new Date(data.endDate);
    if (isNaN(endDate.getTime())) {
      return 'Ungültiges Enddatum';
    }
  }

  if (data.estimatedRevenue !== undefined && data.estimatedRevenue <= 0) {
    return 'Geschätzte Einnahmen müssen größer als 0 sein';
  }

  if (data.budget !== undefined && data.budget <= 0) {
    return 'Budget muss größer als 0 sein';
  }

  if (data.channels !== undefined) {
    if (data.channels.length === 0) {
      return 'Mindestens ein Werbekanal muss ausgewählt werden';
    }

    for (const channel of data.channels) {
      if (!isValidChannel(channel)) {
        return `Ungültiger Kanal: ${channel}`;
      }
    }

    // Meta Anzeigentypen prüfen
    if (data.channels.includes('meta') && data.metaAdTypes !== undefined) {
      if (!data.metaAdTypes || data.metaAdTypes.length === 0) {
        return 'Mindestens ein Anzeigentyp für Facebook/Instagram ist erforderlich';
      }
      for (const type of data.metaAdTypes) {
        if (!isValidMetaAdType(type)) {
          return `Ungültiger Meta Anzeigentyp: ${type}`;
        }
      }
    }

    // Google Anzeigentypen prüfen
    if (data.channels.includes('google') && data.googleAdTypes !== undefined) {
      if (!data.googleAdTypes || data.googleAdTypes.length === 0) {
        return 'Mindestens ein Anzeigentyp für Google Ads ist erforderlich';
      }
      for (const type of data.googleAdTypes) {
        if (!isValidGoogleAdType(type)) {
          return `Ungültiger Google Anzeigentyp: ${type}`;
        }
      }
    }
  }

  if (data.status !== undefined && !isValidStatus(data.status)) {
    return `Ungültiger Status: ${data.status}`;
  }

  if (data.notes !== undefined && data.notes.length > 1000) {
    return 'Notizen dürfen maximal 1000 Zeichen haben';
  }

  return null;
}
