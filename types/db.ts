// Mirrors supabase/migrations/0001_init.sql
// Regenerate properly later with: supabase gen types typescript

export type ConfidenceType = 'fact' | 'derived' | 'estimate' | 'ai_analysis';
export type CompetitorLinkStatus = 'suggested' | 'confirmed' | 'rejected';
export type AuditStatus = 'pending' | 'collecting' | 'analysing' | 'complete' | 'failed';
export type RoadmapTimeframe = 'immediate' | '30_day' | '60_day' | '90_day';
export type RoadmapStatus = 'proposed' | 'approved' | 'in_progress' | 'done' | 'rejected';

export interface Business {
  id: string;
  is_managed: boolean;
  name: string;
  cuisine_type: string | null;
  website_url: string | null;
  menu_url: string | null;
  gbp_url: string | null;
  gbp_place_id: string | null;
  google_review_url: string | null;
  address_line: string | null;
  postcode: string | null;
  phone: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  ordering_provider: string | null;
  ordering_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorLink {
  id: string;
  managed_business_id: string;
  competitor_business_id: string;
  distance_km: number | null;
  cuisine_similarity_score: number | null;
  relevance_score: number | null;
  status: CompetitorLinkStatus;
  confirmed_by: string | null;
  confirmed_at: string | null;
  created_at: string;
}

export interface Audit {
  id: string;
  managed_business_id: string;
  status: AuditStatus;
  radius_km: number;
  requested_by: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface Source {
  id: string;
  audit_id: string | null;
  business_id: string;
  source_type: string;
  source_url: string | null;
  provider: string | null;
  raw_payload: unknown;
  fetched_at: string;
  is_fallback: boolean;
}

export interface Finding {
  id: string;
  audit_id: string;
  business_id: string;
  source_id: string | null;
  category: string;
  finding_key: string;
  finding_label: string;
  value_text: string | null;
  value_numeric: number | null;
  confidence_type: ConfidenceType;
  confidence_notes: string | null;
  created_at: string;
}

export interface Score {
  id: string;
  audit_id: string;
  business_id: string;
  score_type: string;
  score_value: number;
  formula_notes: string;
  inputs: unknown;
  created_at: string;
}

export interface RoadmapItem {
  id: string;
  audit_id: string;
  managed_business_id: string;
  timeframe: RoadmapTimeframe;
  problem: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | null;
  effort: 'low' | 'medium' | 'high' | null;
  suggested_channel: string | null;
  supporting_finding_ids: string[] | null;
  status: RoadmapStatus;
  created_at: string;
}
