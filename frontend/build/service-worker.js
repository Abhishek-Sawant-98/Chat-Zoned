/* eslint-disable no-restricted-globals */

// self : ServiceWorkerGlobalScope

// Install a service worker
self.addEventListener("install", (e) => {
  // To instantly activate a newly installed service worker
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener("fetch", (e) => {});

// Update a service worker
self.addEventListener("activate", async (e) => {
  // Refresh all tabs
  const tabs = await self.clients.matchAll({ type: "window" });
  tabs.forEach((tab) => {
    try {
      tab.navigate(tab.url);
    } catch (error) {
      console.log("Error occurred while refreshing tab : ", tab.url);
    }
  });
});
