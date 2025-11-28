/**
 * Rule-based question standardization for professional tone
 * No AI required - uses pattern matching and templates
 */

interface QuestionInput {
  key: string;
  aiHint?: string;
  options?: Array<{ i18nKey: string; value: string }>;
}

interface StandardizedQuestion {
  key: string;
  question: string;
  options: string[];
}

// Common patterns to make professional
const patterns = {
  // Question patterns
  questions: [
    { match: /^what('s| is) (the |your )?(.+)\??$/i, template: 'What is the $3?' },
    { match: /^when do you need (.+)\??$/i, template: 'When do you need the $1?' },
    { match: /^how (big|large|many|much) (.+)\??$/i, template: 'How $1 is the $2?' },
    { match: /^(do you|are you) (.+)\??$/i, template: 'Do you $2?' },
    { match: /^which (.+)\??$/i, template: 'Which $1 do you require?' },
    { match: /^where (.+)\??$/i, template: 'Where is the $1 located?' },
  ],
  
  // Word replacements for casual/short terms
  wordReplacements: {
    'asap': 'as soon as possible',
    'u': 'you',
    'ur': 'your',
    'thru': 'through',
    'approx': 'approximately',
    'max': 'maximum',
    'min': 'minimum',
    'info': 'information',
    'spec': 'specification',
    'specs': 'specifications',
  },
  
  // Size/measurement clarifications
  sizeUnits: {
    small: 'Small (under 10m²)',
    medium: 'Medium (10-25m²)',
    large: 'Large (over 25m²)',
    'extra large': 'Extra large (over 50m²)',
  },
};

/**
 * Capitalize first letter of each sentence
 */
function capitalizeProper(text: string): string {
  return text
    .split('. ')
    .map(sentence => sentence.charAt(0).toUpperCase() + sentence.slice(1))
    .join('. ');
}

/**
 * Replace casual words with professional alternatives
 */
function professionalizeWords(text: string): string {
  let result = text;
  
  Object.entries(patterns.wordReplacements).forEach(([casual, professional]) => {
    const regex = new RegExp(`\\b${casual}\\b`, 'gi');
    result = result.replace(regex, professional);
  });
  
  return result;
}

/**
 * Standardize a question using pattern matching
 */
function standardizeQuestionText(rawQuestion: string): string {
  let question = rawQuestion.trim();
  
  // Replace casual words
  question = professionalizeWords(question);
  
  // Apply question patterns
  for (const pattern of patterns.questions) {
    if (pattern.match.test(question)) {
      question = question.replace(pattern.match, pattern.template);
      break;
    }
  }
  
  // Ensure proper capitalization
  question = capitalizeProper(question);
  
  // Ensure it ends with a question mark
  if (!question.endsWith('?')) {
    question += '?';
  }
  
  return question;
}

/**
 * Humanize and professionalize an option value
 */
function standardizeOption(option: { i18nKey: string; value: string }): string {
  // If i18nKey exists and looks readable (no dots, starts with capital), use it
  if (option.i18nKey && !option.i18nKey.includes('.') && /^[A-Z]/.test(option.i18nKey)) {
    return professionalizeWords(option.i18nKey);
  }
  
  // Otherwise work with the value (or return default if value is also missing)
  if (!option.value) {
    return 'Option';
  }
  
  let text = option.value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
  
  text = professionalizeWords(text);
  
  // Add size clarifications if applicable
  const lowerText = text.toLowerCase();
  if (patterns.sizeUnits[lowerText]) {
    text = patterns.sizeUnits[lowerText];
  }
  
  return capitalizeProper(text);
}

/**
 * Generate a professional question from a key when no aiHint exists
 */
function generateQuestionFromKey(key: string | undefined): string {
  // Handle undefined or empty keys
  if (!key || key.trim() === '') {
    return 'Please provide details?';
  }
  
  // Handle q1, q2 patterns
  if (/^q\d+$/i.test(key)) {
    const num = key.slice(1);
    return `Question ${num}?`;
  }
  
  // Convert snake_case/kebab-case to readable question
  const words = key
    .replace(/[-_]/g, ' ')
    .toLowerCase()
    .trim();
  
  // Common question starters
  if (words.includes('type') || words.includes('kind')) {
    return `What type of ${words.replace(/type|kind/, '').trim()} do you need?`;
  }
  if (words.includes('size') || words.includes('dimension')) {
    return `What is the ${words}?`;
  }
  if (words.includes('when') || words.includes('date') || words.includes('time')) {
    return `When do you need this service?`;
  }
  if (words.includes('where') || words.includes('location')) {
    return `Where is the ${words.replace(/where|location/, '').trim()} located?`;
  }
  
  // Default: "What is the [key]?"
  return `What is the ${words}?`;
}

/**
 * Main standardization function
 */
export function standardizeQuestion(input: QuestionInput): StandardizedQuestion {
  // Get the base question text
  const rawQuestion = input.aiHint || generateQuestionFromKey(input.key);
  
  // Standardize the question
  const question = standardizeQuestionText(rawQuestion);
  
  // Standardize options
  const options = input.options?.map(opt => standardizeOption(opt)) || [];
  
  return {
    key: input.key,
    question,
    options,
  };
}

/**
 * Batch standardize multiple questions
 */
export function standardizeQuestions(inputs: QuestionInput[]): StandardizedQuestion[] {
  return inputs.map(input => standardizeQuestion(input));
}
