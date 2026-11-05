'use client'

import { TransformWrapper, TransformComponent, useControls, ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import React, { useState, useRef, useEffect } from 'react'
import ScreenFrame from "./ScreenFrame";
import ScreenSkeleton from "./ScreenSkeleton";
import { ProjectType, ScreenConfigType } from "@/types/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, RefreshCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
    projectDetail: ProjectType | undefined;
    screenConfig: ScreenConfigType[];
    loading?: boolean;
    generatingScreenId?: string | null;
}

const Canvas = ({projectDetail, screenConfig, loading, generatingScreenId}: Props) => {
  const [panningEnabled, setPanningEnabled] = useState(true);
  const [currentScale, setCurrentScale] = useState(0.5);
  const isMobile = projectDetail?.device === 'MOBILE';
  const SCREEN_WIDTH = isMobile ? 400 : 1200;
  const SCREEN_HEIGHT = isMobile ? 844 : 900;
  const gap = isMobile ? 10 : 70;
  const Y_OFFSET = 75;
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const centerScreen = (
    index: number, 
    setTransformFn?: (x: number, y: number, scale: number, animTime?: number) => void
  ) => {
    const fn = setTransformFn || transformRef.current?.setTransform;
    if (!fn) return;
    const containerW = containerRef.current?.clientWidth || window.innerWidth;
    const containerH = containerRef.current?.clientHeight || window.innerHeight;
    const scale = isMobile ? 0.75 : 0.6;
    const screenCenterX = index * (SCREEN_WIDTH + gap) + SCREEN_WIDTH / 2;
    const screenCenterY = Y_OFFSET + SCREEN_HEIGHT / 2;
    const xPos = (containerW / 2) - (screenCenterX * scale);
    const yPos = (containerH / 2) - (screenCenterY * scale);
    fn(xPos, yPos, scale, 300);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NAVIGATE_TO_SCREEN') {
        const targetScreenId = event.data.targetScreenId;
        const index = screenConfig.findIndex(s => s.screenId === targetScreenId);
        if (index !== -1) {
          centerScreen(index);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [screenConfig, SCREEN_WIDTH, gap]);

  const Controls = ({ scale = 0.5 }: { scale?: number }) => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
        <div className="flex items-center gap-1 bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg px-1.5 py-1 rounded-lg border border-white/30 dark:border-white/10 shadow-sm flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              title="Zoom In"
              onClick={() => zoomIn()} 
              className="h-7 w-7 rounded-md hover:bg-white/40 dark:hover:bg-slate-700 transition-colors"
            >
                <Plus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
            </Button>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 min-w-[34px] text-center select-none">
                {Math.round((scale || 0.5) * 100)}%
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              title="Zoom Out"
              onClick={() => zoomOut()} 
              className="h-7 w-7 rounded-md hover:bg-white/40 dark:hover:bg-slate-700 transition-colors"
            >
                <Minus className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
            </Button>
            <div className="w-[1px] h-3.5 bg-slate-400/30 mx-0.5" />
            <Button 
              variant="ghost" 
              size="icon" 
              title="Reset Zoom"
              onClick={() => resetTransform()} 
              className="h-7 w-7 rounded-md hover:bg-white/40 dark:hover:bg-slate-700 transition-colors"
            >
                <RefreshCcw className="w-3 h-3 text-slate-700 dark:text-slate-200" />
            </Button>
        </div>
    );
  };

  const ScreenNavigator = ({ scale }: { scale: number }) => {
    const { setTransform } = useControls();
    if (screenConfig.length === 0) return null;

    return (
      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-xl border border-white/40 dark:border-white/10 shadow-2xl max-w-[calc(100%-1.5rem)]">
        <div className="flex-shrink-0">
          <Controls scale={scale} />
        </div>
        
        <div className="w-[1px] h-5 bg-slate-400/20 flex-shrink-0" />

        <div className="flex gap-1 overflow-x-auto scrollbar-hide py-0.5 px-1 max-w-full">
            {screenConfig.map((screen, index) => (
            <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={() => centerScreen(index, setTransform)}
                className="whitespace-nowrap flex items-center gap-1.5 hover:bg-white/40 dark:hover:bg-slate-800 transition-all rounded-lg border border-transparent hover:border-white/20 px-2 py-0.5 h-7 group flex-shrink-0"
            >
                <div className="w-4 h-4 bg-primary/20 rounded-md flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                    <span className="text-[8px] font-bold text-primary">{index + 1}</span>
                </div>
                <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate max-w-[80px] sm:max-w-[110px] leading-none text-nowrap">
                        {screen?.screenName || `Screen ${index + 1}`}
                    </span>
                </div>
            </Button>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div 
        ref={containerRef}
        className="w-full h-full bg-gray-100 dark:bg-slate-950 overflow-hidden relative"
        style={{
            backgroundImage: "radial-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
        }}
    >
        <TransformWrapper
            ref={transformRef}
            initialScale={0.5}
            minScale={0.05}
            maxScale={3}
            centerOnInit={true}
            limitToBounds={false}
            wheel={{ step: 0.08, smoothStep: 0.003 }}
            doubleClick={{ disabled: false }}
            panning={{ disabled: !panningEnabled, velocityDisabled: false }}
            velocityAnimation={{ sensitivity: 1, animationTime: 400, equalToMove: true }}
            onInit={(ref) => setCurrentScale(ref.state.scale)}
            onTransformed={(_, state) => setCurrentScale(state.scale)}
        >
            {() => (
        <>
            <ScreenNavigator scale={currentScale} />
            <TransformComponent
                wrapperStyle={{width:'100%', height:'100%'}}
            >
                <div 
                  className="flex relative" 
                  style={{ 
                    width: Math.max(screenConfig.length * (SCREEN_WIDTH + gap), SCREEN_WIDTH),
                    minHeight: SCREEN_HEIGHT + 180,
                    height: SCREEN_HEIGHT + 180
                  }}
                >
                {screenConfig.map((screen, index) => (
                    <React.Fragment key={index}>
                        {screen?.code ? (
                            <ScreenFrame
                                x={index * (SCREEN_WIDTH + gap)}
                                y={Y_OFFSET}
                                height={SCREEN_HEIGHT}
                                width={SCREEN_WIDTH}
                                scale={currentScale}
                                setPanningEnabled={setPanningEnabled}
                                html={screen?.code}
                                projectDetail={projectDetail}
                                screen={screen}
                            />
                        ) : (
                            <ScreenSkeleton
                                x={index * (SCREEN_WIDTH + gap)}
                                y={Y_OFFSET}
                                width={SCREEN_WIDTH}
                                height={SCREEN_HEIGHT}
                                screenName={screen.screenName}
                                purpose={screen.purpose}
                                isGenerating={generatingScreenId === screen.screenId}
                            />
                        )}
                    </React.Fragment>
                ))}
                </div>
            </TransformComponent>
            </>
        )}
        </TransformWrapper>

        {/* Loading overlay — shown while project is loading and no screens exist yet */}
        {loading && screenConfig.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-gray-100/80 backdrop-blur-sm z-30">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-semibold text-base">Creating your project</p>
                <p className="text-slate-400 text-sm mt-1">AI is designing your screens...</p>
              </div>
            </div>
            {/* Skeleton preview cards */}
            <div className="flex gap-4 opacity-40">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-48 h-72 rounded-2xl bg-white shadow-md overflow-hidden"
                  style={{ opacity: 1 - i * 0.25, transform: `scale(${1 - i * 0.05})` }}
                >
                  <div className="h-8 bg-slate-100 border-b border-slate-200" />
                  <div className="p-3 space-y-2.5">
                    <div className="h-3 w-3/4 bg-slate-200 rounded-full animate-pulse" />
                    <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                    <div className="h-3 w-full bg-slate-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    <div className="h-3 w-4/5 bg-slate-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 120}ms` }} />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                      <div className="h-10 bg-slate-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 90}ms` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

export default Canvas