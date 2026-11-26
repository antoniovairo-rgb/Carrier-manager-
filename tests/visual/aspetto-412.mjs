#!/usr/bin/env node
/* [giro 412 · PO-612] GUARDIANO aspetto-412: in partita la STATURA e la CORPORATURA del corpo 3D sono quelle della figurina di quel
   giocatore (l'eroe escluso: resta com'era, proposta al PO nel rapporto del giro 412). GLB acceso, ora congelata (notte), salvataggio
   fixtures/save-190-s12-ovr93.json. Verde + rosso (window.__CPM_NO_G412) nello stesso comando.
   A · INGRESSO IN CAMPO (i ventidue in fila, misurati sulle maglie disegnate, suola→cima, in metri di scena: la porta e' 2,44):
       - almeno 20 corpi non-eroe con nome e figurina, tutti col testimone userData.g412 uguale alla figurina (cm e kg);
       - ORDINE: correlazione per ranghi (Spearman) fra statura della figurina e statura 3D >= 0,90;
       - PROPORZIONE: per ogni corpo il rapporto statura 3D / statura figurina sta entro ±3% della mediana dei rapporti;
       - PIEDI A TERRA: la suola piu' bassa e la piu' alta del verde non escono di oltre 2 cm da quelle del rosso misurate nello stesso
         comando (la statura non deve staccare ne' affondare i piedi).
       Nel rosso il difetto deve vedersi: Spearman < 0,5 oppure un corpo fuori dal ±3%.
   B · COMPENETRAZIONE NEGLI HIGHLIGHT (fasi hl_*, dove il campo e' 3D): le stesse SCENE forzate nei due bracci, quattro campioni per
       scena; una coppia di corpi si compenetra se la distanza in pianta dei bacini e' minore della somma dei mezzi busti
       (0,13 x statura x corporatura). Verde: coppie-campione compenetrate <= quelle del rosso + 2 (corpi fino all'8% piu' larghi non
       devono creare contatti che prima non c'erano; la tolleranza di 2 e' dichiarata: la scena forzata parte coi corpi in viaggio).
   «Non giudicato» = rosso. Uso: node aspetto-412.mjs · CPM_SOLO=verde|rosso */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { apriIngresso, leggiCorpi } from './misura-412.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g412', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(',');
const SCENE = [3, 14, 33, 50, 79, 101, 133, 161];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const spearman = (a, c) => { const rk = x => { const o = x.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]); const r = []; o.forEach((p, k) => r[p[1]] = k); return r; }; const r1 = rk(a), r2 = rk(c), n = a.length; let s = 0; for (let i = 0; i < n; i++) s += (r1[i] - r2[i]) ** 2; return n > 2 ? 1 - 6 * s / (n * (n * n - 1)) : null; };
async function braccio(nome, flags) {
  const R = { nome }; const { ctx, p, err, ok } = await apriIngresso(b, port, flags);
  try {
    if (!ok) { R.errore = 'ingresso in campo mai raggiunto coi corpi pronti'; return R; }
    const C = (await leggiCorpi(p)).filter(c => c.ruolo !== 'eroe' && c.cm > 0);
    /* [giro 414] la statura si legge in TRE momenti (0,8 s fra uno e l'altro) e per ogni corpo vale la piu' alta osservata: in una sola
       lettura un corpo colto con la suola sollevata (oscillazione della fila) misurava 2-3 cm in meno e usciva dal ±3% (Daniel White
       190 cm → 192-193, 1 corsa su 3 sia sulla base 412 sia col giro 414). I piedi (suola) restano giudicati sulla prima lettura. */
    for (let k = 0; k < 2; k++) { await sleep(800); const D = await leggiCorpi(p); for (const c of C) { const d = D.find(x => x.nome === c.nome); if (d && d.alt3d > c.alt3d) c.alt3d = d.alt3d; } }
    R.n = C.length; R.conTest = C.filter(c => c.g412 && c.g412.cm === c.cm && c.g412.kg === c.kg).length;
    R.rho = +spearman(C.map(c => c.cm), C.map(c => c.alt3d)).toFixed(3);
    const rap = C.map(c => c.alt3d / (c.cm / 100)), med = rap.slice().sort((x, y) => x - y)[rap.length >> 1];
    R.fuori = C.filter((c, i) => Math.abs(rap[i] / med - 1) > 0.03).map(c => `${c.nome} ${c.cm} cm → ${Math.round(c.alt3d * 100)}`);
    R.suolaMin = Math.min(...C.map(c => c.suola)); R.suolaMax = Math.max(...C.map(c => c.suola));
    R.tabella = C.map(c => ({ nome: c.nome, cm: c.cm, kg: c.kg, cm3d: Math.round(c.alt3d * 100), corp: c.corp, suola: c.suola }));
    /* B: highlight forzati sulla stessa partita */
    const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
    for (let k = 0; k < 80; k++) { const f = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing') break; await clic('Salta|Continua|Siamo pronti'); await sleep(700); }
    const pronto = await p.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_LOAD_ALL === 'function').catch(() => false);
    if (!pronto) { R.erroreB = 'forzatura delle scene non disponibile'; return R; }
    await p.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
    R.coppie = 0; R.campioni = 0; R.scene = 0; R.dettaglio = [];
    for (const gi of SCENE) {
      await p.evaluate(i => window.__CPM_FORCE_SIT(i, false), gi); await sleep(1500);
      let visti = 0;
      for (let s = 0; s < 4; s++) {
        const m = await p.evaluate(() => { const T = THREE, S = window.__CPM3D.scene, ph = window.__CPM_PHASE && window.__CPM_PHASE(); const L = []; const v = new T.Vector3();
          S.traverseVisible(o => { const c = o.userData && o.userData.chi240; if (!c || !c.nome) return; let pel = null, lo = Infinity, hi = -Infinity; o.traverse(x => { if (!x.isBone) return; x.getWorldPosition(v); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); if (!pel && /^pelvis$|hips/i.test(x.name)) pel = v.clone(); });
            if (!pel) return; const ws = new T.Vector3(); o.getWorldScale(ws); L.push({ n: c.nome, x: pel.x, z: pel.z, r: 0.13 * (hi - lo) * 1.17 * (ws.x / ws.y) }); });
          const K = []; let mr = Infinity; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const d = Math.hypot(L[i].x - L[j].x, L[i].z - L[j].z); mr = Math.min(mr, d / (L[i].r + L[j].r)); if (d < L[i].r + L[j].r) K.push(`${L[i].n}~${L[j].n} ${d.toFixed(2)}<${(L[i].r + L[j].r).toFixed(2)}`); }
          return { ph, n: L.length, K, mr }; }).catch(() => null);
        if (m && /^hl_/.test(m.ph || '') && m.n >= 2) { visti++; R.campioni++; R.coppie += m.K.length; R.corpiHL = (R.corpiHL || 0) + m.n; if (m.mr < (R.minRap ?? Infinity)) R.minRap = +m.mr.toFixed(2); if (m.K.length) R.dettaglio.push(`gi${gi}: ${m.K.join(' · ')}`); }
        await sleep(400);
      }
      if (visti) R.scene++;
    }
  } catch (e) { R.errore = String(e && e.message || e).slice(0, 200); }
  finally { R.err = err.slice(0, 3); await ctx.close(); }
  return R;
}
const out = {};
for (const [nome, flags] of [['verde', []], ['rosso', ['__CPM_NO_G412']]]) if (SOLO.includes(nome)) out[nome] = await braccio(nome, flags);
await b.close(); srv.close();
fs.writeFileSync('out/g412/aspetto-412.json', JSON.stringify(out, null, 1));
const g = [];
for (const nome of ['verde', 'rosso']) { const R = out[nome]; if (!R) continue;
  console.log(`${nome.toUpperCase()}: corpi non-eroe ${R.n} · testimone g412 ${R.conTest} · Spearman ${R.rho} · fuori ±3% ${R.fuori ? R.fuori.length : '—'} · suola ${R.suolaMin != null ? R.suolaMin.toFixed(3) + '…' + R.suolaMax.toFixed(3) : '—'} · highlight: scene ${R.scene} campioni ${R.campioni} coppie compenetrate ${R.coppie} · corpi per campione ${R.campioni ? (R.corpiHL / R.campioni).toFixed(1) : '—'} · coppia piu' vicina ${R.minRap} della somma dei mezzi busti`);
  if (R.errore) g.push(`${nome}: non giudicato — ${R.errore}`); if (R.erroreB) g.push(`${nome}: B non giudicato — ${R.erroreB}`);
  if ((R.err || []).length) g.push(`${nome}: errori di pagina ${JSON.stringify(R.err)}`); }
const V = out.verde, Ro = out.rosso;
if (V && !V.errore) {
  if (!(V.n >= 20)) g.push(`verde: corpi non-eroe con figurina ${V.n} < 20`);
  if (V.conTest !== V.n) g.push(`verde: testimone g412 uguale alla figurina su ${V.conTest} corpi su ${V.n}`);
  if (!(V.rho >= 0.9)) g.push(`verde: ordine delle stature ${V.rho} < 0,90`);
  if (V.fuori.length) g.push(`verde: fuori proporzione ±3%: ${V.fuori.join(' · ')}`);
  if (!V.erroreB && !(V.scene >= 5)) g.push(`verde: B non giudicato — scene in highlight ${V.scene} < 5`); if (!V.erroreB && !(V.corpiHL / Math.max(1, V.campioni) >= 4)) g.push('verde: B non giudicato — meno di 4 corpi per campione');
}
if (Ro && !Ro.errore) { if (!(Ro.rho < 0.5 || Ro.fuori.length > 0)) g.push(`rosso: il difetto non si vede (Spearman ${Ro.rho}, fuori ±3% ${Ro.fuori.length})`); if (!Ro.erroreB && !(Ro.scene >= 5)) g.push(`rosso: B non giudicato — scene in highlight ${Ro.scene} < 5`); }
if (V && Ro && !V.errore && !Ro.errore) {
  if (V.suolaMin < Ro.suolaMin - 0.02 || V.suolaMax > Ro.suolaMax + 0.02) g.push(`piedi: suola verde ${V.suolaMin.toFixed(3)}…${V.suolaMax.toFixed(3)} contro rosso ${Ro.suolaMin.toFixed(3)}…${Ro.suolaMax.toFixed(3)} (tolleranza 2 cm)`);
  if (!V.erroreB && !Ro.erroreB && V.coppie > Ro.coppie + 2) g.push(`compenetrazione: verde ${V.coppie} coppie-campione contro rosso ${Ro.coppie} (+2 ammesse) — ${V.dettaglio.slice(0, 4).join(' | ')}`);
}
if (!SOLO.includes('verde') || !SOLO.includes('rosso')) g.push('un braccio solo: non giudicato');
if (g.length) { console.log('❌ aspetto-412'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ aspetto-412 verde (e il rosso si vede)');
