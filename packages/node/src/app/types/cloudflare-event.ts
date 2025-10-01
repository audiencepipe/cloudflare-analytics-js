import type { CoreCloudflareEvent } from '@ht-sdks/events-sdk-js-core'

type CloudflareEventType = 'track' | 'page' | 'identify' | 'alias' | 'screen'

export interface CloudflareEvent extends CoreCloudflareEvent {
  type: CloudflareEventType
}

// Create an alias for backwards compatibility
export type HightouchEvent = CloudflareEvent