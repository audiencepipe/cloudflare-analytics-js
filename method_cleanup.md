# Method Cleanup

## Context

This document captures the ongoing effort to refactor the "Hightouch" branding to "Cloudflare" within the events SDK. This involves renaming types, functions, variables, and string literals across the codebase, focusing on the plugin and its direct dependencies. The goal is to ensure consistency and accuracy in the codebase after the rebranding.

## Current Work

The primary focus has been the systematic refactoring of "Hightouch" branding to "Cloudflare" within the codebase. This has involved updating configuration files, documentation, source code, and test files. A detailed plan was presented and approved by the user. During this process, several `search_and_replace` operations have been executed. The user recently provided feedback to ignore the Node.js library for now, which will impact the remaining tasks.

## Key Technical Concepts

- `cloudflarePipelineUrl`: A configuration parameter for the Cloudflare event pipeline.
- Plugins: Modular components adhering to the `Plugin` interface, extending `Analytics` functionality.
- Integration Settings: Configuration objects passed to plugins, now referred to as `CloudflareSettings`.
- `Analytics` instance: The core object managing event tracking and plugins.
- `CfEventsBrowser`: The public browser-side SDK interface.
- `CloudflareSettings` (formerly `HightouchioSettings`): Type definition for the Cloudflare plugin's configuration.
- `cloudflare` function (formerly `hightouchio`): The factory function responsible for creating the Cloudflare plugin.
- `npm run build`: Command used for compiling TypeScript code and verifying changes.
- `npm test`: Command used for running unit and integration tests.
- `search_and_replace`: Tool utilized for bulk text replacements.
- `read_file`: Tool used to inspect file contents.
- `write_to_file`: Tool used to modify file contents.
- `mv` command: Used for renaming directories.
- `jest.mock('unfetch')`: Jest utility for mocking network requests.
- `jest.spyOn`: Jest utility for creating spies on object methods.
- `LegacySettings`: Interface defining legacy settings for integrations.
- `InitOptions`: Interface defining initialization options for the Analytics instance.
- `turbo run test --filter='./packages/**'`: Command used to run tests across all packages in the monorepo.
- `--force`: Flag used with `turbo run test` to bypass caching and ensure all tests are physically executed.

## Relevant Files and Code

- **`.github/workflows/deploy-releases.yml`**: `PROD_BUCKET: 'hightouch-events'` changed to `PROD_BUCKET: 'cloudflare-events'`.
- **`.github/workflows/deploy-browser-cdn-candidate.yml`**: `PROD_BUCKET: 'hightouch-events'` changed to `PROD_BUCKET: 'cloudflare-events'`.
- **`packages/consent/consent-wrapper-onetrust/README.md`**: URL `https://hightouch.com/docs/...` changed to `https://cloudflare.com/docs/...`.
- **`packages/browser/src/core/http-cookies/server-examples/node-aws-lambda.md`**:
  - `cdn.hightouch-events.com` changed to `cdn.cloudflare-events.com`.
  - `apiHost:'us-east-1.hightouch-events.com'` changed to `apiHost:'us-east-1.cloudflare-events.com'`.
 - `bob@hightouch.io` changed to `bob@cloudflare.io`.
  - `george@hightouch.com` changed to `george@cloudflare.com`.
- **`packages/browser/ARCHITECTURE.md`**:
  - "hightouch.io plugin" changed to "cloudflare plugin".
  - "hightouch.io integration" changed to "cloudflare integration".
- **`packages/browser/src/core/http-cookies/README.md`**: `apiHost: "us-east-1.hightouch-events.com"` changed to `apiHost: "us-east-1.cloudflare-events.com"`.
- **`packages/browser/README.md`**: Multiple instances of "hightouch" and "Hightouch snippet" changed to "cloudflare" and "Cloudflare snippet" respectively.
- **`packages/core/src/events/interfaces.ts`**: URL `https://hightouch.com/academy/` changed to `https://cloudflare.com/academy/`.
- **`packages/consent/consent-tools/src/domain/load-cancellation.ts`**: "hightouch" references in comments and variable names changed to "cloudflare".
- **`packages/consent/consent-tools/src/domain/create-wrapper.ts`**: "hightouch" references in comments and variable names changed to "cloudflare".
- **`packages/consent/consent-tools/src/types/wrapper.ts`**: URL `https://cdn.hightouch-events.com` changed to `https://cdn.cloudflare-events.com`.
- **`packages/node/src/app/settings.ts`**: `https://us-east-1.hightouch-events.com` changed to `https://us-east-1.cloudflare-events.com`.
- **`packages/node/src/app/types/index.ts`**: `export * from './hightouch-event'` changed to `export * from './cloudflare-event'`.
- **`packages/node/src/app/types/hightouch-event.ts`**: Renamed to `packages/node/src/app/types/cloudflare-event.ts`.
- **`packages/node/src/app/analytics-node.ts`**: All instances of `hightouchEvent` replaced with `cloudflareEvent`.
- **`packages/node/src/plugins/cloudflare/publisher.ts`**: `https://us-east-1.hightouch-events.com` changed to `https://us-east-1.cloudflare-events.com`.
- **`packages/node/src/lib/http-client.ts`**: `https://us-east-1.hightouch-events.com` changed to `https://us-east-1.cloudflare-events.com`.
- **`packages/browser/src/browser/standalone-analytics.ts`**: "hightouch snippet" changed to "cloudflare snippet".
- **`packages/browser/src/lib/csp-detection.ts`**: `cdn.hightouch-events` changed to `cdn.cloudflare-events`.
- **`packages/browser/src/lib/parse-cdn.ts`**: `https://cdn.hightouch-events.com` changed to `https://cdn.cloudflare-events.com`.

## Problem Solving

- **`TypeError: cloudflare is not a function`**: Resolved by renaming local variables shadowing the imported `cloudflare` function in test files.
- **`Cannot find name 'HightouchPlugin'`**: Fixed by updating references to `CloudflarePlugin` in `integration.test.ts`.
- **`jest.spyOn(hightouch, 'track')`**: Corrected by renaming the variable to `cloudflarePlugin` and updating its usages.
- **Node.js test looking for `'Hightouch.io'`**: Fixed by updating the string literal to `'Cloudflare'`.
- **`getaddrinfo ENOTFOUND us-east-1.cloudflare-events.com`**: Resolved by enhancing the `jest.mock('unfetch', ...)` implementation to explicitly handle and return a successful mock response for Cloudflare pipeline URLs.
- **Failing `integration.test.ts` tests related to `integrations` options**: Adjusted logic for `shouldIgnoreCloudflare` and updated test cases.
- **User concern about "small sample of tests" and "FAILURES IN THIS LOG"**: Clarified that `npm test` uses caching, and `npm run test -- --force` is necessary for full verification. Confirmed that all tests passed with a forced run.
- **User feedback on TODO list**: The user requested more frequent updates to the TODO list to better track progress.
- **User feedback on Node.js library**: The user instructed to ignore the Node.js library for now, meaning remaining Node.js related tasks should be skipped.

## Pending Tasks and Next Steps

- [ ] Update `'Hightouch.io'` to `'Cloudflare'` in `packages/browser/src/plugins/ajs-destination/index.ts`.
- [ ] Update `hightouch_anonymous_id` to `cloudflare_anonymous_id` in `packages/browser/src/plugins/destinations/gtag.ts`.
- [ ] Update `hightouchAnonymousId` to `cloudflareAnonymousId` in `packages/browser/src/plugins/destinations/google-tag-manager.ts`.
- [ ] Update `us-east-1.hightouch-events.com` to `us-east-1.cloudflare-events.com` in `packages/browser/src/plugins/analytics-node/index.ts`.
- [ ] Update `cdn.hightouch-events.(com|build)` to `cdn.cloudflare-events.(com|build)` in `packages/browser/src/plugins/remote-loader/index.ts`.
- [ ] Rename `HIGHTOUCH_API_HOST` to `CLOUDFLARE_API_HOST` and update its value in `packages/browser/src/core/constants/index.ts`.
- [ ] Update `hightouch-fork-of-rudder` and `hightouch anonymousId` in `packages/browser/src/core/user/migrate.ts`.
- [ ] Update `us-east-1.hightouch-events.com` and `hightouchEvent` in `packages/browser/src/core/analytics/index.ts`.
- [ ] Update `hightouch metrics` in `packages/browser/src/core/stats/remote-metrics.ts`.
- [ ] Update test descriptions in `packages/consent/consent-tools/src/domain/__tests__/create-wrapper.test.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/node/src/__tests__/http-integration.test.ts`.
- [ ] Update `hightouch.io plugin` in `packages/node/src/__tests__/graceful-shutdown-integration.test.ts`.
- [ ] Replace `hightouchPlugin` with `cloudflarePlugin` in `packages/node/src/plugins/cloudflare/__tests__/methods.test.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/node/src/__tests__/test-helpers/assert-shape/hightouch-http-api.ts`.
- [ ] Rename `packages/node/src/__tests__/test-helpers/assert-shape/hightouch-http-api.ts` to `cloudflare-http-api.ts` and update its export in `packages/node/src/__tests__/test-helpers/assert-shape/index.ts`.
- [ ] Replace `hightouchPlugin` with `cloudflarePlugin` in `packages/node/src/plugins/cloudflare/__tests__/publisher.test.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/node/src/__tests__/http-client.integration.test.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/src/browser/__tests__/analytics-lazy-init.integration.test.ts`.
- [ ] Update `hightouch.com` and `cdn.hightouch-events.com` in `packages/browser/src/browser/__tests__/csp-detection.test.ts`.
- [ ] Update `window.hightouch` in `packages/browser/src/browser/__tests__/analytics-pre-init.integration.test.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/src/browser/__tests__/cdn.test.ts`.
- [ ] Update `cdn.hightouch-events.com` and `us-east-1.hightouch-events.com` in `packages/browser/src/test-helpers/fixtures/create-fetch-method.ts`.
- [ ] Update `hightouch-snippet` and `hightouch.com` in `packages/browser/src/browser/__tests__/standalone.test.ts` and `packages/browser/src/browser/__tests__/standalone-errors.test.ts`.
- [ ] Update `hightouch-snippet`, `hightouch.com`, and `employer: 'hightouch'` in `packages/browser/src/browser/__tests__/standalone-analytics.test.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/src/browser/__tests__/integration.test.ts`.
- [ ] Update `hightouch.local` in `packages/browser/src/core/page/__tests__/index.test.ts`.
- [ ] Update `'Hightouch.io'` and `us-east-1.hightouch-events.com` in `packages/browser/src/lib/__tests__/merged-options.test.ts`.
- [ ] Update `hightouch cdn` and `cdn.hightouch-events.com` in `packages/browser/src/lib/__tests__/parse-cdn.test.ts`.
- [ ] Update `hightouch.io` in `packages/browser/src/core/user/__tests__/tld.test.ts`.
- [ ] Update `hightouch anonymousId` in `packages/browser/src/core/user/__tests__/migrate.test.ts`.
- [ ] Update `hightouch.io` and `cdn.hightouch-events.com` in `packages/browser/src/plugins/ajs-destination/__tests__/index.test.ts`.
- [ ] Remove or update comment in `packages/browser/src/plugins/cloudflare/__tests__/retries.test.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/browser/src/plugins/analytics-node/__tests__/index.test.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/src/plugins/remote-middleware/__tests__/index.test.ts`.
- [ ] Update `cdn.hightouch-events.com` and `cdn.hightouch-events.build` in `packages/browser/src/plugins/remote-loader/__tests__/index.test.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/src/plugins/schema-filter/__tests__/index.test.ts`.
- [ ] Replace `hightouchio` with `cloudflare` in `packages/core/src/queue/__tests__/event-queue.test.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/test-helpers/src/analytics/cdn-settings-builder.ts`.
- [ ] Update `us-east-1.hightouch-events` in `packages/browser/qa/__tests__/smoke.test.ts`.
- [ ] Update `cdn.hightouch-events` and `us-east-1.hightouch-events.com` in `packages/browser/qa/lib/runner.ts`.
- [ ] Update `cdn.hightouch-events.com` in `packages/browser/qa/__fixtures__/snippets.ts`.
- [ ] Update `us-east-1.hightouch-events.com` in `packages/browser/qa/lib/jest-reporter.js`.
- [ ] Run `npm run build` and `npm test --force` to verify all changes.