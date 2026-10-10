'use client'

import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Search, Accessibility, MousePointerClick, ArrowLeft, CheckCheck } from 'lucide-react'
import { ScreenConfigType } from '@/types/types'
import { RefreshDataContext } from '@/context/RefreshDataContext'
import { htmlWrapper } from '@/data/constants'
import { Theme } from '@/data/Theme'

// ─── Types ────────────────────────────────────────────────────────────────────

type ReviewType = 'ux' | 'accessibility' | 'cta'

interface ReviewIssue {
  id: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'suggestion'
  category: string
}

interface ReviewResult {
  score: number
  summary: string
  issues: ReviewIssue[]
}

type Step = 'pick' | 'loading' | 'results' | 'applying'

// ─── Preset modes ─────────────────────────────────────────────────────────────

const MODES: { type: ReviewType; label: string; sub: string; icon: React.ReactNode }[] = [
  {
    type: 'ux',
    label: 'Senior UX Review',
    sub: 'Hierarchy, layout, spacing & typography',
    icon: <Search className="w-5 h-5" />,
  },
  {
    type: 'accessibility',
    label: 'Accessibility & WCAG Audit',
    sub: 'Semantic HTML, ARIA, keyboard nav & alt text',
    icon: <Accessibility className="w-5 h-5" />,
  },
  {
    type: 'cta',
    label: 'CTA & Conversion Review',
    sub: 'CTA prominence, above-fold, friction & trust',
    icon: <MousePointerClick className="w-5 h-5" />,
  },
]

// ─── Severity config ───────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', dot: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700 border-rose-200' },
  warning:  { label: 'Warning',  dot: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  suggestion: { label: 'Suggest', dot: 'bg-blue-400',  badge: 'bg-blue-50 text-blue-700 border-blue-200' },
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const fill = ((score - 1) / 9) * circ // scale 1-10 → 0-circ
  const color = score >= 7 ? '#22c55e' : score >= 4 ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
        {/* Track */}
        <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - fill}
          style={{ transition: 'stroke-dashoffset 0.9s ease-out, stroke 0.3s' }}
        />
      </svg>
      {/* Score label — overlaid in the centre */}
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 96, height: 96 }}>
        <span className="text-2xl font-bold text-slate-800 leading-none">{score}</span>
        <span className="text-xs text-slate-400 leading-none mt-0.5">/ 10</span>
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

type Props = {
  screen: ScreenConfigType
  theme: Theme
  projectId: string
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function DesignReviewSheet({ screen, theme, projectId, open, onOpenChange }: Props) {
  const { setRefreshData } = useContext(RefreshDataContext)

  const [step, setStep] = useState<Step>('pick')
  const [result, setResult] = useState<ReviewResult | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeMode, setActiveMode] = useState<ReviewType | null>(null)

  // ── Initialize from DB ──────────────────────────────────────────────────────
  React.useEffect(() => {
    if (open) {
      if (screen.aiReview?.result) {
        setActiveMode(screen.aiReview.type as ReviewType)
        setResult(screen.aiReview.result)
        const criticalIds = new Set<string>(screen.aiReview.result.issues.filter((i: any) => i.severity === 'critical').map((i: any) => i.id))
        setSelectedIds(criticalIds)
        setStep('results')
      } else {
        reset()
      }
    }
  }, [open, screen.aiReview])

  // ── Run review ──────────────────────────────────────────────────────────────
  const runReview = async (type: ReviewType) => {
    setActiveMode(type)
    setStep('loading')
    setResult(null)
    setSelectedIds(new Set())

    try {
      const screenHtml = htmlWrapper(theme, screen.code ?? '')
      const res = await axios.post<ReviewResult>('/api/review-design', {
        projectId,
        screenId: screen.screenId,
        screenCode: screenHtml,
        reviewType: type,
      })
      setResult(res.data)
      // Pre-select all critical issues by default
      const criticalIds = new Set(res.data.issues.filter(i => i.severity === 'critical').map(i => i.id))
      setSelectedIds(criticalIds)
      setStep('results')
      
      // Tell parent to refetch DB so `screen.aiReview` is updated
      setRefreshData({ method: 'screenConfig', date: Date.now() })
    } catch {
      toast.error('Review failed — please try again')
      setStep('pick')
    }
  }

  // ── Apply selected ──────────────────────────────────────────────────────────
  const applyFixes = async () => {
    if (!result || selectedIds.size === 0) return
    setStep('applying')

    const selected = result.issues.filter(i => selectedIds.has(i.id))
    const userInput = `Fix the following UX/design issues found in this screen. Address each one carefully and maintain the existing design language:\n\n${
      selected.map((issue, i) => `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}: ${issue.description}`).join('\n')
    }`

    try {
      await axios.post('/api/edit-screen', {
        projectId,
        screenId: screen.screenId,
        oldCode: screen.code,
        userInput,
      })
      setRefreshData({ method: 'screenConfig', date: Date.now() })
      toast.success('Fixes applied — screen updated!')
      onOpenChange(false)
      reset()
    } catch {
      toast.error('Failed to apply fixes — please try again')
      setStep('results')
    }
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep('pick')
    setResult(null)
    setSelectedIds(new Set())
    setActiveMode(null)
  }

  const toggleIssue = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const allSelected = result ? result.issues.every(i => selectedIds.has(i.id)) : false
  const toggleAll = () => {
    if (!result) return
    setSelectedIds(allSelected ? new Set() : new Set(result.issues.map(i => i.id)))
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <Sheet open={open} onOpenChange={(v) => { 
      onOpenChange(v)
      if (!v && !screen.aiReview) reset()
    }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0 overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <span className="text-lg">🪄</span>
              AI Design Review
            </SheetTitle>
            {step !== 'pick' && (
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <p className="text-xs text-slate-400 font-normal mt-0.5">
            {screen.screenName}
          </p>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step: Pick mode ── */}
          {step === 'pick' && (
            <div className="p-6 space-y-3">
              <p className="text-sm text-slate-500 mb-4">
                Choose a review type. The AI will analyse your design and return a list of specific, actionable issues.
              </p>
              {MODES.map(mode => (
                <button
                  key={mode.type}
                  onClick={() => runReview(mode.type)}
                  className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-primary/60 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:text-primary transition-colors">
                    {mode.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-primary transition-colors">{mode.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{mode.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── Step: Loading ── */}
          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-700">Analysing your design…</p>
                <p className="text-xs text-slate-400 mt-1">
                  {activeMode === 'ux' && 'Reviewing hierarchy, layout & UX patterns'}
                  {activeMode === 'accessibility' && 'Checking WCAG 2.1 AA compliance'}
                  {activeMode === 'cta' && 'Evaluating CTAs, conversion & friction points'}
                </p>
              </div>
            </div>
          )}

          {/* ── Step: Results ── */}
          {(step === 'results' || step === 'applying') && result && (
            <div className="p-6 space-y-6">
              {/* Score + Summary */}
              <div className="flex items-start gap-5">
                <div className="relative flex-shrink-0" style={{ width: 96, height: 96 }}>
                  <ScoreRing score={result.score} />
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                    {MODES.find(m => m.type === activeMode)?.label}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      Issues ({result.issues.length})
                    </p>
                    <button
                      onClick={toggleAll}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <CheckCheck className="w-3 h-3" />
                      {allSelected ? 'Deselect all' : 'Select all'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {result.issues.map(issue => {
                      const sc = SEVERITY_CONFIG[issue.severity]
                      const checked = selectedIds.has(issue.id)
                      return (
                        <label
                          key={issue.id}
                          className={cn(
                            'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all select-none',
                            checked
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-slate-100 bg-white hover:border-slate-200'
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleIssue(issue.id)}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded border', sc.badge)}>
                                {sc.label}
                              </span>
                              <span className="text-xs font-semibold text-slate-800">{issue.title}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{issue.description}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {result.issues.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-sm font-semibold text-slate-700">No issues found!</p>
                  <p className="text-xs text-slate-400 mt-1">This design looks solid from this review lens.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer — Apply button */}
        {(step === 'results' || step === 'applying') && result && result.issues.length > 0 && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white">
            <Button
              className="w-full"
              disabled={selectedIds.size === 0 || step === 'applying'}
              onClick={applyFixes}
            >
              {step === 'applying'
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Applying fixes…</>
                : <>Apply {selectedIds.size} Selected Fix{selectedIds.size !== 1 ? 'es' : ''}</>
              }
            </Button>
            {selectedIds.size === 0 && (
              <p className="text-xs text-slate-400 text-center mt-2">Select at least one issue to apply</p>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
