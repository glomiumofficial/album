// glomium crew — keeps the app shell available offline. Task data always comes
// live from Supabase; nothing private is cached here.
const V = 'crew-shell-v2';
const SHELL = ['/crew.html', '/support.js', '/crew-offline.html', '/assets/wordmark-green.png', '/assets/infinity.svg', '/assets/crew-icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('crew-shell-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate' && /^\/crew(\.html)?$/.test(u.pathname)) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put('/crew.html', cp)); } return res; })
      .catch(() => caches.match('/crew.html').then(m => m || caches.match('/crew-offline.html'))));
    return;
  }
  if (SHELL.includes(u.pathname)) e.respondWith(fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(u.pathname, cp)); } return res; }).catch(() => caches.match(u.pathname)));
});

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'glomium crew', {
    body: d.body || '', tag: d.tag || undefined, renotify: !!d.tag,
    icon: '/assets/crew-icon-192.png', data: { url: d.url || '/crew.html' },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/crew.html', self.location.origin).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(w => new URL(w.url).pathname.startsWith('/crew'));
    if (c) return c.focus().then(w => (w || c).navigate(url)).catch(() => self.clients.openWindow(url));
    return self.clients.openWindow(url);
  }));
});
