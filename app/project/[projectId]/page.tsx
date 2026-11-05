'use client'
import { useContext, useEffect, useState, useRef } from 'react'
import ProjectHeader from './_shared/ProjectHeader'
import ProjectSettings from './_shared/ProjectSettings'
import axios from 'axios'
import { useParams } from 'next/navigation'
import { ProjectType, ScreenConfigType } from '@/types/types'
import Loading from '@/components/custom/Loading'
import Canvas from '@/_shared/Canvas'
import { SettingContext } from '@/context/SettingContext'
import { RefreshDataContext } from '@/context/RefreshDataContext'

const ProjectCanvasPlayground = () => {
  const [projectDetail, setProjectDetail] = useState<ProjectType>()
  const { settingDetails, setSettingDetails } = useContext(SettingContext)
  const { refreshData, setRefreshData } = useContext(RefreshDataContext)
  const [loading, setLoading] = useState(true)
  const [generatingScreenId, setGeneratingScreenId] = useState<string | null>(null)
  const [screenConfigOriginal, setScreenConfigOriginal] = useState<ScreenConfigType[]>([])
  const [screenConfig, setScreenConfig] = useState<ScreenConfigType[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const hasCreatedScreens = useRef(false)
  const { projectId } = useParams()

  useEffect(() => {
    projectId && getProjectDetail()
  }, [projectId])

  useEffect(() => {
    if (refreshData?.method === 'screenConfig') {
      getProjectDetail()
    }
  }, [refreshData])

  const getProjectDetail = async () => {
    setLoading(true)
    const res = await axios.get('/api/project?projectId=' + projectId)
    console.log(res?.data)
    setProjectDetail(res?.data.projectDetails)
    setSettingDetails(res?.data.projectDetails)
    setScreenConfigOriginal(res?.data.screenConfig)
    setScreenConfig(res?.data.screenConfig)
    setLoading(false)
  }

  useEffect(() => {
    if (projectDetail && screenConfigOriginal && screenConfigOriginal.length === 0 && !hasCreatedScreens.current) {
      hasCreatedScreens.current = true
      createScreenConfig()
    }
    else if (projectDetail && screenConfigOriginal && screenConfigOriginal.length > 0 && !isGenerating) {
      const hasMissingCode = screenConfigOriginal.some(screen => !screen.code);
      if (hasMissingCode) {
        GenerateScreenUI()
      }
    }
  }, [projectDetail, screenConfigOriginal, isGenerating])

  const createScreenConfig = async () => {
    setLoading(true)
    const res = await axios.post('/api/generate-config', {
      projectId: projectId as string,
      userInput: projectDetail?.userInput,
      device: projectDetail?.device,
    })
    console.log(res?.data)
    getProjectDetail()
  }

  const GenerateScreenUI = async () => {
    setIsGenerating(true)

    for (let index = 0; index < screenConfig?.length; index++) {
      const screen = screenConfig[index]
      if (screen?.code) continue;

      setGeneratingScreenId(screen?.screenId || null)

      try {
        const res = await axios.post('/api/generate-screen-ui', {
          projectId: projectId as string,
          screenId: screen?.screenId,
          screenName: screen?.screenName,
          purpose: screen?.purpose,
          screenDescription: screen?.screenDescription,
        })
        console.log("Generated Screen Data:", res?.data)

        // Update local state immediately so user sees progress
        setScreenConfig((prev) =>
          prev.map((item) => (item.screenId === res.data.screenId ? res.data : item))
        )
      } catch (error) {
        console.error("Error generating screen UI:", error)
      }
    }

    setGeneratingScreenId(null)
    setIsGenerating(false)
  }

  return (
    <div className='h-screen h-[100dvh] flex flex-col overflow-hidden w-full'>
      <ProjectHeader screenConfig={screenConfig} projectDetail={projectDetail} />
      <div className="flex flex-1 overflow-hidden relative">
        {loading && !projectDetail && <Loading loading={true} message="Loading Project Details..." />}
        <ProjectSettings projectDetail={projectDetail} screenConfig={screenConfig} />
        <div className="flex-1 transition-all duration-300 overflow-hidden relative">
          <Canvas
            projectDetail={projectDetail}
            screenConfig={screenConfig}
            loading={loading}
            generatingScreenId={generatingScreenId}
          />
        </div>
      </div>
    </div>
  )
}

export default ProjectCanvasPlayground