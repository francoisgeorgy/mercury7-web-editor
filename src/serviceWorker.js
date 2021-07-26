const cacheName = "mercury7-editor"
const assets = [
    "./",
    "./index.html",
    "./print.html",
    "./css/midi.css",
    "./app_bundle.js",
    "./print_bundle.js",
    "./favicon-32x32.png",
    "./img/mercury7-editor-v15.jpg",
    "./img/mercury7-editor-v15.png",
    "https://use.fontawesome.com/releases/v5.6.3/css/all.css",
    "https://use.fontawesome.com/releases/v5.6.3/webfonts/fa-solid-900.woff2",
    "https://use.fontawesome.com/releases/v5.6.3/webfonts/fa-regular-400.woff2"
]

// console.log("inside serviceWorker.js");

self.addEventListener("install", installEvent => {
    // console.log("install event");
    installEvent.waitUntil(
        caches.open(cacheName).then(cache => {
            // console.log("cache assets", assets);
            cache.addAll(assets)
        })
    )
})

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
        caches.match(fetchEvent.request).then(res => {
            return res || fetch(fetchEvent.request)
        })
    )
})
