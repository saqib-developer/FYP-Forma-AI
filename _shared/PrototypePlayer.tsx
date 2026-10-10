'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronLeft, RotateCcw, ChevronRight } from 'lucide-react'
import { htmlWrapper } from '@/data/constants'
import { ProjectType, ScreenConfigType } from '@/types/types'
import { Theme, parseTheme } from '@/data/Theme'
import { cn } from '@/lib/utils'

type Props = {
  screenConfig: ScreenConfigType[]
  projectDetail: ProjectType
  onClose: () => void
}

const PrototypePlayer = ({ screenConfig, projectDetail, onClose }: Props) => {
  const validScreens = screenConfig.filter(s => !!s.code)
  const firstScreenId = validScreens[0]?.screenId ?? ''

  const [activeScreenId, setActiveScreenId] = useState<string>(firstScreenId)
  const [navHistory, setNavHistory] = useState<string[]>([firstScreenId])
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const isMobile = projectDetail.device === 'MOBILE'
  const theme: Theme = parseTheme(projectDetail.theme)

  const activeScreen = validScreens.find(s => s.screenId === activeScreenId) ?? validScreens[0]
  const activeIndex = validScreens.findIndex(s => s.screenId === activeScreenId)

  // Navigate to a screen
  const navigateTo = (screenId: string) => {
    setActiveScreenId(screenId)
    setNavHistory(prev => [...prev, screenId])
  }

  const goBack = () => {
    if (navHistory.length <= 1) return
    const newHistory = navHistory.slice(0, -1)
    setNavHistory(newHistory)
    setActiveScreenId(newHistory[newHistory.length - 1])
  }

  const restart = () => {
    setActiveScreenId(firstScreenId)
    setNavHistory([firstScreenId])
  }

  const goNext = () => {
    if (activeIndex < validScreens.length - 1) navigateTo(validScreens[activeIndex + 1].screenId)
  }
  const goPrev = () => {
    if (activeIndex > 0) navigateTo(validScreens[activeIndex - 1].screenId)
  }

  // iframe postMessage navigation
  useEffect(() => {
    const handleMessage = (event: MessageEvent<{ type: string; targetScreenId: string }>) => {
      if (event.data?.type === 'NAVIGATE_TO_SCREEN') {
        const targetId = event.data.targetScreenId
        const target = validScreens.find(s => s.screenId === targetId)
        if (target) {
          setActiveScreenId(targetId)
          setNavHistory(prev => [...prev, targetId])
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [validScreens])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }

    window.addEventListener('keydown', handleKey)

    // Also bind inside iframe so keyboard still works when iframe is focused
    const iframe = iframeRef.current
    let iframeDoc: Document | null = null
    const attach = () => {
      try {
        iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document || null
        iframeDoc?.addEventListener('keydown', handleKey)
      } catch { /* cross-origin */ }
    }
    if (iframe) {
      iframe.addEventListener('load', attach)
      attach()
    }

    return () => {
      window.removeEventListener('keydown', handleKey)
      if (iframe) iframe.removeEventListener('load', attach)
      try { iframeDoc?.removeEventListener('keydown', handleKey) } catch { /* */ }
    }
  }, [activeScreenId, validScreens, onClose])

  // Request browser fullscreen
  useEffect(() => {
    const el = document.documentElement
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => { /* user denied or already fullscreen */ })
    }
    return () => {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => { /* */ })
      }
    }
  }, [])

  if (validScreens.length === 0) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col overflow-hidden">

      {/* ── Minimal HUD — always on top, only shows on hover ── */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 group">
        {/* Left: Back + Restart */}
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            disabled={navHistory.length <= 1}
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={restart}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restart
          </button>
        </div>

        {/* Center: screen name */}
        <span className="text-white/70 text-sm font-medium tracking-tight select-none">
          {activeScreen?.screenName}
          {navHistory.length > 1 && (
            <span className="ml-2 text-[10px] text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
              {navHistory.length} steps
            </span>
          )}
        </span>

        {/* Right: Close + hint */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-white/30 hidden sm:block">Press Esc to exit</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── The Screen itself — takes full area ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        {isMobile ? (
          // Mobile: centered phone frame, fills height
          <div
            className="relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border border-white/10 rounded-[3rem] overflow-hidden flex-shrink-0"
            style={{
              width: 'min(420px, calc(100vw - 48px))',
              height: 'min(900px, calc(100vh - 48px))',
            }}
          >
            {/* Phone notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-800" />
            </div>
            <iframe
              key={activeScreenId}
              ref={iframeRef}
              srcDoc={htmlWrapper(theme, activeScreen?.code ?? '')}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        ) : (
          // Website: full width, constrained height — NO outer frame, feels native
          <div
            className="relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border-x border-white/5"
            style={{
              width: '100vw',
              height: '100vh',
            }}
          >
            <iframe
              key={activeScreenId}
              ref={iframeRef}
              srcDoc={htmlWrapper(theme, activeScreen?.code ?? '')}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        )}
      </div>

      {/* ── Left/Right arrow navigation ── */}
      {validScreens.length > 1 && (
        <>
          <button
            onClick={goPrev}
            disabled={activeIndex === 0}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            disabled={activeIndex === validScreens.length - 1}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white disabled:opacity-0 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* ── Bottom dot navigation ── */}
      {validScreens.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          {validScreens.map((s, i) => (
            <button
              key={s.screenId}
              onClick={() => navigateTo(s.screenId)}
              title={s.screenName}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                s.screenId === activeScreenId
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/25 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default PrototypePlayer
