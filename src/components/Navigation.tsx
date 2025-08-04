'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SearchClients } from './SearchClients'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

const Navigation = () => {
  const router = useRouter()
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
            <span className="text-white font-bold text-sm">DH</span>
          </div>
          <span className="text-xl font-heading font-bold gradient-text">
            DestinationHealth
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link href="/clients">Clients</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/quick-analysis">Analysis</Link>
          </Button>
        </nav>

        {/* User Menu & Search */}
        <div className="flex items-center gap-4">
          <SearchClients />
          <div className="flex items-center gap-3">
            <span className="text-sm text-foreground-secondary">Kevin Rutherford, FNTP</span>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await logout()
                router.push('/auth')
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navigation