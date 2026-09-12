/* Ziachstund – Offlinebetrieb
   Bei jeder Veröffentlichung STAND hochzählen, dann holt sich jedes Gerät
   die neue Fassung beim nächsten Start. */
const STAND = 'ziachstund-1';
const DATEIEN = [
  './', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(STAND).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(namen => Promise.all(namen.filter(n => n !== STAND).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev => {
  if (ev.request.method !== 'GET') return;
  ev.respondWith(
    caches.match(ev.request).then(treffer => {
      if (treffer){
        /* Im Hintergrund nach einer neueren Fassung sehen */
        fetch(ev.request).then(antwort => {
          if (antwort && antwort.ok) caches.open(STAND).then(c => c.put(ev.request, antwort));
        }).catch(() => {});
        return treffer;
      }
      return fetch(ev.request).catch(() => caches.match('./index.html'));
    })
  );
});
