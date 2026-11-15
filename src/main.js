import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/syne/latin-500.css';
import '@fontsource/syne/latin-600.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import { initPipeScene } from './pipe-scene.js';
import './style.css';

const menuButton=document.querySelector('.menu-toggle');
const mobileMenu=document.querySelector('.mobile-menu');
function closeMenu(focus=false){if(!menuButton||!mobileMenu)return;mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Åbn menu');document.body.classList.remove('menu-open');if(focus)menuButton.focus();}
menuButton?.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Luk menu':'Åbn menu');mobileMenu.hidden=!open;document.body.classList.toggle('menu-open',open);});
mobileMenu?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>closeMenu()));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuButton?.getAttribute('aria-expanded')==='true')closeMenu(true);});
document.addEventListener('click',e=>{if(menuButton?.getAttribute('aria-expanded')==='true'&&!e.target.closest('.site-header'))closeMenu();const opener=e.target.closest('[data-dialog]');if(opener)document.getElementById(opener.dataset.dialog)?.showModal();const closer=e.target.closest('[data-close]');if(closer)closer.closest('dialog')?.close();});
window.matchMedia('(min-width:761px)').addEventListener('change',e=>{if(e.matches)closeMenu();});
document.querySelectorAll('[data-year]').forEach(n=>n.textContent=String(new Date().getFullYear()));
if(window.matchMedia('(pointer:fine)').matches&&!window.matchMedia('(prefers-reduced-motion:reduce)').matches){let pendingGlass;let glassFrame=0;document.addEventListener('pointermove',e=>{const panel=e.target.closest('.glass-panel');if(!panel)return;pendingGlass={panel,x:e.clientX,y:e.clientY};if(glassFrame)return;glassFrame=requestAnimationFrame(()=>{glassFrame=0;const {panel,x,y}=pendingGlass;if(!panel.isConnected)return;const bounds=panel.getBoundingClientRect();panel.style.setProperty('--glass-x',`${(x-bounds.left)/bounds.width*100}%`);panel.style.setProperty('--glass-y',`${(y-bounds.top)/bounds.height*100}%`);});},{passive:true});}
function setupDialog(dialog){if(dialog.dataset.bound)return;dialog.dataset.bound='true';dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();});const observer=new MutationObserver(()=>document.body.classList.toggle('dialog-open',!!document.querySelector('dialog[open]')));observer.observe(dialog,{attributes:true,attributeFilter:['open']});return()=>observer.disconnect();}
document.querySelectorAll('body>dialog').forEach(setupDialog);
let cleanups=[];
function unmount(){cleanups.forEach(cleanup=>cleanup?.());cleanups=[];document.body.classList.remove('dialog-open');closeMenu();}
function mount(route={}){
  unmount();
  const current={path:route.path||location.pathname,search:route.search??location.search};
  document.querySelectorAll('main dialog').forEach(d=>{const cleanup=setupDialog(d);if(cleanup)cleanups.push(cleanup);});
  const main=document.querySelector('main');if(main)main.setAttribute('tabindex','-1');
  let raf=requestAnimationFrame(()=>{if(document.getElementById('pipe-stage'))cleanups.push(initPipeScene());});cleanups.push(()=>cancelAnimationFrame(raf));
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced&&'IntersectionObserver'in window){document.documentElement.classList.add('js-motion');const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');reveal.unobserve(e.target);}}),{threshold:.12});document.querySelectorAll('[data-reveal]').forEach(n=>reveal.observe(n));cleanups.push(()=>reveal.disconnect());}
  const form=document.getElementById('inquiry-form');if(!form)return;
  const selected=new URLSearchParams(current.search).get('ydelse');const select=form.querySelector('#service');if(selected&&[...select.options].some(o=>o.value===selected))select.value=selected;
  let inquiryText='';
  const submit=e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);const rows=[['Navn',data.get('name')],['Virksomhed',data.get('company')||'Ikke angivet'],['E-mail',data.get('email')],['Postnummer',data.get('postcode')],['Arbejdsområde',data.get('service')],['Opgaven',data.get('message')]];const summary=document.getElementById('inquiry-summary');summary.replaceChildren();rows.forEach(([key,value])=>{const dt=document.createElement('dt');const dd=document.createElement('dd');dt.textContent=key;dd.textContent=String(value).trim();summary.append(dt,dd);});inquiryText='FORESPØRGSEL TIL AARHUS ISO\n\n'+rows.map(([key,value])=>key+': '+String(value).trim()).join('\n\n')+'\n\nDesignversion: Denne forespørgsel er ikke sendt til virksomheden.\n';document.getElementById('inquiry-dialog').showModal();};
  form.addEventListener('submit',submit);cleanups.push(()=>form.removeEventListener('submit',submit));
  const download=document.getElementById('download-inquiry');const save=()=>{const url=URL.createObjectURL(new Blob([inquiryText],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='aarhus-iso-forespoergsel.txt';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};download?.addEventListener('click',save);cleanups.push(()=>download?.removeEventListener('click',save));
}
window.AarhusSite={mount,unmount};
window.addEventListener('aarhus:navigate',e=>mount(e.detail));
mount(window.__AARHUS_PREVIEW_ROUTE||{});
