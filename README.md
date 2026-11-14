# aarhusiso

Hjemmeside for **Aarhus Iso**, isolering og efterisolering i Aarhus og omegn.
CVR 45788040.

Statisk side uden build-proces: HTML, CSS og vanilla JavaScript.

## Kør lokalt

```bash
# enten: åbn index.html direkte i browseren
# eller start en lille server, så relative stier opfører sig som på nettet
python3 -m http.server 8000
# åbn http://localhost:8000
```

## Filer

- `index.html` forsiden
- `style.css` styling, farver styres af variabler i `:root`
- `app.js` mobilmenu, formular og objektet `FIRMA` med kontaktoplysninger
- `robots.txt` søgemaskiner
- `AGENTS.md` instruktioner til Codex og andre AI-agenter

## Ret kontaktoplysninger

Alt står i `FIRMA` øverst i `app.js`. Ret der, så opdateres både hero,
kontaktsektion og footer.

## Hvad mangler

Se TODO-listen i [AGENTS.md](AGENTS.md): telefon, e-mail, domæne,
formular-endpoint, logo og billeder.

## Deploy

Siden er ren statisk og kan lægges op med FTP hos en almindelig webhost
(fx Simply.com), eller sættes op via GitHub Pages, Netlify eller Cloudflare Pages
uden ændringer i koden.
