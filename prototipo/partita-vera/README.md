# Prototipo «partita vera» (Fase 2)

Prototipo separato: il gioco (`CARRIER-MANAGER-AV.html`, `src/`) non viene toccato.

| File | Cosa fa |
|---|---|
| `genera.mjs` | Genera `motore-v2.js` da `src/14-motore-possesso.jsx` applicando patch con nome (V2-0…V2-13). Ogni patch cerca un testo esatto e fallisce se il gioco cambia. In Fase 3 le stesse patch entrano nel gioco. |
| `motore-v2.js` | Generato, non modificare a mano. Con `cfg.v2` falso si comporta come il motore di oggi (il «rosso»). |
| `partita.js` | La partita: un solo oggetto per simulazione rapida e vista 3D. 22 battiti al minuto, tempi e recupero, cambi, fotogrammi, stream eventi, impronta. |
| `banco.mjs` | 1000 partite per scenario contro le bande di 4.337 partite vere (football-data.co.uk, Serie A/Premier/LaLiga/Bundesliga 2022-2025), regole «niente di impossibile», determinismo su 20 semi. `--vecchio` = motore di oggi, deve andare rosso. |
| `index.html` + `vista.js` | Vista 3D verticale (Three.js r128, corpi CGTrader lod2) che legge SOLO fotogrammi ed eventi. HUD, nomi e ruoli, scelta dell'eroe, gesti, replay dei gol dagli stessi fotogrammi, contatore FPS. |
| `sonda.mjs` | Collaudo headless della vista (console, Three r128, scelta, impronte identiche, etichette). Gli FPS headless non valgono per il telefono. |

```bash
node prototipo/partita-vera/genera.mjs
node prototipo/partita-vera/banco.mjs 1000          # verde atteso
node prototipo/partita-vera/banco.mjs 200 --vecchio  # rosso atteso
cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node ../../prototipo/partita-vera/sonda.mjs
```

Parametri della pagina: `?seed=` `&casa=SIG:forza:#colore1:#colore2` `&osp=…` `&lato=home|away` `&ora=giorno|sera` `&da=MINUTO` `&lod=1` `&fps=0`.
