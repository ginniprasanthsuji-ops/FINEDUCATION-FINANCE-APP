
const CACHE_NAME = "fineducation-v1";

const OFFLINE_URL = "./offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(["./", OFFLINE_URL]);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === "navigate") {
        return (
          (await caches.match(OFFLINE_URL)) ||
          new Response("You are offline. Please reconnect to the internet.", {
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          })
        );
      }

      return Response.error();
    })
  );
});
