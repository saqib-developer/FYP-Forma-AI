'use client'

import React, { useRef, useState, useMemo } from 'react'
import { HexColorPicker } from 'react-colorful'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Theme, deriveFullTheme } from '@/data/Theme'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2, Upload } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

type ColorKey = 'primary' | 'background' | 'card' | 'accent' | 'foreground'

const COLOR_FIELDS: { key: ColorKey; label: string; description: string }[] = [
  { key: 'primary',    label: 'Primary',    description: 'Brand color — buttons, links, highlights' },
  { key: 'background', label: 'Background', description: 'Page/app background' },
  { key: 'card',       label: 'Card',       description: 'Surface background for cards & panels' },
  { key: 'accent',     label: 'Accent',     description: 'Secondary highlight (auto-derived if unset)' },
  { key: 'foreground', label: 'Foreground', description: 'Main text color (auto-derived if unset)' },
]

/**
 * CSS variable name → theme field mapping for CSS import.
 * Tries common naming conventions from Tailwind, shadcn, Bootstrap, Material, etc.
 */
const CSS_VAR_MAP: Record<string, ColorKey> = {
  '--primary':              'primary',
  '--primary-color':        'primary',
  '--brand':                'primary',
  '--brand-color':          'primary',
  '--color-primary':        'primary',
  '--accent-color':         'primary',

  '--background':           'background',
  '--bg':                   'background',
  '--bg-color':             'background',
  '--background-color':     'background',
  '--color-background':     'background',
  '--page-background':      'background',
  '--surface':              'background',

  '--card':                 'card',
  '--card-background':      'card',
  '--card-bg':              'card',
  '--surface-card':         'card',
  '--color-surface':        'card',
  '--panel-background':     'card',

  '--accent':               'accent',
  '--secondary':            'accent',
  '--secondary-color':      'accent',
  '--color-accent':         'accent',
  '--color-secondary':      'accent',
  '--highlight':            'accent',

  '--foreground':           'foreground',
  '--text':                 'foreground',
  '--text-color':           'foreground',
  '--color-text':           'foreground',
  '--color-foreground':     'foreground',
  '--on-background':        'foreground',
}

/** Extract hex colors from CSS variable declarations in raw CSS text */
function extractCssVars(cssText: string): Partial<Record<ColorKey, string>> {
  const result: Partial<Record<ColorKey, string>> = {}
  // Match --var-name: #hexvalue or rgb(...) or hsl(...)
  const hexPattern = /(-{2}[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g
  let match
  while ((match = hexPattern.exec(cssText)) !== null) {
    const varName = match[1].toLowerCase()
    const color = match[2]
    const mapped = CSS_VAR_MAP[varName]
    if (mapped && !result[mapped]) {
      result[mapped] = color
    }
  }
  return result
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onSave: (themeJson: string) => void
  baseTheme: Theme
}

const ThemeBuilder = ({ isOpen, onClose, onSave, baseTheme }: Props) => {
  const [themeName, setThemeName] = useState('My Custom Theme')
  const [primary,    setPrimary]    = useState<string>(baseTheme.primary)
  const [background, setBackground] = useState<string>(baseTheme.background)
  const [card,       setCard]       = useState<string>(baseTheme.card)
  const [accent,     setAccent]     = useState<string>(baseTheme.accent)
  const [foreground, setForeground] = useState<string>(baseTheme.foreground)
  const [radius,     setRadius]     = useState<string>(baseTheme.radius)
  const [fontFamily, setFontFamily] = useState<string>(baseTheme.fontFamily || 'Inter, system-ui, sans-serif')

  const [activeColor, setActiveColor] = useState<ColorKey>('primary')
  const [loading, setLoading] = useState(false)
  const cssFileRef = useRef<HTMLInputElement>(null)

  // Derive the full harmonious theme in real-time for preview
  const derived = useMemo(() => deriveFullTheme(
    primary, background, card, accent, foreground, radius, fontFamily
  ), [primary, background, card, accent, foreground, radius, fontFamily])

  const colorValues: Record<ColorKey, string> = { primary, background, card, accent, foreground }
  const setColorValue = (key: ColorKey, value: string) => {
    if (key === 'primary')    setPrimary(value)
    if (key === 'background') setBackground(value)
    if (key === 'card')       setCard(value)
    if (key === 'accent')     setAccent(value)
    if (key === 'foreground') setForeground(value)
  }

  const handleSave = async () => {
    if (!themeName.trim()) {
      toast.error('Please enter a theme name')
      return
    }
    setLoading(true)
    const themeJson = `CUSTOM:${JSON.stringify(derived)}`
    try {
      await axios.post('/api/user/themes', { themeName, themeData: themeJson })
      toast.success('Theme saved to your account!')
      onSave(themeJson)
      onClose()
    } catch {
      toast.error('Failed to save custom theme')
    } finally {
      setLoading(false)
    }
  }

  const handleCssImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.endsWith('.css')) {
      toast.error('Please upload a .css file')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const extracted = extractCssVars(text)
      const found = Object.keys(extracted) as ColorKey[]

      if (found.length === 0) {
        toast.warning('No recognizable CSS color variables found in this file')
        return
      }

      // Apply extracted colors
      found.forEach(key => setColorValue(key, extracted[key]!))
      toast.success(`Imported: ${found.join(', ')} from ${file.name}`)
    }
    reader.readAsText(file)
    // Reset so same file can be re-imported
    e.target.value = ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Custom Theme</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Theme Name + CSS Import */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Theme Name</Label>
              <Input
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. Acme Corp Brand"
              />
            </div>
            <div>
              <input
                type="file"
                accept=".css"
                className="hidden"
                ref={cssFileRef}
                onChange={handleCssImport}
              />
              <Button
                variant="outline"
                className="h-10 gap-2 text-slate-600 dark:text-slate-300 border-dashed"
                onClick={() => cssFileRef.current?.click()}
              >
                <Upload className="w-4 h-4" />
                Import .css
              </Button>
            </div>
          </div>

          {/* Color Pickers + Swatch List */}
          <div className="flex gap-5">
            {/* Left: color list */}
            <div className="flex flex-col gap-2 w-44 flex-shrink-0">
              <Label className="text-xs text-slate-500 mb-1">Colors</Label>
              {COLOR_FIELDS.map(({ key, label, description }) => (
                <button
                  key={key}
                  onClick={() => setActiveColor(key)}
                  className={[
                    'flex items-center gap-2.5 text-left px-3 py-2 rounded-lg border text-sm transition-all',
                    activeColor === key
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  ].join(' ')}
                >
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 dark:border-white/10 flex-shrink-0"
                    style={{ background: colorValues[key] }}
                  />
                  <div className="min-w-0">
                    <div className="truncate">{label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">{description}</div>
                  </div>
                </button>
              ))}

              {/* Radius */}
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs text-slate-500">Border Radius</Label>
                <select
                  className="w-full h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                >
                  <option value="0px">0px — Sharp</option>
                  <option value="0.25rem">4px — Small</option>
                  <option value="0.5rem">8px — Medium</option>
                  <option value="1rem">16px — Large</option>
                  <option value="9999px">Pill</option>
                </select>
              </div>

              {/* Font */}
              <div className="mt-1 space-y-1.5">
                <Label className="text-xs text-slate-500">Font Family</Label>
                <select
                  className="w-full h-9 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                >
                  <option value="Inter, system-ui, sans-serif">Inter</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Outfit, sans-serif">Outfit</option>
                  <option value="Montserrat, sans-serif">Montserrat</option>
                  <option value="Lora, serif">Lora</option>
                  <option value="Playfair Display, serif">Playfair Display</option>
                </select>
              </div>
            </div>

            {/* Right: color picker */}
            <div className="flex flex-col items-center gap-3 flex-1">
              <HexColorPicker
                color={colorValues[activeColor]}
                onChange={(v) => setColorValue(activeColor, v)}
                style={{ width: '100%', height: '180px' }}
              />
              <Input
                className="uppercase text-center font-mono text-sm"
                value={colorValues[activeColor]}
                onChange={(e) => setColorValue(activeColor, e.target.value)}
              />
            </div>
          </div>

          {/* Live Preview */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              Live Preview
            </div>
            <div
              className="p-4 space-y-3"
              style={{ background: derived.background, fontFamily: derived.fontFamily }}
            >
              {/* Simulated header bar */}
              <div
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{ background: derived.card, border: `1px solid ${derived.border}` }}
              >
                <span className="text-sm font-bold" style={{ color: derived.foreground }}>My App</span>
                <div className="flex gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md" style={{ color: derived.mutedForeground }}>Home</span>
                  <span className="text-xs px-2.5 py-1 rounded-md font-medium" style={{ color: derived.primary }}>About</span>
                </div>
              </div>

              {/* Card with button */}
              <div
                className="p-4 rounded-lg space-y-2"
                style={{ background: derived.card, border: `1px solid ${derived.border}` }}
              >
                <p className="text-sm font-semibold" style={{ color: derived.cardForeground }}>
                  Card Title
                </p>
                <p className="text-xs" style={{ color: derived.mutedForeground }}>
                  This is muted description text inside a card.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    className="text-xs px-3 py-1.5 rounded font-semibold transition-all"
                    style={{
                      background: derived.primary,
                      color: derived.primaryForeground,
                      borderRadius: derived.radius,
                    }}
                  >
                    Primary Action
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded font-medium transition-all"
                    style={{
                      background: derived.secondary,
                      color: derived.secondaryForeground,
                      borderRadius: derived.radius,
                    }}
                  >
                    Secondary
                  </button>
                </div>
              </div>

              {/* Accent badge */}
              <div className="flex gap-2 items-center">
                <span
                  className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: derived.accent, color: derived.accentForeground, borderRadius: derived.radius }}
                >
                  Accent Tag
                </span>
                <span className="text-xs" style={{ color: derived.mutedForeground }}>
                  Muted label text
                </span>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save as My Brand Theme
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ThemeBuilder
