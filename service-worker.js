self.addEventListener('install', () => {
    console.log("Service Worker installé");
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
