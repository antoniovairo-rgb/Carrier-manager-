#!/usr/bin/env node
/* [giro 61 — eroe fuori quadro in hl_result su «Ricevi fra le linee», annotato dal giro 53] SONDA/GUARDIANO sul FLUSSO VERO (GLB acceso,
   teatro attivo, attesa reale, 412x915). Rigioca partite intere (nome Coll<i>, seme autoplay 1300+71i come inquadra-273) e registra ogni
   fotogramma (__CPM_FR73: ndc dell'eroe, soggetto-palla, arco vivo, post-arco, esito). Giudica le scene «fra le linee» in hl_result:
   quota di fotogrammi con l'eroe fuori dal quadro, separata in «pallone in volo» (arco vivo: la regia segue il viaggio, 7.522) e
   «a pallone fermo/post-arco» (la storia torna a chi ha giocato).
   Uso: CPM_PARTITE=1,2,3,4 node linee-61.mjs [--guardiano]  ·  CPM_ROSSO=__CPM_NO_X per il braccio rosso.
   GIUDIZIO (--guardiano) sulla CODA DEL POST-ARCO di un tiro dell'eroe (esclusi autogol, compagno che finalizza, cross-gol, ritorno
   dell'uno-due), in tempo di SCENA del post-arco (pt) — mai in fotogrammi: a 4-8 fps headless il primo tratto dura molti fotogrammi
   e sotto carico il post-arco non arriva in fondo prima che la finestra d'esito si chiuda (misurato: load 15, verde cieco).
   (a) MECCANISMO, pt >= 1,0 s: soggetto della regia sull'eroe. VERDE >= 90% · ROSSO (CPM_ROSSO=__CPM_NO_LINEE61) <= 60% (il soggetto torna anche da solo quando il pallone respinto passa vicino all'eroe: misurato 33%).
   (b) ESITO, pt >= 1,6 s (0,9 s di regia sul pallone + 0,7 s per riportare la camera): eroe fuori. VERDE <= 15% se ci sono
       almeno 10 fotogrammi, altrimenti dichiarato «non giudicato». Nel rosso si stampa soltanto.
   (c) [giro 72] TOTALE a pallone non in volo (tutto hl_result, non solo la coda): eroe fuori <= 15% (>= 40 fotogrammi). ROSSO
       CPM_ROSSO=__CPM_NO_LINEE72 (bisezione senza l'eroe): atteso > 15% (misurato prima 37,3%).
   CIECO (uscita 2): meno di 10 fotogrammi con pt >= 1,0. Gira da solo: sotto carico il tempo di scena non avanza. */
import fs from 'fs';
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const PART = (process.env.CPM_PARTITE || '1,2,3,4').split(',').map(Number);
const ROSSO = process.env.CPM_ROSSO || '', TETTO = +(process.env.CPM_TETTO || 330000), FILTRO = new RegExp(process.env.CPM_FILTRO || 'fra le linee', 'i');
const PAR = +(process.env.CPM_PAR61 || 2);
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const scene = [];
async function partita(i) {
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript(r => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_REALWAIT = 1; if (r) r.split('+').forEach(k => window[k] = 1); }, ROSSO);
  await openMatch(page, port, { skipLoadAll: true, name: 'Coll' + i });
  await page.evaluate(s => window.__CPM_AUTOPLAY(true, { seed: s, policy: 'seeded', tickMs: 300 }), 1300 + i * 71);
  const t0 = Date.now(); let ph = null, cur = null;
  const chiudi = async () => { if (!cur) return; cur.fr = await page.evaluate(() => (window.__CPM_FR73 || []).slice()).catch(() => []); if (FILTRO.test(cur.t || '')) scene.push(cur); cur = null; };
  while (Date.now() - t0 < TETTO) {
    const p = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
    if (p !== ph) {
      if (p === 'hl_intro') { await chiudi(); await page.evaluate(() => { window.__CPM_FR73 = []; }); cur = { p: i, ck: await page.evaluate(() => window.__CPM_CLOCK()), t: null, acts: null }; }
      if (cur && (p === 'hl_choose' || p === 'hl_result')) { const d = await page.evaluate(() => ({ s: window.__CPM_CURSIT && window.__CPM_CURSIT(), a: (window.__CPM_ACTSO ? window.__CPM_ACTSO() : []).map(x => x.label) })).catch(() => ({}));
        if (d.s) { cur.t = d.s.t; cur.gi = d.s.gi; } if (d.a && d.a.length) cur.acts = d.a; }
      if (p === 'playing' || p === 'ended' || p === 'ceremony') await chiudi();
      ph = p; if (p === 'ended' || p === 'ceremony') break;
    }
    await sleep(100);
  }
  await chiudi(); await ctx.close();
}
const coda = [...PART]; await Promise.all(Array.from({ length: PAR }, async () => { while (coda.length) await partita(coda.shift()); }));
await b.close(); srv.close();
const fuori = f => Math.abs(f.ax) > 1 || Math.abs(f.ay) > 1;
let V = { n: 0, f: 0 }, F = { n: 0, f: 0 };
for (const s of scene) {
  const r = s.fr.filter(f => f.ph === 'hl_result'); const v = r.filter(f => f.ar), q = r.filter(f => !f.ar);
  V.n += v.length; V.f += v.filter(fuori).length; F.n += q.length; F.f += q.filter(fuori).length;
  const ok = (r.find(f => f.ok) || {}).ok;
  console.log(`p${s.p} ${s.ck}' «${s.t}» esito ${ok} · result ${r.length} fot · in volo fuori ${v.filter(fuori).length}/${v.length} · fermo/post fuori ${q.filter(fuori).length}/${q.length} (sogg. palla ${q.filter(f => f.sb).length}, post ${q.filter(f => f.pa).length}, tenuta ${q.filter(f => f.kp).length})`);
}
const ESCL = /^(in_net_own|cross_goal|assist_recv|onetwo_back)$/; let C = { n: 0, f: 0 }, M = { n: 0, h: 0 };
for (const s of scene) for (const f of s.fr) if (f.ph === 'hl_result' && f.pa && !ESCL.test(f.pa) && f.pt != null) {
  if (f.pt >= 1.0) { M.n++; if (!f.sb) M.h++; }
  if (f.pt >= 1.6) { C.n++; if (fuori(f)) C.f++; } }
const qM = M.n ? M.h / M.n * 100 : null;
const qF = F.n ? F.f / F.n * 100 : null, qV = V.n ? V.f / V.n * 100 : null, qC = C.n ? C.f / C.n * 100 : null;
console.log(`CODA DEL POST-ARCO: soggetto sull'eroe (pt >= 1,0) ${M.h}/${M.n} (${qM == null ? '-' : qM.toFixed(1)}%) · eroe fuori (pt >= 1,6) ${C.f}/${C.n} (${qC == null ? '-' : qC.toFixed(1)}%)`);
console.log(`SCENE fra le linee ${scene.length} · in volo fuori ${V.f}/${V.n} (${qV == null ? '-' : qV.toFixed(1)}%) · a pallone non in volo fuori ${F.f}/${F.n} (${qF == null ? '-' : qF.toFixed(1)}%)`);
fs.mkdirSync('out', { recursive: true }); fs.writeFileSync(ROSSO ? 'out/linee-61-rosso.json' : 'out/linee-61.json', JSON.stringify(scene));
if (process.argv.includes('--guardiano')) {
  if (M.n < 10) { console.log('⚠️ linee-61 CIECO: meno di 10 fotogrammi con il post-arco oltre 1 s di scena'); process.exit(2); }
  const g = [];
  if (/NO_LINEE72/.test(ROSSO)) { if (!(qF > 15)) g.push(`rosso NO_LINEE72: eroe fuori a pallone non in volo solo nel ${qF == null ? '-' : qF.toFixed(1)}% (atteso > 15%)`); }
  else if (ROSSO) { if (qM > 60) g.push(`rosso: soggetto sull'eroe nel ${qM.toFixed(1)}% (atteso <= 60%)`); }
  else { if (qM < 90) g.push(`verde: soggetto sull'eroe solo nel ${qM.toFixed(1)}% (atteso >= 90%)`);
    if (C.n >= 10 && qC > 15) g.push(`verde: eroe fuori nel ${qC.toFixed(1)}% della coda (atteso <= 15%)`); else if (C.n < 10) console.log('  (esito in coda non giudicato: ' + C.n + ' fotogrammi)');
    /* [giro 72, collaudo 173 D1] il giudizio sulla sola coda passava (0/107) mentre sul TOTALE dei fotogrammi a pallone non in volo l'eroe
       era fuori nel 25-37%: ora si giudica anche il totale, soglia 15% (come il caso 7.482), con almeno 40 fotogrammi */
    if (F.n >= 40 && qF > 15) g.push(`verde: eroe fuori nel ${qF.toFixed(1)}% dei fotogrammi a pallone non in volo (atteso <= 15%)`); else if (F.n < 40) console.log('  (totale a pallone non in volo non giudicato: ' + F.n + ' fotogrammi)'); }
  console.log(g.length ? '❌ linee-61 ' + (ROSSO ? 'rosso' : 'verde') + '\n  · ' + g.join('\n  · ') : `✅ ${ROSSO ? 'ROSSO come atteso' : 'PASS linee-61'}`); process.exit(g.length ? 1 : 0);
}
