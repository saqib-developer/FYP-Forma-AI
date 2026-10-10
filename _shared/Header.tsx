'use client'

import React, { useState, useEffect, useContext } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, Sparkles, MessageCircle } from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import Logo from '@/data/Logo'
import { SettingContext } from '@/context/SettingContext'
import { ChatbotContext } from '@/context/ChatbotContext'

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const {settingDetails, setSettingDetails} = useContext(SettingContext)
  const { setIsOpen: setChatbotOpen } = useContext(ChatbotContext)
  const {user} = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Pricing', href: '/pricing' },
  ]

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500  ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60' 
          : 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-md'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex-1">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                className="relative text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-all duration-300 group/link"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <span className="relative inline-block transition-transform duration-300 group-hover/link:-translate-y-0.5">
                  {link.name}
                </span>
                {/* Animated underline */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 transition-all duration-300 ease-out group-hover/link:w-full"></span>
                {/* Subtle dot indicator */}
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full opacity-0 scale-0 transition-all duration-300 group-hover/link:opacity-100 group-hover/link:scale-100"></span>
              </Link>
            ))}
            <button
              onClick={() => setChatbotOpen(true)}
              className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              Assistant
            </button>
          </div>

          {/* Desktop CTA Button */}
          <div className="flex-1 hidden md:flex justify-end items-center gap-4">
            {!user ? <Link href="/sign-in">
              <Button 
                className="relative cursor-pointer bg-rose-500 hover:bg-rose-600  text-white font-semibold px-6 py-2 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group/btn overflow-hidden"
              >
                {/* Subtle shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></span>
                
                <span className="relative flex items-center gap-2">
                  <span className="transition-all duration-300 group-hover/btn:tracking-wide">Get Started</span>
                  <svg 
                    className="w-4 h-4 transition-all duration-300 ease-out group-hover/btn:translate-x-1 group-hover/btn:scale-110" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </Button>
            </Link> : (
              <UserButton 
                userProfileProps={{
                  appearance: {
                    variables: {
                      colorPrimary: '#f43f5e',
                      colorText: '#1e293b',
                      borderRadius: '1rem',
                      fontFamily: 'inherit'
                    },
                    elements: {
                      card: "rounded-3xl border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden",
                      navbar: "border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50",
                      navbarButton: "hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors uppercase text-[10px] font-bold tracking-widest",
                      headerTitle: "text-2xl font-bold text-slate-900 dark:text-white mb-2",
                      headerSubtitle: "text-slate-500 dark:text-slate-400",
                      pageScrollBox: "p-8",
                      profileSectionTitle: "text-lg font-bold text-slate-800 dark:text-slate-200 border-b pb-2 mb-4",
                    }
                  }
                }}
                appearance={{
                  variables: {
                    colorPrimary: '#f43f5e',
                    colorText: '#1e293b',
                    borderRadius: '1rem',
                  },
                  elements: {
                    userButtonAvatarBox: "h-11 w-11 border-2 border-slate-100 dark:border-slate-800 transition-all hover:scale-110 shadow-sm",
                    userButtonTrigger: "focus:shadow-none focus:outline-none ring-offset-2 ring-primary/20",
                    userButtonPopoverCard: "shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
                    userPreviewMainIdentifier: "font-bold text-slate-900 dark:text-white",
                    userPreviewSecondaryIdentifier: "text-slate-500 text-xs",
                    userButtonPopoverActionButton: "hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors px-4 py-3",
                    userButtonPopoverActionButtonText: "text-slate-700 dark:text-slate-200 font-medium",
                    userButtonPopoverFooter: "hidden", // Clean up the footer
                  }
                }}
              />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105 active:scale-95"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu 
                className={`w-6 h-6 text-slate-700 dark:text-slate-300 absolute inset-0 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                }`} 
              />
              <X 
                className={`w-6 h-6 text-slate-700 dark:text-slate-300 absolute inset-0 transition-all duration-300 ${
                  isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                }`} 
              />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div 
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 space-y-2 border-t border-slate-200 dark:border-slate-700 mt-2">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg font-medium transition-all duration-300 hover:translate-x-1 hover:shadow-sm"
                style={{ 
                  transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms',
                  transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => { setChatbotOpen(true); setIsMobileMenuOpen(false) }}
              className="flex items-center gap-2 w-full text-left px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg font-medium transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4" />
              Assistant
            </button>
            <div className="px-4 pt-2">
              {
                user ? <UserButton /> : <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button 
                    className="w-full bg-rose-500 hover:bg-rose-600 cursor-pointer text-white font-semibold py-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Get Started
                  </Button>
                </Link>
              }
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header