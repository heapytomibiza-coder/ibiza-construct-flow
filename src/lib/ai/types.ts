/**
 * AI Types
 * Phase 30: Advanced AI & ML Integration System
 */

export interface AIModel {
  id: string;
  name: string;
  provider: 'lovable' | 'openai' | 'anthropic' | 'google' | 'custom';
  modelId: string;
  description?: string;
  capabilities: ModelCapability[];
  config: ModelConfig;
  enabled: boolean;
  createdAt: Date;
}

export type ModelCapability = 
  | 'text_generation'
  | 'chat'
  | 'image_generation'
  | 'image_analysis'
  | 'embeddings'
  | 'function_calling'
  | 'streaming';

export interface ModelConfig {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  [key: string]: any;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}

export interface FunctionCall {
  name: string;
  arguments: string;
}

export interface ChatOptions {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  functions?: AIFunction[];
  functionCall?: 'auto' | 'none' | { name: string };
}

export interface ChatResponse {
  id: string;
  model: string;
  choices: ChatChoice[];
  usage: TokenUsage;
  created: number;
}

export interface ChatChoice {
  index: number;
  message: ChatMessage;
  finishReason: 'stop' | 'length' | 'function_call' | 'content_filter';
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface PromptTemplate {
  id: string;
  name: string;
  description?: string;
  template: string;
  variables: TemplateVariable[];
  category: string;
  tags: string[];
  modelId?: string;
  config?: ModelConfig;
  createdAt: Date;
  updatedAt?: Date;
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  default?: any;
  description?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  modelId: string;
  messages: ChatMessage[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
  userId?: string;
}

export interface EmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface EmbeddingResponse {
  data: Embedding[];
  model: string;
  usage: TokenUsage;
}

export interface Embedding {
  index: number;
  embedding: number[];
  object: 'embedding';
}

export interface AITask {
  id: string;
  type: TaskType;
  input: any;
  output?: any;
  status: TaskStatus;
  modelId: string;
  config?: ModelConfig;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
}

export type TaskType = 
  | 'chat'
  | 'completion'
  | 'embedding'
  | 'classification'
  | 'summarization'
  | 'translation'
  | 'extraction'
  | 'generation';

export type TaskStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface AIMetrics {
  modelId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  averageLatency: number;
  averageTokensPerRequest: number;
  lastRequestAt?: Date;
}

export interface AIAgent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  modelId: string;
  tools: AIFunction[];
  config: ModelConfig;
  enabled: boolean;
  createdAt: Date;
}
