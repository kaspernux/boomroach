'use client'

import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Rocket,
  Zap,
  Bot,
  Shield,
  TrendingUp,
  Star,
  Activity,
  Globe,
  Users,
  Target,
  Crown,
  Flame,
  Trophy,
  ArrowRight,
  Play,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { usePriceFeeds } from '@/hooks/usePriceFeeds'
import { useGamification } from '@/components/gamification/AchievementSystem'
import { AnimatedCounter } from '@/components/animations/MobileAnimations'
import { useABTestContext } from '@/components/abtest/ABTestProvider'
import Link from 'next/link'

export function HeroSection() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.8])

  const { priceData } = usePriceFeeds()
  const { unlockAchievement } = useGamification()
  const { getVariant, trackConversion } = useABTestContext()
  const [showDemo, setShowDemo] = useState(false)
  const [particles, setParticles] = useState<Array<{ id: number, x: number, y: number, delay: number }>>([])

  // Get A/B test variant for CTA layout
  const ctaVariant = getVariant('hero_cta_optimization')

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }))
    setParticles(newParticles)

    // Unlock achievement for visiting the site
    setTimeout(() => {
      unlockAchievement('curious-explorer')
    }, 3000)
  }, [unlockAchievement])

  const stats = [
    { label: 'Holders', value: '24.7K', icon: <Users className="w-4 h-4" />, color: 'neon-blue' },
    { label: 'Win Rate', value: '94.7%', icon: <Target className="w-4 h-4" />, color: 'neon-green' },
    { label: 'Market Cap', value: '$4.2M', icon: <TrendingUp className="w-4 h-4" />, color: 'nuclear-glow' },
    { label: 'Total Trades', value: '127K', icon: <Activity className="w-4 h-4" />, color: 'neon-orange' }
  ]

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: 'Hydra AI Bot',
      description: '94.7% win rate trading system',
      color: 'neon-blue'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Nuclear Resistant',
      description: 'Unkillable by design',
      color: 'neon-green'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community DAO',
      description: '100% community owned',
      color: 'neon-orange'
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: 'Deflationary',
      description: 'Auto-burn mechanisms',
      color: 'nuclear-glow'
    }
  ]

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/10" />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-nuclear-glow rounded-full opacity-40"
            style={{ left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{
              y: [-20, -100, -20],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,149,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,149,0,0.1)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Main Content */}
      <motion.div
        style={{ y, opacity, scale }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="max-w-7xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <Badge className="bg-nuclear-gradient text-background px-6 py-2 text-sm font-semibold border-0">
              <Sparkles className="w-4 h-4 mr-2" />
              2025 Edition - Nuclear Powered
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-pixel mb-8 leading-tight"
          >
            <motion.span
              className="block text-neon-orange text-glow"
              animate={{
                textShadow: [
                  "0 0 20px #ff9500",
                  "0 0 40px #ff9500",
                  "0 0 60px #ff9500",
                  "0 0 40px #ff9500",
                  "0 0 20px #ff9500"
                ]
              }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            >
              $BOOMROACH
            </motion.span>
            <motion.span
              className="block text-foreground mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              THE UNKILLABLE
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            The nuclear-powered meme coin with{' '}
            <span className="text-neon-blue font-semibold">AI trading bot</span>,{' '}
            <span className="text-nuclear-glow font-semibold">DAO governance</span>, and{' '}
            <span className="text-neon-green font-semibold">legendary community</span>.
            <br />
            Survive anything. Multiply everything.
          </motion.p>

          {/* Live Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.05, y: -5 }}
                className="glassmorphism p-4 rounded-lg border border-neon-orange/30 hover-glow"
              >
                <div className={`text-${stat.color} mb-2 flex justify-center`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl font-bold text-${stat.color} mb-1`}>
                  {stat.value.includes('$') || stat.value.includes('%') ? (
                    stat.value
                  ) : (
                    <AnimatedCounter
                      from={0}
                      to={Number.parseFloat(stat.value.replace(/[^0-9.]/g, ''))}
                      suffix={stat.value.includes('K') ? 'K' : ''}
                    />
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                className="nuclear-gradient hover-glow text-lg px-8 py-4 font-semibold group"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Buy $BOOMROACH Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-neon-blue text-neon-blue hover:bg-neon-blue/10 group"
                onClick={() => setShowDemo(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/trade">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-4 border-nuclear-glow text-nuclear-glow hover:bg-nuclear-glow/10 group"
                  onClick={() => {
                    trackConversion('hero_cta_optimization', 'trading_page_click')
                    unlockAchievement('trading-explorer')
                  }}
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Try Hydra Bot
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`glassmorphism p-6 rounded-lg border border-${feature.color}/30 hover-glow group`}
              >
                <div className={`text-${feature.color} mb-4 group-hover:scale-110 transition-transform flex justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="text-neon-orange cursor-pointer"
              onClick={() => {
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Live Price Ticker */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="fixed top-24 left-4 z-20 hidden lg:block"
      >
        <Card className="glassmorphism border-neon-green/30 bg-background/80">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="text-neon-green"
              >
                <Activity className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="text-sm font-semibold text-neon-green">Live Price</div>
                <div className="font-mono text-lg">
                  <motion.span
                    key={priceData.price}
                    initial={{ scale: 1.2, color: '#39ff14' }}
                    animate={{ scale: 1, color: '#ffffff' }}
                    transition={{ duration: 0.3 }}
                  >
                    ${priceData.price.toFixed(6)}
                  </motion.span>
                </div>
                <div className={`text-xs ${priceData.priceChange24h > 0 ? 'text-neon-green' : 'text-red-400'}`}>
                  {priceData.priceChange24h > 0 ? '+' : ''}{priceData.priceChange24h.toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Demo Modal */}
      <AnimatePresence>
        {showDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-background rounded-lg border border-neon-orange/30 p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-neon-orange mb-4">🚀 Demo Coming Soon!</h3>
              <p className="text-muted-foreground mb-6">
                Our interactive demo showcasing the Hydra Bot AI trading system will be available soon.
                Join our community to be the first to know!
              </p>
              <div className="flex space-x-3">
                <Button onClick={() => setShowDemo(false)} className="flex-1">
                  Close
                </Button>
                <Button variant="outline" className="flex-1 border-neon-green text-neon-green">
                  Join Discord
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roach Images - Floating */}
      <motion.div
        className="absolute top-20 right-20 w-32 h-32 opacity-30 hidden lg:block"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY }}
      >
        <img
          src="https://ext.same-assets.com/3224214395/4224792650.png"
          alt="Nuclear Roach"
          className="w-full h-full object-contain filter drop-shadow-2xl"
        />
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 w-24 h-24 opacity-25 hidden lg:block"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 3, 0],
          scale: [1, 0.9, 1]
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
      >
        <img
          src="https://ext.same-assets.com/3224214395/842254662.png"
          alt="Roach Army"
          className="w-full h-full object-contain filter drop-shadow-xl"
        />
      </motion.div>
    </section>
  )
}
