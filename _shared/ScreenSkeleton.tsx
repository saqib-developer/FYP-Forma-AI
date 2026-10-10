import React from 'react'

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  screenName: string;
  purpose?: string;
  isGenerating?: boolean;
}

const ScreenSkeleton = ({ x, y, width, height, screenName, isGenerating = true }: Props) => {
  return (
    <div
      className="absolute border border-slate-200/80 rounded-[2rem] overflow-hidden bg-slate-50"
      style={{ left: x, top: y, width, height }}
    >
      {/* Shimmer overlay */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_infinite] -translate-x-full' />

      {/* Skeleton content */}
      <div className='p-6 flex flex-col gap-4 h-full'>
        {/* Header row */}
        <div className='flex items-center justify-between'>
          <div className='h-4 w-24 bg-slate-200 rounded-full' />
          <div className='h-7 w-7 bg-slate-200 rounded-full' />
        </div>

        {/* Hero block */}
        <div className='h-40 w-full bg-slate-200 rounded-2xl' />

        {/* Content lines */}
        <div className='space-y-2.5'>
          <div className='h-3 w-full bg-slate-200 rounded-full' />
          <div className='h-3 w-4/5 bg-slate-200 rounded-full' />
          <div className='h-3 w-3/5 bg-slate-200 rounded-full' />
        </div>

        {/* Card grid */}
        <div className='grid grid-cols-2 gap-3 mt-2'>
          <div className='h-24 bg-slate-200 rounded-2xl' />
          <div className='h-24 bg-slate-200 rounded-2xl' />
        </div>

        {/* Bottom label */}
        <div className='mt-auto flex items-center gap-2 pt-2'>
          {isGenerating && (
            <div className='w-3 h-3 rounded-full border border-slate-300 border-t-primary animate-spin flex-shrink-0' />
          )}
          <p className='text-[11px] text-slate-400 truncate'>
            {isGenerating ? `Generating ${screenName}...` : screenName}
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScreenSkeleton
