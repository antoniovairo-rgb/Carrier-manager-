#!/usr/bin/env node
/* [giro 432 · PO-686] GUARDIANO barba-capelli-432: in partita taglio, barba e colore dei capelli del corpo 3D vengono dalla figurina,
   come STRATI NOSTRI agganciati all'osso della testa (calotte rasato/ricci/afro, barba piena/corta/pizzetto/baffi; tabella unica
   assets/aspetto/aspetto-432.json). GLB acceso, ora congelata (notte), salvataggio fixtures/save-190-s12-ovr93.json. Verde e rosso
   (window.__CPM_NO_G432) nello stesso comando. Misure: misura-432.mjs (metodo delle etichette del giro 414).
   A · INGRESSO IN CAMPO, verde:
       - almeno 20 corpi con nome e figurina, 66 scatti giudicati (22 x 3 direzioni): uno non giudicato = rosso;
       - TAGLIO: per ogni corpo il cui taglio e' nella tabella, la calotta 3D (etichette >= 60% dei capelli) e' quella della tabella: 100%;
       - BARBA: il tipo 3D (etichette >= 0,1% del viso) e' quello della tabella, «rasato» = nessuna: 100%;
       - COLORE: calotte ricci/afro e barba piena entro 12 (CIE76, la soglia di pelle-240) dai capelli dipinti dello stesso corpo nel rosso;
       - ATTACCATURA (regola del giro 414): nessuno scatto con eccesso di pixel chiari al confine > 5 punti;
       - COMPENETRAZIONE: nessun vertice della testa fuori da uno strato coperto (0,5 mm di tolleranza).
     rosso: il difetto si deve vedere (taglio < 50% oppure barba < 50% di corrispondenza), altrimenti la misura e' cieca → rosso.
   B · MOVIMENTO (fasi hl_*, scene forzate, la testa che si muove con le clip): stessa misura di compenetrazione su 8 scene x 4 campioni
     nel verde: 0 vertici fuori, almeno 5 scene e 20 campioni con strati misurati.
   Uso: node barba-capelli-432.mjs · CPM_SOLO=verde|rosso */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { misuraTutti, corrispondenza, penetra432, apriEPronti } from './misura-432.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g432', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(',');
const SCENE = [3, 14, 33, 50, 79, 101, 133, 161];
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
async function movimento() {
  const R = { scene: 0, campioni: 0, vert: 0, buchi: 0, mmMax: 0, chi: {} };
  const { ctx, p, ok } = await apriEPronti(b, port, [], 'night');
  try {
    if (!ok) { R.errore = 'ingresso non raggiunto'; return R; }
    const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
    for (let k = 0; k < 80; k++) { const f = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing') break; await clic('Salta|Continua|Siamo pronti'); await sleep(700); }
    const pronto = await p.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_LOAD_ALL === 'function').catch(() => false);
    if (!pronto) { R.errore = 'forzatura delle scene non disponibile'; return R; }
    await p.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
    for (const gi of SCENE) {
      await p.evaluate(i => window.__CPM_FORCE_SIT(i, false), gi); await sleep(1200); let visti = 0;
      for (let s = 0; s < 4; s++) {
        const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
        const m = /^hl_/.test(ph || '') ? await penetra432(p).catch(() => null) : null;
        if (m && m.corpi > 0 && m.vert > 0) { visti++; R.campioni++; R.vert += m.vert; R.buchi += m.buchi; R.mmMax = Math.max(R.mmMax, m.mmMax); for (const k in m.chi) R.chi[k] = (R.chi[k] | 0) + m.chi[k]; }
        await sleep(450);
      }
      if (visti) R.scene++;
    }
  } catch (e) { R.errore = String(e && e.message || e).slice(0, 200); }
  finally { await ctx.close(); }
  return R;
}
const lavori = [];
if (SOLO.includes('verde')) lavori.push(misuraTutti(b, port, [], 'night', null).then(r => ['verde', r]));
if (SOLO.includes('rosso')) lavori.push(misuraTutti(b, port, ['__CPM_NO_G432'], 'night', null).then(r => ['rosso', r]));
const out = Object.fromEntries(await Promise.all(lavori));
if (SOLO.includes('verde')) out.movimento = await movimento();
await b.close(); srv.close();
fs.writeFileSync('out/g432/barba-capelli-432.json', JSON.stringify(out, null, 1));
const g = []; let rosso = false; const KO = m => { g.push('✗ ' + m); rosso = true; }, OK = m => g.push('✓ ' + m);
const giudica = (nome, R, ref) => {
  if (!R || !R.giudicato) { KO(`${nome}: non giudicato (${R && R.motivo})`); return null; }
  const S = R.righe.filter(x => x.giudicato); const C = corrispondenza(R, ref);
  const T = C.filter(c => c.okT !== null), tOk = T.filter(c => c.okT).length, bOk = C.filter(c => c.okB).length;
  return { S, C, T, tOk, bOk };
};
if (out.verde) {
  const V = giudica('verde', out.verde, out.rosso);
  if (V) {
    const { S, C, T, tOk, bOk } = V;
    (C.length >= 20 ? OK : KO)(`verde: corpi con nome ${C.length} (>= 20)`);
    (S.length >= 66 ? OK : KO)(`verde: scatti giudicati ${S.length}/66`);
    (T.length && tOk === T.length ? OK : KO)(`verde: taglio ${tOk}/${T.length} come la tabella (non coperti: ${C.length - T.length})${T.filter(c => !c.okT).map(c => ' · ' + c.nome + ' ' + c.taglio + '→' + c.t3d).join('')}`);
    (bOk === C.length ? OK : KO)(`verde: barba ${bOk}/${C.length} come la tabella${C.filter(c => !c.okB).map(c => ' · ' + c.nome + ' ' + c.barba + '→' + c.b3d).join('')}`);
    const col = C.flatMap(c => [(c.dEcal != null && c.t3d !== 'stempiato') ? [c.nome + ' calotta', c.dEcal] : null]).filter(Boolean); /* [giro 440] la BARBA non si confronta piu' coi capelli dipinti (verdetto del PO: «colori troppo scuri», la rossa di Bailey usciva marrone): il suo colore lo giudica resa-barba-440 contro la FIGURINA. Lo «stempiato» e' stoppia su pelle come il rasato: niente colore di capelli */
    const colKo = col.filter(x => x[1] > 12);
    (out.rosso && col.length >= 8 && !colKo.length ? OK : KO)(`verde: colore ${col.length - colKo.length}/${col.length} strati entro 12 CIE76 (massimo ${Math.max(...col.map(x => x[1]))})${colKo.map(x => ' · ' + x[0] + ' ' + x[1]).join('')}`);
    const ecc = S.map(x => x.eccesso); const oltre = S.filter(x => x.eccesso > 5);
    (!oltre.length ? OK : KO)(`verde: attaccatura, eccesso massimo ${Math.max(...ecc)} punti, scatti oltre 5: ${oltre.length}${oltre.map(x => ' · ' + x.nome + ' ' + x.ang + ' ' + x.eccesso).join('')}`);
    const pn = out.verde.pen; (pn && pn.corpi >= 15 && pn.vert > 0 && pn.buchi === 0 ? OK : KO)(`verde: compenetrazione all'ingresso ${pn && pn.buchi} vertici fuori su ${pn && pn.vert} (corpi con strati ${pn && pn.corpi})`);
    g.push(`  tempi sul banco: rete ${out.verde.tempi && out.verde.tempi.rete} ms · texture ${out.verde.tempi && out.verde.tempi.tex} ms · triangoli degli strati (tutti i LOD) ${out.verde.tempi && out.verde.tempi.tri}`);
  }
}
if (out.rosso) {
  const Rr = giudica('rosso', out.rosso, out.rosso);
  if (Rr) { const { C, T, tOk, bOk } = Rr; const vede = (tOk / Math.max(1, T.length) < 0.5) || (bOk / Math.max(1, C.length) < 0.5);
    (vede ? OK : KO)(`rosso: il difetto si vede (taglio ${tOk}/${T.length}, barba ${bOk}/${C.length}: almeno uno sotto il 50%)`); }
}
if (out.movimento) { const M = out.movimento;
  (!M.errore && M.scene >= 5 && M.campioni >= 20 && M.buchi === 0 ? OK : KO)(`movimento: ${M.buchi} vertici fuori dagli strati su ${M.vert} in ${M.campioni} campioni di ${M.scene} scene hl_* (massimo ${M.mmMax} mm)${M.errore ? ' · ' + M.errore : ''}${Object.keys(M.chi).slice(0, 6).map(k => ' · ' + k + ' ' + M.chi[k]).join('')}`); }
console.log(g.join('\n'));
console.log(rosso ? '\nbarba-capelli-432: ROSSO' : '\nbarba-capelli-432: VERDE');
process.exit(rosso ? 1 : 0);
