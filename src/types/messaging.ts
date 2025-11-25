export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  client_id: string;
  professional_id: string;
  job_id: string | null;
  status: 'active' | 'archived' | 'blocked';
  last_message_at: string | null;
}

export type ExtendedMessageType = 
  | 'text' 
  | 'file' 
  | 'image' 
  | 'quote'
  | 'quote_sent'
  | 'quote_updated'
  | 'quote_accepted'
  | 'quote_rejected'
  | 'deposit_request'
  | 'payment_received'
  | 'work_complete_request'
  | 'work_approved'
  | 'milestone_created'
  | 'milestone_completed'
  | 'date_proposal'
  | 'photo_request';

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: ExtendedMessageType;
  file_url?: string | null;
  file_name?: string | null;
  metadata?: Record<string, any>;
  read_at?: string | null;
  is_deleted: boolean;
}

export interface ConversationWithDetails extends Conversation {
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count: number;
}

export interface SpamKeyword {
  id: string;
  keyword: string;
  severity: 'warning' | 'block';
  category: string;
}

export interface JobTimelineEvent {
  id: string;
  job_id: string;
  event_type: string;
  event_title: string;
  event_description?: string;
  metadata?: Record<string, any>;
  created_by?: string;
  created_at: string;
}
