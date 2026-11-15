import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import logoArtwork from '../public/images/client/logo.svg?raw';
import { FIRMA } from './company.js';
import './style.css';

const menuknap = document.querySelector('.menu-toggle');
const mobilmenu = document.querySelector('.mobile-menu');
function lukMenu(fokus = false) {
  if (!menuknap || !mobilmenu) return;
  mobilmenu.hidden = true;
  menuknap.setAttribute('aria-expanded', 'false');
  menuknap.setAttribute('aria-label', 'Åbn menu');
  if (fokus) menuknap.focus();
}
menuknap?.addEventListener('click', () => {
  const aaben = menuknap.getAttribute('aria-expanded') !== 'true';
  menuknap.setAttribute('aria-expanded', String(aaben));
  menuknap.setAttribute('aria-label', aaben ? 'Luk menu' : 'Åbn menu');
  mobilmenu.hidden = !aaben;
});
mobilmenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => lukMenu()));
document.addEventListener('keydown', (haendelse) => {
  if (haendelse.key === 'Escape' && menuknap?.getAttribute('aria-expanded') === 'true') lukMenu(true);
});
document.addEventListener('click', (haendelse) => {
  if (menuknap?.getAttribute('aria-expanded') === 'true' && !haendelse.target.closest('.site-header')) lukMenu();
  const aabner = haendelse.target.closest('[data-dialog]');
  if (aabner) document.getElementById(aabner.dataset.dialog)?.showModal();
  const lukker = haendelse.target.closest('[data-close]');
  if (lukker) lukker.closest('dialog')?.close();
});
window.matchMedia('(min-width:901px)').addEventListener('change', (haendelse) => { if (haendelse.matches) lukMenu(); });
document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });
function opsaetDialog(dialog) {
  dialog.addEventListener('click', (haendelse) => {
    if (haendelse.target !== dialog) return;
    const ramme = dialog.getBoundingClientRect();
    if (haendelse.clientX < ramme.left || haendelse.clientX > ramme.right || haendelse.clientY < ramme.top || haendelse.clientY > ramme.bottom) dialog.close();
  });
  const observatoer = new MutationObserver(() => document.body.classList.toggle('dialog-open', !!document.querySelector('dialog[open]')));
  observatoer.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  return () => observatoer.disconnect();
}
document.querySelectorAll('body > dialog').forEach(opsaetDialog);
let oprydning = [];
function afmonter() {
  oprydning.forEach((ryd) => ryd?.());
  oprydning = [];
  document.body.classList.remove('dialog-open');
  lukMenu();
}
function monter(rute = {}) {
  afmonter();
  const soegning = rute.search ?? location.search;
  document.querySelector('main')?.setAttribute('tabindex', '-1');
  document.querySelectorAll('main dialog').forEach((dialog) => oprydning.push(opsaetDialog(dialog)));
  const logo = document.querySelector('.interactive-logo');
  if (logo) {
    const dokument = new DOMParser().parseFromString(logoArtwork, 'image/svg+xml');
    const grafik = dokument.documentElement;
    grafik.querySelector('#logo-rings')?.classList.add('logo-rings');
    grafik.querySelectorAll('[id]').forEach((node) => { node.id = `interactive-${node.id}`; });
    grafik.setAttribute('aria-hidden', 'true');
    grafik.removeAttribute('aria-labelledby');
    logo.replaceChildren(document.importNode(grafik, true));
    const reduceret = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer;
    let ramme = 0;
    const afspil = () => {
      if (reduceret) { logo.classList.toggle('logo-highlighted'); return; }
      clearTimeout(timer);
      cancelAnimationFrame(ramme);
      logo.classList.remove('is-playing');
      ramme = requestAnimationFrame(() => {
        logo.classList.add('is-playing');
        timer = setTimeout(() => logo.classList.remove('is-playing'), 1250);
      });
    };
    const nulstil = () => { logo.style.setProperty('--logo-x', '0deg'); logo.style.setProperty('--logo-y', '0deg'); };
    logo.addEventListener('click', afspil);
    logo.addEventListener('pointerenter', afspil);
    const foelg = (haendelse) => {
      if (reduceret || haendelse.pointerType !== 'mouse') return;
      const ramme = logo.getBoundingClientRect();
      logo.style.setProperty('--logo-x', `${-((haendelse.clientY - ramme.top) / ramme.height - .5) * 5}deg`);
      logo.style.setProperty('--logo-y', `${((haendelse.clientX - ramme.left) / ramme.width - .5) * 5}deg`);
    };
    logo.addEventListener('pointermove', foelg);
    logo.addEventListener('pointerleave', nulstil);
    oprydning.push(() => { clearTimeout(timer); cancelAnimationFrame(ramme); logo.removeEventListener('click', afspil); logo.removeEventListener('pointerenter', afspil); logo.removeEventListener('pointermove', foelg); logo.removeEventListener('pointerleave', nulstil); });
  }
  const formular = document.getElementById('inquiry-form');
  if (!formular) return;
  const valg = new URLSearchParams(soegning).get('ydelse');
  const felt = formular.querySelector('#service');
  if (valg && [...felt.options].some((mulighed) => mulighed.value === valg)) felt.value = valg;
  let forespoergsel = '';
  const gennemse = (haendelse) => {
    haendelse.preventDefault();
    if (!formular.reportValidity()) return;
    const data = new FormData(formular);
    const raekker = [['Navn', data.get('name')], ['Virksomhed', data.get('company') || 'Ikke angivet'], ['E-mail', data.get('email')], ['Postnummer', data.get('postcode')], ['Arbejdsområde', data.get('service')], ['Opgaven', data.get('message')]];
    const oversigt = document.getElementById('inquiry-summary');
    oversigt.replaceChildren();
    raekker.forEach(([etiket, vaerdi]) => {
      const titel = document.createElement('dt');
      const beskrivelse = document.createElement('dd');
      titel.textContent = etiket;
      beskrivelse.textContent = String(vaerdi).trim();
      oversigt.append(titel, beskrivelse);
    });
    forespoergsel = 'FORESPØRGSEL TIL AARHUS ISO\n\n' + raekker.map(([etiket, vaerdi]) => `${etiket}: ${String(vaerdi).trim()}`).join('\n\n');
    const emne = data.get('service') === 'Ikke valgt' ? 'Forespørgsel til Aarhus ISO' : `Forespørgsel om ${data.get('service')}`;
    const emaillink = document.getElementById('email-inquiry');
    if (emaillink) emaillink.href = `mailto:${FIRMA.email}?subject=${encodeURIComponent(emne)}&body=${encodeURIComponent(forespoergsel)}`;
    document.getElementById('inquiry-dialog').showModal();
  };
  formular.addEventListener('submit', gennemse);
  oprydning.push(() => formular.removeEventListener('submit', gennemse));
  const hent = document.getElementById('download-inquiry');
  const gem = () => {
    const tekst = `${forespoergsel}\n\nDenne forespørgsel er ikke sendt automatisk til virksomheden.\n`;
    const url = URL.createObjectURL(new Blob([tekst], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aarhus-iso-forespoergsel.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  hent?.addEventListener('click', gem);
  oprydning.push(() => hent?.removeEventListener('click', gem));
}
window.AarhusSite = { mount: monter, unmount: afmonter };
window.addEventListener('aarhus:navigate', (haendelse) => monter(haendelse.detail));
monter(window.__AARHUS_PREVIEW_ROUTE || {});
