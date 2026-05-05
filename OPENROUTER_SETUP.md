# OpenRouter Setup Guide

## What is OpenRouter?

OpenRouter is an API gateway that provides unified access to multiple AI models including Google Gemini, Claude, GPT-4, and others. It's a perfect solution for projects that need access to powerful models without the complexity of managing individual API keys.

## Setup Instructions

### Step 1: Get Your OpenRouter API Key

1. Visit: https://openrouter.ai
2. Sign up with your email or Google account
3. Go to: https://openrouter.ai/keys
4. Click **"Create Key"**
5. Copy your key (format: `sk-or-v1-...`)

### Step 2: Add to Your Environment

**For Local Development:**
```bash
# .env.local
GOOGLE_GENERATIVE_AI_API_KEY=sk-or-v1-your-key-here
```

**For Vercel (Production):**
1. Go to: https://vercel.com/dashboard
2. Select your project: `v0-ai-job-readiness-platform`
3. Click **Settings** → **Environment Variables**
4. Add new variable:
   - **Key:** `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value:** `sk-or-v1-your-key-here`
   - **Environments:** Check ✓ Production, Preview, Development
5. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

## Using OpenRouter in Your Code

### Simple Text Generation

```typescript
import { generateWithOpenRouter } from "@/lib/ai/gemini"

const response = await generateWithOpenRouter("Tell me about React")
console.log(response) // AI response text
```

### JSON Generation (Structured Responses)

```typescript
import { generateJSONWithOpenRouter } from "@/lib/ai/gemini"

const schema = JSON.stringify({
  title: "string",
  description: "string",
  features: ["string"]
})

const response = await generateJSONWithOpenRouter(
  "Generate a project spec for a todo app",
  schema
)
const data = JSON.parse(response)
console.log(data.title, data.features)
```

### With System Prompt

```typescript
import { generateWithOpenRouter } from "@/lib/ai/gemini"

const response = await generateWithOpenRouter(
  "What is 2+2?",
  "You are a math tutor. Keep answers concise and educational."
)
```

## Available Models on OpenRouter

Your API key gives you access to:
- **google/gemini-1.5-flash** (Fast, cost-effective) ← Currently used
- **google/gemini-1.5-pro** (More powerful)
- **google/gemini-pro** (General purpose)
- **claude-opus, gpt-4, llama-2**, and many more

## Cost Tracking

Monitor your usage:
1. Go to: https://openrouter.ai/usage
2. See real-time usage and costs
3. Set budget limits in settings

## API Response Format

OpenRouter returns responses in OpenAI-compatible format:

```typescript
{
  choices: [{
    message: {
      content: "Your response here"
    }
  }]
}
```

## Error Handling

Common errors and solutions:

| Error | Solution |
|-------|----------|
| 401 Unauthorized | Check API key is correct and has no trailing spaces |
| 429 Rate Limited | Reduce request frequency or upgrade plan |
| 503 Service Error | OpenRouter is temporarily down, try again later |
| Invalid JSON response | Check your schema format and prompt clarity |

## Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
- Verify the environment variable is set in Vercel
- Redeploy after adding the variable
- Check the key format starts with `sk-or-v1-`

### API responses are slow
- OpenRouter may be busy, this is temporary
- Consider using `gemini-1.5-flash` (default) instead of pro models
- Check your network connection

### JSON parsing errors
- Ensure schema is valid JSON format
- Check that your prompt clearly requests JSON output
- Add error handling: `try { JSON.parse(response) } catch (e) { ... }`

## Migration Notes

Your code has been updated to use OpenRouter:
- `generateWithOpenRouter()` - Text generation
- `generateJSONWithOpenRouter()` - Structured JSON responses
- All existing API routes automatically use OpenRouter

No changes needed to your existing API routes - they'll work seamlessly!

## Next Steps

1. Add your OpenRouter API key to Vercel ✓
2. Redeploy your application ✓
3. Test the following features:
   - CV Analysis
   - Interview Questions
   - Learning Path Generation
   - Job Matching
   - Career Exploration
   - Project Generation

All features now use OpenRouter + Google Gemini!
