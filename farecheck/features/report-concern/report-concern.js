import {store,onTrip} from '../../core/store.js';
import {go} from '../../core/router.js';
import {fareInfo} from '../../core/fare.js';
import {$,esc,peso,rows} from '../../components/ui.js';

// Reports are saved on this device with LocalStorage, offline included — this is
// the one feature that most needs to work without a connection. There is still no
// backend, so "sync" only means a PENDING SYNC report is relabelled SAVED LOCALLY
// once the device is back online; nothing is ever actually sent anywhere.
const KEY='farecheck:reports';
function load(){try{const v=JSON.parse(localStorage.getItem(KEY));return Array.isArray(v)?v:[]}catch{return[]}}
function save(list){try{localStorage.setItem(KEY,JSON.stringify(list));return true}catch{return false}}
let reports=load();

const refNo=()=>`FC-MRK-${new Date().getFullYear()}-${String(Math.floor(100+Math.random()*99900)).padStart(5,'0')}`;

// Used by the Offline Access page to show how many reports are saved / still pending.
export function reportStats(){return {total:reports.length,pending:reports.filter(r=>r.status==='PENDING SYNC').length}}

function markSynced(){
 let changed=false;
 reports.forEach(r=>{if(r.status==='PENDING SYNC'){r.status='SAVED LOCALLY';changed=true}});
 if(changed)save(reports);
 return changed;
}
addEventListener('online',()=>{if(markSynced())render()});

function listHtml(){
 if(!reports.length)return '<p class="mute">No saved reports yet.</p>';
 return reports.slice().reverse().map(r=>`<div class="card"><b>${esc(r.id)}</b> <span class="pill ${r.status==='PENDING SYNC'?'off':'on'}">${esc(r.status)}</span>
  <p class="mute">${esc(r.from)} → ${esc(r.to)} · ${esc(r.type)} · charged ${peso(r.paid)} · ${esc(r.date)} ${esc(r.time)}</p>
  <p>${esc(r.desc)}</p></div>`).join('');
}

function savedReportsBlock(){
 return `<h3 style="margin-top:20px">Your saved reports</h3><p class="mute">Only visible on this device.</p><div id="rlist">${listHtml()}</div>`;
}

function render(){
 const t=store.trip;
 if(!t){
  $('#report').innerHTML=`<h2>Report Fare Concern</h2><div class="card"><p>Run a fare check first so the trip details can be included in your report.</p><button class="go" id="gc" type="button">Check Fare</button></div>${savedReportsBlock()}`;
  $('#gc').onclick=()=>go('check');
  return;
 }
 const d=t.diff;
 $('#report').innerHTML=`<h2>Report Fare Concern</h2><p class="mute">Describe what happened in neutral terms. A report notes a possible fare discrepancy and is not an accusation.</p>
 <div class="grid2"><div class="card"><h3>Trip details</h3>${rows([['Pickup',esc(t.from)],['Destination',esc(t.to)],['Passenger type',t.type],['Amount charged',peso(t.paid)],['Reference fare',peso(t.ref)],['Fare data',esc(fareInfo().data)],['Difference',d?peso(Math.abs(d))+(d>0?' above':' below'):'None']])}</div>
 <form class="card" id="rf" novalidate>
  <label for="rdate">Date</label><input id="rdate" type="date">
  <label for="rtime">Time</label><input id="rtime" type="time">
  <label for="rdesc">Description</label><textarea id="rdesc" placeholder="Example: I was asked for a higher amount than the reference fare."></textarea>
  <label class="chk"><input id="rconf" type="checkbox"><span>I confirm that the information I entered is accurate to the best of my knowledge.</span></label>
  <p id="roff" class="msg" role="status" ${navigator.onLine?'hidden':''}>You are offline. This report will still be saved on this device, marked Pending Sync until you're back online.</p>
  <div id="rerr" class="msg warn" role="alert"></div>
  <button class="go" type="submit">Submit Fare Concern</button></form></div>
 ${savedReportsBlock()}`;
 $('#rf').onsubmit=e=>{e.preventDefault();
  const bad=!$('#rdate').value||!$('#rtime').value||!$('#rdesc').value.trim()?'Add the date, time and a short description.':!$('#rconf').checked?'Tick the confirmation box to continue.':'';
  $('#rerr').textContent=bad;if(bad)return;
  const online=navigator.onLine;
  const rep={id:refNo(),from:t.from,to:t.to,type:t.type,paid:t.paid,ref:t.ref,diff:d,
   date:$('#rdate').value,time:$('#rtime').value,desc:$('#rdesc').value.trim(),
   status:online?'SAVED LOCALLY':'PENDING SYNC',savedAt:new Date().toISOString()};
  reports.push(rep);save(reports);
  const rl=$('#rlist');if(rl)rl.innerHTML=listHtml();
  $('#rf').outerHTML=`<div class="card res ok" role="status"><h3>Report saved.</h3><p><b>Reference Number: ${rep.id}</b></p>
   <p><span class="pill ${online?'on':'off'}">${esc(rep.status)}</span></p>
   <p class="mute">Prototype note: this report is saved locally on this device for demonstration purposes. No submission system is connected yet, so it has not been sent to any agency.</p>
   <button class="ghost" id="again" type="button">Back to Home</button></div>`;
  $('#again').onclick=()=>go('home');
 };
}
// Render right away, then again whenever a new fare check comes in — the
// section is always on the page now, not something you "navigate" to.
export function init(){render();onTrip(render)}
