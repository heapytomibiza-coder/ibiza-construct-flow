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

export interface Message {
  id: string;
  created_at: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'quote';
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
