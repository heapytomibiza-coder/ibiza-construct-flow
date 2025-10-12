/**
 * AI Hook
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Hook for AI model interactions
 */

import { useState, useCallback } from 'react';
import { ChatMessage, ChatOptions } from '@/lib/ai/types';
import { aiClient } from '@/lib/ai';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chat completion
  const chat = useCallback(async (options: ChatOptions) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiClient.chat(options);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Streaming chat
  const chatStream = useCallback(async function* (options: ChatOptions) {
    setLoading(true);
    setError(null);

    try {
      for await (const chunk of aiClient.chatStream(options)) {
        yield chunk;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Simple completion
  const complete = useCallback(async (
    prompt: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiClient.complete(prompt, options);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'AI request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    chat,
    chatStream,
    complete,
  };
}
