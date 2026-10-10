import React from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 group">
      <div className="relative">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-3">
          <img 
            src="/forma-logo.svg?v=2" 
            alt="Forma Logo" 
            className="w-10 h-10 sm:w-12 sm:h-12 transition-all duration-500 ease-out group-hover:scale-110 group-hover:rotate-12" 
          />
        </div>
      </div>
      
      {/* Brand Name */}
      <div className="flex items-center gap-2">
        <span className="text-xl sm:text-3xl font-runethia text-slate-900 dark:text-white transition-all duration-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
          Forma
        </span>
        <Sparkles className="w-4 h-4 text-indigo-500 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out" />
      </div>
    </Link>
  )
}

export default Logo
