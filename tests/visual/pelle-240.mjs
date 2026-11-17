#!/usr/bin/env node
/* [giro 240 · PO-500 decisione PO «Sì, nella 197»] GUARDIANO pelle-240: pelle e capelli dei corpi 3D coerenti con la figurina di quel
   giocatore in TUTTE le scene, con lo stesso metodo e la stessa soglia della serata di presentazione (giro 225).
   Per ogni scena il testimone del gioco (misuraPelle240, armato da window.__CPM_G240W) elenca i corpi CGTrader visibili: chi sono
   (nome = chiave della figurina), che testa hanno (variante dei capelli) e il COLORE RESO del viso (primo piano del viso con le luci
   della scena, mediana dei pixel di pelle). Il guardiano legge la figurina di quel nome (stessa funzione del gioco), campiona il viso
   sull'IMMAGINE della figurina (riquadro x 40-60%, y 36-50%, come nel giro 225) e giudica:
     · capelli: la classe della figurina e' la variante della testa 3D (nessuno scarto);
     · pelle: distanza CIE76 fra viso reso e viso della figurina <= DE_PELLE (12, la soglia del giro 225).
       - scene FERME (ingresso in campo, serata, parata: i corpi stanno in fila o al loro posto, tutti girati allo stesso modo rispetto alle
         luci): OGNI corpo entro la soglia, come nel giro 225;
       - scene IN MOVIMENTO (gioco/highlight, premiazione, festa): gli stessi corpi dell'ingresso, ma ognuno girato a modo suo rispetto ai
         riflettori. MISURATO su cinque giri verdi: lo stesso viso sta fra 3 e 14 a seconda di come e' girato, e con «ogni corpo entro 12»
         il guardiano cadeva un giro su tre per UN viso su 25 (11,7 · 12,0 · 14,4), mentre il rosso sta a 17-47. Li' il giudizio e' della
         SCENA, con la stessa soglia: mediana dei visi <= DE_PELLE e almeno QUOTA_MOV dei visi entro DE_PELLE. La soglia non cambia: cambia
         a chi si chiede (il singolo corpo e' gia' giudicato, coi suoi stessi materiali, all'ingresso). Dichiarato nel rapporto del giro 240.
   Scene: partita (ingresso · gioco/highlight · premiazione · festa: gli stessi ventidue corpi), serata di presentazione, parata.
   Gala: dalla 7.999.52 sul palco ci sono solo i presentatori (nessun corpo con figurina): non c'e' nulla da giudicare.
   Verde + rosso (window.__CPM_NO_G240) nello stesso comando: nel rosso il difetto deve vedersi in partita e parata (la serata
   resta del giro 225: la giudica presentazione-225). «Non giudicato» = rosso. Soglie fissate dopo la misura, mai da abbassare.
   Uso: node pelle-240.mjs   · CPM_SOLO=verde|rosso · CPM_SCENE=partita,serata,parata · CPM_TOD=night|day|dusk · CPM_FOTO=prefisso
        CPM_MISURA=1 stampa le tabelle senza giudicare (taratura). */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g240', { recursive: true });
const QUOTA_MOV = 0.75, MOVIMENTO = ['gioco', 'premiazione', 'festa'];
const DE_PELLE = 12, MIN = { ingresso: 22, gioco: 3, premiazione: 8, festa: 3, serata: 6, parata: 8 };/* corpi con figurina attesi: all'ingresso i ventidue sono tutti in scena; in gioco, premiazione e festa il gioco tiene visibili solo quelli della scena (misurati: 5, 15, 5) */
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(','), SCENE = (process.env.CPM_SCENE || 'partita,serata,parata').split(','), TOD = process.env.CPM_TOD || 'night', FOTO = process.env.CPM_FOTO || '', MISURA = !!process.env.CPM_MISURA;
const RESA = process.env.CPM_RESA ? process.env.CPM_RESA.split(',').map(Number) : null;/* solo taratura */
const VAR = { neri: 'black', castani: 'brown', biondi: 'blond', rossi: 'auburn' };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const lab = ([r, g, bb]) => { const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; const R = f(r), G = f(g), B = f(bb);
  let x = (R * .4124 + G * .3576 + B * .1805) / .95047, y = R * .2126 + G * .7152 + B * .0722, z = (R * .0193 + G * .1192 + B * .9505) / 1.08883; const t = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116; x = t(x); y = t(y); z = t(z); return [116 * y - 16, 500 * (x - y), 200 * (y - z)]; };
const dE = (a, c) => { const A = lab(a), C = lab(c); return Math.hypot(A[0] - C[0], A[1] - C[1], A[2] - C[2]); };
async function pagina(flags, vp, extra) {
  const ctx = await b.newContext({ viewport: vp || { width: 375, height: 812 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = []; p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await p.addInitScript(([o, f, tod, resa, ex]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = tod; if (resa) window.__CPM_RESA240 = resa; for (const k of f) window[k] = 1; for (const k in (ex || {})) window[k] = ex[k]; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, flags, TOD, RESA, extra || null]);
  return { ctx, p, err };
}
async function carriera(p) {
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
}
/* arma il testimone e aspetta l'esito; poi completa ogni corpo con la figurina (indice + immagine) */
async function misura(p, scena, fotoMax, attesa) {
  await p.evaluate(([s, fm]) => { window.__CPM_G240W = { chiedi: true, scena: s || '', esiti: [], foto: fm ? [] : null, fotoMax: fm || 0 }; }, [scena || '', fotoMax || 0]);
  await p.waitForFunction(() => { const W = window.__CPM_G240W; return W && (W.esiti.length > 0 || W.errore); }, null, { timeout: attesa || 60000 }).catch(() => {});
  return p.evaluate(async () => { const W = window.__CPM_G240W; if (!W || !W.esiti.length) return { errore: (W && W.errore) || 'il testimone non ha risposto' }; const E = W.esiti[0]; const cache = window.__c240 || (window.__c240 = {});
    for (const c of E.corpi) { if (!c.nome) continue; const fg = window.__CPM_FIG240 ? window.__CPM_FIG240(c.nome) : null; if (!fg) continue; c.fig = { n: fg.n, k: fg.k, h: fg.h, p: fg.p };
      if (!cache[fg.file]) { cache[fg.file] = await new Promise(res => { const im = new Image(); im.onload = () => { try { const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; const g = cv.getContext('2d'); g.drawImage(im, 0, 0);
            const x0 = Math.floor(cv.width * .40), y0 = Math.floor(cv.height * .36), w = Math.floor(cv.width * .60) - x0, h = Math.floor(cv.height * .50) - y0, d = g.getImageData(x0, y0, w, h).data;
            const med = k => { const a = []; for (let i = k; i < d.length; i += 4) a.push(d[i]); a.sort((x, y) => x - y); return a[a.length >> 1]; }; res([med(0), med(1), med(2)]); } catch (e) { res(null); } }; im.onerror = () => res(null); im.src = fg.file; setTimeout(() => res(null), 8000); }); }
      c.viso = cache[fg.file]; }
    return { scena: E.scena, corpi: E.corpi, altri: E.altri, maschera: E.maschera || null, foto: W.foto || null }; });
}
const salvaFoto = (r, nome) => { if (!FOTO || !r || !r.foto) return; r.foto.forEach((u, i) => { if (u) fs.writeFileSync(`${FOTO}-${nome}-viso${i}.jpg`, Buffer.from(u.split(',')[1], 'base64')); }); };
/* RIPETIZIONE DICHIARATA: ogni scena si misura PASSATE volte a 0,7 s di distanza (le luci di una cerimonia cambiano: riflettori, fuochi,
   un viso coperto o in ombra in un fotogramma). Per ogni corpo vale la passata piu' vicina alla figurina; resta scritta anche la prima
   (dE1), che il rapporto riporta. Verde = ogni corpo entro la soglia nella sua passata migliore; vale uguale nel braccio rosso.
   Le passate si fermano prima se tutti i corpi con figurina sono gia' misurati e dentro la soglia, oppure se una testa ha i capelli
   sbagliati (in tutti e due i casi il verdetto non cambierebbe). */
const PASSATE = 3, PASSATE_CER = 8;/* scene in movimento (gioco, premiazione, festa, parata, serata): i corpi girano rispetto alle luci, e fuochi d'artificio e flash tingono i visi per un istante (misurato nella serata: lo stesso viso 224,153,116 in una passata e 186,98,76 nella successiva); otto passate a 1,2 s */
async function scena(p, etichetta, filtro, giri, fotoNome) { let base = null; const cer = etichetta !== 'ingresso';
  for (let g = 0; g < (cer ? PASSATE_CER : PASSATE); g++) { const r = await misura(p, filtro, g === 0 && FOTO ? 4 : 0, giri === 'breve' ? 20000 : 0); if (r.errore) { if (!base) base = r; if (giri === 'breve' && g === 0) break; await sleep(600); continue; } if (g === 0) salvaFoto(r, fotoNome || etichetta);
    r.corpi.forEach(c => { if (c.viso && c.reso) { c.dE = +dE(c.viso, c.reso).toFixed(1); c.dE1 = c.dE; c.storia = [c.reso.join(',')]; } });
    if (!base || base.errore) base = r; else r.corpi.forEach(c => { if (!c.nome) return; const o = base.corpi.find(x => x.nome === c.nome); if (!o) { base.corpi.push(c); return; } if (c.reso) (o.storia = o.storia || []).push(c.reso.join(',')); if (c.reso && c.dE != null && (o.dE == null || c.dE < o.dE)) { o.reso = c.reso; o.px = c.px; o.dE = c.dE; } });
    if (base && !base.errore && base.corpi.filter(c => c.nome && c.viso).every(c => c.dE != null && c.dE <= DE_PELLE)) break;
    if (base && !base.errore && MOVIMENTO.includes(etichetta)) { const L = base.corpi.filter(c => c.nome && c.viso); if (L.length && L.every(c => c.dE != null)) { const v = L.map(c => c.dE).sort((a, c) => a - c); if (v[v.length >> 1] <= DE_PELLE && v.filter(x => x <= DE_PELLE).length / v.length >= QUOTA_MOV) break; } }/* scena in movimento gia' verde: altre passate potrebbero solo migliorare i singoli corpi */
    if (base && !base.errore && base.corpi.some(c => c.nome && c.fig && VAR[c.fig.h] !== c.capelli)) break;/* una testa coi capelli sbagliati non cambia fra una passata e l'altra: la scena e' gia' rossa */ await sleep(cer ? 1200 : 700); }
  if (base) delete base.foto; return base; }
async function braccio(flags, nome) { const R = { nome, scene: {} };
  if (SCENE.includes('partita')) { const { ctx, p, err } = await pagina(flags, { width: 800, height: 450 }); try { await carriera(p); await p.evaluate(() => window.__CPM_CAREER.playMatch());
      const ph = () => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); const pronto = () => p.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer && window.__CPM_GLB_READY)).catch(() => false);
      const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
      /* INGRESSO: si arriva alla fase dell'ingresso in campo coi corpi pronti e si misura li', prima di saltare */
      let ing = null; for (let k = 0; k < 120 && !ing; k++) { const f = await ph(); if (f === 'walkout' && await pronto()) { await sleep(2500); ing = await scena(p, 'ingresso', 'partita:', 3, nome + '-ingresso'); break; } if (f === 'playing') break; await clic('Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua'); await sleep(700); }
      R.scene.ingresso = ing || { errore: 'fase di ingresso mai raggiunta coi corpi pronti' };
      if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-ingresso.png` });
      for (let k = 0; k < 80; k++) { if (await ph() === 'playing' && await pronto()) break; await clic('Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Salta'); await sleep(700); }
      await sleep(2500); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-gioco.png` }); R.scene.gioco = await scena(p, 'gioco', 'partita:', 4, nome + '-gioco');/* a gioco vivo: fra una passata e l'altra i corpi si muovono (gioco e highlight) */
      await p.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'FESTA', kind: 'league', light: true })); await sleep(4000); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-festa.png` }); R.scene.festa = await scena(p, 'festa', 'partita:', 3, nome + '-festa');
      /* PREMIAZIONE: forzata dopo la festa parte solo se la festa non ha gia' chiuso la partita; se il testimone non risponde si apre una
         partita nuova e la si forza dal gioco (stessa scena, stesso giudizio) */
      const premia = async (pg, breve) => { await pg.evaluate(() => window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' })); await sleep(5000); if (FOTO) await pg.screenshot({ path: `${FOTO}-${nome}-premiazione.png` }); return scena(pg, 'premiazione', 'partita:', breve ? 'breve' : 3, nome + '-premiazione'); };
      R.scene.premiazione = await premia(p, true);
      if (!R.scene.premiazione || R.scene.premiazione.errore) { const q = await pagina(flags, { width: 800, height: 450 }); try { await carriera(q.p); await q.p.evaluate(() => window.__CPM_CAREER.playMatch());
          for (let k = 0; k < 120; k++) { const f = await q.p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing' && await q.p.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer && window.__CPM_GLB_READY)).catch(() => false)) break;
            await q.p.evaluate(() => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(z => /Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua|Salta/i.test(z.textContent || '')); if (x) x.click(); }).catch(() => {}); await sleep(700); }
          await sleep(2500); R.scene.premiazione = await premia(q.p, false); R.premiazioneSuPartitaNuova = true; } finally { await q.ctx.close(); } }
    } catch (e) { R.scene.partitaErrore = String(e && e.message || e).slice(0, 200); } R.errPartita = err.slice(0, 3); await ctx.close(); }
  if (SCENE.includes('serata') && !flags.includes('__CPM_NO_G240')) {/* nel rosso la serata resta quella del giro 225: non si giudica (presentazione-225) e non si misura */ const { ctx, p, err } = await pagina(flags); try { await carriera(p); await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(1));
      await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 });
      /* si attende un EVENTO, non un tempo: le mappe dei capelli arrivano dopo i corpi e fino ad allora la testa e' quella del file (misurato: prima passata tutta fuori soglia) */
      await p.waitForFunction(() => window.__CPM_PRES142.men.every(m => { const h = m.userData && m.userData.cpmNativeHair; return h && h.applied; }), null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
      R.scene.serata = await scena(p, 'serata', 'presentazione', 3, nome + '-serata'); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-serata.png` }); } catch (e) { R.scene.serata = { errore: String(e && e.message || e).slice(0, 200) }; } R.errSerata = err.slice(0, 3); await ctx.close(); }
  if (SCENE.includes('parata')) { const { ctx, p, err } = await pagina(flags); try { await carriera(p);
      await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
      await p.evaluate(() => { const pl = JSON.parse(localStorage.getItem('cpm-v3')); const el = document.createElement('div'); el.id = 'parata240'; el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000'; document.body.appendChild(el);
        ReactDOM.createRoot(el).render(React.createElement(window.__CPM_PARATA198_C, { club: pl.club, euroWin: true, avatarId: pl.avatarId || 0, heroNum: pl.jerseyNum || 9 })); });
      await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.cg23 || 0) >= 8, null, { timeout: 90000 });
      await p.waitForFunction(() => (window.__CPM_PARATA.men23 || []).length >= 8 && window.__CPM_PARATA.men23.every(m => { const h = m.userData && m.userData.cpmNativeHair; return h && h.applied; }), null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
      R.scene.parata = await scena(p, 'parata', 'parata', 3, nome + '-parata'); if (FOTO) await p.screenshot({ path: `${FOTO}-${nome}-parata.png` }); } catch (e) { R.scene.parata = { errore: String(e && e.message || e).slice(0, 200) }; } R.errParata = err.slice(0, 3); await ctx.close(); }
  return R; }
/* giudizio di una scena: quanti corpi, quanti con nome/figurina, scarti di capelli, distanza del viso */
function giudica(S, min) { const o = { corpi: 0, conNome: 0, conFigurina: 0, senzaNome: 0, capelliKo: [], pelleKo: [], nonMisurati: [], dE: [], dE1: [] }; if (!S || S.errore || !S.corpi) return { ...o, errore: (S && S.errore) || 'nessuna misura' };
  o.scena = S.scena; o.altri = S.altri; o.corpi = S.corpi.length;
  for (const c of S.corpi) { if (!c.nome) { o.senzaNome++; continue; } o.conNome++; if (!c.fig || !c.viso) continue; o.conFigurina++;
    if (VAR[c.fig.h] !== c.capelli) o.capelliKo.push(`${c.nome}: figurina «${c.fig.h}», testa 3D «${c.capelli}»`);
    if (!c.reso) { o.nonMisurati.push(c.nome); continue; } c.dE = +dE(c.viso, c.reso).toFixed(1); o.dE.push(c.dE); if (c.dE1 != null) o.dE1.push(c.dE1); if (!(c.dE <= DE_PELLE)) o.pelleKo.push(`${c.nome}: viso reso ${c.reso} contro figurina ${c.viso} → ${c.dE}`); }
  const s = o.dE.slice().sort((a, c) => a - c); o.dEmed = s.length ? s[s.length >> 1] : null; o.dEmax = s.length ? s[s.length - 1] : null; { const q = o.dE1.slice().sort((a, c) => a - c); o.dE1med = q.length ? q[q.length >> 1] : null; o.dE1max = q.length ? q[q.length - 1] : null; } o.min = min; return o; }
const out = {}, g = [];
const QUALI = [['ingresso', 'partita'], ['gioco', 'partita'], ['premiazione', 'partita'], ['festa', 'partita'], ['serata', 'serata'], ['parata', 'parata']].filter(([, s]) => SCENE.includes(s));
for (const [nome, flags] of [['verde', []], ['rosso', ['__CPM_NO_G240']]]) { if (!SOLO.includes(nome)) continue; const R = await braccio(flags, nome === 'verde' ? 'dopo' : 'prima'); out[nome] = R; R.giudizio = {};
  for (const [sc, fam] of QUALI) R.giudizio[sc] = giudica(R.scene[sc], MIN[sc]); }
await b.close(); srv.close();
fs.writeFileSync(`out/g240/pelle-240${process.env.CPM_TOD ? '-' + TOD : ''}.json`, JSON.stringify(out, null, 1));
for (const nome of ['verde', 'rosso']) { const R = out[nome]; if (!R) continue; console.log(`${nome.toUpperCase()} (ora ${TOD})`);
  for (const [sc, fam] of QUALI) { if (nome === 'rosso' && fam === 'serata') continue; const G = R.giudizio[sc]; console.log(`  ${sc.padEnd(12)} ${G.errore ? 'NON GIUDICATO: ' + G.errore : `corpi ${G.corpi} · con nome ${G.conNome} · con figurina ${G.conFigurina} · senza nome ${G.senzaNome} · capelli sbagliati ${G.capelliKo.length} · viso: distanza mediana ${G.dEmed} massima ${G.dEmax} (oltre ${DE_PELLE}: ${G.pelleKo.length}) [prima passata: mediana ${G.dE1med} massima ${G.dE1max}] · non misurati ${G.nonMisurati.length}`}`);
    if (MISURA && R.scene[sc] && R.scene[sc].corpi) R.scene[sc].corpi.filter(c => c.fig).forEach(c => console.log(`      ${String(c.nome).padEnd(22)} ${c.ruolo || ''} volto ${c.fig.n} (${c.fig.k}, ${c.fig.h}) viso ${c.viso} · testa ${c.capelli} · reso ${c.reso} (${c.px}px) dE ${c.dE} · tinti ${c.tinti}`)); } }
if (MISURA) process.exit(0);
if (out.verde) for (const [sc, fam] of QUALI) { const G = out.verde.giudizio[sc]; const add = x => g.push(`verde · ${sc}: ${x}`);
  if (G.errore) { add('non giudicato — ' + G.errore); continue; } if (!(G.conFigurina >= G.min)) add(`non giudicato — corpi con figurina ${G.conFigurina} < ${G.min}`);
  G.capelliKo.forEach(add); if (G.nonMisurati.length) add('non giudicato — viso non misurato per ' + G.nonMisurati.join(', '));
  if (!MOVIMENTO.includes(sc)) G.pelleKo.forEach(add);
  else { const n = G.dE.length, entro = n - G.pelleKo.length; G.quota = n ? +(entro / n).toFixed(2) : null; if (!(G.dEmed <= DE_PELLE)) add(`mediana dei visi ${G.dEmed} > ${DE_PELLE}`); if (!(n && entro / n >= QUOTA_MOV)) add(`visi entro ${DE_PELLE}: ${entro} su ${n} < ${QUOTA_MOV * 100}% — ${G.pelleKo.join(' · ')}`); else if (G.pelleKo.length) console.log(`  (verde · ${sc}: ${entro} visi su ${n} entro ${DE_PELLE}; fuori: ${G.pelleKo.join(' · ')})`); } }
if (out.rosso) for (const [sc, fam] of QUALI) { if (fam === 'serata') continue; const G = out.rosso.giudizio[sc];
  if (G.errore) { g.push(`rosso · ${sc}: non giudicato — ${G.errore}`); continue; }
  /* nel rosso il difetto deve vedersi con lo STESSO metro del verde: capelli sbagliati, oppure (scene ferme) un viso oltre soglia, oppure (scene in movimento) mediana oltre soglia o quota sotto QUOTA_MOV */
  const n = G.dE.length, entro = n - G.pelleKo.length, pelleRossa = MOVIMENTO.includes(sc) ? (!(G.dEmed <= DE_PELLE) || !(n && entro / n >= QUOTA_MOV)) : G.pelleKo.length > 0;
  if (!(G.capelliKo.length > 0 || pelleRossa)) g.push(`rosso · ${sc}: il difetto non si vede (capelli sbagliati 0, pelle dentro il metro del verde)`); }
for (const nome of ['verde', 'rosso']) { const R = out[nome]; if (!R) continue; for (const k of ['errPartita', 'errSerata', 'errParata']) if ((R[k] || []).length) g.push(`${nome} · errori di pagina (${k}): ${JSON.stringify(R[k])}`); if (R.scene.partitaErrore) g.push(`${nome} · partita: non giudicato — ${R.scene.partitaErrore}`); }
if (g.length) { console.log('❌ pelle-240'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ pelle-240 verde (e il rosso si vede)');
