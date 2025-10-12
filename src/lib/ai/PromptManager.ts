/**
 * Prompt Manager
 * Phase 30: Advanced AI & ML Integration System
 * 
 * Manages prompt templates and variable substitution
 */

import { PromptTemplate, TemplateVariable } from './types';
import { v4 as uuidv4 } from 'uuid';

export class PromptManager {
  private templates: Map<string, PromptTemplate> = new Map();

  /**
   * Create template
   */
  create(
    template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: uuidv4(),
      createdAt: new Date(),
    };

    this.templates.set(newTemplate.id, newTemplate);
    return newTemplate;
  }

  /**
   * Get template
   */
  get(templateId: string): PromptTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Get all templates
   */
  getAll(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by category
   */
  getByCategory(category: string): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => t.category === category
    );
  }

  /**
   * Get templates by tag
   */
  getByTag(tag: string): PromptTemplate[] {
    return Array.from(this.templates.values()).filter(
      t => t.tags.includes(tag)
    );
  }

  /**
   * Update template
   */
  update(templateId: string, updates: Partial<PromptTemplate>): PromptTemplate | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updated = {
      ...template,
      ...updates,
      id: template.id,
      createdAt: template.createdAt,
      updatedAt: new Date(),
    };

    this.templates.set(templateId, updated);
    return updated;
  }

  /**
   * Delete template
   */
  delete(templateId: string): boolean {
    return this.templates.delete(templateId);
  }

  /**
   * Render template with variables
   */
  render(
    templateId: string,
    variables: Record<string, any>
  ): string {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return this.renderTemplate(template.template, variables, template.variables);
  }

  /**
   * Render template string with variables
   */
  renderTemplate(
    templateString: string,
    variables: Record<string, any>,
    templateVars?: TemplateVariable[]
  ): string {
    // Validate required variables
    if (templateVars) {
      for (const variable of templateVars) {
        if (variable.required && !(variable.name in variables)) {
          if (variable.default !== undefined) {
            variables[variable.name] = variable.default;
          } else {
            throw new Error(`Required variable missing: ${variable.name}`);
          }
        }
      }
    }

    // Replace variables
    let rendered = templateString;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    }

    // Check for unreplaced variables
    const unreplaced = rendered.match(/{{[^}]+}}/g);
    if (unreplaced && unreplaced.length > 0) {
      console.warn('Unreplaced variables:', unreplaced);
    }

    return rendered;
  }

  /**
   * Extract variables from template string
   */
  extractVariables(templateString: string): string[] {
    const matches = templateString.match(/{{([^}]+)}}/g) || [];
    return matches.map(match => match.replace(/[{}]/g, '').trim());
  }

  /**
   * Validate template
   */
  validate(templateString: string, variables: TemplateVariable[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Extract variables from template
    const extractedVars = this.extractVariables(templateString);
    const declaredVars = variables.map(v => v.name);

    // Check for undeclared variables
    for (const varName of extractedVars) {
      if (!declaredVars.includes(varName)) {
        errors.push(`Undeclared variable: ${varName}`);
      }
    }

    // Check for unused variables
    for (const variable of variables) {
      if (variable.required && !extractedVars.includes(variable.name)) {
        errors.push(`Required variable not used: ${variable.name}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Search templates
   */
  search(query: string): PromptTemplate[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.templates.values()).filter(
      t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.template.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Clone template
   */
  clone(templateId: string, name?: string): PromptTemplate | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return this.create({
      ...template,
      name: name || `${template.name} (Copy)`,
    });
  }

  /**
   * Export template
   */
  export(templateId: string): string | null {
    const template = this.templates.get(templateId);
    if (!template) return null;

    return JSON.stringify(template, null, 2);
  }

  /**
   * Import template
   */
  import(templateJson: string): PromptTemplate | null {
    try {
      const template = JSON.parse(templateJson);
      return this.create(template);
    } catch (error) {
      console.error('Failed to import template:', error);
      return null;
    }
  }

  /**
   * Clear all templates
   */
  clear(): void {
    this.templates.clear();
  }
}

// Global prompt manager instance
export const promptManager = new PromptManager();
