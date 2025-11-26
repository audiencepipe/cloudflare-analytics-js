import { CfEventsSnippet } from '../browser/standalone-interface'

/**
 * Stores the global window analytics key
 */
let _globalAnalyticsKey = 'cfevents'

/**
 * Gets the global analytics/buffer
 * @param key name of the window property where the buffer is stored (default: analytics)
 * @returns CfEventsSnippet
 */
export function getGlobalAnalytics(): CfEventsSnippet | undefined {
  return (window as any)[_globalAnalyticsKey]
}

/**
 * Replaces the global window key for the analytics/buffer object
 * @param key key name
 */
export function setGlobalAnalyticsKey(key: string) {
  _globalAnalyticsKey = key
}

/**
 * Sets the global analytics object
 * @param analytics analytics snippet
 */
export function setGlobalAnalytics(analytics: CfEventsSnippet): void {
  ;(window as any)[_globalAnalyticsKey] = analytics
}
