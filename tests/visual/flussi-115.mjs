#!/usr/bin/env node
/* [giro 115 · PO-321 «Sistemiamo anche il video iniziale, la gestione dei provini, il wizard»] GUARDIANO dei punti del collaudo 184
   (docs/collaudo-grafico/184/RAPPORTO.md, ramo collaudo/184-altezza-flussi) sul flusso VERO: home → creazione → intro (riascolto)
   → provino 1 → 2 → 3 → riepilogo → offerte → arrivo in carriera.
   Un controllo per punto:
     G184-30 contatore del nome · G184-32 campo in vista con la tastiera (solo tocco) · G184-31 Invio non avvia i provini
     G184-02 altezza (pre 1, pre 2, post 1) · G184-21 cifra nel cerchio · G184-24 tinte (riquadro VS, cartellino in partita)
     G184-12 «Salta» 44 px + safe-area · G184-17 nome del giocatore · G184-10 durata delle istruzioni · G184-11 contrasto della chiusura (telefono)
     G184-15 «Chiudi» + chiusura <= 4,5 s dopo la CTA · G184-13 suoni via AudioMgr · G184-16 corpo su PC
     G184-22 primo highlight del provino 1 entro 10 s di gioco fluido (tempo di scena) e nessuna espulsione prima · G184-23 nomi a fine partita
     G184-20 riepilogo dei tre provini, offerte dal tasto · G184-25 «Salta»/«Avanti» del tutorial d'arrivo
   Bracci: verde = gioco com'e'; ROSSO (CPM_ROSSO=1) = tutti gli interruttori __CPM_NO_G115_<NN> (comportamento della 183): il
   rosso deve cadere su OGNI punto, altrimenti il controllo e' cieco (dichiarato in coda).
   Regole PROCESSO.md «Controlli instabili»: si attende un EVENTO (fase, battuta dell'intro dichiarata dal gioco), i tempi dell'intro
   sono quelli che l'intro stessa dichiara (__CPM_INTRO115.raw/beats, il suo orologio), i minuti della partita dal suo cronometro;
   «non giudicato» = rosso; braccio e motivo stampati per ultimi. Una passata per formato (C180_FORMATI, default s360,s412,pc).
   Uso: CPM_CHROME=/opt/pw-browsers/chromium node flussi-115.mjs  ·  CPM_ROSSO=1 node flussi-115.mjs  ·  CPM_FOTO=<dir> per le foto. */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './c178-graf-lib.mjs';
import { scelti, contrasti, EXTRA108, NOME_LUNGO } from './c180-lib.mjs';
import { ALTEZZA } from './c184-lib.mjs';

const ROSSO = process.env.CPM_ROSSO === '1';
const PUNTI = ['02', '10', '11', '12', '13', '15', '16', '17', '20', '21', '22', '23', '24', '25', '30', '31', '32'];
const FOTO = process.env.CPM_FOTO || null; if (FOTO) fs.mkdirSync(FOTO, { recursive: true });
const BR = ROSSO ? 'rosso' : 'verde';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const INIT = ({ rosso, punti }) => { window.__CPM_GLB = false; try { localStorage.setItem('cpm-intro-seen', '1'); localStorage.setItem('cpm-dark', '0'); } catch (_e) {}
  if (rosso) for (const k of punti) window['__CPM_NO_G115_' + k] = true;
  let s = 4242; Math.random = function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
const fase = p => p.evaluate(() => window.__CPM_PHASE ? window.__CPM_PHASE() : null).catch(() => null);
const testo = p => p.evaluate(() => document.body.innerText || '').catch(() => '');
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const x = [...document.querySelectorAll('button')].filter(y => y.getBoundingClientRect().width > 0 && !y.disabled).find(y => r.test((y.textContent || '').trim())); if (x) { x.click(); return (x.textContent || '').trim().slice(0, 40); } return false; }, rx);
const attendi = async (page, fn, arg, ms) => { try { await page.waitForFunction(fn, arg, { timeout: ms, polling: 100 }); return true; } catch (_e) { return false; } };
const lumi = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null; const p = m[1].split(',').map(Number); const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(p[0]) + 0.7152 * f(p[1]) + 0.0722 * f(p[2]); };
const rapporto = (a, b2) => { const l1 = lumi(a), l2 = lumi(b2); if (l1 == null || l2 == null) return null; return Math.round((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05) * 100) / 100; };
const foto = async (page, f, nome) => { if (!FOTO) return; try { await page.screenshot({ path: path.join(FOTO, `${nome}-${f.k.replace('s', '')}-${BR}.png`) }); } catch (_e) {} };

const ESITI = []; /* {f, p, ok:true|false|null, m} */
const esito = (f, p, ok, m) => { ESITI.push({ f: f.k, p, ok, m }); console.log(`  [${f.k}] G184-${p} ${ok === true ? 'OK ' : ok === false ? 'NO ' : 'n.g.'} ${m}`); };
const altezza = async (page, f, p, sch) => { await sleep(200); const a = await page.evaluate(ALTEZZA).catch(() => null); if (!a) return esito(f, p, null, `${sch}: misura fallita`);
  const ok = !!a.scorre || a.pct <= 12; esito(f, p, ok, `${sch}: ${a.scorre ? 'scorre' : 'vuoto ' + a.vuoto + ' px = ' + a.pct + '%'} (soglia 12%, ultimo «${a.ultimo}»)`); };

async function intro(page, f, nomeAtteso) {
  /* GLB ACCESO per l'intro (direttiva PO 29/07: le verifiche percettive si fanno col CH38), spento di nuovo dopo per la partita */
  await page.evaluate(() => { window.__CPM_GLB = true; window.__CPM_INTRO115 = {}; window.dispatchEvent(new CustomEvent('cpm-replay-intro')); });
  if (!(await attendi(page, () => !!document.querySelector('[data-cpm="intro-salta"]'), null, 15000))) { for (const p of ['12', '17', '10', '11', '15', '13']) esito(f, p, null, 'intro non aperta'); return; }
  /* G184-12 */
  const sl = await page.evaluate(() => { const x = document.querySelector('[data-cpm="intro-salta"]'); const r = x.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: x.style.top || '' }; });
  esito(f, '12', sl.w >= 44 && sl.h >= 44 && /safe-area-inset-top/.test(sl.top), `«Salta» ${sl.w}x${sl.h} px, top «${sl.top}» (>=44x44 e safe-area)`);
  /* G184-17: battuta 1 (eroe) */
  if (await attendi(page, () => (window.__CPM_INTRO115 || {}).beat === 1 && !!document.querySelector('[data-cpm="intro-sub"]'), null, 15000)) {
    const sub = await page.evaluate(() => (document.querySelector('[data-cpm="intro-sub"]') || {}).innerText || '');
    esito(f, '17', !!nomeAtteso && sub.includes(nomeAtteso), `battuta dell'eroe: «${sub.slice(0, 60)}» (atteso «${nomeAtteso}»)`);
  } else esito(f, '17', null, 'battuta 1 mai arrivata');
  /* G184-10: la battuta del tutorial (indice 2 di CAPS) — durata dall'orologio dell'intro, ritardi delle tre istruzioni dal loro stile */
  if (await attendi(page, () => (window.__CPM_INTRO115 || {}).beat === 2 && document.querySelectorAll('[data-cpm="intro-chip"]').length === 3, null, 20000)) {
    const rit = await page.evaluate(() => [...document.querySelectorAll('[data-cpm="intro-chip"]')].map(e => { const c = getComputedStyle(e); return parseFloat(c.animationDelay) + parseFloat(c.animationDuration); }));
    await attendi(page, () => (window.__CPM_INTRO115 || {}).beat > 2, null, 20000);
    const bl = await page.evaluate(() => (window.__CPM_INTRO115 || {}).beats || []);
    const i3 = bl.findIndex(x => x.b === 2); const dur = (i3 >= 0 && bl[i3 + 1]) ? bl[i3 + 1].raw - bl[i3].raw : null;
    if (dur == null) esito(f, '10', null, 'durata della battuta non dichiarata');
    else { const vis = rit.map(r => Math.round((dur - r) * 10) / 10); esito(f, '10', Math.min(...vis) >= 2.5, `battuta ${Math.round(dur * 10) / 10} s · istruzioni a schermo (dopo la comparsa) ${vis.join(' / ')} s (soglia 2,5 s ciascuna)`); }
  } else esito(f, '10', null, 'battuta del tutorial mai arrivata');
  /* G184-11 + G184-15: la chiusura (battuta 6, CTA) */
  if (await attendi(page, () => (window.__CPM_INTRO115 || {}).beat === 6 && !!document.querySelector('[data-cpm="intro-cta"]'), null, 25000)) {
    const ctaRaw = await page.evaluate(() => { window.__CTA115 = (document.querySelector('[data-cpm="intro-cta"]') || {}).innerText || ''; return window.__CPM_INTRO115.raw; });
    await attendi(page, () => { const e = document.querySelector('[data-cpm="intro-sub"]'); return e && getComputedStyle(e).opacity === '1' && e.getAnimations().every(a => a.playState === 'finished'); }, null, 6000);
    /* il contrasto si giudica su TUTTA la battuta finale (la camera si muove e la bandiera bianca entra dietro le scritte): un campione
       ogni ~0,7 s finche' la battuta e' a schermo, si tiene il minimo */
    let ctr = [], nCamp = 0, fs16 = null, rawCamp = [];
    while (await page.evaluate(() => (window.__CPM_INTRO115 || {}).beat === 6 && !!document.querySelector('[data-cpm="intro-sub"]')).catch(() => false)) {
    const righe = await page.evaluate(() => { const out = []; const sub = document.querySelector('[data-cpm="intro-sub"]'); if (!sub) return out; const box = sub.parentElement;
      for (const e of box.children) { const tx = (e.innerText || '').trim(); if (!tx) continue; const c = getComputedStyle(e); const rg = document.createRange(); rg.selectNodeContents(e);
        for (const r of [...rg.getClientRects()].filter(r => r.width > 2 && r.height > 4)) out.push({ t: tx.slice(0, 40), col: c.color, fs: parseFloat(c.fontSize), fw: parseInt(c.fontWeight) || 400, x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), w: Math.round(r.width), h: Math.round(r.height), s: e.tagName, sh: 0, svg: 0 }); }
      return out; });
    if (fs16 == null) fs16 = await page.evaluate(() => { const e = document.querySelector('[data-cpm="intro-sub"]'); return e ? parseFloat(getComputedStyle(e).fontSize) : null; });
    try { const fondoR = Math.min(f.h, Math.ceil(Math.max(0, ...righe.map(r => r.y + r.h)) + 4)); const png = PNG.sync.read(await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: f.w, height: Math.max(8, fondoR) } })); const c = contrasti(png, righe, 1); /* si fotografa solo la fascia delle didascalie (stesse coordinate: il ritaglio parte da 0,0) */ if (c.length) { nCamp++; rawCamp.push(await page.evaluate(() => (window.__CPM_INTRO115 || {}).raw || 0)); for (const x of c) { const k = ctr.findIndex(y => y.t === x.t && y.y === x.y); if (k < 0) ctr.push(x); else if (x.rap < ctr[k].rap) ctr[k] = x; } } } catch (_e) {}
    if (nCamp === 1) await foto(page, f, 'intro-chiusura');
    await sleep(450); }
    if (!f.touch) console.log(`  [${f.k}] G184-11 (solo telefono: a ${f.w} px col CH38 headless lo screenshot e' troppo lento per campionare la battuta) ${nCamp} campioni${ctr.length ? ', minimo ' + Math.min(...ctr.map(c => c.rap)) + ':1' : ''}`);
    else if (!ctr.length) esito(f, '11', null, 'nessuna riga misurata');
    else if (nCamp < 2 || (nCamp < 3 && rawCamp[rawCamp.length - 1] - rawCamp[0] < 1.5)) esito(f, '11', null, `solo ${nCamp} campioni della battuta finale (copertura ${rawCamp.length ? Math.round((rawCamp[rawCamp.length - 1] - rawCamp[0]) * 10) / 10 : 0} s; servono 3 campioni o 2 distanti >= 1,5 s)`);
    else { const sotto = ctr.filter(c => c.rap < c.soglia); const min = ctr.reduce((a, c) => c.rap < a.rap ? c : a, ctr[0]);
      esito(f, '11', !sotto.length, `${nCamp} campioni della battuta finale su ${Math.round((rawCamp[rawCamp.length - 1] - rawCamp[0]) * 10) / 10} s, ${ctr.length} righe, minimo ${min.rap}:1 su soglia ${min.soglia} («${min.t.slice(0, 28)}», ${min.testo} su ${min.fondo})`); }
    if (f.w >= 1200) esito(f, '16', fs16 >= 22, `corpo della didascalia a ${f.w} px: ${fs16} px (soglia 22)`);
    const cta = await page.evaluate(() => (window.__CTA115 || ''));
    if (!(await attendi(page, () => !document.querySelector('[data-cpm="intro-salta"]'), null, 20000))) esito(f, '15', false, `CTA «${cta}», intro ancora aperta 20 s dopo la CTA`);
    else { const ch = await page.evaluate(() => (window.__CPM_INTRO115 || {}).chiusa || null); const dopo = ch ? Math.round((ch.raw - ctaRaw) * 10) / 10 : null;
      esito(f, '15', /Chiudi/.test(cta) && !!ch && ch.auto && dopo <= 4.5, `riascolto: CTA «${cta.trim()}» · chiusura da sola ${dopo} s dopo la CTA (atteso «Chiudi» e <= 4,5 s)`); }
  } else { esito(f, '11', null, 'battuta finale mai arrivata'); esito(f, '15', null, 'battuta finale mai arrivata'); }
  const su = await page.evaluate(() => (window.__CPM_INTRO115 || {}).suoni || []);
  esito(f, '13', su.includes('crowd.roar') && su.includes('ball.kick'), `suoni chiesti ad AudioMgr: ${su.length ? su.join(', ') : 'nessuno'}`);
  await attendi(page, () => !document.querySelector('[data-cpm="intro-salta"]'), null, 15000);
  await page.evaluate(() => { window.__CPM_GLB = false; });
}

/* gioca una partita del provino fino al fischio e alla schermata «completato» */
async function giocaProvino(page, f, n) {
  if (!(await attendi(page, () => ['playing', 'hl_intro', 'hl_choose'].includes(window.__CPM_PHASE && window.__CPM_PHASE()), null, 30000))) return { errore: 'la partita non parte' };
  const R = { primoMin: null, rosso: false };
  if (n === 1) {
    const ch = await page.evaluate(() => { const e = document.querySelector('[data-cpm="provino-cartellino"]'); return e ? getComputedStyle(e).borderTopColor : null; });
    R.cartellino = ch;
    /* primo highlight: si attende la fase, il minuto lo dichiara il cronometro della partita */
    const t0 = Date.now(); let ph = null;
    while (Date.now() - t0 < 120000) { ph = await fase(page); const tx = await testo(page); if (/rimasti in dieci/i.test(tx)) R.rosso = true; if (ph && ph !== 'playing') break; await sleep(150); }
    R.primoMin = /^hl_/.test(ph || '') ? await page.evaluate(() => window.__CPM_CLOCK()) : null; R.scenaS = await page.evaluate(() => Math.round((window.__CPM_SCENA115 || 0) / 100) / 10); R.primoFase = ph; R.muro = Math.round((Date.now() - t0) / 100) / 10;
  }
  let saltato = false; const t1 = Date.now();
  while (Date.now() - t1 < 180000) {
    const ph = await fase(page); const tx = await testo(page);
    if (/PROVINO \d DI 3 · COMPLETATO|Offerte ricevute/.test(tx) && !['playing', 'hl_intro', 'hl_choose', 'hl_move', 'hl_result'].includes(ph)) break;
    if (ph === 'hl_choose') { await page.evaluate(() => window.__CPM_RESOLVE && window.__CPM_RESOLVE(0)); await sleep(300); continue; }
    if (ph === 'playing' && !saltato && (n > 1 || R.primoMin != null || Date.now() - t1 > 2000)) { await page.evaluate(() => { window.__CPM_SET_NUMHL && window.__CPM_SET_NUMHL(1); window.__CPM_SALTA297 && window.__CPM_SALTA297(88); }); saltato = true; }
    if (ph === 'ended') { if (n === 1 && !R.nomi) { await sleep(400); R.nomi = await page.evaluate(() => [...document.querySelectorAll('[data-cpm="post-nome-squadra"]')].map(e => ({ t: (e.innerText || '').trim(), tronco: e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 }))); await foto(page, f, 'provino-fine'); }
      await premi(page, 'Risultati|RISULTATI|Continua|Torna|Prosegui|Avanti|Chiudi|Fine'); await sleep(500); continue; }
    if (ph === 'matchday' || ph === 'formations') { await premi(page, 'Salta e gioca|Entra in campo|Gioca|Inizia'); await sleep(500); continue; }
    if (ph === 'walkout') { await premi(page, 'Salta'); await sleep(500); continue; }
    if (!ph || ph === 'ceremony') { await premi(page, 'Continua|Avanti|Chiudi|OK|Risultati|RISULTATI'); }
    await sleep(250);
  }
  return R;
}

for (const f of scelti()) {
  const opt = { viewport: { width: f.w, height: f.h }, deviceScaleFactor: 1, serviceWorkers: 'block' }; if (f.touch) { opt.isMobile = true; opt.hasTouch = true; }
  const ctx = await b.newContext(opt); const page = await ctx.newPage(); await installCdnRoutes(page); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await page.addInitScript(INIT, { rosso: ROSSO, punti: PUNTI });
  const T0 = Date.now(); console.log(`— ${f.nome} · braccio ${BR}`);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1`, { waitUntil: 'load', timeout: 120000 });
  await attendi(page, () => { const r = document.getElementById('root'); return r && r.children.length > 0 && /Nuova carriera/.test(document.body.innerText || ''); }, null, 90000);
  /* ── CREAZIONE ── */
  await premi(page, 'Nuova carriera'); await attendi(page, () => !!document.querySelector('input[name="cpm-hero-name"]'), null, 15000);
  const inp = page.locator('input[name="cpm-hero-name"]').first(); await inp.click(); await inp.type(NOME_LUNGO, { delay: 10 });
  const nome = await inp.inputValue();
  const cont = await page.evaluate(() => { const e = document.querySelector('[data-cpm="nome-contatore"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { t: (e.innerText || '').replace(/\s+/g, ' ').trim(), vis: r.height > 0 }; });
  esito(f, '30', !!cont && cont.vis && /22\/22/.test(cont.t), `scritto «${NOME_LUNGO}» (25), nel campo «${nome}» (${nome.length}) · ${cont ? 'contatore «' + cont.t + '»' : 'nessun limite visibile'}`);
  if (f.touch) {
    await page.evaluate(() => { for (const e of document.querySelectorAll('*')) if (e.scrollTop) e.scrollTop = 0; window.scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
    await sleep(200); await inp.focus(); await page.setViewportSize({ width: f.w, height: f.h - 300 });
    const vis = await attendi(page, () => { const i = document.querySelector('input[name="cpm-hero-name"]'); const r = i.getBoundingClientRect(); return document.activeElement === i && r.top >= 0 && r.bottom <= innerHeight; }, null, 3000);
    const pos = await page.evaluate(() => { const r = document.querySelector('input[name="cpm-hero-name"]').getBoundingClientRect(); return `${Math.round(r.top)}-${Math.round(r.bottom)} su vista ${innerHeight}`; });
    esito(f, '32', vis, `tastiera simulata (vista -300 px): campo a y=${pos}`);
    await page.setViewportSize({ width: f.w, height: f.h }); await sleep(300);
  }
  await inp.focus(); await page.keyboard.press('Enter');
  const partito = await attendi(page, () => /IL PROVINO · PASSO/.test(document.body.innerText || ''), null, 1500);
  const fuoco = await page.evaluate(() => { const a = document.activeElement; return a ? a.tagName + (a.getAttribute('data-cpm') ? '[' + a.getAttribute('data-cpm') + ']' : '') : null; });
  const ekh = await inp.getAttribute('enterkeyhint').catch(() => null);
  esito(f, '31', !partito && /crea-nazione/.test(fuoco || '') && ekh === 'next', `Invio nel nome: ${partito ? 'AVVIA I PROVINI' : 'resta nella creazione'} · fuoco su ${fuoco} · enterkeyhint=${ekh}`);
  if (!partito) await page.locator('[data-cpm="crea-avanti-v2"]').click();
  if (!(await attendi(page, () => /IL PROVINO · PASSO 1/.test(document.body.innerText || ''), null, 20000))) { console.log('  provino 1 non raggiunto'); await ctx.close(); continue; }
  await sleep(600);
  /* ── PRE 1 ── */
  await foto(page, f, 'provino-pre-1'); await altezza(page, f, '02', 'pre-1');
  const passo = await page.evaluate(() => { const e = [...document.querySelectorAll('[data-cpm="provino-passo"]')].find(x => (x.innerText || '').trim() === '1'); if (!e) return null; const c = getComputedStyle(e); return { col: c.color, bg: c.backgroundColor }; });
  const rp = passo ? rapporto(passo.col, passo.bg) : null;
  esito(f, '21', rp != null && rp >= 4.5, passo ? `cifra «1» ${passo.col} su ${passo.bg}: ${rp}:1 (soglia 4,5)` : 'cerchio non trovato');
  const granata = await page.evaluate(() => { const r = document.querySelector('[data-cpm="provino-pre"]'); if (!r) return null; let n = 0; for (const e of r.querySelectorAll('*')) if (/122, 31, 43/.test(getComputedStyle(e).backgroundImage)) n++; return n; });
  /* ── INTRO (riascolto con un giocatore che ha un nome) ── */
  await intro(page, f, nome);
  /* ── PROVINI ── */
  await page.evaluate(() => { window.__CPM_SCENA115 = 0; }); await premi(page, 'Inizia il provino'); const R1 = await giocaProvino(page, f, 1);
  const bordoV1 = R1.cartellino ? /191, 219, 254/.test(R1.cartellino) : null;
  esito(f, '24', granata === 0 && bordoV1 === false, `riquadro VS: ${granata} fondi granata #7a1f2b · cartellino in partita: bordo ${R1.cartellino}`);
  esito(f, '22', R1.primoMin != null && R1.scenaS > 0 && R1.scenaS <= 10 && !R1.rosso, `primo highlight del provino 1 al ${R1.primoMin}' dopo ${R1.scenaS} s di gioco fluido (tempo di scena dichiarato dal gioco; ${R1.muro} s di parete headless) · espulsione prima: ${R1.rosso ? 'SI' : 'no'} (soglia 10 s)`);
  if (f.w <= 380) { const tr = (R1.nomi || []).filter(x => x.tronco); esito(f, '23', !!(R1.nomi && R1.nomi.length) && !tr.length, R1.nomi ? `nomi a fine partita: ${R1.nomi.map(x => '«' + x.t.replace(/\n/g, ' ') + '»' + (x.tronco ? ' TRONCO' : '')).join(' · ')}` : 'fine partita non vista'); }
  await attendi(page, () => /PROVINO 1 DI 3 · COMPLETATO/.test(document.body.innerText || ''), null, 15000); await sleep(500);
  await foto(page, f, 'provino-post-1'); await altezza(page, f, '02', 'post-1');
  await premi(page, 'Vai al Provino'); await attendi(page, () => /IL PROVINO · PASSO 2/.test(document.body.innerText || ''), null, 10000); await sleep(500);
  await foto(page, f, 'provino-pre-2'); await altezza(page, f, '02', 'pre-2');
  await premi(page, 'Inizia il provino'); await giocaProvino(page, f, 2);
  await attendi(page, () => /PROVINO 2 DI 3 · COMPLETATO/.test(document.body.innerText || ''), null, 15000); await premi(page, 'Vai al Provino');
  await attendi(page, () => /IL PROVINO · PASSO 3/.test(document.body.innerText || ''), null, 10000); await premi(page, 'Inizia il provino'); await giocaProvino(page, f, 3);
  /* G184-20: dopo il terzo, la schermata dei risultati deve RESTARE (riepilogo) e le offerte partire dal tasto */
  const offSubito = await attendi(page, () => /Offerte ricevute/.test(document.body.innerText || ''), null, 3000);
  const rie = await page.evaluate(() => { const r = document.querySelector('[data-cpm="provini-riepilogo"]'); const t = document.querySelector('[data-cpm="provini-offerte"]'); return { righe: r ? (r.innerText.match(/Provino \d/g) || []).length : 0, tasto: !!t }; });
  if (!offSubito) { await foto(page, f, 'provini-riepilogo'); await altezza(page, f, '02', 'post-3'); }
  let offerte = offSubito; if (!offSubito && rie.tasto) { await page.locator('[data-cpm="provini-offerte"]').click(); offerte = await attendi(page, () => /Offerte ricevute/.test(document.body.innerText || ''), null, 15000); }
  esito(f, '20', !offSubito && rie.righe === 3 && rie.tasto && offerte, offSubito ? 'dopo il terzo provino si va alle offerte in < 3 s: il voto decisivo non si vede' : `riepilogo con ${rie.righe} provini · tasto offerte ${rie.tasto ? 'si' : 'NO'} · offerte ${offerte ? 'aperte dal tasto' : 'NON aperte'}`);
  /* G184-25: tutorial d'arrivo */
  if (offerte) { await sleep(600); await premi(page, 'Firma|Scegli|Accetta'); await sleep(1200); for (let i = 0; i < 3; i++) { if (await page.evaluate(() => !!document.querySelector('[data-cpm="tutorial-salta"]'))) break; await premi(page, 'Conferma|Firma|Sì|Accetta|Continua'); await sleep(1000); } }
  if (await attendi(page, () => !!document.querySelector('[data-cpm="tutorial-salta"]'), null, 20000)) {
    await sleep(400); await foto(page, f, 'carriera-arrivo');
    const x = await page.evaluate(EXTRA108); const sl = x.tocchi.find(t => /^Salta$/.test(t.t));
    const av = await page.evaluate(() => { const e = document.querySelector('[data-cpm="tutorial-avanti"]'); return e ? getComputedStyle(e).backgroundColor : null; });
    const sr = await page.evaluate(() => { const r = document.querySelector('[data-cpm="tutorial-salta"]').getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height); });
    esito(f, '25', !sl && av === 'rgb(244, 241, 234)', `«Salta» ${sr} px${sl ? ' (sotto 44)' : ''} · «Avanti» su ${av} (tema: rgb(244, 241, 234))`);
  } else esito(f, '25', null, 'tutorial d\'arrivo non raggiunto');
  if (errs.length) console.log(`  errori di pagina: ${errs.slice(0, 3).join(' | ')}`);
  console.log(`  ${f.nome}: ${Math.round((Date.now() - T0) / 1000)} s`);
  await ctx.close();
}
await b.close(); srv.close();

/* ── verdetto ── */
const visti = [...new Set(ESITI.map(e => e.p))].sort();
const mancanti = PUNTI.filter(p => !visti.includes(p));
const ng = ESITI.filter(e => e.ok === null), no = ESITI.filter(e => e.ok === false), ok = ESITI.filter(e => e.ok === true);
console.log(`\nflussi-115 · ${ESITI.length} controlli · ${ok.length} OK · ${no.length} NO · ${ng.length} non giudicati${mancanti.length ? ' · punti mai misurati: ' + mancanti.join(',') : ''}`);
let rc;
if (!ROSSO) { rc = (no.length || ng.length || mancanti.length) ? 1 : 0;
  console.log(rc ? `braccio VERDE: ROSSO — ${[...no, ...ng].slice(0, 2).map(e => `[${e.f}] G184-${e.p} ${e.m}`).join(' · ') || 'punti mai misurati ' + mancanti.join(',')}` : `braccio VERDE: verde — ${ok.length} controlli su ${visti.length} punti, tutti giudicati`); }
else { /* nel rosso OGNI punto deve cadere almeno in un formato; un punto che resta verde = controllo cieco */
  const ciechi = visti.filter(p => !ESITI.some(e => e.p === p && e.ok === false));
  rc = (ciechi.length || mancanti.length) ? 1 : 0;
  console.log(rc ? `braccio ROSSO: il controllo e' CIECO su ${[...ciechi, ...mancanti].join(',')} (con gli interruttori della 183 non cade)` : `braccio ROSSO: atteso rosso — cade su tutti i ${visti.length} punti (${no.length} controlli rossi)`); }
process.exit(rc);
