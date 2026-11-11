#!/usr/bin/env node
/* [giro 150 · PO-352 «Finestra centrata col velo»] GUARDIANO finestre-150 (non-gate, catena grafica).
   Foto PO 188 (PC ~1351x703): l'intervista settimanale stava al centro SENZA velo, la home leggibile ai lati, la finestra alta fino
   in fondo con la meta' inferiore vuota. Decisione PO: velo scuro su tutta la pagina, finestra alta quanto il contenuto e centrata
   in verticale, un po' piu' larga, come le altre finestre su PC.
   Per ogni finestra censita (interviste settimanale / pre-partita / post-partita, offerta, procuratore, privacy, figurina) e per ogni
   formato (PC 1366x768, 1440x900, 1920x1080, tablet 1024x768 e 768x1024; telefono 360x800 solo non-regressione) misura:
   · VELO: luminanza media di due strisce della home (a sinistra e a destra della finestra) con la finestra aperta, contro le stesse
     strisce a finestra chiusa → riduzione >= SOGLIA_VELO (su PC/tablet). Le strisce si leggono dallo screenshot, non dagli stili.
   · VUOTO IN BASSO: distanza fra il fondo dell'ultimo figlio visibile del pannello e il fondo del pannello <= SOGLIA_VUOTO px.
   · CENTRATURA: |spazio sopra - spazio sotto| <= SOGLIA_CENTRO px (quando il pannello e' piu' basso dello schermo).
   · NIENTE TAGLI: pannello dentro lo schermo (top >= 0, bottom <= innerHeight); se il contenuto e' piu' alto, scorrimento interno.
   · LARGHEZZA: su PC >= LARGH_MIN px.
   Telefono: le stesse misure sono stampate e confrontate fra verde e rosso (impronta): devono essere identiche (telefono invariato).
   ROSSO: __CPM_NO_G150 (le finestre di prima) — deve cadere. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: F150_BRACCI=verde,rosso  F150_FORMATI=pc1366,...  F150_FINESTRE=ivSett,...  F150_FOTO=<cartella>  F150_SOLO_MISURA=1 (censimento) */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, SAVE, INIT } from './c178-graf-lib.mjs';
const BRACCI = (process.env.F150_BRACCI || 'verde,rosso').split(',');
const FOTO = process.env.F150_FOTO || ''; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const SOLO_MISURA = !!process.env.F150_SOLO_MISURA;
const FORMATI = {
  pc1366: { w: 1366, h: 768, touch: false, pc: true },
  pc1440: { w: 1440, h: 900, touch: false, pc: true },
  pc1920: { w: 1920, h: 1080, touch: false, pc: true },
  tabO: { w: 1024, h: 768, touch: true, pc: false },
  tabV: { w: 768, h: 1024, touch: true, pc: false },
  tel: { w: 360, h: 800, touch: true, pc: false, tel: true },
};
const SCELTI = (process.env.F150_FORMATI || Object.keys(FORMATI).join(',')).split(',').filter(k => FORMATI[k]);
/* soglie fissate DOPO la misura (vedi docs/sviluppo/RAPPORTO-giro150.md) */
const SOGLIA_VELO = 0.75;   /* la home sotto il velo perde almeno il 75% della luminanza (prima: 0,43-0,67; foto PO a 0,60 «senza velo») */
const SOGLIA_VUOTO = 48;    /* px di vuoto ammessi fra l'ultimo contenuto e il fondo del pannello */
const SOGLIA_CENTRO = 24;   /* px di scarto fra spazio sopra e spazio sotto */
const LARGH_MIN = 480;      /* su PC la finestra e' «un po' piu' larga» delle 420 di prima */
/* apertura di ogni finestra dalla home (hook di prova gia' esistenti, nessuno nuovo nel gioco) */
const FINESTRE = {
  ivSett: { nome: 'Intervista settimanale', sel: '[data-cpm="intervista231"]', apri: p => p.evaluate(() => window.__CPM_CAREER.forceInterview('weekly')) },
  ivPre: { nome: 'Conferenza pre-partita', sel: '[data-cpm="intervista231"]', apri: p => p.evaluate(() => window.__CPM_CAREER.forceInterview('prematch')) },
  ivPost: { nome: 'Intervista post-partita (scena)', sel: '[data-cpm="intervista231"]', scena: true, apri: p => p.evaluate(() => window.__CPM_CAREER.forceInterview('win')) },
  offerta: { nome: 'Offerta di trasferimento', sel: null, apri: p => p.evaluate(() => window.__CPM_CAREER.forceOffer()) },
  procuratore: { nome: 'Primo incontro col procuratore', sel: null, apri: p => p.evaluate(() => window.__CPM_CAREER.apriIntro253()) },
  privacy: { nome: 'Informativa sulla privacy (Opzioni)', sel: null, apri: async p => { const bt = await p.$('button[title="Impostazioni"]'); if (!bt) return 'tasto Opzioni assente'; await bt.click(); await sleep(700); const v = await p.$('[data-cpm="privacy118"]'); if (!v) return 'voce privacy assente'; await v.click(); await sleep(700); return (await p.$('[data-cpm="privacy134-pannello"]')) ? true : 'finestra privacy assente'; } },
};
const SCELTE_F = (process.env.F150_FINESTRE || Object.keys(FINESTRE).join(',')).split(',').filter(k => FINESTRE[k]);

/* dentro la pagina: trova lo strato a schermo intero (fixed, inset 0, z alto) e il pannello visibile piu' grande dentro di esso */
function MISURA(sel) {
  const W = document.documentElement.clientWidth, H = innerHeight;
  const vis = e => { const c = getComputedStyle(e); if (c.display === 'none' || c.visibility === 'hidden' || +c.opacity < 0.05) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  let strato = sel ? document.querySelector(sel) : null;
  if (!strato) { const c = [...document.querySelectorAll('body *')].filter(e => { const s = getComputedStyle(e); if (s.position !== 'fixed') return false; const r = e.getBoundingClientRect(); return r.left <= 1 && r.top <= 1 && r.width >= W - 2 && r.height >= H - 2 && (+s.zIndex || 0) >= 9000 && vis(e); });
    strato = c.sort((a, b) => (+getComputedStyle(b).zIndex || 0) - (+getComputedStyle(a).zIndex || 0))[0] || null; }
  if (!strato) return null;
  /* pannello: il figlio diretto (o nipote) con lo sfondo opaco piu' grande, non a schermo intero */
  const cand = [...strato.querySelectorAll('*')].filter(e => { if (!vis(e)) return false; const r = e.getBoundingClientRect(); if (r.width >= W - 2 && r.height >= H - 2) return false; if (r.width < 200 || r.height < 80) return false; const bg = getComputedStyle(e).backgroundColor; const m = /rgba?\(([^)]+)\)/.exec(bg); if (!m) return false; const p = m[1].split(',').map(Number); return p.length < 4 || p[3] > 0.85; });
  cand.sort((a, b) => { const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect(); return rb.width * rb.height - ra.width * ra.height; });
  const pan = cand[0]; if (!pan) return { strato: true, pannello: null };
  const r = pan.getBoundingClientRect();
  /* fondo del contenuto: il piu' basso fra i discendenti visibili con altezza > 0 (in coordinate del contenuto scorrevole) */
  let fondo = r.top; const sc = pan.scrollTop || 0;
  for (const e of pan.querySelectorAll('*')) { if (!vis(e)) continue; const q = e.getBoundingClientRect(); if (q.height <= 0) continue; if (q.bottom + sc > fondo) fondo = q.bottom + sc; }
  const pad = parseFloat(getComputedStyle(pan).paddingBottom) || 0;
  const altoCont = pan.scrollHeight > pan.clientHeight + 2;
  const sbg = getComputedStyle(strato).backgroundColor;
  return { strato: true, pannello: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), sotto: Math.round(H - r.bottom),
    vuoto: altoCont ? 0 : Math.max(0, Math.round(r.bottom - fondo - pad)), scorre: altoCont, scorrevole: /auto|scroll/.test(getComputedStyle(pan).overflowY), velo: sbg }, W, H };
}
/* luminanza media (0..1) di una striscia dello screenshot: si legge l'immagine nella pagina stessa */
async function luminanze(page, png, rects) {
  return page.evaluate(async ([b64, rr]) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    return rr.map(([x, y, w, h]) => { if (w < 4 || h < 4) return null; const d = g.getImageData(x, y, w, h).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 16) { s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; } return s / n / 255; }); }, [png.toString('base64'), rects]);
}

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const risultati = {}; const errsAll = [];
for (const braccio of BRACCI) {
  const rosso = braccio === 'rosso'; risultati[braccio] = [];
  for (const fk of SCELTI) {
    const f = FORMATI[fk]; const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1 }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
    for (const wk of SCELTE_F) {
      const fin = FINESTRE[wk]; const motivo = []; const errs = [];
      const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page);
      page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
      await page.addInitScript(INIT, { seme: 4242, tema: 'chiaro', rossi: rosso ? ['__CPM_NO_G150'] : [], save: SAVE });
      await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
      await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
      await sleep(1200);
      try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { motivo.push('non giudicato (Continua non trovato)'); }
      const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
      if (!vivo) motivo.push('non giudicato (carriera non montata)');
      let m = null, L0 = null, L1 = null;
      if (vivo) {
        await sleep(1500); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
        await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' }); await sleep(500);
        const prima = await page.screenshot();
        const ok = await fin.apri(page).catch(e => 'err ' + e.message);
        await sleep(1600);
        m = await page.evaluate(MISURA, fin.sel);
        if (ok !== true) motivo.push(`non giudicato (apertura: ${JSON.stringify(ok)})`);
        else if (!m || !m.pannello) motivo.push('non giudicato (finestra non trovata)');
        else {
          const p = m.pannello; const dopo = await page.screenshot();
          if (FOTO) fs.writeFileSync(path.join(FOTO, `f150-${braccio}-${fk}-${wk}.png`), dopo);
          /* strisce della home a sinistra e a destra del pannello (a meta' altezza della parte alta, fuori dalla scena 2D della mixed zone) */
          const lx = Math.max(0, Math.min(p.x - 8, 260)), rx0 = p.x + p.w + 8, rw = Math.max(0, Math.min(m.W - rx0, 260));
          const ys = Math.round(m.H * (fin.scena ? 0.36 : 0.2)), hs = Math.round(m.H * (fin.scena ? 0.55 : 0.6));/* con la scena della sala stampa le strisce stanno sotto la scena */
          const rects = [[Math.max(0, p.x - 8 - lx), ys, lx, hs], [rx0, ys, rw, hs]];
          L0 = await luminanze(page, prima, rects); L1 = await luminanze(page, dopo, rects);
          const rid = [0, 1].map(i => (L0[i] != null && L0[i] > 0.02) ? 1 - L1[i] / L0[i] : null).filter(x => x != null);
          m.riduzione = rid.length ? +Math.min(...rid).toFixed(3) : null;
          if (!f.tel) {
            if (m.riduzione == null) motivo.push('non giudicato (nessuna striscia di home ai lati della finestra)');
            else if (m.riduzione < SOGLIA_VELO) motivo.push(`velo debole: la home ai lati perde solo il ${Math.round(m.riduzione * 100)}% di luce (< ${SOGLIA_VELO * 100}%)`);
            {
              const sopra = fin.scena ? p.y - Math.round(m.H * 0.31) : p.y;/* con la scena (31% alto) si centra nello spazio libero SOTTO la scena */
              if (p.vuoto > SOGLIA_VUOTO) motivo.push(`vuoto in basso ${p.vuoto}px (> ${SOGLIA_VUOTO})`);
              if (!p.scorre && Math.abs(sopra - p.sotto) > SOGLIA_CENTRO) motivo.push(`non centrata: sopra ${sopra}px, sotto ${p.sotto}px`);
              if (f.pc && p.w < LARGH_MIN) motivo.push(`stretta: ${p.w}px (< ${LARGH_MIN})`);
            }
            if (p.y < 0 || p.sotto < 0) motivo.push(`tagliata: top ${p.y}, sotto ${p.sotto}`);
            if (p.scorre && !p.scorrevole) motivo.push('contenuto piu\' alto della finestra senza scorrimento interno');
          }
        }
      }
      if (errs.length) motivo.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
      const riga = { braccio, fk, wk, m: m && m.pannello ? { ...m.pannello, riduzione: m.riduzione } : null, motivo };
      risultati[braccio].push(riga);
      console.log(`${braccio.padEnd(5)} ${fk.padEnd(6)} ${wk.padEnd(11)} ${riga.m ? `pan ${riga.m.w}x${riga.m.h} @${riga.m.x},${riga.m.y} sotto ${riga.m.sotto} vuoto ${riga.m.vuoto} scorre ${riga.m.scorre} velo ${riga.m.velo} riduz ${riga.m.riduzione}` : '—'} ${motivo.length ? '✗ ' + motivo.join(' · ') : '✓'}`);
      await ctx.close();
    }
  }
}
await b.close(); srv.close();
if (SOLO_MISURA) process.exit(0);
const out = [];
const V = risultati.verde || [], R = risultati.rosso || [];
const vKo = V.filter(r => r.motivo.length), rKo = R.filter(r => !FORMATI[r.fk].tel && r.motivo.some(x => !/non giudicato/.test(x)));
/* telefono invariato: impronta delle misure verde == rosso */
const imp = rr => rr.filter(r => FORMATI[r.fk].tel).map(r => `${r.wk}:${r.m ? [r.m.x, r.m.y, r.m.w, r.m.h].join(',') : '-'}`).join('|');
const telOk = !V.length || !R.length || imp(V) === imp(R);
const g = [];
if (V.length && vKo.length) g.push(`verde: ${vKo.length} finestre fuori regola`);
if (V.length && !telOk) g.push(`telefono cambiato: verde ${imp(V)} / rosso ${imp(R)}`);
if (R.length && !rKo.length) g.push('rosso: il difetto non si vede (nessuna finestra cade col __CPM_NO_G150)');
if (R.length && R.some(r => r.motivo.some(x => /non giudicato/.test(x)))) g.push('rosso: alcune misure non giudicate');
console.log('');
console.log(`ROSSO (__CPM_NO_G150): ${R.length ? (rKo.length ? `cade su ${rKo.length}/${R.filter(r => !FORMATI[r.fk].tel).length} misure PC/tablet` : 'NON CADE') : 'non eseguito'}`);
console.log(`VERDE: ${V.length ? (vKo.length ? `${vKo.length} fuori regola` : `${V.length}/${V.length} in regola`) : 'non eseguito'} · telefono ${telOk ? 'invariato' : 'CAMBIATO'}`);
if (g.length) { console.log('❌ finestre-150'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ finestre-150 verde e il rosso cade');
