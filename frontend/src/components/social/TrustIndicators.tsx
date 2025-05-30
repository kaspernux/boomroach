"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  Shield, 
  CheckCircle, 
  Star, 
  Users, 
  TrendingUp, 
  Lock,
  Award,
  Globe,
  Eye,
  Heart,
  MessageCircle,
  Share2
} from "lucide-react";

export const SecurityBadges: React.FC = React.memo(() => {
  const badges = [
    {
      id: 'audit',
      title: 'Smart Contract Audited',
      description: 'Audited by CertiK',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-green-400',
      bgColor: 'from-green-500/20 to-green-600/20 border-green-500/30'
    },
    {
      id: 'verified',
      title: 'Verified Contract',
      description: 'Source code verified on Solscan',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'text-blue-400',
      bgColor: 'from-blue-500/20 to-blue-600/20 border-blue-500/30'
    },
    {
      id: 'locked',
      title: 'Liquidity Locked',
      description: '100% liquidity locked for 2 years',
      icon: <Lock className="w-5 h-5" />,
      color: 'text-amber-400',
      bgColor: 'from-amber-500/20 to-amber-600/20 border-amber-500/30'
    },
    {
      id: 'rated',
      title: 'Community Rated',
      description: '4.8/5 stars from 2,847 reviews',
      icon: <Star className="w-5 h-5" />,
      color: 'text-purple-400',
      bgColor: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-lg bg-gradient-to-br ${badge.bgColor} backdrop-blur-sm border`}
        >
          <div className="flex items-center space-x-3">
            <div className={`${badge.color}`}>
              {badge.icon}
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{badge.title}</h3>
              <p className="text-xs text-zinc-300">{badge.description}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

SecurityBadges.displayName = "SecurityBadges";

export const CommunityStats: React.FC = React.memo(() => {
  const [stats, setStats] = useState({
    holders: 15847,
    volume24h: 2840000,
    marketCap: 45200000,
    transactions: 89654,
    activeUsers: 3421
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        holders: prev.holders + Math.floor(Math.random() * 5),
        volume24h: prev.volume24h + Math.floor(Math.random() * 10000),
        marketCap: prev.marketCap + Math.floor(Math.random() * 50000),
        transactions: prev.transactions + Math.floor(Math.random() * 3),
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const statItems = [
    {
      label: 'Total Holders',
      value: stats.holders.toLocaleString(),
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      label: '24h Volume',
      value: `$${(stats.volume24h / 1000000).toFixed(2)}M`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-green-400'
    },
    {
      label: 'Market Cap',
      value: `$${(stats.marketCap / 1000000).toFixed(1)}M`,
      icon: <Globe className="w-5 h-5" />,
      color: 'text-purple-400'
    },
    {
      label: 'Transactions',
      value: stats.transactions.toLocaleString(),
      icon: <Eye className="w-5 h-5" />,
      color: 'text-orange-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          whileHover={{ scale: 1.05 }}
          className="text-center p-4 rounded-lg bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 
                   border border-zinc-700/50 backdrop-blur-sm"
        >
          <div className={`${stat.color} flex justify-center mb-2`}>
            {stat.icon}
          </div>
          <p className="text-xl font-bold text-white">{stat.value}</p>
          <p className="text-sm text-zinc-400">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
});

CommunityStats.displayName = "CommunityStats";

export const Testimonials: React.FC = React.memo(() => {
  const testimonials = [
    {
      id: 1,
      name: "CryptoWolf",
      avatar: "🐺",
      text: "BoomRoach's Hydra Bot made me 500% gains in 2 weeks. Best trading bot on Solana!",
      rating: 5,
      verified: true
    },
    {
      id: 2,
      name: "DiamondHands",
      avatar: "💎",
      text: "The DAO governance is amazing. Real community-driven decisions and transparency.",
      rating: 5,
      verified: true
    },
    {
      id: 3,
      name: "SolanaKing",
      avatar: "👑",
      text: "Most innovative meme coin project I've seen. The tech behind it is solid.",
      rating: 5,
      verified: true
    },
    {
      id: 4,
      name: "DegenTrader",
      avatar: "🚀",
      text: "Love the gamification! Earning XP and badges makes trading so much more fun.",
      rating: 4,
      verified: true
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-orange-400" />
          <span>Community Testimonials</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-40 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <div className="flex items-start space-x-4">
                <div className="text-3xl">{testimonials[currentIndex].avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-white">{testimonials[currentIndex].name}</h3>
                    {testimonials[currentIndex].verified && (
                      <CheckCircle className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                  <p className="text-zinc-300 mb-3">{testimonials[currentIndex].text}</p>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`star-${i}`}
                        className={`w-4 h-4 ${
                          i < testimonials[currentIndex].rating 
                            ? 'text-amber-400 fill-current' 
                            : 'text-zinc-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center space-x-2 mt-4">
          {testimonials.map((_, index) => (
            <button
              key={`testimonial-${index}`}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-orange-400' : 'bg-zinc-600'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

Testimonials.displayName = "Testimonials";

export const LiveActivityFeed: React.FC = React.memo(() => {
  const [activities, setActivities] = useState([
    { id: 1, type: 'trade', user: '9WzDX...7Kp2', action: 'bought 1,000 $BOOMROACH', time: '2s ago' },
    { id: 2, type: 'vote', user: '7KpL2...9Wd8', action: 'voted on Proposal #15', time: '15s ago' },
    { id: 3, type: 'achievement', user: '5Wd8X...2KpL', action: 'unlocked Diamond Hands badge', time: '32s ago' },
    { id: 4, type: 'trade', user: '3KpL7...8Wd9', action: 'sold 500 $BOOMROACH', time: '1m ago' },
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'vote': return <Users className="w-4 h-4 text-blue-400" />;
      case 'achievement': return <Award className="w-4 h-4 text-amber-400" />;
      default: return <Heart className="w-4 h-4 text-red-400" />;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        type: ['trade', 'vote', 'achievement'][Math.floor(Math.random() * 3)],
        user: `${Math.random().toString(36).substr(2, 5)}...${Math.random().toString(36).substr(2, 4)}`,
        action: [
          'bought 250 $BOOMROACH',
          'voted on Proposal #16',
          'unlocked Whale Trader badge',
          'connected wallet',
          'sold 100 $BOOMROACH'
        ][Math.floor(Math.random() * 5)],
        time: 'just now'
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-green-400" />
          <span>Live Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center space-x-3 p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/30"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-mono text-orange-400">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-zinc-400">{activity.time}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
});

LiveActivityFeed.displayName = "LiveActivityFeed";