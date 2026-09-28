import {km,walkMin,fmtDist,locate} from '../../core/geo.js';
import {store} from '../../core/store.js';
import {$,esc,rows,mapSvg} from '../../components/ui.js';

let sel=null,usingLocation=false;
const list=()=>store.data.stations.stations.map(s=>({...s,d:km(store.user,s)})).sort((a,b)=>a.d-b.d);

function draw(){
 const q=$('#q').value.toLowerCase(),all=list();
 const l=all.filter(s=>(s.name+s.place+s.area+s.routes.join()).toLowerCase().includes(q));
 const heading=`<p class="mute" style="margin:12px 0 -2px">${usingLocation?'Nearest Tricycle Stations':'Tricycle stations, nearest first from '+esc(store.user.label)}</p>`;
 $('#slist').innerHTML=heading+(l.length?l.map(s=>`<button class="card st" data-id="${s.id}" aria-pressed="${s.id===sel}"><b>${esc(s.name)}</b><span class="mute">${esc(s.place)}</span><span>${fmtDist(s.d)} away · ~${walkMin(s.d)} min walk</span></button>`).join(''):'<p class="mute">No station matches. Try a barangay or landmark.</p>');
 document.querySelectorAll('.st').forEach(b=>b.onclick=()=>{sel=+b.dataset.id;draw()});
 const s=all.find(x=>x.id===sel);
 $('#sdet').innerHTML=s?`<div class="card"><h3>${esc(s.name)}</h3><span class="badge">${esc(store.data.stations.meta.label)}</span>
  ${mapSvg([{...store.user,label:usingLocation?'You':'You (default)',cls:'u'},{...s,label:s.name,cls:'s'}],`${fmtDist(s.d)} away · ~${walkMin(s.d)} min walk`)}
  ${rows([['Location',esc(s.place)],['Distance',fmtDist(s.d)+' away'],['Estimated walking time','~'+walkMin(s.d)+' min'],['Service area',esc(s.area)],['Routes / destinations',s.routes.map(esc).join(', ')]])}
  <p class="mute">Measuring from: ${esc(store.user.label)}</p></div>`:'<div class="card"><p class="mute">Select a station to view its details and map.</p></div>';
}

function setLocBtn(state){
 const b=$('#loc');
 if(state==='loading'){b.disabled=true;b.textContent='Finding your location…'}
 else if(state==='on'){b.disabled=false;b.textContent='Update my location'}
 else{b.disabled=false;b.textContent='Use My Location'}
}

export function init(){
 $('#stations').innerHTML=`<h2>Find Tricycle Stations</h2><div class="grid2"><div>
  <input id="q" type="search" placeholder="Search stations, areas or destinations" aria-label="Search stations">
  <button class="ghost" id="loc" type="button">Use My Location</button>
  <p id="locmsg" class="msg warn" role="alert" hidden></p>
  <div id="slist" class="slist"></div></div><div id="sdet"></div></div>`;
 $('#q').oninput=draw;
 $('#loc').onclick=()=>{
  setLocBtn('loading');
  const m=$('#locmsg');m.hidden=true;
  locate().then(pos=>{
   // Kept only in memory for this page view (core/store.js) — never saved to
   // localStorage, never sent anywhere, and cleared on reload.
   store.user={...pos,label:'Your current location'};
   usingLocation=true;
   setLocBtn('on');
   draw();
  }).catch(err=>{
   setLocBtn('idle');
   m.hidden=false;
   m.textContent=err.message;
  });
 };
 draw();
}
