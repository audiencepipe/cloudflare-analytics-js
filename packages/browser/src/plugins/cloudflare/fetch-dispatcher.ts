import { fetch } from '../../lib/fetch'

export type Dispatcher = (url: string, body: object) => Promise<unknown>

export type StandardDispatcherConfig = {
  keepalive?: boolean
}

export default function (
  cloudflarePipelineUrl: string,
  config?: StandardDispatcherConfig
): {
  dispatch: Dispatcher
} {
  function dispatch(_url: string, body: object): Promise<unknown> {
    return fetch(cloudflarePipelineUrl, {
      keepalive: config?.keepalive,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify(body),
    })
  }

  return {
    dispatch,
  }
}