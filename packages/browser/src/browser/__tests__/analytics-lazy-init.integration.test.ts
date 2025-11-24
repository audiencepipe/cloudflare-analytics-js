import { sleep } from '@ht-sdks/events-sdk-js-core'
import { getBufferedPageCtxFixture } from '../../test-helpers/fixtures'
import unfetch from 'unfetch'
import { CfEventsBrowser } from '..'
import { Analytics } from '../../core/analytics'
import { createSuccess } from '../../test-helpers/factories'

jest.mock('unfetch')

const mockFetchSettingsSuccessResponse = () => {
  return jest
    .mocked(unfetch)
    .mockImplementation(
      (): Promise<Awaited<ReturnType<typeof unfetch>>> =>
        createSuccess({ integrations: {} }) as unknown as Promise<
          Awaited<ReturnType<typeof unfetch>>
        >
    )
}

describe('Lazy initialization', () => {
  let trackSpy: jest.SpiedFunction<Analytics['track']>
  let fetched: jest.MockedFn<typeof unfetch>
  beforeEach(() => {
    fetched = mockFetchSettingsSuccessResponse()
    trackSpy = jest.spyOn(Analytics.prototype, 'track')
  })

  it('Should be able to delay initialization ', async () => {
    const analytics = new CfEventsBrowser()
    const track = analytics.track('foo')
    await sleep(100)
    expect(trackSpy).not.toBeCalled()
    analytics.load({ writeKey: 'abc' })
    await track
    expect(trackSpy).toBeCalledWith('foo', getBufferedPageCtxFixture())
  })

  it('.load method return an analytics instance', async () => {
    const analytics = new CfEventsBrowser().load({ writeKey: 'foo' })
    expect(analytics instanceof CfEventsBrowser).toBeTruthy()
  })

  // Load already defaults to NOT fetching external settings from CDN
  it.skip('should ignore subsequent .load calls', async () => {
    const analytics = new CfEventsBrowser()
    await analytics.load({ writeKey: 'my-write-key' })
    await analytics.load({ writeKey: 'def' })
    expect(fetched).toBeCalledTimes(1)
    expect(fetched).toBeCalledWith(
      expect.stringContaining(
        'https://cdn.cloudflare-events.com/v1/projects/my-write-key/settings'
      )
    )
  })
})
