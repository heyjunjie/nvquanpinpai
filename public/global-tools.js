import {browserVisitChannel} from '/discovery-routes.mjs';

const english = document.documentElement.lang === 'en';
const text = (zh,en) => english ? en : zh;
function errorText(message) {
 if (!english || !message) return message;
 const translations = {
  '用户名或密码不正确':'The username or password is incorrect.',
  '用户名已被使用':'That username is already in use. Choose another name.',
  '该名字已有未注册署名记录，请选择其他用户名':'That name is already used by guest contributions. Choose another username.',
  '用户名需2—24个中英文、数字或下划线；密码需10—128位':'Use a username with 2–24 letters, numbers, underscores or hyphens and a password with 10–128 characters.',
  '登录状态已变化，请刷新页面重试':'Your session has changed. Refresh this page and try again.',
  '操作过于频繁，请稍后再试':'Too many attempts. Wait a minute and try again.',
  '注册过于频繁，请稍后再试':'Too many registration attempts. Wait a minute and try again.',
  '提交过于频繁，请一分钟后再试':'Too many submissions. Wait one minute and try again.',
  '请填写完整内容并确认投稿规则':'Complete the required fields and confirm the contribution rules.',
  '来源链接需以 http:// 或 https:// 开头':'The source URL must begin with http:// or https://.',
  '请填写2—24位署名（中英文、数字、下划线），不能使用保留名或已有账户名':'Use a guest name with 2–24 letters, numbers, underscores or hyphens. Reserved names and existing usernames are unavailable.',
  '最多3张图片（每张2MB）和1个视频（25MB），请检查文件类型和大小':'Attach up to 3 images (2 MB each) and one video (25 MB). Check file types and sizes.',
  '文件内容与格式不符，请重新选择图片或视频':'A file does not match its declared format. Choose the image or video again.',
  '存储空间不足，请联系站点管理员':'The server cannot store these files. Contact the editor or try a smaller upload.',
  '补证任务已关闭或暂不公开，请刷新后选择其他任务':'This evidence task is closed or unavailable. Refresh the page and choose an open task.',
  '补证任务与关联事件不一致':'This evidence task does not match the event. Reopen the contribution link from the task list.',
  '关联事件无效或品牌不一致':'The related event is unavailable or the brand does not match. Reopen its contribution page.',
  '请选择补充类型':'Select a contribution type.',
  '请求来源无效':'The request origin is invalid. Open the form on this site and try again.'
 };
 return translations[message] || `The server rejected this request. ${message}`;
}
let session = {user:null,csrf:''}, trackingReady = false;
const channel = browserVisitChannel();
const serverPath = path => path === '/en' || path === '/global' ? '/' : path.replace(/^\/en(?=\/)/,'').replace(/^\/reply\//,'/event/');
async function request(path, options = {}) {
 const response = await fetch(path,{credentials:'same-origin',...options});
 const data = await response.json();
 if (!response.ok) throw Error(errorText(data.error) || text('请求失败，请重试。','Request failed. Please try again.'));
 return data;
}
function track(action,path=location.pathname) {
 if (!trackingReady || session.user?.role === 'admin') return;
 fetch('/api/engagement',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':session.csrf || ''},body:JSON.stringify({action,path:serverPath(path),channel}),keepalive:true}).catch(() => {});
}
function acceptSession(next) {
 session = next;
 document.querySelectorAll('[data-session-summary]').forEach(node => {node.textContent = next.user ? `Logged in as ${next.user.username}. Approved contributions will use this public name.` : 'You can contribute as a named guest, or log in below.';});
 document.querySelectorAll('[data-guest-label]').forEach(node => {node.hidden = !!next.user;const input = node.querySelector('input');input.required = !next.user;input.disabled = !!next.user;});
 document.querySelectorAll('[data-account-details]').forEach(node => {node.hidden = !!next.user;});
 document.querySelectorAll('[data-logout]').forEach(node => {node.hidden = !next.user;});
}
const sessionReady = request('/api/session').then(async data => {
 acceptSession(data);
 try {
  await request('/api/visit',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':data.csrf || ''},body:JSON.stringify({channel,path:serverPath(location.pathname)})});
  trackingReady = true;
  track('view');
  const form = document.querySelector('[data-feedback-form]');
  if (form) track('submit_start',form.dataset.eventPath);
 } catch {}
 return data;
}).catch(() => {document.querySelectorAll('[data-session-summary]').forEach(node => {node.textContent = 'Session check failed. Submission will retry the session before saving.';});});

const eventDialog = document.querySelector('[data-event-dialog]'), imageDialog = document.querySelector('[data-image-dialog]');
const returnFocus = new Map();
let previousOverflow = '';
function showDialog(dialog,opener) {
 if (!dialog || typeof dialog.showModal !== 'function') return false;
 if (!document.querySelector('dialog[open]')) {previousOverflow = document.body.style.overflow;document.body.style.overflow = 'hidden';}
 returnFocus.set(dialog,opener || document.activeElement);
 dialog.showModal();
 dialog.querySelector('button')?.focus({preventScroll:true});
 return true;
}
for (const dialog of [eventDialog,imageDialog].filter(Boolean)) {
 dialog.addEventListener('close',() => {
  if (!document.querySelector('dialog[open]')) document.body.style.overflow = previousOverflow;
  const opener = returnFocus.get(dialog);
  if (opener?.isConnected) opener.focus({preventScroll:true});
  if (dialog === eventDialog) dialog.querySelectorAll('video').forEach(video => video.pause());
 });
 dialog.addEventListener('click',event => {if (event.target === dialog) {const bounds = dialog.getBoundingClientRect();if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();}});
}
document.addEventListener('click',event => {
 const close = event.target.closest('[data-close-dialog]');
 if (close) {eventDialog?.close();return;}
 if (event.target.closest('[data-close-image]')) {imageDialog?.close();return;}
 const imageLink = event.target.closest('[data-image-preview]');
 if (imageLink && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
  if (!imageDialog || typeof imageDialog.showModal !== 'function') return;
  const image = imageDialog.querySelector('[data-preview-image]') || document.createElement('img');
  image.dataset.previewImage = '';
  imageDialog.querySelector('.global-image-stage').append(image);
  imageDialog.querySelector('.global-image-stage').classList.remove('is-zoomed');
  image.style.width = '';
  image.alt = imageLink.dataset.imageCaption || text('资料图片','Evidence image');
  image.src = imageLink.dataset.imagePreview;
  imageDialog.querySelector('[data-preview-caption]').textContent = image.alt;
  if (showDialog(imageDialog,imageLink)) event.preventDefault();
  return;
 }
 const link = event.target.closest('a[data-global-event]');
 if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0 || eventDialog?.open) return;
 const url = new URL(link.href,location.href);
 if (url.origin !== location.origin) return;
 const template = [...document.querySelectorAll('template[data-event-template]')].find(node => node.dataset.eventTemplate === url.pathname);
 if (!template || !eventDialog || typeof eventDialog.showModal !== 'function') return;
 const body = eventDialog.querySelector('[data-event-dialog-body]');
 body.replaceChildren(template.content.cloneNode(true));
 const heading = body.querySelector('h2');
 if (heading) {heading.id = 'global-active-event-title';eventDialog.setAttribute('aria-labelledby',heading.id);}
 if (showDialog(eventDialog,link)) {event.preventDefault();eventDialog.scrollTop = 0;track('view',url.pathname);}
});
imageDialog?.querySelector('[data-image-fit]')?.addEventListener('click',() => {
 imageDialog.querySelector('.global-image-stage').classList.remove('is-zoomed');
 imageDialog.querySelector('[data-preview-image]').style.width = '';
});
imageDialog?.querySelector('[data-image-zoom]')?.addEventListener('click',() => {
 const image = imageDialog.querySelector('[data-preview-image]');
 if (!image.complete || !image.naturalWidth) {imageDialog.querySelector('[data-preview-caption]').textContent = text('图片仍在加载，请稍后再放大。','The image is still loading. Try zooming again shortly.');return;}
 const stage = imageDialog.querySelector('.global-image-stage');
 const current = stage.classList.contains('is-zoomed') ? parseFloat(image.style.width) : image.getBoundingClientRect().width;
 image.style.width = Math.min(current * 1.5,image.naturalWidth * 4) + 'px';
 stage.classList.add('is-zoomed');
});

document.addEventListener('click',async event => {
 const button = event.target.closest('[data-copy-link]');
 if (!button) return;
 const section = button.closest('.global-citation'), input = section.querySelector('[data-permalink]'), status = section.querySelector('[data-copy-status]');
 try {await navigator.clipboard.writeText(new URL(input.value,location.origin).href);status.textContent = text('链接已复制。','Link copied.');track('share_click',input.value);} catch {input.focus();input.select();status.textContent = text('请手动复制选中的链接。','Select and copy the link manually.');}
});
document.querySelectorAll('[data-follow-brand]').forEach(button => {
 const name = button.dataset.followBrand;
 let saved = [];
 try {const value = JSON.parse(localStorage.getItem('brand-watch-saved') || '[]');saved = Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];} catch {}
 const render = () => {const following = saved.includes(name);button.setAttribute('aria-pressed',String(following));button.textContent = text(following?'取消关注该品牌':'在此浏览器关注品牌',following?'Unfollow this brand':'Follow this brand on this browser');};
 render();
 button.addEventListener('click',() => {saved = saved.includes(name) ? saved.filter(v => v !== name) : [...saved,name];render();try {localStorage.setItem('brand-watch-saved',JSON.stringify(saved));} catch {const note = document.createElement('p');note.setAttribute('role','status');note.textContent = text('浏览器未允许保存关注标记。','This browser could not save the follow bookmark.');button.after(note);}});
});
const accountForm = document.querySelector('[data-account-form]');
accountForm?.querySelector('[name=mode]').addEventListener('change',event => {accountForm.querySelector('[name=password]').autocomplete = event.target.value === 'register' ? 'new-password' : 'current-password';});
accountForm?.addEventListener('submit',async event => {
 event.preventDefault();
 const button = accountForm.querySelector('button[type=submit]'), status = accountForm.querySelector('[data-account-status]'), fields = new FormData(accountForm);
 button.disabled = true;status.textContent = 'Checking your account…';
 try {
  await sessionReady;
  const latest = await request('/api/session');
  const data = await request('/api/session',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':latest.csrf || ''},body:JSON.stringify({username:fields.get('username'),password:fields.get('password'),mode:fields.get('mode')})});
  acceptSession(data);accountForm.querySelector('[name=password]').value = '';status.textContent = 'Account ready. You can now submit below.';
 } catch (error) {status.textContent = 'Account could not be opened. ' + error.message;status.setAttribute('role','alert');} finally {button.disabled = false;}
});
document.querySelector('[data-logout]')?.addEventListener('click',async event => {
 event.target.disabled = true;
 try {await request('/api/session',{method:'DELETE',headers:{'X-CSRF-Token':session.csrf || ''}});acceptSession(await request('/api/session'));} catch (error) {document.querySelector('[data-session-summary]').textContent = 'Logout failed. ' + error.message;} finally {event.target.disabled = false;}
});
const feedbackForm = document.querySelector('[data-feedback-form]');
let previewURLs = [];
function showPreviews() {
 previewURLs.forEach(URL.revokeObjectURL);previewURLs = [];
 const container = feedbackForm.querySelector('[data-upload-preview]');container.replaceChildren();
 for (const [name,type] of [['images','img'],['videos','video']]) for (const file of feedbackForm.elements[name].files) {
  const url = URL.createObjectURL(file);previewURLs.push(url);
  const figure = document.createElement('figure'), media = document.createElement(type), caption = document.createElement('figcaption');
  media.src = url;
  if (type === 'video') {media.controls = true;media.playsInline = true;media.preload = 'metadata';} else media.alt = 'Pending evidence image: ' + file.name;
  caption.textContent = file.name;figure.append(media,caption);container.append(figure);
 }
}
function fileError() {
 const images = [...feedbackForm.elements.images.files], videos = [...feedbackForm.elements.videos.files];
 if (images.length > 3 || images.some(file => file.size > 2097152 || !['image/jpeg','image/png','image/webp'].includes(file.type))) return 'Choose up to 3 JPEG, PNG or WebP images, no larger than 2 MB each.';
 if (videos.length > 1 || videos.some(file => file.size > 25 * 1024 * 1024 || !['video/mp4','video/webm'].includes(file.type))) return 'Choose one MP4 or WebM video, no larger than 25 MB.';
 return '';
}
feedbackForm?.querySelectorAll('input[type=file]').forEach(input => input.addEventListener('change',() => {
 const error = fileError(), status = feedbackForm.querySelector('[data-feedback-status]');
 if (error) {status.textContent = error;status.setAttribute('role','alert');input.value = '';} else {status.textContent = '';status.setAttribute('role','status');}
 showPreviews();
}));
feedbackForm?.addEventListener('submit',async event => {
 event.preventDefault();
 const status = feedbackForm.querySelector('[data-feedback-status]'), button = feedbackForm.querySelector('button[type=submit]');
 const error = fileError();
 if (error) {status.textContent = error;status.setAttribute('role','alert');return;}
 button.disabled = true;status.setAttribute('role','status');status.textContent = 'Saving your contribution for moderation…';
 try {
  const latest = await request('/api/session');acceptSession(latest);
  const data = new FormData(feedbackForm);
  for (const name of ['images','videos']) {data.delete(name);for (const file of feedbackForm.elements[name].files) data.append(name,file);}
  data.set('visit_channel',channel);
  const result = await request('/api/feedback',{method:'POST',headers:{'X-CSRF-Token':latest.csrf || ''},body:data});
  status.textContent = `Saved for moderation. This contribution is not public yet. Public name: ${result.item?.contributor || latest.user?.username || data.get('guest_name')}. Reference: ${result.item?.id || 'saved'}.`;
  feedbackForm.querySelectorAll('input:not([readonly]),textarea,select').forEach(input => {input.disabled = true;});
  button.textContent = 'Submitted — awaiting moderation';
  previewURLs.forEach(URL.revokeObjectURL);previewURLs = [];
 } catch (error) {status.setAttribute('role','alert');status.textContent = 'Your contribution was not saved. ' + error.message;button.disabled = false;}
});
window.addEventListener('pagehide',() => previewURLs.forEach(URL.revokeObjectURL));
