import { CfEventsBrowser } from '../..'
import { setGlobalCDNUrl } from '../../lib/parse-cdn'
import { remoteLoader } from '../../plugins/remote-loader'
import unfetch from 'unfetch'
import { createSuccess } from '../../test-helpers/factories'
jest.mock('unfetch')

const INTG_TO_DELETE = 'deleteMe'

const cdnSettings = {
  integrations: {
    [INTG_TO_DELETE]: { bar: true },
    otherIntegration: { foo: true },
  },
}
const mockFetchSettingsSuccessResponse = (cdnSettings: any) => {
  return jest
    .mocked(unfetch)
    .mockImplementation(
      () =>
        createSuccess(cdnSettings) as unknown as Promise<
          Awaited<ReturnType<typeof unfetch>>
        >
    )
}

jest.mock('../../plugins/remote-loader')
const remoteLoaderSpy = jest.fn().mockResolvedValue([])
jest.mocked(remoteLoader).mockImplementation(remoteLoaderSpy)

describe('updateCDNSettings configuration option', () => {
  beforeEach(() => {
    setGlobalCDNUrl(undefined as any)
    ;(window as any).cfevents = undefined
  })
  it('should update the configuration options if they are passed directly', async () => {
    await CfEventsBrowser.load(
      {
        writeKey: 'foo',
        cdnSettings,
      },
      {
        updateCDNSettings: (settings) => {
          delete settings.integrations.deleteMe
          return settings
        },
      }
    )
    const [arg1] = remoteLoaderSpy.mock.lastCall
    expect(arg1.integrations.otherIntegration).toEqual(
      cdnSettings.integrations.otherIntegration
    )
    expect(arg1.integrations[INTG_TO_DELETE]).toBeUndefined()
  })

  // By default, we no longer fetch settings from the CDN
  it.skip('should update the configuration options if they are fetched', async () => {
    mockFetchSettingsSuccessResponse(cdnSettings)
    await CfEventsBrowser.load(
      {
        writeKey: 'foo',
      },
      {
        updateCDNSettings: (settings) => {
          delete settings.integrations.deleteMe
          return settings
        },
      }
    )
    const [arg1] = remoteLoaderSpy.mock.lastCall
    expect(arg1.integrations.otherIntegration).toEqual(
      cdnSettings.integrations.otherIntegration
    )
    expect(arg1.integrations[INTG_TO_DELETE]).toBeUndefined()
  })
})
