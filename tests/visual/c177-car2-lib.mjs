/* [collaudo 177 carriera n.2] helper condivisi del pilota di carriera intera. Solo collaudo: non tocca il gioco. */
process.env.CPM_CHROME=process.env.CPM_CHROME||'/opt/pw-browsers/chromium';process.env.PLAYWRIGHT_BROWSERS_PATH=process.env.PLAYWRIGHT_BROWSERS_PATH||'/opt/pw-browsers';
import fs from 'fs';
import path from 'path';
import { startServer, launchBrowser, installCdnRoutes, sleep, clickByText } from './lib/harness.mjs';
export { sleep, clickByText };
export const OUT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', 'docs', 'collaudi');
export const DATI = path.join(OUT, 'dati-carriera-177-2');
export const FOTO = path.join(OUT, 'foto-carriera-177-2');
export async function apri({ port, state } = {}) {
  const srv = await startServer(); port = srv.address().port;
  const browser = await launchBrowser();
  const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const page = await ctx.newPage(); await installCdnRoutes(page);
  const errors = []; const cons = [];
  page.on('pageerror', e => errors.push({ t: Date.now(), m: String(e.message).slice(0, 300) }));
  page.on('console', m => { if (m.type() === 'error') cons.push({ t: Date.now(), m: m.text().slice(0, 300) }); });
  return { srv, port, browser, ctx, page, errors, cons };
}
export async function vai(S, extra = '') {
  await S.page.goto(`http://localhost:${S.port}/CARRIER-MANAGER-AV.html?cpmtest=1${extra}`, { waitUntil: 'load', timeout: 90000 });
  await S.page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 60000 });
  await sleep(1200);
}
export const testo = page => page.evaluate(() => document.body.innerText);
export const bottoni = page => page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent !== null).map(b => (b.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60)));
export const SCRATCH = '/tmp/claude-0/-home-user-Carrier-manager-/91933141-44d6-5d63-a2bb-bd1bb3da0d23/scratchpad';
fs.mkdirSync(SCRATCH, { recursive: true });
export async function foto(S, nome) { const f = path.join(nome.startsWith('_') ? SCRATCH : FOTO, nome + '.png'); await S.page.screenshot({ path: f }); return nome + '.png'; }

export const DIFETTI = path.join(DATI, 'difetti.jsonl');
export function difetto(d) { fs.mkdirSync(DATI, { recursive: true }); fs.appendFileSync(DIFETTI, JSON.stringify(d) + '\n'); console.log('  ⚠ DIFETTO', d.sev, d.titolo); }
export const LOG = path.join(DATI, 'registro-settimane.jsonl');
export function registra(r) { fs.mkdirSync(DATI, { recursive: true }); fs.appendFileSync(LOG, JSON.stringify(r) + '\n'); }
export const fase = page => page.evaluate(() => (window.__CPM_PHASE ? window.__CPM_PHASE() : null));
/* click VERO col mouse al centro del bottone visibile e NON coperto (elementFromPoint): come un dito, mai un click DOM dietro una finestra */
export const clickTesto = async (page, rx) => {
  const src = rx.source || rx; const fl = rx.flags || 'i';
  const pt = await page.evaluate(([src, fl]) => { const r = new RegExp(src, fl.includes('i') ? 'i' : ''); const bs = [...document.querySelectorAll('button,[role=button]')].filter(x => x.offsetParent !== null && !x.disabled && r.test((x.textContent || '').trim()));
    for (const b of bs) { b.scrollIntoView({ block: 'center' }); const q = b.getBoundingClientRect(); if (q.width < 4 || q.height < 4) continue; const cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue; const e = document.elementFromPoint(cx, cy); if (e && (b === e || b.contains(e))) return { x: cx, y: cy, t: (b.textContent || '').trim().slice(0, 50) }; } return null; }, [src, fl]);
  if (!pt) return false;
  await page.mouse.click(pt.x, pt.y); return pt.t;
};

/* Gioca UNA partita dal vivo fino al fischio. Ritorna il resoconto: highlight (scelta, esito scritto, punteggio prima/dopo),
   timeline del motore, tabellone, testo dell'ultima schermata. scelte: array ciclico di indici (-1 = ultimo). */
export async function giocaLive(S, { scelte = [0, 1, 2, -1], tetto = 420000, foto: fn = null, ingresso = false } = {}) {
  let started = false; const fasi = []; let tCambio = Date.now();
  const p = S.page; const hls = []; let k = 0; let lastPh = '', t0 = Date.now(); let cur = null; let scoreFine = null; let cer = null, cerFoto = null;
  const sc = () => p.evaluate(() => { try { return window.__CPM_SCORE(); } catch (e) { return null; } });
  while (Date.now() - t0 < tetto) {
    await sleep(350);
    const ph = await fase(p);
    if (ph !== lastPh) { fasi.push([Math.round((Date.now() - t0) / 1000), ph]); tCambio = Date.now(); }
    if (!ph && Date.now() - tCambio > 30000) { fasi.push(['nullo>30s', await p.evaluate(() => document.body.innerText.slice(0, 120))]); tCambio = Date.now(); await clickTesto(p, /Salta e gioca|Salta l'ingresso|Salta ingresso|Gioca/); }
    if (ph !== lastPh) {
      if (ph === 'hl_choose') {
        const acts = await p.evaluate(() => [...document.querySelectorAll('button')].filter(x => x.offsetParent && x.textContent.trim().length > 5 && !/^(⏸|▶|\d(\.\d)?×|⚠️|Statistiche|Pagelle|▴|Scegli)/.test(x.textContent.trim())).map(x => x.textContent.trim().replace(/\s+/g, ' ')));
        const hdr = await p.evaluate(() => { const t = document.body.innerText.split('\n'); const i = t.findIndex(x => /Scegli prima/.test(x)); return t.slice(Math.max(0, i - 3), i).join(' | '); });
        cur = { situazione: hdr, azioni: acts, min: await p.evaluate(() => window.__CPM_CLOCK && window.__CPM_CLOCK()), prima: await sc() };
      }
      lastPh = ph;
    }
    if (ph === 'hl_move') { await clickTesto(p, /^Scegli/); }
    if (ph === 'hl_choose' && cur && cur.scelta == null) {
      const n = cur.azioni.length; if (!n) continue;
      let i = scelte[k++ % scelte.length];
      const rr = await p.evaluate(ix => { const b = [...document.querySelectorAll('button')].filter(x => x.offsetParent && x.textContent.trim().length > 5 && !/^(⏸|▶|\d(\.\d)?×|⚠️|Statistiche|Pagelle|▴|Scegli)/.test(x.textContent.trim()));
        const lista = b.map(x => x.textContent.trim().replace(/\s+/g, ' ')); const j = (ix < 0 || ix >= b.length) ? b.length - 1 : ix; if (!b.length) return null; b[j].click(); return { lista, cliccato: lista[j], j }; }, i);
      if (!rr) continue;
      cur.nTl0 = await p.evaluate(() => (window.__CPM_TIMELINE ? window.__CPM_TIMELINE().length : 0));
      cur.scelta = rr.cliccato; cur.listaAlClick = rr.lista; cur.min2 = await p.evaluate(() => window.__CPM_CLOCK && window.__CPM_CLOCK());
      await sleep(250);
    }
    if (ph === 'hl_result' && cur && cur.scelta != null) {
      if (cur.tr0 == null) cur.tr0 = Date.now();
      const tx = await p.evaluate(() => { const t = document.body.innerText.split('\n').map(x => x.trim()).filter(x => x); const i = t.findIndex(x => /LA GIOCATA/.test(x)); return i >= 0 ? t.slice(i, i + 14).join(' | ') : t.slice(0, 30).join(' | '); });
      cur.esito = tx.slice(0, 600);
      if (fn && !cur.foto && Date.now() - cur.tr0 > 1700) cur.foto = await fn('hl' + hls.length);
    }
    if (cur && cur.esito != null && ph === 'playing') { cur.dopo = await sc(); cur.tlNuovi = await p.evaluate(n => { try { return window.__CPM_TIMELINE().slice(n).map(e => ({ t: e.type || e.ev, i: e.intent, k: e.key, ok: e.ok, l: e.label })); } catch (e) { return []; } }, cur.nTl0 || 0); hls.push(cur); cur = null; }
    if (ph === 'ceremony' && started) { if (!cer) { await sleep(1500); cer = (await testo(p)).replace(/\n+/g, ' | ').slice(0, 500); if (fn) cerFoto = await fn('cerimonia'); } await clickTesto(p, /Salta festeggiamenti/); await sleep(500); }
    if (ph === 'ended' && started) { scoreFine = await sc(); await sleep(1200); break; }
    if (ph === 'matchday') { started = true; await clickTesto(p, ingresso ? /Vedi le formazioni/ : /Salta e gioca/); await sleep(600); }
    if (ph === 'formations') { started = true; await clickTesto(p, ingresso ? /Ingresso in campo/ : /Salta l'ingresso/); await sleep(600); }
    if (ph === 'walkout') { started = true; if (!ingresso) await clickTesto(p, /Salta ingresso/); else if (Date.now() - t0 > 60000) await clickTesto(p, /Salta ingresso/); await sleep(600); }
    if (ph === 'playing' || ph === 'hl_intro' || ph === 'hl_move' || ph === 'hl_choose' || ph === 'hl_result') started = true;
  }
  const tl = await p.evaluate(() => { try { return (window.__CPM_TIMELINE ? window.__CPM_TIMELINE() : []).map(e => ({ t: e.type || e.ev, i: e.intent, k: e.key, ok: e.ok, l: e.label })); } catch (e) { return []; } });
  const testoFine = await testo(p);
  return { hls, tl, scoreFine, testoFine, cer, cerFoto, fasi: fasi.slice(0, 60), durata: Date.now() - t0 };
}

export async function impostaNome(p, nome) {
  await p.evaluate(n => { const i = document.querySelector('input[type="text"],input:not([type])'); const s = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; s.call(i, n); i.dispatchEvent(new Event('input', { bubbles: true })); }, nome);
}
/* dal menu fino alla schermata «Offerte ricevute»: creazione + tre provini dal vivo */
export async function faiProvini(S, nome, salva) {
  const p = S.page; const out = [];
  await clickByText(p, 'Nuova carriera'); await sleep(800);
  await foto(S, 'c00-creazione');
  await impostaNome(p, nome);
  await clickByText(p, 'Inizia i provini'); await sleep(900);
  for (let t = 1; t <= 3; t++) {
    if (/Inizia il provino/.test((await bottoni(p)).join())) await clickByText(p, 'Inizia il provino');
    const r = await giocaLive(S, { scelte: [0, 1, 2, -1] });
    r.tipo = 'provino' + t; out.push(r);
    if (salva) salva(r);
    for (let j = 0; j < 6; j++) {
      const c = await clickTesto(p, /Salta festeggiamenti|Risultati provino|Vai al Provino/); await sleep(900);
      if (!c) break; if (/Inizia il provino/.test((await bottoni(p)).join()) || /Offerte ricevute/.test(await testo(p))) break;
    }
  }
  return out;
}
