 1 | # HTTPOnly Cookies
 2 | 
 3 | ## "Browser Cookies" vs "Server Cookies"
 4 | 
 5 | **Cookies are serialized sets of key-value pairs that the browser can send to the server when making an HTTP request (e.g. on the `Cookie` header)**. Traditionally, the browser does this to identify itself when calling the server. For example, it might receive a cookie when calling a `/login` route, and then continue to send this cookie on subsequent requests, proving that the user is still logged-in. Alternatively, browsers can use cookies just for storing local data, like localStorage.
 6 | 
 7 | Normally, **both** the client and the server can CRUD cookies.
 8 | 
 9 | However, as a security measure, browsers restrict Javascript access to cookies containing the `HTTPOnly` property. These cookies are **only** intended to be created and read by the server.
10 | 
11 | ## "Browser Cookies" for event attribution
12 | 
13 | Certain browsers (e.g. Safari) limit "Browser Cookies" to a 7 day expiry.
14 | 
15 | A user visiting a website on both 01/01/2023 and 01/14/2023 will look like two different users. The browser will delete the user's "anonymousId cookie" before the user begins their second session on 01/14/2023.
16 | 
17 | ## "Server Cookies" for event attribution
18 | 
19 | These expiry limits don't have to apply to "Server Cookies".
20 | 
21 | A user visiting a website on both 01/01/2023 and 01/14/2023 can still look like the same user, provided that there is a way to "regenerate" the user's same "anonymousId cookie" from the earlier session. To do this, the following must happen:
22 | 1. User begins their session on 01/01/2023
23 | 1. Events SDK creates an anonymousId "browser cookie"
24 | 1. Events SDK sends "browser cookie" to `$server` and receives back an HTTPOnly cookie with the same anonymousId
25 | 1. HTTPOnly cookie remains on the user's device
26 | 1. User begins their second session on 01/14/2023
27 | 1. Events SDK sends the HTTPOnly cookie to `$server` and receives back a "browser cookie" with the same anonymousId as the first session
28 | 
29 | **The `$server` must be the same server that serves your website.** Certain browsers (e.g. Safari) will still enforce a 7 day expiry--even for "server cookies"--unless the following criteria are met:
30 | 1. The `$server` providing the HTTPOnly cookie must be on the same domain as the website.
31 | 1. If `$server` is on a subdomain of the website, its IP address must match the IP address that served the main HTML document.
32 | 
3 | Routing a subdomain via DNS will not suffice. You'll need **one of** the following:
34 | - A **webserver** that serves  both your HTML document and an API (e.g. something like Django, Rails, Spring, etc)
35 | - A **reverse proxy** that can forward requests for your HTML document to one place, your API requests to another, and make it look like it's all one server (e.g. NGINX, Caddy, etc)
36 | - A **CDN** that can run programmatic logic when matching certain requests (e.g. Lambda@Edge, Clouflare Workers, etc)
37 | 
38 | ## Client SDK Setup
39 | 
40 | ```javascript
41 | import { CfEventsBrowser } from 'cf-events-sdk-js-browser'
42 | 
43 | const cfevents = CfEventsBrowser.load(
44 |   { writeKey: '<YOUR_WRITE_KEY>'},
45 |   { 
46 |     apiHost: "us-east-1.cloudflare-events.com", // CfEvents API remains the same
47 |     httpCookieServiceOptions: {
48 |       clearUrl: '/ht/clear', // route hosted on *your* domain and infra
49 |       renewUrl: '/ht/renew', // route hosted on *your* domain and infra
50 |     }
51 |   },
52 | )
53 | 
54 | cfevents.identify('hello world')
55 | 
56 | document.body?.addEventListener('click', () => {
57 |   cfevents.track('document body clicked!')
58 | })
59 | ```
60 | 
61 | ## Server Setup
62 | 
63 | The Events SDK expects to interact with a customer's `$server` that implements a specific spec for two routes. You can name the endpoints whatever you want.
64 | 
65 | ### An API for **creating** server and browser cookies
66 | 
67 | This route should look for the following **browser** cookies (from Events SDK):
68 | * `request.headers.get('Cookie')["cfjs_anonymous_id"]`
69 | * `request.headers.get('Cookie')["cfjs_user_id"]`
70 | 
71 | This route should return these values as **server** cookies:
72 | * `response.cookie("cfjs_anonymous_id_srvr", anonVal, {httpOnly:true, ...})`
73 | * `response.cookie("cfjs_user_id_srvr", userIdVal, {httpOnly:true, ...})`
74 | 
75 | If there are no browser cookies found, return any server cookies as browser cookies:
76 | * `response.cookie("cfjs_anonymous_id", anonVal, ...)`
7 | * `response.cookie("cfjs_user_id", userIdVal, ...)`
78 | 
79 | ### An API for **clearing** server cookies
80 | 
81 | This route should look for **server** cookies and clean them:
82 | * `res.cookie("cfjs_anonymous_id_srvr", "", {maxAge: 0, httpOnly:true, ...});`
83 | * `res.cookie("cfjs_user_id_srvr", "", {maxAge: 0, httpOnly:true, ...});`
84 | 
85 | ### API Spec
86 | The spec of the actual `request` and `response` payloads are kept intentionally vague. The spec should fit a variety of server environments.
87 | 
88 | The Events SDK only requires that the server: A) handles cookies and B) returns a `200` status code.
89 | 
90 | ## Server Examples
91 | 
92 | - [Express.js and NGINX](./server-examples/node-express-js.md)
93 | - [Next.js and Vercel](./server-examples/node-next-js.md)
94 | - [AWS Lambda and API Gateway](./server-examples/node-aws-lambda.md)
95 | 
96 | ## More information
97 | - Safari: https://webkit.org/blog/9521/intelligent-tracking-prevention-2-3/