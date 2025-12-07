import { BindingTransport, HttpTransport } from '../transports'
import { CloudflareEvent } from '../../../app/types'

const mockEvent: CloudflareEvent = {
  type: 'track',
  event: 'test',
  userId: 'user-123',
  timestamp: new Date().toISOString(),
}

describe('BindingTransport', () => {
  it('should call binding.send with events and return success', async () => {
    const sendMock = jest.fn().mockResolvedValue(undefined)
    const binding = { send: sendMock }
    const transport = new BindingTransport({ binding })

    const events = [mockEvent]
    const response = await transport.send(events)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(events)
    expect(response).toEqual({ status: 'success' })
  })

  it('should return fail on error', async () => {
    const error = new Error('Binding failed')
    const sendMock = jest.fn().mockRejectedValue(error)
    const binding = { send: sendMock }
    const transport = new BindingTransport({ binding })

    const events = [mockEvent]
    const response = await transport.send(events)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(response).toEqual({ status: 'fail', error })
  })
})

describe('HttpTransport', () => {
  const mockEmitter = { emit: jest.fn() } as any

  it('should return fail when fetch throws a fatal error (e.g. invalid URL)', async () => {
    const error = new TypeError('Invalid URL')
    const httpClient = {
      makeRequest: jest.fn().mockRejectedValue(error),
    }

    const transport = new HttpTransport({
      httpClient,
      emitter: mockEmitter,
      cloudflarePipelineBearerToken: 'token',
    })

    const events: CloudflareEvent[] = []
    const response = await transport.send(events)

    expect(response).toEqual({ status: 'fail', error })
  })

  it('should return retry when fetch throws a network error', async () => {
    const error = new Error('Network error')
    const httpClient = {
      makeRequest: jest.fn().mockRejectedValue(error),
    }

    const transport = new HttpTransport({
      httpClient,
      emitter: mockEmitter,
      cloudflarePipelineBearerToken: 'token',
    })

    const events: CloudflareEvent[] = []
    const response = await transport.send(events)

    expect(response).toEqual({ status: 'retry', error })
  })
})
