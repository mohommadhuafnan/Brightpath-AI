# OAuth Configuration Guide

Step-by-step guide to configure Google and GitHub OAuth for BrightPath AI.

## Overview

OAuth allows users to sign in with their Google or GitHub accounts instead of creating a new password. This guide walks through setting up both providers.

## GitHub OAuth Setup

### Step 1: Create OAuth Application

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"** (or **"Developer applications"** → **"OAuth Applications"** → **"New OAuth App"**)
3. Fill in the form:
   - **Application name**: `BrightPath AI` (or your app name)
   - **Homepage URL**: `https://your-vercel-deployment.vercel.app` (or `http://localhost:3000` for testing)
   - **Application description**: `Career development platform with AI features`
   - **Authorization callback URL**: See below

### Step 2: Get Callback URL

For production (Vercel):
```
https://your-project-id.supabase.co/auth/v1/callback?provider=github
```

For local testing:
```
http://localhost:3000/auth/callback
```

### Step 3: Register Application

1. Enter the callback URL above
2. Click **"Register application"**
3. You'll see **Client ID** and **Client Secret**
4. **Save these** - you'll need them in Supabase

### Step 4: Add to Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Providers** → **GitHub**
4. Enable GitHub provider (toggle on)
5. Paste:
   - **Client ID**: From GitHub OAuth app
   - **Client Secret**: From GitHub OAuth app
6. Click **"Save"**

### Step 5: Test

1. Go to your app
2. Click **"Sign up"** or **"Sign in"**
3. Click **"GitHub"** button
4. Authorize and verify login works

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. If you don't have a project:
   - Click the project dropdown at the top
   - Click **"NEW PROJECT"**
   - Enter project name: `BrightPath AI`
   - Click **"Create"**
3. Wait for project creation (1-2 minutes)

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for **"Google+ API"**
3. Click on it
4. Click **"Enable"**
5. Wait for enabling to complete

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. You'll be prompted to create an OAuth Consent Screen first:
   - Click **"Create Consent Screen"**
   - Choose **"External"**
   - Click **"Create"**

### Step 4: Fill OAuth Consent Screen

1. **App name**: `BrightPath AI`
2. **User support email**: Your email
3. **Developer contact**: Your email
4. Click **"Save and Continue"**
5. Skip scopes (click **"Save and Continue"**)
6. Skip test users (click **"Save and Continue"**)
7. Review and click **"Back to Dashboard"**

### Step 5: Create OAuth Client

1. Go back to **Credentials**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Choose **"Web application"**
4. Fill in:
   - **Name**: `BrightPath AI Web`
   - **Authorized JavaScript origins**:
     - For production: `https://your-vercel-deployment.vercel.app`
     - For development: `http://localhost:3000`
   - **Authorized redirect URIs**:
     ```
     https://your-project-id.supabase.co/auth/v1/callback?provider=google
     ```
5. Click **"Create"**
6. Copy **Client ID** and **Client Secret**

### Step 6: Add to Supabase

1. Go to Supabase Dashboard
2. Select your project
3. Go to **Authentication** → **Providers** → **Google**
4. Enable Google provider (toggle on)
5. Paste:
   - **Client ID**: From Google OAuth app
   - **Client Secret**: From Google OAuth app
6. Click **"Save"**

### Step 7: Test

1. Go to your app
2. Click **"Sign up"** or **"Sign in"**
3. Click **"Google"** button
4. Authorize with Google account
5. Verify login works and you're redirected to dashboard

## Troubleshooting

### "Callback URL mismatch"

**Problem**: Redirect URL doesn't match what's registered

**Solution**:
1. Get exact error message from browser console
2. In GitHub: Go to OAuth App settings, verify **Authorization callback URL**
3. In Google: Go to Credentials → OAuth 2.0 Client IDs → edit → verify **Authorized redirect URIs**
4. Ensure exact match including protocol (http/https) and port

### "Invalid Client ID or Secret"

**Problem**: Credentials are rejected by Supabase

**Solution**:
1. Verify you copied the entire ID and Secret correctly
2. No extra spaces at beginning or end
3. Check you're using Client ID and Client Secret (not other IDs)
4. For Google: Ensure you're using OAuth 2.0 credentials, not API Key
5. Test by signing out and signing in again

### "OAuth provider not showing"

**Problem**: OAuth buttons don't appear on login page

**Solution**:
1. Verify OAuth provider is **enabled** in Supabase (toggle is ON)
2. Verify Client ID and Secret are filled in
3. Clear browser cache (Ctrl+Shift+Delete)
4. Refresh the page
5. Check browser console for errors

### "User data not syncing"

**Problem**: User signs in via OAuth but data isn't in database

**Solution**:
1. Verify user_progress table has RLS enabled
2. Check database trigger is working
3. Manually insert user_progress record:
   ```sql
   INSERT INTO public.user_progress (user_id)
   VALUES ('user-uuid-here');
   ```

## Local Development Testing

### Testing with Localhost

For GitHub:
1. Go to your OAuth App settings
2. Add Authorization callback URL: `http://localhost:3000/auth/callback`
3. Use same Client ID and Secret

For Google:
1. Go to OAuth 2.0 Client IDs
2. Add Authorized redirect URI: `http://localhost:3000/auth/callback`
3. Add JavaScript origin: `http://localhost:3000`

### Using Ngrok for Remote Testing

If you need to test OAuth with a remote server:

1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. Get forwarding URL (e.g., `https://abc123.ngrok.io`)
4. Add to GitHub/Google as callback URL
5. Access via ngrok URL instead of localhost

## Security Best Practices

### DO:
- Keep Client Secret private - never commit to repository
- Use HTTPS in production (Vercel does this automatically)
- Regularly rotate Client Secrets
- Monitor OAuth app usage
- Use different apps for dev and production

### DON'T:
- Don't hardcode secrets in frontend code
- Don't expose Client Secret in browser
- Don't use same OAuth credentials across projects
- Don't commit secrets to GitHub
- Don't share secrets in messages

## Testing Checklist

- [ ] GitHub OAuth app created
- [ ] GitHub credentials added to Supabase
- [ ] Google OAuth app created
- [ ] Google credentials added to Supabase
- [ ] Email confirmation disabled in Supabase (or configured as needed)
- [ ] Tested GitHub login on local development
- [ ] Tested Google login on local development
- [ ] Tested GitHub login on Vercel preview
- [ ] Tested Google login on Vercel preview
- [ ] Tested GitHub login on production
- [ ] Tested Google login on production
- [ ] User data syncs correctly after OAuth login
- [ ] Dashboard loads after OAuth login

## Additional Resources

- **GitHub OAuth**: https://docs.github.com/en/developers/apps/building-oauth-apps
- **Google OAuth**: https://developers.google.com/identity/protocols/oauth2
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Supabase OAuth**: https://supabase.com/docs/guides/auth/social-login

---

**Last Updated**: 2026-05-05
