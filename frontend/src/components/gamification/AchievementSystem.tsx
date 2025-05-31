'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'

// Achievement types and interfaces
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'wallet' | 'trading' | 'dao' | 'social' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: Date
  reward?: {
    type: 'tokens' | 'nft' | 'badge' | 'access'
    amount?: number
    description: string
  }
}

export interface UserStats {
  level: number
  xp: number
  nextLevelXp: number
  totalTrades: number
  walletsConnected: number
  daoVotes: number
  tokensHeld: number
  referrals: number
  daysActive: number
}

interface GamificationContextType {
  achievements: Achievement[]
  userStats: UserStats
  updateStats: (stat: keyof UserStats, value: number) => void
  unlockAchievement: (achievementId: string) => void
  addXP: (amount: number) => void
  checkLevelUp: () => boolean
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first-connection',
    title: 'Nuclear Roach',
    description: 'Connect your first Solana wallet',
    icon: '⚡',
    type: 'wallet',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 100, description: '100 $BOOMROACH tokens' }
  },
  {
    id: 'curious-explorer',
    title: 'Curious Explorer',
    description: 'Visit the BoomRoach site and start exploring',
    icon: '🔍',
    type: 'special',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 50, description: '50 $BOOMROACH exploration bonus' }
  },
  {
    id: 'about-explorer',
    title: 'Knowledge Seeker',
    description: 'Explore the About section and learn about BoomRoach',
    icon: '📚',
    type: 'special',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 75, description: '75 $BOOMROACH knowledge bonus' }
  },
  {
    id: 'tokenomics-explorer',
    title: 'Economics Expert',
    description: 'Study the tokenomics and understand the economics',
    icon: '📊',
    type: 'special',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 75, description: '75 $BOOMROACH knowledge bonus' }
  },
  {
    id: 'hydra-explorer',
    title: 'AI Enthusiast',
    description: 'Explore the Hydra Bot section and learn about AI trading',
    icon: '🤖',
    type: 'special',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 150, description: '150 $BOOMROACH tech bonus' }
  },
  {
    id: 'roadmap-explorer',
    title: 'Future Visionary',
    description: 'Check out the roadmap and see the future plans',
    icon: '🗺️',
    type: 'special',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 100, description: '100 $BOOMROACH vision bonus' }
  },
  {
    id: 'community-voter',
    title: 'Democracy Champion',
    description: 'Participate in community voting',
    icon: '🗳️',
    type: 'dao',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 200, description: '200 $BOOMROACH democracy bonus' }
  },
  {
    id: 'first-trade',
    title: 'Trader Roach',
    description: 'Execute your first trade through Hydra Bot',
    icon: '💹',
    type: 'trading',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'nft', description: 'Exclusive Trader Roach NFT' }
  },
  {
    id: 'whale-holder',
    title: 'Whale Roach',
    description: 'Hold 1,000,000+ $BOOMROACH tokens',
    icon: '🐋',
    type: 'trading',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 1000000,
    unlocked: false,
    reward: { type: 'badge', description: 'Legendary Whale badge + VIP access' }
  },
  {
    id: 'survivor',
    title: 'Survivor Roach',
    description: 'Hold through 3 major market crashes',
    icon: '🛡️',
    type: 'special',
    rarity: 'epic',
    progress: 0,
    maxProgress: 3,
    unlocked: false,
    reward: { type: 'tokens', amount: 10000, description: '10,000 bonus tokens' }
  },
  {
    id: 'social-influencer',
    title: 'Influencer Roach',
    description: 'Refer 10 new members to the community',
    icon: '📢',
    type: 'social',
    rarity: 'epic',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'nft', description: 'Special Influencer NFT' }
  },
  {
    id: 'level-10',
    title: 'Veteran Roach',
    description: 'Reach level 10',
    icon: '⭐',
    type: 'special',
    rarity: 'rare',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'badge', description: 'Veteran status badge' }
  },
  {
    id: 'daily-streak',
    title: 'Loyal Roach',
    description: 'Stay active for 30 consecutive days',
    icon: '🔥',
    type: 'special',
    rarity: 'epic',
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    reward: { type: 'tokens', amount: 5000, description: '5,000 loyalty bonus tokens' }
  },
  {
    id: 'trader-veteran',
    title: 'Trading Veteran',
    description: 'Complete 10 successful trades',
    icon: '📈',
    type: 'trading',
    rarity: 'rare',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'nft', description: 'Veteran Trader NFT badge' }
  },
  {
    id: 'ai-follower',
    title: 'AI Enthusiast',
    description: 'Follow 5 AI trading signals',
    icon: '🤖',
    type: 'trading',
    rarity: 'common',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: 'tokens', amount: 250, description: '250 $BOOMROACH AI bonus' }
  },
  {
    id: 'profit-master',
    title: 'Profit Master',
    description: 'Achieve 100% portfolio gain',
    icon: '💰',
    type: 'trading',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    reward: { type: 'badge', description: 'Golden Roach title + VIP access' }
  },
  {
    id: 'community-champion',
    title: 'Community Champion',
    description: 'Send 100 messages in community chat',
    icon: '💬',
    type: 'social',
    rarity: 'rare',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    reward: { type: 'tokens', amount: 1000, description: '1,000 $BOOMROACH social bonus' }
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Join during the first week of launch',
    icon: '🐦',
    type: 'special',
    rarity: 'epic',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'nft', description: 'Exclusive Early Bird NFT' }
  },
  {
    id: 'diamond-hands',
    title: 'Diamond Hands',
    description: 'Hold tokens through 50% market dip',
    icon: '💎',
    type: 'special',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'badge', description: 'Diamond Hands legendary status' }
  },
  {
    id: 'speed-trader',
    title: 'Speed Trader',
    description: 'Execute 5 trades in under 1 minute',
    icon: '⚡',
    type: 'trading',
    rarity: 'epic',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    reward: { type: 'tokens', amount: 2000, description: '2,000 $BOOMROACH speed bonus' }
  },
  {
    id: 'challenge-master',
    title: 'Challenge Master',
    description: 'Complete 10 community challenges',
    icon: '🏆',
    type: 'special',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    reward: { type: 'badge', description: 'Master Champion title + exclusive perks' }
  },
  {
    id: 'referral-king',
    title: 'Referral King',
    description: 'Refer 25 new active users',
    icon: '👑',
    type: 'social',
    rarity: 'legendary',
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    reward: { type: 'tokens', amount: 10000, description: '10,000 $BOOMROACH + special title' }
  },
  {
    id: 'trading-explorer',
    title: 'Trading Explorer',
    description: 'Visit the Hydra trading platform',
    icon: '🚀',
    type: 'special',
    rarity: 'common',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    reward: { type: 'tokens', amount: 100, description: '100 $BOOMROACH exploration bonus' }
  }
]

const defaultUserStats: UserStats = {
  level: 1,
  xp: 0,
  nextLevelXp: 1000,
  totalTrades: 0,
  walletsConnected: 0,
  daoVotes: 0,
  tokensHeld: 0,
  referrals: 0,
  daysActive: 1
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements)
  const [userStats, setUserStats] = useState<UserStats>(defaultUserStats)
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([])
  const { connected, publicKey } = useWallet()

  // Load saved data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAchievements = localStorage.getItem('boomroach-achievements')
      const savedStats = localStorage.getItem('boomroach-stats')

      if (savedAchievements) {
        try {
          setAchievements(JSON.parse(savedAchievements))
        } catch (e) {
          console.error('Failed to load achievements:', e)
        }
      }

      if (savedStats) {
        try {
          setUserStats(JSON.parse(savedStats))
        } catch (e) {
          console.error('Failed to load stats:', e)
        }
      }
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boomroach-achievements', JSON.stringify(achievements))
    }
  }, [achievements])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boomroach-stats', JSON.stringify(userStats))
    }
  }, [userStats])

  // Check for wallet connection achievement
  useEffect(() => {
    if (connected && publicKey) {
      updateStats('walletsConnected', 1)
      checkAchievement('first-connection', 1)
    }
  }, [connected, publicKey])

  const updateStats = (stat: keyof UserStats, value: number) => {
    setUserStats(prev => ({
      ...prev,
      [stat]: stat === 'walletsConnected' || stat === 'daoVotes' || stat === 'totalTrades' || stat === 'referrals' || stat === 'daysActive'
        ? Math.max(prev[stat], value) // Don't decrease counters
        : value
    }))
  }

  const addXP = (amount: number) => {
    setUserStats(prev => {
      const newXP = prev.xp + amount
      const newLevel = Math.floor(newXP / 1000) + 1
      const nextLevelXp = newLevel * 1000

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        nextLevelXp
      }
    })
  }

  const checkLevelUp = (): boolean => {
    const newLevel = Math.floor(userStats.xp / 1000) + 1
    if (newLevel > userStats.level) {
      checkAchievement('level-10', newLevel >= 10 ? 1 : 0)
      return true
    }
    return false
  }

  const checkAchievement = (achievementId: string, progress: number) => {
    setAchievements(prev =>
      prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          const newProgress = Math.min(progress, achievement.maxProgress)
          const shouldUnlock = newProgress >= achievement.maxProgress

          if (shouldUnlock) {
            const updatedAchievement = {
              ...achievement,
              progress: newProgress,
              unlocked: true,
              unlockedAt: new Date()
            }

            // Add to newly unlocked for notifications
            setNewlyUnlocked(prev => [...prev, updatedAchievement])

            // Award XP based on rarity
            const xpReward = {
              common: 100,
              rare: 250,
              epic: 500,
              legendary: 1000
            }[achievement.rarity]

            addXP(xpReward)

            return updatedAchievement
          } else {
            return {
              ...achievement,
              progress: newProgress
            }
          }
        }
        return achievement
      })
    )
  }

  const unlockAchievement = (achievementId: string) => {
    checkAchievement(achievementId, 1)
  }

  const value = {
    achievements,
    userStats,
    updateStats,
    unlockAchievement,
    addXP,
    checkLevelUp
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
      <AchievementNotifications
        achievements={newlyUnlocked}
        onDismiss={(id) => setNewlyUnlocked(prev => prev.filter(a => a.id !== id))}
      />
    </GamificationContext.Provider>
  )
}

// Achievement notification component
function AchievementNotifications({
  achievements,
  onDismiss
}: {
  achievements: Achievement[]
  onDismiss: (id: string) => void
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="max-w-sm p-4 rounded-lg glassmorphism border border-neon-orange/50 bg-nuclear-gradient/20 shadow-2xl"
            onClick={() => onDismiss(achievement.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{achievement.icon}</div>
              <div className="flex-1">
                <h4 className="font-semibold text-neon-orange">Achievement Unlocked!</h4>
                <p className="text-sm font-medium">{achievement.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {achievement.description}
                </p>
                {achievement.reward && (
                  <div className="mt-2 p-2 rounded bg-background/50 border border-neon-green/30">
                    <div className="text-xs text-neon-green font-semibold">
                      🎁 {achievement.reward.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider')
  }
  return context
}
