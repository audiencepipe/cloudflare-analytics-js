import { fetch } from '../../lib/fetch'
import { onPageChange } from '../../lib/on-page-change'

export type BatchingDispatchConfig = {
  size?: number
  timeout?: number
}

const MAX_PAYLOAD_SIZE = 500

function kilobytes(buffer: unknown): number {
  const size = encodeURI(JSON.stringify(buffer)).split(/%..|./).length - 1
  return size / 1024
}

/**
 * Checks if the payload is over or close to
 * the maximum payload size allowed by tracking
 * API.
 */
function approachingTrackingAPILimit(buffer: unknown): boolean {
  return kilobytes(buffer) >= MAX_PAYLOAD_SIZE - 50
}

function chunks(batch: object[]): Array<object[]> {
  const result: object[][] = []
  let index = 0

  batch.forEach((item) => {
    const size = kilobytes(result[index])
    if (size >= 64) {
      index++
    }

    if (result[index]) {
      result[index].push(item)
    } else {
      result[index] = [item]
    }
  })

  return result
}

export default function batch(
  cloudflarePipelineUrl: string,
  config?: BatchingDispatchConfig
) {
  let buffer: object[] = []
  let pageUnloaded = false

  const limit = config?.size ?? 10
  const timeout = config?.timeout ?? 5000

  function sendBatch(batch: object[]) {
    if (batch.length === 0) {
      return
    }

    // For Cloudflare Pipeline, we send the batch directly to the pipeline URL
    // The payload is already an array of events, which is what Cloudflare Pipeline expects
    return fetch(cloudflarePipelineUrl, {
      keepalive: pageUnloaded,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'post',
      body: JSON.stringify(batch),
    })
  }

  async function flush(): Promise<unknown> {
    if (buffer.length) {
      const batch = buffer
      buffer = []
      return sendBatch(batch)
    }
  }

  let schedule: NodeJS.Timeout | undefined

  function scheduleFlush(): void {
    if (schedule) {
      return
    }

    schedule = setTimeout(() => {
      schedule = undefined
      flush().catch(console.error)
    }, timeout)
  }

  onPageChange((unloaded) => {
    pageUnloaded = unloaded

    if (pageUnloaded && buffer.length) {
      const reqs = chunks(buffer).map(sendBatch)
      Promise.all(reqs).catch(console.error)
    }
  })

  async function dispatch(_url: string, body: object): Promise<unknown> {
    buffer.push(body)

    const bufferOverflow =
      buffer.length >= limit || approachingTrackingAPILimit(buffer)

    return bufferOverflow || pageUnloaded ? flush() : scheduleFlush()
  }

  return {
    dispatch,
  }
}