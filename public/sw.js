const CACHE = 'herdsense-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(['/', '/index.html'])
    })
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          return caches.open(CACHE).then((cache) => {
            cache.put(event.request, response.clone())
            return response
          })
        })
      })
    )
  }
})
