import { ResponsiveNavbar } from '@/components/ResponsiveNavbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutSection } from '@/components/sections/AboutSection'
import { TokenomicsSection } from '@/components/sections/TokenomicsSection'
import { HydraBotSection } from '@/components/sections/HydraBotSection'
import { RoadmapSection } from '@/components/sections/RoadmapSection'
import { CommunityHub } from '@/components/community/RealtimeChat'
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard'
import { ConnectionStatus } from '@/components/LoadingStates'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { motion, useInView } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  MessageCircle,
  Twitter,
  Send,
  ExternalLink,
  Heart,
  Star,
  Trophy,
  Shield,
  Zap,
  Globe,
  Activity,
  TrendingUp,
  Bot,
  Crown,
  Rocket,
  Target
} from 'lucide-react'
import React from 'react'

// Enhanced Community Section
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
              className="text-4xl md:text-6xl lg:text-7xl font-pixel text-glow mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.2 }}
              animate={{
                textShadow: [
                  "0 0 20px #39ff14",
                  "0 0 40px #39ff14",
                  "0 0 20px #39ff14"
                ]
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              <span className="text-neon-green">JOIN THE</span><br />
              <span className="text-foreground">ROACH ARMY</span>
            </motion.h2>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ delay: 0.4 }}
            >
              Connect, chat, compete, and earn with the strongest crypto community.
              Real-time discussions, epic challenges, and legendary rewards await.
            </motion.p>
          </div>

          {/* Gamification Dashboard */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.5 }}
          >
            <div className="relative z-10">
              <GamificationDashboard />
            </div>
          </motion.div>

          {/* Community Hub - Chat and Challenges */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.6 }}
          >
            <div className="relative z-10">
              <h3 className="text-2xl font-semibold text-center mb-8 text-neon-green">
                Live Community Hub
              </h3>
              <div className="max-w-6xl mx-auto">
                <CommunityHub />
              </div>
            </div>
          </motion.div>

          {/* Enhanced Social Proof Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ delay: 0.8 }}
          >
            <div className="relative z-10">
              <SocialProofSection />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Enhanced Social Proof Section
function SocialProofSection() {
  const socialStats = [
    { platform: 'Discord', count: '12.4K', growth: '+24%', icon: <MessageCircle className="w-5 h-5" />, color: 'neon-blue' },
    { platform: 'Telegram', count: '8.7K', growth: '+18%', icon: <Send className="w-5 h-5" />, color: 'neon-green' },
    { platform: 'Twitter', count: '15.2K', growth: '+31%', icon: <Twitter className="w-5 h-5" />, color: 'neon-orange' },
    { platform: 'Holders', count: '24.7K', growth: '+127', icon: <Users className="w-5 h-5" />, color: 'nuclear-glow' }
  ]

  const testimonials = [
    {
      name: 'CryptoWhale47',
      role: 'Diamond Hands Member',
      content: 'Best meme coin community I\'ve ever been part of. The Hydra Bot alone paid for my investment 10x over!',
      level: 15,
      badges: ['whale', 'early-adopter'],
      verified: true
    },
    {
      name: 'DeFiMaestro',
      role: 'Trading Legend',
      content: 'The AI trading system is revolutionary. 94.7% win rate speaks for itself. This is the future of DeFi.',
      level: 22,
      badges: ['trader', 'legend'],
      verified: true
    },
    {
      name: 'RoachSurvivor',
      role: 'Community Champion',
      content: 'Survived 3 market crashes with $BOOMROACH. The community support is unmatched. We\'re truly unkillable!',
      level: 18,
      badges: ['survivor', 'champion'],
      verified: true
    }
  ]

  return (
    <div className="space-y-12">
      {/* Social Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {socialStats.map((stat, index) => (
          <motion.div
            key={stat.platform}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className={`glassmorphism border-${stat.color}/30 text-center hover-glow group cursor-pointer`}>
              <CardContent className="p-6">
                <motion.div
                  className={`text-${stat.color} mb-3 flex justify-center group-hover:scale-110 transition-transform`}
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, delay: index * 0.5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className={`text-2xl font-bold text-${stat.color} mb-1`}>{stat.count}</div>
                <div className="text-sm text-muted-foreground mb-2">{stat.platform}</div>
                <Badge className={`bg-neon-green/20 text-neon-green border-neon-green/30 text-xs`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stat.growth}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Community Testimonials */}
      <div>
        <h3 className="text-2xl font-semibold text-center mb-8 text-nuclear-glow">
          What the Army Says
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="glassmorphism border-neon-orange/30 h-full hover-glow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-nuclear-gradient flex items-center justify-center">
                      <span className="text-background font-bold text-sm">
                        {testimonial.name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{testimonial.name}</span>
                        {testimonial.verified && <Shield className="w-4 h-4 text-neon-green" />}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{testimonial.role}</span>
                        <Badge className="text-xs px-1 py-0">Lv.{testimonial.level}</Badge>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex space-x-1 mt-3">
                    {testimonial.badges.map((badge, i) => (
                      <Badge key={`badge-${i}`} className="text-xs">
                        {badge === 'whale' && <Crown className="w-3 h-3 mr-1" />}
                        {badge === 'trader' && <TrendingUp className="w-3 h-3 mr-1" />}
                        {badge === 'survivor' && <Shield className="w-3 h-3 mr-1" />}
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-gradient/10 max-w-2xl mx-auto">
          <CardContent className="p-8">
            <h3 className="text-2xl font-pixel text-nuclear-glow mb-4">
              Ready to Join the Army?
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect with thousands of roaches, participate in challenges, and earn rewards.
              The revolution starts with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="nuclear-gradient hover-glow">
                <Rocket className="w-5 h-5 mr-2" />
                Join Discord
              </Button>
              <Button size="lg" variant="outline" className="border-neon-green text-neon-green hover:bg-neon-green/10">
                <Send className="w-5 h-5 mr-2" />
                Join Telegram
              </Button>
              <Button size="lg" variant="outline" className="border-neon-blue text-neon-blue hover:bg-neon-blue/10">
                <Twitter className="w-5 h-5 mr-2" />
                Follow Twitter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced Footer Section
function FooterSection() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    'Product': [
      { name: 'Hydra Bot', href: '#hydra-bot' },
      { name: 'Tokenomics', href: '#tokenomics' },
      { name: 'Staking', href: '#tokenomics' },
      { name: 'Roadmap', href: '#roadmap' }
    ],
    'Community': [
      { name: 'Discord', href: 'https://discord.gg/boomroach' },
      { name: 'Telegram', href: 'https://t.me/boomroach_army' },
      { name: 'Twitter', href: 'https://twitter.com/boomroach' },
      { name: 'Reddit', href: 'https://reddit.com/r/boomroach' }
    ],
    'Resources': [
      { name: 'Whitepaper', href: '/whitepaper.pdf' },
      { name: 'Audit Report', href: '/audit.pdf' },
      { name: 'Brand Kit', href: '/brand-kit.zip' },
      { name: 'API Docs', href: '/api-docs' }
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'Contact', href: '/contact' }
    ]
  }

  return (
    <footer className="relative bg-gradient-to-br from-background to-neon-orange/5 border-t border-neon-orange/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-10 -left-10 w-32 h-32 opacity-10"
          animate={{
            rotate: 360,
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY }}
        >
          <img
            src="https://ext.same-assets.com/3224214395/4224792650.png"
            alt="Roach"
            className="w-full h-full object-contain filter hue-rotate-30"
          />
        </motion.div>
        <motion.div
          className="absolute -bottom-10 -right-10 w-40 h-40 opacity-10"
          animate={{
            rotate: -360,
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY }}
        >
          <img
            src="https://ext.same-assets.com/3224214395/842254662.png"
            alt="Roach"
            className="w-full h-full object-contain filter hue-rotate-60"
          />
        </motion.div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <motion.div
                className="flex items-center space-x-3 mb-6"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-pixel text-neon-orange text-glow">
                  $BOOMROACH
                </div>
              </motion.div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The unkillable meme coin powered by AI trading, community governance,
                and nuclear-level innovation. Join the roach army and survive anything.
              </p>
              <div className="flex items-center space-x-4">
                <motion.a
                  href="https://twitter.com/boomroach"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-2 rounded-lg bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://discord.gg/boomroach"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  className="p-2 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="https://t.me/boomroach_army"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-2 rounded-lg bg-neon-green/20 text-neon-green hover:bg-neon-green/30 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </motion.a>
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold text-nuclear-glow mb-4">{category}</h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <motion.a
                        href={link.href}
                        className="text-muted-foreground hover:text-neon-orange transition-colors text-sm"
                        whileHover={{ x: 5 }}
                      >
                        {link.name}
                      </motion.a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="text-sm text-muted-foreground">
                © {currentYear} BoomRoach. All rights reserved. Built with ❤️ by the roach army.
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <span>Contract: 7xKp...4N2m</span>
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Lazy load heavy components for better performance
const LazyHydraBotSection = lazy(() => import('@/components/sections/HydraBotSection').then(m => ({ default: m.HydraBotSection })))
const LazyTokenomicsSection = lazy(() => import('@/components/sections/TokenomicsSection').then(m => ({ default: m.TokenomicsSection })))

export default function HomePage() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background relative">
        <ConnectionStatus />
        <ResponsiveNavbar />

        <main className="relative">
          <ErrorBoundary>
            <HeroSection />
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="relative z-10">
              <AboutSection />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="relative z-10">
              <Suspense fallback={
                <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-orange" />
                </div>
              }>
                <LazyTokenomicsSection />
              </Suspense>
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="relative z-10">
              <Suspense fallback={
                <div className="py-20 flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue" />
                </div>
              }>
                <LazyHydraBotSection />
              </Suspense>
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="relative z-10">
              <RoadmapSection />
            </div>
          </ErrorBoundary>

          <ErrorBoundary>
            <div className="relative z-10">
              <CommunitySection />
            </div>
          </ErrorBoundary>
        </main>

        <ErrorBoundary>
          <FooterSection />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}
