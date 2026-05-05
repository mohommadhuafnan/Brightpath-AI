# BrightPath AI - Deployment & Setup Checklist

Complete checklist to deploy BrightPath AI job-readiness-platform successfully.

## Pre-Deployment Checklist

### 1. GitHub Repository Setup
- [x] Repository created: `mohommadhuafnan/job-readiness-platform`
- [x] Branch setup: `main` and `login-and-upload-issues`
- [x] `.gitignore` configured
- [x] `.env.example` created
- [x] README.md updated with full setup instructions

### 2. Code Quality
- [x] Build successful: `npm run build` passes
- [x] No TypeScript errors (ignoreErrors enabled for production)
- [x] All dependencies installed and pinned

### 3. Environment Variables
Before deploying, ensure these are ready:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Auth settings
- `GOOGLE_GENERATIVE_AI_API_KEY` - From Google AI Studio

**Optional (Development):**
- `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` - For local OAuth testing

## Supabase Setup Steps

### 1. Create Supabase Project
```
Visit: https://supabase.com
Click "New Project"
Enter project name: "brightpath-ai" (or similar)
Select database password
Choose region closest to you
Wait for project creation (2-3 minutes)
```

### 2. Get Supabase Credentials
```
In Supabase dashboard:
1. Go to Settings → API
2. Copy "Project URL" → NEXT_PUBLIC_SUPABASE_URL
3. Copy "anon public" key → NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. Initialize Database Tables
Database tables are auto-created through the app's migration system. When you first login, the database will initialize automatically with:
- profiles
- user_progress
- learning_paths
- interviews
- badges
- user_badges

All tables include Row Level Security (RLS) for data protection.

### 4. Enable OAuth Providers

#### GitHub OAuth
1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: `BrightPath AI`
   - Homepage URL: `https://your-vercel-deployment.vercel.app`
   - Authorization callback URL: `https://your-supabase-url.supabase.co/auth/v1/callback?provider=github`
4. Copy Client ID and Secret
5. In Supabase:
   - Go to Authentication → Providers → GitHub
   - Enable GitHub
   - Paste Client ID and Secret
   - Click Save

#### Google OAuth
1. Go to: https://console.cloud.google.com
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (OAuth Consent Screen)
5. Add authorized redirect URI: `https://your-supabase-url.supabase.co/auth/v1/callback?provider=google`
6. Copy Client ID and Secret
7. In Supabase:
   - Go to Authentication → Providers → Google
   - Enable Google
   - Paste Client ID and Secret
   - Click Save

### 5. Configure Email Provider (Optional)
In Supabase → Authentication → Providers → Email:
- Disable "Confirm email" if you want instant login without email verification
- Or keep enabled for traditional email verification

## Google Gemini API Setup

### Get API Key
1. Visit: https://aistudio.google.com/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the API key
5. Save to environment variables as `GOOGLE_GENERATIVE_AI_API_KEY`

## Vercel Deployment Steps

### 1. Connect Repository
1. Go to: https://vercel.com
2. Click "New Project"
3. Import GitHub repository: `mohommadhuafnan/job-readiness-platform`
4. Click "Import"

### 2. Add Environment Variables
In Vercel Project Settings → Environment Variables:

Add these 3 variables:
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key-here
GOOGLE_GENERATIVE_AI_API_KEY = your-gemini-key-here
```

For each variable:
- Set environment scope: **Production, Preview, Development**
- Click "Add"

### 3. Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for initial deployment
3. Once complete, visit your URL to verify

### 4. Verify Deployment
- Homepage loads without errors
- Login page shows OAuth buttons (Google, GitHub)
- Sign-up page displays correctly
- Can create account (without email confirmation)

## Post-Deployment Testing

### 1. Test OAuth Login
- Click "Google" button
- Authorize with Google account
- Verify you're logged in and redirected to dashboard

### 2. Test GitHub Login
- Click "GitHub" button
- Authorize with GitHub account
- Verify you're logged in and redirected to dashboard

### 3. Test Email/Password
- Sign up with email and password
- Verify instant login (no email confirmation needed)
- Check dashboard loads with user data

### 4. Test Features
- Upload CV and verify AI analysis works
- Try mentor chatbot
- Check dashboard sections load
- Verify Supabase data persistence

## Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
**Solution:**
1. Get API key from https://aistudio.google.com/apikey
2. Add to Vercel environment variables
3. Redeploy project

### "Invalid Supabase credentials"
**Solution:**
1. Double-check Supabase URL and key match your project
2. Ensure they're the "anon public" key, not service role
3. Verify they're set in both `.env.local` and Vercel

### "OAuth redirect URL mismatch"
**Solution:**
1. Get your Vercel deployment URL (e.g., `https://brightpath-ai.vercel.app`)
2. Update GitHub/Google OAuth settings with exact callback URL:
   ```
   https://your-supabase-url.supabase.co/auth/v1/callback?provider=github
   ```

### "Database tables not created"
**Solution:**
1. Log in once to trigger table creation
2. If still not created, manually run migrations in Supabase SQL editor
3. Check Supabase logs for errors

### "AI features not working"
**Solution:**
1. Verify Gemini API key is valid and not rate-limited
2. Check quota at https://aistudio.google.com/
3. Verify API is enabled in Google Cloud Console

## Monitoring & Maintenance

### Regular Checks
- Monitor Vercel Analytics dashboard
- Check Supabase database usage
- Monitor Google Gemini API usage

### Updates
- Keep Next.js dependencies updated
- Update Supabase client library
- Monitor security advisories

## Support & Documentation

- **GitHub Issues**: https://github.com/mohommadhuafnan/job-readiness-platform/issues
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Docs**: https://vercel.com/docs

## Project Links

- **Repository**: https://github.com/mohommadhuafnan/job-readiness-platform
- **Live App**: https://your-vercel-deployment.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

---

**Status**: Ready for production deployment
**Last Updated**: 2026-05-05
