'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CompactWalletButton, WalletStatus } from '@/components/WalletButton'
import { usePriceFeeds } from '@/hooks/usePriceFeeds'
import { useWallet } from '@solana/wallet-adapter-react'
import {
  Menu,
  X,
  Home,
  Info,
  PieChart,
  Map,
  Bot,
  Users,
  Vote,
  ExternalLink,
  TrendingUp,
  Zap,
  Wallet,
  ChevronRight,
  Activity
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  description: string
  badge?: string
}

const navItems: NavItem[] = [
  {
    label: 'Home',
    href: '#home',
    icon: <Home className="w-4 h-4" />,
    description: 'Welcome to BoomRoach'
  },
  {
    label: 'About',
    href: '#about',
    icon: <Info className="w-4 h-4" />,
    description: 'Learn about our mission'
  },
  {
    label: 'Tokenomics',
    href: '#tokenomics',
    icon: <PieChart className="w-4 h-4" />,
    description: 'Token distribution & utility'
  },
  {
    label: 'Hydra Bot',
    href: '#hydra-bot',
    icon: <Bot className="w-4 h-4" />,
    description: 'AI trading system',
    badge: 'LIVE'
  },
  {
    label: 'Roadmap',
    href: '#roadmap',
    icon: <Map className="w-4 h-4" />,
    description: 'Our development journey'
  },
  {
    label: 'Community',
    href: '#community',
    icon: <Users className="w-4 h-4" />,
    description: 'Join the roach army'
  }
]

export function ResponsiveNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [hidden, setHidden] = useState(false)
  const { priceData } = usePriceFeeds()
  const { connected, publicKey } = useWallet()
  const { scrollY } = useScroll()

  // Enhanced scroll behavior
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious()
    if (latest > previous && latest > 150) {
      setHidden(true)
    } else {
      setHidden(false)
    }
    setScrolled(latest > 20)
  })

  useEffect(() => {
    const handleScroll = () => {
      // Update active section based on scroll position
      const sections = navItems.map(item => item.href.replace('#', ''))
      const current = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })

      if (current) {
        setActiveSection(current)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const targetId = href.replace('#', '')
    const element = document.getElementById(targetId)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }

    setIsOpen(false)
  }

  // Enhanced mobile menu animations
  const mobileMenuVariants = {
    closed: {
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    },
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40
      }
    }
  }

  const menuItemVariants = {
    closed: {
      x: 50,
      opacity: 0,
      transition: {
        duration: 0.3
      }
    },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  }

  return (
    <>
      {/* Main Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{
          y: hidden ? -100 : 0,
          transition: { duration: 0.3 }
        }}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'glassmorphism border-b border-neon-orange/20 backdrop-blur-xl shadow-2xl'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <motion.div
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="text-2xl md:text-3xl font-pixel text-neon-orange text-glow cursor-pointer"
                onClick={() => handleNavClick('#home')}
                animate={{
                  textShadow: [
                    "0 0 10px #ff9500",
                    "0 0 20px #ff9500",
                    "0 0 10px #ff9500"
                  ]
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                $BOOMROACH
              </motion.div>
              <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30 animate-pulse-glow hidden sm:flex">
                2025 EDITION
              </Badge>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <motion.button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 group ${
                    activeSection === item.href.replace('#', '')
                      ? 'text-neon-orange bg-neon-orange/10 border border-neon-orange/30'
                      : 'text-foreground hover:text-neon-orange hover:bg-neon-orange/5'
                  }`}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    animate={activeSection === item.href.replace('#', '') ? { rotate: 360 } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="text-sm font-medium">{item.label}</span>

                  {item.badge && (
                    <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs animate-pulse">
                      {item.badge}
                    </Badge>
                  )}

                  {/* Enhanced active indicator */}
                  {activeSection === item.href.replace('#', '') && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 border border-neon-orange/30 rounded-lg bg-neon-orange/5"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Enhanced hover tooltip */}
                  <motion.div
                    className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-background/90 border border-neon-orange/30 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap backdrop-blur-sm"
                    initial={{ y: -10, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                  >
                    {item.description}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-neon-orange/30" />
                  </motion.div>
                </motion.button>
              ))}
            </div>

            {/* Enhanced Price Ticker & Wallet */}
            <div className="flex items-center space-x-4">
              {/* Enhanced Live Price Ticker */}
              <motion.div
                className="hidden md:flex items-center space-x-3 px-4 py-2 rounded-lg glassmorphism border border-neon-green/30"
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(57, 255, 20, 0.2)',
                    '0 0 20px rgba(57, 255, 20, 0.4)',
                    '0 0 10px rgba(57, 255, 20, 0.2)'
                  ]
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <TrendingUp className="w-4 h-4 text-neon-green" />
                </motion.div>
                <div className="text-sm font-mono">
                  <motion.span
                    className="text-neon-green"
                    key={priceData.price}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ${priceData.price.toFixed(6)}
                  </motion.span>
                  <span className="text-muted-foreground mx-1">|</span>
                  <motion.span
                    className={priceData.priceChange24h > 0 ? "text-neon-green" : "text-red-400"}
                    key={priceData.priceChange24h}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {priceData.priceChange24h > 0 ? '+' : ''}{priceData.priceChange24h.toFixed(1)}%
                  </motion.span>
                </div>
              </motion.div>

              {/* Enhanced Wallet Connection */}
              <div className="hidden sm:block">
                <CompactWalletButton />
              </div>

              {/* Enhanced Mobile Menu Button */}
              <motion.div
                className="lg:hidden"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 relative"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>

                  {/* Notification dot for connected wallet */}
                  {connected && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Mobile Price Ticker */}
          <motion.div
            className="md:hidden mt-3 flex items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="flex items-center space-x-3 px-4 py-2 rounded-lg glassmorphism border border-neon-green/30"
              animate={{
                boxShadow: [
                  '0 0 10px rgba(57, 255, 20, 0.2)',
                  '0 0 20px rgba(57, 255, 20, 0.4)',
                  '0 0 10px rgba(57, 255, 20, 0.2)'
                ]
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              whileHover={{ scale: 1.02 }}
            >
              <Activity className="w-4 h-4 text-neon-green" />
              <div className="text-sm font-mono">
                <span className="text-neon-green">${priceData.price.toFixed(6)}</span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className={priceData.priceChange24h > 0 ? "text-neon-green" : "text-red-400"}>
                  {priceData.priceChange24h > 0 ? '+' : ''}{priceData.priceChange24h.toFixed(1)}%
                </span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className="text-neon-orange">{priceData.holders?.toLocaleString()} holders</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.nav>

      {/* Enhanced Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Enhanced Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/90 backdrop-blur-md z-40"
              onClick={() => setIsOpen(false)}
              style={{ backdropFilter: 'blur(20px)' }}
            />

            {/* Enhanced Mobile Menu */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-background/95 border-l border-neon-orange/30 z-50 overflow-y-auto backdrop-blur-xl"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="p-6">
                {/* Enhanced Mobile Header */}
                <motion.div
                  className="flex items-center justify-between mb-8"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="font-pixel text-xl text-neon-orange">Menu</div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-neon-orange/10 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>

                {/* Enhanced Wallet Status */}
                <motion.div
                  className="mb-6 p-4 rounded-lg glassmorphism border border-neon-orange/30"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <WalletStatus />
                  <div className="mt-3 sm:hidden">
                    <CompactWalletButton />
                  </div>

                  {connected && publicKey && (
                    <motion.div
                      className="mt-3 p-2 rounded bg-neon-green/10 border border-neon-green/20"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center space-x-2 text-xs text-neon-green">
                        <Wallet className="w-3 h-3" />
                        <span>Connected: {publicKey.toString().slice(0, 8)}...</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Enhanced Navigation Items */}
                <nav className="space-y-2">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item.label}
                      custom={index}
                      initial="closed"
                      animate="open"
                      variants={menuItemVariants}
                      onClick={() => handleNavClick(item.href)}
                      className={`w-full flex items-center justify-between p-4 rounded-lg text-left transition-all duration-300 group ${
                        activeSection === item.href.replace('#', '')
                          ? 'bg-neon-orange/10 border border-neon-orange/30 text-neon-orange'
                          : 'hover:bg-neon-orange/5 border border-transparent hover:border-neon-orange/20'
                      }`}
                      whileHover={{ scale: 1.02, x: 10 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          className={`p-2 rounded-lg transition-colors ${
                            activeSection === item.href.replace('#', '')
                              ? 'bg-neon-orange/20 text-neon-orange'
                              : 'bg-muted/20 group-hover:bg-neon-orange/10 group-hover:text-neon-orange'
                          }`}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {item.icon}
                        </motion.div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{item.label}</span>
                            {item.badge && (
                              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs animate-pulse">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground group-hover:text-neon-orange/70">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ x: 5 }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </motion.button>
                  ))}
                </nav>

                {/* Enhanced Social Links */}
                <motion.div
                  className="mt-8 pt-6 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="text-sm font-semibold mb-4 text-nuclear-glow">Join the Army</div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'Twitter', color: 'neon-blue', url: 'https://twitter.com/BOOMROACH' },
                      { name: 'Telegram', color: 'neon-green', url: 'https://t.me/BOOMROACH_ARMY' }
                    ].map((social, index) => (
                      <motion.div key={social.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`border-${social.color} text-${social.color} hover:bg-${social.color}/10 w-full`}
                          onClick={() => window.open(social.url, '_blank')}
                        >
                          {social.name}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Enhanced Quick Actions */}
                <motion.div
                  className="mt-6 space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      className="w-full nuclear-gradient hover-glow"
                      size="lg"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Buy $BOOMROACH
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full border-neon-orange text-neon-orange hover:bg-neon-orange/10"
                      size="lg"
                    >
                      <Bot className="w-4 h-4 mr-2" />
                      Try Hydra Bot
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
