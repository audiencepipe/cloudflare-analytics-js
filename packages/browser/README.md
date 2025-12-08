# Events Javascript SDK

## Note on Bearer Tokens
The browser version of the SDK does not support Bearer tokens for authentication. This is a security measure, as there is no secure way to store sensitive keys in a browser environment. If you absolutely require this, you should use a Cloudflare worker as server side middleware to store this.

## Installation via CDN

To integrate the JavaScript SDK with your website, place the following code snippet in the `<head>` section of your website.

```javascript
<script type="text/javascript">
!function(){var e=window.cfevents=window.cfevents||[];if(!e.initialize)if(e.invoked)window.console&&console.error&&console.error("Cloudflare snippet included twice.");else{e.invoked=!0,e.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"],e.factory=function(t){return function(){var n=Array.prototype.slice.call(arguments);return n.unshift(t),e.push(n),e}};for(var t=0;t<e.methods.length;t++){var n=e.methods[t];e[n]=e.factory(n)}e.load=function(t,n){var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src="https://cdn.audiencepipe.com/browser/release/v1-latest/events.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(o,r),e._loadOptions=n,e._writeKey=t},e.SNIPPET_VERSION="0.0.1",
e.load({cloudflarePipelineUrl:"https://yourpipelineurl.com"}),
e.page()}}();
</script>
```

`window.cfevents.track(...)` will then be available for use.



**Important Disclaimer:** The CDN version of this script is not guaranteed to be live forever as we don't provide a commercial service to host this. This script may be useful for prototyping; however, for production use, we highly recommend using the NPM script and/or running ```npm run build``` to build the script the script and host it on your own CDN if you're working in a codebase that doesn't use NPM.

### Alternative installation using NPM

1. Install the package

```sh
# npm
npm install @audiencepipe/cloudflare-analytics-js-browser

# yarn
yarn add @audiencepipe/cloudflare-analytics-js-browser

# pnpm
pnpm add @audiencepipe/cloudflare-analytics-js-browser
```

2. Import the package into your project and you're good to go (with working types)!

```ts
import { CfEventsBrowser } from '@audiencepipe/cloudflare-analytics-js-browser'

const cfevents = CfEventsBrowser.load({ cloudflarePipelineUrl:"https://yourpipelineurl.com" })

cfevents.identify('user_1234')

document.body?.addEventListener('click', () => {
 cfevents.track('document body clicked!')
})
```

**Note on Bearer Tokens:** The browser version of the SDK does not support Bearer tokens for authentication. This is a security measure, as there is no secure way to store sensitive keys in a browser environment.

## Lazy / Delayed Loading
You can load a buffered version of cfevents that requires `.load` to be explicitly called before initiating any network activity. This can be useful if you want to wait for a user to consent before fetching any tracking destinations or sending buffered events to cloudflare.

- ⚠️ ️`.load` should only be called _once_.

```ts
export const cfevents = new CfEventsBrowser()

cfevents.identify("hello world")

if (userConsentsToBeingTracked) {
    cfevents.load({cloudflarePipelineUrl:"https://yourpipelineurl.com" }) // destinations loaded, enqueued events are flushed
}
```

## Error Handling
### Handling initialization errors


If you want to catch initialization errors, you can do the following:
```ts
export const cfevents = new CfEventsBrowser();
cfevents
  .load({
    cloudflarePipelineUrl:"https://yourpipelineurl.com"})
  .catch((err) => ...);
```

## Usage in Common Frameworks / SPAs

### Vanilla React

```tsx
import { CfEventsBrowser } from '@audiencepipe/cloudflare-analytics-js-browser'

// We can export this instance to share with rest of our codebase.
export const cfevents = CfEventsBrowser.load({
  cloudflarePipelineUrl:"https://yourpipelineurl.com"})

const App = () => (
  <div>
    <button onClick={() => cfevents.track('hello world')}>Track</button>
  </div>
)
```
### Vue
1. Export cfevents instance. E.g. `services/cloudflare.ts`

```ts
import { CfEventsBrowser } from '@audiencepipe/cloudflare-analytics-js-browser'

export const cfevents = CfEventsBrowser.load({
  cloudflarePipelineUrl:"https://yourpipelineurl.com"
})
```


2. in `.vue` component

```tsx
<template>
  <button @click="track()">Track</button>
</template>

<script>
import { defineComponent } from 'vue'
import { cfevents } from './services/cloudflare'

export default defineComponent({
  setup() {
    function track() {
      cfevents.track('Hello world')
    }

    return {
      track,
    }
 },
})
</script>
```

## How to add typescript support when using the CDN snippet

NOTE: this is only required for snippet installation.

NPM installation should already have type support.

1. Install npm package `@audiencepipe/cloudflare-analytics-js-browser` as a dev dependency.

2. Create `./typings/cfevents.d.ts`
```ts
// ./typings/cfevents.d.ts
import type { CfEventsSnippet } from "@audiencepipe/cloudflare-analytics-js-browser";

declare global {
  interface Window {
    cfevents: CfEventsSnippet;
  }
}

```
3. Configure typescript to read from the custom `./typings` folder
```jsonc
// tsconfig.json
{
  ...
  "compilerOptions": {
    ....
    "typeRoots": [
      "./node_modules/@types",
      "./typings"
    ]
  }
  ....
}
```


## IP Address Enrichment Plugin

By default, the library does not provide an IP address in event payloads. The Cloudflare IP enrichment plugin solves this by automatically fetching and injecting the user's IP address into all event contexts.

To use this optional plugin:

```ts
import { CfEventsBrowser } from '@audiencepipe/cloudflare-analytics-js-browser'
import { cloudflareIPEnrichment } from '@audiencepipe/cloudflare-analytics-js-browser/dist/cjs/plugins/cloudflare-ip-enrichment'

const cfevents = new CfEventsBrowser()

cfevents.load({
  cloudflarePipelineUrl: "https://yourpipelineurl.com"
})

cfevents.register(cloudflareIPEnrichment)
```

The plugin works by:
1. Fetching the user's IP address from the Cloudflare trace endpoint (`https://cloudflare.com/cdn-cgi/trace`)
2. Extracting the IP from the response
3. Injecting it into the `context.ip` field of all outgoing event payloads
4. Caching the IP after the first fetch to avoid repeated network requests

The plugin will not overwrite an existing IP address if one is already present in the event context.

---

## Development

First, clone the repo and then startup our local dev environment:

```sh
$ git clone git@github.com:audiencepipe/cloudflare-analytics-js.git
$ cd cloudflare-analytics-js
$ nvm use  # installs correct version of node defined in .nvmrc.
$ npm install
$ npx turbo run build
$ npx turbo run test
```

> If you get "Cannot find module 'cf-events-sdk-js-browser' or its corresponding type declarations.ts(2307)" (in VSCode), you may have to "cmd+shift+p -> "TypeScript: Restart TS server"

# Plugins

When developing against Events SDK JS you will likely be writing plugins, which can augment functionality and enrich data. Plugins are isolated chunks which you can build, test, version, and deploy independently of the rest of the codebase. Plugins are bounded by Events SDK JS which handles things such as observability, retries, and error management.

Plugins can be of two different priorities:

1. **Critical**: Events SDK JS should expect this plugin to be loaded before starting event delivery
2. **Non-critical**: Events SDK JS can start event delivery before this plugin has finished loading

and can be of five different types:

1. **Before**: Plugins that need to be run before any other plugins are run. An example of this would be validating events before passing them along to other plugins.
2. **After**: Plugins that need to run after all other plugins have run. An example of this is the Hightouch.io integration, which will wait for destinations to succeed or fail so that it can send its observability metrics.
3. **Destination**: Destinations to send the event to (ie. legacy destinations). Does not modify the event and failure does not halt execution.
4. **Enrichment**: Modifies an event, failure here could halt the event pipeline.
5. **Utility**: Plugins that change Events SDK JS functionality and don't fall into the other categories.

Here is an example of a simple plugin that would convert all track events event names to lowercase before the event gets sent through the rest of the pipeline:

```ts
import type { Plugin } from '@audiencepipe/cloudflare-analytics-js-browser'

export const lowercase: Plugin = {
  name: 'Lowercase Event Name',
  type: 'before',
  version: '1.0.0',

  isLoaded: () => true,
  load: () => Promise.resolve(),

  track: (ctx) => {
    ctx.event.event = ctx.event.event.toLowerCase()
    return ctx
  }
}

cfevents.register(lowercase)
```

For further examples check out our [existing plugins](/packages/browser/src/plugins).



## QA
Feature work and bug fixes should include tests. Run all [Jest](https://jestjs.io) tests:
```
$ npx turbo test
```
Lint all with [ESLint](https://github.com/typescript-eslint/typescript-eslint/):
```
$ npx turbo lint
```

