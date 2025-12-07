import { BindingTransport } from '../transports'

describe('BindingTransport', () => {
  it('should call binding.send with events and return success', async () => {
    const sendMock = jest.fn().mockResolvedValue(undefined)
    const binding = { send: sendMock }
    const transport = new BindingTransport({ binding })

    const events = [{ event: 'test' }]
    const response = await transport.send(events)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(sendMock).toHaveBeenCalledWith(events)
    expect(response).toEqual({ status: 'success' })
  })

  it('should return retry on error', async () => {
    const error = new Error('Binding failed')
    const sendMock = jest.fn().mockRejectedValue(error)
    const binding = { send: sendMock }
    const transport = new BindingTransport({ binding })

    const events = [{ event: 'test' }]
    const response = await transport.send(events)

    expect(sendMock).toHaveBeenCalledTimes(1)
    expect(response).toEqual({ status: 'retry', error })
  })
})
