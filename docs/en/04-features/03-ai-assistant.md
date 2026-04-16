# AI Assistant

AI-powered features for diagram creation and analysis.

## Overview

The AI Assistant panel helps users:
- Analyze existing diagram code
- Generate new diagrams from descriptions
- Fix syntax errors
- Explain diagram structure

## Capabilities

### 1. Code Analysis

Analyzes current diagram and provides:
- Structure breakdown
- Suggestions for improvement
- Complexity assessment
- Best practices recommendations

Example:
```
Input: Mermaid flowchart

Analysis:
- 5 nodes, 4 edges
- Linear flow detected
- Suggestion: Add decision branches
- Suggestion: Use subgraphs for grouping
```

### 2. Code Generation

Generates diagrams from natural language:

```
Input: "Create a user authentication flow"

Output:
graph TD
    A[User visits login] --> B{Has account?}
    B -->|Yes| C[Enter credentials]
    B -->|No| D[Go to signup]
    C --> E{Valid?}
    E -->|Yes| F[Dashboard]
    E -->|No| G[Error message]
    G --> C
```

### 3. Error Fixing

Attempts to fix syntax errors:

```
Input:
graph TD
    A-->B
    B-->  (missing target)

Fixed:
graph TD
    A-->B
    B-->C[End]
```

### 4. Explanation

Explains what a diagram does:

```
Input: Complex PlantUML class diagram

Explanation:
- Shows 3 main classes: User, Order, Product
- User has one-to-many relationship with Order
- Order contains many Products
- Implements Repository pattern
```

## Architecture

### Hook: `useAIAssistant`

```typescript
interface UseAIAssistantOptions {
  apiKey?: string;      // AI service API key
  baseUrl?: string;     // Custom endpoint
  model?: string;       // Model selection
}

interface UseAIAssistantReturn {
  analyze: (code: string, engine: string) => Promise<Analysis>;
  generate: (description: string, engine: string) => Promise<string>;
  fix: (code: string, error: string) => Promise<string>;
  explain: (code: string, engine: string) => Promise<string>;
  loading: boolean;
  error: string | null;
}
```

### Component: `AIAssistantPanel`

Located in `components/AIAssistantPanel.tsx`:

- Collapsible sidebar panel
- Chat-style interface
- Action buttons for each capability
- Loading states
- Error handling

## Configuration

### Environment Variables

```env
# Optional: Default AI service configuration
AI_API_KEY=your-api-key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4
```

### Client-Side Settings

Users can configure in Settings panel:
- Enable/disable AI features
- API key input
- Custom endpoint URL
- Model selection (if supported)

## Security Considerations

### API Key Storage

- Never commit API keys to repository
- Store in environment variables
- Client-side keys should be restricted
- Consider proxying through server

### Server-Side Proxy (Recommended)

Instead of browser directly calling AI APIs:

```typescript
// app/api/ai/route.ts
export async function POST(request: Request) {
  const { action, code, engine } = await request.json();
  
  // Call AI service server-side
  const response = await fetch(process.env.AI_BASE_URL, {
    headers: {
      'Authorization': `Bearer ${process.env.AI_API_KEY}`
    },
    // ...
  });
  
  return NextResponse.json(result);
}
```

Benefits:
- API key remains server-side
- Rate limiting
- Request logging
- Response caching

## Usage

### Opening AI Assistant

1. Look for AI icon in sidebar tabs
2. Click to expand AI Assistant panel
3. Select desired action

### Analyzing Code

1. Write or paste diagram code
2. Click "Analyze" in AI panel
3. Review suggestions
4. Apply changes if desired

### Generating Diagrams

1. Click "Generate" in AI panel
2. Enter description (e.g., "E-commerce order flow")
3. Select target engine
4. Copy generated code to editor

### Fixing Errors

1. If diagram has error, click "Fix" in AI panel
2. AI attempts to correct syntax
3. Review fix before applying

## Limitations

### Current Constraints

- Requires API key (bring-your-own-key)
- Internet connectivity required
- Subject to AI service rate limits
- Generated code may need refinement

### Known Issues

- Complex diagrams may exceed token limits
- AI may not understand all engine syntaxes
- Explanations vary in quality
- Fix attempts may introduce new issues

## Future Enhancements

Planned improvements:
- Local AI model support (on-device)
- Better context awareness
- Multi-turn conversations
- Template library
- Batch operations
- Custom prompts

## Privacy

- Diagram code sent to AI service
- Review AI provider's privacy policy
- Self-hosted AI option for sensitive data
- Option to disable AI entirely
