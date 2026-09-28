// Loads fare, station and route data from /data/*.
// Online: fetch the JSON and save a copy in localStorage.
// Offline (or fetch fails): use the saved copy. The service worker also caches these files.
// Only app data is saved. Fare reports are never stored.
export const FILES={
 fares:'data/fare-matrix/fare-matrix.json',
 stations:'data/stations/stations.json',
 routes:'data/routes/routes.json'};
export const LABELS={fares:'Fare data',stations:'Station data',routes:'Route data'};

const KEY=k=>`farecheck:data:${k}`;
// Basic shape checks so a broken file never replaces good data.
const OK={
 fares:d=>d&&d.meta&&d.rules&&typeof d.rules.base==='number'&&d.passengerTypes,
 stations:d=>d&&Array.isArray(d.stations),
 routes:d=>d&&Array.isArray(d.locations)};

function save(k,data){
 try{localStorage.setItem(KEY(k),JSON.stringify({savedAt:new Date().toISOString(),data}));return true}catch{return false}}
export function readSaved(k){
 try{const s=JSON.parse(localStorage.getItem(KEY(k)));return s&&OK[k](s.data)?s:null}catch{return null}}

async function loadOne(k){
 try{
  const r=await fetch(FILES[k],{cache:'no-cache'});
  if(!r.ok)throw new Error(r.status);
  const data=await r.json();
  if(!OK[k](data))throw new Error('invalid');
  save(k,data);
  return {data,from:'network'};
 }catch{
  const s=readSaved(k);
  if(s)return {data:s.data,from:'saved',savedAt:s.savedAt};
  throw new Error(`No ${LABELS[k].toLowerCase()} available. Connect to the internet once to download it.`);
 }
}

// Returns {fares,stations,routes,from:{fares,stations,routes}}
export async function loadAll(){
 const keys=Object.keys(FILES),res=await Promise.all(keys.map(loadOne)),out={from:{}};
 keys.forEach((k,i)=>{out[k]=res[i].data;out.from[k]=res[i].from});
 return out;
}
