import {start,go} from './router.js';
import {store} from './store.js';
import {loadAll} from '../features/offline/data-loader.js';
import {init as offline,initStatus,registerSW} from '../features/offline/offline.js';
import {init as footer} from '../components/footer.js';
import {init as home} from '../features/home.js';
import {init as check} from '../features/check-fare/check-fare.js';
import {init as stations} from '../features/find-stations/find-stations.js';
import {init as report} from '../features/report-concern/report-concern.js';

initStatus();
registerSW();
try{
 store.data=await loadAll();          // network first, saved copy when offline
}catch(e){
 document.querySelector('main').innerHTML=`<section class="page"><h2>FareCheck</h2><div class="card"><p class="msg warn" role="alert">${e.message}</p><button class="go" onclick="location.reload()" type="button">Try again</button></div></section>`;
 throw e;
}
[home,check,stations,report,offline,footer].forEach(f=>f());
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));
start();
