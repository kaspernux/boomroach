'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageCircle,
  Send,
  Users,
  Trophy,
  Crown,
  Zap,
  Heart,
  Smile,
  Gift,
  Flag,
  Star,
  TrendingUp,
  Activity,
  Timer,
  Target,
  Award,
  Bot,
  Flame,
  ThumbsUp,
  MessageSquare,
  Hash,
  Volume2,
  VolumeX,
  Settings,
  CheckCircle
} from 'lucide-react'
import { useGamification } from '@/components/gamification/AchievementSystem'

interface ChatMessage {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
    level: number
    badges: string[]
    isVip?: boolean
    isModerator?: boolean
  }
  content: string
  timestamp: Date
  type: 'message' | 'system' | 'achievement' | 'trade' | 'tip'
  reactions?: { emoji: string; count: number; users: string[] }[]
  isHighlighted?: boolean
  mentionedUsers?: string[]
  attachments?: { type: 'image' | 'gif'; url: string }[]
}

interface CommunityChallenge {
  id: string
  title: string
  description: string
  type: 'trading' | 'social' | 'community' | 'achievement'
  goal: number
  current: number
  endTime: Date
  participants: number
  rewards: {
    type: 'tokens' | 'nft' | 'badge' | 'title'
    amount?: number
    description: string
  }[]
  status: 'active' | 'completed' | 'upcoming'
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary'
}

// Create stable timestamp for SSR consistency
const baseTime = new Date('2025-01-01T12:00:00Z').getTime()

// Stable time formatter to avoid hydration mismatch
const formatTime = (date: Date): string => {
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

const mockMessages: ChatMessage[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      name: 'RoachKing',
      avatar: '/api/placeholder/32/32',
      level: 15,
      badges: ['early-adopter', 'whale'],
      isVip: true
    },
    content: 'Just made 500% on that last Hydra Bot signal! 🚀',
    timestamp: new Date(baseTime - 120000),
    type: 'message',
    reactions: [
      { emoji: '🚀', count: 12, users: ['user2', 'user3'] },
      { emoji: '💎', count: 8, users: ['user4', 'user5'] }
    ]
  },
  {
    id: '2',
    user: {
      id: 'user2',
      name: 'CryptoSurvivor',
      avatar: '/api/placeholder/32/32',
      level: 8,
      badges: ['trader'],
      isModerator: true
    },
    content: 'Welcome all new roaches! 🪳 Remember to check out the staking rewards!',
    timestamp: new Date(baseTime - 300000),
    type: 'message',
    isHighlighted: true
  },
  {
    id: '3',
    user: {
      id: 'system',
      name: 'Hydra Bot',
      avatar: '/api/placeholder/32/32',
      level: 999,
      badges: ['ai', 'bot']
    },
    content: 'New trading signal detected: SOL/USDC - 94.7% confidence',
    timestamp: new Date(baseTime - 180000),
    type: 'trade'
  }
]

const mockChallenges: CommunityChallenge[] = [
  {
    id: 'challenge-1',
    title: 'Diamond Hands Challenge',
    description: 'Hold $BOOMROACH for 30 consecutive days without selling',
    type: 'trading',
    goal: 1000,
    current: 347,
    endTime: new Date(baseTime + 86400000 * 7),
    participants: 2847,
    rewards: [
      { type: 'tokens', amount: 10000, description: '10K $BOOMROACH bonus' },
      { type: 'badge', description: 'Diamond Hands NFT Badge' },
      { type: 'title', description: 'Diamond Survivor Title' }
    ],
    status: 'active',
    difficulty: 'medium'
  },
  {
    id: 'challenge-2',
    title: 'Roach Army Recruitment',
    description: 'Invite 10 new members to join the community',
    type: 'social',
    goal: 500,
    current: 823,
    endTime: new Date(baseTime + 86400000 * 14),
    participants: 1456,
    rewards: [
      { type: 'tokens', amount: 5000, description: '5K $BOOMROACH per referral' },
      { type: 'nft', description: 'Exclusive Recruiter NFT' }
    ],
    status: 'completed',
    difficulty: 'easy'
  },
  {
    id: 'challenge-3',
    title: 'Trading Master Class',
    description: 'Complete 100 successful trades with 90%+ win rate',
    type: 'trading',
    goal: 100,
    current: 67,
    endTime: new Date(Date.now() + 86400000 * 21),
    participants: 234,
    rewards: [
      { type: 'tokens', amount: 25000, description: '25K $BOOMROACH bonus' },
      { type: 'title', description: 'Master Trader Title' },
      { type: 'badge', description: 'Trading Legend Badge' }
    ],
    status: 'active',
    difficulty: 'hard'
  },
  {
    id: 'challenge-4',
    title: 'Nuclear Roach Evolution',
    description: 'Reach level 20 and unlock all achievements',
    type: 'achievement',
    goal: 20,
    current: 13,
    endTime: new Date(Date.now() + 86400000 * 30),
    participants: 89,
    rewards: [
      { type: 'tokens', amount: 50000, description: '50K $BOOMROACH ultimate reward' },
      { type: 'nft', description: 'Legendary Nuclear Roach NFT' },
      { type: 'title', description: 'Nuclear Legend Title' }
    ],
    status: 'active',
    difficulty: 'legendary'
  }
]

// Chat Component
export function RealtimeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState(2847)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { updateStats } = useGamification()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Simulate real-time messages
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMessages = [
        'Hydra Bot just made another profitable trade! 💰',
        'New whale just joined the army! 🐋',
        'Price pumping! HODL strong! 💎🙌',
        'Community vote is live - check the DAO!',
        'Achievement unlocked by @CryptoNinja! 🏆'
      ]

      const randomMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        user: {
          id: `user-${Math.random()}`,
          name: `Roach${Math.floor(Math.random() * 1000)}`,
          level: Math.floor(Math.random() * 20) + 1,
          badges: ['member']
        },
        content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
        timestamp: new Date(),
        type: 'message'
      }

      setMessages(prev => [...prev.slice(-20), randomMessage])
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 5) - 2)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const sendMessage = () => {
    if (!newMessage.trim()) return

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: {
        id: 'current-user',
        name: 'You',
        level: 7,
        badges: ['verified']
      },
      content: newMessage,
      timestamp: new Date(),
      type: 'message'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    updateStats('daysActive', 1)
  }

  const addReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji)
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1 }
                : r
            )
          }
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1, users: ['current-user'] }]
          }
        }
      }
      return msg
    }))
  }

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'early-adopter': return <Star className="w-3 h-3 text-yellow-400" />
      case 'whale': return <Crown className="w-3 h-3 text-purple-400" />
      case 'trader': return <TrendingUp className="w-3 h-3 text-green-400" />
      case 'ai': return <Bot className="w-3 h-3 text-blue-400" />
      case 'bot': return <Bot className="w-3 h-3 text-cyan-400" />
      default: return <Users className="w-3 h-3 text-gray-400" />
    }
  }

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'system': return 'border-blue-500/30 bg-blue-500/5'
      case 'achievement': return 'border-yellow-500/30 bg-yellow-500/5'
      case 'trade': return 'border-green-500/30 bg-green-500/5'
      case 'tip': return 'border-purple-500/30 bg-purple-500/5'
      default: return 'border-muted/30'
    }
  }

  return (
    <Card className="glassmorphism border-neon-blue/30 h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-neon-blue">
            <MessageCircle className="w-5 h-5 mr-2" />
            Roach Army Chat
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
              <Activity className="w-3 h-3 mr-1" />
              {onlineUsers.toLocaleString()} online
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-3 rounded-lg transition-all ${getMessageTypeColor(message.type)} ${
                  message.isHighlighted ? 'ring-1 ring-neon-orange/50' : ''
                }`}
              >
                <div className="flex items-start space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={message.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {message.user.name[0]}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`text-sm font-semibold ${
                        message.user.isVip ? 'text-purple-400' :
                        message.user.isModerator ? 'text-orange-400' :
                        'text-foreground'
                      }`}>
                        {message.user.name}
                      </span>

                      <Badge className="text-xs px-1 py-0">
                        Lv.{message.user.level}
                      </Badge>

                      <div className="flex space-x-1">
                        {message.user.badges.map((badge, index) => (
                          <div key={`badge-${index}`} title={badge}>
                            {getBadgeIcon(badge)}
                          </div>
                        ))}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    <p className="text-sm break-words">{message.content}</p>

                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex space-x-2 mt-2">
                        {message.reactions.map((reaction, index) => (
                          <motion.button
                            key={`reaction-${index}`}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-background/50 text-xs hover:bg-background/80 transition-colors"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-muted-foreground">{reaction.count}</span>
                          </motion.button>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addReaction(message.id, '👍')}
                          className="p-1 h-6 w-6"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="text-xs text-muted-foreground mb-2"
            >
              <div className="flex items-center space-x-1">
                <span>RoachTrader is typing</span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-neon-orange rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        delay: i * 0.2
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage()
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Community Challenges Component
export function CommunityChallenges() {
  const [challenges] = useState<CommunityChallenge[]>(mockChallenges)
  const [activeTab, setActiveTab] = useState('active')
  const { unlockAchievement } = useGamification()

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
      case 'trading': return <TrendingUp className="w-4 h-4" />
      case 'social': return <Users className="w-4 h-4" />
      case 'community': return <Heart className="w-4 h-4" />
      case 'achievement': return <Trophy className="w-4 h-4" />
      default: return <Target className="w-4 h-4" />
    }
  }

  const joinChallenge = (challengeId: string) => {
    // Simulate joining challenge
    unlockAchievement('challenge-participant')
  }

  const activeChallenges = challenges.filter(c => c.status === 'active')
  const completedChallenges = challenges.filter(c => c.status === 'completed')

  return (
    <Card className="glassmorphism border-nuclear-glow/30">
      <CardHeader>
        <CardTitle className="flex items-center text-nuclear-glow">
          <Trophy className="w-5 h-5 mr-2" />
          Community Challenges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Active ({activeChallenges.length})</span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>Completed ({completedChallenges.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg glassmorphism border border-nuclear-glow/20 hover:border-nuclear-glow/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-nuclear-glow/20 text-nuclear-glow">
                      {getTypeIcon(challenge.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                  </div>
                  <Badge className={`${getDifficultyColor(challenge.difficulty)} capitalize`}>
                    {challenge.difficulty}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{challenge.current}/{challenge.goal}</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-nuclear-glow rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(challenge.current / challenge.goal) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{challenge.participants.toLocaleString()} participants</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Timer className="w-3 h-3" />
                        <span>{Math.ceil((challenge.endTime.getTime() - baseTime) / (1000 * 60 * 60 * 24))} days left</span>
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => joinChallenge(challenge.id)}
                      className="bg-nuclear-glow/20 text-nuclear-glow hover:bg-nuclear-glow/30"
                    >
                      Join Challenge
                    </Button>
                  </div>

                  {/* Rewards */}
                  <div className="pt-3 border-t border-border/50">
                    <div className="text-xs font-semibold text-nuclear-glow mb-2">Rewards:</div>
                    <div className="flex flex-wrap gap-2">
                      {challenge.rewards.map((reward, index) => (
                        <Badge key={`reward-${index}`} variant="outline" className="text-xs">
                          <Gift className="w-3 h-3 mr-1" />
                          {reward.description}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg glassmorphism border border-neon-green/20 opacity-75"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-neon-green/20 text-neon-green">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">Challenge completed!</p>
                    </div>
                  </div>
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                </div>

                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="text-xs text-muted-foreground">
                    {challenge.participants.toLocaleString()} roaches participated and earned rewards!
                  </div>
                </div>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Combined Chat and Challenges Component
export function CommunityHub() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RealtimeChat />
      <CommunityChallenges />
    </div>
  )
}
