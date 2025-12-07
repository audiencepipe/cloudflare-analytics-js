import { CfEvents } from '../../app/analytics-node'

export default {
  async fetch(_request: Request, env: any, _ctx: any) {
    if (
      !env.TESTRUNNER_BINDING ||
      (typeof env.TESTRUNNER_BINDING === 'object' &&
        Object.keys(env.TESTRUNNER_BINDING).length === 0)
    ) {
      // Fallback: If Miniflare/Wrangler doesn't auto-mock the pipeline binding correctly in unstable_dev,
      // we mock it here to ensure we still test the SDK in the Worker runtime.
      env.TESTRUNNER_BINDING = {
        send: async (events: any[]) => {
          console.log('Mock Binding received:', events.length)
        },
      }
    }

    const cfevents = new CfEvents({
      cloudflarePipelineBinding: env.TESTRUNNER_BINDING,
      flushInterval: 1, // nearly instant flush
      maxEventsInBatch: 1,
    })

    try {
      await new Promise<void>((resolve, reject) => {
        cfevents.track(
          {
            event: 'test_event',
            userId: 'test_user',
          },
          (err, _context) => {
            if (err) {
              reject(err)
            } else {
              resolve()
            }
          }
        )
      })
      return new Response('Success', { status: 200 })
    } catch (e: any) {
      return new Response(e.message || String(e), { status: 500 })
    }
  },
}
