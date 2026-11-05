'use client'

import React, { useContext, useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { X, Send, Sparkles, Loader2, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatbotContext } from '@/context/ChatbotContext'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  "Help me write a prompt for my app idea",
  "How do I change the theme?",
  "Why did my generation fail?",
]

const WELCOME_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm the Forma Assistant 👋 I can help you write a great prompt for your app idea, show you how to use a feature, or help fix an error. What's up?",
}

const Chatbot = () => {
  const { isOpen, setIsOpen } = useContext(ChatbotContext)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  if (!isOpen) return null

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    setLoading(true)

    try {
      const res = await axios.post('/api/chatbot', {
        history: messages, // history BEFORE this new message
        message: trimmed,
      })
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (error) {
      console.error('Chatbot error:', error)
      toast.error('Assistant is unavailable right now, try again in a moment.')
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't respond just now. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
      <div className="fixed bottom-20 sm:bottom-24 right-3 sm:right-6 z-50 w-[22rem] sm:w-96 max-w-[calc(100vw-1.5rem)] h-[30rem] max-h-[calc(100dvh-6rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-rose-500 text-white px-4 py-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold leading-tight">Forma Assistant</h3>
            <p className="text-[11px] text-rose-100 leading-tight">Guidance, troubleshooting & prompts</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
            aria-label="Close assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] text-sm px-3 py-2 rounded-2xl whitespace-pre-wrap leading-relaxed',
                  m.role === 'user'
                    ? 'bg-rose-500 text-white rounded-br-sm'
                    : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm relative group'
                )}
              >
                {m.content}
                {m.role === 'assistant' && m.content.length > 60 && (
                  <button
                    onClick={() => handleCopy(m.content, i)}
                    className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    aria-label="Copy message"
                  >
                    {copiedIndex === i ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-500" />
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="flex flex-col gap-2 pt-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left text-xs px-3 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-rose-300 hover:text-rose-500 transition-colors bg-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-slate-200 p-2.5 flex items-end gap-2 bg-white">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage(input)
              }
            }}
            placeholder="Ask anything about Forma..."
            rows={1}
            className="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-rose-300 max-h-24"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      )
}

      export default Chatbot