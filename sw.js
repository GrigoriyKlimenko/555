const staticCacheName = 's-app-v3'
const dynamicCacheName = 'd-app-v3'

const assetUrls = [
  'index.html',
  '/js/app.js',
  '/css/styles.css',
  'offline.html'
]
const cach = async () => {
  const cache = await caches.open(staticCacheName)
  await cache.addAll(assetUrls)
  console.log('123')
}
self.addEventListener('install', async event => {
  // self.skipWaiting();
  // event.waitUntil(
  //     caches
  //         .open(staticCacheName)
  //         .then((cache) => cache.addAll(assetUrls))
  // );
  event.waitUntil(cach());

  // self.skipWaiting();

})

self.addEventListener('activate', async event => {
  //preload
  // if (self.registration.navigationPreload) {
  //   self.registration.navigationPreload.enable();
  // }
  //в fetch событии
  // const response = await event.preloadResponse;
  // if (response) return response


  //
  // event.waitUntil(clients.claim());

  //clear cache
  const cacheNames = await caches.keys()
  await Promise.all(
    cacheNames
      .filter(name => name !== staticCacheName)
      .filter(name => name !== dynamicCacheName)
      .map(name => caches.delete(name))
  )

});

self.addEventListener('fetch', async event => {
  const {request} = event;
  const url = new URL(request.url)
  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request))
  } else {
    event.respondWith(networkFirst(request))
  }

});


async function cacheFirst(request) {
  const cached = await caches.match(request)
  return cached ?? await fetch(request)
}


async function networkFirst(request) {
  const cache = await caches.open(dynamicCacheName)
  try {
    const response = await fetch(request)
    await cache.put(request, response.clone())
    return response
  } catch (e) {
    const cached = await cache.match(request)
    return cached ?? await caches.match('/offline.html')
  }
}

self.addEventListener('push', function(event) {
  event.waitUntil(self.registration.showNotification('New message', {
    body: event.data.text()
  }));
});

self.addEventListener('notificationclick', (event) => {
  console.log(`On notification click: ${event.notification}`);
  // event.notification.close();
  console.log(clientList)
  // This looks to see if the current is already open and
  // focuses if it is
  // event.waitUntil(clients.matchAll({
  //   type: "window"
  // }).then((clientList) => {
  //
  //   for (const client of clientList) {
  //     if (client.url === '/' && 'focus' in client)
  //       return client.focus();
  //   }
  //   if (clients.openWindow)
  //     return clients.openWindow('/');
  // }));
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//periodicSync

async function doSync() {
  console.log('do someth sync');
}

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'content-sync') {
    event.waitUntil(doSync());
  }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const CACHE = 'network-or-cache-v1';
const timeout = 400;
// При установке воркера мы должны закешировать часть данных (статику).
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//       caches.open(CACHE).then((cache) => cache.addAll([
//             '/img/background'
//           ])
//       ));
// });

// при событии fetch, мы и делаем запрос, но используем кэш, только после истечения timeout.
// self.addEventListener('fetch', (event) => {
//   event.respondWith(fromNetwork(event.request, timeout)
//       .catch((err) => {
//         console.log(`Error: ${err.message()}`);
//         return fromCache(event.request);
//       }));
// });

// Временно-ограниченный запрос.
function fromNetwork(request, timeout) {
  return new Promise((fulfill, reject) => {
    var timeoutId = setTimeout(reject, timeout);
    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      fulfill(response);
    }, reject);
  });
}

function fromCache(request) {
// Открываем наше хранилище кэша (CacheStorage API), выполняем поиск запрошенного ресурса.
// Обратите внимание, что в случае отсутствия соответствия значения Promise выполнится успешно, но со значением `undefined`
  return caches.open(CACHE).then((cache) =>
      cache.match(request).then((matching) =>
          matching || Promise.reject('no-match')
      ));
}
