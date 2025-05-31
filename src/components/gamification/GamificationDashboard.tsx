'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Star,
  Zap,
  Target,
  Award,
  Crown,
  Shield,
  Flame,
  Users,
  Activity,
  TrendingUp,
  Gift,
  Lock,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useGamification } from './AchievementSystem'
import { AnimatedCounter } from '@/components/animations/MobileAnimations'

export function GamificationDashboard() {
  const { achievements, userStats } = useGamification()

  const unlockedAchievements = achievements.filter(a => a.unlocked)
  const totalAchievements = achievements.length
  const completionRate = (unlockedAchievements.length / totalAchievements) * 100

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400/30'
      case 'rare': return 'text-blue-400 border-blue-400/30'
      case 'epic': return 'text-purple-400 border-purple-400/30'
      case 'legendary': return 'text-yellow-400 border-yellow-400/30'
      default: return 'text-gray-400 border-gray-400/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet': return <Shield className="w-4 h-4" />
      case 'trading': return <TrendingUp className="w-4 h-4" />
      case 'dao': return <Users className="w-4 h-4" />
      case 'social': return <Activity className="w-4 h-4" />
      case 'special': return <Star className="w-4 h-4" />
      default: return <Trophy className="w-4 h-4" />
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Player Stats */}
      <Card className="glassmorphism border-nuclear-glow/30">
        <CardHeader>
          <CardTitle className="flex items-center text-nuclear-glow">
            <Crown className="w-5 h-5 mr-2" />
            Player Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Level Progress */}
          <div className="text-center">
            <motion.div
              className="relative w-24 h-24 mx-auto mb-4"
              whileHover={{ scale: 1.1 }}
            >
              <div className="w-full h-full rounded-full bg-nuclear-gradient flex items-center justify-center">
                <span className="text-2xl font-bold text-background">{userStats.level}</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-nuclear-glow"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              />
            </motion.div>
            <h3 className="text-xl font-semibold text-nuclear-glow">Level {userStats.level}</h3>
            <p className="text-sm text-muted-foreground">Nuclear Roach</p>
          </div>

          {/* XP Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Experience</span>
              <span>{userStats.xp}/{userStats.nextLevelXp} XP</span>
            </div>
            <Progress
              value={(userStats.xp / userStats.nextLevelXp) * 100}
              className="h-3"
            />
            <div className="text-xs text-muted-foreground mt-1 text-center">
              {userStats.nextLevelXp - userStats.xp} XP to next level
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-neon-blue">
                <AnimatedCounter from={0} to={userStats.walletsConnected} />
              </div>
              <div className="text-xs text-muted-foreground">Wallets</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-neon-green">
                <AnimatedCounter from={0} to={userStats.daoVotes} />
              </div>
              <div className="text-xs text-muted-foreground">DAO Votes</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-neon-orange">
                <AnimatedCounter from={0} to={userStats.totalTrades} />
              </div>
              <div className="text-xs text-muted-foreground">Trades</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-background/50">
              <div className="text-lg font-bold text-nuclear-glow">
                <AnimatedCounter from={0} to={userStats.daysActive} />
              </div>
              <div className="text-xs text-muted-foreground">Days Active</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Progress */}
      <Card className="glassmorphism border-neon-orange/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-neon-orange">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Achievements
            </div>
            <Badge className="bg-neon-orange/20 text-neon-orange border-neon-orange/30">
              {unlockedAchievements.length}/{totalAchievements}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completion Rate */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{completionRate.toFixed(1)}%</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          {/* Recent Achievements */}
          <div>
            <h4 className="font-semibold mb-3 text-neon-orange">Recent Unlocks</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {unlockedAchievements.slice(-5).map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-background/50"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {achievement.description}
                    </div>
                  </div>
                  <Badge className={`${getRarityColor(achievement.rarity)} text-xs`}>
                    {achievement.rarity}
                  </Badge>
                </motion.div>
              ))}

              {unlockedAchievements.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No achievements unlocked yet</p>
                  <p className="text-xs">Start exploring to earn your first!</p>
                </div>
              )}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-neon-orange text-neon-orange hover:bg-neon-orange/10"
          >
            <Award className="w-4 h-4 mr-2" />
            View All Achievements
          </Button>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <Card className="glassmorphism border-neon-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center text-neon-blue">
            <Target className="w-5 h-5 mr-2" />
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {['wallet', 'trading', 'dao', 'social', 'special'].map((type) => {
              const typeAchievements = achievements.filter(a => a.type === type)
              const unlockedCount = typeAchievements.filter(a => a.unlocked).length
              const totalCount = typeAchievements.length
              const progress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0

              return (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  className="p-4 rounded-lg glassmorphism border border-neon-blue/20 text-center"
                >
                  <div className="text-neon-blue mb-2 flex justify-center">
                    {getTypeIcon(type)}
                  </div>
                  <div className="text-xs font-semibold capitalize mb-1">{type}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {unlockedCount}/{totalCount}
                  </div>
                  <Progress value={progress} className="h-1" />
                </motion.div>
              )
            })}
          </div>

          {/* Rarity Breakdown */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm text-neon-blue">By Rarity</h4>
            {['common', 'rare', 'epic', 'legendary'].map((rarity) => {
              const rarityAchievements = achievements.filter(a => a.rarity === rarity)
              const unlockedCount = rarityAchievements.filter(a => a.unlocked).length
              const totalCount = rarityAchievements.length

              if (totalCount === 0) return null

              return (
                <div key={rarity} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getRarityColor(rarity)} text-xs`}>
                      {rarity}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">
                    {unlockedCount}/{totalCount}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Next Achievement */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <h4 className="font-semibold text-sm text-neon-blue mb-2">Next Goal</h4>
            {(() => {
              const nextAchievement = achievements.find(a => !a.unlocked && a.progress < a.maxProgress)
              if (!nextAchievement) {
                return (
                  <div className="text-center py-2">
                    <CheckCircle className="w-6 h-6 mx-auto text-neon-green mb-1" />
                    <p className="text-xs text-neon-green">All achievements unlocked!</p>
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{nextAchievement.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{nextAchievement.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {nextAchievement.progress}/{nextAchievement.maxProgress}
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={(nextAchievement.progress / nextAchievement.maxProgress) * 100}
                    className="h-1"
                  />
                </div>
              )
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
