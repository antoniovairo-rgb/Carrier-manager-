#!/usr/bin/env node
/* [giro 234 · PO-393/455/459] GUARDIANO accessibilita-234. Gioco vero (?cpmtest=1), carriera di prova del giro 195
   (fixtures/save-c177-s5w20.json), telefono con tocco (isMobile) a 375 e 360 px. Misure da misura-234.mjs.
   Giudica, per ogni braccio:
     Z  zoom con due dita (gesto a due dita vero, CDP): in carriera la scala sale (> 1,5); in partita (provino, fase di gioco) resta 1
        e la pagina dichiara touch-action pan-x pan-y.
     G  testo grande (interruttore «Testo grande» acceso, cpm-testo-grande=1, corpi ×1,3) a 360 e 375: in Classifica la colonna dei
        punti (intestazione + 18 righe) dentro il bordo visibile, nessun testo tagliato, nessuna etichetta tagliata, nessuno
        scorrimento orizzontale della pagina; il corpo minimo e' davvero salito (>= 15,5 px, se no la prova non vale).
     C  i 5 cursori dell'audio in Opzioni hanno area di tocco >= 44 px sul lato minore.
     N  nomi per i lettori di schermo (albero di accessibilita' di Chromium): ogni scheda (8) ha almeno un titolo; la voce attiva della
        barra e' dichiarata (aria-current/aria-selected); le Opzioni sono una finestra modale col nome «Opzioni»; la finestra della
        settimana e quella della partita (apriSettimana/apriPartita) sono finestre modali; i 12 comandi audio (5 cursori + 7
        interruttori) hanno nome; l'interruttore «Testo grande» c'e'.
     V  in Opzioni si legge «Versione <GAME_VERSION>».
     P  in pausa, al tocco: «Tocca per riprendere» (niente «Premi P»).
     K  Club a 375: progetto/curva/staff in un blocco largo almeno l'85% della fascia (prima: colonna di ~150 px).
     E  Coppe: testi su sfumatura >= 4,5:1 nelle tre coppe europee (UCL/UEL/UECL) — gia' corretto dal giro 218, qui solo tenuto.
     M  manifest (statico): web e TWA con gli stessi colori del tema (#0d0f14) anche in theme-color, descrizione in italiano (lang it).
        Prova del rosso di M: lo stesso giudizio sui file di lavoro/197 (git) deve bocciare.
   Bracci: VERDE (gioco) deve passare tutto; ROSSO window.__CPM_NO_G234 deve essere bocciato. «Non giudicato» (misura mancante,
   fase non raggiunta, errori di pagina) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node accessibilita-234.mjs */
import fs from 'node:fs'; import path from 'node:path'; import { execSync } from 'node:child_process';
import { ROOT, startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apri, vai, zoom, classifica, opzioni, chiudiOpzioni, lettore, finestra, partita, SFUM } from './misura-234.mjs';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const VER = (fs.readFileSync(path.join(ROOT, 'CARRIER-MANAGER-AV.html'), 'utf8').match(/const GAME_VERSION="([0-9.]+)"/) || [])[1];
const SCHEDE = ['dashboard', 'standings', 'calendar', 'coppe', 'club', 'profile', 'agente', 'ufficio'];

function giudicaManifest(web, twa, tj, head) {
  const ko = []; const meta = (head.match(/<meta name="theme-color" content="([^"]+)"/) || [])[1];
  const c = new Set([web.theme_color, web.background_color, twa.theme_color, twa.background_color, tj.themeColor, tj.backgroundColor, meta].map(x => String(x || '').toLowerCase()));
  if (c.size !== 1 || !c.has('#0d0f14')) ko.push('colori diversi: ' + [...c].join(' '));
  for (const [n, d] of [['web', web], ['twa', twa]]) { if (!/[àèéìòù]|\b(carriera|calciatore|della|dalle|ai|di)\b/i.test(d.description || '') || /\b(from|football|career|legend)\b/i.test(d.description || '')) ko.push(`descrizione ${n} non italiana «${d.description}»`); if (d.lang !== 'it') ko.push(`lang ${n} = ${d.lang}`); }
  return ko;
}
const leggi = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const leggiGit = f => execSync(`git show lavoro/197:${f}`, { cwd: ROOT, encoding: 'utf8' });

async function braccio(b, port, rosso) {
  const flags = rosso ? ['__CPM_NO_G234'] : []; const ko = []; const num = {};
  const nonG = (m) => ko.push('non giudicato: ' + m);
  /* pagina 1: 375, carriera normale */
  const a = await apri(b, port, 375, { flags });
  try {
    const z = await zoom(a.page, a.cdp); num.zoomCarriera = z.scala; if (!(z.scala > 1.5)) ko.push(`Z zoom in carriera bloccato (scala ${z.scala}, meta «${z.meta}»)`);
    const L = await lettore(a.page, a.cdp, SCHEDE);
    const senzaTitolo = SCHEDE.filter(t => !L[t] || !L[t].titoli.length); if (senzaTitolo.length) ko.push('N schede senza titolo: ' + senzaTitolo.join(','));
    const senzaAttiva = SCHEDE.filter(t => !L[t] || !L[t].attiva.length); if (senzaAttiva.length) ko.push('N voce attiva non dichiarata: ' + senzaAttiva.join(','));
    num.titoli = SCHEDE.map(t => L[t] ? L[t].titoli.length : 0).join('/');
    /* E: coppe europee */
    for (const comp of ['UCL', 'UEL', 'UECL']) {
      await a.page.evaluate((c) => { const p = window.__CPM_CAREER.snapshot(); window.__CPM_CAREER.patch({ euro: { ...(p.euro || {}), competition: c } }); }, comp);
      await vai(a.page, 'coppe'); const g = await a.page.evaluate(SFUM);
      if (!g.n) nonG(`E ${comp}: nessun testo su sfumatura`); else { const w = g.elenco[0]; num['coppe' + comp] = w.rapporto; if (w.rapporto < 4.5) ko.push(`E ${comp} «${w.testo}» ${w.rapporto}:1`); }
    }
    /* K: club */
    await vai(a.page, 'club');
    const k = await a.page.evaluate(() => { const card = document.querySelector('[data-cpm="club-v2"]'); if (!card) return null; const rc = card.getBoundingClientRect();
      const t = [...card.querySelectorAll('span')].find(s => /Curva:|Progetto|medico sociale/.test(s.textContent)); if (!t) return { card: rc.width, blocco: null };
      return { card: Math.round(rc.width), blocco: Math.round(t.parentElement.getBoundingClientRect().width) }; });
    if (!k || !k.blocco) nonG('K riquadro del Club o righe di dettaglio non trovati'); else { num.club = `${k.blocco}/${k.card}`; if (k.blocco < 0.85 * k.card) ko.push(`K dettagli del Club in una colonna di ${k.blocco} px su ${k.card}`); }
    /* Opzioni */
    await vai(a.page, 'dashboard'); const o = await opzioni(a.page, a.cdp);
    if (!o.aperta) nonG('Opzioni non aperte');
    else {
      if (o.cursori.length !== 5) nonG(`C cursori trovati ${o.cursori.length} invece di 5`);
      const piccoli = o.cursori.filter(c => Math.min(c.w, c.h) < 44); num.cursori = o.cursori.map(c => c.h).join('/'); if (piccoli.length) ko.push(`C ${piccoli.length} cursori sotto 44 px (${piccoli.map(c => c.h).join(',')})`);
      const audio = o.comandi.filter(c => !/Testo grande|Riduci animazioni/i.test(c.nome));
      const conNome = audio.filter(c => c.nome).length; num.comandiAudio = `${conNome}/${audio.length}`;
      if (audio.length < 12 || conNome < 12) ko.push(`N comandi audio con nome ${conNome} su ${audio.length} (servono 12)`);
      if (!o.dialoghi.some(d => /Opzioni/.test(d))) ko.push('N Opzioni non e\' una finestra con nome');
      if (!o.comandi.some(c => c.ruolo === 'switch' && /Testo grande/.test(c.nome))) ko.push('G interruttore «Testo grande» assente');
      if (o.versione !== VER) ko.push(`V versione in Opzioni «${o.versione}» (attesa ${VER})`);
      await chiudiOpzioni(a.page);
    }
    const f = await finestra(a.page, a.cdp);
    for (const k2 of ['apriSettimana', 'apriPartita']) { if (!f[k2] || f[k2].esito !== 'true') nonG(`N ${k2} non aperta (${f[k2] && f[k2].esito})`); else if (!f[k2].dialoghi.some(d => d.modale)) ko.push(`N ${k2}: nessuna finestra modale nell'albero`); }
    if (a.errs.length) nonG('errori di pagina: ' + a.errs.slice(0, 2).join(' / '));
  } catch (e) { nonG(String(e.message).slice(0, 160)); } finally { await a.ctx.close(); }
  /* pagine 2-3: testo grande a 360 e 375 */
  for (const w of [360, 375]) {
    const g = await apri(b, port, w, { flags, ls: { 'cpm-testo-grande': '1' } });
    try {
      await vai(g.page, 'standings'); const c = await classifica(g.page);
      num['tg' + w] = `pt ${c.ptCelle - c.ptFuori}/${c.ptCelle} · corpo ${c.corpoMin}`;
      if (c.corpoMin < 15.5) nonG(`G ${w}: testo grande non applicato (corpo minimo ${c.corpoMin})`);
      if (!c.pt || c.ptCelle < 10) nonG(`G ${w}: colonna Pt non trovata`);
      if (c.ptFuori) ko.push(`G ${w}: ${c.ptFuori} celle Pt fuori dal bordo (${c.ptDettaglio.join(' ')})`);
      if (c.tagliati) ko.push(`G ${w}: ${c.tagliati} testi tagliati (${c.tagliatiEs.join(' | ')})`);
      if (c.etTagliate.length) ko.push(`G ${w}: etichette tagliate ${c.etTagliate.join(',')}`);
      if (c.overflow > 0) ko.push(`G ${w}: scorrimento orizzontale ${c.overflow} px`);
      if (g.errs.length) nonG('errori di pagina: ' + g.errs.slice(0, 2).join(' / '));
    } catch (e) { nonG(String(e.message).slice(0, 160)); } finally { await g.ctx.close(); }
  }
  /* pagina 4: partita (provino) */
  try {
    const p = await partita(b, port, 375, flags);
    if (p.fase !== 'playing' && !/^hl_/.test(p.fase || '')) nonG(`P/Z partita non raggiunta (fase ${p.fase})`);
    num.zoomPartita = p.zoom.scala;
    if (!(p.zoom.scala <= 1.05)) ko.push(`Z in partita lo zoom passa (scala ${p.zoom.scala})`);
    if (!/pan-x pan-y/.test(p.zoom.touchAction || '')) ko.push(`Z in partita touch-action «${p.zoom.touchAction}»`);
    if (!p.pausa) nonG('P scritta della pausa non trovata'); else if (/Premi P/.test(p.pausa)) ko.push(`P pausa «${p.pausa}»`);
    num.pausa = p.pausa; if (p.errori) nonG(`errori di pagina in partita: ${p.errori}`);
  } catch (e) { nonG('partita: ' + String(e.message).slice(0, 160)); }
  return { ok: ko.length === 0, ko, num };
}

/* M: statico, con la sua prova del rosso sui file della base */
const mOggi = giudicaManifest(JSON.parse(leggi('manifest.webmanifest')), JSON.parse(leggi('twa/manifest-twa.webmanifest')), JSON.parse(leggi('twa/twa-manifest.json')), leggi('src/00-head.html'));
let mBase = null; try { mBase = giudicaManifest(JSON.parse(leggiGit('manifest.webmanifest')), JSON.parse(leggiGit('twa/manifest-twa.webmanifest')), JSON.parse(leggiGit('twa/twa-manifest.json')), leggiGit('src/00-head.html')); } catch (e) { mBase = null; }

const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
let v, r;
try { v = await braccio(b, port, false); r = await braccio(b, port, true); }
finally { await b.close(); srv.close(); }
const mOk = mOggi.length === 0, mRossoOk = !!(mBase && mBase.length);
console.log(`M manifest oggi: ${mOk ? '✓' : '✗ ' + mOggi.join(' | ')} · sulla base lavoro/197: ${mBase == null ? '✗ non giudicato (git)' : mBase.length ? '✓ bocciata (' + mBase.length + ' motivi)' : '✗ passa'}`);
const ok = v.ok && mOk && !r.ok && mRossoOk;
console.log(`VERDE: ${v.ok ? '✓' : '✗'} ${JSON.stringify(v.num)}${v.ko.length ? ' · ' + v.ko.join(' | ') : ''}`);
console.log(`ROSSO __CPM_NO_G234: ${!r.ok ? '✓ bocciato' : '✗ passa'} (${r.ko.length} motivi) ${r.ko.join(' | ')}`);
console.log(ok ? '✓ accessibilita-234 VERDE' : '✗ accessibilita-234 ROSSO');
process.exit(ok ? 0 : 1);
