const CACHE_NAME = 'cok-static-v7'
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './apple-touch-icon.png',
]

function isHtmlRequest(request) {
  const accept = request.headers.get('accept') || ''
  return request.mode === 'navigate' || request.destination === 'document' || accept.includes('text/html')
}

async function cacheResponse(request, response) {
  if (!response || response.status !== 200 || response.type !== 'basic') return
  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    await cacheResponse(request, response)
    return response
  } catch {
    return (await caches.match(request)) || (await caches.match('./index.html')) || Response.error()
  }
}

async function staleWhileRevalidate(request) {
  /* Module scripts are CORS requests carrying Origin; hosts that answer with
     "Vary: Origin" would never match entries cached without it. Hashed assets
     are immutable, so ignore Vary. */
  const cached = await caches.match(request, { ignoreVary: true })
  const network = fetch(request).then(async (response) => {
    await cacheResponse(request, response)
    return response
  })
  if (cached) {
    network.catch(() => {})
    return cached
  }
  try {
    return await network
  } catch {
    return Response.error()
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  )
})

/* First visit: the page's scripts, styles, and fonts load before this worker
   controls it, so they never pass through the fetch handler. Once in control,
   the page posts the URLs it already loaded; cache any that are missing so the
   installed app can start offline after a single visit. */
self.addEventListener('message', (event) => {
  const urls = event.data && event.data.type === 'cache-urls' ? event.data.urls : null
  if (!Array.isArray(urls)) return
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        urls
          .filter((url) => typeof url === 'string' && new URL(url, self.location.href).origin === self.location.origin)
          .map((url) => cache.match(url).then((hit) => hit || cache.add(url).catch(() => {}))),
      ),
    ),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  event.respondWith(isHtmlRequest(request) ? networkFirst(request) : staleWhileRevalidate(request))
})
