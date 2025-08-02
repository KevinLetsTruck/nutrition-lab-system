'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchInput } from '@/components/ui/search-input'

export const SearchClients = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/clients?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/clients')
    }
  }

  return (
    <form onSubmit={handleSearch}>
      <SearchInput
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search clients..."
        className="w-64 h-9"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      />
    </form>
  )
}