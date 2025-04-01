/**
 * OpenRouter API types
 */

export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  messages: Omit<ChatMessage, 'timestamp'>[];
  model: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export interface ChatResponse {
  message: ChatMessage;
  status: 'complete' | 'streaming';
  model: string;
  id: string;
}

export interface ChatError {
  error: string;
  message: string;
  status: number;
}

export interface StreamingChunk {
  id: string;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatOptions {
  model?: string;
  stream?: boolean;
  max_tokens?: number;
  temperature?: number;
}

export type ChatStreamCallback = (chunk: string, done: boolean) => void;
