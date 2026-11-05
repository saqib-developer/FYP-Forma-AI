import React, { useContext, useState } from 'react'
import { ScreenConfigType } from '@/types/types'
import { Code2Icon, GripVertical, Copy, Check, Terminal, Minus, Plus, Download, MoreVertical, Trash, SparkleIcon, Loader2, Lock, Wand2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SyntaxHighlighter from 'react-syntax-highlighter';
import { nightOwl } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toast } from 'sonner'
import { htmlWrapper } from '@/data/constants'
import { cn } from '@/lib/utils'
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button"
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios';
import { RefreshDataContext } from '@/context/RefreshDataContext';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from '@/components/ui/textarea';

import { Theme } from '@/data/Theme'
import DesignReviewSheet from './DesignReviewSheet'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'

type Props = {
  screen: ScreenConfigType,
  theme: Theme,
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  projectId: string,
  projectVisualDescription: string | undefined
}

const ScreenHandler = ({ screen, theme, iframeRef, projectId, projectVisualDescription }: Props) => {
  const { has } = useAuth();
  const router = useRouter();
  const isPro = has ? has({ plan: 'pro' }) : false;

  const [copied, setCopied] = React.useState(false)
  const [fontSize, setFontSize] = useState(13)
  const [reviewOpen, setReviewOpen] = useState(false)
  const htmlCode = htmlWrapper(theme, screen?.code);
  const { refreshData, setRefreshData } = useContext(RefreshDataContext)
  const [userInput, setUserInput] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleRegenerate = async () => {
    try {
      setLoading(true)
      const res = await axios.post('/api/edit-screen', {
        projectId: projectId,
        screenId: screen?.screenId,
        oldCode: screen?.code,
        userInput: userInput,
        projectVisualDescription: projectVisualDescription
      })
      setLoading(false)
      setRefreshData({ method: 'screenConfig', date: Date.now() })
      toast.success("Screen regenerated successfully")
    } catch (error) {
      setLoading(false)
      toast.error("Failed to regenerate screen")
    }
  }

  const handleCopy = () => {
    if (screen?.code) {
      navigator.clipboard.writeText(htmlCode)
      setCopied(true)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }
  // Memoize the code block so it doesn't re-render/re-parse on every font size change
  const codeBlock = React.useMemo(() => (
    <SyntaxHighlighter
      language="html"
      style={nightOwl}
      showLineNumbers={true}
      lineNumberStyle={{ color: '#7d909fff', minWidth: '2.5em' }}
      customStyle={{
        margin: 0,
        padding: '10px',
        fontSize: 'inherit', // Inherit from parent for smooth zoom
        lineHeight: '1.6',
        background: 'transparent',
        fontFamily: '"Fira Code", "Fira Mono", monospace',
        color: "#7d909fff",
      }}
    >
      {htmlCode || ''}
    </SyntaxHighlighter>
  ), [screen?.code])

  const takeIframeScreenshot = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument;
      if (!doc) return;

      const body = doc.body;

      // wait one frame to ensure layout is stable
      await new Promise((res) => requestAnimationFrame(res));

      const canvas = await html2canvas(body, {
        backgroundColor: null,
        useCORS: true,
        scale: window.devicePixelRatio || 1,
      });

      const image = canvas.toDataURL("image/png");

      // download automatically
      const link = document.createElement("a");
      link.href = image;
      link.download = `${screen?.screenName as string || "screen"}.png`;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  const onDelete = async () => {
    const res = await axios.delete(`/api/generate-config?projectId=${projectId}&screenId=${screen?.screenId}`)
    setRefreshData({ method: 'screenConfig', date: Date.now() })
    toast.success("Screen deleted successfully")

  }

  const handleSourceCodeClick = (e: React.MouseEvent) => {
    if (!isPro) {
      e.preventDefault();
      toast.error("Source code is a Premium Feature", {
        description: "Upgrade to Pro to view and export your screen source code.",
        action: {
          label: "Upgrade",
          onClick: () => router.push('/pricing')
        }
      })
    }
  }

  return (
    <TooltipProvider>
          <div className='absolute -top-14 sm:-top-16 left-0 right-0 flex justify-between items-center w-full px-1 sm:px-2 z-20 gap-2'>
            <div className='drag-handle cursor-move flex items-center gap-1.5 sm:gap-2.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200/60 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex-shrink min-w-0'>
              <GripVertical className='h-4 w-4 sm:h-5 sm:w-5 text-slate-400 flex-shrink-0' />
              <h2 className='text-xs sm:text-sm md:text-base font-bold text-slate-800 tracking-tight truncate max-w-[110px] sm:max-w-[200px] md:max-w-[320px]'>{screen?.screenName || 'Untitled Screen'}</h2>
            </div>

              <div className='flex items-center gap-1 sm:gap-1.5 bg-white/90 backdrop-blur shadow-sm border border-slate-200/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl flex-shrink-0'>
                <Dialog>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DialogTrigger asChild>
                        <Button
                          variant='ghost'
                          onClick={handleSourceCodeClick}
                          className='h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-200/50 rounded-lg sm:rounded-xl transition-all group flex items-center justify-center relative p-0'
                        >
                          <Code2Icon className={cn('h-4 w-4 sm:h-4.5 sm:w-4.5 transition-colors', isPro ? 'text-slate-600 group-hover:text-primary' : 'text-slate-400')} />
                          {!isPro && (
                            <div className='absolute -top-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-0.5 shadow-sm border border-slate-100'>
                              <Lock className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-rose-500' />
                            </div>
                          )}
                        </Button>
                      </DialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={10} className="font-medium">Source Code</TooltipContent>
                  </Tooltip>
                  {/* ... Dialog Content ... */}
                          <DialogContent className='w-full max-w-[95vw] sm:max-w-[85vw] lg:max-w-[75vw] h-[85vh] sm:h-[90vh] p-0 gap-0 overflow-hidden border-none bg-[#011627]'>
                            <DialogHeader className='p-3 sm:p-4 border-b border-slate-800 flex flex-row items-center justify-between bg-[#011627] z-10'>
                              <div className='flex items-center gap-2 sm:gap-3'>
                                <div className='flex gap-1.5 mr-1 sm:mr-2'>
                                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500/80' />
                                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-amber-500/80' />
                                  <div className='w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80' />
                                </div>
                                  <DialogTitle className='text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 sm:gap-2 truncate max-w-[150px] sm:max-w-none'>
                                    <Terminal className='w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0' /> {screen?.screenName}.html
                                  </DialogTitle>
                              </div>

                                <div className='flex items-center gap-2 sm:gap-4 mr-7 sm:mr-8'>
                                  {/* Zoom Controls */}
                                    <div className='flex items-center bg-slate-800 rounded-lg p-0.5 sm:p-1 border border-slate-700'>
                                      <Button
                                        variant='ghost'
                                        size='icon'
                                        className='h-6 w-6 sm:h-7 sm:w-7 text-slate-400 hover:text-slate-600'
                                        onClick={() => setFontSize(prev => Math.max(prev - 1, 8))}
                                      >
                                        <Minus className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
                                      </Button>
                                        <span className='text-[10px] font-bold text-slate-500 px-1 sm:px-2 min-w-[3ch] text-center'>
                                          {fontSize}px
                                        </span>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-6 w-6 sm:h-7 sm:w-7 text-slate-400 hover:text-slate-600'
                                          onClick={() => setFontSize(prev => Math.min(prev + 1, 24))}
                                        >
                                          <Plus className='w-3 h-3 sm:w-3.5 sm:h-3.5' />
                                        </Button>
                                    </div>

                                    <Button
                                      variant='outline'
                                      size='sm'
                                      onClick={handleCopy}
                                      className='bg-transparent text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition-all h-7 sm:h-8 px-2 sm:px-3 text-xs gap-1.5 sm:gap-2 font-medium'
                                    >
                                      {copied ? <Check className='w-3.5 h-3.5' /> : <Copy className='w-3.5 h-3.5' />}
                                      <span className='hidden sm:inline'>{copied ? 'Copied' : 'Copy Code'}</span>
                                    </Button>
                                  </div>
                                </DialogHeader>

                                <div className='flex-1 overflow-auto bg-[#011627] relative custom-scrollbar transition-all duration-200' style={{ fontSize: `${fontSize}px` }}>
                                  {codeBlock}
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  className='h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-transparent text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all flex items-center justify-center rounded-lg sm:rounded-xl p-0'
                                  onClick={takeIframeScreenshot}
                                >
                                  <Download className='h-4 w-4 sm:h-4.5 sm:w-4.5' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={10} className="font-medium">Download Screenshot</TooltipContent>
                            </Tooltip>

                            {/* Review Design */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant='ghost'
                                  className='h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-transparent text-violet-500 hover:bg-violet-500/10 hover:text-violet-600 transition-all flex items-center justify-center rounded-lg sm:rounded-xl p-0'
                                  onClick={() => setReviewOpen(true)}
                                >
                                  <Wand2 className='h-4 w-4 sm:h-4.5 sm:w-4.5' />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={10} className="font-medium">AI Design Review</TooltipContent>
                            </Tooltip>

                            <Popover>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <PopoverTrigger asChild>
                                      <Button variant='ghost' className='h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-transparent text-indigo-500 hover:bg-indigo-500/10 hover:text-indigo-600 transition-all flex items-center justify-center rounded-lg sm:rounded-xl p-0'>
                                        <SparkleIcon className='h-4 w-4 sm:h-4.5 sm:w-4.5' />
                                      </Button>
                                  </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={10} className="font-medium">Magic Edit</TooltipContent>
                              </Tooltip>
                                <PopoverContent className='w-72 sm:w-80'>
                                  <PopoverHeader>
                                    <PopoverDescription className='mb-2 ml-1 text-xs font-semibold'>Edit Screen</PopoverDescription>
                                  </PopoverHeader>
                                  <div>
                                    <Textarea className='text-xs sm:text-sm' placeholder='What changes do you want?' value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                                    <Button className='mt-2 h-8 text-xs' size={'sm'} onClick={() => handleRegenerate()} disabled={loading}>{loading ? <Loader2 className='h-3.5 w-3.5 animate-spin mr-1.5' /> : <SparkleIcon className='h-3.5 w-3.5 mr-1.5' />}Regenerate</Button>
                                  </div>
                                </PopoverContent>
                            </Popover>

                            <DropdownMenu>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className='h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-transparent text-slate-500 hover:bg-slate-200/50 transition-all flex items-center justify-center rounded-lg sm:rounded-xl p-0'>
                                        <MoreVertical className='h-4 w-4 sm:h-4.5 sm:w-4.5' />
                                      </Button>
                                  </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={10} className="font-medium">More Options</TooltipContent>
                              </Tooltip>
                              <DropdownMenuContent>
                                <DropdownMenuItem variant='destructive' className='text-white cursor-pointer' onClick={() => onDelete()}><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </div>

                      <DesignReviewSheet
                        screen={screen}
                        theme={theme}
                        projectId={projectId}
                        open={reviewOpen}
                        onOpenChange={setReviewOpen}
                      />
                    </TooltipProvider>
                    )
}

                    export default ScreenHandler