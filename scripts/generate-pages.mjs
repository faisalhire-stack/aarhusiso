import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FIRMA } from '../src/company.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'index.html'), 'utf8');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function shared(name) {
  const start = `<!-- ${name}:start -->`;
  const end = `<!-- ${name}:end -->`;
  const from = source.indexOf(start);
  const to = source.indexOf(end);
  if (from === -1 || to === -1 || to < from) throw new Error(`Det fælles HTML-afsnit mangler: ${name}`);
  return source.slice(from + start.length, to).trim();
}

const arrow = '<svg class="icon" aria-hidden="true"><use href="#icon-arrow"/></svg>';
const check = '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>';
const services = [
  {
    slug: 'roerisolering', name: 'Rørisolering', number: '01', label: 'RØR',
    text: 'Teknisk isolering af rør og tilhørende installationer.',
    description: 'Rørisolering for private og erhverv. Aarhus ISO rådgiver om teknisk isolering af rør og tilhørende installationer i hele Danmark.',
    introduction: 'En god løsning begynder med at forstå rørene og den installation, de indgår i. Vi taler med dig om opgavens omfang, forholdene på stedet og den ønskede udførelse.',
    approach: 'Fortæl os, om det drejer sig om en eksisterende installation eller et nyt projekt. Billeder, tegninger og oplysninger om installationens anvendelse kan være et godt udgangspunkt for den første samtale.',
    note: 'Vi afstemmer isoleringen med den konkrete opgave og lægger vægt på grundig udførelse og en ordentlig finish.',
  },
  {
    slug: 'ventilationsisolering', name: 'Ventilationsisolering', number: '02', label: 'VENTILATION',
    text: 'Isolering af ventilationskanaler og ventilationsinstallationer.',
    description: 'Ventilationsisolering for private og erhverv i hele Danmark. Aarhus ISO hjælper med isolering af ventilationskanaler og ventilationsinstallationer.',
    introduction: 'Ventilationsinstallationer er forskellige i både udformning og placering. Derfor starter vi med at forstå anlægget, opgaven og de forhold, arbejdet skal udføres under.',
    approach: 'Har du et overblik over kanalføringen eller tegninger af anlægget, kan det hjælpe os med at forstå dit projekt. Vi taler om opgavens omfang og afstemmer løsningen med dig.',
    note: 'Vi bruger vores erfaring til at rådgive om isoleringen og har fokus på detaljerne i den færdige udførelse.',
  },
  {
    slug: 'pladeisolering', name: 'Pladeisolering', number: '03', label: 'PLADE',
    text: 'Pladeisolering som en del af projektets tekniske isolering.',
    description: 'Pladeisolering som en del af teknisk isolering. Aarhus ISO rådgiver private og erhverv om den konkrete installation og opgave.',
    introduction: 'Vi ser pladeisoleringen i sammenhæng med projektets øvrige tekniske isolering. Den konkrete installation og den ønskede udførelse er udgangspunktet for vores rådgivning.',
    approach: 'Beskriv installationen og det arbejde, du har brug for. Billeder og projektspecifikationer gør det lettere at tage en konkret samtale om omfang og udførelse.',
    note: 'Vi afstemmer detaljerne med dig, så arbejdet tager udgangspunkt i netop din installation og dit projekt.',
  },
  {
    slug: 'brandisolering', name: 'Brandisolering', number: '04', label: 'BRAND',
    text: 'Brandisolering af tekniske installationer.',
    description: 'Brandisolering af tekniske installationer for private og erhverv. Tal med Aarhus ISO om din installation, projektets krav og opgavens omfang.',
    introduction: 'Brandisolering skal ses i sammenhæng med den konkrete installation og projektets krav. Vi starter derfor med en samtale om opgaven og det materiale, der beskriver den.',
    approach: 'Del gerne relevante tegninger, beskrivelser og projektspecifikationer. Det giver et bedre grundlag for at afklare arbejdsområdet og den ønskede udførelse, inden arbejdet aftales.',
    note: 'Vi tager udgangspunkt i opgavens konkrete grundlag og afstemmer omfang og detaljer med dig.',
  },
  {
    slug: 'teknisk-isolering', name: 'Teknisk isolering', number: '05', label: 'TEKNISK',
    text: 'Isolering af tekniske installationer for både private og erhverv.',
    description: 'Teknisk isolering for private og erhverv i hele Danmark. Aarhus ISO rådgiver om materialer og løsninger ud fra installationens behov.',
    introduction: 'Teknisk isolering tager udgangspunkt i installationens funktion og behov. Vi hjælper både private og erhverv med at få overblik over opgaven og de relevante isoleringsarbejder.',
    approach: 'Fortæl os om installationen og de forhold, isoleringen skal fungere under. Vi gennemgår opgavens omfang og rådgiver om materialer og løsninger ud fra det konkrete behov.',
    note: 'Vi arbejder med uddannede isolatører og lægger vægt på grundig udførelse og en ordentlig finish.',
  },
  {
    slug: 'koeleisolering', name: 'Køleisolering', number: '06', label: 'KØL',
    text: 'Isolering af kølerør og køleanlæg for at begrænse varmeoverførsel og forebygge kondens.',
    description: 'Køleisolering af kølerør og køleanlæg. Aarhus ISO rådgiver om isolering for at begrænse varmeoverførsel og forebygge kondens.',
    introduction: 'Kølerør og køleanlæg stiller særlige krav til isoleringen. Vi tager udgangspunkt i installationen og de omgivende forhold, når vi taler med dig om opgaven.',
    approach: 'Beskriv anlægget, rørføringen og eventuelle forhold omkring kondens. Relevante tegninger og oplysninger om driften hjælper med at afklare isoleringsopgaven.',
    note: 'Vi rådgiver om isoleringen med fokus på at begrænse varmeoverførsel og forebygge kondens i den konkrete installation.',
  },
  {
    slug: 'asbestsanering', name: 'Asbestsanering', number: '07', label: 'ASBEST',
    text: 'Sanering af asbestholdige materialer.',
    description: 'Asbestsanering hos Aarhus ISO. Kontakt os om sanering af asbestholdige materialer og få afklaret den konkrete opgave.',
    introduction: 'En opgave med asbestholdige materialer skal afklares ud fra de konkrete forhold. Kontakt os med en beskrivelse af materialerne, deres placering og det arbejde, du har brug for.',
    approach: 'Har du en materialeanalyse, undersøgelsesrapport eller anden dokumentation, kan den være relevant for den første afklaring. Vi taler med dig om opgavens omfang og det videre forløb.',
    note: 'Del gerne eksisterende billeder og dokumentation. Vi bruger beskrivelsen som udgangspunkt for en konkret gennemgang af opgaven.',
  },
];

const contactLink = (service) => `/kontakt/${service ? `?ydelse=${encodeURIComponent(service)}` : ''}`;
const button = (label, href, style = '') => `<a class="button ${style}" href="${href}">${label}${arrow}</a>`;
const kicker = (text) => `<p class="page-kicker"><span class="section-dot"></span>${text}</p>`;
const phoneLink = () => `<a href="${escapeHtml(FIRMA.telefonLink)}" data-field="telefon">${escapeHtml(FIRMA.telefon)}</a>`;
const emailLink = () => `<a href="mailto:${escapeHtml(FIRMA.email)}" data-field="email">${escapeHtml(FIRMA.email)}</a>`;
function breadcrumbs(current, service = false) {
  return `<nav class="breadcrumbs container" aria-label="Brødkrummesti"><a href="/">Forside</a><span aria-hidden="true">/</span>${service ? '<a href="/ydelser/">Ydelser</a><span aria-hidden="true">/</span>' : ''}<span aria-current="page">${escapeHtml(current)}</span></nav>`;
}
function serviceRows(current = '') {
  return services.map((service) => `<a class="service-row" href="/ydelser/${service.slug}/"${current === service.slug ? ' aria-current="page"' : ''}><span class="service-row-number">${service.number}</span><div class="service-row-main"><h2 class="service-row-title">${escapeHtml(service.name)}</h2><p class="service-row-copy">${escapeHtml(service.text)}</p></div><span class="service-row-arrow">${arrow}</span></a>`).join('\n');
}
function pageCta(title = 'Lad os tale om dit projekt', service = '') {
  return `<section class="page-cta container"><div><p class="page-kicker">KONTAKT</p><h2>${title}</h2><p>Ring eller skriv til os, hvis du vil have rådgivning eller et tilbud på dit projekt.</p></div><div class="page-cta-contacts">${phoneLink()}${emailLink()}${button('Fortæl om opgaven', contactLink(service))}</div></section>`;
}
function image(src = 'project-aluminium', caption = 'TEKNISK ISOLERING MED ØJE FOR DETALJEN') {
  return `<figure class="page-image"><img src="/images/client/${src}.webp" width="800" height="450" alt="Teknisk installation med isolering og pladebeklædning" loading="lazy" /><figcaption>${caption}</figcaption></figure>`;
}
function referenceCards() {
  return `<div class="reference-grid"><figure class="reference-card" id="hotel-angleterre"><div class="reference-logo"><img src="/images/client/hotel-angleterre.jpg" width="700" height="495" alt="Hotel d’Angleterre" loading="lazy" /></div><figcaption>Hotel d’Angleterre</figcaption></figure><figure class="reference-card" id="auh"><div class="reference-logo"><img src="/images/client/auh.png" width="1400" height="210" alt="Aarhus Universitetshospital (AUH)" loading="lazy" /></div><figcaption>Aarhus Universitetshospital (AUH)</figcaption></figure><figure class="reference-card" id="cityringen"><div class="reference-logo"><img src="/images/client/metro.png" width="500" height="281" alt="Metro" loading="lazy" /></div><figcaption>Cityringen (M3), København</figcaption></figure></div>`;
}

const pages = [
  {
    path: 'ydelser', name: 'Vores ydelser', type: 'services', title: 'Ydelser | Teknisk isolering | Aarhus ISO',
    description: `Rørisolering, ventilationsisolering, pladeisolering, brandisolering, teknisk isolering, køleisolering og asbestsanering. ${FIRMA.erfaring} års erfaring hos Aarhus ISO.`,
    content: `${breadcrumbs('Vores ydelser')}<section class="page-hero container">${kicker('VORES ARBEJDSOMRÅDER')}<h1 class="page-title">Isolering til din installation.</h1><p class="page-lead">Få overblik over vores ydelser. Vi rådgiver om materialer og løsninger ud fra installationens behov.</p></section><section class="service-list container" aria-label="Alle vores ydelser">${serviceRows()}</section><section class="page-grid container services-notes"><article class="editorial-panel"><p class="page-kicker">ERFARING OG FAGLIGHED</p><h2>${FIRMA.erfaring} års erfaring med teknisk isolering</h2><p>Vi bruger vores erfaring til at rådgive dig om, hvilken isolering der passer til din installation. Vi lægger vægt på en grundig udførelse og en ordentlig finish.</p></article><article class="editorial-panel"><p class="page-kicker">FOR PRIVATE OG ERHVERV</p><h2>Den rette løsning til opgaven</h2><p>Hos Aarhus ISO arbejder vi med uddannede isolatører. Fortæl os om installationen og dit projekt, så vi kan tage en konkret samtale om arbejdet.</p>${button('Kontakt Aarhus ISO', '/kontakt/')}</article></section>${pageCta()}`,
  },
  ...services.map((service) => ({
    path: `ydelser/${service.slug}`, name: service.name, type: 'service', title: `${service.name} | Aarhus ISO`, description: service.description,
    content: `${breadcrumbs(service.name, true)}<section class="page-hero container service-page-hero">${kicker(`${service.number} / ${service.label}`)}<h1 class="page-title">${escapeHtml(service.name)}</h1><p class="page-lead">${escapeHtml(service.text)}</p><div class="page-hero-actions">${button('Tal med os om opgaven', contactLink(service.name))}<span class="small-assurance">${check}Private &amp; erhverv</span></div></section><section class="page-grid container service-intro-grid">${image()}<article class="editorial-panel"><p class="page-kicker">TIL DIN INSTALLATION</p><h2>Vi tager udgangspunkt i din opgave</h2><p>${escapeHtml(service.introduction)}</p><p>${escapeHtml(service.note)}</p></article></section><section class="page-grid container service-approach-grid"><article class="editorial-panel"><p class="page-kicker">ET GODT UDGANGSPUNKT</p><h2>Fortæl os om dit projekt</h2><p>${escapeHtml(service.approach)}</p>${button('Lad os tale om projektet', contactLink(service.name), 'button-outline')}</article><aside class="editorial-panel"><p class="page-kicker">VORES ARBEJDSOMRÅDER</p><h2>Se vores øvrige ydelser</h2><nav class="related-services" aria-label="Alle ydelser">${services.map((item) => `<a href="/ydelser/${item.slug}/"${service.slug === item.slug ? ' aria-current="page"' : ''}><span>${item.number} / ${escapeHtml(item.name)}</span>${arrow}</a>`).join('')}</nav></aside></section>${pageCta('Lad os tale om dit projekt', service.name)}`,
  })),
  {
    path: 'om-os', name: 'Om Aarhus ISO', type: 'about', title: 'Om Aarhus ISO | Erfaring og faglighed i teknisk isolering',
    description: `${FIRMA.erfaring} års erfaring med teknisk isolering. Aarhus ISO arbejder med uddannede isolatører og udfører isolering for private og erhverv i hele Danmark.`,
    content: `${breadcrumbs('Om Aarhus ISO')}<section class="page-hero container">${kicker('OM AARHUS ISO')}<h1 class="page-title">Erfaring og faglighed i teknisk isolering</h1><p class="page-lead">${FIRMA.erfaring} års erfaring. Grundig rådgivning, grundig udførelse og en ordentlig finish.</p></section><section class="page-grid container about-story-grid"><article class="editorial-panel"><h2>Isolering til din installation</h2><p>Hos Aarhus ISO har vi mange års erfaring i isoleringsbranchen og arbejder med uddannede isolatører. Vi udfører teknisk isolering for både private og erhverv i hele Danmark.</p><p>Vi rådgiver om materialer og løsninger ud fra installationens behov og lægger vægt på grundig udførelse og en ordentlig finish.</p>${button('Se vores arbejdsområder', '/ydelser/')}</article>${image('project-aluminium', 'GRUNDIG UDFØRELSE OG EN ORDENTLIG FINISH')}</section><section class="references-section container"><p class="page-kicker">ERFARING I PRAKSIS</p><h2>Steder, vi har udført arbejde</h2>${referenceCards()}${button('Se referenceoversigten', '/referencer/', 'button-outline')}</section>${pageCta()}`,
  },
  {
    path: 'referencer', name: 'Referencer', type: 'references', title: 'Steder, vi har udført arbejde | Aarhus ISO',
    description: 'Steder, hvor Aarhus ISO har udført arbejde: Hotel d’Angleterre, Aarhus Universitetshospital (AUH) og Cityringen (M3) i København.',
    content: `${breadcrumbs('Referencer')}<section class="page-hero container">${kicker('ERFARING I PRAKSIS')}<h1 class="page-title">Steder, vi har udført arbejde</h1><p class="page-lead">Et udvalg af steder, hvor vi har udført arbejde med teknisk isolering.</p></section><section class="references-section container" aria-label="Referenceoversigt">${referenceCards()}</section><section class="page-grid container"><article class="editorial-panel"><p class="page-kicker">AARHUS ISO</p><h2>${FIRMA.erfaring} års erfaring med teknisk isolering</h2><p>Vi bruger vores erfaring til at rådgive dig om, hvilken isolering der passer til din installation. Vi lægger vægt på en grundig udførelse og en ordentlig finish.</p></article>${image('project-technical-room', 'TEKNISK ISOLERING FOR PRIVATE OG ERHVERV')}</section>${pageCta()}`,
  },
  {
    path: 'kontakt', name: 'Kontakt', type: 'contact', title: 'Kontakt Aarhus ISO | Ring eller skriv om dit projekt',
    description: `Kontakt Aarhus ISO på ${FIRMA.telefon} eller ${FIRMA.email}. Teknisk isolering for private og erhverv i hele Danmark.`,
    content: `${breadcrumbs('Kontakt')}<section class="contact-layout container" aria-labelledby="contact-title"><div class="contact-intro">${kicker('KONTAKT AARHUS ISO')}<h1 class="page-title" id="contact-title">Lad os tale om dit projekt</h1><p class="page-lead">Ring eller skriv til os, hvis du vil have rådgivning eller et tilbud på dit projekt.</p><div class="contact-details"><div class="contact-detail"><span>Telefon</span>${phoneLink()}</div><div class="contact-detail"><span>E-mail</span>${emailLink()}</div><div class="contact-detail"><span>Adresse</span><p><span data-field="adresse">${escapeHtml(FIRMA.adresse)}</span><br /><span data-field="postnummer">${escapeHtml(FIRMA.postnummer)}</span> <span data-field="by">${escapeHtml(FIRMA.by)}</span></p></div><div class="contact-detail"><span>CVR-nr.</span><p data-field="cvr">${escapeHtml(FIRMA.cvr)}</p></div></div></div><form class="contact-form" id="inquiry-form" aria-describedby="contact-preview-note"><p class="page-kicker">FORTÆL OM OPGAVEN</p><h2>Hvad kan vi hjælpe med?</h2><div class="form-row"><div class="form-field"><label for="name">Dit navn <span>*</span></label><input id="name" name="name" autocomplete="name" placeholder="Fornavn og efternavn" required maxlength="100" /></div><div class="form-field"><label for="company">Virksomhed <span class="optional">(valgfrit)</span></label><input id="company" name="company" autocomplete="organization" placeholder="Virksomhedens navn" maxlength="150" /></div></div><div class="form-row"><div class="form-field"><label for="email">E-mail <span>*</span></label><input id="email" type="email" name="email" autocomplete="email" placeholder="din@email.dk" required maxlength="200" /></div><div class="form-field"><label for="postcode">Opgavens postnummer <span>*</span></label><input id="postcode" name="postcode" autocomplete="postal-code" placeholder="F.eks. 8000" inputmode="numeric" pattern="[0-9]{4}" title="Skriv et dansk postnummer med fire cifre" required maxlength="4" /></div></div><div class="form-field"><label for="service">Hvad drejer opgaven sig om?</label><select id="service" name="service"><option value="Ikke valgt">Vælg et arbejdsområde</option>${services.map((service) => `<option>${escapeHtml(service.name)}</option>`).join('')}<option>Flere arbejdsområder / andet</option></select></div><div class="form-field"><label for="message">Kort om opgaven <span>*</span></label><textarea id="message" name="message" rows="4" placeholder="Fortæl lidt om installationen og det arbejde, du ønsker udført …" required minlength="10" maxlength="4000"></textarea></div><button class="button form-submit" type="submit">Gennemse din forespørgsel ${arrow}</button><p class="form-note" id="contact-preview-note">Gennemse forespørgslen, og åbn den som en e-mailkladde i dit mailprogram. Du sender selv beskeden. <a class="inline-button" href="/privatliv/">Om dine oplysninger</a></p></form></section><dialog class="info-dialog" id="inquiry-dialog" aria-labelledby="inquiry-dialog-title"><button class="dialog-close" type="button" data-close aria-label="Luk forespørgsel"><svg class="icon"><use href="#icon-close"/></svg></button><p class="page-kicker">DIN FORESPØRGSEL</p><h2 id="inquiry-dialog-title">Klar til dit mailprogram</h2><p>Gennemse oplysningerne nedenfor. Når du åbner e-mailkladden, overføres de til dit mailprogram. <strong>Beskeden bliver først sendt, når du selv sender den.</strong></p><dl class="inquiry-summary" id="inquiry-summary"></dl><div class="dialog-actions"><a class="button" id="email-inquiry" href="mailto:${escapeHtml(FIRMA.email)}">Åbn e-mailkladde ${arrow}</a><button class="button button-outline" id="download-inquiry" type="button">Gem som tekstfil</button><button class="text-link" type="button" data-close>Ret oplysninger</button></div></dialog>`,
  },
  {
    path: 'privatliv', name: 'Privatliv', type: 'privacy', title: 'Privatliv og kontaktformular | Aarhus ISO',
    description: 'Læs om kontaktformular, e-mailkladder og lokal download hos Aarhus ISO. Du vælger selv, hvornår du sender din forespørgsel.',
    content: `${breadcrumbs('Privatliv')}<section class="page-hero container">${kicker('PRIVATLIV')}<h1 class="page-title">Dine oplysninger</h1><p class="page-lead">Her kan du læse, hvordan kontaktformularen og e-mailkladden fungerer.</p></section><section class="page-grid container privacy-grid"><article class="editorial-panel"><h2>Kontaktformularen</h2><p>Oplysningerne, du skriver i formularen, bruges til at gøre din forespørgsel klar i din browser. Formularen sender ikke automatisk en besked og gemmer ikke indholdet i et formularsystem på en server.</p><p>Du kan gennemse forespørgslen og vælge at åbne den i dit eget mailprogram eller gemme den som tekstfil på din enhed.</p></article><article class="editorial-panel"><h2>Når du åbner en e-mailkladde</h2><p>Hvis du vælger at åbne kladden, overføres oplysningerne til dit mailprogram. Beskeden bliver først sendt til Aarhus ISO, når du selv sender den.</p><p>Dit mailprogram og din mailudbyder behandler kladden efter deres egne indstillinger og vilkår. En henvendelse, som du sender, indeholder de kontakt- og opgaveoplysninger, du vælger at dele.</p></article><article class="editorial-panel"><h2>Lokal download og cookies</h2><p>Hvis du gemmer forespørgslen som tekstfil, downloades den til din egen enhed. Opbevar og slet filen som andre dokumenter med dine kontaktoplysninger.</p><p>Hjemmesiden bruger ikke analyse- eller marketingcookies. Skrifter og billeder leveres sammen med siden. Formularen gemmer ikke indholdet i browserens lokale lager; din browser kan have egne funktioner til autofuldførelse.</p></article><article class="editorial-panel"><h2>Kontakt Aarhus ISO</h2><p>Har du spørgsmål til din henvendelse, kan du kontakte os direkte.</p><div class="contact-details"><div class="contact-detail"><span>E-mail</span>${emailLink()}</div><div class="contact-detail"><span>Telefon</span>${phoneLink()}</div><div class="contact-detail"><span>Adresse</span><p><span data-field="adresse">${escapeHtml(FIRMA.adresse)}</span><br /><span data-field="postnummer">${escapeHtml(FIRMA.postnummer)}</span> <span data-field="by">${escapeHtml(FIRMA.by)}</span></p></div><div class="contact-detail"><span>CVR-nr.</span><p data-field="cvr">${escapeHtml(FIRMA.cvr)}</p></div></div></article></section>`,
  },
];

const header = shared('shared-header');
const footer = shared('shared-footer');
const dialogs = shared('shared-dialogs');
const sprite = shared('icon-sprite');

for (const page of pages) {
  const route = `/${page.path}/`;
  const activeHeader = header.replace(/<a\b([^>]*\bhref="([^"]+)"[^>]*)>/g, (match, attributes, href) => href === route ? `<a${attributes} aria-current="page">` : match);
  let html = `<!doctype html>
<html lang="da">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#102a43" />
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
  const tokens = {
    __FIRMA_TELEFON__: FIRMA.telefon, __FIRMA_TELEFONLINK__: FIRMA.telefonLink,
    __FIRMA_EMAIL__: FIRMA.email, __FIRMA_ADRESSE__: FIRMA.adresse,
    __FIRMA_POSTNUMMER__: FIRMA.postnummer, __FIRMA_BY__: FIRMA.by,
    __FIRMA_CVR__: FIRMA.cvr, __FIRMA_ERFARING__: FIRMA.erfaring, __FIRMA_NAVN__: FIRMA.navn,
  };
  for (const [token, value] of Object.entries(tokens)) html = html.replaceAll(token, escapeHtml(value));
  const directory = resolve(root, page.path);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), html, 'utf8');
  console.log(`Genereret: ${page.path}/index.html`);
}
