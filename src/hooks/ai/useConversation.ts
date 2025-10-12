/**
 * Conversation Hook
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Hook for managing AI conversations
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Conversation, ChatMessage } from '@/lib/ai/types';
import { conversationManager } from '@/lib/ai';
import { useAI } from './useAI';

export function useConversation(modelId?: string) {
  const { user } = useAuth();
  const { chat, chatStream, loading } = useAI();
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Load user conversations
  const loadConversations = useCallback(() => {
    if (user?.id) {
      const userConversations = conversationManager.getByUser(user.id);
      setConversations(userConversations);
    } else {
      setConversations(conversationManager.getAll());
    }
  }, [user?.id]);

  // Load on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Create new conversation
  const createConversation = useCallback((title?: string) => {
    if (!modelId) {
      throw new Error('Model ID is required to create a conversation');
    }

    const conversation = conversationManager.create(
      modelId,
      user?.id,
      title
    );
    
    setCurrentConversation(conversation);
    loadConversations();
    
    return conversation;
  }, [modelId, user?.id, loadConversations]);

  // Load conversation
  const loadConversation = useCallback((conversationId: string) => {
    const conversation = conversationManager.get(conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
    }
    return conversation;
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) {
      throw new Error('No active conversation');
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
    };
    
    conversationManager.addMessage(currentConversation.id, userMessage);
    setCurrentConversation({ ...conversationManager.get(currentConversation.id)! });

    // Get AI response
    const messages = conversationManager.getMessages(currentConversation.id);
    const response = await chat({
      messages,
      model: currentConversation.modelId,
    });

    // Add assistant message
    const assistantMessage = response.choices[0]?.message;
    if (assistantMessage) {
      conversationManager.addMessage(currentConversation.id, assistantMessage);
      setCurrentConversation({ ...conversationManager.get(currentConversation.id)! });
    }

    loadConversations();
    return response;
  }, [currentConversation, chat, loadConversations]);

  // Send message with streaming
  const sendMessageStream = useCallback(async function* (content: string) {
    if (!currentConversation) {
      throw new Error('No active conversation');
    }

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content,
    };
    
    conversationManager.addMessage(currentConversation.id, userMessage);
    setCurrentConversation({ ...conversationManager.get(currentConversation.id)! });

    // Stream AI response
    const messages = conversationManager.getMessages(currentConversation.id);
    let assistantContent = '';

    for await (const chunk of chatStream({
      messages,
      model: currentConversation.modelId,
    })) {
      assistantContent += chunk;
      yield chunk;
    }

    // Add complete assistant message
    const assistantMessage: ChatMessage = {
      role: 'assistant',
      content: assistantContent,
    };
    
    conversationManager.addMessage(currentConversation.id, assistantMessage);
    setCurrentConversation({ ...conversationManager.get(currentConversation.id)! });
    loadConversations();
  }, [currentConversation, chatStream, loadConversations]);

  // Delete conversation
  const deleteConversation = useCallback((conversationId: string) => {
    conversationManager.delete(conversationId);
    
    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
    }
    
    loadConversations();
  }, [currentConversation, loadConversations]);

  // Clear messages
  const clearMessages = useCallback(() => {
    if (!currentConversation) return false;
    
    const result = conversationManager.clearMessages(currentConversation.id);
    if (result) {
      setCurrentConversation({ ...conversationManager.get(currentConversation.id)! });
    }
    
    return result;
  }, [currentConversation]);

  // Update conversation title
  const updateTitle = useCallback((title: string) => {
    if (!currentConversation) return null;
    
    const updated = conversationManager.update(currentConversation.id, { title });
    if (updated) {
      setCurrentConversation(updated);
      loadConversations();
    }
    
    return updated;
  }, [currentConversation, loadConversations]);

  return {
    conversations,
    currentConversation,
    loading,
    createConversation,
    loadConversation,
    sendMessage,
    sendMessageStream,
    deleteConversation,
    clearMessages,
    updateTitle,
    loadConversations,
  };
}
