import { cloudflare, CloudflareSettings } from '..'
import { Analytics } from '../../../core/analytics'
// Suppress TS error for mocked dependency
import * as connection from '../../../core/connection'
import { Plugin } from '../../../core/plugin'
import { envEnrichment } from '../../env-enrichment'
import { scheduleFlush } from '../schedule-flush'
import * as PPQ from '../../../lib/priority-queue/persisted'
import * as PQ from '../../../lib/priority-queue'
import { Context } from '../../../core/context'

jest.mock('../schedule-flush')

type QueueType = 'priority' | 'persisted'

describe('Cloudflare retries', () => {
  let options: CloudflareSettings
  let analytics: Analytics
  let cloudflarePlugin: Plugin // Variable renamed to avoid conflict with imported 'cloudflare' function
  let queue: (PPQ.PersistedPriorityQueue | PQ.PriorityQueue<Context>) & {
    __type?: QueueType
  }
  ;[false, true].forEach((persistenceIsDisabled) => {
    describe(`disableClientPersistence: ${persistenceIsDisabled}`, () => {
      beforeEach(async () => {
        jest.resetAllMocks()
        jest.restoreAllMocks()

        // Override the imported 'isOffline' function with a mock implementation
        jest.spyOn(connection, 'isOffline').mockReturnValue(true)

        // Use a mock Cloudflare Pipeline URL for testing
        options = {
          apiKey: 'foo',
          cloudflarePipelineUrl: 'https://mock-pipeline.cloudflare.com',
        }
        analytics = new Analytics(
          { writeKey: options.apiKey },
          {
            retryQueue: true,
            disableClientPersistence: persistenceIsDisabled,
          }
        )

        if (persistenceIsDisabled) {
          queue = new PQ.PriorityQueue(3, [])
          queue['__type'] = 'priority'
          Object.defineProperty(PQ, 'PriorityQueue', {
            writable: true,
            value: jest.fn().mockImplementation(() => queue),
          })
        } else {
          queue = new PPQ.PersistedPriorityQueue(
            3,
            `${options.apiKey}:test-cloudflare` // Using test-specific queue key
          )
          queue['__type'] = 'persisted'
          Object.defineProperty(PPQ, 'PersistedPriorityQueue', {
            writable: true,
            value: jest.fn().mockImplementation(() => queue),
          })
        }

        cloudflarePlugin = await cloudflare(analytics, options, {}) // Assign result to renamed variable

        await analytics.register(cloudflarePlugin, envEnrichment) // Register the renamed variable
      })

      test(`add events to the queue`, async () => {
        jest.spyOn(queue, 'push')

        const ctx = await analytics.track('event')

        expect(scheduleFlush).toHaveBeenCalled()
        /* eslint-disable @typescript-eslint/unbound-method */
        expect(queue.push).toHaveBeenCalled()
        expect(queue.length).toBe(1)
        expect(ctx.attempts).toBe(1)
        expect(connection.isOffline).toHaveBeenCalledTimes(2)
        expect(queue.__type).toBe<QueueType>(
          persistenceIsDisabled ? 'priority' : 'persisted'
        )
      })
    })
  })
})
