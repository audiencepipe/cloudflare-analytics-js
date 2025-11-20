  1 | # Events Javascript SDK
  2 | 
 3 | ## Installation via CDN
 4 | 
 5 | To integrate the JavaScript SDK with your website, place the following code snippet in the `<head>` section of your website.
  6 | 
  7 | ```javascript
  8 | <script type="text/javascript">
  9 | !function(){var e=window.cfevents=window.cfevents||[];if(!e.initialize)if(e.invoked)window.console&&console.error&&console.error("Cloudflare snippet included twice.");else{e.invoked=!0,e.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"],e.factory=function(t){return function(){var n=Array.prototype.slice.call(arguments);return n.unshift(t),e.push(n),e}};for(var t=0;t<e.methods.length;t++){var n=e.methods[t];e[n]=e.factory(n)}e.load=function(t,n){var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src="https://cdn.cloudflare-events.com/browser/release/v1-latest/events.min.js";var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(o,r),e._loadOptions=n,e._writeKey=t},e.SNIPPET_VERSION="0.0.1",
 10 | e.load(<WRITE_KEY>,{apiHost:<DATA_PLANE_URL>}),
 11 | e.page()}}();
 12 | </script>
 13 | ```
 14 | 
 15 | `window.cfevents.track(...)` will then be available for use.
 16 | 
 17 | ### Alternative installation using NPM
 18 | 
 19 | 1. Install the package
 20 | 
 21 | ```sh
 22 | # npm
 23 | npm install cf-events-sdk-js-browser
 24 | 
 25 | # yarn
 26 | yarn add cf-events-sdk-js-browser
 27 | 
 28 | # pnpm
 29 | pnpm add cf-events-sdk-js-browser
 30 | ```
 31 | 
 32 | 2. Import the package into your project and you're good to go (with working types)!
 33 | 
 34 | ```ts
 35 | import { CfEventsBrowser } from 'cf-events-sdk-js-browser'
 36 | 
 37 | const cfevents = CfEventsBrowser.load({ writeKey: '<YOUR_WRITE_KEY>' })
 38 | 
 39 | cfevents.identify('hello world')
 40 | 
 41 | document.body?.addEventListener('click', () => {
 42 |   cfevents.track('document body clicked!')
 43 | })
 44 | ```
 45 | 
 46 | ## Lazy / Delayed Loading
 47 | You can load a buffered version of cfevents that requires `.load` to be explicitly called before initiating any network activity. This can be useful if you want to wait for a user to consent before fetching any tracking destinations or sending buffered events to cloudflare.
 48 | 
 49 | - ⚠️ ️`.load` should only be called _once_.
 50 | 
 51 | ```ts
 52 | export const cfevents = new CfEventsBrowser()
 53 | 
 54 | cfevents.identify("hello world")
 55 | 
 56 | if (userConsentsToBeingTracked) {
 57 |     cfevents.load({ writeKey: '<YOUR_WRITE_KEY>' }) // destinations loaded, enqueued events are flushed
 58 | }
 59 | ```
 60 | 
 61 | ## Error Handling
 62 | ### Handling initialization errors
 63 | If you want to catch initialization errors, you can do the following:
 64 | ```ts
 65 | export const cfevents = new CfEventsBrowser();
 66 | cfevents
 67 |   .load({ writeKey: "MY_WRITE_KEY" })
 68 |   .catch((err) => ...);
 69 | ```
 70 | 
 71 | ## Usage in Common Frameworks / SPAs
 72 | 
 73 | ### Vanilla React
 74 | ```tsx
 75 | import { CfEventsBrowser } from 'cf-events-sdk-js-browser'
 76 | 
 77 | // We can export this instance to share with rest of our codebase.
 78 | export const cfevents = CfEventsBrowser.load({ writeKey: '<YOUR_WRITE_KEY>' })
 79 | 
 80 | const App = () => (
 81 |   <div>
 82 |     <button onClick={() => cfevents.track('hello world')}>Track</button>
 83 |   </div>
 84 | )
 85 | ```
 86 | 
 87 | 
 88 | 
 89 | ### Vue
 90 | 
 91 | 1. Export cfevents instance. E.g. `services/cloudflare.ts`
 92 | 
 93 | ```ts
 94 | import { CfEventsBrowser } from 'cf-events-sdk-js-browser'
 95 | 
 96 | export const cfevents = CfEventsBrowser.load({
 97 |   writeKey: '<YOUR_WRITE_KEY>',
 98 | })
 99 | ```
100 | 
101 | 2. in `.vue` component
102 | 
103 | ```tsx
104 | <template>
105 |   <button @click="track()">Track</button>
106 | </template>
107 | 
108 | <script>
109 | import { defineComponent } from 'vue'
110 | import { cfevents } from './services/cloudflare'
111 | 
112 | export default defineComponent({
113 |   setup() {
114 |     function track() {
115 |       cfevents.track('Hello world')
16 |     }
117 | 
118 |     return {
119 |       track,
120 |     }
121 |   },
122 | })
123 | </script>
124 | ```
125 | 
126 | ## How to add typescript support when using the CDN snippet
127 | 
128 | NOTE: this is only required for snippet installation.
129 | 
130 | NPM installation should already have type support.
131 | 
132 | 1. Install npm package `cf-events-sdk-js-browser` as a dev dependency.
133 | 
134 | 2. Create `./typings/cfevents.d.ts`
135 | ```ts
136 | // ./typings/cfevents.d.ts
137 | import type { CfEventsSnippet } from "cf-events-sdk-js-browser";
138 | 
139 | declare global {
140 |   interface Window {
141 |     cfevents: CfEventsSnippet;
142 |   }
143 | }
144 | 
145 | ```
146 | 3. Configure typescript to read from the custom `./typings` folder
147 | ```jsonc
148 | // tsconfig.json
149 | {
150 |   ...
151 |   "compilerOptions": {
152 |     ....
153 |     "typeRoots": [
154 |       "./node_modules/@types",
155 |       "./typings"
156 |     ]
157 |   }
158 |   ....
159 | }
160 | ```
161 | 
162 | ---
163 | 
164 | ## Development
165 | 
166 | First, clone the repo and then startup our local dev environment:
167 | 
168 | ```sh
169 | $ git clone git@github.com:ht-sdks/events-sdk-js-mono.git
170 | $ cd events-sdk-js-mono
171 | $ nvm use  # installs correct version of node defined in .nvmrc.
172 | $ npm install
173 | $ npx turbo run build
174 | $ npx turbo run test
175 | ```
176 | 
177 | > If you get "Cannot find module 'cf-events-sdk-js-browser' or its corresponding type declarations.ts(2307)" (in VSCode), you may have to "cmd+shift+p -> "TypeScript: Restart TS server"
178 | 
179 | # Plugins
180 | 
181 | When developing against Events SDK JS you will likely be writing plugins, which can augment functionality and enrich data. Plugins are isolated chunks which you can build, test, version, and deploy independently of the rest of the codebase. Plugins are bounded by Events SDK JS which handles things such as observability, retries, and error management.
182 | 
183 | Plugins can be of two different priorities:
184 | 
185 | 1. **Critical**: Events SDK JS should expect this plugin to be loaded before starting event delivery
186 | 2. **Non-critical**: Events SDK JS can start event delivery before this plugin has finished loading
187 | 
188 | and can be of five different types:
189 | 
190 | 1. **Before**: Plugins that need to be run before any other plugins are run. An example of this would be validating events before passing them along to other plugins.
191 | 2. **After**: Plugins that need to run after all other plugins have run. An example of this is the Hightouch.io integration, which will wait for destinations to succeed or fail so that it can send its observability metrics.
192 | 3. **Destination**: Destinations to send the event to (ie. legacy destinations). Does not modify the event and failure does not halt execution.
193 | 4. **Enrichment**: Modifies an event, failure here could halt the event pipeline.
194 | 5. **Utility**: Plugins that change Events SDK JS functionality and don't fall into the other categories.
195 | 
196 | Here is an example of a simple plugin that would convert all track events event names to lowercase before the event gets sent through the rest of the pipeline:
197 | 
198 | ```ts
199 | import type { Plugin } from 'cf-events-sdk-js-browser'
200 | 
201 | export const lowercase: Plugin = {
202 |   name: 'Lowercase Event Name',
203 |   type: 'before',
204 |   version: '1.0.0',
205 | 
206 |   isLoaded: () => true,
207 |   load: () => Promise.resolve(),
208 | 
209 |   track: (ctx) => {
210 |     ctx.event.event = ctx.event.event.toLowerCase()
211 |     return ctx
212 |   }
213 | }
214 | 
215 | cfevents.register(lowercase)
216 | ```
217 | 
218 | For further examples check out our [existing plugins](/packages/browser/src/plugins).
219 | 
220 | ## Source Middleware
21 | 
22 | Source middleware allows for defining a function to manipulate the event payload and filter events on a per source basis. It's a specialized `before` [`Plugin`](#plugins) that makes it easy to do things like enriching the event `context` with custom fields.
223 | 
224 | ```ts
225 | cfevents.addSourceMiddleware(({ payload, next }) => {
226 |   const event = payload.obj;
27 |   event.context = {
228 |     ...event.context,
229 |     customField: "123",
230 |   };
231 |   next(payload);
232 | });
233 | ```
234 | 
235 | # Client-side destinations
236 | 
237 | The Browser SDK supports sending events directly from the client to destinations which is useful in situations where the destination requires a client-side context in order to fully enrich and attribute events.
238 | 
239 | ## Google Tag Manager
240 | 
241 | The Google Tag Manager integration pushes events directly to [Google Tag Manager](https://support.google.com/tagmanager/answer/6102821?hl=en). This tag in turn can forward to a variety of other tools.
242 | 
243 | ### Installation
244 | 
245 | Make sure your Google Tag Manager setup scripts are configured on your website. Our implementation expects `window.dataLayer` to be available in the global scope.
246 | 
247 | ```html
248 | <!-- example Google Tag Manager script -->
249 | <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
250 | new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
251 | j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
252 | 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
253 | })(window,document,'script','dataLayer','GTM-XXXXXXXX');</script>
254 | ```
255 | 
256 | You can then configure the Browser SDK to send events directly to Google Tag Manager by enabling the `Google Tag Manager` destination:
257 | 
258 | ```js
259 | cfevents.load('WRITE_KEY', {
260 |   destinations: {
261 |     'Google Tag Manager': {},
262 |   },
263 | })
264 | ```
265 | 
266 | View the complete plugin documentation in [`google-tag-manager.ts`](src/plugins/destinations/google-tag-manager.ts#L12)
267 | 
268 | ### Usage
269 | 
270 | Once the destination is configured, all applicable `identify`, `track`, and `page` events will be sent. The integration also automatically populates the `userId` and `cloudflareAnonymousId` fields.
271 | 
272 | ```js
273 | cfevents.track('My Event', { prop: 'abc' })
274 | // This results in the following Google Tag Manager event.
275 | // window.dataLayer.push({ event: 'My Event', prop: 'abc', user_id: '123', cloudflare_anonymous_id: '456' })
276 | ```
277 | 
278 | ## gtag.js
279 | 
280 | The Google Tag (gtag.js) integration pushes events directly to [gtag.js](https://developers.google.com/tag-platform/gtagjs). This tag in turn can forward to a variety of Google products, including Google Ads, Google Analytics, Campaign Manager, Display & Video 360, and Search Ads 360.
281 | 
282 | ### Installation
283 | 
284 | Make sure your gtag.js setup scripts are configured on your website. Our implementation expects the `gtag` function to be available in the global scope.
285 | 
286 | ```html
287 | <!-- example GA4 setup using gtag.js -->
288 | <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXX" ></script>
289 | <script>
290 |   window.dataLayer = window.dataLayer || []
291 |   function gtag() {
292 |     dataLayer.push(arguments)
293 |   }
294 |   gtag('js', new Date())
295 |   gtag('config', 'G-XXXXXXXX')
296 | </script>
297 | ```
298 | 
299 | You can then configure the Browser SDK to send events directly to gtag.js by enabling the `gtag` destination:
300 | 
301 | ```js
302 | cfevents.load('WRITE_KEY', {
303 |   destinations: {
304 |     gtag: {
305 |       // Events are only forwarded to the configured measurement IDs.
306 |       // For example, if you'd like to forward to GA4, you should include
307 |       // your GA4 measurement ID here.
308 |       measurementId: 'G-XXXXXXXX',
309 |     },
310 |   },
311 | })
312 | ```
313 | 
314 | View the complete plugin documentation in [`gtag.ts`](src/plugins/destinations/gtag.ts#L1)
315 | 
316 | ### Usage
317 | 
318 | Once the destination is configured, all applicable `identify`, `track`, and `page` events will be sent. The integration also automatically populates the `user_id` and `cloudflare_anonymous_id` fields.
319 | 
320 | ```js
321 | cfevents.track('My Event', { prop: 'abc' })
322 | // This results in the following gtag call.
323 | // gtag('event', 'My Event', { prop: 'abc', user_id: '123', cloudflareAnonymousId: '456'  })
324 | ```
325 | 
326 | ## Custom client-side destinations
327 | 
328 | If you'd like to send events to a custom client-side destination that is not yet supported, you can do so using the `Destination` class as a template and implement the relevant tracking methods (`track`, `page`, etc).
329 | 
330 | ```ts
331 | import { CfEventsBrowser, Destination } from "cf-events-sdk-js-browser";
332 | 
333 | const cfevents = new CfEventsBrowser();
334 | 
335 | cfevents.load({ writeKey: "WRITE_KEY" });
336 | 
337 | // register custom client-side destination
38 | cfevents.register(
339 |   new Destination("Console", "1.2.3", {
340 |     track: (ctx) => {
341 |       console.log("[console.track]", ctx.event);
342 |     },
343 |   })
344 | );
345 | ```
346 | 
347 | ## QA
348 | Feature work and bug fixes should include tests. Run all [Jest](https://jestjs.io) tests:
349 | ```
350 | $ npx turbo test
351 | ```
352 | Lint all with [ESLint](https://github.com/typescript-eslint/typescript-eslint/):
353 | ```
354 | $ npx turbo lint