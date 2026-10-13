import {browserVisitChannel} from '/discovery-routes.mjs';
fetch('/api/session').then(r=>r.json()).then(d=>fetch('/api/visit',{method:'POST',headers:{'X-CSRF-Token':d.csrf||'','Content-Type':'application/json'},body:JSON.stringify({channel:browserVisitChannel(),path:location.pathname})})).catch(()=>{});
