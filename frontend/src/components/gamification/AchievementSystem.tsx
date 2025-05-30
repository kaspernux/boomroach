"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Target, 
  Gift,
  Medal,
  Shield,
  Flame,
  Rocket
} from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  reward: string;
}

interface UserStats {
  level: number;
  xp: number;
  maxXp: number;
  walletsConnected: number;
  tradesSimulated: number;
  daoVotes: number;
  referrals: number;
  daysActive: number;
}

interface GamificationContextType {
  userStats: UserStats;
  achievements: Achievement[];
  updateStats: (statType: keyof UserStats, value: number) => void;
  showNotification: (achievement: Achievement) => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

const achievementsList: Achievement[] = [
  {
    id: 'first-wallet',
    title: 'First Connection',
    description: 'Connect your first wallet',
    icon: <Shield className="w-6 h-6" />,
    tier: 'bronze',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: '100 XP'
  },
  {
    id: 'whale-trader',
    title: 'Whale Trader',
    description: 'Simulate 10 trades with Hydra Bot',
    icon: <Rocket className="w-6 h-6" />,
    tier: 'silver',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: '500 XP + Trading Badge'
  },
  {
    id: 'dao-member',
    title: 'DAO Participant',
    description: 'Cast 5 votes in DAO governance',
    icon: <Crown className="w-6 h-6" />,
    tier: 'gold',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: '1000 XP + Governance Badge'
  },
  {
    id: 'community-builder',
    title: 'Community Builder',
    description: 'Refer 3 new members',
    icon: <Star className="w-6 h-6" />,
    tier: 'silver',
    progress: 0,
    maxProgress: 3,
    unlocked: false,
    reward: '750 XP + Builder Badge'
  },
  {
    id: 'diamond-hands',
    title: 'Diamond Hands',
    description: 'Stay active for 30 days',
    icon: <Trophy className="w-6 h-6" />,
    tier: 'diamond',
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    reward: '2500 XP + Diamond Badge'
  },
  {
    id: 'early-adopter',
    title: 'Early Adopter',
    description: 'One of the first 1000 users',
    icon: <Flame className="w-6 h-6" />,
    tier: 'gold',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: '1500 XP + Founder Badge'
  }
];

export const GamificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    maxXp: 1000,
    walletsConnected: 0,
    tradesSimulated: 0,
    daoVotes: 0,
    referrals: 0,
    daysActive: 1
  });

  const [achievements, setAchievements] = useState<Achievement[]>(achievementsList);
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  const updateStats = (statType: keyof UserStats, value: number) => {
    setUserStats(prev => {
      const newStats = { ...prev, [statType]: prev[statType] + value };
      
      // Level up logic
      if (newStats.xp >= newStats.maxXp) {
        newStats.level += 1;
        newStats.xp = 0;
        newStats.maxXp = Math.floor(newStats.maxXp * 1.5);
      }
      
      return newStats;
    });
  };

  const showNotification = (achievement: Achievement) => {
    setNotifications(prev => [...prev, achievement]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(a => a.id !== achievement.id));
    }, 5000);
  };

  // Check achievements
  useEffect(() => {
    setAchievements(prev => prev.map(achievement => {
      let progress = achievement.progress;
      
      switch (achievement.id) {
        case 'first-wallet':
          progress = userStats.walletsConnected;
          break;
        case 'whale-trader':
          progress = userStats.tradesSimulated;
          break;
        case 'dao-member':
          progress = userStats.daoVotes;
          break;
        case 'community-builder':
          progress = userStats.referrals;
          break;
        case 'diamond-hands':
          progress = userStats.daysActive;
          break;
        case 'early-adopter':
          progress = userStats.level > 1 ? 1 : 0;
          break;
      }
      
      const wasUnlocked = achievement.unlocked;
      const isUnlocked = progress >= achievement.maxProgress;
      
      if (!wasUnlocked && isUnlocked) {
        showNotification({ ...achievement, unlocked: true });
        // Award XP for achievement
        updateStats('xp', Number.parseInt(achievement.reward.split(' ')[0]));
      }
      
      return { ...achievement, progress, unlocked: isUnlocked };
    }));
  }, [userStats]);

  return (
    <GamificationContext.Provider value={{ userStats, achievements, updateStats, showNotification }}>
      {children}
      <AchievementNotifications notifications={notifications} />
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

const AchievementNotifications: React.FC<{ notifications: Achievement[] }> = ({ notifications }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 
                     backdrop-blur-lg rounded-lg p-4 max-w-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="text-amber-400">
                {achievement.icon}
              </div>
              <div>
                <p className="font-bold text-white">Achievement Unlocked!</p>
                <p className="text-sm text-amber-200">{achievement.title}</p>
                <p className="text-xs text-zinc-400">{achievement.reward}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export const UserProgressCard: React.FC = React.memo(() => {
  const { userStats } = useGamification();
  
  return (
    <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>Level {userStats.level}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>XP Progress</span>
            <span>{userStats.xp}/{userStats.maxXp}</span>
          </div>
          <Progress value={(userStats.xp / userStats.maxXp) * 100} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-center">
            <p className="text-zinc-400">Trades</p>
            <p className="font-bold text-orange-400">{userStats.tradesSimulated}</p>
          </div>
          <div className="text-center">
            <p className="text-zinc-400">DAO Votes</p>
            <p className="font-bold text-blue-400">{userStats.daoVotes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

UserProgressCard.displayName = "UserProgressCard";

export const AchievementGrid: React.FC = React.memo(() => {
  const { achievements } = useGamification();
  
  const tierColors = {
    bronze: 'from-amber-600/20 to-amber-800/20 border-amber-600/30',
    silver: 'from-slate-400/20 to-slate-600/20 border-slate-400/30',
    gold: 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30',
    diamond: 'from-cyan-400/20 to-blue-600/20 border-cyan-400/30'
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <motion.div
          key={achievement.id}
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg bg-gradient-to-br ${tierColors[achievement.tier]} 
                     backdrop-blur-sm border ${achievement.unlocked ? 'opacity-100' : 'opacity-60'}`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-white/20' : 'bg-zinc-800/50'}`}>
              {achievement.icon}
            </div>
            <div>
              <h3 className="font-bold text-white">{achievement.title}</h3>
              <Badge variant="outline" className="text-xs">
                {achievement.tier.toUpperCase()}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-zinc-300 mb-3">{achievement.description}</p>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{achievement.progress}/{achievement.maxProgress}</span>
            </div>
            <Progress 
              value={(achievement.progress / achievement.maxProgress) * 100} 
              className="h-1"
            />
          </div>
          
          {achievement.unlocked && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 text-xs text-amber-400 font-bold"
            >
              🎉 Reward: {achievement.reward}
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
});

AchievementGrid.displayName = "AchievementGrid";

export const Leaderboard: React.FC = React.memo(() => {
  const leaderboardData = [
    { rank: 1, address: "9WzDX...7Kp2", level: 15, xp: 12500, badge: "🏆" },
    { rank: 2, address: "7KpL2...9Wd8", level: 13, xp: 10200, badge: "🥈" },
    { rank: 3, address: "5Wd8X...2KpL", level: 12, xp: 9800, badge: "🥉" },
    { rank: 4, address: "3KpL7...8Wd9", level: 11, xp: 8500, badge: "⭐" },
    { rank: 5, address: "1Wd9K...7pL3", level: 10, xp: 7200, badge: "⭐" },
  ];
  
  return (
    <Card className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-amber-400" />
          <span>Top Holders Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboardData.map((user) => (
            <motion.div
              key={user.rank}
              whileHover={{ scale: 1.02 }}
              className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 
                       border border-zinc-700/30"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{user.badge}</span>
                <div>
                  <p className="font-mono text-sm">{user.address}</p>
                  <p className="text-xs text-zinc-400">Level {user.level}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-400">{user.xp.toLocaleString()} XP</p>
                <p className="text-xs text-zinc-400">#{user.rank}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

Leaderboard.displayName = "Leaderboard";