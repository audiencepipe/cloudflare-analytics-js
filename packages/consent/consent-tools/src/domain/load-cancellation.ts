import { AnalyticsConsentError } from '../types/errors'
import { ValidationError } from './validation/validation-error'

/**
 * Thrown when a load should be cancelled.
 */
export class AbortLoadError extends AnalyticsConsentError {
  constructor(public loadCloudflareNormally: boolean) {
    super('AbortLoadError', '')
  }
}

export interface AbortLoadOptions {
  /**
   * Whether or not to load cloudflare.
   * If true -- load cloudflare normally (and disable consent requirement.) Wrapper is essentially a no-op
   */
  loadCloudflareNormally: boolean
}

export class LoadContext {
  /**
   * Abort the load (this function will always throw)
   */
  abort(options: AbortLoadOptions): never {
    if (typeof options !== 'object') {
      throw new ValidationError('arg should be an object', options)
    }
    throw new AbortLoadError(options.loadCloudflareNormally)
  }
}
