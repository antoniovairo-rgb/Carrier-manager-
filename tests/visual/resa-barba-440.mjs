#!/usr/bin/env node
/* [giro 440 · PO-686 bis] GUARDIANO resa-barba-440: la barba si giudica dalla RESA, non dal tipo (il 432 era verde 22/22 sul tipo con una
   barba che il PO ha bocciato). GLB acceso, ingresso in campo, salvataggio fixtures/save-190-s12-ovr93.json. Misure: misura-440.mjs
   (punti del viso in azimut/elevazione, gli stessi sul primo piano 3D frontale e sulla figurina).
   SOGLIE DICHIARATE PRIMA, misurando le figurine (930 ritratti di giocatori, stesse zone; numeri nel rapporto del giro 440):
     · BOCCA: labbra visibili (punti-labbro non coperti dalla barba con alfa >= 0,25) >= 0,90 per ogni corpo con barba
       (sulle figurine «rasato» la stessa zona e' libera per lo 0,91 in mediana; una barba vera non copre le labbra).
     · COLORE: contributo della barba al nucleo (3D con barba - 3D senza, stesso fotogramma) contro quello della figurina (nucleo - pelle):
       CIE76 <= 15 per ogni corpo (dispersione dello stesso colore di capelli e dello stesso tipo sulle figurine: p90 14-16).
     · VARIANZA: deviazione standard di L* nel nucleo >= p10 delle figurine del tipo (piena 5,2 · corta 4,5 · pizzetto 4,9 · baffi 6,0).
     · BORDO (piena e corta): pendenza massima dello scurimento lungo le guance (L* per grado, media mobile 5 gradi) non piu' alta di quella
       della figurina dello stesso corpo + 1,0.
   Il ROSSO window.__CPM_NO_G440 (= resa del 432) deve cadere: almeno meta' dei corpi con barba fuori da almeno una soglia; se no la
   misura e' cieca → rosso. Un corpo non giudicato = rosso.
   CAPELLI: con due tagli forzati dal banco («lunghi raccolti» su sei corpi, eroe compreso, window.__CPM_TAGLIO440), calotta e chignon
   presenti; i due «stempiati e corti» del salvataggio (Keith Carr, Noah Marshall) hanno le tempie scoperte (celle > 0); in movimento (scene
   hl_* forzate) nessun vertice di collo/spalle/busto dentro lo chignon e nessun vertice della testa fuori dagli strati (misura del 432).
   Uso: node resa-barba-440.mjs · CPM_SOLO=verde,giorno,rosso,capelli */
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
import { misura440 } from './misura-440.mjs';
import { apriEPronti, penetra432 } from './misura-432.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g440', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,giorno,rosso,capelli').split(',');
export const SOGLIE440 = { bocca: 0.90, dEc: 15, sd: { piena: 5.2, corta: 4.5, pizzetto: 4.9, baffi: 6.0, 'baffi-pizzetto': 4.9, stoppia: 4.5 }, bordo: 1.0 };
const FORZA = { 'Declan Russell': 'lunghi raccolti', 'Aaron Lane': 'lunghi raccolti', 'Samuelito Vairo': 'lunghi raccolti', 'Gary Howard': 'lunghi raccolti', 'Oscar Hayes': 'lunghi raccolti', 'Jackson Burke': 'lunghi raccolti' }; /* sei corpi, eroe compreso: nelle scene forzate ne compare sempre qualcuno */
const SCENE = [3, 14, 50, 79, 133, 161];
export function giudica440(x) {
  const ko = [];
  if (!(x.bocca >= SOGLIE440.bocca)) ko.push(`bocca ${x.bocca}`);
  if (!(x.dEc != null && x.dEc <= SOGLIE440.dEc)) ko.push(`colore ${x.dEc}`);
  const sm = SOGLIE440.sd[x.tipo]; if (sm != null && !(x.sdR >= sm)) ko.push(`varianza ${x.sdR}<${sm}`);
  if ((x.tipo === 'piena' || x.tipo === 'corta') && !(x.contrR != null && x.contrF != null && x.contrR <= x.contrF + SOGLIE440.bordo)) ko.push(`bordo ${x.contrR}>${x.contrF}+1`);
  return ko;
}
async function capelli(b, port) {
  const R = { scene: 0, campioni: 0, chig: 0, dentro: 0, buchi: 0, vert: 0, corpi: {} };
  const { ctx, p, ok } = await apriEPronti(b, port, [], 'night', null, FORZA);
  try {
    if (!ok) { R.errore = 'ingresso non raggiunto'; return R; }
    R.corpi = await p.evaluate(() => { const S = window.__CPM3D.scene, o = {}; S.traverseVisible(x => { const c = x.userData && x.userData.chi240, g = x.userData && x.userData.g432; if (c && c.nome && g) o[c.nome] = { cal: g.calotta, strati: (g.strati || []).slice(), stempia: g.stempia440 || 0 }; }); return o; });
    const chignon = () => p.evaluate(() => { const T = THREE, S = window.__CPM3D.scene; S.updateMatrixWorld(true); let n = 0, dentro = 0, vist = 0; const v = new T.Vector3(), c = new T.Vector3();
      S.traverseVisible(o => { const ch = o.userData && o.userData.chi240; if (!ch || !ch.nome) return; let cm = null; o.traverse(m => { if (!cm && /^Chignon440/.test(m.name || '')) cm = m; }); if (!cm) return; n++;
        cm.geometry.computeBoundingSphere(); const bs = cm.geometry.boundingSphere; c.copy(bs.center).applyMatrix4(cm.matrixWorld); const sc = new T.Vector3().setFromMatrixScale(cm.matrixWorld); const rr = bs.radius * Math.max(sc.x, sc.y, sc.z);
        o.traverse(m => { if (!m.isSkinnedMesh) return; const P = m.geometry.attributes.position, SI = m.geometry.attributes.skinIndex, SW = m.geometry.attributes.skinWeight; const hb = m.skeleton.bones.findIndex(bb => /^head$/i.test(bb.name)); if (!P || !SI) return;
          for (let i = 0; i < P.count; i++) { let wh = 0; for (let j = 0; j < 4; j++) if (SI.array[i * 4 + j] === hb) wh += SW.array[i * 4 + j]; /* r128: niente getComponent */ if (wh > 0.5) continue; /* collo, spalle, busto: non la testa */
            m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); vist++; if (v.distanceTo(c) < rr) dentro++; } }); });
      return { n, dentro, vist }; });
    const c0 = await chignon(); R.chig = c0.n; R.dentro += c0.dentro; R.vertCorpo = c0.vist;
    const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
    for (let k = 0; k < 80; k++) { const f = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null); if (f === 'playing') break; await clic('Salta|Continua|Siamo pronti'); await sleep(700); }
    const pronto = await p.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_LOAD_ALL === 'function').catch(() => false);
    if (!pronto) { R.errore = 'forzatura delle scene non disponibile'; return R; }
    await p.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500);
    for (const gi of SCENE) {
      await p.evaluate(i => window.__CPM_FORCE_SIT(i, false), gi); await sleep(1200); let visti = 0;
      for (let s = 0; s < 3; s++) {
        const ph = await p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
        if (/^hl_/.test(ph || '')) { const c = await chignon().catch(() => null); const m = await penetra432(p).catch(() => null);
          if (c && c.n > 0) { visti++; R.campioni++; R.dentro += c.dentro; } if (m) { R.vert += m.vert; R.buchi += m.buchi; } }
        await sleep(400);
      }
      if (visti) R.scene++;
    }
  } catch (e) { R.errore = String(e && e.message || e).slice(0, 200); }
  finally { await ctx.close(); }
  return R;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const lav = [];
  if (SOLO.includes('verde')) lav.push(misura440(b, port, [], 'night').then(r => ['verde', r]));
  if (SOLO.includes('giorno')) lav.push(misura440(b, port, [], 'day').then(r => ['giorno', r]));
  if (SOLO.includes('rosso')) lav.push(misura440(b, port, ['__CPM_NO_G440'], 'night').then(r => ['rosso', r]));
  const out = Object.fromEntries(await Promise.all(lav));
  if (SOLO.includes('capelli')) out.capelli = await capelli(b, port);
  await b.close(); srv.close();
  fs.writeFileSync('out/g440/resa-barba-440.json', JSON.stringify(out, null, 1));
  const g = []; let rosso = false; const KO = m => { g.push('✗ ' + m); rosso = true; }, OK = m => g.push('✓ ' + m);
  for (const braccio of ['verde', 'giorno']) { const R = out[braccio]; if (!R) continue;
    if (!R.giudicato) { KO(`${braccio}: non giudicato (${R.motivo})`); continue; }
    const B = R.righe.filter(x => !x.senza); const ng = B.filter(x => !x.giudicato); const fuori = B.filter(x => x.giudicato && giudica440(x).length);
    (B.length >= 15 && !ng.length ? OK : KO)(`${braccio}: corpi con barba ${B.length} (>= 15), non giudicati ${ng.length}${ng.map(x => ' · ' + x.nome).join('')}`);
    (!fuori.length ? OK : KO)(`${braccio}: resa entro le soglie ${B.length - fuori.length - ng.length}/${B.length}${fuori.map(x => ' · ' + x.nome + ' (' + giudica440(x).join(', ') + ')').join('')}`);
    const G = B.filter(x => x.giudicato); const mx = k => Math.max(...G.map(x => x[k]).filter(v => v != null));
    g.push(`  ${braccio}: labbra visibili min ${Math.min(...G.map(x => x.bocca))} · colore (contributo) max ${mx('dEc')} · varianza min ${Math.min(...G.map(x => x.sdR))} · tempo trama ${R.tex && R.tex.tex440} ms`);
  }
  if (out.rosso) { const R = out.rosso; if (!R.giudicato) KO(`rosso: non giudicato (${R.motivo})`); else { const B = R.righe.filter(x => !x.senza && x.giudicato); const f = B.filter(x => giudica440(x).length);
    (f.length >= B.length / 2 ? OK : KO)(`rosso (resa del 432): il difetto si vede su ${f.length}/${B.length} corpi (>= meta')${f.slice(0, 5).map(x => ' · ' + x.nome + ' (' + giudica440(x).join(', ') + ')').join('')}`); } }
  if (out.capelli) { const C = out.capelli, cp = C.corpi || {};
    const lr = Object.keys(FORZA).map(n => cp[n]).filter(Boolean); const st = ['Keith Carr', 'Noah Marshall'].map(n => cp[n]).filter(Boolean);
    (lr.length >= 5 && lr.every(x => x.cal === 'lunghi-raccolti' && x.strati.some(s => /^Calotta432_lunghi/.test(s)) && x.strati.some(s => /^Chignon440/.test(s))) ? OK : KO)(`capelli: «lunghi raccolti» con calotta e chignon ${lr.filter(x => x.strati.some(s => /^Chignon440/.test(s))).length}/${lr.length} (forzati ${Object.keys(FORZA).length})`);
    (st.length === 2 && st.every(x => x.cal === 'stempiato' && x.stempia > 0 && x.strati.some(s => /^Fondo432_stempiato/.test(s))) ? OK : KO)(`capelli: «stempiati e corti» con le tempie scoperte ${st.map(x => x.stempia + ' celle').join(' · ')}`);
    (!C.errore && C.scene >= 4 && C.campioni >= 8 && C.dentro === 0 ? OK : KO)(`capelli: chignon e collo/spalle, ${C.dentro} vertici del corpo dentro lo chignon (ingresso + ${C.campioni} campioni in ${C.scene} scene hl_*, ${C.vertCorpo} vertici del corpo controllati all'ingresso)${C.errore ? ' · ' + C.errore : ''}`);
    (C.vert > 0 && C.buchi === 0 ? OK : KO)(`capelli: in movimento ${C.buchi} vertici della testa fuori dagli strati su ${C.vert}`);
  }
  console.log(g.join('\n'));
  console.log(rosso ? '\nresa-barba-440: ROSSO' : '\nresa-barba-440: VERDE');
  process.exit(rosso ? 1 : 0);
}
