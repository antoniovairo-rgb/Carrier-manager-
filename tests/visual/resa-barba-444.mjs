#!/usr/bin/env node
/* [giro 444 · PO-686 ter] GUARDIANO resa-barba-444. Decisione PO 28/11 sulle foto del 440: «Barbe si', il resto rifatto».
   GLB acceso, ingresso in campo, salvataggio fixtures/save-190-s12-ovr93.json (come il 440).
   A) TAGLI SPENTI. «Stempiati e corti» e «lunghi raccolti» tornano alla testa del corpo (tabella assets/aspetto/aspetto-432.json: null in
      «tagli», valori conservati in «spenti_444»). Sui 22 corpi del banco, e con «lunghi raccolti» dato dal banco a sei nomi
      (window.__CPM_TAGLIO440, eroe compreso): nessuna calotta «stempiato» o «lunghi-raccolti», nessuno strato Fondo432_stempiato,
      Calotta432_stempiato, Calotta432_lunghi-raccolti o Chignon440. Rosso: window.__CPM_TAB444_PRIMA (tabella del 440, solo banco)
      → gli stempiati del salvataggio (Keith Carr, Noah Marshall) e i sei forzati devono tornare a mostrare la calotta, se no la misura
      e' cieca.
   B) BAFFI FOLTI E LARGHI. misura-444.mjs (mezza intensita', stessi punti del viso del 440). SOGLIE DICHIARATE PRIMA, dalle figurine
      dei 6 corpi «baffi sottili» del banco (misurate con la stessa sonda, riferimento = pelle della stessa riga e dello stesso lato):
      larghezza mediana 48 gradi, spessore mediano 5 gradi della testa. La mappa e' una sola per tipo (non per giocatore), quindi il
      confronto e' con la MEDIANA delle figurine:
        · larghezza 3D >= 0,85 x mediana delle figurine · spessore 3D >= 0,8 x mediana delle figurine (per ogni corpo)
        · labbra visibili >= 0,90 (soglia del 440, punti-labbro della texture della testa)
        · almeno 4 figurine giudicate (nucleo sopra 6 L*), ogni corpo 3D giudicato.
      Rosso window.__CPM_NO_G444 (= baffi del 440): almeno meta' dei corpi fuori soglia, se no la misura e' cieca → rosso.
   Uso: node resa-barba-444.mjs · CPM_SOLO=tagli,verde,giorno,rosso */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { misura444 } from './misura-444.mjs';
import { apriEPronti } from './misura-432.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g444', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'tagli,verde,giorno,rosso').split(',');
export const SOGLIE444 = { larg: 0.85, spess: 0.8, bocca: 0.90, figMin: 4 };
const FORZA = { 'Declan Russell': 'lunghi raccolti', 'Aaron Lane': 'lunghi raccolti', 'Samuelito Vairo': 'lunghi raccolti', 'Gary Howard': 'lunghi raccolti', 'Oscar Hayes': 'lunghi raccolti', 'Jackson Burke': 'lunghi raccolti' };
const SPENTI = /^(Fondo432_stempiato|Calotta432_stempiato|Calotta432_lunghi-raccolti|Chignon440)/;
const mediana = A => { const s = [...A].sort((a, b) => a - b); return s.length ? (s.length % 2 ? s[s.length >> 1] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
async function tagli(b, port, flags, forza) {
  const { ctx, p, ok } = await apriEPronti(b, port, flags, 'night', null, forza);
  try {
    if (!ok) return { giudicato: false, motivo: 'ingresso non raggiunto' };
    return { giudicato: true, corpi: await p.evaluate(() => { const S = window.__CPM3D.scene, o = {}; S.traverseVisible(x => { const c = x.userData && x.userData.chi240; if (!c || !c.nome) return; const g = x.userData.g432; const st = []; x.traverse(m => { if (m.userData && m.userData.g432 === 1 && m.name) st.push(m.name); }); let fg = null; try { fg = aspettoFigurina225(c.nome); } catch (e) {} o[c.nome] = { t: fg && fg.t, cal: g ? g.calotta : null, pronto: !!(g && g.pronto), strati: st }; }); return o; }) };
  } finally { await ctx.close(); }
}
function giudicaBaffi(R, med) {
  const ko = (x) => { const k = []; if (!(x.bocca >= SOGLIE444.bocca)) k.push(`labbra ${x.bocca}`); if (!(x.d3.larghezza >= SOGLIE444.larg * med.larg)) k.push(`larghezza ${x.d3.larghezza} < ${(SOGLIE444.larg * med.larg).toFixed(1)}`); if (!(x.d3.spessore >= SOGLIE444.spess * med.spess)) k.push(`spessore ${x.d3.spessore} < ${(SOGLIE444.spess * med.spess).toFixed(1)}`); return k; };
  return R.righe.filter(x => !x.senza).map(x => ({ ...x, ko: x.giudicato ? ko(x) : ['non giudicato'] }));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const lav = [];
  if (SOLO.includes('tagli')) { lav.push(tagli(b, port, [], null).then(r => ['tagli', r])); lav.push(tagli(b, port, [], FORZA).then(r => ['tagliForzati', r])); lav.push(tagli(b, port, ['__CPM_TAB444_PRIMA'], FORZA).then(r => ['tagliRosso', r])); }
  const out = Object.fromEntries(await Promise.all(lav));
  const lav2 = [];
  if (SOLO.includes('verde')) lav2.push(misura444(b, port, [], 'night').then(r => ['verde', r]));
  if (SOLO.includes('giorno')) lav2.push(misura444(b, port, [], 'day').then(r => ['giorno', r]));
  if (SOLO.includes('rosso')) lav2.push(misura444(b, port, ['__CPM_NO_G444'], 'night').then(r => ['rosso', r]));
  Object.assign(out, Object.fromEntries(await Promise.all(lav2)));
  await b.close(); srv.close();
  fs.writeFileSync('out/g444/resa-barba-444.json', JSON.stringify(out, null, 1));
  const g = []; let rosso = false; const KO = m => { g.push('✗ ' + m); rosso = true; }, OK = m => g.push('✓ ' + m);
  /* A) tagli */
  for (const [k, titolo] of [['tagli', '22 corpi del banco'], ['tagliForzati', '«lunghi raccolti» dato dal banco a sei nomi']]) { const R = out[k]; if (!R) continue;
    if (!R.giudicato) { KO(`tagli (${titolo}): non giudicato (${R.motivo})`); continue; }
    const C = Object.entries(R.corpi); const pronti = C.filter(([, c]) => c.pronto).length; const brutti = C.filter(([, c]) => c.cal === 'stempiato' || c.cal === 'lunghi-raccolti' || c.strati.some(s => SPENTI.test(s)));
    (C.length >= 22 && pronti === C.length ? OK : KO)(`tagli (${titolo}): corpi ${C.length} (>= 22), strati pronti ${pronti}`);
    (!brutti.length ? OK : KO)(`tagli (${titolo}): calotta liscia di stempiato/lunghi raccolti su ${brutti.length} corpi${brutti.map(([n, c]) => ' · ' + n + ' (' + c.cal + ')').join('')}`);
    const nat = C.filter(([, c]) => /stempiati|lunghi raccolti/.test(c.t || '')).map(([n]) => n);
    if (k === 'tagli') g.push(`  stempiati/lunghi del salvataggio, ora alla testa del corpo: ${nat.join(', ') || 'nessuno'}`);
  }
  if (out.tagliRosso) { const R = out.tagliRosso; if (!R.giudicato) KO(`tagli rosso: non giudicato (${R.motivo})`); else {
    const C = Object.entries(R.corpi); const vis = C.filter(([, c]) => c.strati.some(s => SPENTI.test(s)));
    (vis.length >= 6 ? OK : KO)(`tagli rosso (tabella del 440, __CPM_TAB444_PRIMA): la calotta liscia si vede su ${vis.length} corpi (>= 6)${vis.map(([n, c]) => ' · ' + n + ' (' + c.cal + ')').join('')}`); } }
  /* B) baffi */
  let med = null;
  for (const braccio of ['verde', 'giorno', 'rosso']) { const R = out[braccio]; if (!R) continue;
    if (!R.giudicato) { KO(`baffi ${braccio}: non giudicato (${R.motivo})`); continue; }
    const B = R.righe.filter(x => !x.senza); const F = B.filter(x => x.fig && x.fig.larghezza > 0);
    const m = { larg: mediana(F.map(x => x.fig.larghezza)), spess: mediana(F.map(x => x.fig.spessore)), n: F.length }; if (!med) med = m;
    if (braccio !== 'rosso') (F.length >= SOGLIE444.figMin ? OK : KO)(`baffi ${braccio}: figurine giudicate ${F.length}/${B.length} (>= ${SOGLIE444.figMin}) · mediana larghezza ${m.larg} · spessore ${m.spess}`);
    const G = giudicaBaffi(R, med); const fuori = G.filter(x => x.ko.length);
    g.push('  ' + braccio + ': ' + G.map(x => `${x.nome} ${x.d3 ? x.d3.larghezza + '°/' + x.d3.spessore + '°' : '-'} (fig ${x.fig ? x.fig.larghezza + '/' + x.fig.spessore : '-'}) labbra ${x.bocca}`).join(' · '));
    if (braccio === 'rosso') (fuori.length >= G.length / 2 && G.length ? OK : KO)(`baffi rosso (baffi del 440, __CPM_NO_G444): fuori soglia ${fuori.length}/${G.length} (>= meta')${fuori.slice(0, 6).map(x => ' · ' + x.nome + ' (' + x.ko.join(', ') + ')').join('')}`);
    else { (G.length >= 5 ? OK : KO)(`baffi ${braccio}: corpi coi baffi ${G.length} (>= 5)`); (!fuori.length ? OK : KO)(`baffi ${braccio}: folti e larghi entro le soglie ${G.length - fuori.length}/${G.length}${fuori.map(x => ' · ' + x.nome + ' (' + x.ko.join(', ') + ')').join('')}`); }
  }
  console.log(g.join('\n'));
  console.log(rosso ? '\nresa-barba-444: ROSSO' : '\nresa-barba-444: VERDE');
  process.exit(rosso ? 1 : 0);
}
