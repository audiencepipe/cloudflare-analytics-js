import { CfEvents } from './src'

// -------------------------------------------------------------------
// 1️⃣  Create the SDK instance – use an *invalid* bearer token
// -------------------------------------------------------------------
const cfevents = new CfEvents({
  // This is a real ingest endpoint; replace the token with something bogus.
  cloudflarePipelineUrl:
    'https://webhook.site/27c55b0c-eb34-4bb4-b51a-2aa3f4d3eab9',
  cloudflarePipelineBearerToken: 'this-is-a-bogus-token',
  flushInterval: 500,
  maxEventsInBatch: 5,
})

// -------------------------------------------------------------------
// 2️⃣  Listen for any emitted error events (covers async failures)
// -------------------------------------------------------------------
cfevents.on('error', ({ reason }) => {
  console.error('🚨 SDK emitted error event →', reason)
})

// -------------------------------------------------------------------
// 3️⃣  Track an event *with a callback* so we can inspect the result
// -------------------------------------------------------------------
console.log('📤 Sending event…')
console.log('📤 Sending track event…')
cfevents.track(
  {
    event: 'Manual Test Event',
    userId: 'manual-user',
    properties: { foo: 'bar' },
    integrations: { All: true },
  },
  (err, ctx) => {
    if (err) {
      console.error('❌ Track error →', err)
    } else {
      console.log('✅ Track success →', ctx)
    }
  }
)

console.log('📤 Sending identify event…')
cfevents.identify(
  {
    userId: 'manual-user',
    traits: { role: 'tester' },
    integrations: { All: true },
  },
  (err, ctx) => {
    if (err) {
      console.error('❌ Identify error →', err)
    } else {
      console.log('✅ Identify success →', ctx)
    }
  }
)

// -------------------------------------------------------------------
// 4️⃣  Keep the process alive long enough for the flush to happen
// -------------------------------------------------------------------
setTimeout(() => {
  console.log('🛑 Test complete.')
}, 2000)
