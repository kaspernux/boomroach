'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  Crown,
  Sword,
  Shield,
  Trophy,
  Star,
  Flame,
  Target,
  Zap,
  Gift,
  Award,
  Flag,
  Settings,
  UserPlus,
  MessageCircle,
  Calendar,
  TrendingUp,
  BarChart3,
  Coins,
  Lock,
  Unlock,
  Rocket,
  Bot,
  Heart,
  Gem,
  Medal,
  Sparkles
} from 'lucide-react'
import { useGamification } from './AchievementSystem'

interface Guild {
  id: string
  name: string
  description: string
  logo: string
  level: number
  experience: number
  nextLevelXp: number
  memberCount: number
  maxMembers: number
  totalPower: number
  rank: number
  founded: Date
  isPublic: boolean
  requirements: {
    minLevel: number
    minTradingVolume?: number
    applicationRequired: boolean
  }
  perks: {
    xpBonus: number
    tradingFeeDiscount: number
    exclusiveQuests: boolean
    customChannels: boolean
  }
  currentWar?: {
    opponent: string
    startTime: Date
    endTime: Date
    score: { us: number, them: number }
  }
}

interface GuildMember {
  id: string
  username: string
  level: number
  role: 'leader' | 'officer' | 'member'
  joinDate: Date
  contribution: number
  weeklyActivity: number
  avatar?: string
  badges: string[]
  isOnline: boolean
  lastSeen?: Date
}

interface GuildQuest {
  id: string
  title: string
  description: string
  type: 'collaborative' | 'competitive' | 'raid'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
  progress: number
  maxProgress: number
  participatingMembers: number
  rewards: {
    guildXp: number
    memberTokens: number
    guildUpgrades?: string[]
    specialRewards?: string[]
  }
  timeLeft: number
  isActive: boolean
  requirements: {
    minMembers: number
    roles?: string[]
  }
}

interface GuildWar {
  id: string
  opponent: Guild
  startTime: Date
  endTime: Date
  objectives: {
    id: string
    name: string
    description: string
    points: number
    completed: boolean
    completedBy?: string
  }[]
  score: { us: number, them: number }
  status: 'upcoming' | 'active' | 'completed'
  rewards: {
    winner: { guildXp: number, tokens: number, title: string }
    participant: { guildXp: number, tokens: number }
  }
}

// Mock data
const mockGuild: Guild = {
  id: 'guild-1',
  name: 'Nuclear Roach Empire',
  description: 'The most elite trading guild in the BoomRoach ecosystem. We dominate markets and survive everything.',
  logo: 'https://ext.same-assets.com/3224214395/4224792650.png',
  level: 15,
  experience: 45000,
  nextLevelXp: 50000,
  memberCount: 28,
  maxMembers: 50,
  totalPower: 156750,
  rank: 3,
  founded: new Date('2024-10-15'),
  isPublic: false,
  requirements: {
    minLevel: 10,
    minTradingVolume: 50000,
    applicationRequired: true
  },
  perks: {
    xpBonus: 25,
    tradingFeeDiscount: 15,
    exclusiveQuests: true,
    customChannels: true
  },
  currentWar: {
    opponent: 'Crypto Dominators',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() + 86400000 * 2),
    score: { us: 1840, them: 1650 }
  }
}

const mockMembers: GuildMember[] = [
  {
    id: '1',
    username: 'NuclearCommander',
    level: 32,
    role: 'leader',
    joinDate: new Date('2024-10-15'),
    contribution: 15680,
    weeklyActivity: 94,
    badges: ['founder', 'legend', 'whale'],
    isOnline: true
  },
  {
    id: '2',
    username: 'TradingMaster47',
    level: 28,
    role: 'officer',
    joinDate: new Date('2024-10-20'),
    contribution: 12340,
    weeklyActivity: 87,
    badges: ['master', 'trader'],
    isOnline: true
  },
  {
    id: '3',
    username: 'RoachSurvivor',
    level: 24,
    role: 'officer',
    joinDate: new Date('2024-11-01'),
    contribution: 9870,
    weeklyActivity: 76,
    badges: ['survivor', 'veteran'],
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000)
  },
  {
    id: '4',
    username: 'CryptoNinja',
    level: 22,
    role: 'member',
    joinDate: new Date('2024-11-15'),
    contribution: 7560,
    weeklyActivity: 82,
    badges: ['ninja', 'active'],
    isOnline: true
  },
  {
    id: '5',
    username: 'You',
    level: 20,
    role: 'member',
    joinDate: new Date('2024-12-01'),
    contribution: 5240,
    weeklyActivity: 68,
    badges: ['verified', 'newcomer'],
    isOnline: true
  }
]

const mockGuildQuests: GuildQuest[] = [
  {
    id: 'quest-1',
    title: 'Guild Profit Domination',
    description: 'Collectively earn 1,000,000 tokens in trading profits',
    type: 'collaborative',
    difficulty: 'hard',
    progress: 750000,
    maxProgress: 1000000,
    participatingMembers: 18,
    rewards: {
      guildXp: 5000,
      memberTokens: 2000,
      guildUpgrades: ['Level 2 Trading Hub'],
      specialRewards: ['Exclusive Guild NFT']
    },
    timeLeft: 432000, // 5 days
    isActive: true,
    requirements: {
      minMembers: 15
    }
  },
  {
    id: 'quest-2',
    title: 'Nuclear Roach Raid',
    description: 'Defeat the legendary Nuclear Dragon in the guild dungeon',
    type: 'raid',
    difficulty: 'legendary',
    progress: 2,
    maxProgress: 5,
    participatingMembers: 8,
    rewards: {
      guildXp: 10000,
      memberTokens: 5000,
      specialRewards: ['Dragon Slayer Title', 'Legendary Nuclear Artifact']
    },
    timeLeft: 172800, // 2 days
    isActive: true,
    requirements: {
      minMembers: 5,
      roles: ['officer', 'leader']
    }
  }
]

export function GuildSystem() {
  const [guild, setGuild] = useState<Guild>(mockGuild)
  const [members, setMembers] = useState<GuildMember[]>(mockMembers)
  const [guildQuests, setGuildQuests] = useState<GuildQuest[]>(mockGuildQuests)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedMember, setSelectedMember] = useState<GuildMember | null>(null)
  const { userStats } = useGamification()

  const formatTimeLeft = (seconds: number): string => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    return `${days}d ${hours}h`
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader': return <Crown className="w-4 h-4 text-yellow-400" />
      case 'officer': return <Star className="w-4 h-4 text-purple-400" />
      default: return <Users className="w-4 h-4 text-blue-400" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-400'
      case 'officer': return 'text-purple-400'
      default: return 'text-blue-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Guild Header */}
      <Card className="glassmorphism border-nuclear-glow/30 bg-nuclear-gradient/10">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg bg-nuclear-gradient flex items-center justify-center">
                <img src={guild.logo} alt={guild.name} className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-nuclear-glow">{guild.name}</h2>
                <p className="text-muted-foreground mb-2">{guild.description}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
                    Level {guild.level}
                  </Badge>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{guild.memberCount}/{guild.maxMembers}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4" />
                    <span>Rank #{guild.rank}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-neon-orange">
                {guild.totalPower.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Guild Power</div>

              {guild.currentWar && (
                <div className="mt-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                  <div className="text-sm font-semibold text-red-400 mb-1">
                    🔥 WAR ACTIVE
                  </div>
                  <div className="text-xs text-muted-foreground">
                    vs {guild.currentWar.opponent}
                  </div>
                  <div className="text-lg font-bold">
                    {guild.currentWar.score.us} - {guild.currentWar.score.them}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Guild Level Progress */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Guild Experience</span>
              <span>{guild.experience.toLocaleString()} / {guild.nextLevelXp.toLocaleString()}</span>
            </div>
            <Progress value={(guild.experience / guild.nextLevelXp) * 100} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Main Guild Interface */}
      <Card className="glassmorphism border-neon-blue/30">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-neon-blue">
            <Shield className="w-6 h-6" />
            <span>Guild Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="quests">Quests</TabsTrigger>
              <TabsTrigger value="wars">Wars</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <GuildOverview guild={guild} />
            </TabsContent>

            {/* Members Tab */}
            <TabsContent value="members" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Guild Members ({members.length})</h3>
                <Button size="sm" className="bg-neon-green/20 text-neon-green hover:bg-neon-green/30">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    index={index}
                    onClick={() => setSelectedMember(member)}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Guild Quests Tab */}
            <TabsContent value="quests" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Active Guild Quests</h3>
                <Badge className="bg-nuclear-glow/20 text-nuclear-glow border-nuclear-glow/30">
                  {guildQuests.filter(q => q.isActive).length} Active
                </Badge>
              </div>

              {guildQuests.filter(q => q.isActive).map((quest, index) => (
                <GuildQuestCard key={quest.id} quest={quest} index={index} />
              ))}
            </TabsContent>

            {/* Guild Wars Tab */}
            <TabsContent value="wars">
              <GuildWarsPanel guild={guild} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <GuildSettings guild={guild} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Guild Overview Component
function GuildOverview({ guild }: { guild: Guild }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="glassmorphism border-neon-green/30">
        <CardContent className="p-6 text-center">
          <Zap className="w-12 h-12 text-neon-green mx-auto mb-4" />
          <div className="text-2xl font-bold text-neon-green mb-2">
            +{guild.perks.xpBonus}%
          </div>
          <div className="text-sm text-muted-foreground">XP Bonus</div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-neon-orange/30">
        <CardContent className="p-6 text-center">
          <Coins className="w-12 h-12 text-neon-orange mx-auto mb-4" />
          <div className="text-2xl font-bold text-neon-orange mb-2">
            -{guild.perks.tradingFeeDiscount}%
          </div>
          <div className="text-sm text-muted-foreground">Trading Fees</div>
        </CardContent>
      </Card>

      <Card className="glassmorphism border-nuclear-glow/30">
        <CardContent className="p-6 text-center">
          <Gift className="w-12 h-12 text-nuclear-glow mx-auto mb-4" />
          <div className="text-2xl font-bold text-nuclear-glow mb-2">
            {guild.perks.exclusiveQuests ? 'YES' : 'NO'}
          </div>
          <div className="text-sm text-muted-foreground">Exclusive Quests</div>
        </CardContent>
      </Card>
    </div>
  )
}

// Member Card Component
function MemberCard({
  member,
  index,
  onClick
}: {
  member: GuildMember
  index: number
  onClick: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
        member.username === 'You'
          ? 'bg-nuclear-glow/20 border border-nuclear-glow/30'
          : 'glassmorphism border-nuclear-glow/20'
      } hover:border-nuclear-glow/40`}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={member.avatar} />
            <AvatarFallback>{member.username[0]}</AvatarFallback>
          </Avatar>
          {member.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-background" />
          )}
        </div>

        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold">{member.username}</span>
            {getRoleIcon(member.role)}
            {member.username === 'You' && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                You
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Level {member.level}</span>
            <span>•</span>
            <span className={getRoleColor(member.role)}>{member.role}</span>
            <span>•</span>
            <span>{member.weeklyActivity}% active</span>
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="font-bold text-nuclear-glow">
          {member.contribution.toLocaleString()}
        </div>
        <div className="text-sm text-muted-foreground">Contribution</div>
      </div>
    </motion.div>
  )
}

// Guild Quest Card Component
function GuildQuestCard({ quest, index }: { quest: GuildQuest; index: number }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-400/30'
      case 'medium': return 'text-yellow-400 border-yellow-400/30'
      case 'hard': return 'text-orange-400 border-orange-400/30'
      case 'legendary': return 'text-purple-400 border-purple-400/30'
      default: return 'text-gray-400 border-gray-400/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'collaborative': return <Users className="w-5 h-5" />
      case 'competitive': return <Sword className="w-5 h-5" />
      case 'raid': return <Target className="w-5 h-5" />
      default: return <Trophy className="w-5 h-5" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glassmorphism border-nuclear-glow/20 rounded-lg p-4 hover:border-nuclear-glow/40 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-nuclear-glow/20 text-nuclear-glow">
            {getTypeIcon(quest.type)}
          </div>
          <div>
            <h4 className="font-semibold">{quest.title}</h4>
            <p className="text-sm text-muted-foreground">{quest.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={`${getDifficultyColor(quest.difficulty)} capitalize text-xs`}>
            {quest.difficulty}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {quest.participatingMembers} members
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{quest.progress.toLocaleString()} / {quest.maxProgress.toLocaleString()}</span>
        </div>
        <Progress
          value={(quest.progress / quest.maxProgress) * 100}
          className="h-2"
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-nuclear-glow" />
              <span>{quest.rewards.guildXp} Guild XP</span>
            </span>
            <span className="flex items-center space-x-1">
              <Coins className="w-3 h-3 text-neon-orange" />
              <span>{quest.rewards.memberTokens} tokens each</span>
            </span>
          </div>

          <Badge variant="outline" className="text-xs">
            {formatTimeLeft(quest.timeLeft)} left
          </Badge>
        </div>
      </div>
    </motion.div>
  )
}

// Guild Wars Panel
function GuildWarsPanel({ guild }: { guild: Guild }) {
  if (!guild.currentWar) {
    return (
      <div className="text-center py-12">
        <Sword className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Active Wars</h3>
        <p className="text-muted-foreground mb-4">
          Challenge other guilds to epic battles and earn exclusive rewards!
        </p>
        <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30">
          <Sword className="w-4 h-4 mr-2" />
          Declare War
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-red-500/30 bg-red-500/10">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-red-400 mb-2">
              ⚔️ WAR IN PROGRESS
            </h3>
            <p className="text-muted-foreground">
              vs {guild.currentWar.opponent}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-neon-green">
                {guild.currentWar.score.us}
              </div>
              <div className="text-sm text-muted-foreground">Our Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">VS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">
                {guild.currentWar.score.them}
              </div>
              <div className="text-sm text-muted-foreground">Their Score</div>
            </div>
          </div>

          <div className="text-center">
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {formatTimeLeft((guild.currentWar.endTime.getTime() - Date.now()) / 1000)} remaining
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Guild Settings
function GuildSettings({ guild }: { guild: Guild }) {
  return (
    <div className="space-y-6">
      <Card className="glassmorphism border-neon-orange/30">
        <CardHeader>
          <CardTitle className="text-neon-orange">Guild Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Minimum Level</span>
            <Input
              type="number"
              value={guild.requirements.minLevel}
              className="w-20"
              disabled
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Application Required</span>
            <Badge className={guild.requirements.applicationRequired ? 'bg-neon-green/20 text-neon-green' : 'bg-red-400/20 text-red-400'}>
              {guild.requirements.applicationRequired ? 'Yes' : 'No'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Public Guild</span>
            <Badge className={guild.isPublic ? 'bg-neon-green/20 text-neon-green' : 'bg-red-400/20 text-red-400'}>
              {guild.isPublic ? 'Yes' : 'No'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Member Detail Modal
function MemberDetailModal({
  member,
  onClose
}: {
  member: GuildMember
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-background rounded-lg border border-nuclear-glow/30 p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <Avatar className="w-20 h-20 mx-auto mb-4">
            <AvatarImage src={member.avatar} />
            <AvatarFallback className="text-xl">{member.username[0]}</AvatarFallback>
          </Avatar>
          <h3 className="text-xl font-bold">{member.username}</h3>
          <div className="flex items-center justify-center space-x-2 mt-2">
            {getRoleIcon(member.role)}
            <span className={`${getRoleColor(member.role)} capitalize`}>{member.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nuclear-glow">{member.level}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-neon-orange">{member.contribution.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Contribution</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-lg font-bold text-neon-green">{member.weeklyActivity}%</div>
            <div className="text-sm text-muted-foreground">Weekly Activity</div>
          </div>

          <div>
            <div className="text-sm font-semibold mb-2">Badges:</div>
            <div className="flex flex-wrap gap-2">
              {member.badges.map((badge, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <Button onClick={onClose} className="flex-1">
            Close
          </Button>
          {member.username !== 'You' && (
            <Button variant="outline" className="flex-1">
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function formatTimeLeft(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}d ${hours}h`
}
