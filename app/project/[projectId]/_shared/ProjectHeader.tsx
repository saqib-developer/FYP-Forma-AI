import React, { useContext, useState, useEffect } from 'react'
import Logo from '@/data/Logo'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Play, Download, Camera, Share, MessageCircle } from 'lucide-react'
import html2canvas from 'html2canvas'
import { UserButton } from '@clerk/nextjs'
import { SettingContext } from '@/context/SettingContext'
import { ChatbotContext } from '@/context/ChatbotContext'
import axios from 'axios'
import { toast } from 'sonner'
import { ProjectType, ScreenConfigType } from '@/types/types'
import PrototypePlayer from '@/_shared/PrototypePlayer'
import { THEMES } from '@/data/Theme'

type Props = {
  screenConfig?: ScreenConfigType[]
  projectDetail?: ProjectType
}

const ProjectHeader = ({ screenConfig = [], projectDetail }: Props) => {
  const { settingDetails } = useContext(SettingContext)
  const { setIsOpen: setChatbotOpen } = useContext(ChatbotContext)
  const [loading, setLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const hasGeneratedScreens = screenConfig.some(s => !!s.code)
  const themeKey = projectDetail?.theme as keyof typeof THEMES
  const hasValidTheme = !!themeKey && !!THEMES[themeKey]

  const onSave = async () => {
    const details = settingDetails
    if (!details) {
      toast.error('No project details found to save')
      return
    }
    try {
      setLoading(true)
      await axios.put('/api/project', {
        projectName: details.projectName,
        theme: details.theme,
        projectId: details.projectId,
      })
      toast.success('Project saved successfully')
    } catch {
      toast.error('Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const onExport = async () => {
    if (!projectDetail?.projectId) return
    try {
      setIsExporting(true)
      const res = await axios.get(`/api/project/design-export?projectId=${projectDetail.projectId}`)
      const data = res.data

      // Download JSON
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const jsonUrl = URL.createObjectURL(jsonBlob)
      const jsonLink = document.createElement('a')
      jsonLink.href = jsonUrl
      jsonLink.download = `${projectDetail.projectName ?? 'design'}-tokens.json`
      jsonLink.click()
      URL.revokeObjectURL(jsonUrl)

      toast.success('Design tokens exported!')
    } catch {
      toast.error('Failed to export design system')
    } finally {
      setIsExporting(false)
    }
  }
  const handleScreenshot = async () => {
    try {
      setIsCapturing(true)
      const iframes = document.querySelectorAll('iframe')
      if (iframes.length === 0) {
        toast.error("No screens found to capture")
        setIsCapturing(false)
        return
      }

      toast.loading("Capturing project preview...", { id: 'screenshot-header' })

      const capturedImages: HTMLCanvasElement[] = []

      for (let i = 0; i < iframes.length; i++) {
        const iframe = iframes[i]
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) continue

        const body = doc.body
        const canvas = await html2canvas(body, {
          useCORS: true,
          scale: 0.5, // Scale down for performance and storage
          backgroundColor: '#ffffff'
        })
        capturedImages.push(canvas)
      }

      if (capturedImages.length === 0) {
        toast.dismiss('screenshot-header')
        setIsCapturing(false)
        return
      }

      // Stitch images together
      const gap = 40
      const totalWidth = capturedImages.reduce((acc, canvas) => acc + canvas.width, 0) + (capturedImages.length - 1) * gap
      const maxHeight = Math.max(...capturedImages.map(canvas => canvas.height))

      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = totalWidth + 100 // Padding
      finalCanvas.height = maxHeight + 100
      const ctx = finalCanvas.getContext('2d')
      if (!ctx) throw new Error("Could not get context")

      // Fill background
      ctx.fillStyle = '#f8fafc' // Slate 50
      ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

      let currentX = 50
      capturedImages.forEach((canvas) => {
        // Draw shadow
        ctx.shadowColor = 'rgba(0,0,0,0.1)'
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 10

        ctx.drawImage(canvas, currentX, 50)
        currentX += canvas.width + gap
      })

      const base64Image = finalCanvas.toDataURL('image/png')

      // Download
      const link = document.createElement('a')
      link.href = base64Image
      link.download = `${projectDetail?.projectName || 'project'}-mockup.png`
      link.click()

      // Save to DB
      await axios.put('/api/project', {
        projectId: projectDetail?.projectId,
        logo: base64Image
      })

      toast.success("Project screenshot saved and downloaded!", { id: 'screenshot-header' })
    } catch (error) {
      console.error("Screenshot error:", error)
      toast.error("Failed to capture screenshot", { id: 'screenshot-header' })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Project link copied to clipboard!")
    }
  }
  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 z-30 flex-shrink-0">
            <nav className="w-full px-2 sm:px-6 overflow-x-auto scrollbar-none">
              <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-4 min-w-max sm:min-w-0">
                {/* Logo on Left */}
                <div className="flex items-center flex-shrink-0">
                  <Logo />
                </div>

                {/* Action Buttons on Right */}
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-2.5 flex-shrink-0">
                    {/* Assistant */}
                    <Button
                      variant="outline"
                      size="sm"
                      title="Forma Assistant"
                      className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
                      onClick={() => setChatbotOpen(true)}
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="hidden xl:inline">Assistant</span>
                    </Button>

                    {/* Shot */}
                    {hasGeneratedScreens && (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Capture Screenshot"
                        className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
                        onClick={handleScreenshot}
                        disabled={isCapturing}
                      >
                        {isCapturing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />}
                        <span className="hidden lg:inline">Shot</span>
                      </Button>
                    )}

                    {/* Share */}
                    {hasGeneratedScreens && (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Share Project"
                        className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
                        onClick={handleShare}
                      >
                        <Share className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden lg:inline">Share</span>
                      </Button>
                    )}

                    {/* Export Design Tokens */}
                    {hasGeneratedScreens && (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Export Design Tokens"
                        className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex-shrink-0"
                        onClick={onExport}
                        disabled={isExporting}
                      >
                        {isExporting ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />}
                        <span className="hidden md:inline">Export</span>
                      </Button>
                    )}

                    {/* Play Prototype */}
                    {hasGeneratedScreens && hasValidTheme && (
                      <Button
                        variant="outline"
                        size="sm"
                        title="Play Prototype"
                        className="flex items-center gap-1.5 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-4 border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 flex-shrink-0"
                        onClick={() => setIsPlaying(true)}
                      >
                        <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current flex-shrink-0" />
                        <span className="hidden sm:inline">Play</span>
                      </Button>
                    )}

                    {/* Save */}
                    <Button
                      size="sm"
                      title="Save Project"
                      className="bg-rose-500 hover:bg-rose-600 cursor-pointer text-white font-medium text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex items-center gap-1.5 flex-shrink-0"
                      onClick={onSave}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="animate-spin w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />}
                      <span className="hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
                    </Button>

                    <div className="flex-shrink-0 flex items-center ml-0.5 sm:ml-1">
                      {mounted && <UserButton />}
                    </div>
                  </div>
                </div>
            </nav>
          </header>

          {/* Prototype Player Overlay */}
          {isPlaying && projectDetail && (
            <PrototypePlayer
              screenConfig={screenConfig}
              projectDetail={projectDetail}
              onClose={() => setIsPlaying(false)}
            />
          )}
        </>
        )
}

        export default ProjectHeader