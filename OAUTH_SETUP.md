# Setting Up Google and GitHub OAuth for Career-job-path

Your app now supports instant login with Google and GitHub! No email confirmation needed.

## Benefits of OAuth

- Instant login (no email confirmation)
- One-click sign up
- Secure authentication
- Pre-filled user data
- Better user experience

---

## Setup Instructions

### Part 1: Google OAuth Setup

#### Step 1: Create Google Cloud Project

1. Go to: https://console.cloud.google.com
2. Click "Select a Project" (top left)
3. Click "NEW PROJECT"
4. Enter name: Career-job-path or similar
5. Click Create
6. Wait for project creation (2-3 minutes)

#### Step 2: Enable Google Sign-In API

1. In the search bar, search for: "Google+ API"
2. Click on "Google+ API"
3. Click "ENABLE"

#### Step 3: Create OAuth Credentials

1. Go to Credentials (left sidebar)
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted to set up consent screen:
   - Click "Configure Consent Screen"
   - Select External
   - Fill in your app name and email
   - Click Save and Continue through all screens

4. Click "Create Credentials" → "OAuth client ID"
5. Select "Web application"
6. Under "Authorized redirect URIs", add:
   - https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback?provider=google
   - http://localhost:3000/auth/callback (for local testing)

7. Click Create
8. Copy your Client ID

#### Step 4: Add to Supabase

1. Go to https://supabase.com → Your Project
2. Go to Authentication → Providers → Google
3. Toggle Enabled to ON
4. Paste your Client ID
5. Get Client Secret from Google Cloud and paste it
6. Click Save

---

### Part 2: GitHub OAuth Setup

#### Step 1: Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: Career-job-path
   - Homepage URL: https://YOUR-VERCEL-URL.vercel.app
   - Authorization callback URL: https://YOUR-SUPABASE-PROJECT.supabase.co/auth/v1/callback?provider=github

4. Click Register application
5. Copy Client ID and Client Secret

#### Step 2: Add to Supabase

1. Go to https://supabase.com → Your Project
2. Go to Authentication → Providers → GitHub
3. Toggle Enabled to ON
4. Paste Client ID and Client Secret
5. Click Save

---

## Testing OAuth

1. Go to your app
2. Click Sign Up or Sign In
3. Click Google or GitHub button
4. Complete login
5. You're automatically logged in - no email confirmation needed!

---

## Quick Reference

Your Supabase Project: https://supabase.com → Your Project → Settings
Your Vercel URL: https://vercel.com → Your Project

---

## What's New

Your login and sign-up pages now have:
- Google login button
- GitHub login button
- Email/password option below
- Instant authentication without email confirmation

Your users can now log in instantly with OAuth!
