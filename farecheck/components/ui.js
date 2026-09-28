export const $=(s,r=document)=>r.querySelector(s);
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const peso=n=>'₱'+n;
export const rows=list=>list.map(([k,v])=>`<div class="row"><span>${k}</span><b>${v}</b></div>`).join('');
// Simple map-style view. pts: [{lat,lng,label,cls:'u'|'s'}]
export function mapSvg(pts,caption=''){
 const la=pts.map(p=>p.lat),lo=pts.map(p=>p.lng),W=640,H=340,P=80;
 const [a,b,c,d]=[Math.min(...la),Math.max(...la),Math.min(...lo),Math.max(...lo)];
 const s=Math.min((W-2*P)/((d-c)||.002),(H-2*P)/((b-a)||.002));
 const X=p=>W/2+(p.lng-(c+d)/2)*s,Y=p=>H/2-(p.lat-(a+b)/2)*s;
 return `<svg class="map" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map-style view. ${esc(caption)}"><defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#222426"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#g)"/>
 <line x1="${X(pts[0])}" y1="${Y(pts[0])}" x2="${X(pts[1])}" y2="${Y(pts[1])}" stroke="#ffc51a" stroke-width="3" stroke-dasharray="8 7"/>
 ${pts.map(p=>`<circle cx="${X(p)}" cy="${Y(p)}" r="9" class="pt ${p.cls}"/><text x="${X(p)}" y="${Y(p)-16}" text-anchor="middle">${esc(p.label)}</text>`).join('')}
 <text x="14" y="${H-14}" class="cap">${esc(caption)}</text></svg>`;
}
// Dates are usually stored as ISO strings in the data files; null means "not verified".
// Some fields (e.g. an ordinance's effective date, when only a series/year is known and
// not an exact date) hold plain text instead of an ISO date — show that text as-is.
export const fmtDate=d=>{
 if(!d)return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return d;
 return new Date(d+'T00:00:00').toLocaleDateString('en-PH',{year:'numeric',month:'long',day:'numeric'});
};
export const fmtDateTime=d=>d?new Date(d).toLocaleString('en-PH',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'';
