import { Analytics } from '../../../core/analytics'
import { Context } from '../../../core/context'
import { cloudflareIPEnrichment } from '../index'
import * as fetchModule from '../../../lib/fetch'

describe('Cloudflare IP Enrichment', () => {
  let analytics: Analytics
  let ctx: Context

  beforeEach(() => {
    analytics = new Analytics({ writeKey: 'test' })
    ctx = new Context({ type: 'track', event: 'Test Event' })

    jest.spyOn(fetchModule, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('ip=1.2.3.4\nloc=US'),
      } as Response)
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch and set the IP address in the context', async () => {
    await cloudflareIPEnrichment.load(ctx, analytics)
    const enrichedCtx = cloudflareIPEnrichment.track!(ctx)
    expect(enrichedCtx.event.context?.ip).toBe('1.2.3.4')
  })

  it('should not overwrite an existing IP address in the context', async () => {
    ctx.event.context = { ip: '5.6.7.8' }
    await cloudflareIPEnrichment.load(ctx, analytics)
    const enrichedCtx = cloudflareIPEnrichment.track!(ctx)
    expect(enrichedCtx.event.context?.ip).toBe('5.6.7.8')
  })

  it('should handle fetch errors gracefully', async () => {
    // Reset the plugin's internal state to ensure clean test
    Object.defineProperty(cloudflareIPEnrichment, '_ip', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(cloudflareIPEnrichment, '_fetchPromise', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    jest
      .spyOn(fetchModule, 'fetch')
      .mockImplementation(() => Promise.reject(new Error('Network error')))
    const consoleWarnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {})

    await cloudflareIPEnrichment.load(ctx, analytics)
    const enrichedCtx = cloudflareIPEnrichment.track!(ctx)

    expect(enrichedCtx.event.context?.ip).toBeUndefined()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to fetch IP from Cloudflare trace endpoint:',
      expect.any(Error)
    )
    consoleWarnSpy.mockRestore()
  })

  it('should only fetch the IP once', async () => {
    // Reset the plugin's internal state to ensure clean test
    Object.defineProperty(cloudflareIPEnrichment, '_ip', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(cloudflareIPEnrichment, '_fetchPromise', {
      value: undefined,
      writable: true,
      configurable: true,
    })

    const fetchSpy = jest.spyOn(fetchModule, 'fetch')

    await cloudflareIPEnrichment.load(ctx, analytics)
    await cloudflareIPEnrichment.load(ctx, analytics) // Call load again

    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('should set the IP for all event types', async () => {
    await cloudflareIPEnrichment.load(ctx, analytics)

    const eventTypes = ['track', 'identify', 'page', 'group', 'alias', 'screen']
    for (const type of eventTypes) {
      const testCtx = new Context({ type: type as any, event: 'Test Event' })
      const enrichedCtx = (cloudflareIPEnrichment as any)[type](testCtx)
      expect(enrichedCtx.event.context?.ip).toBe('1.2.3.4')
    }
  })
})
