import {store} from './store.js';
import {km} from './geo.js';
import {fmtDate} from '../components/ui.js';

// Describes the fare data in use. Data is only called "official" when the file says it is
// verified AND has an effective date, a verified date and a source. Otherwise it is
// always shown as Reference Fare Data.
export function fareInfo(){
 const m=store.data.fares.meta;
 const official=!!(m.verified&&m.effectiveDate&&m.lastVerified&&m.source);
 return {official,
  data:official?'Official Fare Matrix':'Reference Fare Data',
  status:official?'Official matrix verified':'Latest Official Matrix Not Verified',
  source:m.source,
  effective:fmtDate(m.effectiveDate)||'Not verified',
  verified:fmtDate(m.lastVerified)||'Not verified',
  checked:fmtDate(m.lastSourceCheck)};
}

export function calcFare(a,b,type){
 const {rules:R,passengerTypes:T}=store.data.fares,t=T[type],d=Math.round(km(a,b)*R.roadFactor*10)/10;
 const reg=R.base+Math.ceil(Math.max(0,d-R.baseKm))*R.perKm;
 // Passenger types either have a flat fare (e.g. young children) or a flat peso
 // discount off the regular fare, matching how the posted matrix states them.
 let fare,rule;
 if(t.flatFare!=null){
  fare=t.flatFare;
  rule=`Flat fare of ₱${t.flatFare} for ${t.label.toLowerCase()}, regardless of distance`;
 }else{
  const disc=t.discount||0;
  fare=Math.max(0,Math.round(reg-disc));
  rule=`₱${R.base} for the first ${R.baseKm} km + ₱${R.perKm} per additional km`+(disc?`, less ₱${disc} ${t.label} discount`:'');
 }
 return {d,fare,type:t.label,rule,distanceRule:R.distanceRule,...fareInfo()};
}
