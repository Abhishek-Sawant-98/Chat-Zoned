// /* eslint-disable no-restricted-globals */

// const CACHE_NAME = "pwa-task-manager";
// const urlsToCache = ["/", "/chats"];

// // Install a service worker
// self.addEventListener("install", function (event) {
//   // Perform install steps
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(function (cache) {
//       console.log("Opened cache");
//       return cache.addAll(urlsToCache);
//     })
//   );
//   // To instantly activate a newly installed service worker
//   self.skipWaiting();
// });

// // Cache and return requests
// self.addEventListener("fetch", function (event) {
//   event.respondWith(
//     caches.match(event.request).then(function (response) {
//       return response || fetch(event.request);
//     })
//   );
// });

// // Update a service worker
// self.addEventListener("activate", (event) => {
//   const cacheWhitelist = ["pwa-task-manager"];
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheWhitelist.indexOf(cacheName) === -1) {
//             return caches.delete(cacheName);
//           }
//           return Promise.resolve();
//         })
//       );
//     })
//   );
// });
