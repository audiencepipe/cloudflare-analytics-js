# @audiencepipe/cloudflare-analytics-node

https://www.npmjs.com/package/@audiencepipe/cloudflare-analytics-node


## Runtime Support
- Node.js >= 14
- AWS Lambda
- Cloudflare Workers
- Vercel Edge Functions
- Web Workers (experimental)

## Quick Start
### Install library
```bash
# npm
npm install @audiencepipe/cloudflare-analytics-node
# yarn
yarn add @audiencepipe/cloudflare-analytics-node
# pnpm
pnpm install @audiencepipe/cloudflare-analytics-node
```

### Usage
Assuming some express-like web framework.
```ts
import { CfEvents } from '@audiencepipe/cloudflare-analytics-node'
// or, if you use require:
const { CfEvents } = require('@audiencepipe/cloudflare-analytics-node')

// Note: You can also use CfEvents instead of CfEvents - they are the same

// instantiation
const cfevents = new CfEvents({ cloudflarePipelineUrl: '<MY_PIPELINE_URL>' })

app.post('/login', (req, res) => {
   cfevents.identify({
      userId: req.body.userId,
      previousId: req.body.previousId
  })
  res.sendStatus(200)
})

app.post('/cart', (req, res) => {
  cfevents.track({
    userId: req.body.userId,
    event: 'Add to cart',
    properties: { productId: '123456' }
  })
   res.sendStatus(201)
});
```


## Settings & Configuration

You can also see the complete list of settings in the [CfEventsSettings interface](src/app/settings.ts).



### `cloudflarePipelineUrl`
**Required** (unless `cloudflarePipelineBinding` is provided). The URL of your Cloudflare Pipeline. This setting is mandatory if you are not using a Binding.

```ts
const CfEvents = new CfEvents({
  cloudflarePipelineUrl: 'https://<MY_PIPELINE_URL>'
})
```

### `cloudflarePipelineBearerToken`
If your Cloudflare Pipeline requires an Access Key (Bearer token), you can provide it via `cloudflarePipelineBearerToken`. This will override the default Basic authentication.

```ts
const CfEvents = new CfEvents({
  cloudflarePipelineUrl: 'https://<MY_PIPELINE_URL>',
  cloudflarePipelineBearerToken: '<MY_ACCESS_KEY>'
})
```

### `cloudflarePipelineBinding`
**Optional (Cloudflare Workers Only)**. The Cloudflare Pipeline Binding object. If provided, this takes precedence over `cloudflarePipelineUrl`.

```ts
const cfevents = new CfEvents({
  cloudflarePipelineBinding: env.MY_PIPELINE
})
```

## Error Handling

### Initialization
The SDK is designed to "fail fast" during initialization. If you provide an invalid configuration (e.g., missing `cloudflarePipelineUrl`), the `new CfEvents(...)` constructor will throw an error immediately. This ensures you don't deploy an application with a broken configuration.

### Runtime
Runtime errors (e.g., network issues, authentication failures) are handled asynchronously and **will not crash your process**. Instead, they are emitted as an `error` event. You should listen to this event to handle failures (e.g., logging them).

```ts
const cfevents = new CfEvents({
  cloudflarePipelineUrl: 'https://...',
});

// Listen for errors so they don't go unnoticed
cfevents.on('error', ({ reason }) => {
  console.error('Analytics Error:', reason);
});

// This will NOT crash your app, even if the network is down
cfevents.track({ event: 'Test Event', userId: '123' });
```


## Usage in non-node runtimes
### Usage in AWS Lambda
- [AWS lambda execution environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) is challenging for typically non-response-blocking async activites like tracking or logging, since the runtime terminates / freezes after a response is emitted.

Here is an example of using CfEvents within a handler:
```ts
const { CfEvents } = require('@audiencepipe/cloudflare-analytics-node');

// since analytics has the potential to be stateful if there are any plugins added,
// to be on the safe side, we should instantiate a new instance of analytics on every request (the cost of instantiation is low).
const cfevents = () => new CfEvents({
      maxEventsInBatch: 1,
      cloudflarePipelineUrl: '<MY_PIPELINE_URL>',
    })
    .on('error', console.error);

module.exports.handler = async (event) => {
  ...
  // we need to await before returning, otherwise the lambda will exit before sending the request.
  await new Promise((resolve) =>
    cfevents().track({ ... }, resolve)
   )

  ...
  return {
    statusCode: 200,
  };
  ....
};
```

### Usage in Vercel Edge Functions
```ts
import { CfEvents } from '@audiencepipe/cloudflare-analytics-node';
import { NextRequest, NextResponse } from 'next/server';

export const cfevents = new CfEvents({
  cloudflarePipelineUrl: '<MY_PIPELINE_URL>',
  maxEventsInBatch: 1,
})
  .on('error', console.error)

export const config = {
  runtime: 'edge',
};

export default async (req: NextRequest) => {
  await new Promise((resolve) =>
    cfevents.track({ ... }, resolve)
  );
  return NextResponse.json({ ... })
};
```

### Usage in Cloudflare Workers

When running in Cloudflare Workers, we strongly recommend using [Cloudflare Pipeline Bindings](https://developers.cloudflare.com/pipelines/streams/writing-to-streams/) instead of HTTP. This is more secure (no need to manage secrets or URLs) and performant.

#### 1. Configure the Binding
Add the binding to your `wrangler.json` (or `wrangler.toml`):

**wrangler.json**
```json
{
  "pipelines": [
    {
      "binding": "MY_PIPELINE",
      "pipeline": "my-pipeline-name"
    }
  ]
}
```

**wrangler.toml**
```toml
[[pipelines]]
binding = "MY_PIPELINE"
pipeline = "my-pipeline-name"
```

#### 2. Initialize in your Worker

Pass the binding directly to the `CfEvents` constructor via `cloudflarePipelineBinding`. You do **not** need to provide `cloudflarePipelineUrl` when using a binding.

```ts
import { CfEvents } from '@audiencepipe/cloudflare-analytics-node';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const cfevents = new CfEvents({
      // Pass the binding directly from the environment
      cloudflarePipelineBinding: env.MY_PIPELINE,
      // Optional: limit batch size for serverless
      maxEventsInBatch: 1, 
    }).on('error', console.error);

    // Tip: Use ctx.waitUntil to flush events after the response is sent, 
    // ensuring low latency for the user.
    ctx.waitUntil(new Promise((resolve) => 
      cfevents.track({ event: 'Page View', userId: '123' }, resolve)
    ));

    return new Response('Hello World!');
  },
};
```


