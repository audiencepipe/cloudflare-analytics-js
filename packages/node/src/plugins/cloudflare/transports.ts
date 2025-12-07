import { backoff } from '@ht-sdks/events-sdk-js-core'
import { tryCreateFormattedUrl } from '../../lib/create-url'
import { HTTPClient, HTTPClientRequest } from '../../lib/http-client'
import { NodeEmitter } from '../../app/emitter'

export interface TransportResponse {
  status: 'success' | 'retry' | 'fail'
  error?: Error
}

export interface PipelineTransport {
  send(events: any[]): Promise<TransportResponse>
}

export interface BindingTransportProps {
  binding: { send: (events: any[]) => Promise<void> }
}

export class BindingTransport implements PipelineTransport {
  private _binding: { send: (events: any[]) => Promise<void> }

  constructor({ binding }: BindingTransportProps) {
    this._binding = binding
  }

  async send(events: any[]): Promise<TransportResponse> {
    try {
      await this._binding.send(events)
      return { status: 'success' }
    } catch (err: any) {
      // Bindings typically throw if something fundamental is wrong (like payload size)
      // but without specific error codes, we should probably be careful.
      // However, for now, let's assume we can't easily retry binding errors usually.
      // But for safety, we'll treat them as retryable unless we know otherwise?
      // Actually, standard practice for simple bindings is usually success or hard fail.
      // Let's allow retry for safety, developer can configure retries in Publisher.
      return { status: 'retry', error: err }
    }
  }
}

export interface HttpTransportProps {
  host?: string
  path?: string
  cloudflarePipelineBearerToken?: string
  httpRequestTimeout?: number
  httpClient: HTTPClient
  emitter: NodeEmitter
}

function sleep(timeoutInMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeoutInMs))
}

export class HttpTransport implements PipelineTransport {
  private _url: string
  private _auth: string
  private _httpRequestTimeout: number
  private _httpClient: HTTPClient
  private _emitter: NodeEmitter

  constructor({
    host,
    path,
    cloudflarePipelineBearerToken,
    httpRequestTimeout,
    httpClient,
    emitter,
  }: HttpTransportProps) {
    this._url = tryCreateFormattedUrl(
      host ?? 'https://us-east-1.cloudflare-events.com',
      path
    )
    this._auth = cloudflarePipelineBearerToken
      ? `Bearer ${cloudflarePipelineBearerToken}`
      : ''
    this._httpRequestTimeout = httpRequestTimeout ?? 10000
    this._httpClient = httpClient
    this._emitter = emitter
  }

  async send(events: any[]): Promise<TransportResponse> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'events-sdk-js-node/latest',
      }

      if (this._auth) {
        headers.Authorization = this._auth
      }

      const request: HTTPClientRequest = {
        url: this._url,
        method: 'POST',
        headers,
        data: events,
        httpRequestTimeout: this._httpRequestTimeout,
      }

      this._emitter.emit('http_request', {
        body: request.data,
        method: request.method,
        url: request.url,
        headers: request.headers,
      })

      const response = await this._httpClient.makeRequest(request)

      if (response.status >= 200 && response.status < 300) {
        return { status: 'success' }
      } else if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        return {
          status: 'fail',
          error: new Error(`[${response.status}] ${response.statusText}`),
        }
      } else {
        return {
          status: 'retry',
          error: new Error(`[${response.status}] ${response.statusText}`),
        }
      }
    } catch (err: any) {
      return { status: 'retry', error: err }
    }
  }
}
