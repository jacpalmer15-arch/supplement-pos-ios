/**
 * @deprecated This component is deprecated and no longer used in the application.
 * The unified layout in components/admin-layout.tsx uses AdminSidebar which includes
 * user info and sign out functionality.
 */
'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from "@/components/ui/button"
import { LogOut, User } from 'lucide-react'

export function AdminHeader() {
  const { signOut, authState } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {authState.user?.email}
            </span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}