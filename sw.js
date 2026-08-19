// 일신캐스팅 통합안전관리 — 서비스워커
// 앱 셸(HTML 자체)을 캐시해서 오프라인에서도 앱이 열리도록 합니다.
// 실제 데이터(Firebase)는 온라인 상태에서만 갱신됩니다.

const CACHE_NAME = 'ilshin-safety-v1';
const APP_SHELL = [
  './일신캐스팅_통합안전관리시스템.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 (앱 자체 파일에 한해서만 캐시 사용)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isAppShell = APP_SHELL.some((path) => url.pathname.endsWith(path.replace('./', '')));

  if (!isAppShell) return; // Firebase 등 외부 요청은 그대로 통과

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
