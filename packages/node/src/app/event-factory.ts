import { EventFactory } from '@ht-sdks/events-sdk-js-core'
import { createMessageId } from '../lib/get-message-id'
import { CloudflareEvent } from './types'

// use declaration merging to downcast CoreCloudflareEvent without adding any runtime code.
// if/when we decide to add an actual implementation to NodeEventFactory that actually changes the event shape, we can remove this.
export interface NodeEventFactory {
  alias(...args: Parameters<EventFactory['alias']>): CloudflareEvent
  group(...args: Parameters<EventFactory['group']>): CloudflareEvent
  identify(...args: Parameters<EventFactory['identify']>): CloudflareEvent
  track(...args: Parameters<EventFactory['track']>): CloudflareEvent
  page(...args: Parameters<EventFactory['page']>): CloudflareEvent
  screen(...args: Parameters<EventFactory['screen']>): CloudflareEvent
}

export class NodeEventFactory extends EventFactory {
  constructor() {
    super({ createMessageId })
  }
}
