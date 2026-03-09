---
name: graphviewer-ai-assistant
description: Develop, debug, and extend the AI assistant feature for diagram generation, code explanation, and optimization.
---

# When to use

Use this skill when:

- Modifying AI assistant panel behavior or UI
- Adding new AI action types (generate, explain, optimize, fix)
- Debugging AI prompt construction or response parsing
- Integrating new AI providers or adjusting API calls
- Fixing issues with AI-generated diagram code insertion

# Key files

## State & logic

- `hooks/useAIAssistant.ts`
  - AI conversation state management
  - Message history, streaming state, error handling
  - Provider configuration and model selection
- `hooks/useAIActions.ts`
  - Action handlers: generate, explain, optimize, fix
  - Prompt template construction
  - Response parsing and diagram code extraction

## UI

- `components/AIAssistantPanel.tsx`
  - Chat interface, message rendering
  - Action buttons (generate, explain, optimize)
  - Input area with engine-aware context
  - Streaming response display

## Dependencies

- `hooks/useDiagramState.ts` — provides current engine, format, code for context
- `hooks/useDiagramRender.ts` — renders AI-generated diagrams
- `hooks/useToast.ts` — user feedback on AI actions
- `lib/diagramConfig.ts` — engine names and types for prompt construction
- `lib/diagramSamples.ts` — sample code referenced in prompts

# Architecture

```
AIAssistantPanel (UI)
  ├── useAIAssistant (state: messages, streaming, provider)
  ├── useAIActions (handlers: generate, explain, optimize, fix)
  ├── useDiagramState (context: engine, format, current code)
  └── useToast (feedback)
```

# Implementation guidelines

## Prompt construction

- Always include the current engine type in prompts so the AI generates valid syntax
- Include a brief sample of the target engine's syntax from `diagramSamples.ts`
- Keep prompts in Chinese to match the UI language
- Separate system prompt (engine context) from user prompt (request)

## Response handling

- AI responses may contain code blocks — extract diagram code from markdown fences
- Validate extracted code is non-empty before inserting into the editor
- Handle streaming responses gracefully — show partial content during streaming
- On error, display a Chinese error message via `useToast`

## State management

- Message history is managed in `useAIAssistant` — don't duplicate in component state
- Streaming state controls UI loading indicators — ensure it's reset on error
- Provider/model selection persists across sessions if configured

# Common issues

## AI generates invalid diagram code

- Check if the prompt includes the correct engine type
- Verify the code extraction regex handles the response format
- Test with the specific engine's syntax requirements

## Streaming breaks mid-response

- Check network/provider error handling in `useAIActions`
- Ensure streaming state is reset in `finally` blocks
- Verify the response parser handles incomplete markdown fences

## Code insertion doesn't trigger re-render

- AI-generated code must update via `useDiagramState.setCode()`
- After code update, `useLivePreview` should auto-trigger rendering
- Check if `hasHydrated` guard is blocking the update

# Validation

- AI panel opens and closes correctly
- Generate action produces valid diagram code for the current engine
- Generated code renders in the preview panel
- Explain action provides meaningful description
- Optimize action improves diagram structure
- Error states show Chinese messages
- Run: `npm run lint` and `npm run build`
