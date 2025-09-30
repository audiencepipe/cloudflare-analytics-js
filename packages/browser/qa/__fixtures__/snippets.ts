export function next(writekey: string, obfuscate: boolean) {
  return `
    <html>
    <head></head>
    <script>
      !(function () {
        var cfevents = (window.cfevents = window.cfevents || [])
        if (!cfevents.initialize)
          if (cfevents.invoked)
            window.console &&
              console.error &&
              console.error('Hightouch snippet included twice.')
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
              t.src = 'http://localhost:4000/dist/umd/standalone.js'
              var n = document.getElementsByTagName('script')[0]
              n.parentNode.insertBefore(t, n)
              cfevents._loadOptions = e
            }
            cfevents.SNIPPET_VERSION = '4.13.1'
            cfevents._writeKey = '${writekey}'
            cfevents.load('${writekey}', { obfuscate: ${obfuscate} })
          }
      })()
    </script>
    <body>
    next
    <img id="taylor" src="https://i.insider.com/57d1eef909d29325008b6cfa?width=1100&format=jpeg&auto=webp" />
    </body>
    </html>
  `
}

export function classic(writekey: string) {
  return `
  <html>
  <head>
  </head>
    <script>!(function () {
    var cfevents = (window.cfevents = window.cfevents || [])
    if (!cfevents.initialize)
      if (cfevents.invoked)
        window.console &&
          console.error &&
          console.error('Hightouch snippet included twice.')
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
          t.src =
            'https://cdn.hightouch-events.com/cfevents.js/v1/' +
            key +
            '/cfevents.classic.js'
          var n = document.getElementsByTagName('script')[0]
          n.parentNode.insertBefore(t, n)
          cfevents._loadOptions = e
        }
        cfevents.SNIPPET_VERSION = '4.13.1'
        cfevents.load('${writekey}')
      }
  })()</script>
  <body>
  classic
  <img id="taylor" src="https://i.insider.com/57d1eef909d29325008b6cfa?width=1100&format=jpeg&auto=webp" />
  </body>
  </html>
`
}
