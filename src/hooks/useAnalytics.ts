import { app } from '@/lib/firebase'
import { getAnalytics, logEvent, Analytics } from 'firebase/analytics'

let analytics: Analytics | null = null

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export function useAnalytics() {
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (analytics) {
      logEvent(analytics, eventName, eventParams)
    }
  }

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', { page_name: pageName })
  }

  const trackMomentShare = (hasLocation: boolean, hasQuote: boolean) => {
    if (!analytics) return
    
    logEvent(analytics, 'share_moment', {
      has_location: hasLocation,
      has_quote: hasQuote
    })
  }

  const trackMomentLike = (momentId: string) => {
    if (!analytics) return
    
    logEvent(analytics, 'like_moment', {
      moment_id: momentId
    })
  }

  const trackMomentComment = (momentId: string) => {
    if (!analytics) return
    
    logEvent(analytics, 'comment_moment', {
      moment_id: momentId
    })
  }

  const trackMapInteraction = (action: 'add_location' | 'view_location' | 'search') => {
    trackEvent('map_interaction', { action })
  }

  return {
    trackEvent,
    trackPageView,
    trackMomentShare,
    trackMomentLike,
    trackMomentComment,
    trackMapInteraction,
  }
} 