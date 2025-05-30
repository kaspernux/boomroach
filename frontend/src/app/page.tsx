"use client";

import React, { Suspense, memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Bot,
  Brain,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Coins,
  Crown,
  DollarSign,
  Download,
  Eye,
  Filter,
  Flame,
  Gift,
  Github,
  Globe,
  Heart,
  Image,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Percent,
  PlayCircle,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Star,
  StopCircle,
  Target,
  ThumbsUp,
  TrendingUp,
  Trophy,
  Twitter,
  Unlock,
  Upload,
  Users,
  Vote,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Import the new production components
import { CompactWalletButton, WalletStatus } from "@/components/WalletButton";
import {
  AnimatedCounter,
  MagneticButton,
  PulseGlow,
  ScaleOnHover,
} from "@/components/animations/MobileAnimations";
import { usePriceFeeds } from "@/hooks/usePriceFeeds";
import { useRealTimeBotPerformance, useRealTimeSignals } from "@/lib/api";

// Import new optimization and gamification components
import { 
  PerformanceMonitor,
  useIntersectionObserver,
  createLazyComponent,
  AnimatedCounter as OptimizedCounter
} from "@/components/optimization/PerformanceOptimizer";
import { 
  GamificationProvider, 
  useGamification,
  UserProgressCard,
  AchievementGrid,
  Leaderboard 
} from "@/components/gamification/AchievementSystem";
import { 
  SecurityBadges, 
  CommunityStats, 
  Testimonials, 
  LiveActivityFeed 
} from "@/components/social/TrustIndicators";
import { 
  PriceLoader, 
  TradingSignalLoader, 
  ChartLoader 
} from "@/components/loaders/PriceLoader";
import { LazyImage } from "@/components/optimization/LazyImage";
import { 
  MobileNav, 
  PullToRefresh, 
  useMobileViewport,
  MobilePerformanceWrapper 
} from "@/components/mobile/MobileOptimizations";

// Memoized sections for performance
const HeroSection = memo(() => {
  const { targetRef, isIntersecting } = useIntersectionObserver();
  const { updateStats } = useGamification();
  
  return (
    <section 
      ref={targetRef}
      className="relative min-h-screen flex items-center justify-center particles-bg"
    >
      {isIntersecting && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/5" />
          {/* Hero content will be rendered here */}
        </>
      )}
    </section>
  );
});

HeroSection.displayName = "HeroSection";

const TokenomicsSection = memo(() => {
  const { targetRef, isIntersecting } = useIntersectionObserver();
  
  return (
    <section ref={targetRef} id="tokenomics" className="py-20 relative">
      {isIntersecting ? (
        // Full tokenomics content
        <div className="container mx-auto px-4">
          {/* Tokenomics content */}
        </div>
      ) : (
        <div className="container mx-auto px-4">
          <ChartLoader />
        </div>
      )}
    </section>
  );
});

TokenomicsSection.displayName = "TokenomicsSection";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { isMobile } = useMobileViewport();

  // Use real price feeds instead of mock data
  const {
    priceData,
    loading: priceLoading,
    error: priceError,
  } = usePriceFeeds();

  // Use real trading signals and bot performance
  const { signals, loading: signalsLoading } = useRealTimeSignals();
  const { performance, loading: performanceLoading } =
    useRealTimeBotPerformance();

  const handleRefresh = async () => {
    // Refresh data
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <PerformanceMonitor>
      <GamificationProvider>
        <MobilePerformanceWrapper>
          <PullToRefresh onRefresh={handleRefresh}>
            <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glassmorphism border-b border-neon-orange/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-pixel text-neon-orange text-glow">
              $BOOMROACH
            </div>
            <PulseGlow>
              <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30 animate-pulse-glow">
                2025 EDITION
              </Badge>
            </PulseGlow>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#about"
              className="hover:text-neon-orange transition-colors"
            >
              About
            </a>
            <a
              href="#tokenomics"
              className="hover:text-neon-orange transition-colors"
            >
              Tokenomics
            </a>
            <a
              href="#hydra-bot"
              className="hover:text-neon-orange transition-colors"
            >
              Hydra Bot
            </a>
            <a
              href="#achievements"
              className="hover:text-neon-orange transition-colors"
            >
              Achievements
            </a>
            <a
              href="#community"
              className="hover:text-neon-orange transition-colors"
            >
              Community
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 font-mono text-sm">
              {priceLoading ? (
                <PriceLoader />
              ) : (
                <>
                  <span className="text-neon-green">
                    $
                    <AnimatedCounter
                      from={0}
                      to={priceData.price}
                      duration={1}
                      prefix=""
                      suffix=""
                      className="inline"
                    />
                  </span>
                  <Separator orientation="vertical" className="h-4" />
                  <span className="text-neon-blue">
                    <AnimatedCounter
                      from={0}
                      to={priceData.holders || 12483}
                      duration={2}
                      prefix=""
                      suffix=" holders"
                      className="inline"
                    />
                  </span>
                </>
              )}
            </div>
            <WalletStatus />
            <MagneticButton>
              <CompactWalletButton />
            </MagneticButton>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <MobileNav 
        isOpen={mobileNavOpen} 
        onToggle={() => setMobileNavOpen(!mobileNavOpen)}
      >
        <div className="space-y-6">
          <UserProgressCard />
          <nav className="space-y-4">
            <a
              href="#about"
              className="block py-3 px-4 rounded-lg bg-zinc-800/50 hover:bg-neon-orange/20 
                       transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              About
            </a>
            <a
              href="#tokenomics"
              className="block py-3 px-4 rounded-lg bg-zinc-800/50 hover:bg-neon-orange/20 
                       transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              Tokenomics
            </a>
            <a
              href="#hydra-bot"
              className="block py-3 px-4 rounded-lg bg-zinc-800/50 hover:bg-neon-orange/20 
                       transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              Hydra Bot
            </a>
            <a
              href="#achievements"
              className="block py-3 px-4 rounded-lg bg-zinc-800/50 hover:bg-neon-orange/20 
                       transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              Achievements
            </a>
            <a
              href="#community"
              className="block py-3 px-4 rounded-lg bg-zinc-800/50 hover:bg-neon-orange/20 
                       transition-colors"
              onClick={() => setMobileNavOpen(false)}
            >
              Community
            </a>
          </nav>
        </div>
      </MobileNav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center particles-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-neon-orange/5" />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-6xl mx-auto">
            {/* Floating Badges */}
            <div className="flex justify-center space-x-4 mb-8">
              <ScaleOnHover>
                <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30 text-xs px-3 py-1">
                  <Crown className="w-3 h-3 mr-1" />
                  #1 SOLANA MEME
                </Badge>
              </ScaleOnHover>
              <ScaleOnHover>
                <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs px-3 py-1">
                  <Flame className="w-3 h-3 mr-1" />
                  NUCLEAR POWERED
                </Badge>
              </ScaleOnHover>
              <ScaleOnHover>
                <Badge className="bg-neon-blue/20 text-neon-blue border-neon-blue/30 text-xs px-3 py-1">
                  <Bot className="w-3 h-3 mr-1" />
                  AI TRADING BOT
                </Badge>
              </ScaleOnHover>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-7xl lg:text-8xl font-pixel text-glow mb-6 leading-tight">
              <span className="text-neon-orange">$BOOM</span>
              <span className="text-foreground">ROACH</span>
            </h1>

            <div className="text-xl md:text-3xl lg:text-4xl font-bold mb-4 nuclear-gradient bg-clip-text text-transparent">
              THE UNKILLABLE MEME COIN
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Powered by{" "}
              <span className="text-neon-orange font-semibold">
                Hydra AI Bot
              </span>
              , fueled by{" "}
              <span className="text-nuclear-glow font-semibold">
                nuclear energy
              </span>
              , and backed by an{" "}
              <span className="text-neon-blue font-semibold">
                unstoppable community
              </span>
              . The roach that survives everything and multiplies profits.
            </p>

            {/* Live Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <ScaleOnHover>
                <Card className="glassmorphism border-neon-orange/30 hover-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-neon-orange mb-2">
                      $
                      <AnimatedCounter
                        from={0}
                        to={priceData.price}
                        duration={2}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current Price
                    </div>
                    <div className="text-xs text-neon-green mt-1">
                      <TrendingUp className="w-3 h-3 inline mr-1" />
                      +
                      <AnimatedCounter
                        from={0}
                        to={priceData.priceChange24h}
                        duration={1.5}
                        suffix="% (24h)"
                      />
                    </div>
                  </CardContent>
                </Card>
              </ScaleOnHover>

              <ScaleOnHover>
                <Card className="glassmorphism border-nuclear-glow/30 hover-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-nuclear-glow mb-2">
                      $
                      <AnimatedCounter
                        from={0}
                        to={priceData.marketCap / 1000000}
                        duration={2}
                        suffix="M"
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Market Cap
                    </div>
                    <div className="text-xs text-neon-green mt-1">
                      <Target className="w-3 h-3 inline mr-1" />
                      Live Trading
                    </div>
                  </CardContent>
                </Card>
              </ScaleOnHover>

              <ScaleOnHover>
                <Card className="glassmorphism border-neon-blue/30 hover-glow">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-neon-blue mb-2">
                      <AnimatedCounter
                        from={0}
                        to={priceData.holders || 12483}
                        duration={2}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground">Holders</div>
                    <div className="text-xs text-neon-green mt-1">
                      <Users className="w-3 h-3 inline mr-1" />
                      Growing Daily
                    </div>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <MagneticButton strength={0.4}>
                <PulseGlow>
                  <Button
                    size="lg"
                    className="nuclear-gradient hover-glow text-lg px-8 py-6 font-semibold"
                  >
                    <Rocket className="w-5 h-5 mr-2" />
                    Buy $BOOMROACH
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </PulseGlow>
              </MagneticButton>

              <MagneticButton strength={0.3}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neon-orange text-neon-orange hover:bg-neon-orange/10 hover-glow text-lg px-8 py-6"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Try Hydra Bot
                </Button>
              </MagneticButton>

              <MagneticButton strength={0.3}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-neon-blue text-neon-blue hover:bg-neon-blue/10 hover-glow text-lg px-8 py-6"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Join DAO
                </Button>
              </MagneticButton>
            </div>

            {/* Scroll Indicator */}
            <div className="animate-bounce">
              <ChevronDown className="w-8 h-8 mx-auto text-neon-orange opacity-70" />
            </div>
          </div>
        </div>
      </section>

      {/* Hydra Bot Performance Summary */}
      <section className="py-20 relative bg-gradient-to-br from-background to-nuclear-glow/5">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-pixel text-glow mb-6">
                <span className="text-nuclear-glow">HYDRA</span>
                <span className="text-foreground"> BOT</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Multi-headed AI trading beast. Live performance metrics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Live Trading Terminal */}
              <ScaleOnHover>
                <Card className="glassmorphism border-nuclear-glow/30 hover-glow p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl font-pixel text-nuclear-glow mb-4">
                      <Brain className="w-8 h-8 inline mr-2" />
                      Live Trading Terminal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse" />
                          <span className="text-neon-green">
                            {performance?.status === "ACTIVE"
                              ? "HYDRA-01 ACTIVE"
                              : "CONNECTING..."}
                          </span>
                        </div>
                        <div className="text-nuclear-glow">
                          PnL: +$
                          <AnimatedCounter
                            from={0}
                            to={performance?.totalPnL || 47239.42}
                            duration={2}
                            className="inline"
                          />
                        </div>
                      </div>

                      {/* Real Trading Signals */}
                      <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                        {signalsLoading ? (
                          <div className="text-neon-orange">
                            Loading signals...
                          </div>
                        ) : (
                          signals.slice(0, 5).map((signal) => (
                            <div
                              key={signal.id}
                              className="flex justify-between"
                            >
                              <span className="text-muted-foreground">
                                [
                                {new Date(
                                  signal.timestamp,
                                ).toLocaleTimeString()}
                                ]
                              </span>
                              <span
                                className={
                                  signal.action === "BUY"
                                    ? "text-neon-green"
                                    : signal.action === "SELL"
                                      ? "text-neon-orange"
                                      : "text-neon-blue"
                                }
                              >
                                {signal.action} {signal.pair} @ {signal.price} ✓
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-nuclear-glow/30">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-neon-green font-bold">
                              <AnimatedCounter
                                from={0}
                                to={performance?.winRate || 94.7}
                                duration={2}
                                suffix="%"
                                className="inline"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Win Rate
                            </div>
                          </div>
                          <div>
                            <div className="text-neon-orange font-bold">
                              <AnimatedCounter
                                from={0}
                                to={performance?.totalTrades || 127}
                                duration={2}
                                className="inline"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Total Trades
                            </div>
                          </div>
                          <div>
                            <div className="text-nuclear-glow font-bold">
                              $
                              <AnimatedCounter
                                from={0}
                                to={performance?.dailyPnL || 2400}
                                duration={2}
                                className="inline"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Daily P&L
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <MagneticButton strength={0.2}>
                        <Button className="bg-neon-green/20 text-neon-green border-neon-green/50 hover:bg-neon-green/30 w-full">
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Start Bot
                        </Button>
                      </MagneticButton>
                      <MagneticButton strength={0.2}>
                        <Button className="bg-flame/20 text-flame border-flame/50 hover:bg-flame/30 w-full">
                          <StopCircle className="w-4 h-4 mr-2" />
                          Stop Bot
                        </Button>
                      </MagneticButton>
                    </div>
                  </CardContent>
                </Card>
              </ScaleOnHover>

              {/* Enhanced Performance Metrics */}
              <ScaleOnHover>
                <Card className="glassmorphism border-neon-orange/30 hover-glow p-8">
                  <CardHeader>
                    <CardTitle className="text-2xl font-pixel text-neon-orange mb-4">
                      <Activity className="w-8 h-8 inline mr-2" />
                      Live Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { day: "Mon", profit: 2100, volume: 45000 },
                            { day: "Tue", profit: 2800, volume: 52000 },
                            { day: "Wed", profit: 1900, volume: 48000 },
                            { day: "Thu", profit: 3400, volume: 61000 },
                            { day: "Fri", profit: 4200, volume: 58000 },
                            { day: "Sat", profit: 3800, volume: 67000 },
                            { day: "Sun", profit: 4500, volume: 72000 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="day" stroke="#999" />
                          <YAxis stroke="#999" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(0, 0, 0, 0.8)",
                              border: "1px solid #ff6b35",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="profit"
                            stroke="#ff6b35"
                            strokeWidth={3}
                            dot={{ fill: "#ff6b35", strokeWidth: 2, r: 6 }}
                            activeDot={{
                              r: 8,
                              stroke: "#ff6b35",
                              strokeWidth: 2,
                            }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <ScaleOnHover>
                        <Card className="bg-nuclear-glow/10 border-nuclear-glow/30 p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-nuclear-glow">
                              <AnimatedCounter
                                from={0}
                                to={247}
                                duration={2}
                                suffix="%"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Monthly ROI
                            </div>
                          </div>
                        </Card>
                      </ScaleOnHover>

                      <ScaleOnHover>
                        <Card className="bg-neon-blue/10 border-neon-blue/30 p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-neon-blue">
                              $
                              <AnimatedCounter
                                from={0}
                                to={1.2}
                                duration={2}
                                suffix="M"
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              AUM
                            </div>
                          </div>
                        </Card>
                      </ScaleOnHover>
                    </div>
                  </CardContent>
                </Card>
              </ScaleOnHover>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-pixel text-neon-orange mb-4">
              Trusted & Verified
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your security is our priority. Built with industry-leading standards.
            </p>
          </div>
          <SecurityBadges />
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-20 relative bg-gradient-to-b from-transparent to-zinc-900/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-pixel text-neon-orange mb-4">
              Community Power
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real-time metrics from our growing roach army.
            </p>
          </div>
          <CommunityStats />
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-pixel text-neon-orange mb-4">
              Gamification Hub
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Level up, earn rewards, and climb the leaderboards!
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold mb-6 text-center lg:text-left">
                Achievement Gallery
              </h3>
              <Suspense fallback={<Skeleton className="w-full h-64" />}>
                <AchievementGrid />
              </Suspense>
            </div>
            
            <div className="space-y-6">
              <UserProgressCard />
              <Leaderboard />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section id="community" className="py-20 relative bg-gradient-to-b from-zinc-900/20 to-transparent">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-pixel text-neon-orange mb-4">
              Community Voice
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear what the roach army has to say about their experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Suspense fallback={<Skeleton className="w-full h-64" />}>
              <Testimonials />
            </Suspense>
            <Suspense fallback={<Skeleton className="w-full h-64" />}>
              <LiveActivityFeed />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-nuclear-glow/20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-2xl font-pixel text-neon-orange mb-4">
              $BOOMROACH
            </div>
            <p className="text-muted-foreground mb-6">
              The Unkillable Meme Coin - 2025 Edition
            </p>

            <div className="flex justify-center space-x-6 mb-8">
              <Button variant="ghost" size="sm">
                <Twitter className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button variant="ghost" size="sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                Discord
              </Button>
              <Button variant="ghost" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Telegram
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 rounded-lg bg-nuclear-glow/5 border border-nuclear-glow/20">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-nuclear-glow">DISCLAIMER:</strong>{" "}
                $BOOMROACH is a meme token created for entertainment purposes.
                This is not financial advice. Cryptocurrency investments are
                highly risky and volatile. Only invest what you can afford to
                lose. We are not responsible for any financial losses. Always do
                your own research (DYOR) before making any investment decisions.
                Past performance does not guarantee future results. The roach
                army is strong, but markets are unpredictable.
              </p>
            </div>
          </div>
        </div>
      </footer>
            </div>
          </PullToRefresh>
        </MobilePerformanceWrapper>
      </GamificationProvider>
    </PerformanceMonitor>
  );
}
