/**
 * Form Builder
 * Phase 19: Form Builder & Validation System
 * 
 * Programmatic form schema construction
 */

import { FormSchema, FormField, FormStep, ValidationRule, FieldType } from './types';

export class FormBuilder {
  private schema: FormSchema;

  constructor(id: string, title: string) {
    this.schema = {
      id,
      title,
      fields: [],
      multiStep: false,
    };
  }

  setDescription(description: string): this {
    this.schema.description = description;
    return this;
  }

  enableMultiStep(): this {
    this.schema.multiStep = true;
    this.schema.steps = this.schema.steps || [];
    delete this.schema.fields;
    return this;
  }

  addField(field: Omit<FormField, 'id'>): this {
    const fieldWithId: FormField = {
      ...field,
      id: field.name,
    };

    if (this.schema.multiStep && this.schema.steps) {
      const lastStep = this.schema.steps[this.schema.steps.length - 1];
      if (lastStep) {
        lastStep.fields.push(fieldWithId);
      }
    } else {
      this.schema.fields = this.schema.fields || [];
      this.schema.fields.push(fieldWithId);
    }

    return this;
  }

  addStep(step: FormStep): this {
    if (!this.schema.multiStep) {
      this.enableMultiStep();
    }
    this.schema.steps!.push(step);
    return this;
  }

  createStep(id: string, title: string, description?: string): this {
    const step: FormStep = {
      id,
      title,
      description,
      fields: [],
    };
    return this.addStep(step);
  }

  addTextField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'text',
      ...options,
    });
  }

  addEmailField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'email',
      validation: [{ type: 'email' }],
      ...options,
    });
  }

  addNumberField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'number',
      ...options,
    });
  }

  addSelectField(
    name: string,
    label: string,
    options: Array<{ value: string | number; label: string }>,
    fieldOptions?: Partial<FormField>
  ): this {
    return this.addField({
      name,
      label,
      type: 'select',
      options,
      ...fieldOptions,
    });
  }

  addTextareaField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'textarea',
      ...options,
    });
  }

  addCheckboxField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'checkbox',
      defaultValue: false,
      ...options,
    });
  }

  addDateField(name: string, label: string, options?: Partial<FormField>): this {
    return this.addField({
      name,
      label,
      type: 'date',
      ...options,
    });
  }

  setSettings(settings: Partial<FormSchema['settings']>): this {
    this.schema.settings = {
      ...this.schema.settings,
      ...settings,
    };
    return this;
  }

  build(): FormSchema {
    return this.schema;
  }

  static create(id: string, title: string): FormBuilder {
    return new FormBuilder(id, title);
  }
}
