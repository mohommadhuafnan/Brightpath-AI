# Environment Variables Guide

Complete guide to all environment variables used in BrightPath AI Job Readiness Platform.

## Required Variables

### NEXT_PUBLIC_SUPABASE_URL
**Type**: String (Public)
**Required**: Yes
**Description**: Your Supabase project URL for database and authentication

**How to get:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy "Project URL"
5. Format: `https://[project-id].supabase.co`

**Example**: `https://xyz123abc.supabase.co`

### NEXT_PUBLIC_SUPABASE_ANON_KEY
**Type**: String (Public)
**Required**: Yes
**Description**: Anonymous public key for browser-side Supabase access

**How to get:**
1. In Supabase Dashboard
2. Go to Settings → API
3. Copy the "anon public" key
4. This is safe to expose publicly

**Example**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### GOOGLE_GENERATIVE_AI_API_KEY
**Type**: String (Secret - Not Public)
**Required**: Yes (for AI features)
**Description**: API key for Google Gemini AI model access

**How to get:**
1. Visit https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key
5. Keep this secret - never commit to repository

**Example**: `AIzaSyD...` (starts with AIzaSy)

**Security Note**: This should be stored in:
- `.env.local` for development (never commit)
- Vercel environment variables for production
- GitHub Secrets for CI/CD

## Optional Variables

### NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL
**Type**: String
**Required**: No (dev only)
**Default**: `${window.location.origin}/auth/callback`
**Description**: Custom OAuth redirect URL for local development

**When to use:**
- When developing locally and need custom redirect URL
- If running on different port than 3000
- For testing OAuth flows in development

**Examples**:
- Local: `http://localhost:3000/auth/callback`
- Ngrok: `https://your-ngrok-url.ngrok.io/auth/callback`

## Derived Variables (Auto-configured)

These are automatically set by next.config.mjs and don't need manual configuration:

### NEXT_PUBLIC_SUPABASE_URL (from SUPABASE_URL)
If `NEXT_PUBLIC_SUPABASE_URL` is not set, it uses `SUPABASE_URL`

### NEXT_PUBLIC_SUPABASE_ANON_KEY (from SUPABASE_ANON_KEY)
If `NEXT_PUBLIC_SUPABASE_ANON_KEY` is not set, it uses `SUPABASE_ANON_KEY`

## Local Development Setup

### Create .env.local file

1. Copy the template:
```bash
cp .env.example .env.local
```

2. Fill in your values:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key-here

# Optional - for OAuth testing
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

3. Never commit `.env.local` to git
   - It's already in `.gitignore`
   - Only `.env.example` should be in repository

## Production Setup (Vercel)

### Adding Variables to Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. For each variable, add:
   - **Name**: Variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select Production, Preview, Development (all three)
5. Click "Save"

### Variables for Vercel
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY = your-gemini-key
```

**Important**: Set all three environments (Production, Preview, Development) for each variable.

## GitHub Actions / CI-CD

If using GitHub Actions or CI/CD pipeline:

1. Go to Repository Settings → Secrets
2. Add same variables as GitHub Secrets
3. Use in workflow: `${{ secrets.VARIABLE_NAME }}`

Example workflow:
```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  GOOGLE_GENERATIVE_AI_API_KEY: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
```

## Environment-Specific Configuration

### Development (localhost:3000)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

### Preview (Vercel Preview Deployments)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
```

### Production (Live Vercel Deployment)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key
```

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_SUPABASE_URL=...`
2. In Vercel, add `NEXT_PUBLIC_SUPABASE_URL` variable
3. Restart dev server: `npm run dev`
4. Redeploy: `vercel --prod`

### "Invalid Supabase credentials"
**Solution:**
1. Verify URL matches your Supabase project exactly
2. Ensure using "anon public" key, not "service_role"
3. Check there are no extra spaces in the values
4. Verify project exists at that URL

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
**Solution:**
1. Get key from https://aistudio.google.com/apikey
2. Add to `.env.local` for development
3. Add to Vercel environment variables for production
4. Verify key starts with "AIzaSy"
5. Redeploy after adding

### "OAuth callback URL mismatch"
**Solution:**
1. Verify `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` matches your dev URL
2. If error on production, check GitHub/Google OAuth app redirect URLs
3. Ensure exact match including protocol (http/https) and port

## Security Best Practices

### DO:
- Store secrets in `.env.local` (not committed)
- Use Vercel environment variables for production
- Use `NEXT_PUBLIC_` prefix only for public variables
- Rotate secrets regularly
- Never commit `.env.local` to git
- Use different keys for dev and production

### DON'T:
- Don't commit `.env.local` to repository
- Don't share API keys in messages or documentation
- Don't use same keys across multiple environments
- Don't commit secrets to GitHub
- Don't expose secret variables in browser console
- Don't use placeholder values in production

## Verification

### Check Variables Are Loaded

1. In development, check terminal for build errors
2. Visit http://localhost:3000 and open DevTools Console
3. Look for errors about missing environment variables
4. In production, check Vercel logs

### Verify Supabase Connection
```javascript
// In browser console
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
console.log("Supabase URL:", url)
```

### Test API Key
- Try uploading CV to test Gemini API
- Check browser Network tab for API responses
- Look for 401/403 errors if key is invalid

## Migration Between Projects

When moving variables between projects:

1. **Dev to Production:**
   - Copy values from `.env.local`
   - Add to Vercel project environment variables
   - Redeploy

2. **Production to New Supabase Project:**
   - Create new Supabase project
   - Get new URL and key
   - Update in Vercel environment variables
   - Redeploy

3. **Across Repositories:**
   - Create new `.env.example` in new repo
   - Add values to new project's `.env.local`
   - Add to new project's Vercel settings

---

**Last Updated**: 2026-05-05
**Version**: 1.0.0
