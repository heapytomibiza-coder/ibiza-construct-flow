/**
 * Conversation Manager
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Manages conversation history and context
 */

import { Conversation, ChatMessage } from './types';
import { v4 as uuidv4 } from 'uuid';

export class ConversationManager {
  private conversations: Map<string, Conversation> = new Map();
  private maxConversations: number = 100;
  private maxMessagesPerConversation: number = 100;

  /**
   * Create conversation
   */
  create(
    modelId: string,
    userId?: string,
    title?: string
  ): Conversation {
    const conversation: Conversation = {
      id: uuidv4(),
      title,
      modelId,
      messages: [],
      userId,
      createdAt: new Date(),
    };

    this.conversations.set(conversation.id, conversation);
    this.pruneOldConversations();

    return conversation;
  }

  /**
   * Get conversation
   */
  get(conversationId: string): Conversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all conversations
   */
  getAll(): Conversation[] {
    return Array.from(this.conversations.values())
      .sort((a, b) => b.updatedAt?.getTime() || b.createdAt.getTime() - 
                     (a.updatedAt?.getTime() || a.createdAt.getTime()));
  }

  /**
   * Get conversations by user
   */
  getByUser(userId: string): Conversation[] {
    return Array.from(this.conversations.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.updatedAt?.getTime() || b.createdAt.getTime() - 
                     (a.updatedAt?.getTime() || a.createdAt.getTime()));
  }

  /**
   * Add message to conversation
   */
  addMessage(
    conversationId: string,
    message: ChatMessage
  ): Conversation | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    // Auto-generate title from first user message
    if (!conversation.title && message.role === 'user') {
      conversation.title = this.generateTitle(message.content);
    }

    // Limit message history
    if (conversation.messages.length > this.maxMessagesPerConversation) {
      conversation.messages = conversation.messages.slice(-this.maxMessagesPerConversation);
    }

    return conversation;
  }

  /**
   * Get messages
   */
  getMessages(conversationId: string): ChatMessage[] {
    const conversation = this.conversations.get(conversationId);
    return conversation?.messages || [];
  }

  /**
   * Get recent messages
   */
  getRecentMessages(conversationId: string, count: number): ChatMessage[] {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return [];

    return conversation.messages.slice(-count);
  }

  /**
   * Clear messages
   */
  clearMessages(conversationId: string): boolean {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return false;

    conversation.messages = [];
    conversation.updatedAt = new Date();
    return true;
  }

  /**
   * Update conversation
   */
  update(
    conversationId: string,
    updates: Partial<Conversation>
  ): Conversation | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    Object.assign(conversation, {
      ...updates,
      id: conversation.id,
      createdAt: conversation.createdAt,
      updatedAt: new Date(),
    });

    return conversation;
  }

  /**
   * Delete conversation
   */
  delete(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }

  /**
   * Search conversations
   */
  search(query: string, userId?: string): Conversation[] {
    const lowerQuery = query.toLowerCase();
    let conversations = Array.from(this.conversations.values());

    if (userId) {
      conversations = conversations.filter(c => c.userId === userId);
    }

    return conversations.filter(
      c =>
        c.title?.toLowerCase().includes(lowerQuery) ||
        c.messages.some(m => m.content.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Generate title from content
   */
  private generateTitle(content: string): string {
    const maxLength = 50;
    let title = content.trim();

    if (title.length > maxLength) {
      title = title.substring(0, maxLength) + '...';
    }

    // Remove newlines and extra spaces
    title = title.replace(/\s+/g, ' ');

    return title;
  }

  /**
   * Prune old conversations
   */
  private pruneOldConversations(): void {
    if (this.conversations.size <= this.maxConversations) return;

    const sorted = Array.from(this.conversations.values())
      .sort((a, b) => 
        (a.updatedAt?.getTime() || a.createdAt.getTime()) - 
        (b.updatedAt?.getTime() || b.createdAt.getTime())
      );

    const toRemove = sorted.slice(0, this.conversations.size - this.maxConversations);
    toRemove.forEach(c => this.conversations.delete(c.id));
  }

  /**
   * Get conversation summary
   */
  getSummary(conversationId: string): {
    messageCount: number;
    userMessages: number;
    assistantMessages: number;
    lastMessageAt: Date | null;
  } | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    const userMessages = conversation.messages.filter(m => m.role === 'user').length;
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant').length;
    const lastMessage = conversation.messages[conversation.messages.length - 1];

    return {
      messageCount: conversation.messages.length,
      userMessages,
      assistantMessages,
      lastMessageAt: conversation.updatedAt || conversation.createdAt,
    };
  }

  /**
   * Export conversation
   */
  export(conversationId: string): string | null {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) return null;

    return JSON.stringify(conversation, null, 2);
  }

  /**
   * Import conversation
   */
  import(conversationJson: string): Conversation | null {
    try {
      const conversation = JSON.parse(conversationJson);
      this.conversations.set(conversation.id, conversation);
      return conversation;
    } catch (error) {
      console.error('Failed to import conversation:', error);
      return null;
    }
  }

  /**
   * Clear all conversations
   */
  clear(): void {
    this.conversations.clear();
  }
}

// Global conversation manager instance
export const conversationManager = new ConversationManager();
