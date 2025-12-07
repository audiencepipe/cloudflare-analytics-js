import { Publisher, PublisherProps } from './publisher'
import { version } from '../../generated/version'
import { detectRuntime } from '../../lib/env'
import { Plugin } from '../../app/types'
import { Context } from '../../app/context'
import { NodeEmitter } from '../../app/emitter'

function normalizeEvent(ctx: Context) {
  ctx.updateEvent(
    'context.library.name',
    '@audiencepipe/cloudflare-analytics-node'
  )
  ctx.updateEvent('context.library.version', version)
  const runtime = detectRuntime()
  if (runtime === 'node') {
    // eslint-disable-next-line no-restricted-globals
    ctx.updateEvent('_metadata.nodeVersion', process.version)
  }
  ctx.updateEvent('_metadata.jsRuntime', runtime)
}

type DefinedPluginFields =
  | 'name'
  | 'type'
  | 'version'
  | 'isLoaded'
  | 'load'
  | 'alias'
  | 'group'
  | 'identify'
  | 'page'
  | 'screen'
  | 'track'

type HightouchNodePlugin = Plugin & Required<Pick<Plugin, DefinedPluginFields>>

import { HttpTransport, BindingTransport, PipelineTransport } from './transports'
import { HTTPClient } from '../../lib/http-client'

export interface ConfigureNodePluginProps {
  // Common
  flushInterval: number
  maxEventsInBatch: number
  maxRetries: number
  writeKey: string
  disable?: boolean
  
  // Transport specific
  host?: string
  path?: string // deprecated but kept for compat
  cloudflarePipelineBearerToken?: string
  httpClient?: HTTPClient
  httpRequestTimeout?: number
  cloudflarePipelineBinding?: { send: (events: any[]) => Promise<void> }
}

export function createNodePlugin(publisher: Publisher): HightouchNodePlugin {
  function action(ctx: Context): Promise<Context> {
    normalizeEvent(ctx)
    return publisher.enqueue(ctx)
  }

  return {
    name: 'Cloudflare',
    type: 'after',
    version: '1.0.0',
    isLoaded: () => true,
    load: () => Promise.resolve(),
    alias: action,
    group: action,
    identify: action,
    page: action,
    screen: action,
    track: action,
  }
}

export const createConfiguredNodePlugin = (
  props: ConfigureNodePluginProps,
  emitter: NodeEmitter
) => {
  let transport: PipelineTransport

  if (props.cloudflarePipelineBinding) {
    if (props.host) {
      console.warn(
        '[Cloudflare Analytics] Warning: Both "cloudflarePipelineBinding" and "cloudflarePipelineUrl" were provided. The SDK will use the Binding and ignore the URL.'
      )
    }

    const runtime = detectRuntime()
    if (runtime !== 'cloudflare-worker') {
      console.warn(
        `[Cloudflare Analytics] Warning: "cloudflarePipelineBinding" was provided, but the current runtime detected is "${runtime}". This configuration is only supported in Cloudflare Workers.`
      )
    }
    transport = new BindingTransport({
      binding: props.cloudflarePipelineBinding,
    })
  } else {
    // If no binding, we assume HTTP. Validation upstream ensures we have what we need.
    // We expect httpClient to be provided by the caller (Analytics constructor).
    if (!props.httpClient) {
        throw new Error('httpClient is required for HTTP transport')
    }
    transport = new HttpTransport({
      host: props.host,
      path: props.path,
      cloudflarePipelineBearerToken: props.cloudflarePipelineBearerToken,
      httpRequestTimeout: props.httpRequestTimeout,
      httpClient: props.httpClient,
      emitter,
    })
  }

  const publisher = new Publisher(
    {
      ...props,
      transport,
    },
    emitter
  )
  return {
    publisher: publisher,
    plugin: createNodePlugin(publisher),
  }
}
