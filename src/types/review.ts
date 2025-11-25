export interface Review {
  id: string;
  created_at: string;
  updated_at: string;
  job_id: string | null;
  contract_id: string | null;
  reviewer_id: string;
  reviewee_id: string;
  
  // Multi-category ratings
  timeliness_rating: number;
  communication_rating: number;
  value_rating: number;
  quality_rating: number;
  professionalism_rating: number;
  overall_rating: number;
  
  // Content
  title?: string | null;
  comment?: string | null;
  photos?: string[] | null;
  
  // Status
  status: 'active' | 'hidden' | 'reported' | 'removed';
  is_verified: boolean;
  
  // Engagement
  helpful_count: number;
  not_helpful_count: number;
  
  // Response
  response_text?: string | null;
  response_at?: string | null;
}

export interface ReviewWithDetails extends Review {
  reviewer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reviewee?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface ReviewVote {
  id: string;
  created_at: string;
  review_id: string;
  voter_id: string;
  vote_type: 'helpful' | 'not_helpful';
}

export interface CategoryRatings {
  timeliness: number;
  communication: number;
  value: number;
  quality: number;
  professionalism: number;
}

export interface RatingBreakdown {
  category: keyof CategoryRatings;
  rating: number;
  label: string;
  icon: string;
}
