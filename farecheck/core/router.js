// FareCheck is one continuous scrollable page. Nav buttons smooth-scroll to a
// section; scrolling manually moves through the same sections in order.
export const VIEWS=['home','check','stations','report','offline'];

function setCurrent(v){
 document.querySelectorAll('nav [data-go]').forEach(b=>b.setAttribute('aria-current',String(b.dataset.go===v)));
}

// Used by nav buttons, the home tiles, and "Report Fare Concern" / "Check Fare" links.
export function go(v){
 const el=document.getElementById(v);
 if(!el)return;
 setCurrent(v);
 el.scrollIntoView({behavior:'smooth',block:'start'});
}

// Keeps the nav's current indicator in sync as the person scrolls past each section.
// Sections vary a lot in height (the home hero is short; Find Stations can be long),
// so "whichever section's top the person has scrolled past" is more reliable here
// than comparing how much of each section is on screen.
export function start(){
 const sections=VIEWS.map(v=>document.getElementById(v)).filter(Boolean);
 let ticking=false;
 function update(){
  const line=scrollY+120;
  let cur=sections[0]?.id||'home';
  for(const s of sections)if(s.offsetTop<=line)cur=s.id;
  setCurrent(cur);
  ticking=false;
 }
 addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
 update();
}
