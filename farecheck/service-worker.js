// FareCheck service worker.
// - Precaches the app files and the fare, station and route data on install.
// - Same-origin files: network first (fresh when online), cache fallback (works offline).
// - Google Fonts: cached after first use; the app falls back to system fonts if unavailable.
// Fare reports are never cached (there is no report request to cache).
const VERSION='farecheck-v3';
const CORE=[
 './','index.html','manifest.json','service-worker.js',
 'styles/main.css',
 'core/app.js','core/router.js','core/store.js','core/fare.js','core/geo.js',
 'components/ui.js','components/footer.js',
 'features/home.js',
 'features/check-fare/check-fare.js',
 'features/find-stations/find-stations.js',
 'features/report-concern/report-concern.js',
 'features/offline/offline.js','features/offline/data-loader.js',
 'data/fare-matrix/fare-matrix.json','data/stations/stations.json','data/routes/routes.json',
 'icons/icon.svg','icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png'];

self.addEventListener('install',e=>{
 e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
 e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

const FONT_HOSTS=['fonts.googleapis.com','fonts.gstatic.com'];
self.addEventListener('fetch',e=>{
 const req=e.request,url=new URL(req.url);
 if(req.method!=='GET')return;
 if(url.origin===location.origin){
  e.respondWith(fetch(req).then(res=>{
   if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy))}
   return res;
  }).catch(()=>caches.match(req).then(r=>r||(req.mode==='navigate'?caches.match('index.html'):Response.error()))));
 }else if(FONT_HOSTS.includes(url.hostname)){
  e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{
   const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));return res;
  }).catch(()=>Response.error())));
 }
});
