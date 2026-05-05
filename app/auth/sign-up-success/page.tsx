'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Sparkles, CheckCircle2 } from 'lucide-react'

export default function SignUpSuccessPage() {
  const router = useRouter()

  useEffect(() => {
    // Auto-redirect to login after 2 seconds
    const timer = setTimeout(() => {
      router.push('/auth/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-primary/5 via-background to-accent/10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">
                Welcome to BrightPath AI!
              </CardTitle>
              <CardDescription>Account created successfully</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  Your account is ready. You can now sign in and start your career journey.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-spin text-primary" />
                  <span>Redirecting to login...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
