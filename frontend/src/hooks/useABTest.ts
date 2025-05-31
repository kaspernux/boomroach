'use client'

import { useState, useEffect } from 'react'

interface ABTestVariant {
  id: string
  weight: number
  config?: Record<string, any>
}

interface ABTestConfig {
  testId: string
  variants: ABTestVariant[]
  enabled: boolean
  description?: string
}

interface UseABTestReturn {
  variant: string
  trackConversion: (eventName: string, value?: number) => void
  isVariant: (variantId: string) => boolean
}

// A/B Test configurations
export const AB_TESTS = {
  HERO_CTA: {
    testId: 'hero_cta_optimization',
    enabled: true,
    description: 'Test different CTA layouts in hero section',
    variants: [
      { id: 'control', weight: 50 },
      { id: 'multiple_ctas', weight: 50 }
    ]
  },
  ACHIEVEMENT_POSITION: {
    testId: 'achievement_notification_position',
    enabled: true,
    description: 'Test achievement notification positioning',
    variants: [
      { id: 'top_right', weight: 50 },
      { id: 'bottom_right', weight: 50 }
    ]
  },
  COMMUNITY_LAYOUT: {
    testId: 'community_section_layout',
    enabled: true,
    description: 'Test community section layout variations',
    variants: [
      { id: 'horizontal', weight: 50 },
      { id: 'vertical', weight: 50 }
    ]
  }
} as const

// Hash function for consistent user assignment
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Get user ID for consistent variant assignment
function getUserId(): string {
  if (typeof window === 'undefined') return 'ssr-user'

  let userId = localStorage.getItem('boomroach-user-id')
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('boomroach-user-id', userId)
  }
  return userId
}

// Assign variant based on user ID and weights
function assignVariant(testConfig: ABTestConfig, userId: string): string {
  if (!testConfig.enabled) return testConfig.variants[0].id

  const hash = hashString(`${testConfig.testId}-${userId}`)
  const totalWeight = testConfig.variants.reduce((sum, v) => sum + v.weight, 0)
  const bucket = hash % totalWeight

  let currentWeight = 0
  for (const variant of testConfig.variants) {
    currentWeight += variant.weight
    if (bucket < currentWeight) {
      return variant.id
    }
  }

  return testConfig.variants[0].id
}

// Track conversion events to Google Analytics
function trackEvent(testId: string, eventName: string, variantId: string, value?: number) {
  if (typeof window === 'undefined') return

  // Google Analytics 4 tracking
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', eventName, {
      custom_parameter_1: testId,
      custom_parameter_2: variantId,
      value: value || 1
    })
  }

  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`AB Test Event: ${testId} | ${variantId} | ${eventName}`, value || 1)
  }
}

export function useABTest(testConfig: ABTestConfig): UseABTestReturn {
  const [variant, setVariant] = useState<string>(testConfig.variants[0].id)
  const [userId, setUserId] = useState<string>('ssr-user')

  useEffect(() => {
    const id = getUserId()
    setUserId(id)

    const assignedVariant = assignVariant(testConfig, id)
    setVariant(assignedVariant)

    // Track test exposure
    trackEvent(testConfig.testId, 'test_exposure', assignedVariant)
  }, [testConfig])

  const trackConversion = (eventName: string, value?: number) => {
    trackEvent(testConfig.testId, eventName, variant, value)
  }

  const isVariant = (variantId: string): boolean => {
    return variant === variantId
  }

  return {
    variant,
    trackConversion,
    isVariant
  }
}

// Hook for multiple tests
export function useMultipleABTests(testConfigs: ABTestConfig[]) {
  const [variants, setVariants] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string>('ssr-user')

  useEffect(() => {
    const id = getUserId()
    setUserId(id)

    const assignedVariants: Record<string, string> = {}

    for (const config of testConfigs) {
      const variant = assignVariant(config, id)
      assignedVariants[config.testId] = variant
      trackEvent(config.testId, 'test_exposure', variant)
    }

    setVariants(assignedVariants)
  }, [testConfigs])

  const trackConversion = (testId: string, eventName: string, value?: number) => {
    const variant = variants[testId]
    if (variant) {
      trackEvent(testId, eventName, variant, value)
    }
  }

  const getVariant = (testId: string): string => {
    return variants[testId] || 'control'
  }

  const isVariant = (testId: string, variantId: string): boolean => {
    return variants[testId] === variantId
  }

  return {
    variants,
    trackConversion,
    getVariant,
    isVariant
  }
}

// Declare global gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
