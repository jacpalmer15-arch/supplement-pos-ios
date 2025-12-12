'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { authState } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authState.loading && !authState.user) {
      router.push('/auth/login')
    }
  }, [authState.loading, authState.user, router])

  // Show loading spinner while checking auth
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated
  if (!authState.user) {
    return null
  }

  return <>{children}</>
}