import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'index.html'), 'utf8');

function shared(name) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const from = source.indexOf(start);
  const to = source.indexOf(end);
  if (from === -1 || to === -1 || to < from) throw new Error(`Det fælles HTML-afsnit mangler: ${name}`);
  return source.slice(from + start.length, to).trim();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

const arrow = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg>';
const check = '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>';
const services = [
  {
    slug: 'roerisolering', name: 'Rørisolering', heading: 'Rør<wbr>isolering.', number: '01', label: 'RØR',
    text: 'Teknisk isolering af rør og tilhørende installationer.',
    description: 'Rørisolering for private og erhverv. Aarhus ISO rådgiver om teknisk isolering af rør og tilhørende installationer i hele Danmark.',
    introduction: 'En god løsning begynder med at forstå rørene og den installation, de indgår i. Vi taler med dig om opgavens omfang, forholdene på stedet og den ønskede udførelse.',
    approach: 'Fortæl os, om det drejer sig om en eksisterende installation eller et nyt projekt. Billeder, tegninger og oplysninger om installationens anvendelse kan være et godt udgangspunkt for den første samtale.',
    note: 'Vi afstemmer isoleringen med den konkrete opgave og lægger vægt på grundig udførelse og en ordentlig finish.',
  },
  {
    slug: 'ventilationsisolering', name: 'Ventilationsisolering', heading: 'Ventilations<wbr>isolering.', number: '02', label: 'VENTILATION',
    text: 'Isolering af ventilationskanaler og ventilationsinstallationer.',
    description: 'Ventilationsisolering for private og erhverv i hele Danmark. Aarhus ISO hjælper med isolering af ventilationskanaler og ventilationsinstallationer.',
    introduction: 'Ventilationsinstallationer er forskellige i både udformning og placering. Derfor starter vi med at forstå anlægget, opgaven og de forhold, arbejdet skal udføres under.',
    approach: 'Har du et overblik over kanalføringen eller tegninger af anlægget, kan det hjælpe os med at forstå dit projekt. Vi taler om opgavens omfang og afstemmer løsningen med dig.',
    note: 'Vi bruger vores erfaring til at rådgive om isoleringen og har fokus på detaljerne i den færdige udførelse.',
  },
  {
    slug: 'pladeisolering', name: 'Pladeisolering', heading: 'Plade<wbr>isolering.', number: '03', label: 'PLADE',
    text: 'Pladeisolering som en del af projektets tekniske isolering.',
    description: 'Pladeisolering som en del af teknisk isolering. Aarhus ISO rådgiver private og erhverv om den konkrete installation og opgave.',
    introduction: 'Vi ser pladeisoleringen i sammenhæng med projektets øvrige tekniske isolering. Den konkrete installation og den ønskede udførelse er udgangspunktet for vores rådgivning.',
    approach: 'Beskriv installationen og det arbejde, du har brug for. Eventuelle billeder eller projektspecifikationer gør det lettere at tage en konkret samtale om omfang og udførelse.',
    note: 'Vi afstemmer detaljerne med dig, så arbejdet tager udgangspunkt i netop din installation og dit projekt.',
  },
  {
    slug: 'brandisolering', name: 'Brandisolering', heading: 'Brand<wbr>isolering.', number: '04', label: 'BRAND',
    text: 'Brandisolering af tekniske installationer.',
    description: 'Brandisolering af tekniske installationer for private og erhverv. Tal med Aarhus ISO om din installation, projektets krav og opgavens omfang.',
    introduction: 'Brandisolering skal ses i sammenhæng med den konkrete installation og projektets krav. Vi starter derfor med en samtale om opgaven og det materiale, der beskriver den.',
    approach: 'Del gerne relevante tegninger, beskrivelser og projektspecifikationer. Det giver et bedre grundlag for at afklare arbejdsområdet og den ønskede udførelse, inden arbejdet aftales.',
    note: 'Vi tager udgangspunkt i opgavens konkrete grundlag og afstemmer omfang og detaljer med dig.',
  },
];

const contactLink = (service) => `/kontakt/${service ? `?ydelse=${encodeURIComponent(service)}` : ''}`;
const button = (label, href, style = '') => `<a class="button ${style}" href="${href}">${label}${arrow}</a>`;
const kicker = (text) => `<p class="page-kicker"><span class="status-dot"></span>${text}</p>`;
function breadcrumbs(current, service = false) {
  return `<nav class="breadcrumbs container" aria-label="Brødkrummesti"><a href="/">Forside</a><span aria-hidden="true">/</span>${service ? '<a href="/ydelser/">Ydelser</a><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${escapeHtml(current)}</span></nav>`;
}
function serviceRows(current = '') {
  return services.map((service) => `<a class="service-row" href="/ydelser/${service.slug}/"${current === service.slug ? ' aria-current="page"' : ''}>
    <span class="service-row-number">${service.number}</span><div class="service-row-main"><h2 class="service-row-title">${escapeHtml(service.name)}</h2><p class="service-row-copy">${escapeHtml(service.text)}</p></div><span class="service-row-arrow">${arrow}</span>
  </a>`).join('\n');
}
function pageCta(title = 'Hvad kan vi hjælpe med?', service = '') {
  return `<section class="page-cta container"><div><p class="page-kicker">DET BEGYNDER MED EN SAMTALE</p><h2>${title}</h2></div>${button('Lad os tale om din opgave', contactLink(service))}</section>`;
}
function image(src = 'technical-insulation', caption = 'MED ØJE FOR DETALJEN') {
  const portrait = src === 'craftsmanship';
  return `<figure class="page-image"><img src="/images/${src}.webp" width="${portrait ? '1086' : '1672'}" height="${portrait ? '1448' : '941'}" alt="Illustrativt billede af teknisk isolering og omhyggelig pladebeklædning" loading="lazy" /><figcaption>${caption}<span>ILLUSTRATIVT BILLEDE</span></figcaption></figure>`;
}

const pages = [
  {
    path: 'ydelser', name: 'Vores ydelser', type: 'services', title: 'Ydelser — Teknisk isolering | Aarhus ISO',
    description: 'Rørisolering, ventilationsisolering, pladeisolering og brandisolering. Fire arbejdsområder og 35 års erfaring hos Aarhus ISO.',
    content: `${breadcrumbs('Vores ydelser')}
      <section class="page-hero container">${kicker('VORES ARBEJDSOMRÅDER')}<h1 class="page-title">Fire fagområder.<br /><em>Én faglighed.</em></h1><p class="page-lead">Isolering til din installation. Vi hjælper private og erhverv med den løsning, der passer til opgaven.</p></section>
      <section class="service-list container" aria-label="Alle vores ydelser">${serviceRows()}</section>
      <section class="page-grid container services-notes"><article class="glass-panel editorial-panel"><p class="page-kicker">ERFARING I HVER DETALJE</p><span class="stat-number">35<span>år</span></span><h2>Grundigt håndværk.<br />Ordentlig finish.</h2><p>Vi bruger vores erfaring til at rådgive dig om, hvilken isolering der passer til din installation.</p></article><article class="glass-panel editorial-panel upcoming-panel"><p class="page-kicker">KOMMENDE YDELSE</p><h2>Vi udvider<br /><em>vores faglighed.</em></h2><p>Asbestsanering bliver en del af vores ydelser. Arbejdsområdet er kommende og kan endnu ikke vælges i kontaktformularen.</p><span class="upcoming-badge">Asbestsanering · På vej</span></article></section>
      ${pageCta('Lad os finde den rette løsning.')}`,
  },
  ...services.map((service) => ({
    path: `ydelser/${service.slug}`, name: service.name, type: 'service', title: `${service.name} — Teknisk isolering | Aarhus ISO`, description: service.description,
    content: `${breadcrumbs(service.name, true)}
      <section class="page-hero container service-page-hero">${kicker(`${service.number} / ${service.label}`)}<h1 class="page-title">${service.heading}</h1><p class="page-lead">${escapeHtml(service.text)}</p><div class="page-hero-actions">${button('Tal med os om opgaven', contactLink(service.name))}<span class="small-assurance">${check}Private &amp; erhverv</span></div></section>
      <section class="page-grid container service-intro-grid">${image()}<article class="glass-panel editorial-panel"><p class="page-kicker">TIL DIN INSTALLATION</p><h2>En løsning<br /><em>med omtanke.</em></h2><p>${escapeHtml(service.introduction)}</p><p>${escapeHtml(service.note)}</p></article></section>
      <section class="page-grid container service-approach-grid"><article class="editorial-panel"><p class="page-kicker">ET GODT UDGANGSPUNKT</p><h2>Vi starter med<br /><em>din opgave.</em></h2><p>${escapeHtml(service.approach)}</p>${button('Fortæl os om projektet', contactLink(service.name), 'button-outline')}</article><aside class="glass-panel editorial-panel"><p class="page-kicker">VORES ARBEJDSOMRÅDER</p><h2>Fire fagområder.<br />Samme omhu.</h2><nav class="related-services" aria-label="Andre ydelser">${services.map((item) => `<a href="/ydelser/${item.slug}/"${service.slug === item.slug ? ' aria-current="page"' : ''}><span>${item.number} / ${escapeHtml(item.name)}</span>${arrow}</a>`).join('')}</nav></aside></section>
      ${pageCta('Skal vi tale om din installation?', service.name)}`,
  })),
  {
    path: 'om-os', name: 'Om Aarhus ISO', type: 'about', title: 'Om Aarhus ISO — Et familiefirma. Bror og søster.',
    description: 'Aarhus ISO er et familieejet firma drevet af bror og søster. 35 års erfaring med teknisk isolering og fokus på grundigt håndværk og en ordentlig finish.',
    content: `${breadcrumbs('Om Aarhus ISO')}
      <section class="page-hero container">${kicker('MENNESKERNE BAG HÅNDVÆRKET')}<h1 class="page-title">Et familiefirma.<br /><em>Bror og søster.</em></h1><p class="page-lead">Faglighed i arbejdet. Ordentlighed i samarbejdet. Vi er Aarhus ISO.</p></section>
      <section class="page-grid container about-story-grid">${image('craftsmanship', 'OMTANKE I HVER EN DETALJE')}<article class="editorial-panel"><p class="page-kicker">LILLE FIRMA. STOR OMHU.</p><h2>Personligt samarbejde.<br /><em>Præcist håndværk.</em></h2><p>Aarhus ISO er et familieejet firma drevet af bror og søster. Sammen arbejder vi med teknisk isolering i hele Jylland.</p><p>Vores arbejdsområder omfatter rørisolering, ventilationsisolering, pladeisolering og brandisolering.</p><p>Vi bruger vores erfaring til at rådgive dig om, hvilken isolering der passer til din installation. Vi lægger vægt på en grundig udførelse og en ordentlig finish.</p>${button('Se vores arbejdsområder', '/ydelser/', 'button-outline')}</article></section>
      <section class="about-facts container" aria-label="Om Aarhus ISO"><div class="about-fact glass-panel"><span class="stat-number">35<span>år</span></span><p>Erfaring med<br />teknisk isolering.</p></div><div class="about-fact glass-panel"><span class="stat-number">04</span><p>Arbejdsområder.<br />Samme grundighed.</p></div><div class="about-fact glass-panel"><span class="stat-word">Sammen.</span><p>For private<br />og erhverv.</p></div></section>
      <section class="story-columns container"><div><p class="page-kicker">EN GOD PROCES</p><h2>Ordentlighed.<br /><em>Hele vejen.</em></h2></div><ol class="process-list"><li><span>01</span><div><h3>Vi taler om opgaven</h3><p>Du fortæller om installationen, dine ønsker og hvor arbejdet skal udføres.</p></div></li><li><span>02</span><div><h3>Vi finder den rette løsning</h3><p>Vi rådgiver om isoleringen og afstemmer opgavens omfang med dig.</p></div></li><li><span>03</span><div><h3>Vi udfører arbejdet</h3><p>Med fokus på detaljerne, grundig udførelse og en ordentlig finish.</p></div></li></ol></section>
      ${pageCta('Lad os lære din opgave at kende.')}`,
  },
  {
    path: 'kontakt', name: 'Kontakt', type: 'contact', title: 'Kontakt Aarhus ISO — Lad os tale om din opgave',
    description: 'Fortæl Aarhus ISO om din opgave. Teknisk isolering for private og erhverv med 35 års erfaring og fokus på grundig rådgivning og udførelse.',
    content: `${breadcrumbs('Kontakt')}
      <section class="contact-layout container" aria-labelledby="contact-title"><div class="contact-intro">${kicker('DET BEGYNDER MED EN SAMTALE')}<h1 class="page-title" id="contact-title">Din opgave.<br /><em>Vores faglighed.</em></h1><p class="page-lead">Stor eller lille opgave? Fortæl os om installationen og det arbejde, du ønsker udført.</p><div class="contact-assurances"><span>${check}For private og erhverv</span><span>${check}35 års erfaring med teknisk isolering</span><span>${check}Grundig rådgivning og udførelse</span></div><div class="glass-panel contact-company"><p class="page-kicker">AARHUS ISO</p><p>Teknisk isolering. I hele Danmark.</p><span>CVR 45788040</span></div></div>
      <form class="contact-form glass-panel" id="inquiry-form" aria-describedby="contact-preview-note"><p class="page-kicker">LAD OS FINDE EN LØSNING</p><h2>Fortæl os om din opgave.</h2><div class="form-row"><div class="form-field"><label for="name">Dit navn <span>*</span></label><input id="name" name="name" autocomplete="name" placeholder="Fornavn og efternavn" required maxlength="100" /></div><div class="form-field"><label for="company">Virksomhed <span class="optional">(valgfrit)</span></label><input id="company" name="company" autocomplete="organization" placeholder="Virksomhedens navn" maxlength="150" /></div></div><div class="form-row"><div class="form-field"><label for="email">E-mail <span>*</span></label><input id="email" type="email" name="email" autocomplete="email" placeholder="din@email.dk" required maxlength="200" /></div><div class="form-field"><label for="postcode">Opgavens postnummer <span>*</span></label><input id="postcode" name="postcode" autocomplete="postal-code" placeholder="F.eks. 8000" inputmode="numeric" pattern="[0-9]{4}" title="Skriv et dansk postnummer med fire cifre" required maxlength="4" /></div></div><div class="form-field"><label for="service">Hvad drejer opgaven sig om?</label><select id="service" name="service"><option value="Ikke valgt">Vælg et arbejdsområde</option>${services.map((service) => `<option>${escapeHtml(service.name)}</option>`).join('')}<option>Flere arbejdsområder / andet</option></select></div><div class="form-field"><label for="message">Kort om opgaven <span>*</span></label><textarea id="message" name="message" rows="4" placeholder="Fortæl lidt om installationen og det arbejde, du ønsker udført …" required minlength="10" maxlength="4000"></textarea></div><button class="button form-submit" type="submit">Gennemse din forespørgsel ${arrow}</button><p class="form-note" id="contact-preview-note">Designversion: Du kan udfylde og gemme din forespørgsel. Den bliver endnu ikke sendt. <a class="inline-button" href="/privatliv/">Om dine oplysninger</a></p></form></section>
      <dialog class="info-dialog" id="inquiry-dialog" aria-labelledby="inquiry-dialog-title"><button class="dialog-close" type="button" data-close aria-label="Luk forespørgsel"><svg class="icon"><use href="#icon-close"/></svg></button><p class="page-kicker">DIN OPGAVE</p><h2 id="inquiry-dialog-title">En god begyndelse.</h2><p>Her er din forespørgsel. Du kan gemme den som en tekstfil. <strong>Den er ikke sendt til Aarhus ISO.</strong></p><dl class="inquiry-summary" id="inquiry-summary"></dl><div class="dialog-actions"><button class="button" id="download-inquiry" type="button">Gem forespørgsel <svg class="icon"><use href="#icon-down"/></svg></button><button class="text-link" type="button" data-close>Ret oplysninger</button></div><p class="dialog-note">Afsendelse til virksomheden tilsluttes før lancering.</p></dialog>`,
  },
  {
    path: 'privatliv', name: 'Privatliv', type: 'privacy', title: 'Privatliv i designversionen | Aarhus ISO',
    description: 'Læs om oplysninger, formular og lokal download i Aarhus ISO-designversionen. Formularens indhold behandles kun i din browser.',
    content: `${breadcrumbs('Privatliv')}
      <section class="page-hero container">${kicker('PRIVATLIV I DESIGNVERSIONEN')}<h1 class="page-title">Dit projekt.<br /><em>Dine oplysninger.</em></h1><p class="page-lead">Denne information beskriver den aktuelle designversion. Den opdateres, når den endelige kontaktløsning tilsluttes.</p></section>
      <section class="page-grid container privacy-grid"><article class="glass-panel editorial-panel"><p class="page-kicker">01 / FORMULAREN</p><h2>Kun i din browser.</h2><p>Det, du skriver i kontaktformularen, behandles kun i din browser. Oplysningerne bliver ikke sendt til Aarhus ISO eller gemt på en server af formularen.</p><p>Du kan gennemse din forespørgsel og vælge at gemme den som en tekstfil på din egen enhed. Download er en lokal handling og sender ikke forespørgslen til virksomheden.</p></article><article class="glass-panel editorial-panel"><p class="page-kicker">02 / DIT VALG</p><h2>Du gemmer selv.</h2><p>Designversionen gemmer ikke formularens indhold i browserens lokale lager. Din browser kan dog have egne funktioner til autofuldførelse.</p><p>Hvis du downloader en forespørgsel, indeholder filen de oplysninger, du selv har indtastet. Opbevar og slet filen som andre dokumenter med dine kontaktoplysninger.</p></article><article class="glass-panel editorial-panel"><p class="page-kicker">03 / COOKIES</p><h2>Uden marketingtags.</h2><p>Designversionen bruger ikke analyse- eller marketingcookies. Skrifter og billeder leveres sammen med hjemmesiden og hentes ikke fra eksterne font- eller billedtjenester.</p><p>Den interaktive 3D-illustration er en visuel præsentation, som ikke behøver dine formularoplysninger.</p></article><article class="glass-panel editorial-panel"><p class="page-kicker">04 / FØR LANCERING</p><h2>En præcis beskrivelse.</h2><p>Når formularens modtager og den endelige drift er fastlagt, opdateres privatlivsinformationen, så den beskriver de faktiske forhold og kontaktmuligheder.</p><p>Aarhus ISO · CVR 45788040.</p></article></section>`,
  },
];

const header = shared('shared-header');
const footer = shared('shared-footer');
const dialogs = shared('shared-dialogs');
const sprite = shared('icon-sprite');

for (const page of pages) {
  const route = `/${page.path}/`;
  const activeHeader = header.replace(/<a\b([^>]*\bhref="([^"]+)"[^>]*)>/g, (match, attributes, href) => href === route ? `<a${attributes} aria-current="page">` : match);
  const html = `<!doctype html>
<html lang="da">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#eeeff3" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="noindex, nofollow" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:type" content="website" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>${escapeHtml(page.title)}</title>
    <script type="module" src="/src/main.js"></script>
  </head>
  <body class="page-body" data-page="${page.type}">
    <a class="skip-link" href="#indhold">Gå til indhold</a>
    ${activeHeader}
    <main class="page-shell" id="indhold">${page.content}</main>
    ${footer}
    ${dialogs}
    ${sprite}
  </body>
</html>
`;
  const directory = resolve(root, page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), html, 'utf8');
  console.log(`Genereret: ${page.path}/index.html`);
}
