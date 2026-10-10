
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e5_1px,transparent_1px),linear-gradient(to_bottom,#4f46e5_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] animate-grid"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-400 rounded-full animate-float opacity-60"></div>
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400 rounded-full animate-float-delayed opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-violet-400 rounded-full animate-float-delayed opacity-70" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-indigo-300 rounded-full animate-float opacity-50" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/3 right-2/3 w-3 h-3 bg-blue-300 rounded-full animate-float-delayed opacity-60" style={{animationDelay: '3s'}}></div>
        </div>
        
        {/* Subtle Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
          {/* Logo with Micro-interaction */}
          <div className="mb-8 group cursor-pointer">
            <div className="w-16 h-16 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
              <img src="/forma-logo.svg?v=2" alt="Forma Logo" className="w-16 h-16 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>
          
          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
            Welcome to{' '}
            <span className="text-indigo-400 font-runethia font-normal text-5xl">
              Forma
            </span>
          </h1>
          
          <p className="text-lg text-slate-300 text-center max-w-md mb-12 leading-relaxed">
            Transform your ideas into stunning designs with the power of artificial intelligence.
          </p>
          
          {/* Features with Micro-interactions */}
          <div className="space-y-4 w-full max-w-sm">
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-indigo-500/50 hover:translate-x-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/80 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-indigo-600 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">AI-Powered Design</h3>
                <p className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300">Generate mockups in seconds</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-indigo-500/50 hover:translate-x-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-blue-600/80 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-blue-600 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Professional Templates</h3>
                <p className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300">Industry-standard layouts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/80 hover:border-indigo-500/50 hover:translate-x-2 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-violet-600/80 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:bg-violet-600 group-hover:scale-110 group-hover:rotate-12">
                <svg className="w-5 h-5 text-white transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Secure & Private</h3>
                <p className="text-sm text-slate-400 transition-colors duration-300 group-hover:text-slate-300">Enterprise-grade security</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Accent Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
      </div>
      
      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-[size:20px_20px] opacity-50"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-purple-200 dark:bg-purple-900/30 rounded-full blur-2xl opacity-60"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-indigo-200 dark:bg-indigo-900/30 rounded-full blur-2xl opacity-60"></div>
        
        <div className="relative z-10 w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 flex items-center justify-center">
              <img src="/forma-logo.svg?v=2" alt="Forma Logo" className="w-14 h-14" />
            </div>
          </div>
          
          {/* Welcome Text */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Sign in to your account
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Start creating amazing designs today
            </p>
          </div>
          
          {/* Clerk SignIn Component */}
          <div className="clerk-sign-in-wrapper flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl shadow-purple-500/10 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all duration-200 rounded-xl font-medium",
                  socialButtonsBlockButtonText: "text-slate-700 dark:text-slate-200 font-medium",
                  dividerLine: "bg-slate-200 dark:bg-slate-700",
                  dividerText: "text-slate-400 dark:text-slate-500",
                  formFieldLabel: "text-slate-700 dark:text-slate-300 font-medium",
                  formFieldInput: "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200",
                  formButtonPrimary: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-xl font-semibold shadow-lg shadow-purple-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]",
                  footerActionLink: "text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium",
                  identityPreviewEditButton: "text-purple-600 dark:text-purple-400",
                  formFieldInputShowPasswordButton: "text-slate-500 hover:text-slate-700",
                  otpCodeFieldInput: "border-slate-200 dark:border-slate-600 rounded-lg",
                  footer: "hidden",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                }
              }}
            />
          </div>
          
          {/* Footer */}
          <p className="text-center text-sm text-slate-400 dark:text-slate-500 mt-8">
            By signing in, you agree to our{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
      

    </div>
  )
}