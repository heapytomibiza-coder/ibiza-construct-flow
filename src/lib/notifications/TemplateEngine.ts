/**
 * Template Engine
 * Phase 25: Advanced Notification & Communication System
 * 
 * Process notification templates with variables
 */

import { NotificationTemplate } from './types';

export class TemplateEngine {
  private templates: Map<string, NotificationTemplate> = new Map();

  /**
   * Register a template
   */
  register(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Render a template with variables
   */
  render(
    templateId: string,
    variables: Record<string, any>
  ): { title: string; body: string; subject?: string } {
    const template = this.templates.get(templateId);
    
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    if (!template.enabled) {
      throw new Error(`Template disabled: ${templateId}`);
    }

    // Replace variables in strings
    const title = this.replaceVariables(template.title, variables);
    const body = this.replaceVariables(template.body, variables);
    const subject = template.subject 
      ? this.replaceVariables(template.subject, variables)
      : undefined;

    return { title, body, subject };
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): NotificationTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: string): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    );
  }

  /**
   * Validate template variables
   */
  validateVariables(
    templateId: string,
    variables: Record<string, any>
  ): { valid: boolean; missing: string[] } {
    const template = this.templates.get(templateId);
    
    if (!template) {
      return { valid: false, missing: [] };
    }

    const missing = template.variables.filter(
      variable => !(variable in variables)
    );

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Replace variables in a string
   */
  private replaceVariables(
    text: string,
    variables: Record<string, any>
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      return variables[variable]?.toString() || match;
    });
  }

  /**
   * Remove a template
   */
  remove(templateId: string): void {
    this.templates.delete(templateId);
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }
}

// Global template engine instance
export const templateEngine = new TemplateEngine();

// Register default templates
templateEngine.register({
  id: 'welcome',
  name: 'Welcome Message',
  category: 'system',
  channels: ['in_app', 'email'],
  priority: 'medium',
  subject: 'Welcome to {{appName}}!',
  title: 'Welcome {{userName}}!',
  body: 'Thank you for joining {{appName}}. We\'re excited to have you here!',
  variables: ['userName', 'appName'],
  actionUrl: '/dashboard',
  actionLabel: 'Get Started',
  enabled: true,
});

templateEngine.register({
  id: 'new_job',
  name: 'New Job Created',
  category: 'job',
  channels: ['in_app', 'email'],
  priority: 'high',
  subject: 'New job: {{jobTitle}}',
  title: 'New Job Posted',
  body: '{{customerName}} has posted a new job: {{jobTitle}}',
  variables: ['customerName', 'jobTitle', 'jobId'],
  actionUrl: '/jobs/{{jobId}}',
  actionLabel: 'View Job',
  enabled: true,
});

templateEngine.register({
  id: 'quote_received',
  name: 'Quote Received',
  category: 'quote',
  channels: ['in_app', 'email', 'push'],
  priority: 'high',
  subject: 'You received a quote for {{jobTitle}}',
  title: 'New Quote Received',
  body: '{{professionalName}} sent you a quote for {{jobTitle}}: {{quoteAmount}}',
  variables: ['professionalName', 'jobTitle', 'quoteAmount', 'quoteId'],
  actionUrl: '/quotes/{{quoteId}}',
  actionLabel: 'View Quote',
  enabled: true,
});

templateEngine.register({
  id: 'payment_success',
  name: 'Payment Successful',
  category: 'payment',
  channels: ['in_app', 'email'],
  priority: 'high',
  subject: 'Payment received: {{amount}}',
  title: 'Payment Successful',
  body: 'Your payment of {{amount}} has been processed successfully.',
  variables: ['amount', 'transactionId'],
  actionUrl: '/payments/{{transactionId}}',
  actionLabel: 'View Receipt',
  enabled: true,
});

templateEngine.register({
  id: 'reminder',
  name: 'Generic Reminder',
  category: 'reminder',
  channels: ['in_app', 'push'],
  priority: 'medium',
  title: 'Reminder: {{title}}',
  body: '{{message}}',
  variables: ['title', 'message'],
  enabled: true,
});
