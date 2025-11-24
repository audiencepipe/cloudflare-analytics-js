import type {
  CfEventsSnippet,
  CfEventsBrowser,
} from '@ht-sdks/events-sdk-js-browser'
import { createWrapper, AnyAnalytics } from '../../index'

type Extends<T, U> = T extends U ? true : false

{
  const wrap = createWrapper({ getCategories: () => ({ foo: true }) })
  wrap({} as CfEventsBrowser)
  wrap({} as CfEventsSnippet)

  // see CfEventsSnippet and CfEventsBrowser extend AnyAnalytics
  const f: Extends<CfEventsSnippet, AnyAnalytics> = true
  const g: Extends<CfEventsBrowser, AnyAnalytics> = true
  console.log(f, g)

  // should be chainable
  wrap({} as CfEventsBrowser).load({ writeKey: 'foo' })
}
