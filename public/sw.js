const CACHE = 'herdsense-v2'
const STATIC_ASSETS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (!response.ok) return response
          return caches.open(CACHE).then((cache) => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
  }
})
