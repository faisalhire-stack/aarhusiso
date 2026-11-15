# Aarhus ISO

Hjemmesiden følger kundens eget PDF-udkast med en finpudset, responsiv implementering: delt hero med stort logo, mintgrønne sektioner, referencebjælke, syv ydelseskort, blåt kontaktfelt og blå footer.

Kundens layout og materiale er designgrundlaget. Se [DESIGN.md](DESIGN.md), før den visuelle retning ændres.

## Kør lokalt

Afprøvet med Node.js 24 og npm 11. Brug det eksisterende checkout; opret ikke en særskilt Git-worktree uden en konkret anmodning.

```sh
npm ci
npm run dev
```

Serveren bruger port 3000. Projektet er statisk HTML, CSS og vanilla JavaScript med Vite som udviklings- og byggeværktøj. Ingen eksterne skrifter, tracking eller billedtjenester bruges på siden.

## Indhold og kontakt

- `index.html`: forside og fælles navigation/footer.
- `src/company.js`: firmaets navn, telefon, e-mail, adresse, CVR og erfaring. Dette er den fælles kilde til kontaktoplysninger.
- `scripts/generate-pages.mjs`: de 12 undersider. Genereres ved start og build.
- `src/style.css`: farver, layout og responsive regler.
- `src/main.js`: mobilmenu, diskret logoanimation og formularens e-mailkladde/download.
- `public/images/client/`: billeder og referencelogoer udtrukket af kundens PDF-materiale.

Forsidens `__FIRMA_*__`-felter erstattes af Vite med data fra `src/company.js`. De færdige sider har læsbare firmaoplysninger, indhold og navigation, også uden JavaScript.

## Logo

- `public/images/client/logo.svg`: ægte vektorkonturer, ingen indlejret bitmap.
- `public/images/client/logo.png`: transparent PNG på 2000 × 1421 px.
- `public/images/client/logo-mark.svg`: ringmærke, også brugt som favicon.

Kildens PDF-logo er raster. Navnetrækket er vektoriseret efter de oprindelige bogstaver; ringene er opmålt, og den lille undertitel er renskrevet som konturer. Filerne er en rekonstrueret vektorudgave, ikke en original Illustrator-fil. Logoanimationen flytter kun ringene diskret og respekterer reduceret bevægelse.

## Build og browserfil

```sh
npm run build
npm run preview
npm run export:preview
```

`dist/` indeholder det normale produktionsbuild. Stop udviklingsserveren før preview, eller brug `npm run preview -- --port 3001`.

Eksporten opretter `/workspace/aarhusiso-kundens-design.html` med indlejrede billeder, skrifter, styling og JavaScript. Filen har navigation mellem alle 13 sider og kræver ingen netadgang. En anden sti kan gives til `node scripts/export-preview.mjs /sti/preview.html` efter build.

## GitHub Pages

```sh
npm run build:pages
```

`dist-pages/` bruger projektstien `/aarhusiso/` i navigation, billeder, skrifter og kontaktlinks. Almindelige builds og offline-eksporten bruger `/`.

De færdige webfiler kan publiceres på repositoryets separate `gh-pages`-gren. GitHubs `main` ændres ikke. Under **Settings > Pages** vælges **Deploy from a branch**, grenen **gh-pages**, mappen **/ (root)**. Den forventede adresse er `https://faisalhire-stack.github.io/aarhusiso/`, når Pages er aktiveret og har færdiggjort publiceringen.

## Kontaktfunktion og lancering

Telefon- og e-maillinks bruger kundens leverede kontaktoplysninger. Formularen validerer og viser en oversigt, hvorefter brugeren selv kan åbne en udfyldt e-mailkladde i sit mailprogram eller downloade en tekstfil. Siden hævder ikke, at beskeden er sendt, og lagrer ikke formularindhold på en server.

Previewet har `noindex` og `robots.txt` med `Disallow: /`. Ved endelig lancering skal det ændres bevidst på det korrekte domæne sammen med canonical, sitemap og eventuel Search Console-verificering.

## Validering

Produktionsbuild og de 13 sider er afprøvet i Chromium ved 320, 390, 768 og 1440 px. Browserkontrollen dækker navigation, kontaktlinks, de syv ydelser, referenceankre, logoanimation, formularvalidering, sikker tekstvisning og download. Telefon- og e-maillinks inspiceres under test og aktiveres ikke automatisk. Automatiske tilgængelighedstjek suppleres af manuel kontrol af tastatur og mobilmenu.
