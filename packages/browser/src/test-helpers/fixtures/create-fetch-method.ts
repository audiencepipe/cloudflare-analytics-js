import { LegacySettings } from '../..'
import { createSuccess } from '../factories'
import { cdnSettingsMinimal } from './cdn-settings'

export const createMockFetchImplementation = (
  cdnSettings: Partial<LegacySettings> = cdnSettingsMinimal
) => {
  return (...[url, req]: Parameters<typeof fetch>) => {
    const reqUrl = url.toString()
    if (
      !req ||
      (req.method === 'get' && reqUrl.includes('cdn.cloudflare.com'))
    ) {
      // GET https://cdn.cloudflare.com/v1/projects/{writeKey}
      return createSuccess({ ...cdnSettingsMinimal, ...cdnSettings })
    }

    if (
      req?.method === 'post' &&
      reqUrl.includes('pipelines.cloudflare.com')
    ) {
      // POST https://pipelines.cloudflare.com/v1/{event.type}
      return createSuccess({ success: true }, { status: 201 })
    }

    throw new Error(
      `no match found for request (url:${url}, req:${JSON.stringify(req)})`
    )
  }
}