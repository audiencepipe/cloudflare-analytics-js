import { Facade } from '@segment/facade'
import { Analytics } from '../../core/analytics'
import { LegacySettings } from '../../browser'
import { isOffline } from '../../core/connection'
import { Context } from '../../core/context'
import { Plugin } from '../../core/plugin'
import { PriorityQueue } from '../../lib/priority-queue'
import { PersistedPriorityQueue } from '../../lib/priority-queue/persisted'
import { toFacade } from '../../lib/to-facade'
import batch, { BatchingDispatchConfig } from './batched-dispatcher'
import standard, { StandardDispatcherConfig } from './fetch-dispatcher'
import { normalize } from './normalize'
import { scheduleFlush } from './schedule-flush'

type DeliveryStrategy =
  | {
      strategy?: 'standard'
      config?: StandardDispatcherConfig
    }
  | {
      strategy?: 'batching'
      config?: BatchingDispatchConfig
    }

export type CloudflareSettings = {
  apiKey: string
  cloudflarePipelineUrl: string

  addBundledMetadata?: boolean
  unbundledIntegrations?: string[]
  bundledConfigIds?: string[]
  unbundledConfigIds?: string[]

  maybeBundledConfigIds?: Record<string, string[]>

  deliveryStrategy?: DeliveryStrategy
}

type JSON = ReturnType<Facade['json']>

function onAlias(analytics: Analytics, json: JSON): JSON {
  const user = analytics.user()
  json.previousId =
    json.previousId ?? json.from ?? user.id() ?? user.anonymousId()
  json.userId = json.userId ?? json.to
  delete json.from
  delete json.to
  return json
}

export function cloudflare(
  analytics: Analytics,
  settings?: CloudflareSettings,
  integrations?: LegacySettings['integrations']
): Plugin {
  // Attach `pagehide` before buffer is created so that inflight events are added
  // to the buffer before the buffer persists events in its own `pagehide` handler.
  window.addEventListener('pagehide', () => {
    buffer.push(...Array.from(infligcfevents))
    infligcfevents.clear()
  })

  const writeKey = settings?.apiKey ?? ''

  const buffer = analytics.options.disableClientPersistence
    ? new PriorityQueue<Context>(analytics.queue.queue.maxAttempts, [])
    : new PersistedPriorityQueue(
        analytics.queue.queue.maxAttempts,
        `${writeKey}:dest-Cloudflare`
      )

  const infligcfevents = new Set<Context>()
  const flushing = false

  // Use the cloudflarePipelineUrl directly, with a fallback
  const cloudflarePipelineUrl =
    settings?.cloudflarePipelineUrl ?? 'https://us-east-1.cloudflare-events.com'

  const deliveryStrategy = settings?.deliveryStrategy
  // Pass the cloudflarePipelineUrl to both dispatchers
  const client =
    deliveryStrategy?.strategy === 'batching'
      ? batch(cloudflarePipelineUrl, deliveryStrategy.config)
      : standard(
          cloudflarePipelineUrl,
          deliveryStrategy?.config as StandardDispatcherConfig
        )

  async function send(ctx: Context): Promise<Context> {
    if (isOffline()) {
      buffer.push(ctx)
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      scheduleFlush(flushing, buffer, cloudflare, scheduleFlush)
      return ctx
    }

    infligcfevents.add(ctx)

    let json = toFacade(ctx.event).json()

    if (ctx.event.type === 'track') {
      delete json.traits
    }

    if (ctx.event.type === 'alias') {
      json = onAlias(analytics, json)
    }

    // Wrap the normalized JSON object in an array for Cloudflare Pipeline
    const payload = [normalize(analytics, json, settings, integrations)]

    return client
      .dispatch(cloudflarePipelineUrl, payload)
      .then(() => ctx)
      .catch(() => {
        buffer.pushWithBackoff(ctx)
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        scheduleFlush(flushing, buffer, cloudflare, scheduleFlush)
        return ctx
      })
      .finally(() => {
        infligcfevents.delete(ctx)
      })
  }

  const cloudflare: Plugin = {
    name: 'Cloudflare',
    type: 'after',
    version: '0.1.0',
    isLoaded: (): boolean => true,
    load: (): Promise<void> => Promise.resolve(),
    track: send,
    identify: send,
    page: send,
    alias: send,
    group: send,
    screen: send,
  }

  // Buffer may already have items if they were previously stored in localStorage.
  // Start flushing them immediately.
  if (buffer.todo) {
    scheduleFlush(flushing, buffer, cloudflare, scheduleFlush)
  }

  return cloudflare
}
