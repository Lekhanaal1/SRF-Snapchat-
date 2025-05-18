import { analytics } from '@/lib/firebase'
import { logEvent, Analytics } from 'firebase/analytics'

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
    trackEvent('share_moment', {
      has_location: hasLocation,
      has_quote: hasQuote,
    })
  }

  const trackMomentLike = (momentId: string) => {
    trackEvent('like_moment', { moment_id: momentId })
  }

  const trackMomentComment = (momentId: string) => {
    trackEvent('comment_moment', { moment_id: momentId })
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