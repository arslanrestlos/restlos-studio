// src/app/api/cleanup-pending-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import PendingUser from '@/lib/models/PendingUser';

export async function POST(request: NextRequest) {
  try {
    await connectToDB();

    console.log('=== Cleanup Pending Users ===');

    // 1. Abgelaufene pending Users löschen (älter als 24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredByAge = await PendingUser.deleteMany({
      createdAt: { $lt: oneDayAgo },
    });

    // 2. Users mit abgelaufenen OTPs löschen (OTP älter als 30 Min)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const expiredByOtp = await PendingUser.deleteMany({
      otpExpires: { $lt: thirtyMinutesAgo },
    });

    // 3. Users ohne OTP oder OTP-Expires (kaputte Daten)
    const brokenData = await PendingUser.deleteMany({
      $or: [
        { otp: { $exists: false } },
        { otp: null },
        { otp: '' },
        { otpExpires: { $exists: false } },
        { otpExpires: null },
      ],
    });

    const totalDeleted =
      expiredByAge.deletedCount +
      expiredByOtp.deletedCount +
      brokenData.deletedCount;

    console.log('Cleanup Results:');
    console.log(`- Expired by age (>24h): ${expiredByAge.deletedCount}`);
    console.log(`- Expired by OTP (>30min): ${expiredByOtp.deletedCount}`);
    console.log(`- Broken data: ${brokenData.deletedCount}`);
    console.log(`- Total deleted: ${totalDeleted}`);

    // 4. Statistiken über verbleibende PendingUsers
    const remainingCount = await PendingUser.countDocuments();
    const recentCount = await PendingUser.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }, // Letzten Stunde
    });

    console.log(`- Remaining pending users: ${remainingCount}`);
    console.log(`- Recent pending users (last hour): ${recentCount}`);

    return NextResponse.json({
      success: true,
      message: 'Cleanup erfolgreich durchgeführt',
      deleted: {
        expiredByAge: expiredByAge.deletedCount,
        expiredByOtp: expiredByOtp.deletedCount,
        brokenData: brokenData.deletedCount,
        total: totalDeleted,
      },
      stats: {
        remaining: remainingCount,
        recentCount: recentCount,
      },
    });
  } catch (error) {
    console.error('Cleanup Fehler:', error);
    return NextResponse.json(
      {
        error: 'Cleanup fehlgeschlagen',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}

// GET-Route für Statistiken (ohne Löschen)
export async function GET() {
  try {
    await connectToDB();

    // Statistiken sammeln
    const totalPending = await PendingUser.countDocuments();

    const last24h = await PendingUser.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    const lastHour = await PendingUser.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
    });

    const expiredOtp = await PendingUser.countDocuments({
      otpExpires: { $lt: new Date() },
    });

    const validOtp = await PendingUser.countDocuments({
      otpExpires: { $gte: new Date() },
    });

    // Ältester und neuester PendingUser
    const oldest = await PendingUser.findOne()
      .sort({ createdAt: 1 })
      .select('createdAt email');
    const newest = await PendingUser.findOne()
      .sort({ createdAt: -1 })
      .select('createdAt email');

    return NextResponse.json({
      success: true,
      stats: {
        total: totalPending,
        last24h: last24h,
        lastHour: lastHour,
        expiredOtp: expiredOtp,
        validOtp: validOtp,
        oldest: oldest
          ? {
              email: oldest.email,
              createdAt: oldest.createdAt,
              ageInHours: Math.floor(
                (Date.now() - oldest.createdAt.getTime()) / (1000 * 60 * 60)
              ),
            }
          : null,
        newest: newest
          ? {
              email: newest.email,
              createdAt: newest.createdAt,
              ageInMinutes: Math.floor(
                (Date.now() - newest.createdAt.getTime()) / (1000 * 60)
              ),
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Stats Fehler:', error);
    return NextResponse.json(
      { error: 'Statistiken konnten nicht geladen werden' },
      { status: 500 }
    );
  }
}
