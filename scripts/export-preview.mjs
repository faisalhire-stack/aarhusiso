import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Build first. This export keeps full-page navigation inside a single offline file.
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(project, 'dist');
const output = resolve(process.argv[2] || resolve(project, '..', 'aarhusiso-v2.html'));
const mimeTypes = {
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};
const assets = new Map();

function localPath(url, relativeTo = dist) {
  const pathname = decodeURIComponent(url.split(/[?#]/, 1)[0]);
  const path = pathname.startsWith('/') ? resolve(dist, `.${pathname}`) : resolve(relativeTo, pathname);
  if (!path.startsWith(dist + sep)) throw new Error(`Asset outside dist: ${url}`);
  return path;
}

function dataUrl(url, relativeTo = dist) {
  if (/^(?:data:|#)/i.test(url)) return url;
  if (/^(?:https?:)?\/\//i.test(url)) throw new Error(`Preview requires an external asset: ${url}`);
  const path = localPath(url, relativeTo);
  if (!assets.has(path)) {
    const mime = mimeTypes[extname(path).toLowerCase()];
    if (!mime) throw new Error(`Unsupported asset type: ${path}`);
    assets.set(path, `data:${mime};base64,${readFileSync(path).toString('base64')}`);
  }
  return assets.get(path);
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))?.[2];
}

function embedImages(html) {
  return html.replace(/\b(src|poster)=(['"])(.*?)\2/gi,
    (_match, name, quote, url) => `${name}=${quote}${dataUrl(url)}${quote}`);
}

function collectPages(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectPages(path) : entry.name === 'index.html' ? [path] : [];
  });
}

const pageFiles = collectPages(dist);
if (!pageFiles.length) throw new Error('No pages found; run npm run build first');
const rawPages = Object.fromEntries(pageFiles.map((file) => {
  const path = '/' + relative(dist, file).split(sep).join('/').replace(/index\.html$/, '');
  return [path, readFileSync(file, 'utf8')];
}));
if (!rawPages['/']) throw new Error('Missing built homepage');

function adaptLinks(html) {
  return html.replace(/\bhref=(['"])(.*?)\1/gi, (match, quote, href) => {
    if (!href.startsWith('/') || href.startsWith('//')) return match;
    const url = new URL(href.replace(/&amp;/g, '&'), 'https://preview.invalid');
    const path = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    if (!rawPages[path]) return match;
    const route = path + url.search + url.hash;
    return `href=${quote}#${route.replace(/&/g, '&amp;')}${quote} data-preview-route=${quote}${route.replace(/&/g, '&amp;')}${quote}`;
  });
}

const pages = {};
for (const [path, html] of Object.entries(rawPages)) {
  const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
  if (!main) throw new Error(`Missing main content for ${path}`);
  const bodyTag = html.match(/<body\b[^>]*>/i)?.[0] || '<body>';
  pages[path] = {
    main: adaptLinks(embedImages(main)),
    title: html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Aarhus ISO',
    description: attribute(html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] || '', 'content') || '',
    bodyClass: attribute(bodyTag, 'class') || '',
    page: attribute(bodyTag, 'data-page') || (path === '/' ? 'home' : 'inner'),
  };
}

const scripts = [];
let html = rawPages['/'];
html = html.replace(/<script\b[^>]*\bsrc=(['"])(.*?)\1[^>]*>\s*<\/script>/gi,
  (_tag, _quote, url) => {
    const script = readFileSync(localPath(url), 'utf8');
    if (/(?:^|[;\n])\s*import\s*(?:["'{*]|\()/.test(script)) {
      throw new Error(`Bundle contains an external module import: ${url}`);
    }
    scripts.push(script);
    return '';
  });
if (!scripts.length) throw new Error('No compiled JavaScript found; run npm run build first');

html = html.replace(/<link\b[^>]*>/gi, (tag) => {
  const rel = attribute(tag, 'rel');
  const href = attribute(tag, 'href');
  if (!href) return tag;
  if (rel === 'stylesheet') {
    const file = localPath(href);
    const css = readFileSync(file, 'utf8').replace(/url\(\s*(['"]?)(.*?)\1\s*\)/gi,
      (_match, _quote, url) => `url("${dataUrl(url, dirname(file))}")`);
    return `<style>${css}</style>`;
  }
  if (rel === 'modulepreload') return '';
  if (rel === 'icon' || (rel === 'preload' && ['font', 'image'].includes(attribute(tag, 'as')))) {
    return tag.replace(/\bhref=(['"])(.*?)\1/i,
      (_match, quote, url) => `href=${quote}${dataUrl(url)}${quote}`);
  }
  return tag;
});
html = adaptLinks(embedImages(html));

const pageJson = JSON.stringify(pages).replace(/</g, '\\u003c');
const router = `
(() => {
  const pages = ${pageJson};
  const decodeText = (value) => {
    const element = document.createElement('textarea');
    element.innerHTML = value;
    return element.value;
  };
  const positions = new Map();
  let activePath = '/';
  let activeSearch = '';
  let activeAddress = '/';
  let pendingNavigation = null;
  let changing = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  function parseRoute(value) {
    const url = new URL(value || '/', 'https://preview.invalid');
    const path = url.pathname.endsWith('/') ? url.pathname : url.pathname + '/';
    return { path: pages[path] ? path : '/', search: pages[path] ? url.search : '', anchor: url.hash.slice(1) };
  }

  function address(route) { return route.path + route.search + (route.anchor ? '#' + route.anchor : ''); }

  function fromLocation() {
    if (location.hash.startsWith('#/')) return parseRoute(location.hash.slice(1));
    return { path: activePath, search: activeSearch, anchor: location.hash.slice(1) };
  }

  function updateNavigation(path) {
    document.querySelectorAll('header nav a[data-preview-route]').forEach((link) => {
      const target = parseRoute(link.dataset.previewRoute).path;
      const current = target === '/' ? path === '/' : path.startsWith(target);
      if (current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function scrollToRoute(route, restore) {
    if (route.anchor) {
      let anchor = route.anchor;
      try { anchor = decodeURIComponent(anchor); } catch {}
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        return;
      }
    }
    const position = restore ? positions.get(address(route)) : null;
    scrollTo({ left: position?.x || 0, top: position?.y || 0, behavior: 'instant' });
  }

  function render(route, { initial = false, restore = false } = {}) {
    const nextAddress = address(route);
    const changedPage = route.path !== activePath || route.search !== activeSearch;
    if (!initial) positions.set(activeAddress, { x: scrollX, y: scrollY });
    changing = true;
    if (changedPage) {
      window.AarhusSite?.unmount?.();
      document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close());
      document.body.className = pages[route.path].bodyClass;
      document.body.dataset.page = pages[route.path].page;
      document.body.dataset.path = route.path;
      const currentMain = document.querySelector('main');
      const template = document.createElement('template');
      template.innerHTML = pages[route.path].main;
      currentMain.replaceWith(template.content.firstElementChild);
      document.title = decodeText(pages[route.path].title);
      const description = document.querySelector('meta[name="description"]');
      if (description) description.content = decodeText(pages[route.path].description);
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = document.title;
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) ogDescription.content = description?.content || '';
      window.dispatchEvent(new CustomEvent('aarhus:navigate', { detail: { path: route.path, search: route.search } }));
    }
    activePath = route.path;
    activeSearch = route.search;
    activeAddress = nextAddress;
    window.__AARHUS_PREVIEW_ROUTE = { path: activePath, search: activeSearch };
    updateNavigation(activePath);
    if (!initial && changedPage) {
      const main = document.querySelector('main');
      main.setAttribute('tabindex', '-1');
      main.focus({ preventScroll: true });
      if (!reducedMotion && main.animate) {
        main.animate([{ opacity: .15, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'cubic-bezier(.2,.7,.3,1)' });
      }
    }
    scrollToRoute(route, restore);
    requestAnimationFrame(() => { changing = false; });
  }

  function navigate(route) {
    positions.set(activeAddress, { x: scrollX, y: scrollY });
    const next = address(route);
    pendingNavigation = next;
    if (location.hash === '#' + next) {
      render(route);
      pendingNavigation = null;
    } else location.hash = next;
  }

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    if (link.dataset.previewRoute) {
      event.preventDefault();
      navigate(parseRoute(link.dataset.previewRoute));
    } else {
      const href = link.getAttribute('href');
      if (href?.startsWith('#') && !href.startsWith('#/')) {
        event.preventDefault();
        navigate({ path: activePath, search: activeSearch, anchor: href.slice(1) });
      }
    }
  });
  window.addEventListener('hashchange', () => {
    const route = fromLocation();
    const explicit = pendingNavigation === address(route);
    pendingNavigation = null;
    render(route, { restore: !explicit });
  });
  window.addEventListener('scroll', () => {
    if (!changing) positions.set(activeAddress, { x: scrollX, y: scrollY });
  }, { passive: true });
  render(fromLocation(), { initial: true });
})();`;

function inlineScript(code, type = '') {
  return `<script${type ? ` type="${type}"` : ''}>\n${code.replace(/<\/script/gi, '<\\/script')}\n</script>`;
}

const bootstrap = inlineScript("window.__AARHUS_PREVIEW_ROUTE = { path: '/', search: '' };");
const payload = bootstrap + scripts.map((script) => inlineScript(script, 'module')).join('\n') + inlineScript(router, 'module');
if (!html.includes('</body>')) throw new Error('Missing closing body');
html = html.replace('</body>', () => payload + '\n</body>');
writeFileSync(output, html);
console.log(`Offline multipage preview: ${output}`);
console.log(`${Buffer.byteLength(html).toLocaleString('en-US')} bytes; ${assets.size} embedded assets; ${Object.keys(pages).length} full pages`);
