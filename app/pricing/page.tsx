'use client'

import React from 'react'
import Header from '@/_shared/Header'
import { Zap, Sparkles, Palette, ImagePlus, Layers, Share2, Download, MessageCircle, Play } from 'lucide-react'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'

const FEATURES = [
  { icon: Sparkles, title: 'AI Screen Generation', desc: 'Describe your app in plain English and get full, linked UI screens generated for you.' },
  { icon: ImagePlus, title: 'Generate From Image', desc: 'Upload a reference image or sketch and Forma builds a matching screen from it.' },
  { icon: Palette, title: 'Theme Builder', desc: 'Pick from built-in color themes or design your own custom brand theme.' },
  { icon: Layers, title: 'Multi-Screen Projects', desc: 'Build out full, navigable prototypes with multiple connected screens per project.' },
  { icon: Play, title: 'Click-Through Prototype', desc: 'Preview your generated screens as a real, clickable prototype before sharing.' },
  { icon: Download, title: 'Design Token Export', desc: 'Export your project\'s colors, spacing, and typography as a JSON design system.' },
  { icon: Share2, title: 'Instant Sharing', desc: 'Copy a shareable link to any project with one click.' },
  { icon: MessageCircle, title: 'Built-in Assistant', desc: 'Get help writing better prompts, using features, or fixing common issues — right in the app.' },
]

const PricingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header />

      {/* Background Orbs */}
      <div className="bg-purple-400/10 absolute -top-40 -left-40 h-[600px] w-[600px] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="bg-rose-400/10 absolute top-1/4 -right-40 h-[600px] w-[600px] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="bg-blue-400/10 absolute bottom-0 left-1/4 h-[600px] w-[600px] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] bg-[size:20px_20px] opacity-40 pointer-events-none"></div>

      <main className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up-fade">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 rounded-full border border-rose-200/50 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800/50">
            <AnimatedShinyText className="inline-flex items-center text-sm font-medium text-rose-600 dark:text-rose-400">
              <Zap className="w-3.5 h-3.5 mr-2" />
              <span>Currently free to use</span>
            </AnimatedShinyText>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Forma is running on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-rose-400">
              a free tier
            </span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            No subscription, no credit card. Every feature below is available right now at no cost while Forma is in this stage.
          </p>
        </div>

        {/* Free Tier Info Card */}
        <div className="max-w-2xl mx-auto mb-16 animate-slide-up-fade" style={{ animationDelay: '150ms' }}>
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-8 border border-white/40 dark:border-slate-800/40 shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-rose-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Free Tier — Active</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              You can create unlimited projects on the free tier. All generation, theming, export, and sharing features are fully included — no feature is locked behind a paywall at this time.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
          <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-10">What's included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default PricingPage