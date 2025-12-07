import { createConfiguredNodePlugin } from '../index'
import { NodeEmitter } from '../../../app/emitter'
import * as EnvUtils from '../../../lib/env'

describe('Runtime Configuration Warning', () => {
  let consoleWarnSpy: jest.SpyInstance
  let emitter: NodeEmitter

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    emitter = new NodeEmitter()
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
    jest.restoreAllMocks()
  })

  it('should warn if cloudflarePipelineBinding is detected in a non-worker (Node) environment', () => {
    // Force runtime to be 'node'
    jest.spyOn(EnvUtils, 'detectRuntime').mockReturnValue('node')

    createConfiguredNodePlugin(
      {
        cloudflarePipelineBinding: { send: jest.fn() },
        flushInterval: 100,
        maxEventsInBatch: 10,
        maxRetries: 3,
        writeKey: 'foo',
      },
      emitter
    )

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Cloudflare Analytics] Warning: "cloudflarePipelineBinding" was provided, but the current runtime detected is "node"'
      )
    )
  })

  it('should NOT warn if cloudflarePipelineBinding is detected in a Cloudflare Worker environment', () => {
    // Force runtime to be 'cloudflare-worker'
    jest.spyOn(EnvUtils, 'detectRuntime').mockReturnValue('cloudflare-worker')

    createConfiguredNodePlugin(
      {
        cloudflarePipelineBinding: { send: jest.fn() },
        flushInterval: 100,
        maxEventsInBatch: 10,
        maxRetries: 3,
        writeKey: 'foo',
      },
      emitter
    )

    expect(consoleWarnSpy).not.toHaveBeenCalled()
  })

  it('should warn if both cloudflarePipelineBinding and cloudflarePipelineUrl (host) are provided', () => {
    jest.spyOn(EnvUtils, 'detectRuntime').mockReturnValue('cloudflare-worker')

    createConfiguredNodePlugin(
      {
        cloudflarePipelineBinding: { send: jest.fn() },
        host: 'https://foo.com',
        flushInterval: 100,
        maxEventsInBatch: 10,
        maxRetries: 3,
        writeKey: 'foo',
      },
      emitter
    )

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '[Cloudflare Analytics] Warning: Both "cloudflarePipelineBinding" and "cloudflarePipelineUrl" were provided'
      )
    )
  })
})
