#!/usr/bin/env node
/* [giro 299 · PO-563 «C e VC come la R» · PO-564 «angoli non arrotondati correttamente, fai un check su tutti i box» · PO-567 residuo
   «sì, il tasto audio anche nella presentazione»] GUARDIANO — `npm run rosa-angoli-299`. Rosso del giro: window.__CPM_NO_G299.
   A. ROSA (Club › Rosa, telefono 375): «C» sul capitano e «VC» sul vice, GIUSTI (confrontati con la regola letta a parte dai dati del
      salvataggio), stesso pallino della «R» (altezza, fondo, raggio, corpo del carattere), accanto al ruolo (stessa riga, a sinistra della sigla).
      Quattro salvataggi: banco (nessun capitano nello spogliatoio → regola dell'attitudine), compagno «capitano», eroe capitano,
      eroe vice per il premio del patto.
   B. ANGOLI: sulle schermate del censimento (telefono 375x667 e 412x915, PC 1366x768) zero difetti T/D/S/Q/N (lib/angoli-299.mjs).
   C. AUDIO NELLA SERATA: il tasto c'e', apre lo stesso pannello della partita, il Muto cambia AudioMgr e localStorage 'cpm-audio'
      (una chiave sola), e l'icona del tasto cambia.
   Bracci: VERDE tutto verde; ROSSO (__CPM_NO_G299): niente C/VC, almeno un difetto d'angoli sul Club (la foto del PO), niente tasto.
   «Non giudicato» (schermata che non si apre, riga non trovata) = rosso. Verde e rosso stampati per ultimi.
   MODI: CPM_CENSIMENTO=1 → censimento di tutte le schermate, foto e docs/sviluppo/giro299/censimento.json (CPM_ROSSO=1 → «prima»:
   censimento-prima.json e foto-prima/). CPM_299_SOLO=a,b limita le schermate (solo per lavorare; il guardiano le vuole tutte). */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import { SAVE, INIT } from './lib/banco-g0.mjs';
import { ANGOLI } from './lib/angoli-299.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
if (!process.env.PLAYWRIGHT_BROWSERS_PATH) process.env.PLAYWRIGHT_BROWSERS_PATH = '/opt/pw-browsers';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CENS = process.env.CPM_CENSIMENTO === '1', ROSSO_C = process.env.CPM_ROSSO === '1';
const OUTD = path.join(ROOT, 'docs', 'sviluppo', 'giro299');
const TAGLIE = [{ w: 375, h: 667, tel: true }, { w: 412, h: 915, tel: true }, { w: 1366, h: 768, tel: false }];
const SOLO = process.env.CPM_299_SOLO ? process.env.CPM_299_SOLO.split(',') : null;
const SEME = 4242;
const TRIAL = (ph, res) => ({ ph, slot: 0, res, p: { name: 'Grafica Probe', nation: 'Italia', avatarId: 0, ovr: 58, age: 16, proStatus: 'youth', archetype: 'finalizzatore',
  stats: { 'velocità': 60, tecnica: 58, fisico: 56, 'mentalità': 57, tiro: 62, passaggio: 56, dribbling: 60, posizionamento: 58 } } });
const RES3 = [{ goals: 1, assists: 0, rating: 6.6 }, { goals: 1, assists: 1, rating: 7.0 }, { goals: 0, assists: 0, rating: 6.8 }];

const srv = await startServer(); const port = srv.address().port; const browser = await launchBrowser();
const errori = [], saltate = [];
async function attendiFermo(page) { await sleep(400); let prev = null, u = 0; const t0 = Date.now(); while (Date.now() - t0 < 7000) { let t = null; try { t = await page.evaluate(() => (document.body.textContent || '').replace(/\d{1,2}:\d{2}/g, '·').length + '|' + document.body.querySelectorAll('*').length); } catch (_e) {} if (t && t === prev) { if (++u >= 2) return; } else { u = 0; prev = t; } await sleep(250); } }
async function congela(page) { await page.evaluate(() => { if (!document.getElementById('__g299f')) { const st = document.createElement('style'); st.id = '__g299f'; st.textContent = '*,*::before,*::after{transition:none!important}'; document.head.appendChild(st); }
  (document.getAnimations ? document.getAnimations() : []).forEach(a => { try { const t = a.effect.getComputedTiming(); if (t.iterations === Infinity || t.duration === Infinity) { a.currentTime = 0; a.pause(); } else a.finish(); } catch (_e) {} });
  for (const s of document.querySelectorAll('.cpm-scroll')) s.scrollTop = 0; window.scrollTo(0, 0); }); await sleep(150); }
async function apri(t, initArg, query) {
  const page = await browser.newPage({ viewport: { width: t.w, height: t.h }, deviceScaleFactor: 1, isMobile: !!t.tel, hasTouch: !!t.tel });
  page.on('pageerror', e => errori.push(`${t.w}px · ${String(e.message).slice(0, 120)}`));
  await installCdnRoutes(page); await page.addInitScript(INIT, initArg);
  await page.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html${query}`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 });
  return page;
}
const premi = (page, rx) => page.evaluate(s => { const r = new RegExp(s); const b = [...document.querySelectorAll('button')].find(x => r.test((x.textContent || '').trim()) || r.test(x.getAttribute('aria-label') || '')); if (b) { b.click(); return true; } return false; }, rx);
async function carriera(t, base, save) { const page = await apri(t, { ...base, save: save || SAVE, fisAperte: true }, '?cpmtest=1'); await sleep(1100);
  try { await page.getByText('Continua', { exact: false }).first().click({ timeout: 8000 }); } catch (_e) {}
  const vivo = await page.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }).then(() => true).catch(() => false);
  if (!vivo) { await page.close(); return null; } await sleep(900); try { await page.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (_e) {} await sleep(350); return page; }
const SCHEDE = [['dashboard', 'dashboard', 'Home di carriera'], ['stagione-classifica', 'standings', 'Stagione · Classifica'], ['stagione-calendario', 'calendar', 'Stagione · Calendario'],
  ['stagione-coppe', 'coppe', 'Stagione · Coppe'], ['club', 'club', 'Club · rosa'], ['carriera-profilo', 'profile', 'Carriera · Profilo'], ['carriera-nazionale', 'nazionale', 'Carriera · Nazionale'],
  ['agente', 'agente', 'Agente'], ['ufficio', 'ufficio', 'Ufficio']];
const FINESTRE = [['offerta-trasferimento', 'Finestra · offerta di trasferimento', () => window.__CPM_CAREER.forceOffer()],
  ['mister', 'Finestra · il mister ti cerca', () => window.__CPM_CAREER.misterCerca249()],
  ['prepartita', 'Finestra · prima della partita', () => window.__CPM_CAREER.apriPartita('starter')],
  ['settimana', 'Finestra · settimana vissuta', () => window.__CPM_CAREER.apriSettimana ? window.__CPM_CAREER.apriSettimana('vissuta') : 'assente'],
  ['festa-trofeo', 'Cerimonia 2D · festa del trofeo', () => window.__CPM_CAREER.festa251('nation')],
  ['serata', 'Serata di presentazione', () => window.__CPM_CAREER.apriPresentazione(1)],
  ['fine-stagione', 'Fine stagione', () => window.__CPM_CAREER.apriFine302('stagione')],
  ['gala', 'Premiazioni di fine stagione', () => window.__CPM_CAREER.apriGala()],
  ['fine-carriera', 'Fine carriera', () => window.__CPM_CAREER.apriFine302('carriera')]];
const NOMI = Object.fromEntries([['home', 'Home fuori carriera'], ['impostazioni', 'Opzioni'], ['creazione', 'Creazione'], ['provini', 'Provini · prima del provino'], ['offerte', 'Offerte ricevute'], ['audio-serata', 'Serata · pannello audio'], ...SCHEDE.map(x => [x[0], x[2]]), ...FINESTRE.map(x => [x[0], x[1]])]);
const vuole = id => !SOLO || SOLO.includes(id);
/* tutte le schermate a una taglia: chiama mis(page,id) sulla schermata a vista */
async function schermate(t, rossi, mis) {
  const base = { seme: SEME, tema: 'scuro', rossi };
  const M = async (page, id) => { await attendiFermo(page); await congela(page); await mis(page, id); };
  if (vuole('home') || vuole('impostazioni') || vuole('creazione')) { const page = await apri(t, base, '?cpmtest=1'); if (vuole('home')) await M(page, 'home');
    if (vuole('impostazioni')) { if (await premi(page, 'Opzioni')) { await sleep(500); await M(page, 'impostazioni'); await premi(page, '^✕$'); await sleep(500); } else saltate.push(`impostazioni@${t.w}`); }
    if (vuole('creazione')) { if (await premi(page, 'Nuova carriera')) { await sleep(600); await M(page, 'creazione'); } else saltate.push(`creazione@${t.w}`); }
    await page.close(); }
  if (vuole('provini')) { const page = await apri(t, { ...base, trial: TRIAL('trial', []) }, '');
    if (await page.waitForFunction(() => /Provino|provino/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false)) await M(page, 'provini'); else saltate.push(`provini@${t.w}`); await page.close(); }
  if (vuole('offerte')) { const page = await apri(t, { ...base, trial: TRIAL('offers', RES3) }, '');
    if (await page.waitForFunction(() => /Offerte ricevute/.test(document.body.innerText || ''), null, { timeout: 30000 }).then(() => true).catch(() => false)) await M(page, 'offerte'); else saltate.push(`offerte@${t.w}`); await page.close(); }
  if (SCHEDE.some(s => vuole(s[0]))) { const page = await carriera(t, base); if (!page) saltate.push(`carriera@${t.w}`); else {
    for (const [id, tab] of SCHEDE) { if (!vuole(id)) continue; const r = await page.evaluate(x => window.__CPM_CAREER.goTab(x), tab); if (r !== true) { saltate.push(`${id}@${t.w}: goTab → ${r}`); continue; } await sleep(350); await M(page, id); }
    await page.close(); } }
  for (const [id, , apriF] of FINESTRE) { if (!vuole(id)) continue; const page = await carriera(t, base); if (!page) { saltate.push(`${id}@${t.w}: carriera`); continue; }
    let r = null; try { r = await page.evaluate(apriF); } catch (e) { r = 'error:' + e.message; }
    if (r !== true) { saltate.push(`${id}@${t.w}: apertura → ${r}`); await page.close(); continue; } await sleep(900); await M(page, id);
    if (id === 'serata' && vuole('audio-serata')) { const c = await page.evaluate(() => { const b = document.querySelector('[data-cpm="audio-serata299"]'); if (b) { b.click(); return true; } return false; }); if (c) { await sleep(400); await M(page, 'audio-serata'); } else if (!rossi.length) saltate.push(`audio-serata@${t.w}`); }
    await page.close(); }
}

if (CENS) {
  const cartella = ROSSO_C ? 'foto-prima' : 'foto'; const DATI = {};
  for (const t of TAGLIE) { await schermate(t, ROSSO_C ? ['__CPM_NO_G299'] : [], async (page, id) => { const m = await page.evaluate(ANGOLI); (DATI[id] = DATI[id] || {})[t.w] = m;
    const d = path.join(OUTD, cartella, String(t.w)); fs.mkdirSync(d, { recursive: true });
    if (m.tot > 0 || !ROSSO_C || ['club', 'serata', 'audio-serata'].includes(id)) { try { await page.screenshot({ path: path.join(d, id + '.jpg'), type: 'jpeg', quality: 60, timeout: 40000 }); } catch (e) { saltate.push(`foto ${id}@${t.w}`); } }
    if (id === 'club') { try { await page.evaluate(() => { const f = [...document.querySelectorAll('[data-cpm-fis]')].find(x => /^\s*Rosa/i.test(x.textContent || '')); const sc = document.querySelector('.cpm-scroll'); if (f) { f.scrollIntoView({ block: 'start' }); if (sc) sc.scrollTop -= 90; else window.scrollBy(0, -90); } }); await sleep(350); await page.screenshot({ path: path.join(d, 'club-rosa.jpg'), type: 'jpeg', quality: 78, timeout: 20000 }); await page.evaluate(() => { for (const s of document.querySelectorAll('.cpm-scroll')) s.scrollTop = 0; window.scrollTo(0, 0); }); } catch (e) { saltate.push(`foto club-rosa@${t.w}: ${String(e.message).slice(0, 60)}`); } }
    console.log(`  ${String(t.w).padEnd(5)}${id.padEnd(24)} riquadri ${String(m.riquadri).padStart(3)} · T ${m.T.length} · D ${m.D.length} · S ${m.S.length} · Q ${m.Q.length} · N ${m.N.length}`); }); }
  fs.mkdirSync(OUTD, { recursive: true });
  fs.writeFileSync(path.join(OUTD, ROSSO_C ? 'censimento-prima.json' : 'censimento.json'), JSON.stringify({ nomi: NOMI, dati: DATI, saltate, errori }, null, 1));
  console.log(saltate.length ? 'SALTATE: ' + saltate.join(' · ') : 'nessuna schermata saltata'); if (errori.length) console.log('ERRORI PAGINA: ' + [...new Set(errori)].slice(0, 6).join(' · '));
  await browser.close(); srv.close(); process.exit(0);
}

/* ── GUARDIANO ── */
const esiti = { verde: [], rosso: [] };
const T375 = TAGLIE[0];
/* A. ROSA */
const P0 = SAVE.player;
const conSpog = (arch) => ({ ...SAVE, player: { ...P0, teammates: null, __arch299: arch } });
async function leggiRosa(page) { await page.evaluate(() => window.__CPM_CAREER.goTab('club')); await sleep(500); await attendiFermo(page);
  return page.evaluate(() => { const out = { righe: 0, C: [], VC: [], R: null, stile: {} };
    const st = e => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return { h: Math.round(r.height), w: Math.round(r.width), bg: cs.backgroundColor, col: cs.color, rad: cs.borderTopLeftRadius, fs: cs.fontSize, fw: cs.fontWeight, top: Math.round(r.top), left: Math.round(r.left) }; };
    for (const s of document.querySelectorAll('[data-cpm="rosa-ruolo228"]')) { const riga = s.parentElement; out.righe++; const nome = (riga.children[2] && riga.children[2].textContent || '').replace(/^★\s*/, '').trim();
      const rr = s.getBoundingClientRect();
      for (const f of riga.querySelectorAll('[data-cpm="fascia299"]')) { const o = st(f); (f.getAttribute('data-fascia') === 'VC' ? out.VC : out.C).push({ nome, testo: f.textContent, ...o, accanto: Math.abs((o.top + o.h / 2) - (rr.top + rr.height / 2)) <= 6 && o.left < rr.left && rr.left - (o.left + o.w) <= 40 }); }
      const R = riga.querySelector('[data-cpm="rigorista257"]'); if (R && !out.R) out.R = st(R); }
    let pl = null; try { pl = JSON.parse(localStorage.getItem('cpm-v3')).player; } catch (_e) {}/* il salvataggio automatico: i dati veri (compagni dopo la migrazione) */ out.io = pl && pl.name; out.isCap = !!(pl && pl.isCaptain); out.tm = pl && (pl.teammates || []).map(t => t.archetype + ':' + t.name);
    out.viceP = !!(pl && window.__CPM_PATTO238 && window.__CPM_PATTO238.premio(pl, 'vice')); return out; });
}
async function braccioRosa(k, rossi) { const E = esiti[k]; const base = { seme: SEME, tema: 'scuro', rossi };
  const casi = [['banco', SAVE], ['eroe capitano', { ...SAVE, player: { ...P0, isCaptain: true, captainSince: 10 } }], ['eroe vice (patto)', { ...SAVE, player: { ...P0, isCaptain: false, premiPatto227: { vice: (P0.club && P0.club.id) || '' } } }]];
  let visti = { spog: 0, att: 0 };
  for (const [nome, save] of casi) { const page = await carriera(T375, base, save); if (!page) { E.push({ ok: false, s: `A · ${nome}: NON GIUDICATO (carriera non aperta)` }); continue; }
    const r = await leggiRosa(page);
    if (nome === 'banco') { await page.screenshot({ path: path.join(ROOT, 'tests/visual/out', `rosa-299-${k}.jpg`), type: 'jpeg', quality: 70 }).catch(() => {}); }
    await page.close();
    if (!r.righe) { E.push({ ok: false, s: `A · ${nome}: NON GIUDICATO (nessuna riga della Rosa)` }); continue; }
    const capTm = (r.tm || []).find(x => /^capitano:/.test(x)), exTm = (r.tm || []).find(x => /^ex_capitano:/.test(x));
    /* l'atteso si ricava QUI dai dati, non dalla funzione del gioco: dove il dato c'e' (eroe, spogliatoio) il nome e' obbligato */
    const attC = r.isCap ? r.io : capTm ? capTm.split(':')[1] : exTm ? exTm.split(':')[1] : null;
    const attV = (!r.isCap && r.viceP) ? r.io : (r.isCap && exTm) ? exTm.split(':')[1] : null;
    if (capTm) visti.spog++; else if (!r.isCap) visti.att++;
    const c = r.C[0], v = r.VC[0];
    E.push({ ok: r.C.length === 1 && c.testo === 'C' && (attC == null || c.nome === attC), s: `A · ${nome}: una «C» sola e sul capitano giusto — trovate ${r.C.length}${c ? ' su «' + c.nome + '»' : ''}${attC ? ' (atteso «' + attC + '»)' : ' (dato assente: regola dell\'attitudine)'} · spogliatoio ${JSON.stringify(r.tm)}` });
    E.push({ ok: r.VC.length === 1 && v.testo === 'VC' && (attV == null || v.nome === attV) && (!c || v.nome !== c.nome), s: `A · ${nome}: una «VC» sola, giusta e diversa dal capitano — trovate ${r.VC.length}${v ? ' su «' + v.nome + '»' : ''}${attV ? ' (atteso «' + attV + '»)' : ''}` });
    if (nome === 'banco') { const R = r.R; const pari = (a) => a && R && a.h === R.h && a.bg === R.bg && a.rad === R.rad && a.fs === R.fs && a.fw === R.fw && a.col === R.col;
      E.push({ ok: !!R && pari(c) && pari(v), s: `A · stesso pallino della «R» (altezza, fondo, raggio, carattere): R ${JSON.stringify(R)} · C ${JSON.stringify(c && { h: c.h, w: c.w, bg: c.bg, rad: c.rad, fs: c.fs })} · VC ${JSON.stringify(v && { h: v.h, w: v.w, bg: v.bg, rad: v.rad, fs: v.fs })}` });
      E.push({ ok: !!c && !!v && c.accanto && v.accanto, s: `A · «C» e «VC» accanto al ruolo (stessa riga, subito a sinistra della sigla): C ${c && c.accanto} · VC ${v && v.accanto}` }); }
  }
  E.push({ ok: visti.spog + visti.att > 0, s: `A · casi coperti: capitano dallo spogliatoio ${visti.spog}, dalla regola dell'attitudine ${visti.att}` });
}
/* B. ANGOLI */
async function braccioAngoli(k, rossi) { const E = esiti[k]; const viste = {}; let tot = 0; const peggio = [];
  for (const t of TAGLIE) { await schermate(t, rossi, async (page, id) => { const m = await page.evaluate(ANGOLI); (viste[id] = viste[id] || {})[t.w] = m; tot += m.tot;
    if (m.tot) peggio.push(`${id}@${t.w}: T ${m.T.length} D ${m.D.length} S ${m.S.length} Q ${m.Q.length} N ${m.N.length}` + ' — ' + [...m.T.map(x => 'T ' + x.a + ' ↕ ' + x.b + ' [' + x.ra + ' | ' + x.rb + ']'), ...m.D.map(x => 'D ' + x.a + ' ↕ ' + x.b), ...m.S.map(x => 'S ' + x.figlio + ' fuori da ' + x.padre + ' ' + x.px + 'px'), ...m.Q.map(x => 'Q ' + x.d + ' ' + x.r), ...m.N.map(x => 'N ' + x.figlio + ' ' + x.rf + '>' + x.rp)].slice(0, 3).join(' ; ')); }); }
  const ids = Object.keys(NOMI).filter(vuole).filter(id => !(k === 'rosso' && id === 'audio-serata'));
  const manca = []; for (const id of ids) for (const t of TAGLIE) if (!(viste[id] && viste[id][t.w])) manca.push(id + '@' + t.w);
  E.push({ ok: manca.length === 0, s: `B · schermate giudicate ${ids.length * TAGLIE.length - manca.length}/${ids.length * TAGLIE.length}${manca.length ? ' — NON GIUDICATE: ' + manca.join(', ') : ''}` });
  E.push({ ok: tot === 0, s: `B · difetti d'angolo su tutte le schermate: ${tot}${peggio.length ? '\n      ' + peggio.slice(0, 12).join('\n      ') : ''}` });
  const club = TAGLIE.map(t => viste.club && viste.club[t.w]).filter(Boolean);
  E.push({ ok: club.length === TAGLIE.length && club.every(m => m.T.length === 0), s: `B · Club › Rosa (foto del PO): attacchi incoerenti testata/riquadro ${club.map(m => m.T.length).join(' / ')} alle tre taglie` });
  return viste;
}
/* C. AUDIO NELLA SERATA */
async function braccioAudio(k, rossi) { const E = esiti[k];
  for (const t of [TAGLIE[0], TAGLIE[2]]) { const page = await carriera(t, { seme: SEME, tema: 'scuro', rossi }); if (!page) { E.push({ ok: false, s: `C · ${t.w}: NON GIUDICATO` }); continue; }
    const ap = await page.evaluate(() => window.__CPM_CAREER.apriPresentazione(1)); await sleep(900);
    const aperta = await page.evaluate(() => /SERATA DI PRESENTAZIONE/.test(document.body.innerText || ''));
    if (ap !== true || !aperta) { E.push({ ok: false, s: `C · ${t.w}: NON GIUDICATO (la serata non si apre: ${ap})` }); await page.close(); continue; }
    const tasto = await page.evaluate(() => { const b = document.querySelector('[data-cpm="audio-serata299"]'); if (!b) return null; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { w: Math.round(r.width), h: Math.round(r.height), ico: b.textContent, sopra: e === b || b.contains(e), dentro: r.left >= 0 && r.right <= innerWidth && r.top >= 0 }; });
    E.push({ ok: !!tasto && tasto.sopra && tasto.dentro && tasto.w >= 40 && tasto.h >= 40, s: `C · ${t.w}: tasto audio nella serata, toccabile (>= 40 px, non coperto) — ${JSON.stringify(tasto)}` });
    if (!tasto) { await page.close(); continue; }
    if (t === TAGLIE[0]) await page.screenshot({ path: path.join(ROOT, 'tests/visual/out', `serata-299-${k}.jpg`), type: 'jpeg', quality: 70 }).catch(() => {});
    const prima = await page.evaluate(() => ({ cfg: !!AudioMgr.getCfg().mute, ls: localStorage.getItem('cpm-audio'), chiavi: Object.keys(localStorage).filter(x => /audio/i.test(x)).sort().join(',') }));
    await page.click('[data-cpm="audio-serata299"]'); await sleep(400);
    const pann = await page.evaluate(() => { const p = document.querySelector('[data-cpm="audio-pannello"]'); return p ? { cursori: ['crowd', 'match', 'music'].every(x => !!p.querySelector('[data-cpm="audio-' + x + '"]')), muto: !!p.querySelector('[data-cpm="audio-muto"]'), testo: (p.innerText || '').replace(/\s+/g, ' ') } : null; });
    E.push({ ok: !!pann && pann.cursori && pann.muto && !/Partita in pausa|Riprendi la partita/.test(pann.testo), s: `C · ${t.w}: stesso pannello della partita (Pubblico/Effetti/Musica + Muto), senza le scritte di partita — ${pann ? pann.testo.slice(0, 90) : 'assente'}` });
    if (!pann) { await page.close(); continue; }
    await page.click('[data-cpm="audio-muto"]'); await sleep(300);
    const dopo = await page.evaluate(() => ({ cfg: !!AudioMgr.getCfg().mute, ls: localStorage.getItem('cpm-audio'), chiavi: Object.keys(localStorage).filter(x => /audio/i.test(x)).sort().join(',') }));
    let lsM = null; try { lsM = !!JSON.parse(dopo.ls).mute; } catch (_e) {}
    E.push({ ok: dopo.cfg !== prima.cfg && lsM === dopo.cfg && dopo.ls !== prima.ls, s: `C · ${t.w}: il Muto cambia lo stato (AudioMgr ${prima.cfg} → ${dopo.cfg}; 'cpm-audio' mute=${lsM})` });
    E.push({ ok: dopo.chiavi === prima.chiavi || dopo.chiavi === 'cpm-audio', s: `C · ${t.w}: nessun secondo salvataggio (chiavi audio: prima «${prima.chiavi}» dopo «${dopo.chiavi}»)` });
    await page.click('[data-cpm="audio-chiudi"]'); await sleep(350);
    const fine = await page.evaluate(() => ({ pann: !!document.querySelector('[data-cpm="audio-pannello"]'), ico: (document.querySelector('[data-cpm="audio-serata299"]') || {}).textContent, serata: /SERATA DI PRESENTAZIONE/.test(document.body.innerText || '') }));
    E.push({ ok: !fine.pann && fine.serata && fine.ico !== tasto.ico, s: `C · ${t.w}: chiuso il pannello la serata e' ancora li' e l'icona del tasto e' cambiata (${tasto.ico} → ${fine.ico})` });
    await page.close(); }
}
fs.mkdirSync(path.join(ROOT, 'tests/visual/out'), { recursive: true });
for (const [k, rossi] of [['verde', []], ['rosso', ['__CPM_NO_G299']]]) { await braccioRosa(k, rossi); await braccioAngoli(k, rossi); await braccioAudio(k, rossi); }
await browser.close(); srv.close();
/* GIUDIZIO: verde tutto ok; rosso deve cadere su A (C/VC), B (Club) e C (tasto) */
if (saltate.length) console.log('schermate saltate: ' + [...new Set(saltate)].join(' · '));
if (errori.length) console.log('errori di pagina (informativi): ' + [...new Set(errori)].slice(0, 5).join(' · '));
console.log('\n── BRACCIO ROSSO (__CPM_NO_G299) ──'); for (const e of esiti.rosso) console.log((e.ok ? 'ok  ' : 'KO  ') + e.s);
console.log('\n── BRACCIO VERDE ──'); for (const e of esiti.verde) console.log((e.ok ? 'ok  ' : 'KO  ') + e.s);
const koV = esiti.verde.filter(e => !e.ok).length;
const cade = (rx) => esiti.rosso.some(e => rx.test(e.s) && !e.ok);
const rossoA = cade(/^A · .*«C» sola/), rossoB = cade(/^B · Club › Rosa/), rossoC = cade(/^C · .*tasto audio nella serata/);
const nonG = esiti.rosso.concat(esiti.verde).filter(e => /NON GIUDICAT/.test(e.s) && !e.ok).length;
console.log(`\nverde: ${koV} controlli falliti su ${esiti.verde.length} · rosso: cade su A ${rossoA ? 'sì' : 'NO'}, B ${rossoB ? 'sì' : 'NO'}, C ${rossoC ? 'sì' : 'NO'} · non giudicati ${nonG}`);
const ok = koV === 0 && rossoA && rossoB && rossoC && nonG === 0;
console.log(ok ? 'rosa-angoli-299: VERDE (verde col verde, rosso col rosso)' : 'rosa-angoli-299: ROSSO');
process.exit(ok ? 0 : 1);
