'use client'

import React from 'react'
import { ResponsiveNavbar } from '@/components/ResponsiveNavbar'
import { AboutSection } from '@/components/sections/AboutSection'
import { TokenomicsSection } from '@/components/sections/TokenomicsSection'
import { HydraBotSection } from '@/components/sections/HydraBotSection'
import { RoadmapSection } from '@/components/sections/RoadmapSection'
import { GamificationDashboard } from '@/components/Gamification'
import { SocialProofSection } from '@/components/SocialProof'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { motion, useInView } from 'framer-motion'
import { usePriceFeeds } from '@/hooks/usePriceFeeds'
import {
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Bot,
  Rocket,
  Crown,
  Flame,
  Star,
  ChevronDown,
  Twitter,
  MessageCircle,
  Github,
  Globe
} from 'lucide-react'

// Enhanced Hero Section
function HeroSection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })
  const { priceData } = usePriceFeeds()

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center particles-bg overflow-hidden" ref={ref}>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/5" />

      {/* Floating Roach Images */}
      <div className="absolute top-20 left-10 w-16 h-16 opacity-20 animate-float">
        <img
          src="https://ext.same-assets.com/3224214395/4224792650.png"
          alt="Roach"
          className="w-full h-full object-contain filter hue-rotate-30"
        />
      </div>
      <div className="absolute bottom-20 right-10 w-20 h-20 opacity-30 animate-float" style={{animationDelay: '1s'}}>
        <img
          src="https://ext.same-assets.com/3224214395/842254662.png"
          alt="Roach"
          className="w-full h-full object-contain filter hue-rotate-60"
        />
      </div>
      <div className="absolute top-1/2 left-5 w-12 h-12 opacity-15 animate-float" style={{animationDelay: '2s'}}>
        <img
          src="https://ext.same-assets.com/3224214395/1748105708.png"
          alt="Roach"
          className="w-full h-full object-contain filter hue-rotate-90"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-6xl mx-auto">

          {/* 2025 Edition Badges */}
          <motion.div
            className="flex justify-center space-x-4 mb-8 animate-float"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30 text-xs px-3 py-1">
              <Crown className="w-3 h-3 mr-1" />
              #1 SOLANA MEME
            </Badge>
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs px-3 py-1">
              <Flame className="w-3 h-3 mr-1" />
              NUCLEAR POWERED
            </Badge>
            <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 text-xs px-3 py-1">
              <Bot className="w-3 h-3 mr-1" />
              AI TRADING BOT
            </Badge>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            className="text-4xl md:text-7xl lg:text-8xl font-pixel text-glow mb-6 leading-tight"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.4, type: 'spring', damping: 20 }}
          >
            <span className="text-neon-orange">$BOOM</span>
            <span className="text-foreground">ROACH</span>
          </motion.h1>

          <motion.div
            className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 nuclear-gradient bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.6 }}
          >
            THE UNKILLABLE MEME COIN
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.8 }}
          >
            Powered by <span className="text-neon-orange font-semibold">Hydra AI Bot</span>,
            fueled by <span className="text-nuclear-glow font-semibold">nuclear energy</span>,
            and backed by an <span className="text-neon-blue font-semibold">unstoppable community</span>.
            The roach that survives everything and multiplies profits.
          </motion.p>

          {/* Enhanced Live Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="glassmorphism border-neon-orange/30 hover-glow">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="text-3xl font-bold text-neon-orange mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                >
                  ${priceData.price.toFixed(6)}
                </motion.div>
                <div className="text-sm text-muted-foreground">Current Price</div>
                <div className="text-xs text-neon-green mt-1">
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  +{priceData.priceChange24h.toFixed(1)}% (24h)
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-nuclear-glow/30 hover-glow">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="text-3xl font-bold text-nuclear-glow mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                >
                  ${(priceData.marketCap / 1000000).toFixed(1)}M
                </motion.div>
                <div className="text-sm text-muted-foreground">Market Cap</div>
                <div className="text-xs text-neon-green mt-1">
                  <Rocket className="w-3 h-3 inline mr-1" />
                  Live Trading
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism border-neon-blue/30 hover-glow">
              <CardContent className="p-6 text-center">
                <motion.div
                  className="text-3xl font-bold text-neon-blue mb-2"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1.0 }}
                >
                  {(priceData.holders || 12483).toLocaleString()}
                </motion.div>
                <div className="text-sm text-muted-foreground">Holders</div>
                <div className="text-xs text-neon-green mt-1">
                  <Users className="w-3 h-3 inline mr-1" />
                  Growing Daily
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ delay: 1.2 }}
          >
            <Button
              size="lg"
              className="nuclear-gradient hover-glow text-lg px-8 py-6 font-semibold group"
            >
              <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
              Buy $BOOMROACH
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-neon-orange text-neon-orange hover:bg-neon-orange/10 hover-glow text-lg px-8 py-6 group"
            >
              <Bot className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Hydra Bot
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover-glow text-lg px-8 py-6 group"
            >
              <Star className="w-5 h-5 mr-2 group-hover:animate-spin" />
              Join DAO
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="animate-bounce"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5 }}
          >
            <ChevronDown className="w-8 h-8 mx-auto text-neon-orange opacity-70" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Community Section
function CommunitySection() {
  const ref = React.useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section id="community" className="py-20 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-green/5" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              className="inline-flex items-center space-x-2 mb-4"
            >
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 px-4 py-1">
                <Users className="w-4 h-4 mr-2" />
                Community
              </Badge>
            </motion.div>

            <motion.h2
              className="text-4xl md:text-6xl font-pixel text-glow mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.2 }}
            >
              <span className="text-neon-green">JOIN THE</span><br />
              <span className="text-foreground">ROACH ARMY</span>
            </motion.h2>
          </div>

          {/* Gamification Dashboard */}
          <GamificationDashboard />

          {/* Social Proof */}
          <div className="mt-16">
            <SocialProofSection />
          </div>
        </div>
      </div>
    </section>
  )
}

// Enhanced Footer
function EnhancedFooter() {
  return (
    <footer className="py-20 relative overflow-hidden border-t border-neon-orange/20">
      <div className="absolute inset-0 bg-gradient-to-t from-neon-orange/5 to-background" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-7xl mx-auto">

          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-3xl font-pixel text-neon-orange text-glow">
                  $BOOMROACH
                </div>
                <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
                  2025 EDITION
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-md mb-6 leading-relaxed">
                The unkillable meme coin powered by AI, community, and nuclear energy.
                Built to survive and thrive in any market condition.
              </p>
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neon-blue text-neon-blue hover:bg-neon-blue/10"
                  onClick={() => window.open('https://twitter.com/BOOMROACH', '_blank')}
                >
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neon-green text-neon-green hover:bg-neon-green/10"
                  onClick={() => window.open('https://t.me/BOOMROACH_ARMY', '_blank')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Telegram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-nuclear-glow text-nuclear-glow hover:bg-nuclear-glow/10"
                  onClick={() => window.open('https://github.com/kaspernux/boomroach', '_blank')}
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-pixel text-lg text-neon-orange mb-4">Quick Links</h4>
              <div className="space-y-2">
                {[
                  { label: 'About', href: '#about' },
                  { label: 'Tokenomics', href: '#tokenomics' },
                  { label: 'Hydra Bot', href: '#hydra-bot' },
                  { label: 'Roadmap', href: '#roadmap' },
                  { label: 'Community', href: '#community' }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-neon-orange transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-pixel text-lg text-nuclear-glow mb-4">Resources</h4>
              <div className="space-y-2">
                {[
                  { label: 'Whitepaper', href: '#' },
                  { label: 'Documentation', href: '#' },
                  { label: 'Smart Contract', href: '#' },
                  { label: 'Audit Report', href: '#' },
                  { label: 'Brand Kit', href: '#' }
                ].map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className="block text-sm text-muted-foreground hover:text-nuclear-glow transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-sm text-muted-foreground mb-4 md:mb-0">
                © 2025 BoomRoach. Nuclear-proof. Rug-proof. Roach forever.
              </div>
              <div className="flex space-x-6 text-xs text-muted-foreground">
                <a href="#" className="hover:text-neon-orange transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-neon-orange transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-neon-orange transition-colors">Risk Disclaimer</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Main Enhanced Page Component
export default function EnhancedHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <ResponsiveNavbar />
      <HeroSection />
      <AboutSection />
      <TokenomicsSection />
      <HydraBotSection />
      <RoadmapSection />
      <CommunitySection />
      <EnhancedFooter />
    </div>
  )
}
