/**
 * AI Client
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Client for interacting with AI models via Lovable AI Gateway
 */

import {
  ChatOptions,
  ChatResponse,
  ChatMessage,
  EmbeddingRequest,
  EmbeddingResponse,
} from './types';

export class AIClient {
  private apiUrl: string;
  private apiKey: string;
  private defaultModel: string;

  constructor(config: {
    apiUrl?: string;
    apiKey?: string;
    defaultModel?: string;
  } = {}) {
    this.apiUrl = config.apiUrl || '/functions/v1/ai-chat';
    this.apiKey = config.apiKey || '';
    this.defaultModel = config.defaultModel || 'google/gemini-2.5-flash';
  }

  /**
   * Create chat completion
   */
  async chat(options: ChatOptions): Promise<ChatResponse> {
    const response = await this.makeRequest('/chat', {
      model: options.model || this.defaultModel,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: false,
      functions: options.functions,
      function_call: options.functionCall,
    });

    return response;
  }

  /**
   * Create streaming chat completion
   */
  async *chatStream(options: ChatOptions): AsyncGenerator<string, void, unknown> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify({
        model: options.model || this.defaultModel,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true,
        functions: options.functions,
        function_call: options.functionCall,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Process any remaining buffer
          if (buffer.trim()) {
            const lines = buffer.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) yield content;
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Create embeddings
   */
  async createEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const response = await this.makeRequest('/embeddings', {
      model: request.model || 'text-embedding-ada-002',
      input: request.input,
    });

    return response;
  }

  /**
   * Generate completion
   */
  async complete(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    const response = await this.chat({
      messages: [
        { role: 'user', content: prompt },
      ],
      model: options?.model,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Make API request
   */
  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const url = this.apiUrl.replace('/chat', endpoint);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI request failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Update configuration
   */
  updateConfig(config: {
    apiUrl?: string;
    apiKey?: string;
    defaultModel?: string;
  }): void {
    if (config.apiUrl) this.apiUrl = config.apiUrl;
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.defaultModel) this.defaultModel = config.defaultModel;
  }
}

// Global AI client instance
export const aiClient = new AIClient();
