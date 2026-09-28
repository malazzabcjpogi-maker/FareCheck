const rad=d=>d*Math.PI/180;
export function km(a,b){const x=Math.sin(rad(b.lat-a.lat)/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(rad(b.lng-a.lng)/2)**2;return 12742*Math.asin(Math.sqrt(x))}
export const walkMin=k=>Math.max(1,Math.round(k/0.08)); // ~4.8 km/h
// "350 m" under 1 km, "1.1 km" from 1 km up.
export const fmtDist=k=>k<1?`${Math.max(10,Math.round(k*1000/10)*10)} m`:`${k.toFixed(1)} km`;

// Wraps the browser Geolocation API in a promise with the three error cases the
// feature needs to tell apart. Nothing here is stored — the caller decides what,
// if anything, to keep in memory for the current page view.
export function locate(){
 return new Promise((resolve,reject)=>{
  if(!('geolocation' in navigator)){reject({code:'unsupported',message:'This browser does not support location. You can still search for stations manually.'});return}
  navigator.geolocation.getCurrentPosition(
   pos=>resolve({lat:pos.coords.latitude,lng:pos.coords.longitude}),
   err=>{
    const messages={
     1:'Location access was denied. You can still search for stations manually.', // PERMISSION_DENIED
     2:'Your location could not be determined right now. You can still search for stations manually.', // POSITION_UNAVAILABLE
     3:'Finding your location took too long. You can still search for stations manually.' // TIMEOUT
    };
    reject({code:err.code,message:messages[err.code]||'Location is unavailable. You can still search for stations manually.'});
   },
   {enableHighAccuracy:true,timeout:10000,maximumAge:60000}
  );
 });
}
