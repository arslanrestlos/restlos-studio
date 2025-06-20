// app/api/campaigns/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDB } from '@/lib/mongodb';
import Campaign from '@/lib/models/Campaign';
import User from '@/lib/models/User';
import { CampaignStats } from '@/lib/types/campaign';

// GET /api/campaigns/stats - Dashboard Statistiken
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

    const userId = user._id;

    // Aggregation Pipeline für effiziente Statistiken
    const statsResult = await Campaign.aggregate([
      // Nur Kampagnen des aktuellen Benutzers
      {
        $match: { createdBy: userId },
      },

      // Gruppierung und Berechnung
      {
        $group: {
          _id: null,

          // Anzahl Kampagnen pro Status
          totalCampaigns: { $sum: 1 },
          activeCampaigns: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0],
            },
          },
          plannedCampaigns: {
            $sum: {
              $cond: [{ $eq: ['$status', 'planned'] }, 1, 0],
            },
          },
          endedCampaigns: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ended'] }, 1, 0],
            },
          },

          // Budget Summen
          totalBudget: { $sum: '$budget' },
          spentBudget: { $sum: '$performance.spentBudget' },

          // Umsatz Summen
          estimatedRevenue: { $sum: '$estimatedRevenue' },
          actualRevenue: { $sum: '$performance.actualRevenue' },

          // Für ROI Berechnung
          totalEstimatedRevenue: { $sum: '$estimatedRevenue' },
          totalBudgetForRoi: { $sum: '$budget' },
        },
      },
    ]);

    // Fallback wenn keine Kampagnen existieren
    const stats: CampaignStats =
      statsResult.length > 0
        ? {
            totalCampaigns: statsResult[0].totalCampaigns || 0,
            activeCampaigns: statsResult[0].activeCampaigns || 0,
            plannedCampaigns: statsResult[0].plannedCampaigns || 0,
            endedCampaigns: statsResult[0].endedCampaigns || 0,
            totalBudget: statsResult[0].totalBudget || 0,
            spentBudget: statsResult[0].spentBudget || 0,
            estimatedRevenue: statsResult[0].estimatedRevenue || 0,
            actualRevenue: statsResult[0].actualRevenue || 0,
            averageRoi:
              statsResult[0].totalBudgetForRoi > 0
                ? statsResult[0].totalEstimatedRevenue /
                  statsResult[0].totalBudgetForRoi
                : 0,
          }
        : {
            totalCampaigns: 0,
            activeCampaigns: 0,
            plannedCampaigns: 0,
            endedCampaigns: 0,
            totalBudget: 0,
            spentBudget: 0,
            estimatedRevenue: 0,
            actualRevenue: 0,
            averageRoi: 0,
          };

    // Zusätzliche Insights berechnen
    const insights = await calculateInsights(userId);

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        insights,
      },
    });
  } catch (error: any) {
    console.error('GET /api/campaigns/stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Serverfehler beim Laden der Statistiken' },
      { status: 500 }
    );
  }
}

// Zusätzliche Insights berechnen
async function calculateInsights(userId: any) {
  try {
    // Top performing Kanäle
    const channelPerformance = await Campaign.aggregate([
      { $match: { createdBy: userId } },
      { $unwind: '$channels' },
      {
        $group: {
          _id: '$channels',
          count: { $sum: 1 },
          totalBudget: { $sum: '$budget' },
          totalRevenue: { $sum: '$estimatedRevenue' },
          avgRoi: {
            $avg: {
              $cond: [
                { $gt: ['$budget', 0] },
                { $divide: ['$estimatedRevenue', '$budget'] },
                0,
              ],
            },
          },
        },
      },
      { $sort: { avgRoi: -1 } },
    ]);

    // Aktuelle Woche Trends
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentCampaigns = await Campaign.countDocuments({
      createdBy: userId,
      createdAt: { $gte: weekAgo },
    });

    // Bald endende Kampagnen (nächste 7 Tage)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const endingSoon = await Campaign.countDocuments({
      createdBy: userId,
      status: { $in: ['active', 'planned'] },
      endDate: { $lte: nextWeek, $gte: new Date() },
    });

    return {
      topChannels: channelPerformance.slice(0, 3),
      recentCampaigns,
      endingSoon,
      weeklyGrowth: recentCampaigns, // Vereinfacht, könnte mit Vorwoche verglichen werden
    };
  } catch (error) {
    console.error('Error calculating insights:', error);
    return {
      topChannels: [],
      recentCampaigns: 0,
      endingSoon: 0,
      weeklyGrowth: 0,
    };
  }
}
