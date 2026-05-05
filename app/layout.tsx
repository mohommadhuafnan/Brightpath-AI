import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geistSans = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist-sans'
})
const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono'
})

export const metadata: Metadata = {
  title: 'BrightPath AI - Your AI-Powered Career Companion',
  description: 'Accelerate your career journey with AI-powered CV analysis, skill benchmarking, interview simulation, personalized learning paths, and portfolio building.',
  keywords: ['career development', 'AI career coach', 'resume analysis', 'interview preparation', 'skill assessment', 'job readiness'],
  authors: [{ name: 'BrightPath AI' }],
  openGraph: {
    title: 'BrightPath AI - Your AI-Powered Career Companion',
    description: 'Accelerate your career journey with AI-powered tools for CV analysis, interview prep, and skill development.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0891b2' },
    { media: '(prefers-color-scheme: dark)', color: '#06b6d4' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
