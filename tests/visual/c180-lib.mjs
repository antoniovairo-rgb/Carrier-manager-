/* [collaudo grafico 180 · richiesta PO 06/11] Libreria del censimento c180-*.mjs. Solo lettura sul gioco: non tocca src/.
   Lezione della 179 (Home bocciata sul telefono con FC Merseyside): i guardiani grafici provavano UN club scuro e nomi corti.
   Qui ogni schermata si misura con TRE club (rosso vivo · giallo/chiaro col nome lungo · scuro) e col nome del giocatore lungo,
   in tre formati (360x800 · 412x915 · 1440x900). In piu' rispetto al rilevatore D() del 178:
   - CONTRASTO SUI PIXEL: per ogni riga di testo il fondo e' la MEDIANA dei pixel dello screenshot dentro il rettangolo della riga
     (quindi vale anche su gradienti, foto, tinte del club e campo 2D, che il metro DOM esclude); il colore del testo e' quello CSS.
     Soglia WCAG 4,5:1 (3:1 se corpo >= 18 px o >= 14 px grassetto). Approssimazione dichiarata: un'ombra del testo non e' contata.
   - PAROLE SPEZZATE: una parola di 4+ lettere i cui caratteri stanno su due righe (spezzata senza trattino).
   - COPERTO A FINE SCORRIMENTO: portato in fondo il contenitore che scorre, testi del contenuto sotto una fascia fissa. */
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { D, sintesiGap, ferma, congela, premi, sleep } from './c178-graf-lib.mjs';
export { premi, sleep };
const QUI = path.dirname(new URL(import.meta.url).pathname);
export const FOTO_DIR = process.env.C180_FOTO || path.join(QUI, '../../docs/collaudo-grafico/180');
export const DATI_DIR = process.env.C180_DATI || '/tmp/claude-0/-home-user-Carrier-manager-/6bfca43f-17e9-54cc-a0d2-57cb0fb5d3ea/scratchpad/c180';
fs.mkdirSync(FOTO_DIR, { recursive: true }); fs.mkdirSync(DATI_DIR, { recursive: true });
export const FORMATI = {
  s360: { k: 's360', nome: '360x800', w: 360, h: 800, touch: true },
  s412: { k: 's412', nome: '412x915', w: 412, h: 915, touch: true },
  pc: { k: 'pc', nome: '1440x900', w: 1440, h: 900, touch: false },
};
export const scelti = () => (process.env.C180_FORMATI || 's360,s412,pc').split(',').filter(k => FORMATI[k]).map(k => FORMATI[k]);
/* i club si leggono dal database del gioco (src/02), non si inventano */
const SRC02 = fs.readFileSync(path.join(QUI, '../../src/02-club-leghe-albo.jsx'), 'utf8');
export const DB = [...SRC02.matchAll(/mkT\("([^"]+)","([^"]+)","([^"]+)",(\d+),"([^"]+)","([^"]+)","([^"]+)","([^"]+)"\)/g)].map(m => ({ id: m[1], n: m[2], a: m[3], p: +m[4], c: m[5], c2: m[6], nat: m[7], lg: m[8] }));
export const CLUB_PROVA = {
  rosso: 'liv',   /* FC Merseyside #dc2626 — il caso della foto del PO */
  giallo: 'wol',  /* FC Wolverhampton #f59e0b — chiaro, e nome di 16 caratteri */
  scuro: 'new',   /* FC Tyneside #0f0f0f */
};
export const scelteClub = () => (process.env.C180_CLUB || 'rosso,giallo,scuro').split(',').filter(k => CLUB_PROVA[k]);
export const NOME_LUNGO = 'Massimiliano Bartolomucci'; /* 25 caratteri, cognome di 12 */
/* salvataggio di carriera: quello del banco G0 (stagione 12, archivio pieno), portato nel club e nella sua lega con classifica coerente */
export function saveDi(SAVE0, chiave) {
  const S = JSON.parse(JSON.stringify(SAVE0)); const P = S.player; const club = DB.find(c => c.id === CLUB_PROVA[chiave]);
  const lega = DB.filter(c => c.lg === club.lg); P.club = { ...club }; P.name = NOME_LUNGO;
  const avv = lega.filter(c => c.id !== club.id);
  P.matchHistory = P.matchHistory.map((m, i) => ({ ...m, opponent: avv[i % avv.length].n }));
  const T = Object.fromEntries(lega.map(c => [c.id, { id: c.id, n: c.n, a: c.a, p: c.p, lg: c.lg, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, gd: 0, pts: 0 }]));
  const es = (h, a, gh, ga) => { for (const [x, f, c] of [[T[h], gh, ga], [T[a], ga, gh]]) { x.played++; x.gf += f; x.ga += c; x.gd = x.gf - x.ga; if (f > c) { x.wins++; x.pts += 3; } else if (f === c) { x.draws++; x.pts++; } else x.losses++; } };
  let s = 20261106; const rnd = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
  P.matchHistory.forEach((m, k) => { const o = avv[k % avv.length].id; if (m.isHome) es(club.id, o, m.homeScore, m.awayScore); else es(o, club.id, m.awayScore, m.homeScore);
    const resto = lega.map(x => x.id).filter(id => id !== club.id && id !== o); const rot = resto.slice(k % resto.length).concat(resto.slice(0, k % resto.length));
    for (let i = 0; i + 1 < rot.length; i += 2) es(rot[i], rot[i + 1], Math.floor(rnd() * 2.2 + T[rot[i]].p / 60), Math.floor(rnd() * 2.2 + T[rot[i + 1]].p / 60)); });
  P.standings = Object.values(T).sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  if (P.rival) P.rival.club = { ...avv[0] };
  delete P.calendar; /* rigenerata dal gioco sulla lega giusta */
  return S;
}
/* salvataggio di partita (primavera, settimana 38): stesso club colorato come la prova, versione U18 */
export function savePartitaDi(SAVEP, chiave, casa) {
  const S = JSON.parse(JSON.stringify(SAVEP)); const P = S.player; const club = DB.find(c => c.id === CLUB_PROVA[chiave]);
  P.club = { ...P.club, n: club.n + ' Primavera', a: club.a, c: club.c, c2: club.c2 }; P.name = NOME_LUNGO;
  if (casa != null) for (const c of (P.calendar || [])) if (!c.played) c.isHome = !!casa;
  return S;
}
/* ── misura dentro la pagina: righe di testo, parole spezzate, coperture ── */
export function RIGHE() {
  const W = innerWidth, H = innerHeight, out = [], spezzate = [];
  const gcs = e => getComputedStyle(e);
  const opac = e => { let o = 1; for (let a = e; a && a.nodeType === 1; a = a.parentElement) o *= +gcs(a).opacity; return o; };
  const sel = e => { let s = e.tagName.toLowerCase(); const dc = e.getAttribute('data-cpm'); if (dc) s += '[' + dc + ']'; return s; };
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
  while ((n = tw.nextNode()) && k < 3000) {
    const v = n.nodeValue || ''; if (!/[\p{L}\p{N}]/u.test(v)) continue; const p = n.parentElement; if (!p || /SCRIPT|STYLE|NOSCRIPT|TITLE/.test(p.tagName)) continue;
    const c = gcs(p); if (c.display === 'none' || c.visibility === 'hidden' || opac(p) < 0.15) continue;
    const rg = document.createRange(); rg.selectNodeContents(n); const rs = [...rg.getClientRects()].filter(r => r.width > 2 && r.height > 4 && r.bottom > 0 && r.top < H && r.right > 0 && r.left < W);
    if (!rs.length) continue; k++;
    const fs = parseFloat(c.fontSize), fw = parseInt(c.fontWeight) || 400;
    const libero = r => { const x = Math.min(W - 1, Math.max(0, r.left + Math.min(r.width / 2, 8))), y = Math.min(H - 1, Math.max(0, r.top + r.height / 2)); const t = document.elementFromPoint(x, y); return !!t && (t === p || p.contains(t) || t.contains(p)); };
    for (const r of rs.slice(0, 3)) if (libero(r)) out.push({ t: v.trim().slice(0, 40), col: c.color, fs, fw, x: Math.max(0, Math.round(r.left)), y: Math.max(0, Math.round(r.top)), w: Math.round(Math.min(r.right, W) - Math.max(0, r.left)), h: Math.round(Math.min(r.bottom, H) - Math.max(0, r.top)), s: sel(p), sh: c.textShadow !== 'none' ? 1 : 0, svg: p.ownerSVGElement ? 1 : 0 });
    /* parole spezzate senza trattino: lettere della stessa parola su righe diverse */
    if (rs.length > 1 && spezzate.length < 12) {
      const re = /[\p{L}]{4,}/gu; let m;
      while ((m = re.exec(v))) { const r2 = document.createRange(); r2.setStart(n, m.index); r2.setEnd(n, m.index + m[0].length); const q = [...r2.getClientRects()].filter(r => r.width > 1);
        if (q.length > 1 && Math.abs(q[0].top - q[q.length - 1].top) > 3) spezzate.push({ parola: m[0], testo: v.trim().slice(0, 40), s: sel(p), y: Math.round(q[0].top) }); }
    }
  }
  /* fasce fisse (non a tutto schermo) e testi del contenuto che finiscono sotto */
  const fasce = []; for (const e of document.body.querySelectorAll('*')) { const c = gcs(e); if (c.position !== 'fixed' && c.position !== 'sticky') continue; if (c.display === 'none' || +c.opacity < 0.1) continue; const r = e.getBoundingClientRect(); if (r.width < 0.3 * W || r.height < 20 || r.width * r.height > 0.5 * W * H) continue; if (!(e.textContent || '').trim() && !e.querySelector('button,svg,img')) continue; if (r.top < H * 0.5) continue; fasce.push({ e, r }); }
  const coperti = [];
  if (fasce.length) { const tw2 = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let m2;
    while ((m2 = tw2.nextNode()) && coperti.length < 10) { const p = m2.parentElement; if (!p || !/[\p{L}\p{N}]/u.test(m2.nodeValue || '')) continue; if (fasce.some(f => f.e.contains(p))) continue; const c = gcs(p); if (c.display === 'none' || c.visibility === 'hidden' || opac(p) < 0.15) continue;
      if (p.closest('[style*="position: fixed"],[style*="position:fixed"]')) continue;
      const rg = document.createRange(); rg.selectNodeContents(m2); const r = rg.getBoundingClientRect(); if (r.width < 2 || r.bottom < 0 || r.top > H) continue;
      for (const f of fasce) { const oy = Math.min(r.bottom, f.r.bottom) - Math.max(r.top, f.r.top), ox = Math.min(r.right, f.r.right) - Math.max(r.left, f.r.left); if (oy > r.height * 0.5 && ox > 4) { coperti.push({ t: (m2.nodeValue || '').trim().slice(0, 36), fascia: (f.e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), y: Math.round(r.top), fy: Math.round(f.r.top) }); break; } } } }
  /* stile: famiglie, raggi, colori V1 (avorio/granata) */
  const fam = {}, rag = {}, v1 = [];
  /* tavolozza V1 tolta alla tappa 4 (git 75ffedd): avorio f5f3ef/f7f5f1/f1efe9, granata 8e1f33/6a1326, tinte f7e9ec/e3c3cb, ardesia scura 0f172a/1e293b, rosa brandText scuro ee9aaa */
  const V1 = /rgba?\((245, 243, 239|247, 245, 241|241, 239, 233|142, 31, 51|106, 19, 38|247, 233, 236|227, 195, 203|15, 23, 42|30, 41, 59|238, 154, 170)[,)]/;
  const chiari = []; const lumS = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(',').map(Number); if (p.length > 3 && p[3] < 0.85) return null; return (0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2]) / 255; };
  for (const e of document.body.querySelectorAll('*')) { const c = gcs(e); if (c.display === 'none') continue; const r = e.getBoundingClientRect(); if (r.width < 2 || r.bottom < 0 || r.top > H) continue;
    const ff = (c.fontFamily || '').split(',')[0].replace(/["']/g, '').trim(); if ((e.textContent || '').trim() && e.children.length === 0) fam[ff] = (fam[ff] || 0) + 1;
    const br = parseFloat(c.borderTopLeftRadius); if (br > 0.4 && br < 900) rag[Math.round(br)] = (rag[Math.round(br)] || 0) + 1;
    if (v1.length < 6 && (V1.test(c.backgroundColor) || V1.test(c.color) || V1.test(c.borderTopColor) || V1.test(c.backgroundImage))) v1.push({ s: sel(e), bg: c.backgroundColor, col: c.color, img: (c.backgroundImage || '').slice(0, 60), t: (e.textContent || '').trim().slice(0, 24) });
    /* fondi CHIARI (luminanza > 0,6) larghi: nel tema scuro sono o il tasto principale (#f4f1ea, voluto) o un resto */
    const lb = lumS(c.backgroundColor); if (chiari.length < 8 && lb != null && lb > 0.6 && r.width * r.height > 600 && !/244, 241, 234/.test(c.backgroundColor)) chiari.push({ s: sel(e), bg: c.backgroundColor, w: Math.round(r.width), h: Math.round(r.height), t: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 24) }); }
  return { righe: out, spezzate, coperti, fasce: fasce.map(f => ({ t: (f.e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), r: [Math.round(f.r.left), Math.round(f.r.top), Math.round(f.r.width), Math.round(f.r.height)] })), fam, rag, v1, chiari, testo: (document.body.innerText || '').slice(0, 6000) };
}
const lumC = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lumC(r) + 0.7152 * lumC(g) + 0.0722 * lumC(b);
const leggiCol = s => { const m = /rgba?\(([^)]+)\)/.exec(s || ''); if (!m) return null; const p = m[1].split(',').map(Number); return { c: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 }; };
/* contrasto riga per riga sui pixel dello screenshot */
export function contrasti(png, righe, dpr = 1) {
  const res = [];
  for (const r of righe) {
    if (r.svg) continue; const tc = leggiCol(r.col); if (!tc) continue;
    const x0 = Math.round(r.x * dpr), y0 = Math.round(r.y * dpr), w = Math.round(r.w * dpr), h = Math.round(r.h * dpr); if (w < 3 || h < 3) continue;
    const L = []; const passo = Math.max(1, Math.floor(Math.sqrt(w * h / 900)));
    for (let y = y0; y < Math.min(png.height, y0 + h); y += passo) for (let x = x0; x < Math.min(png.width, x0 + w); x += passo) { const i = (y * png.width + x) * 4; L.push([png.data[i], png.data[i + 1], png.data[i + 2]]); }
    if (L.length < 6) continue;
    /* fondo = mediana per luminanza dei pixel della riga (il glifo copre una minoranza dei pixel) */
    L.sort((a, b) => lum(a) - lum(b)); const bg = L[Math.floor(L.length / 2)];
    const t = tc.a < 1 ? tc.c.map((v, i) => v * tc.a + bg[i] * (1 - tc.a)) : tc.c;
    const l1 = lum(t), l2 = lum(bg); const rap = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    const soglia = (r.fs >= 18 || (r.fs >= 14 && r.fw >= 700)) ? 3 : 4.5;
    res.push({ t: r.t, rap: Math.round(rap * 100) / 100, soglia, fs: r.fs, fw: r.fw, testo: '#' + t.map(v => Math.round(v).toString(16).padStart(2, '0')).join(''), fondo: '#' + bg.map(v => v.toString(16).padStart(2, '0')).join(''), y: r.y, x: r.x, s: r.s, sh: r.sh });
  }
  return res;
}
/* [collaudo 180] IL BANCO DI CARRIERA NON AVEVA IL CALENDARIO: senza, la Home non rende la card della PROSSIMA partita, cioe' proprio il
   blocco bocciato dal PO sulla 179. Si genera con la funzione vera del gioco sulla lega del club e si marcano giocate le giornate gia'
   nello storico (stesso numero), poi si applica con il gancio di collaudo `patch`. Ritorna la gara della settimana (o null). */
export async function preparaCalendario(page, S) {
  const P = S.player;
  const r = await page.evaluate(([club, season, week, n, mh, st]) => { try { const C = window.__CPM_CAREER; const lc = CLUBS.filter(c => c.lg === club.lg);
    const cal = generateSeasonCalendar(club, lc, (season || 1) * 777 + hashStr(club.id)); let k = 0;
    /* le prime n giornate di lega sono quelle dello storico; la settimana corrente diventa quella della giornata successiva */
    let wk = week; for (const m of cal) { if (m.type) continue; if (k < n) { m.played = true; k++; } else { wk = m.week; break; } }
    /* lo storico prende avversario, sede e settimana dalle giornate giocate (le guardie anti-loop confrontano le due fonti) */
    const gio = cal.filter(m => m.played); const mh2 = mh.map((h, i) => gio[i] ? { ...h, opponent: gio[i].opponentName, isHome: !!gio[i].isHome, week: gio[i].week, season } : h);
    for (let i = 0; i < gio.length; i++) { const h = mh2[i]; if (h) gio[i].result = { homeScore: h.homeScore, awayScore: h.awayScore, won: h.won, drew: h.drew }; }
    C.patch({ calendar: cal, week: wk, weekLived: false, matchHistory: mh2, standings: st, playedMd: { s: season, md: gio.map(m => m.matchday) } }); return { n: cal.length, giocate: k, settimana: wk }; } catch (e) { return { errore: String(e.message) }; } }, [P.club, P.season, P.week, (P.matchHistory || []).length, P.matchHistory || [], P.standings]);
  await sleep(700); let md = null;
  for (let t = 0; t < 4; t++) { md = await page.evaluate(() => window.__CPM_CAREER.thisWeekMd()).catch(() => null); if (md && md.matchday) break;
    /* il gioco puo' «risanare» una giornata come gia' giocata (rilevatore 7.418): si va alla prossima che considera aperta */
    await page.evaluate(() => { const C = window.__CPM_CAREER; const p = C.snapshot(); const m = (p.calendar || []).find(x => !x.played && !x.type && x.week >= (p.week || 1)); if (m) C.patch({ week: m.week, weekLived: false }); }); await sleep(700); }
  return { ...r, md };
}
export const fotoNome = (sch, f, club) => `${sch}-${f.k.replace('s', '')}-${club}.png`;
/* misura completa: D() del 178 + righe + contrasto sui pixel + coperture a fine scorrimento. Una foto PNG piccola nel repo. */
export async function misura180(page, f, sch, club, R, opt = {}) {
  await ferma(page, opt.fermaMs || 5000); if (!opt.vivo) await congela(page);
  const m = await page.evaluate(D, f.touch).catch(e => ({ errore: String(e.message).slice(0, 100) }));
  const q = await page.evaluate(RIGHE).catch(e => ({ righe: [], spezzate: [], coperti: [], fasce: [], fam: {}, rag: {}, v1: [], errore: String(e.message).slice(0, 100) }));
  let buf = null; try { buf = await page.screenshot({ type: 'png', timeout: 45000 }); } catch (e) {}
  const nome = fotoNome(sch, f, club);
  let ctr = [];
  if (buf) { const png = PNG.sync.read(buf); ctr = contrasti(png, q.righe, png.width / f.w);
    /* foto piccola nel repo: si dimezza il PC; i telefoni restano 1:1 */
    let out = png; if (f.w > 800) { const W2 = png.width >> 1, H2 = png.height >> 1; out = new PNG({ width: W2, height: H2 }); for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { const i = (y * 2 * png.width + x * 2) * 4, j = (y * W2 + x) * 4; for (let c = 0; c < 4; c++) out.data[j + c] = png.data[i + c]; } }
    fs.writeFileSync(path.join(FOTO_DIR, nome), PNG.sync.write(out, { colorType: 2 })); }
  /* fine scorrimento: si porta in fondo il contenitore che scorre e si cerca il contenuto coperto */
  let fondo = null;
  if (!opt.noFondo) { await page.evaluate(() => { for (const e of document.body.querySelectorAll('*')) { const c = getComputedStyle(e); if (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight - e.clientHeight > 40) e.scrollTop = e.scrollHeight; } window.scrollTo(0, document.documentElement.scrollHeight); }).catch(() => {});
    await sleep(350); const q2 = await page.evaluate(RIGHE).catch(() => null); if (q2) fondo = { coperti: q2.coperti, fasce: q2.fasce };
    if (q2 && q2.coperti.length) { try { await page.screenshot({ path: path.join(FOTO_DIR, nome.replace('.png', '-fondo.png')), type: 'png', timeout: 30000 }); } catch (e) {} }
    await page.evaluate(() => { for (const e of document.body.querySelectorAll('*')) { if (e.scrollTop) e.scrollTop = 0; } window.scrollTo(0, 0); }).catch(() => {}); await sleep(150); }
  const sotto = ctr.filter(c => c.rap < c.soglia);
  const r = { sch, f: f.k, club, foto: nome, hs: m.hs, nFuori: m.nFuori, fuori: m.fuori, piccoli: m.piccoli, nPiccoli: m.nPiccoli, nTasti: m.nTasti, tagliati: m.tagliati, nTagliati: m.nTagliati, ellissi: m.ellissi, nEllissi: m.nEllissi,
    sovTesti: m.sovTesti, sovr: m.sovr, imgRotte: m.imgRotte, sostitutivi: m.sostitutivi, undefinedNaN: m.undefinedNaN, minFs: m.minFs, nSotto10: m.nSotto10, overlay: m.overlay, altezza: m.altezza,
    nRighe: ctr.length, nSottoCtr: sotto.length, sottoCtr: sotto.sort((a, b) => a.rap / a.soglia - b.rap / b.soglia).slice(0, 10), spezzate: q.spezzate, coperti: q.coperti, fondo, fasce: q.fasce, fam: q.fam, rag: q.rag, v1: q.v1, chiari: q.chiari, testo: q.testo };
  (R[sch] = R[sch] || {})[f.k + '-' + club] = r;
  const fl = [r.hs > 0 ? 'HS' + r.hs : '', r.nFuori ? 'fuori' + r.nFuori : '', r.nTagliati ? 'tagl' + r.nTagliati : '', (r.sovTesti || []).length ? 'sovT' + r.sovTesti.length : '', r.nSottoCtr ? 'ctr' + r.nSottoCtr : '', r.spezzate.length ? 'spez' + r.spezzate.length : '', (fondo && fondo.coperti.length) ? 'COPERTO' + fondo.coperti.length : '', r.v1.length ? 'V1' : '', r.undefinedNaN ? 'NaN' : ''].filter(Boolean).join(' ');
  process.stdout.write(`  ${f.k.padEnd(4)} ${club.padEnd(6)} ${sch.padEnd(26)} righe ${String(r.nRighe).padStart(3)} tasti<40:${String(r.nPiccoli).padStart(2)}/${String(r.nTasti).padStart(3)} ${fl}\n`);
  return r;
}
export function salvaDati(nome, obj) { fs.writeFileSync(path.join(DATI_DIR, nome), JSON.stringify(obj)); }
