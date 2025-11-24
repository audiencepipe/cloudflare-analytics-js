import assert from 'assert'
import unfetch from 'unfetch'
import { cloudflare, CloudflareSettings } from '..'
import { Analytics } from '../../../core/analytics'
import { Plugin } from '../../../core/plugin'
import { envEnrichment } from '../../env-enrichment'
import cookie from 'js-cookie'

jest.mock('unfetch', () => {
  return jest.fn()
})

describe('Cloudflare', () => {
  let options: CloudflareSettings
  let analytics: Analytics
  let cloudflarePlugin: Plugin
  let spyMock: jest.SpyInstance

  beforeEach(async () => {
    jest.resetAllMocks()
    jest.restoreAllMocks()

    // Use a mock Cloudflare Pipeline URL for testing
    options = {
      apiKey: 'foo',
      cloudflarePipelineUrl: 'https://mock-pipeline.cloudflare.com',
    }
    analytics = new Analytics({ writeKey: options.apiKey })
    cloudflarePlugin = await cloudflare(analytics, options, {})

    await analytics.register(cloudflarePlugin, envEnrichment)

    window.localStorage.clear()

    spyMock = jest.mocked(unfetch).mockResolvedValue({
      ok: true,
    } as unknown as Awaited<ReturnType<typeof unfetch>>)
  })

  function resetCookies(): void {
    Object.keys(cookie.get()).map((key) => cookie.remove(key))
  }

  afterEach(async () => {
    analytics.reset()
    resetCookies()

    window.localStorage.clear()
  })

  describe('configuring a keep alive', () => {
    it('should accept keepalive configuration', async () => {
      const analytics = new Analytics({ writeKey: 'foo' })

      await analytics.register(
        await cloudflare(analytics, {
          apiKey: '',
          cloudflarePipelineUrl: 'https://mock-pipeline.cloudflare.com',
          deliveryStrategy: {
            config: {
              keepalive: true,
            },
          },
        })
      )

      await analytics.track('foo')
      const [_, params] = spyMock.mock.lastCall
      expect(params.keepalive).toBe(true)
    })

    it('should default to no keepalive', async () => {
      const analytics = new Analytics({ writeKey: 'foo' })

      const cloudflarePlugin = await cloudflare(analytics, {
        apiKey: '',
        cloudflarePipelineUrl: 'https://mock-pipeline.cloudflare.com',
      })
      await analytics.register(cloudflarePlugin)
      await analytics.track('foo')

      const [_, params] = spyMock.mock.lastCall
      expect(params.keepalive).toBeUndefined()
    })
  })

  describe('#page', () => {
    it('should enqueue section, name and properties', async () => {
      await analytics.page('section', 'name', { property: true }, { opt: true })

      const [url, params] = spyMock.mock.calls[0]
      // All events should now go to the Cloudflare Pipeline URL
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      // The body should be an array containing the event object
      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.name === 'name')
      assert(event.category === 'section')
      assert(event.properties.property === true)
      assert(event.context.opt === true)
      assert(event.timestamp)
    })

    it('sets properties when name and category are null', async () => {
      // @ts-ignore test a valid ajsc page call
      await analytics.page(null, { foo: 'bar' })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.properties.foo === 'bar')
    })
  })

  describe('#identify', () => {
    it('should enqueue an id and traits', async () => {
      await analytics.identify('id', { trait: true }, { opt: true })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.userId === 'id')
      assert(event.traits.trait === true)
      assert(event.context.opt === true)
      assert(event.timestamp)
    })

    it('should set traits with null id', async () => {
      await analytics.identify(null, { trait: true }, { opt: true })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.userId === null)
      assert(event.traits.trait === true)
      assert(!event.context.trait)
      assert(event.context.opt === true)
      assert(event.timestamp)
    })
  })

  describe('#track', () => {
    it('should enqueue an event and properties', async () => {
      await analytics.track('event', { prop: true }, { opt: true })
      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.event === 'event')
      assert(event.context.opt === true)
      assert(event.properties.prop === true)
      assert(event.traits == null)
      assert(event.timestamp)
    })
  })

  describe('#group', () => {
    it('should enqueue groupId and traits', async () => {
      await analytics.group('id', { trait: true }, { opt: true })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.groupId === 'id')
      assert(event.context.opt === true)
      assert(event.traits.trait === true)
      assert(event.timestamp)
    })

    it('should set traits with null id', async () => {
      await analytics.group(null, { trait: true }, { opt: true })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.groupId === null)
      assert(event.context.opt === true)
      assert(event.traits.trait === true)
      assert(!event.context.trait)
      assert(event.timestamp)
    })
  })

  describe('#alias', () => {
    it('should enqueue .userId and .previousId', async () => {
      await analytics.alias('to', 'from')
      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.previousId === 'from')
      assert(event.userId === 'to')
      assert(event.timestamp)
    })

    it('should fallback to user.anonymousId if .previousId is omitted', async () => {
      analytics.user().anonymousId('anon-id')
      await analytics.alias('to')

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.previousId === 'anon-id')
      assert(event.userId === 'to')
      assert(event.timestamp)
    })

    it('should fallback to user.anonymousId if .previousId and user.id are falsey', async () => {
      await analytics.alias('to')
      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.previousId)
      assert(event.previousId.length === 36)
      assert(event.userId === 'to')
    })

    it('should rename `.from` and `.to` to `.previousId` and `.userId`', async () => {
      await analytics.alias('user-id', 'previous-id')
      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.previousId === 'previous-id')
      assert(event.userId === 'user-id')
      assert(event.from == null)
      assert(event.to == null)
    })
  })

  describe('#screen', () => {
    it('should enqueue section, name and properties', async () => {
      await analytics.screen(
        'section',
        'name',
        { property: true },
        { opt: true }
      )

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.name === 'name')
      assert(event.category === 'section')
      assert(event.properties.property === true)
      assert(event.context.opt === true)
      assert(event.timestamp)
    })

    it('sets properties when name and category are null', async () => {
      // @ts-ignore test a valid ajsc page call
      await analytics.screen(null, { foo: 'bar' })

      const [url, params] = spyMock.mock.calls[0]
      expect(url).toBe('https://mock-pipeline.cloudflare.com')

      const body = JSON.parse(params.body)
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBe(1)

      const event = body[0]
      assert(event.properties.foo === 'bar')
    })
  })
})
