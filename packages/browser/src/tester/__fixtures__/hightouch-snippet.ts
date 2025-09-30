/* eslint-disable */

export const snippet = (writeKey: string, load: boolean = true, extra = '') => `
!(function () {
  var cfevents = (window.cfevents = window.cfevents || [])
  if (!cfevents.initialize)
    if (cfevents.invoked) window.console && console.error && console.error('Hightouch snippet included twice.')
    else {
      cfevents.invoked = !0
      cfevents.methods = [
        'screen',
        'register',
        'deregister',
        'trackSubmit',
        'trackClick',
        'trackLink',
        'trackForm',
        'pageview',
        'identify',
        'reset',
        'group',
        'track',
        'ready',
        'alias',
        'debug',
        'page',
        'once',
        'off',
        'on',
        'addSourceMiddleware',
        'addIntegrationMiddleware',
        'setAnonymousId',
        'addDestinationMiddleware',
      ]
      cfevents.factory = function (e) {
        return function () {
          var t = Array.prototype.slice.call(arguments)
          t.unshift(e)
          cfevents.push(t)
          return cfevents
        }
      }
      for (var e = 0; e < cfevents.methods.length; e++) {
        var key = cfevents.methods[e]
        cfevents[key] = cfevents.factory(key)
      }
      cfevents.load = function (key, e) {
        var t = document.createElement('script')
        t.type = 'text/javascript'
        t.async = !0
        t.src = 'https://cdn.foo.com/analytics.js/v1/' + key + '/analytics.min.js'
        var n = document.getElementsByTagName('script')[0]
        n.parentNode.insertBefore(t, n)
        cfevents._loadOptions = e
      }
      var smw1 = function ({}) {}
      cfevents.addSourceMiddleware(smw1);
      cfevents.SNIPPET_VERSION = '4.13.1'
      ${load && `cfevents.load('${writeKey}')`}
      cfevents.page()
      ${extra}
    }
})()
`
