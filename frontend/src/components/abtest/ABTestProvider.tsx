'use client'

import type React from 'react'
import { createContext, useContext, useState, useEffect } from 'react'
import { useABTest, AB_TESTS } from '@/hooks/useABTest'

interface ABTestContextType {
  getVariant: (testId: string) => string
  trackConversion: (testId: string, eventName: string, value?: number) => void
  isVariant: (testId: string, variantId: string) => boolean
  getAllActiveTests: () => Record<string, string>
}

const ABTestContext = createContext<ABTestContextType | undefined>(undefined)

export function ABTestProvider({ children }: { children: React.ReactNode }) {
  const [activeTests, setActiveTests] = useState<Record<string, string>>({})

  // Initialize all tests
  const heroCTA = useABTest(AB_TESTS.HERO_CTA)
  const achievementPosition = useABTest(AB_TESTS.ACHIEVEMENT_POSITION)
  const communityLayout = useABTest(AB_TESTS.COMMUNITY_LAYOUT)

  useEffect(() => {
    setActiveTests({
      [AB_TESTS.HERO_CTA.testId]: heroCTA.variant,
      [AB_TESTS.ACHIEVEMENT_POSITION.testId]: achievementPosition.variant,
      [AB_TESTS.COMMUNITY_LAYOUT.testId]: communityLayout.variant,
    })
  }, [heroCTA.variant, achievementPosition.variant, communityLayout.variant])

  const getVariant = (testId: string): string => {
    return activeTests[testId] || 'control'
  }

  const trackConversion = (testId: string, eventName: string, value?: number) => {
    switch (testId) {
      case AB_TESTS.HERO_CTA.testId:
        heroCTA.trackConversion(eventName, value)
        break
      case AB_TESTS.ACHIEVEMENT_POSITION.testId:
        achievementPosition.trackConversion(eventName, value)
        break
      case AB_TESTS.COMMUNITY_LAYOUT.testId:
        communityLayout.trackConversion(eventName, value)
        break
    }
  }

  const isVariant = (testId: string, variantId: string): boolean => {
    return getVariant(testId) === variantId
  }

  const getAllActiveTests = (): Record<string, string> => {
    return activeTests
  }

  const value = {
    getVariant,
    trackConversion,
    isVariant,
    getAllActiveTests
  }

  return (
    <ABTestContext.Provider value={value}>
      {children}
    </ABTestContext.Provider>
  )
}

export function useABTestContext() {
  const context = useContext(ABTestContext)
  if (!context) {
    throw new Error('useABTestContext must be used within ABTestProvider')
  }
  return context
}
