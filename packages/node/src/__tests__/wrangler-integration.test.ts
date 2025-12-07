import { unstable_dev } from 'wrangler'
import type { Unstable_DevWorker } from 'wrangler'
import * as path from 'path'

describe('Wrangler Integration', () => {
  let worker: Unstable_DevWorker

  beforeAll(async () => {
    worker = await unstable_dev(
      path.resolve(__dirname, './fixtures/worker.ts'),
      {
        experimental: {
          disableExperimentalWarning: true,
        },
        config: path.resolve(__dirname, './fixtures/wrangler.test.json'),
      }
    )
  })

  afterAll(async () => {
    worker && (await worker.stop())
  })

  it('should successfully send an event via binding in a worker environment', async () => {
    const resp = await worker.fetch('http://localhost')
    const text = await resp.text()
    if (resp.status !== 200) console.error('Worker Error:', text)

    expect(resp.status).toBe(200)
    expect(text).toBe('Success')
  })
})
