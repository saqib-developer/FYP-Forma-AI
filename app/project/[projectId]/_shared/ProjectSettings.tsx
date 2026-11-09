'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SettingContext } from '@/context/SettingContext'
import { THEME_NAME_LIST, THEMES } from '@/data/Theme'
import { ProjectType, ScreenConfigType } from '@/types/types'
import { Sparkle, ChevronLeft, ChevronRight, Layout, Palette, PlusCircle, Loader2 } from 'lucide-react'
import React, { useContext, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { toast } from 'sonner'
import { RefreshDataContext } from '@/context/RefreshDataContext'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ThemeBuilder from '@/components/custom/ThemeBuilder'
import { parseTheme } from '@/data/Theme'

type Props = {
  projectDetail: ProjectType | undefined
  screenConfig: ScreenConfigType[]
}

const ProjectSettings = ({ projectDetail, screenConfig }: Props) => {
  const [selectedTheme, setSelectedTheme] = useState('AURORA_INK')
  const [projectName, setProjectName] = useState(projectDetail?.projectName)
  const [userInput, setUserInput] = useState('')
  const [targetScreen, setTargetScreen] = useState('new-screen')
  const [loading, setLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { settingDetails, setSettingDetails } = useContext(SettingContext)
  const { refreshData, setRefreshData } = useContext(RefreshDataContext)

  const [isThemeBuilderOpen, setIsThemeBuilderOpen] = useState(false)
  const [customThemes, setCustomThemes] = useState<{ themeName: string, themeData: string }[]>([])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }, [])

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await axios.get('/api/user/themes')
        setCustomThemes(Array.isArray(res.data) ? res.data : [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchThemes()
  }, [])

  useEffect(() => {
    if (projectDetail) {
      setProjectName(projectDetail?.projectName)
      setSelectedTheme(projectDetail?.theme as string)
    }
  }, [projectDetail])

  const onThemeSelect = (theme: string) => {
    setSelectedTheme(theme)
    setSettingDetails((prev: ProjectType | null) => {
      if (!prev) return null;
      return {
        ...prev,
        theme: theme
      };
    })
  }



  const handleGenerateOrEdit = async () => {
    if (!userInput.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    try {
      setLoading(true);

      if (targetScreen === 'new-screen') {
        toast.loading("Generating screen configuration...", { id: 'sidebar-action' });
        await axios.post('/api/generate-new-screen', {
          projectId: projectDetail?.projectId,
          userInput: userInput,
        });
        toast.success("New screen configuration created! Generating UI...", { id: 'sidebar-action' });
      } else {
        toast.loading("Regenerating screen UI...", { id: 'sidebar-action' });
        const selectedScreen = screenConfig.find(s => s.screenId === targetScreen);
        if (!selectedScreen) {
          toast.error("Selected screen not found", { id: 'sidebar-action' });
          setLoading(false);
          return;
        }

        await axios.post('/api/edit-screen', {
          projectId: projectDetail?.projectId,
          screenId: selectedScreen.screenId,
          oldCode: selectedScreen.code,
          userInput: userInput,
        });
        toast.success("Screen updated successfully!", { id: 'sidebar-action' });
      }

      setUserInput('');
      setRefreshData({ method: 'screenConfig', date: Date.now() });
    } catch (error) {
      console.error("Sidebar action error:", error);
      toast.error("Action failed. Please try again.", { id: 'sidebar-action' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn(
      'transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 h-full bg-white dark:bg-slate-900 relative flex flex-col pt-3 flex-shrink-0 z-20',
      isCollapsed ? 'w-14 sm:w-16 md:w-20' : 'w-[85vw] max-w-[280px] sm:w-[280px] max-md:absolute max-md:inset-y-0 max-md:left-0 max-md:shadow-2xl'
    )}>
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className='absolute -right-3 top-6 sm:top-8 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full p-1 shadow-md hover:scale-110 transition-all z-30 cursor-pointer'
      >
        {isCollapsed ? <ChevronRight className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300' /> : <ChevronLeft className='w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600 dark:text-slate-300' />}
      </button>

      <div className={cn(
        'flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-4'
      )}>
        {/* Project Name Section */}
        <div className={cn('transition-all duration-300', isCollapsed ? 'opacity-100 flex justify-center mt-2 px-1' : 'mt-2 px-3 sm:px-5')}>
          {!isCollapsed ? (
            <>
              <h2 className='text-xs sm:text-sm mb-1 font-medium flex items-center gap-2'>
                <Layout className='w-3.5 h-3.5 sm:w-4 sm:h-4' /> Project Name
              </h2>
              <Input
                placeholder='Project Name'
                className='h-8 sm:h-9 text-xs sm:text-sm'
                value={projectName || ""}
                onChange={(e) => {
                  setProjectName(e.target.value)
                  setSettingDetails((prev: ProjectType | null) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      projectName: e.target.value
                    };
                  })
                }}
              />
            </>
          ) : (
            <div className='p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group relative cursor-pointer'>
              <Layout className='w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300' />
              <div className='absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl'>
                {projectName || 'Project Name'}
              </div>
            </div>
          )}
        </div>

        {/* Generate Screen Section */}
        <div className={cn('transition-all duration-300', isCollapsed ? 'flex justify-center mt-6 px-1' : 'mt-6 px-3 sm:px-5')}>
          {!isCollapsed ? (
            <>
              <h2 className='text-xs sm:text-sm mb-1.5 font-medium flex items-center gap-2'>
                <PlusCircle className='w-3.5 h-3.5 sm:w-4 sm:h-4' /> Target Screen
              </h2>
              <Select value={targetScreen} onValueChange={(val) => setTargetScreen(val)}>
                <SelectTrigger className="w-full h-8 sm:h-9 text-xs sm:text-sm mb-2.5">
                  <SelectValue placeholder="Select target screen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new-screen">Generate New Screen</SelectItem>
                  {screenConfig && screenConfig.map((screen, index) => (
                    <SelectItem key={`${screen.screenId}-${index}`} value={screen.screenId}>
                      Edit: {screen.screenName || 'Untitled Screen'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <h2 className='text-xs sm:text-sm mb-1.5 font-medium flex items-center gap-2'>
                <Sparkle className='w-3.5 h-3.5 sm:w-4 sm:h-4' /> AI Prompt Instructions
              </h2>
              <Textarea
                placeholder={
                  targetScreen === 'new-screen'
                    ? 'Describe the new screen you want to add...'
                    : 'Describe the changes you want to apply to this screen...'
                }
                className='text-xs sm:text-sm min-h-[85px] sm:min-h-[100px] resize-none'
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <Button
                size={'sm'}
                onClick={handleGenerateOrEdit}
                disabled={loading}
                className='mt-3 w-full h-8 sm:h-9 text-xs sm:text-sm bg-primary hover:bg-primary/90 text-white shadow-sm transition-all'
              >
                {loading ? (
                  <Loader2 className='w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2 animate-spin' />
                ) : (
                  <Sparkle className='w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2' />
                )}
                {targetScreen === 'new-screen' ? 'Generate Screen' : 'Edit Screen'}
              </Button>
            </>
          ) : (
            <div
              className='p-2 bg-primary/10 rounded-lg group relative cursor-pointer hover:bg-primary/20 transition-colors'
              onClick={() => setIsCollapsed(false)}
            >
              <Sparkle className='w-5 h-5 sm:w-6 sm:h-6 text-primary' />
              <div className='absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl'>
                {targetScreen === 'new-screen' ? 'Generate Screen' : 'Edit Screen'}
              </div>
            </div>
          )}
        </div>

        {/* Themes Section */}
        <div className={cn('flex flex-col transition-all duration-300', isCollapsed ? 'items-center mt-6 px-1' : 'mt-6 px-3 sm:px-5')}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <h2 className='text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2'>
                  <Palette className='w-3.5 h-3.5 sm:w-4 sm:h-4' /> Themes
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 sm:h-8 text-[11px] sm:text-xs border-dashed text-slate-500 hover:text-primary hover:border-primary flex items-center gap-1 px-2"
                  onClick={() => setIsThemeBuilderOpen(true)}
                >
                  <PlusCircle className="w-3 h-3" />
                  New
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="built-in" className="border-b-0">
                  <AccordionTrigger className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:no-underline py-2">
                    Built-in Themes
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-0">
                    <div className='overflow-y-auto pr-1 space-y-2 max-h-[200px] sm:max-h-[220px] scrollbar-thin scrollbar-thumb-slate-200'>
                      {THEME_NAME_LIST.map((theme, index) => (
                        <div
                          className={cn(
                            'border rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all duration-200',
                            theme === selectedTheme
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-800/40'
                          )}
                          onClick={() => onThemeSelect(theme)}
                          key={`default-${index}`}
                        >
                          <h3 className={cn('mb-1.5 sm:mb-2 text-[10px] font-bold uppercase tracking-wider', theme === selectedTheme ? 'text-primary' : 'text-slate-500')}>
                            {theme.replace('_', ' ')}
                          </h3>
                          <div className='flex gap-1.5'>
                            <div className='w-3 h-3 rounded-full' style={{ background: THEMES[theme]?.primary }} />
                            <div className='w-3 h-3 rounded-full' style={{ background: THEMES[theme]?.secondary }} />
                            <div className='w-3 h-3 rounded-full' style={{ background: THEMES[theme]?.accent }} />
                            <div className='w-3 h-3 rounded-full border border-slate-100' style={{ background: THEMES[theme]?.background }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {customThemes.length > 0 && (
                  <AccordionItem value="custom" className="border-b-0 mt-1">
                    <AccordionTrigger className="text-xs font-semibold text-slate-500 uppercase tracking-wider hover:no-underline py-2">
                      Custom Themes
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-0">
                      <div className='overflow-y-auto pr-1 space-y-2 max-h-[200px] sm:max-h-[220px] scrollbar-thin scrollbar-thumb-slate-200'>
                        {customThemes.map((ct, index) => {
                          const parsed = parseTheme(ct.themeData)
                          return (
                            <div
                              className={cn(
                                'border rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all duration-200',
                                ct.themeData === selectedTheme
                                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                  : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-800/40'
                              )}
                              onClick={() => onThemeSelect(ct.themeData)}
                              key={`custom-${index}`}
                            >
                              <h3 className={cn('mb-1.5 sm:mb-2 text-[10px] font-bold uppercase tracking-wider', ct.themeData === selectedTheme ? 'text-primary' : 'text-slate-500')}>
                                {ct.themeName}
                              </h3>
                              <div className='flex gap-1.5'>
                                <div className='w-3 h-3 rounded-full' style={{ background: parsed.primary }} />
                                <div className='w-3 h-3 rounded-full' style={{ background: parsed.secondary }} />
                                <div className='w-3 h-3 rounded-full' style={{ background: parsed.accent }} />
                                <div className='w-3 h-3 rounded-full border border-slate-100' style={{ background: parsed.background }} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </>
          ) : (
            <div className='flex flex-col gap-3 sm:gap-4 items-center'>
              <div className='p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'>
                <Palette className='w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300' />
                <div className='absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl'>
                  Change Theme
                </div>
              </div>
              <div
                className='p-2 bg-slate-50 dark:bg-slate-800 rounded-lg group relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors'
                onClick={() => setIsThemeBuilderOpen(true)}
              >
                <PlusCircle className='w-5 h-5 sm:w-6 sm:h-6 text-slate-600 dark:text-slate-300' />
                <div className='absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl'>
                  Create Theme
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ThemeBuilder
        isOpen={isThemeBuilderOpen}
        onClose={() => setIsThemeBuilderOpen(false)}
        baseTheme={parseTheme(selectedTheme)}
        onSave={(newThemeJson) => {
          onThemeSelect(newThemeJson)
          // Refetch custom themes to include the new one in the list
          axios.get('/api/user/themes')
            .then(res => setCustomThemes(Array.isArray(res.data) ? res.data : []))
            .catch(e => console.error(e))
        }}
      />
    </div>
  )
}

export default ProjectSettings