// lib/types/campaign.ts

export type CampaignStatus =
  | 'draft'
  | 'planned'
  | 'active'
  | 'ended'
  | 'paused';

export type Channel = 'meta' | 'google' | 'linkedin' | 'newsletter';

export type MetaAdType = 'single-image' | 'carousel' | 'video' | 'collection';

export type GoogleAdType = 'search' | 'display' | 'video' | 'performance-max';

export interface CampaignPerformance {
  clicks: number;
  impressions: number;
  conversions: number;
  spentBudget: number;
  actualRevenue: number;
}

export interface Campaign {
  _id: string;
  auctionNumber: string;
  auctionLink: string;
  endDate: string; // ISO date string
  estimatedRevenue: number;
  budget: number;
  channels: Channel[];
  metaAdTypes?: MetaAdType[]; // Array statt single value
  googleAdTypes?: GoogleAdType[]; // Array statt single value
  status: CampaignStatus;
  notes?: string;
  performance: CampaignPerformance;
  createdBy: string; // User ID
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string

  // Virtuelle Felder
  roi: number;
  actualRoi: number;
  isActive: boolean;
}

// Für API Requests (ohne _id, timestamps, etc.)
export interface CreateCampaignRequest {
  auctionNumber: string;
  auctionLink: string;
  endDate: string;
  estimatedRevenue: number;
  budget: number;
  channels: Channel[];
  metaAdTypes?: MetaAdType[]; // Array statt single value
  googleAdTypes?: GoogleAdType[]; // Array statt single value
  notes?: string;
}

// Für Updates (alle Felder optional außer ID)
export interface UpdateCampaignRequest {
  auctionNumber?: string;
  auctionLink?: string;
  endDate?: string;
  estimatedRevenue?: number;
  budget?: number;
  channels?: Channel[];
  metaAdTypes?: MetaAdType[]; // Array statt single value
  googleAdTypes?: GoogleAdType[]; // Array statt single value
  status?: CampaignStatus;
  notes?: string;
}

// API Response Types
export interface CampaignResponse {
  success: boolean;
  data?: Campaign;
  error?: string;
}

export interface CampaignsListResponse {
  success: boolean;
  data?: Campaign[];
  total?: number;
  page?: number;
  limit?: number;
  error?: string;
}

// Query Parameters für Listen-API
export interface CampaignQueryParams {
  page?: number;
  limit?: number;
  status?: CampaignStatus;
  search?: string; // Suche in auctionNumber
  sortBy?: 'createdAt' | 'endDate' | 'budget' | 'estimatedRevenue';
  sortOrder?: 'asc' | 'desc';
}

// Dashboard Statistics
export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  plannedCampaigns: number;
  endedCampaigns: number;
  totalBudget: number;
  spentBudget: number;
  estimatedRevenue: number;
  actualRevenue: number;
  averageRoi: number;
}

// Channel Labels für Frontend
export const CHANNEL_LABELS: Record<Channel, string> = {
  meta: 'Facebook/Instagram',
  google: 'Google Ads',
  linkedin: 'LinkedIn',
  newsletter: 'Newsletter',
};

// Status Labels für Frontend
export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Entwurf',
  planned: 'Geplant',
  active: 'Aktiv',
  ended: 'Beendet',
  paused: 'Pausiert',
};

// Anzeigentyp Labels
export const META_AD_TYPE_LABELS: Record<MetaAdType, string> = {
  'single-image': 'Single Image',
  carousel: 'Carousel',
  video: 'Video',
  collection: 'Collection',
};

export const GOOGLE_AD_TYPE_LABELS: Record<GoogleAdType, string> = {
  search: 'Suchnetzwerk',
  display: 'Display',
  video: 'Video (YouTube)',
  'performance-max': 'Performance Max',
};

// Validation Helpers
export const isValidChannel = (channel: string): channel is Channel => {
  return ['meta', 'google', 'linkedin', 'newsletter'].includes(channel);
};

export const isValidStatus = (status: string): status is CampaignStatus => {
  return ['draft', 'planned', 'active', 'ended', 'paused'].includes(status);
};

export const isValidMetaAdType = (type: string): type is MetaAdType => {
  return ['single-image', 'carousel', 'video', 'collection'].includes(type);
};

export const isValidGoogleAdType = (type: string): type is GoogleAdType => {
  return ['search', 'display', 'video', 'performance-max'].includes(type);
};
