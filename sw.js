// Service Worker - minimalny, NIE cache'uje strony (zawsze swieza wersja)
const CACHE_NAME = 'dziennik-v3';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Google Sheets - zawsze siec
  if (e.request.url.includes('script.google.com')) {
    e.respondWith(fetch(e.request).catch(() => new Response('{}', {status: 200})));
    return;
  }
  // Strona i pliki - ZAWSZE swieza wersja z sieci, cache tylko gdy brak internetu
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        // Zapisz kopie do cache (na wypadek offline)
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone)).catch(()=>{});
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});
