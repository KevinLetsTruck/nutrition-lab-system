'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SearchClients } from './SearchClients'

const Navigation = () => {
  const router = useRouter()

  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-semibold text-white hover:text-blue-400 transition-colors">
            FNTP Clinical
          </Link>
                           <div className="flex items-center gap-6">
                   <Link href="/clients" className="text-gray-300 hover:text-white transition-colors">
                     Clients
                   </Link>
                                     <Link href="/admin/quick-add-client" className="text-gray-300 hover:text-white transition-colors">
                    Quick Add Client
                  </Link>
                  <Link href="/notes" className="text-gray-300 hover:text-white transition-colors">
                    Notes
                  </Link>
                   <Link href="/protocols" className="text-gray-300 hover:text-white transition-colors">
                     Protocols
                   </Link>
                   <Link href="/quick-analysis" className="text-gray-300 hover:text-white transition-colors">
                     Quick Analysis
                   </Link>
                 </div>
        </div>
        <div className="flex items-center gap-4">
          <SearchClients />
          <span className="text-sm text-gray-400">Kevin Rutherford, FNTP</span>
          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST' })
                .then(() => router.push('/auth'))
            }}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 