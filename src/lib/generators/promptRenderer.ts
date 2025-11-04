/**
 * Prompt Template Renderer
 * Renders prompt templates with user answers
 */

/**
 * Render a prompt template by replacing {{variable}} placeholders
 * with actual user answer values
 */
export function renderPromptTemplate(
  template: string,
  answers: Record<string, any>
): string {
  let rendered = template;
  
  // Replace {{variable}} with actual values
  Object.entries(answers).forEach(([key, value]) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    
    // Format the display value
    let displayValue: string;
    
    if (Array.isArray(value)) {
      // Join array values with commas
      displayValue = value.join(', ');
    } else if (typeof value === 'boolean') {
      displayValue = value ? 'Yes' : 'No';
    } else if (value === null || value === undefined) {
      displayValue = 'Not specified';
    } else {
      displayValue = String(value);
    }
    
    rendered = rendered.replace(placeholder, displayValue);
  });
  
  // Clean up any remaining unreplaced placeholders
  rendered = rendered.replace(/\{\{[^}]+\}\}/g, 'Not specified');
  
  return rendered;
}

/**
 * Check if a template has all required variables filled
 */
export function hasAllRequiredVariables(
  template: string,
  answers: Record<string, any>
): boolean {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = template.matchAll(variableRegex);
  
  for (const match of matches) {
    const variable = match[1];
    if (!answers[variable]) {
      return false;
    }
  }
  
  return true;
}

/**
 * Extract all variable names from a template
 */
export function extractTemplateVariables(template: string): string[] {
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = template.matchAll(variableRegex);
  
  return Array.from(matches, match => match[1]);
}
