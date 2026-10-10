import React from 'react'
import Link from 'next/link'
import Logo from '@/data/Logo'

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm mt-20">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Transform your ideas into stunning designs with AI.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Pricing
            </Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Forma. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            {/* Social Icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
