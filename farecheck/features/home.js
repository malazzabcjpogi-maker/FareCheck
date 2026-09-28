import {$} from '../components/ui.js';
import {go} from '../core/router.js';
const CARDS=[
 {t:'Check Fare',d:'Compare a fare with the reference',to:'check'},
 {t:'Find Stations',d:'Stations and the areas they serve',to:'stations'},
 {t:'Report Fare Concern',d:'Raise a possible discrepancy',to:'report'},
 {t:'Offline Access',d:'Use saved fare and station data',to:'offline'}];
const G=['<rect x="62" y="92" width="96" height="52" rx="10" style="fill:#ffc51a"/><rect class="w" x="160" y="112" width="62" height="30" rx="10"/><path class="sw" d="M214 112l14-22h14" stroke-width="6"/><g class="d"><circle cx="92" cy="150" r="17"/><circle cx="172" cy="150" r="17"/><circle cx="232" cy="150" r="17"/></g>',
 '<path style="fill:#ffc51a" d="M160 44c-32 0-50 24-50 48 0 34 50 76 50 76s50-42 50-76c0-24-18-48-50-48z"/><circle class="d" cx="160" cy="92" r="18"/>',
 '<rect class="w" x="102" y="34" width="116" height="130" rx="14"/><circle style="fill:#ffc51a" cx="160" cy="110" r="26"/><path class="sw" d="M148 110l9 9 16-18" stroke="#2a2000" stroke-width="6"/>',
 '<path class="sw" d="M90 96a100 100 0 0 1 140 0M112 118a68 68 0 0 1 96 0M134 140a34 34 0 0 1 52 0" stroke-width="10"/><circle style="fill:#ffc51a" cx="160" cy="156" r="8"/>'];
const art=k=>`<svg class="art" viewBox="0 0 320 200" aria-hidden="true"><rect class="bg" width="320" height="200"/><circle class="sun" cx="256" cy="52" r="30"/><rect class="gr" y="164" width="320" height="36"/>${G[k]}</svg>`;
let cur=0;
function show(i){cur=i;$('#hA').innerHTML=art(i);
 document.querySelectorAll('.tab').forEach((t,k)=>t.setAttribute('aria-selected',k===i))}
export function init(){
 $('#home').innerHTML=`<div class="hero"><div class="hart" id="hA"></div><div class="hcopy">
  <span class="badge">Marikina City • Prototype</span>
  <h1>Know your fare before you ride.</h1>
  <p>Check the available Marikina City tricycle fare for your trip.</p>
  <button class="cta" data-go="check" type="button">Check Fare</button></div></div>
  <div class="tabs">${CARDS.map((c,k)=>`<button class="tab" ${c.to?'':'disabled'} data-k="${k}" aria-selected="false">${art(k)}<span><b>${c.t}</b><small>${c.d}</small></span><i class="bar"></i></button>`).join('')}</div>
  <p class="mute foot">Fares shown are reference values for a school project. The latest official Marikina matrix has not been verified.</p>`;
 document.querySelectorAll('.tab').forEach(t=>{const c=CARDS[t.dataset.k];t.onclick=()=>c.to&&go(c.to);t.onmouseenter=()=>show(+t.dataset.k)});
 show(0);
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>show((cur+1)%4),6000);
}
