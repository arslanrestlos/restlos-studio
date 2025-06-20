// lib/models/Campaign.ts

import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  auctionNumber: string;
  auctionLink: string;
  endDate: Date;
  estimatedRevenue: number;
  budget: number;
  channels: string[];
  metaAdTypes?: string[];
  googleAdTypes?: string[];
  status: string;
  notes?: string;
  performance: {
    clicks: number;
    impressions: number;
    conversions: number;
    spentBudget: number;
    actualRevenue: number;
  };
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  roi: number;
  actualRoi: number;
  isActive: boolean;
}

const CampaignSchema = new Schema<ICampaign>({
  // Auktions-Details
  auctionNumber: {
    type: String,
    required: [true, 'Auktionsnummer ist erforderlich'],
    unique: true,
    trim: true,
  },
  auctionLink: {
    type: String,
    required: [true, 'Auktionslink ist erforderlich'],
    trim: true,
    validate: {
      validator: function (v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Auktionslink muss eine gültige URL sein',
    },
  },
  endDate: {
    type: Date,
    required: [true, 'Enddatum ist erforderlich'],
  },

  // Budget & Umsatz
  estimatedRevenue: {
    type: Number,
    required: [true, 'Geschätzte Einnahmen sind erforderlich'],
    min: [0, 'Geschätzte Einnahmen müssen positiv sein'],
  },
  budget: {
    type: Number,
    required: [true, 'Budget ist erforderlich'],
    min: [0, 'Budget muss positiv sein'],
  },

  // Werbekanäle
  channels: [
    {
      type: String,
      enum: ['meta', 'google', 'linkedin', 'newsletter'],
      required: true,
    },
  ],

  // Anzeigentypen als Arrays (optional)
  metaAdTypes: [
    {
      type: String,
      enum: ['single-image', 'carousel', 'video', 'collection'],
    },
  ],
  googleAdTypes: [
    {
      type: String,
      enum: ['search', 'display', 'video', 'performance-max'],
    },
  ],

  // Status
  status: {
    type: String,
    enum: ['draft', 'planned', 'active', 'ended', 'paused'],
    default: 'planned',
  },

  // Zusätzliche Felder
  notes: {
    type: String,
    maxlength: [1000, 'Notizen dürfen maximal 1000 Zeichen haben'],
  },

  // Performance Tracking
  performance: {
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    spentBudget: { type: Number, default: 0 },
    actualRevenue: { type: Number, default: 0 },
  },

  // User-Zuordnung
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt vor jedem Save
CampaignSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Virtuelle Felder
CampaignSchema.virtual('roi').get(function (this: ICampaign) {
  return this.budget > 0 ? this.estimatedRevenue / this.budget : 0;
});

CampaignSchema.virtual('actualRoi').get(function (this: ICampaign) {
  return this.performance.spentBudget > 0
    ? this.performance.actualRevenue / this.performance.spentBudget
    : 0;
});

CampaignSchema.virtual('isActive').get(function (this: ICampaign) {
  return this.status === 'active' && this.endDate > new Date();
});

// Indexe für Performance (nur einmal definieren)
CampaignSchema.index({ createdBy: 1, status: 1 });
CampaignSchema.index({ endDate: 1 });

// JSON Transform (virtuelle Felder einschließen)
CampaignSchema.set('toJSON', { virtuals: true });

const Campaign =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
