# AGENTS.md

Instruktioner til Codex, ChatGPT og andre AI-agenter, der arbejder i dette repo.
Læs denne fil, før du ændrer noget.

## Hvad er projektet

Hjemmeside for **Aarhus Iso**, en isoleringsvirksomhed i Aarhus-området.
Målet er en enkel, hurtig og mobilvenlig side, der skaffer forespørgsler fra
private boligejere, boligforeninger og mindre erhverv.

Primær handling på siden: besøgende ringer eller udfylder tilbudsformularen.

## Teknisk ramme

- Statisk site: almindelig HTML, CSS og vanilla JavaScript. **Ingen** build-proces,
  ingen framework, ingen npm-afhængigheder.
- Alle filer ligger i roden, så siden kan åbnes direkte i en browser og
  hostes hvor som helst (Simply.com, GitHub Pages, Netlify, almindelig webhost).
- Ingen eksterne scripts eller webfonte uden at det aftales først. Ingen
  tracking, analytics eller cookies uden et samtykkebanner, der overholder
  cookiebekendtgørelsen.
- Siden skal virke uden JavaScript for så vidt angår indhold og navigation.

## Filer

| Fil | Indhold |
| --- | --- |
| `index.html` | Hele forsiden: header, hero, ydelser, fordele, proces, kontakt, footer |
| `style.css` | Alt styling. Farver og mål styres af CSS-variabler i `:root` |
| `app.js` | Mobilmenu, årstal, formular og objektet `FIRMA` med kontaktoplysninger |
| `robots.txt` | Tillader indeksering, peger på sitemap |
| `AGENTS.md` | Denne fil |

## Konventioner

- Alt synligt indhold er på **dansk**. Korrekt dansk tegnsætning, æ, ø og å.
- **Ingen tankestreger (—) i tekst.** Brug komma, kolon eller punktum.
- CSS-klasser på engelsk og i små bogstaver med bindestreg (`.hero-card`).
  Funktioner og variabler i JavaScript på dansk (`opsaetMenu`).
- Nye farver, afstande og radier tilføjes som variabler i `:root`, ikke som
  hardkodede værdier ude i filen.
- Kontaktoplysninger må kun stå ét sted i koden: objektet `FIRMA` i `app.js`.
  I HTML markeres de med `data-field="telefon|email|adresse"`.
- Tilgængelighed: semantiske elementer, synligt fokus, labels på alle felter,
  kontrast mindst 4,5:1. Ødelæg det ikke.
- Responsivt: skal se rigtigt ud fra 320 px bredde og op. Breakpoints findes
  i bunden af `style.css` (960, 760 og 560 px).

## Firmaoplysninger

Registreret i CVR (verificeret 15. november 2026):

- Navn: Aarhus Iso
- CVR-nr.: 45788040
- Virksomhedsform: enkeltmandsvirksomhed
- Stiftet: 5. august 2025
- Hovedbranche: 432300 Installation af isolering
- Registreret adresse: Engbakken 48, 8471 Sabro

## TODO, skal rettes før siden sættes i luften

Felterne nedenfor står med pladsholdere i koden. **Du må ikke gætte dem.**
Spørg ejeren, hvis de ikke er oplyst.

- [ ] Telefonnummer (`FIRMA.telefon` og `FIRMA.telefonLink` i `app.js`)
- [ ] E-mailadresse (`FIRMA.email`)
- [ ] Hvilken adresse der skal stå på siden (registreret adresse eller en anden)
- [ ] Rigtigt domæne i `<link rel="canonical">` og `robots.txt`
- [ ] Rigtig modtager eller endpoint på tilbudsformularen (den åbner i dag
      blot brugerens mailprogram)
- [ ] Logo og billeder fra egne opgaver
- [ ] Privatlivspolitik, hvis formularen begynder at gemme data

## Må ikke

- Opdigt ikke anmeldelser, kundeudtalelser, certificeringer, garantier,
  medlemskaber, antal udførte opgaver eller årstal for erfaring. Kun det,
  ejeren har oplyst, må stå på siden.
- Brug ikke billeder fra nettet uden klar licens. Ingen fotos af navngivne
  personer.
- Lov ikke bestemte besparelser eller tilskud som et konkret løfte. Tal om
  besparelser skal være formuleret som typiske erfaringstal, som i dag.
- Fjern ikke navn, adresse og CVR-nummer fra footeren. De skal fremgå af
  en erhvervsside efter markedsføringsloven og e-handelsloven.

## Tjek før du afleverer

1. Åbn `index.html` i browseren og kontroller 360 px, 768 px og 1440 px bredde.
2. Tjek at mobilmenuen åbner og lukker, og at links lukker den igen.
3. Tjek at telefon, e-mail og adresse er ens overalt på siden.
4. Ingen fejl i browserens konsol.
