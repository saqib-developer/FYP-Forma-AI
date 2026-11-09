import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start sm:justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 sm:py-12 px-4 sm:px-6 pb-36 sm:pb-24 overflow-y-auto">
      <div className="w-full max-w-md my-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1.5 sm:mb-2">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Start creating amazing designs today
          </p>
        </div>
        <div className="flex justify-center w-full">
          <SignUp />
        </div>
      </div>
    </div>
  )
}