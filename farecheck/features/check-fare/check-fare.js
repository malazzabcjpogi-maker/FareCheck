import {calcFare} from '../../core/fare.js';
import {store,setTrip} from '../../core/store.js';
import {go} from '../../core/router.js';
import {$,esc,peso,rows,mapSvg} from '../../components/ui.js';

const places=()=>store.data.routes.locations;
const find=n=>places().find(p=>p.name.toLowerCase()===String(n).trim().toLowerCase());

export function init(){
 const TYPES=store.data.fares.passengerTypes;
 $('#check').innerHTML=`<h2>Check Fare</h2><div class="grid2"><div class="card">
  <label for="from">From</label><input id="from" list="pl" placeholder="Search a Marikina location" autocomplete="off">
  <label for="to">To</label><input id="to" list="pl" placeholder="Search a Marikina location" autocomplete="off">
  <datalist id="pl">${places().map(p=>`<option value="${esc(p.name)}">`).join('')}</datalist>
  <label for="type">Passenger Type</label><select id="type">${Object.entries(TYPES).map(([k,t])=>`<option value="${k}">${t.label}</option>`).join('')}</select>
  <label for="paid">Amount Charged (₱)</label><input id="paid" type="number" min="0" inputmode="decimal" placeholder="e.g. 40">
  <div id="err" class="msg warn" role="alert"></div>
  <button class="go" id="calc" type="button">Check Fare</button></div><div id="out"></div></div>`;
 $('#calc').onclick=calc;
}

function calc(){
 const a=find($('#from').value),b=find($('#to').value),paid=parseFloat($('#paid').value),err=$('#err');
 err.textContent=!a||!b?'Choose a pickup and destination from the suggested Marikina locations.':a===b?'Pickup and destination are the same place.':isNaN(paid)||paid<0?'Enter the amount charged.':'';
 if(err.textContent)return;
 const type=$('#type').value,r=calcFare(a,b,type),diff=paid-r.fare;
 setTrip({from:a.name,to:b.name,type:r.type,paid,ref:r.fare,diff,km:r.d});
 const rf=r.official?'official fare':'reference fare',msg=diff>0?`Your entered fare is ${peso(diff)} above the ${rf}.`:diff<0?`Your entered fare is ${peso(-diff)} below the ${rf}.`:`Your entered fare matches the ${rf}.`;
 $('#out').innerHTML=`<div class="card res ${diff?'diff':'ok'}"><h3>FARE CHECK RESULT</h3>
  ${mapSvg([{...a,label:a.name,cls:'u'},{...b,label:b.name,cls:'s'}],`${r.d.toFixed(1)} km route (estimate)`)}
  ${rows([['From',esc(a.name)],['To',esc(b.name)],['Route Distance',r.d.toFixed(1)+' km'],[r.official?'Fare':'Reference Fare',peso(r.fare)],['Amount Charged',peso(paid)],['Difference',diff?peso(Math.abs(diff))+(diff>0?' above':' below')+(r.official?' fare':' reference'):'None']])}
  <p class="msg">${msg}</p>
  <div class="src"><span class="badge ${r.official?'':'ref'}">${r.data}</span> <span class="badge ${r.official?'ok':'unv'}">${r.status}</span>
   ${rows([['Source',esc(r.source)],['Effective Date',esc(r.effective)],['Last Verified',esc(r.verified)]])}</div>
  <details><summary>How we calculated this</summary>${rows([['Route',esc(a.name)+' → '+esc(b.name)],['Distance',r.d.toFixed(1)+' km (estimate)'],['Distance rule',esc(r.distanceRule)],['Passenger type',r.type],['Fare rule',r.rule],[r.official?'Fare':'Reference fare',peso(r.fare)],['Source',esc(r.source)]])}</details>
  <button class="ghost" id="tor" type="button">Report Fare Concern</button></div>`;
 $('#tor').onclick=()=>go('report');
}
