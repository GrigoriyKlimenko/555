window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      console.log('Service worker register success', reg)
      await reg.periodicSync.register('content-sync', {
        // An interval of one day.
        minInterval: 15 * 1000,
      });
    } catch (e) {
      console.log('Service worker register fail')
    }
  }

  await loadPosts()
  notifyMe();
})

// async function registerPeriodicNewsCheck() {
//   const registration = await navigator.serviceWorker.ready;
//   try {
//     await registration.periodicSync.register('get-latest-news', {
//       minInterval: 24 * 60 * 60 * 1000,
//     });
//   } catch {
//     console.log('Periodic Sync could not be registered!');
//   }
// }

// registration.unregister().then((boolean) => {
//   // if boolean = true, unregister is successful
// });
function notifyMe() {
  if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    // const notification = new Notification("Hi there!");
    // …
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        // const notification = new Notification("Hi there!");
        // …
      }
    });
  }
}

async function loadPosts() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=11')
  const data = await res.json()

  const container = document.querySelector('#posts')
  container.innerHTML = data.map(toCard).join('\n')
}

function toCard(post) {
  return `
    <div class="card">
      <div class="card-title">
        ${post.title}
      </div>
      <div class="card-body">
        ${post.body}
      </div>
    </div>
  `
}
