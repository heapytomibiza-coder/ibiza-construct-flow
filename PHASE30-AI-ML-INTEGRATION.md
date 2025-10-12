# Phase 30: Advanced AI & ML Integration System

Comprehensive AI and machine learning integration infrastructure for building intelligent features using Lovable AI Gateway with support for chat, completions, streaming, and prompt management.

## Features Implemented

### 1. AI Client
- **Model Interactions**
  - Chat completions
  - Streaming responses
  - Simple completions
  - Embeddings generation
  - Function calling support

- **Advanced Features**
  - Multiple model support (Gemini, GPT-5)
  - Temperature and token control
  - Streaming with proper SSE parsing
  - Error handling and retry logic
  - Token usage tracking

### 2. Prompt Management
- **Template System**
  - Create and manage prompt templates
  - Variable substitution
  - Template validation
  - Category and tag organization
  - Import/export functionality

- **Template Features**
  - Required and optional variables
  - Default values
  - Type validation
  - Variable extraction
  - Search and filtering

### 3. Conversation Management
- **Conversation Handling**
  - Create and manage conversations
  - Message history tracking
  - Auto-title generation
  - User-specific conversations
  - Message pagination

- **Features**
  - Conversation summaries
  - Search conversations
  - Export/import conversations
  - Automatic pruning
  - Metadata support

### 4. React Integration
- **AI Hooks**
  - `useAI` - Core AI interactions
  - `useConversation` - Conversation management
  - `usePrompt` - Prompt template management

- **Features**
  - Loading states
  - Error handling
  - Streaming support
  - User context integration

### 5. Lovable AI Integration
- **Gateway Support**
  - Gemini 2.5 models (Pro, Flash, Flash-Lite)
  - GPT-5 models (Standard, Mini, Nano)
  - Image generation (Nano Banana)
  - Automatic API key handling
  - Rate limit management

## File Structure

```
src/
├── lib/
│   └── ai/
│       ├── types.ts                # TypeScript types
│       ├── AIClient.ts             # AI API client
│       ├── PromptManager.ts        # Prompt templates
│       ├── ConversationManager.ts  # Conversation handling
│       └── index.ts                # Module exports
└── hooks/
    └── ai/
        ├── useAI.ts                # Core AI hook
        ├── useConversation.ts      # Conversation hook
        ├── usePrompt.ts            # Prompt hook
        └── index.ts                # Hook exports
```

## Core Types

### ChatMessage
```typescript
interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
  functionCall?: FunctionCall;
}
```

### PromptTemplate
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: TemplateVariable[];
  category: string;
  tags: string[];
  config?: ModelConfig;
}
```

### Conversation
```typescript
interface Conversation {
  id: string;
  title?: string;
  modelId: string;
  messages: ChatMessage[];
  userId?: string;
  createdAt: Date;
}
```

## Usage Examples

### Basic AI Chat

```typescript
import { useAI } from '@/hooks/ai';

function ChatComponent() {
  const { chat, loading, error } = useAI();

  const handleChat = async () => {
    const response = await chat({
      messages: [
        {
          role: 'user',
          content: 'Explain quantum computing in simple terms',
        },
      ],
      temperature: 0.7,
      maxTokens: 500,
    });

    console.log(response.choices[0].message.content);
  };

  return (
    <div>
      <button onClick={handleChat} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask AI'}
      </button>
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### Streaming Chat

```typescript
import { useAI } from '@/hooks/ai';
import { useState } from 'react';

function StreamingChat() {
  const { chatStream } = useAI();
  const [response, setResponse] = useState('');

  const handleStream = async () => {
    setResponse('');
    
    for await (const chunk of chatStream({
      messages: [
        { role: 'user', content: 'Write a short story about a robot' },
      ],
    })) {
      setResponse(prev => prev + chunk);
    }
  };

  return (
    <div>
      <button onClick={handleStream}>Generate Story</button>
      <div>{response}</div>
    </div>
  );
}
```

### Conversation Management

```typescript
import { useConversation } from '@/hooks/ai';

function ConversationChat() {
  const {
    currentConversation,
    createConversation,
    sendMessage,
    sendMessageStream,
    loading,
  } = useConversation('google/gemini-2.5-flash');

  const [input, setInput] = useState('');
  const [streamingMessage, setStreamingMessage] = useState('');

  // Create conversation on mount
  useEffect(() => {
    if (!currentConversation) {
      createConversation('My Chat');
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Option 1: Regular send
    await sendMessage(input);

    // Option 2: Streaming send
    setStreamingMessage('');
    for await (const chunk of sendMessageStream(input)) {
      setStreamingMessage(prev => prev + chunk);
    }

    setInput('');
  };

  return (
    <div>
      <div>
        {currentConversation?.messages.map((msg, i) => (
          <div key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
        {streamingMessage && (
          <div>
            <strong>assistant:</strong> {streamingMessage}
          </div>
        )}
      </div>
      
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={loading}
      />
      <button onClick={handleSend} disabled={loading}>
        Send
      </button>
    </div>
  );
}
```

### Prompt Templates

```typescript
import { usePrompt } from '@/hooks/ai';
import { useAI } from '@/hooks/ai';

function PromptTemplates() {
  const { createTemplate, render } = usePrompt();
  const { complete } = useAI();

  // Create a template
  const setupTemplates = () => {
    createTemplate({
      name: 'Product Description',
      description: 'Generate product descriptions',
      template: `Write a compelling product description for:
Product Name: {{productName}}
Category: {{category}}
Key Features: {{features}}

Make it {{tone}} and limit to {{wordCount}} words.`,
      variables: [
        { name: 'productName', type: 'string', required: true },
        { name: 'category', type: 'string', required: true },
        { name: 'features', type: 'string', required: true },
        { name: 'tone', type: 'string', required: false, default: 'professional' },
        { name: 'wordCount', type: 'number', required: false, default: 100 },
      ],
      category: 'marketing',
      tags: ['ecommerce', 'copywriting'],
    });
  };

  // Use template
  const generateDescription = async () => {
    const prompt = render('template-id', {
      productName: 'Smart Watch Pro',
      category: 'Wearable Technology',
      features: 'Heart rate monitoring, GPS, waterproof',
      tone: 'exciting',
      wordCount: 150,
    });

    const description = await complete(prompt);
    console.log(description);
  };

  return (
    <div>
      <button onClick={setupTemplates}>Setup Templates</button>
      <button onClick={generateDescription}>Generate</button>
    </div>
  );
}
```

### Function Calling

```typescript
const response = await chat({
  messages: [
    { role: 'user', content: 'What\'s the weather in San Francisco?' },
  ],
  functions: [
    {
      name: 'get_weather',
      description: 'Get the current weather in a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City and state, e.g. San Francisco, CA',
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
          },
        },
        required: ['location'],
      },
    },
  ],
  functionCall: 'auto',
});

// Check if function was called
const message = response.choices[0].message;
if (message.functionCall) {
  const args = JSON.parse(message.functionCall.arguments);
  // Call your actual weather API
  const weather = await getWeather(args.location, args.unit);
  
  // Send function response back
  await chat({
    messages: [
      ...previousMessages,
      message,
      {
        role: 'function',
        name: 'get_weather',
        content: JSON.stringify(weather),
      },
    ],
  });
}
```

## Architecture

### Request Flow
```
Component → Hook → AI Client → Lovable AI Gateway → AI Model
                                      ↓
                                Rate Limiting
                                      ↓
                                Error Handling
```

### Streaming Flow
```
AI Model → SSE Stream → Line Parser → Token Extraction → React State
                            ↓
                      Buffer Management
                            ↓
                      Partial JSON Handling
```

### Conversation Flow
```
User Input → Add Message → Get Context → AI Request → Add Response
                ↓              ↓            ↓            ↓
            History      Recent Msgs    Gateway      Update UI
```

## Best Practices

1. **Model Selection**
   - Use `google/gemini-2.5-flash` for general tasks (default, free during promo)
   - Use `google/gemini-2.5-pro` for complex reasoning
   - Use `google/gemini-2.5-flash-lite` for simple/fast tasks
   - Use GPT-5 models only when specifically needed (not free)

2. **Prompt Engineering**
   - Use clear, specific instructions
   - Provide examples when needed
   - Set appropriate temperature (0.7 for creative, 0.3 for factual)
   - Use system messages for context

3. **Streaming**
   - Always parse SSE line-by-line
   - Handle partial JSON gracefully
   - Update UI progressively
   - Handle [DONE] signal

4. **Error Handling**
   - Catch rate limit errors (429)
   - Handle payment errors (402)
   - Show user-friendly messages
   - Implement retry logic

5. **Performance**
   - Limit conversation history
   - Use appropriate max tokens
   - Cache prompt templates
   - Debounce user input

## Integration Points

- **Workflow** - AI-powered automation
- **Analytics** - Track AI usage
- **Integration** - Connect AI to external services
- **Security** - Validate AI inputs/outputs
- **Notifications** - Alert on AI events

## Future Enhancements

1. **Advanced Features**
   - Fine-tuning support
   - Custom model training
   - Multi-modal inputs
   - Agent frameworks

2. **Optimization**
   - Response caching
   - Prompt optimization
   - Cost tracking
   - Performance analytics

3. **Collaboration**
   - Shared conversations
   - Team prompts
   - AI assistants
   - Workflow integration

4. **Safety**
   - Content moderation
   - Bias detection
   - Output validation
   - Usage limits

## Dependencies

- `uuid` - Unique ID generation
- React hooks - Component integration
- Lovable AI Gateway - AI model access
- TypeScript - Type safety

## Notes

- **API Keys**: LOVABLE_API_KEY is auto-provisioned in Lovable Cloud
- **Free Period**: All Gemini models free until Oct 13, 2025
- **Rate Limits**: Handle 429 and 402 errors gracefully
- **Streaming**: Always use SSE parsing, not full event buffering
