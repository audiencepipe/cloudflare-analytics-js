import { HtEventsBrowser } from '../../../browser'
import { createDestination } from '..'
import { Destination } from '../destination'

describe('createDestination', () => {
  it('should return plugin', async () => {
    const plugin = await createDestination('Google Tag Manager', {})

    expect(plugin).toBeDefined()
  })

  it('should return undefined if plugin does not exist', async () => {
    const plugin = await createDestination('Non-existent Plugin', {})

    expect(plugin).toBeUndefined()
  })
})

describe('destination', () => {
  it('should apply middleware', async () => {
    const spy = jest.fn()

    const destination = new Destination('Test', '0.0.0', {
      track(ctx) {
        spy(ctx.event)
      },
    })

    // add middleware directly to destination
    destination.addMiddleware(({ next, payload }) => {
      payload.obj.context!.direct = true
      next(payload)
    })

    const cfevents = HtEventsBrowser.load({ writeKey: 'WRITE_KEY' })

    await cfevents.register(destination)

    // add middleware to destination via cfevents
    await cfevents.addDestinationMiddleware('Test', ({ next, payload }) => {
      payload.obj.context!.cfevents = true
      next(payload)
    })

    await cfevents.track('Test Event', { testing: 123 })

    expect(spy.mock.lastCall?.[0]).toMatchObject({
      event: 'Test Event',
      properties: { testing: 123 },
      context: { direct: true, cfevents: true },
    })
  })
})

describe('HtEventsBrowser', () => {
  it('should load plugin', async () => {
    const analytics = await HtEventsBrowser.standalone('WRITE_KEY', {
      destinations: {
        'Google Tag Manager': {
          measurementId: 'G-XXXXXXX',
        },
      },
    })

    expect(
      analytics.queue.plugins.some(
        (p) => p instanceof Destination && p.name === 'Google Tag Manager'
      )
    ).toBe(true)
  })
})
