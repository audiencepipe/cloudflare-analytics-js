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
      // or if the binding is invalid.
      // We should treat these as fatal errors to avoid infinite retries on fundamental configuration issues.
      // By returning 'fail', we ensure the SDK stops retrying but doesn't crash the process.
      return { status: 'fail', error: err }
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
