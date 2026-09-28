// `trip` (the last fare check) lives only in memory, for handing details to Report
// Fare Concern in the same session. Submitted reports themselves are saved to the
// device by features/report-concern/report-concern.js (LocalStorage), including offline.
// `data` holds the fare, station and route data loaded by features/offline/data-loader.js.
export const store={data:null,trip:null,user:{lat:14.6507,lng:121.1029,label:'Marikina City Hall (default)'}};

// All sections are mounted at once now, so Report Fare Concern needs to know
// the moment a new fare check runs, instead of re-rendering only when "visited".
const tripSubs=[];
export function setTrip(t){store.trip=t;tripSubs.slice().forEach(fn=>fn(t))}
export function onTrip(fn){tripSubs.push(fn)}
