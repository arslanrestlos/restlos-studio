// app/api/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/lib/mongodb';
import Campaign from '@/lib/models/Campaign';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
import {
  CreateCampaignRequest,
  isValidChannel,
  isValidMetaAdType,
  isValidGoogleAdType,
} from '@/lib/types/campaign';

// GET /api/campaigns - Liste aller Kampagnen
export async function GET(request: NextRequest) {
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

    // Query Parameters parsen
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Query Filter aufbauen
    const filter: any = { createdBy: user._id };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.auctionNumber = { $regex: search, $options: 'i' };
    }

    // Sortierung
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (page - 1) * limit;

    // Kampagnen abfragen
    const campaigns = await Campaign.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email');

    // Gesamtanzahl für Pagination
    const total = await Campaign.countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: campaigns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error('GET /api/campaigns error:', error);
    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Laden der Kampagnen' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Neue Kampagne erstellen
export async function POST(request: NextRequest) {
  try {
    console.log('🔥 POST /api/campaigns - Start');

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log('❌ Keine Session oder E-Mail');
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

    const body: CreateCampaignRequest = await request.json();
    console.log('📦 Request Body:', body);

    // Validierung
    const validationError = validateCampaignData(body);
    if (validationError) {
      console.log('❌ Validierungsfehler:', validationError);
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // Prüfen ob Auktionsnummer bereits existiert
    const existingCampaign = await Campaign.findOne({
      auctionNumber: body.auctionNumber,
    });

    if (existingCampaign) {
      return NextResponse.json(
        {
          success: false,
          error: 'Eine Kampagne mit dieser Auktionsnummer existiert bereits',
        },
        { status: 409 }
      );
    }

    // Status bestimmen basierend auf Enddatum
    const endDate = new Date(body.endDate);
    const now = new Date();
    const status = endDate > now ? 'planned' : 'ended';

    // Neue Kampagne erstellen
    const campaignData = {
      ...body,
      createdBy: new mongoose.Types.ObjectId(user._id),
      status,
      performance: {
        clicks: 0,
        impressions: 0,
        conversions: 0,
        spentBudget: 0,
        actualRevenue: 0,
      },
    };

    console.log('💾 Erstelle Kampagne mit Daten:', campaignData);

    const campaign = new Campaign(campaignData);
    const savedCampaign = await campaign.save();

    console.log('✅ Kampagne gespeichert mit ID:', savedCampaign._id);

    // Kampagne mit User-Daten zurückgeben
    await savedCampaign.populate('createdBy', 'firstName lastName email');

    return NextResponse.json(
      {
        success: true,
        data: savedCampaign,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('💥 POST /api/campaigns error:', error);

    // MongoDB Validation Errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      console.error('📋 Validation Messages:', messages);
      return NextResponse.json(
        { success: false, error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Serverfehler beim Erstellen der Kampagne: ' + error.message,
      },
      { status: 500 }
    );
  }
}

// Validierungsfunktion
function validateCampaignData(data: CreateCampaignRequest): string | null {
  // Pflichtfelder prüfen
  if (!data.auctionNumber?.trim()) {
    return 'Auktionsnummer ist erforderlich';
  }

  if (!data.auctionLink?.trim()) {
    return 'Auktionslink ist erforderlich';
  }

  if (!data.endDate) {
    return 'Enddatum ist erforderlich';
  }

  if (!data.estimatedRevenue || data.estimatedRevenue <= 0) {
    return 'Geschätzte Einnahmen müssen größer als 0 sein';
  }

  if (!data.budget || data.budget <= 0) {
    return 'Budget muss größer als 0 sein';
  }

  if (!data.channels || data.channels.length === 0) {
    return 'Mindestens ein Werbekanal muss ausgewählt werden';
  }

  // URL-Format prüfen
  try {
    new URL(data.auctionLink);
  } catch {
    return 'Auktionslink muss eine gültige URL sein';
  }

  // Datum prüfen
  const endDate = new Date(data.endDate);
  if (isNaN(endDate.getTime())) {
    return 'Ungültiges Enddatum';
  }

  // Kanäle validieren
  for (const channel of data.channels) {
    if (!isValidChannel(channel)) {
      return `Ungültiger Kanal: ${channel}`;
    }
  }

  // Meta Anzeigentypen prüfen wenn Meta gewählt
  if (data.channels.includes('meta')) {
    if (!data.metaAdTypes || data.metaAdTypes.length === 0) {
      return 'Mindestens ein Anzeigentyp für Facebook/Instagram ist erforderlich';
    }
    for (const type of data.metaAdTypes) {
      if (!isValidMetaAdType(type)) {
        return `Ungültiger Meta Anzeigentyp: ${type}`;
      }
    }
  }

  // Google Anzeigentypen prüfen wenn Google gewählt
  if (data.channels.includes('google')) {
    if (!data.googleAdTypes || data.googleAdTypes.length === 0) {
      return 'Mindestens ein Anzeigentyp für Google Ads ist erforderlich';
    }
    for (const type of data.googleAdTypes) {
      if (!isValidGoogleAdType(type)) {
        return `Ungültiger Google Anzeigentyp: ${type}`;
      }
    }
  }

  // Notizen Länge prüfen
  if (data.notes && data.notes.length > 1000) {
    return 'Notizen dürfen maximal 1000 Zeichen haben';
  }

  return null;
}
