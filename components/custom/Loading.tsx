import React from 'react'

interface LoadingProps {
  loading: boolean;
  message?: string;
}

const Loading = ({ loading, message }: LoadingProps) => {
  if (!loading) return null;

  return (
    <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm'>
      {/* Top progress bar */}
      <div className='fixed top-0 left-0 right-0 h-[2px] bg-slate-100'>
        <div className='h-full bg-primary rounded-full animate-[progressBar_1.8s_ease-in-out_infinite]' />
      </div>

      {/* Minimal center indicator */}
      <div className='flex flex-col items-center gap-3'>
        <div className='w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin' />
        {message && (
          <p className='text-[13px] text-slate-500 font-medium tracking-tight'>{message}</p>
        )}
      </div>
    </div>
  )
}

export default Loading
