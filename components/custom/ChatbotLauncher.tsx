'use client'

import React, { useContext } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatbotContext } from '@/context/ChatbotContext'

const ChatbotLauncher = () => {
  const { isOpen, setIsOpen } = useContext(ChatbotContext)
  const pathname = usePathname()

  // Hide the floating bubble on the project canvas — there it's reachable
  // from the toolbar icon in ProjectHeader instead, to keep the workspace clean.
  if (pathname?.startsWith('/project/')) return null

  return (
    <button
      onClick={() => setIsOpen((v) => !v)}
      className={cn(
        'fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 w-11 h-11 sm:w-14 sm:h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105',
        isOpen ? 'bg-slate-800' : 'bg-rose-500 hover:bg-rose-600'
      )}
      aria-label="Toggle Forma Assistant"
    >
      <MessageCircle className="w-5 h-5 text-white" />
    </button>
  )
}

export default ChatbotLauncher