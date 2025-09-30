import type { Context } from '../../core/context'
import type { HightouchEvent } from '../../core/events/interfaces'
import type { DestinationFactory } from './types'
import { Destination } from './destination'

declare global {
  interface Window {
    dataLayer: Array<any>
  }
}

type GoogleTagManagerSettings = {
  /**
   * If a `Viewed Page` event should be sent for all `cfevents.page` calls
   */
  trackAllPages?: boolean

  /**
   * If a `Viewed <name> Page` event should be sent for `cfevents.page('Name')` calls
   */
  trackNamedPages?: boolean

  /**
   * If a `Viewed <category> <name> Page` event should be sent for `cfevents.page('Category', 'Name')` calls
   */
  trackCategorizedPages?: boolean
}

/**
 * https://github.com/segmentio/analytics.js-integrations/blob/master/integrations/google-tag-manager/lib/index.js
 */
const googleTagManager: DestinationFactory<GoogleTagManagerSettings> = ({
  trackAllPages = false,
  trackNamedPages = true,
  trackCategorizedPages = true,
}) => {
  const pushEvent = (event: HightouchEvent) => {
    window.dataLayer.push({
      ...(event.userId && {
        userId: event.userId,
      }),
      ...(event.anonymousId && {
        hightouchAnonymousId: event.anonymousId,
      }),
      event: event.event,
      ...event.properties,
    })
  }

  return new Destination('Google Tag Manager', '0.0.1', {
    page: (ctx: Context) => {
      if (
        trackAllPages ||
        (trackNamedPages && ctx.event.name) ||
        (trackCategorizedPages && ctx.event.category)
      ) {
        const eventName = ['Viewed', ctx.event.category, ctx.event.name, 'Page']
          .filter(Boolean)
          .join(' ')

        pushEvent({
          ...ctx.event,
          type: 'track',
          event: eventName,
        })
      }
    },

    track: (ctx: Context) => {
      pushEvent(ctx.event)
    },
  })
}

export default googleTagManager
