import {$} from './ui.js';
import {fareInfo} from '../core/fare.js';

export function init(){
 const f=fareInfo();
 const last=f.verified!=='Not verified'?f.verified:`Not yet verified (last source check: ${f.checked})`;
 $('#footer').innerHTML=`<b class="fbrand">FareCheck</b>
  <p>Marikina City • Prototype</p>
  <p>Fare sources are shown with each fare result.</p>
  <p>Reference information only. Actual fares may vary depending on applicable fare rules.</p>
  <p>Last verified: ${last}</p>
  <p class="mute">© 2026 FareCheck</p>`;
}
