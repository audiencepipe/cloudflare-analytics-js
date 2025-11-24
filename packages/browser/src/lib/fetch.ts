import unfetch from 'unfetch'
import { getGlobal } from './get-global'

/**
 * Wrapper around native `fetch` containing `unfetch` fallback.
 */
export const fetch = (
  ...args: Parameters<typeof global.fetch>
): ReturnType<typeof global.fetch> => {
  const globalObject = getGlobal()
  const fetchImpl =
    (globalObject && globalObject.fetch) ||
    (unfetch as unknown as typeof global.fetch)
  return fetchImpl(...args)
}
