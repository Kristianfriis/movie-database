const CACHE_NAME = 'movie-library-v1'
const APP_SHELL = [
  // Local app files
  './index.html',
  './manifest.json',
  './icons/favicon.ico',
  './icons/apple-touch-icon.png',
  './components/Search.js',
  './components/Add.js',
  './components/Details.js',
  './services/state.js',

  // Ionic & Vue CDN assets
  'https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css',
  'https://cdn.jsdelivr.net/npm/@ionic/core/css/palettes/dark.class.css',
  'https://cdn.jsdelivr.net/npm/@ionic/vue@8.7.5/css/core.min.css',
  'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js',
  'https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/index.esm.js',
  'https://cdn.jsdelivr.net/npm/@ionic/vue@8.7.5/+esm',
  'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.41/vue.esm-browser.prod.js',
  'https://cdnjs.cloudflare.com/ajax/libs/vue-router/4.1.5/vue-router.esm-browser.min.js'
]

// Install: cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key)
      }))
    )
  )
  self.clients.claim()
})

// Fetch: serve cached or fallback to network
self.addEventListener('fetch', event => {
  const { request } = event

  event.respondWith(
    caches.match(request).then(cached => {
      return cached || fetch(request).catch(() => {
        // SPA fallback for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('./index.html')
        }
      })
    })
  )
})
