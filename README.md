# Aarhus ISO

Anden designversion af Aarhus ISO's hjemmeside. En grafisk hjemmeside med et interaktivt 3D-rør, liquid glass, selvhostet typografi og ni selvstændige sider. Bygget med HTML, CSS, JavaScript, Three.js og Vite.

## Udvikling

Afprøvet med Node.js 24 og npm 11. Brug det eksisterende checkout; en særskilt Git-worktree er ikke nødvendig.

```sh
cd /workspace/aarhusiso
npm ci
npm run dev
```

Udviklingsserveren bruger port 3000. De otte undersider genereres fra `scripts/generate-pages.mjs`, der deler navigation og footer med forsiden. Ret den fælles HTML i `index.html` og ydelsesteksterne i generatoren; de genererede ydelsesfiler overskrives ved start og build.

## Build og forhåndsvisning

```sh
npm run build
npm run preview
```

Build ligger i `dist/`. Stop udviklingsserveren før preview, eller brug `npm run preview -- --port 3001`.

```sh
npm run export:preview
```

Eksporterer også `/workspace/aarhusiso-v2.html`: en selvstændig HTML-fil med indlejrede billeder, skrifter, styling og JavaScript. Den kræver ingen netværksadgang. Forhåndsvisningen navigerer mellem ni fulde sider med hash-ruter og understøtter browserens tilbage-/frem-knapper. Webversionen bruger selvstændige URL-adresser. En alternativ eksportsti kan gives til `node scripts/export-preview.mjs /ønsket/sti.html` efter build.

## Funktioner i anden version

- Interaktiv Three.js-model: træk, tastatur, drejeknapper samt metal-, glas- og lagvisning.
- Liquid glass med sløring, lysreflekser og responsive layouts.
- Separate sider til forside, ydelsesoversigt, fire ydelser, om firmaet, kontakt og privatliv.
- Mobilnavigation og tastaturbetjente dialoger.
- Kontaktknapper med forudvalgt ydelse på den selvstændige kontaktside.
- Formularvalidering, gennemgang af forespørgsel og download som tekstfil.
- Privatlivs- og billedinformation uden marketingcookies eller eksterne skrifter.
- Danske metadata, semantiske overskrifter og optimerede WebP-billeder.

## Før lancering

- Formularen sender **ikke** e-mail. Indholdet behandles i browseren og kan downloades. Tilslut en reel modtager og afprøv levering, fejl og spambeskyttelse før lancering.
- Logoet i `public/images/brand-preview.svg` er en midlertidig gengivelse af skærmbilledet. Erstat det med virksomhedens originale logofil. Favicon er ligeledes et foreløbigt mærke baseret på ringmotivet.
- 3D-modellen er en grafisk illustration; materialer og lag er ikke specifikationer for en konkret isoleringsløsning. Ved manglende WebGL vises et statisk 3D-billede.
- Billederne er AI-genererede illustrationer, tydeligt beskrevet i sidens billedinformation. De må ikke præsenteres som virksomhedens egne udførte projekter. Erstat med egne fotos, når de foreligger.
- Asbestsanering er angivet som kommende ydelse.
- Testversionen har `noindex` og `robots.txt` med `Disallow: /`. Ved lancering på det endelige domæne skal dette ændres bevidst; tilføj korrekte canonical-adresser, sitemap, virksomhedsdata og eventuel Search Console-verificering.
- Indsæt og bekræft kontaktoplysninger. Der er ikke opfundet telefonnummer, e-mail, kundeanmeldelser eller projektcases.

## Validering

Produktionsbuild er afprøvet. Browserkontrol i Chromium dækker mobil og desktop, de fire ydelsessider, navigation, formularvalidering, lokal download og dialogfokus. Layout er kontrolleret ved 320, 390, 768 og 1440 px. Tilgængelighed er kontrolleret med axe-core på forside, ydelsesoversigt, en repræsentativ ydelsesside, om firmaet og kontakt; en automatisk kontrol erstatter ikke en fuld manuel tilgængelighedsvurdering.

## 3D og bevægelse

`src/pipe-scene.js` opretter modellen lokalt uden eksterne modeller eller teksturer. Refleksionerne genereres med et lokalt studiemiljø. Modellen stopper uden for skærmen og når fanen er skjult, og respekterer reduceret bevægelse. `src/main.js` har `mount`/`unmount`, så offline-navigation rydder grafikressourcer op, før en ny side åbnes.

## GitHub Pages

```sh
npm ci
npm run build:pages
```

GitHub Pages-versionen ligger i `dist-pages/`. Den bruger projektstien `/aarhusiso/`, også i navigation, billeder, skrifter og kontaktlinks. Almindelige builds og offline-eksporten bevarer rodstien `/`.

De færdige filer publiceres i repositoryets separate `gh-pages`-gren. Det er en statisk webversion uden krav om build på GitHub. GitHubs `main`-gren ændres ikke af denne publicering.

Aktivér den i repositoryets **Settings > Pages**: vælg **Deploy from a branch**, grenen **gh-pages**, mappen **/ (root)**, og gem. Den forventede adresse er `https://faisalhire-stack.github.io/aarhusiso/`. Adressen er først aktiv, når GitHub har aktiveret og færdiggjort Pages-publiceringen.

Dette er fortsat en designforhåndsvisning med `noindex`, illustrative billeder og en formular uden e-mailafsendelse.
