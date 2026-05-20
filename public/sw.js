const CACHE_NAME = 'cok-static-v3'
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
  const cached = await caches.match(request)
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

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  event.respondWith(isHtmlRequest(request) ? networkFirst(request) : staleWhileRevalidate(request))
})
