self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/index.html',
        '/views/search.html',
        '/views/add.html',
        '/views/details.html',
        '/movie-service.js',
        '/router.js',
        '/manifest.json',
        'https://unpkg.com/onsenui/css/onsenui.min.css',
        'https://unpkg.com/onsenui/css/onsen-css-components.min.css',
        'https://unpkg.com/onsenui/js/onsenui.min.js',
        'manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
