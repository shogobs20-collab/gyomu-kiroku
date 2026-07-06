// 圏外でもアプリを起動させるための仕掛け（Service Worker）
// 初回アクセス時にアプリ一式をiPhone内に写し取り、以後はそこから開く

const CACHE = "gyomu-kiroku-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // AI整形のAPI通信はキャッシュ対象外（常にネットへ）
  if (e.request.url.includes("api.anthropic.com")) return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});
