/* eslint-disable no-restricted-globals */

// self : ServiceWorkerGlobalScope

// Install a service worker
self.addEventListener("install", (e) => {
  // To instantly activate a newly installed service worker
  self.skipWaiting();
});
