import { useState, useEffect } from 'react'

export interface ABTestVariant {
  id: string
  name: string
  weight: number // 0-100, percentage of users who see this variant
}

export interface ABTest {
  testId: string
  variants: ABTestVariant[]
  defaultVariant: string
}

export function useABTest(test: ABTest) {
  const [selectedVariant, setSelectedVariant] = useState<string>(test.defaultVariant)

  useEffect(() => {
    // Check if user already has a variant assigned for this test
    const storageKey = `ab_test_${test.testId}`
    const savedVariant = localStorage.getItem(storageKey)

    if (savedVariant && test.variants.some(v => v.id === savedVariant)) {
      setSelectedVariant(savedVariant)
      return
    }

    // Assign a new variant based on weights
    const random = Math.random() * 100
    let cumulative = 0

    for (const variant of test.variants) {
      cumulative += variant.weight
      if (random <= cumulative) {
        setSelectedVariant(variant.id)
        localStorage.setItem(storageKey, variant.id)

        // Track assignment event
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'ab_test_assignment', {
            test_id: test.testId,
            variant_id: variant.id,
            variant_name: variant.name
          })
        }

        break
      }
    }
  }, [test])

  // Function to track conversion events
  const trackConversion = (eventName: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_id: test.testId,
        variant_id: selectedVariant,
        event_name: eventName,
        value: value
      })
    }
  }

  return {
    variant: selectedVariant,
    isVariant: (variantId: string) => selectedVariant === variantId,
    trackConversion
  }
}

// Pre-defined A/B tests
export const AB_TESTS = {
  HERO_CTA: {
    testId: 'hero_cta_optimization',
    variants: [
      { id: 'control', name: 'Multiple CTAs', weight: 50 },
      { id: 'focused', name: 'Single Primary CTA', weight: 50 }
    ],
    defaultVariant: 'control'
  },

  ACHIEVEMENT_POSITION: {
    testId: 'achievement_notification_position',
    variants: [
      { id: 'top_right', name: 'Top Right', weight: 33 },
      { id: 'bottom_right', name: 'Bottom Right', weight: 33 },
      { id: 'inline', name: 'Inline Celebration', weight: 34 }
    ],
    defaultVariant: 'top_right'
  },

  COMMUNITY_LAYOUT: {
    testId: 'community_section_layout',
    variants: [
      { id: 'side_by_side', name: 'Side by Side', weight: 50 },
      { id: 'tabbed', name: 'Tabbed Interface', weight: 50 }
    ],
    defaultVariant: 'side_by_side'
  }
} as const
