# BrightPath AI - Job Readiness Platform

An AI-powered career development platform that helps users prepare for their dream jobs through CV analysis, skill assessment, mock interviews, and personalized learning paths.

## Features

- **AI CV Analysis** - Get instant feedback on your resume using Google Gemini AI
- **Mentor Chatbot** - 24/7 AI career mentor for advice and guidance
- **Mock Interviews** - Practice with AI-powered interview simulations
- **Skill Tracker** - Track and build your professional skills
- **Learning Paths** - Personalized career roadmaps tailored to target roles
- **Progress Dashboard** - Visualize your career development journey
- **OAuth Authentication** - Sign in with Google or GitHub
- **Portfolio Builder** - Create and showcase your projects
- **Job Analysis** - Get AI insights on job requirements and fit

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- GitHub account (for OAuth)
- Google account (for Gemini API)
- Supabase project

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mohommadhuafnan/job-readiness-platform.git
cd job-readiness-platform
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Then fill in the following variables in `.env.local`:

```env
# Supabase (Get from https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Gemini (Get from https://aistudio.google.com/apikey)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Environment Setup

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. In your project settings, find:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Database tables are auto-created through migrations

### Google Gemini API

1. Go to https://aistudio.google.com/apikey
2. Create a new API key
3. Copy it to `GOOGLE_GENERATIVE_AI_API_KEY`

### GitHub OAuth Setup

1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Set Authorization callback URL:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Add Client ID and Secret to Supabase → Authentication → Providers → GitHub

### Google OAuth Setup

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Set Authorized redirect URIs:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.com/auth/callback`
4. Add Client ID and Secret to Supabase → Authentication → Providers → Google

## Project Structure

```
├── app/
│   ├── api/              # API routes (Gemini, CV analysis, interviews)
│   ├── auth/             # Authentication (login, signup, OAuth)
│   ├── dashboard/        # Main application dashboard
│   ├── portfolio/        # Portfolio pages
│   └── layout.tsx        # Root layout
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── auth/            # Auth components
│   └── dashboard/       # Dashboard components
├── lib/
│   ├── supabase/        # Supabase client & server
│   ├── ai/              # AI/Gemini utilities
│   └── utils/           # Helper functions
├── public/              # Static assets
└── package.json         # Dependencies
```

## Database Schema

The app uses Supabase PostgreSQL with the following main tables:

- **profiles** - User profile information
- **user_progress** - XP, level, and streak tracking
- **learning_paths** - Personalized learning roadmaps
- **interviews** - Mock interview records
- **user_badges** - Achievement badges
- **badges** - Badge definitions

All tables include Row Level Security (RLS) to protect user data.

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project" and import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GOOGLE_GENERATIVE_AI_API_KEY`
5. Click "Deploy"

### Environment Variables for Vercel

Add these in Vercel Project Settings → Environment Variables:
- **Production**: All three variables
- **Preview**: All three variables
- **Development**: All three variables

## Authentication

The app supports multiple authentication methods:

### Email/Password
- Auto-confirm enabled (no email verification needed)
- Can be changed in Supabase → Authentication → Providers → Email

### Google OAuth
- One-click login with Google account
- Requires Google OAuth app setup

### GitHub OAuth
- One-click login with GitHub account
- Requires GitHub OAuth app setup

## Troubleshooting

### "Missing GOOGLE_GENERATIVE_AI_API_KEY"
- Get key from https://aistudio.google.com/apikey
- Add to `.env.local` (development) or Vercel settings (production)
- Redeploy after adding

### "Invalid Supabase credentials"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check they're from the correct Supabase project
- Ensure they're set in your environment

### "Email confirmation required"
- The app auto-confirms emails by default
- If you see confirmation prompt, disable it in Supabase → Authentication → Email Provider

### OAuth not working
- Verify redirect URL matches exactly in GitHub/Google settings
- Check OAuth credentials are added to Supabase
- Clear browser cache and try again

## Available Routes

### Public Routes
- `/` - Landing page
- `/auth/login` - Login page
- `/auth/sign-up` - Sign up page

### Protected Routes (Requires login)
- `/dashboard` - Main dashboard
- `/dashboard/mentor` - AI mentor chatbot
- `/dashboard/cv-analysis` - CV analysis
- `/dashboard/interview` - Mock interviews
- `/dashboard/learning` - Learning paths
- `/dashboard/skills` - Skill tracker
- `/dashboard/careers` - Career explorer
- `/dashboard/jobs` - Job search
- `/dashboard/projects` - Portfolio projects
- `/dashboard/progress` - Progress tracking
- `/dashboard/reports` - Reports

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: Shadcn/ui with Radix UI
- **Styling**: Tailwind CSS v4
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth with OAuth
- **AI**: Google Gemini 2.0 Flash via AI SDK
- **Forms**: React Hook Form with Zod validation
- **PDF**: React PDF Renderer
- **Charts**: Recharts

## Development

### Run Build
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the [Troubleshooting](#troubleshooting) section
- Visit: https://github.com/mohommadhuafnan/job-readiness-platform/issues

## Roadmap

- Mobile app (React Native)
- Advanced analytics dashboard
- Video interview practice
- Resume templates
- LinkedIn integration
- Real job matching
- Community features

---

Built with by the BrightPath AI team
