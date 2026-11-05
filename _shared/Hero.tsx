'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Plane,
  GraduationCap,
  Wallet,
  ShoppingCart,
  ClipboardList,
  UtensilsCrossed,
  Baby,
  Sparkles,
  ArrowUp,
  ArrowRightIcon,
  Loader2,
  Laptop,
  Smartphone,
  Calendar,
  Image as ImageIcon,
  Palette,
  Plus,
  X,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { THEME_NAME_LIST, THEMES } from '@/data/Theme'
import { categories } from '@/data/constants'
import axios from 'axios'
import Loading from '@/components/custom/Loading'
import { ProjectType } from '@/types/types'
import { toast } from 'sonner'
import ThemeBuilder from '@/components/custom/ThemeBuilder'
import { parseTheme } from '@/data/Theme'

const Hero = () => {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [selectedCategory, setSelectedCategory] = useState('WEBSITE')
  const [selectedTheme, setSelectedTheme] = useState<string>("")
  const [userInput, setUserInput] = useState<string>()
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [userProjects, setUserProjects] = useState<ProjectType[]>([])
  const [fetchingProjects, setFetchingProjects] = useState(false)
  const [customThemes, setCustomThemes] = useState<{ themeName: string, themeData: string }[]>([])
  const [isThemeBuilderOpen, setIsThemeBuilderOpen] = useState(false)

  React.useEffect(() => {
    if (user) {
      fetchUserProjects()
      fetchCustomThemes()
    }
  }, [user])

  const fetchUserProjects = async () => {
    setFetchingProjects(true)
    try {
      const res = await axios.get('/api/project')
      setUserProjects(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setFetchingProjects(false)
    }
  }

  const fetchCustomThemes = async () => {
    try {
      const res = await axios.get('/api/user/themes')
      setCustomThemes(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      console.error("Error fetching custom themes:", error)
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async () => {
    if (!isLoaded) return

    if (!user) {
      router.push('/sign-in')
      return
    }

    if ((!userInput || userInput.trim() === '') && !imageFile) {
      return
    }

    if (!selectedTheme) {
      toast.error("Please select a theme before generating")
      return
    }

    const projectId = crypto.randomUUID()
    setLoading(true)

    try {
      // 1. Create project in DB (handles auth & tier limits)
      await axios.post('/api/project', {
        projectId,
        userInput: userInput || 'Generate UI from sketch',
        device: selectedCategory,
        theme: selectedTheme
      })

      // 2. If image, generate config from image now
      if (imageFile) {
        const base64Image = await convertToBase64(imageFile)
        await axios.post('/api/generate-from-image', {
          projectId,
          userInput: userInput || 'Generate a UI based on this image',
          device: selectedCategory,
          theme: selectedTheme,
          imageBase64: base64Image
        })
      }

      // 3. Navigate
      router.push('/project/' + projectId)
    } catch (error) {
      const err = error as { response?: { status?: number; data?: { error?: string } } }
      if (err?.response?.status === 403) {
        toast.error(err.response.data?.error || "Tier limit reached", {
          action: {
            label: 'Upgrade',
            onClick: () => router.push('/pricing')
          }
        })
      } else {
        toast.error("Failed to create project. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; icon: string }> = {
      indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-950/50', icon: 'text-indigo-600 dark:text-indigo-400' },
      amber: { bg: 'bg-amber-50 dark:bg-amber-950/30', hover: 'hover:bg-amber-100 dark:hover:bg-amber-950/50', icon: 'text-amber-600 dark:text-amber-400' },
      slate: { bg: 'bg-slate-50 dark:bg-slate-800/30', hover: 'hover:bg-slate-100 dark:hover:bg-slate-800/50', icon: 'text-slate-600 dark:text-slate-400' },
      blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', hover: 'hover:bg-blue-100 dark:hover:bg-blue-950/50', icon: 'text-blue-600 dark:text-blue-400' },
      rose: { bg: 'bg-rose-50 dark:bg-rose-950/30', hover: 'hover:bg-rose-100 dark:hover:bg-rose-950/50', icon: 'text-rose-600 dark:text-rose-400' },
      orange: { bg: 'bg-orange-50 dark:bg-orange-950/30', hover: 'hover:bg-orange-100 dark:hover:bg-orange-950/50', icon: 'text-orange-600 dark:text-orange-400' },
      yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/30', hover: 'hover:bg-yellow-100 dark:hover:bg-yellow-950/50', icon: 'text-yellow-600 dark:text-yellow-400' },
    }
    return colors[color] || colors.indigo
  }

  return (
    <section className="relative pb-16 sm:pb-20 px-3 sm:px-6 lg:px-8 mt-14 sm:mt-20">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none"></div>

      {/* Floating Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10" aria-hidden="true">
        <div className="absolute top-20 right-10 w-32 h-32 bg-purple-200/30 dark:bg-purple-900/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-blue-200/30 dark:bg-blue-900/10 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="relative max-w-6xl mx-auto w-full">
          <div className="flex min-h-16 sm:min-h-24 items-center justify-center">
            <div
              className={cn(
                "group rounded-full border border-black/5 bg-neutral-100 text-sm sm:text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              )}
            >
              <AnimatedShinyText className="inline-flex items-center justify-center px-3 sm:px-4 py-1 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400 text-xs sm:text-sm">
                <span>✨ Introducing Forma AI</span>
                <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
              </AnimatedShinyText>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-6 animate-slide-up-fade tracking-tight leading-tight">
            <span className="text-slate-900 dark:text-white">Design High Quality </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400">
              Website and Mobile App Designs
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-center text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto animate-slide-up-fade px-2" style={{ animationDelay: '100ms' }}>
            Imagine your idea and turn it into reality
          </p>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto mb-10 sm:mb-16 animate-slide-up-fade w-full" style={{ animationDelay: '300ms' }}>
            {/* Light input card */}
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl hover:shadow-lg transition-all duration-300 w-full">

              {/* Image Preview */}
              {imagePreview && (
                <div className="px-4 sm:px-5 pt-3 sm:pt-4">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={clearImage}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Textarea */}
              <textarea
                placeholder="What shall we design for you?"
                rows={3}
                className="w-full bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base resize-none border-0 outline-none px-4 pt-4 pb-2 sm:px-5 sm:pt-5 sm:pb-3 font-medium"
                value={userInput}
                onChange={(e) => setUserInput(e?.target?.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />

              {/* Hidden File Input */}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />

              {/* Bottom action bar */}
              <div className="flex flex-wrap items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4 gap-2">
                {/* Left: Device tabs + Upload button */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                  {/* + button */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top"><p>Upload image</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {/* Device pill tabs */}
                  <div className="flex items-center gap-0.5 sm:gap-1 rounded-full p-0.5 sm:p-1 bg-slate-100 dark:bg-slate-700">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('MOBILE')}
                      className={cn(
                        'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200',
                        selectedCategory === 'MOBILE'
                          ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      )}
                    >
                      <Smartphone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      App
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory('WEBSITE')}
                      className={cn(
                        'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200',
                        selectedCategory === 'WEBSITE'
                          ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                      )}
                    >
                      <Laptop className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      Web
                    </button>
                  </div>
                </div>

                {/* Right: Theme picker + Submit */}
                <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
                  {/* Theme popover */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all flex-shrink-0',
                          selectedTheme
                            ? 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
                        )}
                      >
                        {selectedTheme ? (
                          <>
                            <div
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full flex-shrink-0 border border-slate-300/50 dark:border-white/20"
                              style={{
                                background: selectedTheme.startsWith('CUSTOM:')
                                  ? JSON.parse(selectedTheme.replace('CUSTOM:', '')).primary
                                  : THEMES[selectedTheme as keyof typeof THEMES]?.primary
                              }}
                            />
                            <span className="text-slate-700 dark:text-slate-200 max-w-[70px] sm:max-w-none truncate">
                              {selectedTheme.startsWith('CUSTOM:')
                                ? (customThemes.find(t => t.themeData === selectedTheme)?.themeName || 'Custom')
                                : selectedTheme.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                            </span>
                          </>
                        ) : (
                          <>
                            <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span>Theme</span>
                          </>
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      side="top"
                      align="end"
                      className="w-64 max-w-[calc(100vw-2rem)] p-0 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900"
                    >
                      {/* Header */}
                      <div className="px-4 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-1">
                          <Palette className="w-4 h-4 text-slate-400" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Theme</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Auto-applied to your generated screens.
                        </p>
                      </div>

                      {/* Create custom */}
                      <button
                        type="button"
                        onClick={() => setIsThemeBuilderOpen(true)}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
                      >
                        <Plus className="w-4 h-4" />
                        Create brand theme
                      </button>

                      {/* Built-in presets */}
                      <div className="py-1 max-h-64 overflow-y-auto">
                        <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Presets</p>
                        {THEME_NAME_LIST.map((theme) => {
                          const t = THEMES[theme as keyof typeof THEMES]
                          const isActive = selectedTheme === theme
                          return (
                            <button
                              key={theme}
                              type="button"
                              onClick={() => setSelectedTheme(theme)}
                              className={cn(
                                'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all',
                                isActive
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                              )}
                            >
                              <div className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10 overflow-hidden relative">
                                <div className="absolute inset-0" style={{ background: `conic-gradient(${t.primary} 0deg 120deg, ${t.accent} 120deg 240deg, ${t.secondary} 240deg 360deg)` }} />
                              </div>
                              <span className="flex-1 text-left font-medium">
                                {theme.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                              </span>
                              {isActive && <Check className="w-3.5 h-3.5 text-slate-400" />}
                            </button>
                          )
                        })}

                        {customThemes.length > 0 && (
                          <>
                            <p className="px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 mt-1">Your themes</p>
                            {customThemes.map((ct) => {
                              const isActive = selectedTheme === ct.themeData
                              let primaryColor = '#888'
                              try { primaryColor = JSON.parse(ct.themeData.replace('CUSTOM:', '')).primary } catch { /* */ }
                              return (
                                <button
                                  key={ct.themeData}
                                  type="button"
                                  onClick={() => setSelectedTheme(ct.themeData)}
                                  className={cn(
                                    'flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-all',
                                    isActive
                                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                  )}
                                >
                                  <div className="w-5 h-5 rounded-full flex-shrink-0 ring-1 ring-black/10 dark:ring-white/10" style={{ background: primaryColor }} />
                                  <span className="flex-1 text-left font-medium">✨ {ct.themeName}</span>
                                  {isActive && <Check className="w-3.5 h-3.5 text-slate-400" />}
                                </button>
                              )
                            })}
                          </>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Submit */}
                  <button
                    type="button"
                    disabled={loading}
                    onClick={(e) => { e.stopPropagation(); handleSubmit() }}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:scale-105 active:scale-95 flex-shrink-0"
                    aria-label="Generate Designs"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <ArrowUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Category Cards */}
            <div className="max-w-4xl mx-auto mb-12 relative px-1 sm:px-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                {categories.map((category, index) => {
                  const Icon = category.icon
                  const colorClasses = getColorClasses(category.color)

                  return (
                    <div
                      key={category.name}
                      className="group cursor-pointer animate-slide-up-fade"
                      style={{ animationDelay: `${400 + index * 50}ms` }}
                      onClick={() => setUserInput(category.description)}
                    >
                      <div className={`${colorClasses.bg} ${colorClasses.hover} rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700`}>
                        <div className="flex justify-center mb-2 sm:mb-3">
                          <div className={`w-9 h-9 sm:w-12 sm:h-12 ${colorClasses.bg} rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                            <Icon className={`w-4 h-4 sm:w-6 sm:h-6 ${colorClasses.icon} transition-transform duration-300 group-hover:scale-110`} />
                          </div>
                        </div>
                        <h3 className="text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Your Projects Section */}
            <div className="animate-slide-up-fade mb-20" style={{ animationDelay: '800ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Your Projects
                </h2>
                {userProjects.length > 0 && (
                  <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-medium">
                    {userProjects.length} Projects
                  </span>
                )}
              </div>

              {fetchingProjects ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse border border-slate-200/50 dark:border-slate-700/50" />
                  ))}
                </div>
              ) : userProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProjects.map((project, index) => {
                    const themeColors = THEMES[project.theme as keyof typeof THEMES]
                    return (
                      <div
                        key={project.projectId}
                        onClick={() => router.push(`/project/${project.projectId}`)}
                        className="group bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-slate-700/60 p-0 cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col"
                      >
                        {/* Project Preview Image */}
                        <div className="h-40 w-full relative overflow-hidden border-b border-slate-100 dark:border-slate-700 group-hover:h-44 transition-all duration-500">
                          {project.logo ? (
                            <img
                              src={project.logo}
                              alt={project.projectName || 'Preview'}
                              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                            />
                          ) : (
                            <div
                              className="w-full h-full opacity-30 blur-2xl transition-all duration-500 group-hover:scale-150"
                              style={{ background: themeColors?.primary }}
                            />
                          )}

                          {/* Device Badge Overlay */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/20 shadow-sm z-20">
                            {project.device === 'MOBILE' ? <Smartphone className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> : <Laptop className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />}
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tight">{project.device}</span>
                          </div>

                          {/* Theme Badge Overlay */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-xl border border-white/20 shadow-sm z-20">
                            <div className="w-2 h-2 rounded-full" style={{ background: themeColors?.primary }} />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                              {project.theme?.split('_')[0]}
                            </span>
                          </div>
                        </div>

                        <div className="p-5 flex flex-col flex-1 relative z-10 bg-white/10">
                          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5 group-hover:text-primary transition-colors duration-300 truncate">
                            {project.projectName || 'Untitled Project'}
                          </h3>
                          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2 mb-4 leading-relaxed h-8">
                            {project.userInput}
                          </p>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                              <Calendar className="w-3 h-3" />
                              <span className="text-[10px] font-medium">
                                {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {[themeColors?.primary, themeColors?.secondary, themeColors?.accent].map((color, i) => (
                                <div key={i} className="w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" style={{ background: color }} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-6 sm:p-12 text-center hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 dark:text-slate-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">No projects found</h3>
                  <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500">Transform your creative spark into a stunning mockup right now!</p>
                </div>
              )}
            </div>
          </div>

          <ThemeBuilder
            isOpen={isThemeBuilderOpen}
            onClose={() => setIsThemeBuilderOpen(false)}
            baseTheme={parseTheme(selectedTheme)}
            onSave={(newThemeJson) => {
              setSelectedTheme(newThemeJson)
              // Refetch themes list
              fetchCustomThemes()
            }}
          />
        </section>
        )
}

        export default Hero