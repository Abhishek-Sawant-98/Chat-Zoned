/* eslint-disable no-restricted-globals */
const CACHE_NAME = "pwa-task-manager";
const assetsToCache = ["/", "/chats"];

// self : ServiceWorkerGlobalScope

// Install a service worker
self.addEventListener("install", (e) => {
  // Perform install steps
//   e.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       cache.addAll(assetsToCache);
//     })
//   );
  // To instantly activate a newly installed service worker
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener("fetch", (e) => {
//   e.respondWith(
//     caches.match(e.request).then((res) => {
//       return (
//         res ||
//         fetch(e.request).catch((err) => {
//           console.log("Error occured white fetching : ", err);
//         })
//       );
//     })
//   );
});

// Update a service worker
self.addEventListener("activate", async (e) => {
//   await self.registration.unregister();
//   // Refresh all tabs
//   const tabs = await self.clients.matchAll({ type: "window" });
//   tabs.forEach((tab) => {
//     try {
//       tab.navigate(tab.url);
//     } catch (error) {
//       console.log("Error occurred while refreshing tab : ", tab.url);
//     }
//   });
});
