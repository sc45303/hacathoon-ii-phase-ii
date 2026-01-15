  // TypeScript types for chat functionality.
export interface ChatMessage {
  id: string; // Unique identifier for the message (can be temporary for optimistic updates)
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date | string; // Date object or ISO string
  token_count?: number;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessage[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: number;
  system_prompt?: string;
  temperature?: number;
}

export interface ChatResponse {
  conversation_id: number;
  message: string;
  role: 'assistant';
  timestamp: string;
  token_count?: number;
  model?: string;
}

export interface ChatError {
  detail: string;
  status_code: number;
}
