'use client'

import { SearchClients } from './SearchClients'

const Navigation = () => {
  return (
    <nav className="bg-slate-900 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-semibold text-white">FNTP Clinical</h1>
        </div>
        <div className="flex items-center gap-4">
          <SearchClients />
          <span className="text-sm text-gray-400">Kevin Rutherford, FNTP</span>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 