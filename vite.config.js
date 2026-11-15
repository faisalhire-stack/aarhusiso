import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { FIRMA } from './src/company.js';

const siteBase = process.env.SITE_BASE_PATH || '/';
if (!siteBase.startsWith('/') || !siteBase.endsWith('/') || siteBase.startsWith('//')) {
  throw new Error('SITE_BASE_PATH skal begynde og slutte med en enkelt skråstreg.');
}

export default defineConfig({
  base: siteBase,
  plugins: [{
    name: 'company-details',
    transformIndexHtml(html) {
      return html.replace(/__FIRMA_([A-Z]+)__/g, (match, field) => {
        const key = { NAVN: 'navn', TELEFON: 'telefon', TELEFONLINK: 'telefonLink', EMAIL: 'email', ADRESSE: 'adresse', POSTNUMMER: 'postnummer', BY: 'by', CVR: 'cvr', ERFARING: 'erfaring' }[field];
        if (!key) throw new Error(`Ukendt firmafelt: ${field}`);
        return String(FIRMA[key]).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
      });
    },
  }, {
    name: 'project-site-links',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        if (siteBase === '/') return html;
        return html.replace(/\b(href|src)=(["'])(\/[^"']*)\2/g, (match, attribute, quote, url) => {
          if (url.startsWith('//') || url.startsWith(siteBase)) return match;
          return `${attribute}=${quote}${siteBase}${url.slice(1)}${quote}`;
        });
      },
    },
  }],
  server: { host: '0.0.0.0', port: 3000, strictPort: true },
  preview: { host: '0.0.0.0', port: 3000, strictPort: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        services: resolve(import.meta.dirname, 'ydelser/index.html'),
        about: resolve(import.meta.dirname, 'om-os/index.html'),
        contact: resolve(import.meta.dirname, 'kontakt/index.html'),
        privacy: resolve(import.meta.dirname, 'privatliv/index.html'),
        references: resolve(import.meta.dirname, 'referencer/index.html'),
        pipes: resolve(import.meta.dirname, 'ydelser/roerisolering/index.html'),
        ventilation: resolve(import.meta.dirname, 'ydelser/ventilationsisolering/index.html'),
        cladding: resolve(import.meta.dirname, 'ydelser/pladeisolering/index.html'),
        fire: resolve(import.meta.dirname, 'ydelser/brandisolering/index.html'),
        technical: resolve(import.meta.dirname, 'ydelser/teknisk-isolering/index.html'),
        cooling: resolve(import.meta.dirname, 'ydelser/koeleisolering/index.html'),
        asbestos: resolve(import.meta.dirname, 'ydelser/asbestsanering/index.html'),
      },
    },
  },
});
