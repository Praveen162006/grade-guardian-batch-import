// Brand Sentiment Analysis Types

export interface BrandConfig {
  id: string;
  name: string;
  keywords: string[]; // Alternative names, misspellings, variations
  monitoringEnabled: boolean;
  alertThreshold: number; // Threshold for negative sentiment alerts (-1 to 0)
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandComment {
  id: string;
  brandId: string;
  comment: string;
  source: string; // e.g., 'manual', 'webhook', 'api'
  sourceUrl?: string;
  authorName?: string;
  authorEmail?: string;
  timestamp: string;
  createdBy: string;
  createdAt: string;
}

export interface BrandSentimentAnalysis {
  id: string;
  commentId: string;
  brandId: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1 scale
  confidence: number; // 0 to 1 scale
  analysis: string;
  keywords: string[];
  brandMentions: string[];
  alertTriggered: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  createdAt: string;
}

export interface BrandSentimentRequest {
  comment: string;
  brandName: string;
  context?: string;
}

export interface BrandSentimentResponse {
  success: boolean;
  result?: BrandSentimentResult;
  error?: string;
  brandName: string;
  originalComment: string;
}

export interface BrandSentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  analysis: string;
  keywords: string[];
  brandMentions: string[];
}

export interface SentimentTrend {
  date: string;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageScore: number;
}

export interface BrandSentimentStats {
  brandId: string;
  brandName: string;
  totalComments: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageScore: number;
  alertCount: number;
  lastAnalyzed: string;
  trends: SentimentTrend[];
}

export interface SentimentAlert {
  id: string;
  brandId: string;
  analysisId: string;
  alertType: 'negative_sentiment' | 'threshold_breach' | 'volume_spike';
  severity: 'low' | 'medium' | 'high';
  message: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

export interface CommentInput {
  comment: string;
  brandName: string;
  source?: string;
  sourceUrl?: string;
  authorName?: string;
  authorEmail?: string;
  context?: string;
}

export interface BrandConfigFormData {
  name: string;
  keywords: string[];
  alertThreshold: number;
  monitoringEnabled: boolean;
}

// API Response types for integration
export interface BrandSentimentApiResponse {
  data?: BrandSentimentAnalysis[];
  error?: string;
  count?: number;
}

export interface BrandConfigApiResponse {
  data?: BrandConfig[];
  error?: string;
  count?: number;
}

export interface SentimentStatsApiResponse {
  data?: BrandSentimentStats;
  error?: string;
}