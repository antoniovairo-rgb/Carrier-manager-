#!/usr/bin/env node
/* [giro 302 · ritocchi PO del 20/11: PO-552 cambiata · PO-589 · PO-590] GUARDIANO ritocchi-302 — `npm run ritocchi-302`.
   Rosso del giro: window.__CPM_NO_G302 (= il ramo prova/198-blocco2 prima dei ritocchi). Non-gate, gioca la pagina vera.
   A  (PO-552 «Toglierli») Home da PC 1366x768 con un salvataggio nello slot 1: la riga «1 2 3 salvataggi» NON c'e' (nessun
      .cpm-tasti284, nessun .kbd), le tre schede dei salvataggi ci sono ancora, il tasto 1 della tastiera apre la carriera salvata
      e il tasto 2 (slot libero) apre la creazione. Al telefono 375x667 la riga non c'era e non c'e'.
   B  (PO-589 «Colori del tema») striscia «Scarico i giocatori 3D · NN%» PROVOCATA dalla sonda (prepara233 con i modelli trattenuti
      in rete) in quattro scene: Home PC, Home telefono, carriera telefono con club nero (FC Frankfurt #0f0f0f) e con club chiaro (#f5f5f5). Si misura a schermo:
      fondo = TINTE.sup · testo = TINTE.testo · contrasto testo/fondo >= 4,5 · corpo > 11 px · striscia alta <= ALTA_MAX px ·
      non prende i tocchi · non copre niente di disegnato di tasti e titoli, ne' altre scritte · barra con sfumatura che finisce nel colore del tasto principale a schermo
      (se quel colore sul fondo della striscia ha contrasto < 3, basta che la barra si veda: >= 3). Schermata d'attesa
      «Caricamento dei giocatori» (copri233 provocata): binario = TINTE.tasto, riempimento con la stessa sfumatura.
   C  (PO-590 «il piu' anziano») 1) REGOLA su tutti i club pro x 3 stagioni + le Primavera, senza capitano nello spogliatoio: «C» al
      titolare piu' anziano e «VC» al secondo (atteso ricalcolato QUI: eta' massima, poi anni nel club, poi alfabetico), eta' credibili
      (pro 18-34, Primavera 16-18) e che crescono di uno a stagione per chi resta nello stesso posto. 2) A SCHERMO (Club > Rosa, 375)
      con due salvataggi senza «capitano» nello spogliatoio (pro FC Frankfurt col capitano tolto; Primavera, che non l'ha): una «C»
      e una «VC» sole, sui nomi attesi.
   VERDE: tutto passa. ROSSO: A, B e C devono cadere tutti e tre. «Non giudicato» = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node ritocchi-302.mjs   (CPM_PARTE=verde|rosso · CPM_FOTO=<cartella>) */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, installCdnRoutes, sleep, ROOT } from './lib/harness.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const PARTE = process.env.CPM_PARTE || 'tutto'; const FOTO = process.env.CPM_FOTO || path.join(ROOT, 'docs', 'sviluppo', 'giro302');
fs.mkdirSync(FOTO, { recursive: true }); fs.mkdirSync(path.join(ROOT, 'tests/visual/out'), { recursive: true });
const ALTA_MAX = 19;/* px: l'altezza della striscia di prima (18 + bordo): la nuova non puo' essere piu' alta. Che non copra niente lo giudica la misura a parte (i tasti in alto cominciano a 16 px) */
const fx = n => JSON.parse(JSON.parse(fs.readFileSync(path.join(ROOT, 'tests/visual/fixtures', n + '.json'), 'utf8'))['cpm-v3']);
const S1 = fx('save-c177-s1w15'), S5 = fx('save-c177-s5w20');
/* pro senza capitano: il «capitano» dello spogliatoio di S5 diventa «amico» (i nomi restano quelli veri della rosa) */
const S5N = { ...S5, player: { ...S5.player, isCaptain: false, teammates: (S5.player.teammates || []).map(t => t.archetype === 'capitano' ? { ...t, archetype: 'amico', icon: '😄' } : t) } };
const J = x => JSON.stringify(x); const righe = []; const log = s => { righe.push(s); console.log(s); };

const nuova = async (b, W, H, rosso, save, opz = {}) => {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, serviceWorkers: 'block', isMobile: W < 640, hasTouch: W < 640 }); const page = await ctx.newPage(); await installCdnRoutes(page);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  if (opz.trattieni) await page.route('**/*.glb', r => { setTimeout(() => r.abort().catch(() => {}), 60000); });
  await page.addInitScript(({ r, save, glbOff }) => { if (r) window.__CPM_NO_G302 = true; if (glbOff) window.__CPM_GLB = false; window.__CPM_FIS_APERTE = true;
    try { if (!sessionStorage.getItem('g302')) { localStorage.clear(); localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '1'); if (save) localStorage.setItem('cpm-v3', save); sessionStorage.setItem('g302', '1'); } } catch (e) {} }, { r: rosso, save: save ? JSON.stringify(save) : null, glbOff: !opz.trattieni });
  return { ctx, page, errs };
};
const apriHome = async (page, port) => { await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0 && /Nuova carriera|salvatagg/i.test(document.body.innerText); }, null, { timeout: 90000 }); await sleep(900); };
const apriCarriera = async (page, port) => { await apriHome(page, port); try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false); if (!vivo) return false;
  await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(400); return true; };
const attendi = async (page, fn, n = 60, passo = 250) => { for (let i = 0; i < n; i++) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(passo); } return false; };
const inCarriera = () => !!document.querySelector('.cpm-nav-bar') && !document.querySelector('.cpm-home284');
const inCreazione = () => !!document.querySelector('input[type="text"],input:not([type])') && /INIZIA I PROVINI/i.test(document.body.innerText);
const foto = (page, nome) => page.screenshot({ path: path.join(FOTO, nome + '.png') }).catch(() => {});

/* ---------- A ---------- */
async function parteA(b, port, rosso, et) {
  const r = {};
  for (const [W, H, tipo] of [[1366, 768, 'pc'], [375, 667, 'tel']]) {
    const { ctx, page, errs } = await nuova(b, W, H, rosso, S1); await apriHome(page, port);
    r[tipo] = await page.evaluate(() => { const vis = e => { const q = e.getBoundingClientRect(); return q.width > 0 && q.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const t = document.body.innerText; return { riga: [...document.querySelectorAll('.cpm-tasti284')].filter(vis).length, kbd: [...document.querySelectorAll('.kbd')].filter(vis).length,
        parola: /(^|\n)\s*(1\s*2\s*3\s*)?salvataggi\s*(\n|$)/i.test(t), schede: [/CONTINUA/i.test(t), /Salvataggio 2/i.test(t), /Salvataggio 3/i.test(t)].filter(Boolean).length }; });
    r[tipo].errs = errs.slice(0, 2); await foto(page, `${et}-A-home-${W}x${H}`); await ctx.close().catch(() => {});
  }
  { const { ctx, page } = await nuova(b, 1366, 768, rosso, S1); await apriHome(page, port); await page.keyboard.press('1'); r.tasto1 = await attendi(page, inCarriera, 60); await ctx.close().catch(() => {}); }
  { const { ctx, page } = await nuova(b, 1366, 768, rosso, S1); await apriHome(page, port); await page.keyboard.press('2'); r.tasto2 = await attendi(page, inCreazione, 40); await ctx.close().catch(() => {}); }
  return r;
}

/* ---------- B ---------- */
const MISURA_STRISCIA = async () => {
  const rgb = c => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const L = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const CR = (a, b) => { const x = rgb(a), y = rgb(b); if (!x || !y || x.a < 1 || y.a < 1) return null; const h = Math.max(L(x), L(y)), l = Math.min(L(x), L(y)); return Math.round((h + 0.05) / (l + 0.05) * 100) / 100; };
  const tok = h => {/* hex → rgb() come lo scrive il browser */ const d = document.createElement('i'); d.style.color = h; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  /* il tasto principale a schermo, letto PRIMA di provocare la striscia */
  const vis = e => { const q = e.getBoundingClientRect(); return q.width > 30 && q.height > 20 && q.bottom > 0 && q.top < innerHeight; };
  const bt = [...document.querySelectorAll('button')].filter(vis).map(e => ({ e, cs: getComputedStyle(e) })).filter(x => /uppercase/.test(x.cs.textTransform) && rgb(x.cs.backgroundColor) && rgb(x.cs.backgroundColor).a === 1 && +x.cs.fontWeight >= 800)[0];
  /* in carriera il tasto principale e' nel colore del club (regola del giro 235): se a schermo non ce n'e' uno, l'atteso e' il colore del club del salvataggio */
  let club = null; try { const pl = JSON.parse(localStorage.getItem('cpm-v3')).player; if (window.__CPM_CAREER && pl.club && /^#/.test(pl.club.c)) club = pl.club.c; } catch (_e) {}
  const tasto = bt ? { testo: (bt.e.textContent || '').trim().slice(0, 30), bg: bt.cs.backgroundColor, da: 'tasto a schermo' } : club ? { testo: 'colore del club ' + club, bg: tok(club), da: 'salvataggio' } : null;
  let err = null; try { prepara233('partita'); } catch (e) { err = e.message; }
  let el = null; for (let i = 0; i < 40 && !(el = document.getElementById('cpm-avanz233')); i++) await new Promise(r => setTimeout(r, 100));
  if (!el) return { err: 'striscia non comparsa' + (err ? ' (' + err + ')' : '') };
  await new Promise(r => setTimeout(r, 700));
  const cs = getComputedStyle(el), q = el.getBoundingClientRect(), b = el.querySelector('[data-b]'), bcs = getComputedStyle(b), bq = b.getBoundingClientRect(), tq = el.querySelector('[data-t]').getBoundingClientRect();
  const cols = (bcs.backgroundImage.match(/rgba?\([^)]+\)/g) || []); const fine = cols.length ? cols[cols.length - 1] : (rgb(bcs.backgroundColor) && rgb(bcs.backgroundColor).a > 0 ? bcs.backgroundColor : null);
  const sopra = document.elementFromPoint(Math.round(q.left + q.width / 2), Math.round(q.top + q.height / 2));
  const tocca = (e) => { const z = e.getBoundingClientRect(); return z.width > 0 && z.height > 0 && z.top < q.bottom - 0.5 && z.bottom > q.top + 0.5 && !el.contains(e) && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none'; };
  /* «coperto» = sotto la striscia finisce qualcosa di DISEGNATO di un tasto o di un titolo: il suo testo, la sua icona, oppure il suo
     riquadro se ha un fondo o un bordo visibile. L'area di tocco trasparente che sporge sotto la striscia non e' coperta: la striscia non prende i tocchi. */
  const dip = e => { const c = getComputedStyle(e), a = rgb(c.backgroundColor); return (a && a.a > 0.02) || c.backgroundImage !== 'none' || (parseFloat(c.borderTopWidth) > 0 && rgb(c.borderTopColor) && rgb(c.borderTopColor).a > 0.02); };
  const dentro = e => { if (dip(e)) return 'riquadro'; for (const k of e.querySelectorAll('svg,img,canvas')) if (tocca(k)) return 'icona'; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let t; while ((t = w.nextNode())) { if (!t.nodeValue.trim()) continue; const g = document.createRange(); g.selectNodeContents(t); const z = g.getBoundingClientRect(); if (z.width > 0 && z.top < q.bottom - 0.5 && z.bottom > q.top + 0.5) return 'testo'; } return null; };
  const sfiora = [], coperti = []; for (const e of [...document.querySelectorAll('button,a[href],input,select,[role="button"],h1,h2,h3,[role="heading"]')].filter(tocca)) { const d = e.tagName + ' «' + (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 24) + '» ' + Math.round(e.getBoundingClientRect().top) + '-' + Math.round(e.getBoundingClientRect().bottom); const c = dentro(e); if (c) coperti.push(d + ' [' + c + ']'); else sfiora.push(d); }
  const testi = []; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) { if (!n.nodeValue.trim() || el.contains(n.parentElement)) continue; const rg = document.createRange(); rg.selectNodeContents(n); const z = rg.getBoundingClientRect(); if (z.width > 0 && z.top < q.bottom - 0.5 && z.bottom > q.top + 0.5 && getComputedStyle(n.parentElement).visibility !== 'hidden') testi.push(n.nodeValue.trim().slice(0, 24)); }
  /* l'inchiostro del testo (linea di base + discendenti misurati sul carattere vero) deve finire sopra la barra */
  let inkGiu = null; try { const sp = el.querySelector('[data-t]'), m0 = document.createElement('span'); m0.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline'; sp.appendChild(m0); const base = m0.getBoundingClientRect().bottom; m0.remove();
    const cx = document.createElement('canvas').getContext('2d'); cx.font = cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily; inkGiu = Math.round((base + cx.measureText(sp.textContent).actualBoundingBoxDescent) * 10) / 10; } catch (_e) {}
  return { testo: el.innerText.trim(), alta: Math.round(q.height * 10) / 10, larga: Math.round(q.width), top: q.top, fondo: cs.backgroundColor, col: cs.color, corpo: parseFloat(cs.fontSize), peso: cs.fontWeight, contrasto: CR(cs.color, cs.backgroundColor),
    pe: cs.pointerEvents, sopraStriscia: !!(sopra && el.contains(sopra)), sfum: /gradient/.test(bcs.backgroundImage), barraFine: fine, barraAlta: Math.round(bq.height), barraSu: Math.round(bq.top * 10) / 10, inkGiu, barraSottoTesto: inkGiu != null && inkGiu <= bq.top + 0.5, crBarra: fine ? CR(fine, cs.backgroundColor) : null,
    tasto, crTasto: tasto ? CR(tasto.bg, cs.backgroundColor) : null, coperti, sfiora, testi, tokSup: tok(TINTE.sup), tokTesto: tok(TINTE.testo), tokTasto: tok(TINTE.tasto) };
};
/* schermata d'attesa provocata (a parte: finche' c'e', il gioco nasconde la striscia) */
const MISURA_ATTESA = async () => {
  const host = document.createElement('div'); host.style.cssText = 'position:fixed;left:0;top:60px;width:320px;height:300px;z-index:8000'; document.body.appendChild(host);
  let via = null; try { via = copri233(host, ['./assets/__prova302.glb'], new Promise(() => {}), 'prova302'); } catch (e) {}
  await new Promise(r => setTimeout(r, 600)); const at = host.querySelector('[data-cpm="attesa233"]'); let attesa = null;
  if (at) { const f = at.querySelector('[data-b]'), bin = f.parentElement; const fc = (getComputedStyle(f).backgroundImage.match(/rgba?\([^)]+\)/g) || []); attesa = { binario: getComputedStyle(bin).backgroundColor, fine: fc.length ? fc[fc.length - 1] : getComputedStyle(f).backgroundColor, sfum: /gradient/.test(getComputedStyle(f).backgroundImage) }; }
  return attesa;
};
async function parteB(b, port, rosso, et) {
  const out = [];
  for (const [nome, W, H, save, car] of [['home-pc', 1366, 768, S1, false], ['home-tel', 375, 667, S1, false], ['carriera-tel-club-nero', 375, 667, S5N, true], ['carriera-tel-club-chiaro', 375, 667, S1, true]]) {
    const { ctx, page, errs } = await nuova(b, W, H, rosso, save, { trattieni: true }); let m = null;
    try { const ok = car ? await apriCarriera(page, port) : (await apriHome(page, port), true); if (!ok) m = { err: 'carriera non aperta' }; else { m = await page.evaluate(MISURA_STRISCIA);
      if (!m.err) { await foto(page, `${et}-B-striscia-${nome}-${W}x${H}`); await page.screenshot({ path: path.join(FOTO, `${et}-B-striscia-${nome}-ritaglio.png`), clip: { x: 0, y: 0, width: Math.min(W, 520), height: 70 } }).catch(() => {});
        m.attesa = await page.evaluate(MISURA_ATTESA); if (nome === 'home-tel') await page.screenshot({ path: path.join(FOTO, `${et}-B-attesa-caricamento.png`), clip: { x: 0, y: 60, width: 320, height: 300 } }).catch(() => {}); } } }
    catch (e) { m = { err: String(e.message).slice(0, 160) }; }
    m.scena = nome; m.errs = errs.slice(0, 2); out.push(m); await ctx.close().catch(() => {});
  }
  return out;
}

/* ---------- C ---------- */
const REGOLA = () => {
  const out = { club: 0, casi: 0, capOk: 0, viceOk: 0, uguali: 0, fuoriEta: [], crescita: { visti: 0, ok: 0 }, esempi: [], fonti: {}, prim: { casi: 0, capOk: 0, viceOk: 0 } };
  const atteso = (p, rosa) => { const io = p.name; const T = rosa.slice(0, 11).map((x, i) => ({ n: x.name, ...window.__CPM_ETA302(p, i, x.name) })).filter(x => x.n !== io);
    T.sort((a, b) => (b.eta - a.eta) || (b.anni - a.anni) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)); return T; };
  const rosaDi = (club, s, io) => { const raw = generateTeamRoster(club, s); const r = raw.map((x, i) => i === 10 ? { ...x, name: io } : { ...x }); if (raw[10]) r.push({ ...raw[10] }); return { raw, r }; };
  const pro = CLUBS.filter(c => c && c.id && c.lg);
  for (const club of pro) { out.club++; let prec = null;
    for (const s of [1, 2, 3]) { const p = { name: 'Eroe Di Prova', club, season: s, proStatus: 'pro', isCaptain: false, teammates: [] }; const { raw, r } = rosaDi(club, s, p.name);
      const f = window.__CPM_FASCIA299(p, r); const T = atteso(p, r); out.casi++;
      if (f) { out.fonti[f.capF] = (out.fonti[f.capF] || 0) + 1; if (f.cap === T[0].n) out.capOk++; if (f.vice === T[1].n) out.viceOk++; if (f.cap === f.vice) out.uguali++; }
      for (const t of T) if (!(t.eta >= 18 && t.eta <= 34)) out.fuoriEta.push(club.id + ':' + t.n + ':' + t.eta);
      if (prec) raw.forEach((x, i) => { if (i < 10 && prec.raw[i].name === x.name) { out.crescita.visti++; if (window.__CPM_ETA302(p, i, x.name).eta === prec.eta[i] + 1) out.crescita.ok++; } });
      prec = { raw, eta: raw.map((x, i) => window.__CPM_ETA302(p, i, x.name).eta) };
      if (out.esempi.length < 3 && s === 2) out.esempi.push(club.n + ': C ' + (f && f.cap) + ' (atteso ' + T[0].n + ', ' + T[0].eta + ' anni) · VC ' + (f && f.vice) + ' (atteso ' + T[1].n + ', ' + T[1].eta + ' anni)'); } }
  let U = []; try { U = [...U18_CLUBS]; } catch (e) {}
  for (const club of U.slice(0, 40)) { const p = { name: 'Eroe Di Prova', club, season: 1, proStatus: 'u18', isCaptain: false, teammates: [] }; const { r } = rosaDi(club, 1, p.name); const f = window.__CPM_FASCIA299(p, r); const T = atteso(p, r); out.prim.casi++;
    if (f && f.cap === T[0].n) out.prim.capOk++; if (f && f.vice === T[1].n) out.prim.viceOk++; for (const t of T) if (!(t.eta >= 16 && t.eta <= 18)) out.fuoriEta.push('U18 ' + club.id + ':' + t.n + ':' + t.eta); }
  out.fuoriEta = out.fuoriEta.slice(0, 5); return out;
};
const ROSA_SCHERMO = () => { const out = { C: [], VC: [], righe: 0 };
  for (const s of document.querySelectorAll('[data-cpm="rosa-ruolo228"]')) { const riga = s.parentElement; out.righe++; const nome = (riga.children[2] && riga.children[2].textContent || '').replace(/^★\s*/, '').trim();
    for (const f of riga.querySelectorAll('[data-cpm="fascia299"]')) (f.getAttribute('data-fascia') === 'VC' ? out.VC : out.C).push(nome); }
  let pl = null; try { pl = JSON.parse(localStorage.getItem('cpm-v3')).player; } catch (_e) {}
  out.tm = pl ? (pl.teammates || []).map(t => t.archetype + ':' + t.name) : null; out.isCap = !!(pl && pl.isCaptain);
  if (pl) { const raw = generateTeamRoster(pl.club, pl.season || 1); const T = raw.slice(0, 11).map((x, i) => ({ n: i === 10 ? pl.name : x.name, ...window.__CPM_ETA302(pl, i, x.name) })).filter(x => x.n !== pl.name);
    T.sort((a, b) => (b.eta - a.eta) || (b.anni - a.anni) || (a.n < b.n ? -1 : a.n > b.n ? 1 : 0)); out.att = T.slice(0, 3).map(t => t.n + ' ' + t.eta); out.attC = T[0].n; out.attV = T[1].n; }
  return out; };
async function parteC(b, port, rosso, et) {
  const r = { schermo: [] };
  { const { ctx, page } = await nuova(b, 375, 667, rosso, S1); try { await apriHome(page, port); r.regola = await page.evaluate(REGOLA); } catch (e) { r.regola = { err: String(e.message).slice(0, 200) }; } await ctx.close().catch(() => {}); }
  for (const [nome, save] of [['pro senza capitano (FC Frankfurt)', S5N], ['Primavera senza capitano', S1]]) {
    const { ctx, page, errs } = await nuova(b, 375, 667, rosso, save); let m = { nome };
    try { if (!(await apriCarriera(page, port))) m.err = 'carriera non aperta'; else { await page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(900); Object.assign(m, await page.evaluate(ROSA_SCHERMO));
        await page.evaluate(() => { const f = document.querySelector('[data-cpm="fascia299"]'); if (f) f.scrollIntoView({ block: 'center' }); }); await sleep(350); await foto(page, `${et}-C-rosa-${nome.startsWith('pro') ? 'pro' : 'primavera'}-375x667`); } }
    catch (e) { m.err = String(e.message).slice(0, 160); }
    m.errs = errs.slice(0, 2); r.schermo.push(m); await ctx.close().catch(() => {});
  }
  return r;
}

/* ---------- giudizio ---------- */
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let esito = 0; const finali = [];
for (const rosso of [false, true]) {
  if ((PARTE === 'verde' && rosso) || (PARTE === 'rosso' && !rosso)) continue;
  const nome = rosso ? 'ROSSO' : 'VERDE', et = rosso ? 'prima' : 'dopo'; const ko = { A: [], B: [], C: [] }; const ng = [];
  const A = await parteA(b, port, rosso, et); log(`${nome} A Home: ${J(A)}`);
  if (A.pc.riga !== 0 || A.pc.kbd !== 0 || A.pc.parola) ko.A.push(`da PC la riga «1 2 3 salvataggi» c'e' (righe ${A.pc.riga}, tasti ${A.pc.kbd}, scritta ${A.pc.parola})`);
  if (A.pc.schede !== 3) ko.A.push(`le schede dei salvataggi non sono tre (${A.pc.schede})`);
  if (A.tel.riga !== 0) ko.A.push(`al telefono compare la riga (${A.tel.riga})`);
  if (!A.tasto1) ko.A.push('SCORCIATOIA ROTTA: il tasto 1 non apre la carriera salvata'); if (!A.tasto2) ko.A.push('SCORCIATOIA ROTTA: il tasto 2 non apre la creazione');
  if ((A.pc.errs || []).length) ko.A.push('errori di pagina ' + A.pc.errs[0]);
  if (rosso && (!A.tasto1 || !A.tasto2 || A.pc.schede !== 3)) ng.push('A: nel rosso le scorciatoie o le schede non rispondono (il rosso deve cadere solo sulla riga)');

  const B = await parteB(b, port, rosso, et);
  for (const m of B) { log(`${nome} B ${m.scena}: ${J(m)}`); const k = s => ko.B.push(`${m.scena}: ${s}`);
    if (m.err) { k('NON GIUDICATO — ' + m.err); ng.push('B ' + m.scena + ': ' + m.err); continue; }
    if (m.fondo !== m.tokSup) k(`fondo ${m.fondo} diverso dalla superficie del tema ${m.tokSup}`);
    if (m.col !== m.tokTesto) k(`testo ${m.col} diverso dal testo del tema ${m.tokTesto}`);
    if (!(m.contrasto >= 4.5)) k(`contrasto testo/fondo ${m.contrasto == null ? 'non giudicabile (fondo trasparente)' : m.contrasto} (< 4,5)`);
    if (!(m.corpo > 11)) k(`corpo del testo ${m.corpo} px (non piu' grande di 11)`);
    if (!(m.alta <= ALTA_MAX)) k(`striscia alta ${m.alta} px (max ${ALTA_MAX})`);
    if (m.pe !== 'none' || m.sopraStriscia) k(`prende i tocchi (pointer-events ${m.pe}, sotto il dito ${m.sopraStriscia})`);
    if (m.coperti.length) k(`copre tasti o titoli: ${m.coperti.slice(0, 3).join(' · ')}`);
    if (m.testi.length) k(`copre delle scritte: ${m.testi.slice(0, 4).join(' · ')}`);
    if (!m.sfum || !m.barraFine) k(`la barra non ha una sfumatura (${m.barraFine})`);
    else if (!m.tasto) { k('NON GIUDICATO — nessun tasto principale a schermo'); ng.push('B ' + m.scena + ': tasto principale non trovato'); }
    else if (!(m.barraFine === m.tasto.bg || (m.crTasto < 3 && m.crBarra >= 3))) k(`la barra finisce in ${m.barraFine}, il tasto principale «${m.tasto.testo}» e' ${m.tasto.bg} (contrasto del tasto sul fondo ${m.crTasto}, della barra ${m.crBarra})`);
    if (m.sfum && !(m.crBarra >= 3)) k(`la barra non si vede sul fondo (contrasto ${m.crBarra} < 3)`);
    if (!m.barraSottoTesto) k('il testo sta sopra la barra');
    if (!m.attesa) { k('NON GIUDICATO — schermata d\'attesa non comparsa'); ng.push('B ' + m.scena + ': attesa non comparsa'); }
    else if (!(m.attesa.sfum && m.attesa.binario === m.tokTasto && m.attesa.fine === m.barraFine)) k(`schermata d'attesa: binario ${m.attesa.binario} (tema ${m.tokTasto}), riempimento ${m.attesa.fine} sfumato ${m.attesa.sfum}`);
    if ((m.errs || []).length) k('errori di pagina ' + m.errs[0]);
  }

  const C = await parteC(b, port, rosso, et); const R = C.regola || {}; log(`${nome} C regola: ${J(R)}`);
  if (R.err || !R.casi) { ko.C.push('regola: NON GIUDICATO — ' + (R.err || 'nessun caso')); ng.push('C regola'); }
  else { if (R.capOk !== R.casi) ko.C.push(`regola: «C» al piu' anziano in ${R.capOk}/${R.casi} casi (${R.club} club x 3 stagioni)`);
    if (R.viceOk !== R.casi) ko.C.push(`regola: «VC» al secondo piu' anziano in ${R.viceOk}/${R.casi} casi`);
    if (R.uguali) ko.C.push(`regola: capitano e vice sono la stessa persona in ${R.uguali} casi`);
    if (R.fuoriEta.length) ko.C.push(`eta' fuori misura: ${R.fuoriEta.join(' · ')}`);
    if (!R.crescita.visti) { ko.C.push('crescita dell\'eta\': NON GIUDICATO (nessun giocatore rimasto)'); ng.push('C crescita'); } else if (R.crescita.ok !== R.crescita.visti) ko.C.push(`l'eta' non cresce di uno a stagione: ${R.crescita.ok}/${R.crescita.visti}`);
    if (!R.prim.casi) { ko.C.push('Primavera: NON GIUDICATO'); ng.push('C Primavera'); } else if (R.prim.capOk !== R.prim.casi || R.prim.viceOk !== R.prim.casi) ko.C.push(`Primavera: «C» ${R.prim.capOk}/${R.prim.casi}, «VC» ${R.prim.viceOk}/${R.prim.casi}`); }
  for (const m of C.schermo) { log(`${nome} C a schermo · ${m.nome}: ${J(m)}`); const k = s => ko.C.push(`${m.nome}: ${s}`);
    if (m.err || !m.righe) { k('NON GIUDICATO — ' + (m.err || 'nessuna riga della Rosa')); ng.push('C ' + m.nome); continue; }
    if (m.isCap || (m.tm || []).some(x => /^(ex_)?capitano:/.test(x))) { k('NON GIUDICATO — il salvataggio ha un capitano: ' + J(m.tm)); ng.push('C ' + m.nome + ': premessa'); continue; }
    if (!(m.C.length === 1 && m.C[0] === m.attC)) k(`«C» su ${J(m.C)}, atteso «${m.attC}» (i piu' anziani: ${m.att.join(' · ')})`);
    if (!(m.VC.length === 1 && m.VC[0] === m.attV)) k(`«VC» su ${J(m.VC)}, atteso «${m.attV}»`);
    if ((m.errs || []).length) k('errori di pagina ' + m.errs[0]);
  }

  if (!rosso) { const tutti = [...ko.A.map(x => 'A · ' + x), ...ko.B.map(x => 'B · ' + x), ...ko.C.map(x => 'C · ' + x)];
    if (tutti.length || ng.length) { esito = 1; finali.push(`VERDE: KO (${tutti.length})`); tutti.forEach(x => finali.push('   ' + x)); } else finali.push('VERDE: ok — A riga assente e scorciatoie attive · B striscia nei colori del tema (' + B.map(m => `${m.scena} contrasto ${m.contrasto}, ${m.alta} px`).join('; ') + `) · C «C»/«VC» al piu' anziano ${R.capOk}/${R.casi} e ${R.viceOk}/${R.casi}, a schermo ${C.schermo.map(m => m.C[0] + ' / ' + m.VC[0]).join('; ')}`); }
  else { const manca = ['A', 'B', 'C'].filter(l => !ko[l].length); const ngR = ng.filter(x => !/^B .*attesa/.test(x));
    if (manca.length || ngR.length) { esito = 1; finali.push(`ROSSO: KO — non cade su ${manca.join(', ') || 'nessuno'}${ngR.length ? ' · non giudicato: ' + ngR.join(' · ') : ''}`); }
    else finali.push(`ROSSO: ok — cade su A (${ko.A.length}), B (${ko.B.length}), C (${ko.C.length})`);
    ['A', 'B', 'C'].forEach(l => finali.push(`   ${l}: ${ko[l].slice(0, 3).join(' | ') || '—'}`)); }
}
await b.close().catch(() => {}); srv.close();
fs.writeFileSync(path.join(ROOT, 'tests/visual/out', 'ritocchi-302.txt'), righe.concat(finali).join('\n'));
console.log('\n' + finali.join('\n')); console.log(esito ? '\n❌ ritocchi-302 ROSSO' : '\n✅ ritocchi-302 VERDE');
process.exit(esito);
