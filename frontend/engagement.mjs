import {browserVisitChannel} from './routes.mjs';
import {canonicalPath} from './locale.mjs';
let settings={api:'',csrf:'',ready:false};
export function configureTracking(next){settings={...settings,...next}}
export function recordAction(action,path=location.pathname){if(!settings.ready)return;fetch(settings.api+'/api/engagement',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':settings.csrf},body:JSON.stringify({action,path:canonicalPath(path),channel:browserVisitChannel()}),keepalive:true}).catch(()=>{})}
