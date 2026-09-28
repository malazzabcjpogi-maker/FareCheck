import {store} from '../../core/store.js';
import {$,esc,rows,fmtDateTime} from '../../components/ui.js';
import {LABELS,readSaved,loadAll} from './data-loader.js';
import {fareInfo} from '../../core/fare.js';
import {reportStats} from '../report-concern/report-concern.js';

// ---------- Service worker ----------
let swReady=false;
export function registerSW(){
 if(!('serviceWorker' in navigator))return;
 navigator.serviceWorker.register('service-worker.js').then(()=>navigator.serviceWorker.ready)
  .then(()=>{swReady=true;refresh()}).catch(()=>{});
}

// ---------- Online / offline status ----------
let toastTimer;
function banner(){
 const el=$('#net'),off=!navigator.onLine;
 el.classList.toggle('off',off);
 if(off){el.hidden=false;el.textContent='You are offline. Using saved fare and station data.'}
 else if(el.dataset.wasOff){el.hidden=false;el.textContent='Back online.';clearTimeout(toastTimer);toastTimer=setTimeout(()=>{el.hidden=true},3000)}
 else el.hidden=true;
 el.dataset.wasOff=off?'1':'';
}
export function initStatus(){
 banner();
 addEventListener('online',()=>{banner();refresh()});
 addEventListener('offline',()=>{banner();refresh()});
}

// ---------- Offline page ----------
// The section is always on the page now, so just re-render on any status change.
function refresh(){render()}

function render(){
 if(!store.data)return; // app data hasn't finished loading yet (e.g. SW became ready first)
 const online=navigator.onLine,fi=fareInfo();
 const items=Object.keys(LABELS).map(k=>{
  const s=readSaved(k);
  return [LABELS[k],s?`Saved · ${esc(fmtDateTime(s.savedAt))}`:'Not saved yet'];
 });
 const rs=reportStats();
 items.push(['Fare concern reports',rs.total?`${rs.total} saved${rs.pending?` (${rs.pending} pending sync)`:''}`:'None saved yet']);
 $('#offline').innerHTML=`<h2>Offline Access</h2>
 <div class="grid2"><div>
  <div class="card"><h3>Connection</h3>
   <p><span class="pill ${online?'on':'off'}" role="status">${online?'Online':'Offline'}</span></p>
   <p class="mute">${online?'Fare and station data are refreshed each time the app loads.':'Check Fare and Find Stations keep working from the data saved on this device.'}</p></div>
  <div class="card"><h3>Saved on this device</h3>${rows(items)}
   ${rows([['App files',swReady?'Ready for offline use':'Not cached yet']])}
   <button class="ghost" id="refreshData" type="button" ${online?'':'disabled'}>Refresh saved data</button>
   <p id="refMsg" class="msg" role="status"></p></div></div>
  <div><div class="card"><h3>Fare data in use</h3>${rows([
    ['Data',esc(fi.data)],['Status',esc(fi.status)],
    ['Source',esc(fi.source)]])}</div>
  <div class="card"><h3>What works offline</h3>
   <p>Check Fare and Find Stations use the saved data. Report Fare Concern also works offline — reports are saved on this device and marked Pending Sync until you're back online.</p></div></div></div>`;
 $('#refreshData').onclick=async()=>{
  const m=$('#refMsg');m.textContent='Refreshing…';
  try{const n=await loadAll();store.data=n;m.textContent='Saved data is up to date.';m.className='msg';render()}
  catch(e){m.textContent='Could not refresh. Saved data is still available.';m.className='msg warn'}};
}
export function init(){render()}
