# @ht-sdks/events-sdk-js-node

https://www.npmjs.com/package/@ht-sdks/events-sdk-js-node


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
npm install @ht-sdks/events-sdk-js-node
# yarn
yarn add @ht-sdks/events-sdk-js-node
# pnpm
pnpm install @ht-sdks/events-sdk-js-node
```

### Usage
Assuming some express-like web framework.
```ts
import { HtEvents } from '@ht-sdks/events-sdk-js-node'
// or, if you use require:
const { HtEvents } = require('@ht-sdks/events-sdk-js-node')

// instantiation
const htevents = new HtEvents({ cloudflarePipelineUrl: '<MY_PIPELINE_URL>' })

app.post('/login', (req, res) => {
   htevents.identify({
      userId: req.body.userId,
      previousId: req.body.previousId
  })
  res.sendStatus(200)
})

app.post('/cart', (req, res) => {
  htevents.track({
    userId: req.body.userId,
    event: 'Add to cart',
    properties: { productId: '123456' }
  })
   res.sendStatus(201)
});
```


## Settings & Configuration

You can also see the complete list of settings in the [HtEventsSettings interface](src/app/settings.ts).

### `cloudflarePipelineUrl`
**Required**. The URL of your Cloudflare Pipeline. This setting is mandatory and takes precedence over the `host` setting.

```ts
const htevents = new HtEvents({
  cloudflarePipelineUrl: 'https://<MY_PIPELINE_URL>'
})
```

### `cloudflarePipelineBearerToken`
If your Cloudflare Pipeline requires an Access Key (Bearer token), you can provide it via `cloudflarePipelineBearerToken`. This will override the default Basic authentication.

```ts
const htevents = new HtEvents({
  cloudflarePipelineUrl: 'https://<MY_PIPELINE_URL>',
  cloudflarePipelineBearerToken: '<MY_ACCESS_KEY>'
})
```

## Error Handling

### Initialization
The SDK is designed to "fail fast" during initialization. If you provide an invalid configuration (e.g., missing `cloudflarePipelineUrl`), the `new HtEvents(...)` constructor will throw an error immediately. This ensures you don't deploy an application with a broken configuration.

### Runtime
Runtime errors (e.g., network issues, authentication failures) are handled asynchronously and **will not crash your process**. Instead, they are emitted as an `error` event. You should listen to this event to handle failures (e.g., logging them).

```ts
const htevents = new HtEvents({
  cloudflarePipelineUrl: 'https://...',
});

// Listen for errors so they don't go unnoticed
htevents.on('error', ({ reason }) => {
  console.error('Analytics Error:', reason);
});

// This will NOT crash your app, even if the network is down
htevents.track({ event: 'Test Event', userId: '123' });
```


## Usage in non-node runtimes
### Usage in AWS Lambda
- [AWS lambda execution environment](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) is challenging for typically non-response-blocking async activites like tracking or logging, since the runtime terminates / freezes after a response is emitted.

Here is an example of using HtEvents within a handler:
```ts
const { HtEvents } = require('@ht-sdks/events-sdk-js-node');

// since analytics has the potential to be stateful if there are any plugins added,
// to be on the safe side, we should instantiate a new instance of analytics on every request (the cost of instantiation is low).
const htevents = () => new HtEvents({
      maxEventsInBatch: 1,
      cloudflarePipelineUrl: '<MY_PIPELINE_URL>',
    })
    .on('error', console.error);

module.exports.handler = async (event) => {
  ...
  // we need to await before returning, otherwise the lambda will exit before sending the request.
  await new Promise((resolve) =>
    htevents().track({ ... }, resolve)
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
import { HtEvents } from '@ht-sdks/events-sdk-js-node';
import { NextRequest, NextResponse } from 'next/server';

export const htevents = new HtEvents({
  cloudflarePipelineUrl: '<MY_PIPELINE_URL>',
  maxEventsInBatch: 1,
})
  .on('error', console.error)

export const config = {
  runtime: 'edge',
};

export default async (req: NextRequest) => {
  await new Promise((resolve) =>
    htevents.track({ ... }, resolve)
  );
  return NextResponse.json({ ... })
};
```

### Usage in Cloudflare Workers
```ts
import { HtEvents, Context } from '@ht-sdks/events-sdk-js-node';

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const htevents = new HtEvents({
      maxEventsInBatch: 1,
      cloudflarePipelineUrl: '<MY_PIPELINE_URL>',
    }).on('error', console.error);

    await new Promise((resolve, reject) =>
      htevents.track({ ... }, resolve)
    );

    ...
    return new Response(...)
  },
};

```


