import { Context } from '../../core/context'
import { Plugin } from '../../core/plugin'
import { Analytics } from '../../core/analytics'
import { PluginType } from '@ht-sdks/events-sdk-js-core'
import { fetch } from '../../lib/fetch'

class CloudflareIPEnrichmentPlugin implements Plugin {
  name = 'Cloudflare IP Enrichment'
  type: PluginType = 'enrichment'
  version = '1.0.0'
  isLoaded = () => this._ip !== undefined

  private _ip?: string
  private _fetchPromise?: Promise<void>

  load = async (_ctx: Context, _instance: Analytics) => {
    if (this._ip === undefined) {
      if (!this._fetchPromise) {
        this._fetchPromise = this._fetchIP()
      }
      await this._fetchPromise
    }
    return Promise.resolve()
  }

  private _fetchIP = async (): Promise<void> => {
    try {
      const response = await fetch('https://cloudflare.com/cdn-cgi/trace')
      const text = await response.text()

      const lines = text.split('\n')
      for (const line of lines) {
        if (line.startsWith('ip=')) {
          this._ip = line.substring(3)
          break
        }
      }
    } catch (error) {
      console.warn('Failed to fetch IP from Cloudflare trace endpoint:', error)
    }
  }

  private _enrichContext = (ctx: Context): Context => {
    if (this._ip) {
      if (!ctx.event.context?.ip) {
        ctx.updateEvent('context.ip', this._ip)
      }
    }
    return ctx
  }

  track = this._enrichContext
  identify = this._enrichContext
  page = this._enrichContext
  group = this._enrichContext
  alias = this._enrichContext
  screen = this._enrichContext
}

export const cloudflareIPEnrichment = new CloudflareIPEnrichmentPlugin()
