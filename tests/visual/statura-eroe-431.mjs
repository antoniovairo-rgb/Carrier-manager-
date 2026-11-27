#!/usr/bin/env node
/* [giro 431 · PO-685, decisione PO «Stessa regola degli altri»] GUARDIANO statura-eroe-431 (e sonda: CPM_MISURA=1 stampa senza giudicare).
   L'eroe in 3D ha la statura e la corporatura della SUA figurina, con la regola che il giro 412 ha dato agli altri 21 corpi:
   statura dichiarata = cm della figurina / 100, corporatura = quella da cui la figurina calcola i kg.
   GLB acceso, ora congelata (notte), salvataggio fixtures/save-190-s12-ovr93.json. Verde + rosso (window.__CPM_NO_G431) nello stesso comando.
   Scene misurate (tutte quelle in cui l'eroe ha un corpo CGTrader acceso per default):
     · INGRESSO in campo (i ventidue in fila): statura sui VERTICI DISEGNATI (suola → cima, maglie deformate dallo scheletro, in metri di
       scena: la traversa e' 2,44), tre letture a 0,8 s, vale la piu' alta (giro 414);
     · HIGHLIGHT (scene forzate, fasi hl_*) e PREMIAZIONE (stessi ventidue corpi): la posa cambia la statura sui vertici, quindi qui si
       giudica la SCALA del corpo per metro dichiarato (scala di mondo y / statura dichiarata), che per lo stesso modello e' la stessa
       regola; i vertici restano stampati;
     · SERATA di presentazione (corpi di corpoCG23, tutti nella stessa posa): statura sui vertici; PARATA sul pullman: scala (l'eroe
       alza la coppa e la cima dei vertici e' la sua mano).
   Giudizio del verde, per ogni scena:
     · testimone userData.alt431 dell'eroe = cm della figurina / 100 (±0,5 cm);
     · RAPPORTO statura 3D / statura della FIGURINA dell'eroe entro ±3% della mediana dei rapporti degli altri corpi della scena (la stessa
       proporzione dei 21: e' la tolleranza del giro 412);
     · corporatura: testimone dell'eroe entro 0,01 da quella della figurina (kg / 22,4·h²) in partita;
     · piedi a terra: suola dell'eroe all'ingresso entro 2 cm da quella del rosso.
   Nel rosso il difetto deve vedersi all'ingresso: rapporto dell'eroe oltre +3% della mediana E testimone diverso dalla figurina.
   «Non giudicato» = rosso. Uso: node statura-eroe-431.mjs · CPM_SOLO=verde|rosso · CPM_FOTO=1 (docs/collaudo-po/431-*.png) */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
fs.mkdirSync('out/g431', { recursive: true });
const SOLO = (process.env.CPM_SOLO || 'verde,rosso').split(','), MISURA = !!process.env.CPM_MISURA, FOTO = !!process.env.CPM_FOTO;
const SCENE_HL = [3, 50, 101, 133];
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const FOTODIR = new URL('../../docs/collaudo-po/', import.meta.url).pathname;

async function pagina(flags, vp) {
  const ctx = await b.newContext({ viewport: vp || { width: 800, height: 450 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = [];
  p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await p.addInitScript(([o, f]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = 'night'; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, flags]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  return { ctx, p, err };
}
/* lettura nel gioco: un record per corpo con testimone alt431 (sorgente: scena intera della partita, o la lista dei corpi della cerimonia) */
const leggi = (p, sorg) => p.evaluate((sorg) => { const T = THREE, v = new T.Vector3(), out = [];
  let corpi = [];
  if (sorg === 'partita') { const S = window.__CPM3D && window.__CPM3D.scene; if (!S) return null; S.updateMatrixWorld(true); S.traverseVisible(o => { if (o.userData && o.userData.alt431) corpi.push(o); }); }
  else { const L = sorg === 'serata' ? (window.__CPM_PRES142 && window.__CPM_PRES142.men) : (window.__CPM_PARATA && window.__CPM_PARATA.men23); if (!L) return null; corpi = L.filter(o => o && o.userData && o.userData.alt431); corpi.forEach(o => o.updateMatrixWorld(true)); }
  for (const o of corpi) { let sole = Infinity, alto = -Infinity;
    o.traverseVisible(m => { if (!m.isSkinnedMesh || !m.geometry || !m.geometry.attributes.position) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count / 3000)); for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i); m.boneTransform ? m.boneTransform(i, v) : 0; v.applyMatrix4(m.matrixWorld); if (v.y < sole) sole = v.y; if (v.y > alto) alto = v.y; } });
    if (!isFinite(sole)) continue; const ws = new T.Vector3(); o.getWorldScale(ws); const c = o.userData.chi240 || {}; const A = o.userData.alt431;
    out.push({ nome: c.nome || null, eroe: c.ruolo === 'eroe' || !!A.eroe, h: A.h, girth: A.girth != null ? A.girth : null, alt3d: +(alto - sole).toFixed(3), suola: +sole.toFixed(3), sy: ws.y, corp: +(ws.x / ws.y).toFixed(3) }); }
  let fig = null; try { fig = datiFigurina23('giocatore', 'eroe', null); } catch (e) {}
  return { corpi: out, fig: fig ? { cm: fig.cm, kg: fig.kg } : null, ph: window.__CPM_PHASE ? window.__CPM_PHASE() : null }; }, sorg).catch(e => ({ errore: String(e.message).slice(0, 160) }));
const clic = (p, re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
const fase = p => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
const pronto = p => p.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer && window.__CPM_GLB_READY)).catch(() => false);
const med = a => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[s.length >> 1] : null; };
/* sintesi di una lettura: eroe + mediana dei rapporti degli altri; modo 'vertici' (statura sui vertici) o 'scala' (scala per metro dichiarato) */
function sintesi(L, modo) { if (!L || L.errore || !L.corpi) return { errore: (L && L.errore) || 'nessuna lettura' };
  const E = L.corpi.find(c => c.eroe), A = L.corpi.filter(c => !c.eroe); if (!E) return { errore: 'eroe non trovato fra i corpi con testimone', n: L.corpi.length };
  /* il riferimento dell'eroe e' la SUA FIGURINA (cm/100), quello degli altri la statura con cui sono dichiarati (in partita = la loro figurina, giro 412) */
  const r = (c, ref) => (modo === 'scala' ? c.sy : c.alt3d) / (ref || c.h); const mA = med(A.map(c => r(c))); const out = { n: L.corpi.length, altri: A.length, fig: L.fig, eroe: { h: E.h, girth: E.girth, alt3d: E.alt3d, suola: E.suola, corp: E.corp }, rapEroe: L.fig && L.fig.cm ? +(r(E, L.fig.cm / 100) / mA).toFixed(4) : null };
  out.altMax = Math.max(...A.map(c => c.alt3d)); out.altMin = Math.min(...A.map(c => c.alt3d)); out.piuAlto = E.alt3d >= out.altMax;
  if (L.fig) { out.cm = L.fig.cm; out.kg = L.fig.kg; out.girthFig = +(L.fig.kg / (22.4 * (L.fig.cm / 100) ** 2)).toFixed(3); }
  return out; }
async function braccio(nome, flags) {
  const R = { nome, scene: {}, err: [] }; const tag = nome === 'verde' ? 'dopo' : 'prima';
  /* PARTITA: ingresso → highlight forzati → premiazione */
  { const { ctx, p, err } = await pagina(flags); try {
      await p.evaluate(() => window.__CPM_CAREER.playMatch()); let ok = false;
      for (let k = 0; k < 140; k++) { const f = await fase(p); if (f === 'walkout' && await pronto(p)) { ok = true; break; } if (f === 'playing') break; await clic(p, 'Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua'); await sleep(700); }
      if (ok) { await p.waitForFunction(() => { const S = window.__CPM3D && window.__CPM3D.scene; if (!S) return false; let n = 0, pr = 0; S.traverseVisible(o => { if (o.userData && o.userData.chi240 && o.userData.chi240.nome) { n++; const h = o.userData.cpmNativeHair; if (h && h.applied) pr++; } }); return n >= 22 && pr === n; }, null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
        let L = await leggi(p, 'partita'); for (let k = 0; k < 2 && L && L.corpi; k++) { await sleep(800); const D = await leggi(p, 'partita'); if (D && D.corpi) for (const c of L.corpi) { const d = D.corpi.find(x => x.nome === c.nome && x.eroe === c.eroe); if (d && d.alt3d > c.alt3d) c.alt3d = d.alt3d; } }
        R.scene.ingresso = sintesi(L, 'vertici'); R.tabIngresso = L && L.corpi ? L.corpi.map(c => `${c.eroe ? '*' : ' '}${(c.nome || '?').padEnd(20)} h ${c.h} 3D ${Math.round(c.alt3d * 100)} cm`) : null;
        if (FOTO) { await p.screenshot({ path: `${FOTODIR}431-${tag}-ingresso.png` });
          /* primo piano di confronto: l'eroe fra i due compagni a lui piu' vicini, CLONATI nella posa del momento (SkeletonUtils) in una scena
             a parte, affiancati alla stessa distanza dalla camera, suola sul pavimento; righe a 1,8 · 1,9 · 2,0 m; sotto ogni corpo nome,
             cm della figurina e cm misurati sui vertici (del corpo vero, nel gioco) */
          const u = await p.evaluate(() => { const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; const L = []; S.updateMatrixWorld(true); S.traverseVisible(o => { if (o.userData && o.userData.alt431) L.push(o); });
            const E = L.find(o => o.userData.chi240 && o.userData.chi240.ruolo === 'eroe'); if (!E) return null; const pe = E.getWorldPosition(new T.Vector3());
            const vic = L.filter(o => o !== E && o.userData.chi240 && o.userData.chi240.ruolo === 'home').map(o => [o, o.getWorldPosition(new T.Vector3()).distanceTo(pe)]).sort((a, c) => a[1] - c[1]).slice(0, 2).map(x => x[0]);
            const tre = [vic[0], E, vic[1]].filter(Boolean); const v = new T.Vector3();
            const alt = o => { let lo = Infinity, hi = -Infinity; o.traverseVisible(m => { if (!m.isSkinnedMesh) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count / 3000)); for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i); m.boneTransform(i, v); v.applyMatrix4(m.matrixWorld); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); } }); return [lo, hi]; };
            const SC = new T.Scene(); SC.background = new T.Color(0xdfe3ea); SC.add(new T.HemisphereLight(0xffffff, 0x667788, 0.9)); const dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(2, 5, 6); SC.add(dl);
            const fl = new T.Mesh(new T.PlaneGeometry(12, 4), new T.MeshBasicMaterial({ color: 0x9aa6b4 })); fl.rotation.x = -Math.PI / 2; SC.add(fl);
            for (const y of [1.8, 1.9, 2.0]) { const ln = new T.Mesh(new T.PlaneGeometry(5.4, 0.006), new T.MeshBasicMaterial({ color: 0x334155 })); ln.position.set(0, y, 0); SC.add(ln); }
            const etich = []; tre.forEach((o, k) => { const ws = new T.Vector3(), wq = new T.Quaternion(); o.matrixWorld.decompose(new T.Vector3(), wq, ws); const cl = T.SkeletonUtils.clone(o); cl.position.set(0, 0, 0); cl.quaternion.identity(); cl.scale.copy(ws);
              const g = new T.Group(); g.add(cl); g.position.set((k - (tre.length - 1) / 2) * 1.6, 0, 0); SC.add(g); g.updateMatrixWorld(true); const [lo] = alt(cl); g.position.y -= lo; g.updateMatrixWorld(true);
              const [l2, h2] = alt(o); const eroe = o === E; let cm = null; try { cm = datiFigurina23('giocatore', eroe ? 'eroe' : o.userData.chi240.nome, eroe ? null : o.userData.chi240.nome).cm; } catch (e) {}
              etich.push({ k, nome: o.userData.chi240.nome, eroe, cm, m3: Math.round((h2 - l2) * 100) }); });
            const cam = new T.PerspectiveCamera(22, 1.5, 0.1, 100); cam.position.set(0, 1.0, 9.5); cam.lookAt(0, 1.0, 0);
            etich.forEach(e => { const q = new T.Vector3((e.k - (tre.length - 1) / 2) * 1.6, 0, 0).project(cam); e.x = (q.x + 1) / 2 * 900; });
            const ry = [1.8, 1.9, 2.0].map(y => ({ y, py: (1 - (new T.Vector3(2.7, y, 0).project(cam).y + 1) / 2) * 600 }));
            const sz = R.getSize(new T.Vector2()); R.setSize(900, 600, false); R.render(SC, cam); const img = R.domElement.toDataURL('image/png'); R.setSize(sz.x, sz.y, false);
            return { img, etich, ry }; }).catch(e => { console.log('foto431', e.message); return null; });
          const uu = u && await p.evaluate(({ img, etich, ry }) => new Promise(res => { const im = new Image(); im.onload = () => { const cv = document.createElement('canvas'); cv.width = 900; cv.height = 690; const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 900, 690); g.drawImage(im, 0, 0);
              g.textAlign = 'left'; g.fillStyle = '#334155'; g.font = '13px sans-serif'; for (const r of ry) g.fillText(r.y.toFixed(1).replace('.', ',') + ' m', 812, r.py - 4); g.textAlign = 'center'; for (const e of etich) { g.fillStyle = e.eroe ? '#b91c1c' : '#111'; g.font = 'bold 17px sans-serif'; g.fillText(e.nome + (e.eroe ? ' (eroe)' : ''), e.x, 628); g.font = '15px sans-serif'; g.fillText(`figurina ${e.cm} cm · 3D ${e.m3} cm`, e.x, 652); } res(cv.toDataURL('image/png')); }; im.src = img; }), u);
          const u2 = uu || null;
          if (u2) fs.writeFileSync(`${FOTODIR}431-${tag}-ingresso-vicini.png`, Buffer.from(u2.split(',')[1], 'base64')); } }
      else R.scene.ingresso = { errore: 'ingresso in campo mai raggiunto coi corpi pronti' };
      for (let k = 0; k < 80; k++) { if (await fase(p) === 'playing' && await pronto(p)) break; await clic(p, 'Salta|Continua|Siamo pronti|Vedi le formazioni|Ingresso in campo|Diplomatico'); await sleep(700); }
      const forz = await p.evaluate(() => typeof window.__CPM_FORCE_SIT === 'function' && typeof window.__CPM_LOAD_ALL === 'function').catch(() => false);
      if (!forz) R.scene.highlight = { errore: 'forzatura delle scene non disponibile' };
      else { await p.evaluate(() => window.__CPM_LOAD_ALL()); await sleep(500); const rap = [], dett = [];
        for (const gi of SCENE_HL) { await p.evaluate(i => window.__CPM_FORCE_SIT(i, false), gi); await sleep(1500);
          for (let s = 0; s < 2; s++) { const L = await leggi(p, 'partita'); if (L && /^hl_/.test(L.ph || '')) { const S = sintesi(L, 'scala'); if (!S.errore && S.altri >= 3) { rap.push(S.rapEroe); dett.push(`gi${gi}: rapporto ${S.rapEroe} · eroe ${Math.round(S.eroe.alt3d * 100)} cm sui vertici (posa) · altri ${S.altri}`); R.scene.highlight = Object.assign(S, { rapTutti: rap, dett }); } } await sleep(500); }
          if (FOTO && gi === SCENE_HL[0]) await p.screenshot({ path: `${FOTODIR}431-${tag}-highlight.png` }); }
        if (!rap.length) R.scene.highlight = { errore: 'nessun campione in hl_* con l\'eroe e almeno 3 altri corpi' };
        else { R.scene.highlight.rapEroe = rap.reduce((m, x) => Math.abs(x - 1) > Math.abs(m - 1) ? x : m, 1); R.scene.highlight.campioni = rap.length; } }
      await p.evaluate(() => window.__CPM_FORCE_CEREMONY && window.__CPM_FORCE_CEREMONY({ name: 'COPPA NAZIONALE', kind: 'cup' })).catch(() => {}); await sleep(5000);
      { const L = await leggi(p, 'partita'); R.scene.premiazione = sintesi(L, 'scala'); if (FOTO) await p.screenshot({ path: `${FOTODIR}431-${tag}-premiazione.png` }); }
    } catch (e) { R.err.push('partita: ' + String(e && e.message || e).slice(0, 200)); } R.err.push(...err.slice(0, 3)); await ctx.close(); }
  /* SERATA di presentazione */
  { const { ctx, p, err } = await pagina(flags, { width: 412, height: 915 }); try { await p.evaluate(() => window.__CPM_CAREER.apriPresentazione(1));
      await p.waitForFunction(() => window.__CPM_PRES142 && window.__CPM_PRES142.men && window.__CPM_PRES142.men.length >= 2, null, { timeout: 90000 });
      await p.waitForFunction(() => window.__CPM_PRES142.men.every(m => { const h = m.userData && m.userData.cpmNativeHair; return h && h.applied; }), null, { timeout: 60000 }).catch(() => {}); await sleep(2500);
      R.scene.serata = sintesi(await leggi(p, 'serata'), 'vertici'); if (FOTO) await p.screenshot({ path: `${FOTODIR}431-${tag}-serata.png` });
    } catch (e) { R.scene.serata = { errore: String(e && e.message || e).slice(0, 200) }; } R.err.push(...err.slice(0, 3)); await ctx.close(); }
  /* PARATA sul pullman */
  { const { ctx, p, err } = await pagina(flags, { width: 412, height: 915 }); try {
      await p.waitForFunction(() => typeof window.__CPM_PARATA198_C === 'function', null, { timeout: 60000 });
      await p.evaluate(() => { const s0 = JSON.parse(localStorage.getItem('cpm-v3')), pl = s0.player || s0; const el = document.createElement('div'); el.id = 'parata431'; el.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000'; document.body.appendChild(el);
        ReactDOM.createRoot(el).render(React.createElement(window.__CPM_PARATA198_C, { club: pl.club, euroWin: true, avatarId: pl.avatarId || 0, heroNum: pl.jerseyNum || 9 })); });
      await p.waitForFunction(() => window.__CPM_PARATA && (window.__CPM_PARATA.men23 || []).length >= 8, null, { timeout: 90000 }); await sleep(3000);
      R.scene.parata = sintesi(await leggi(p, 'parata'), 'scala');/* sul pullman l'eroe alza la coppa: la cima dei vertici e' la mano (misurato +2,9% sui vertici), si giudica la scala */ if (FOTO) await p.screenshot({ path: `${FOTODIR}431-${tag}-parata.png` });
    } catch (e) { R.scene.parata = { errore: String(e && e.message || e).slice(0, 200) }; } R.err.push(...err.slice(0, 3)); await ctx.close(); }
  return R;
}
const out = {};
for (const [nome, flags] of [['verde', []], ['rosso', ['__CPM_NO_G431']]]) if (SOLO.includes(nome)) out[nome] = await braccio(nome, flags);
await b.close(); srv.close();
fs.writeFileSync('out/g431/statura-eroe-431.json', JSON.stringify(out, null, 1));
const SC = ['ingresso', 'highlight', 'premiazione', 'serata', 'parata'];
for (const nome of ['verde', 'rosso']) { const R = out[nome]; if (!R) continue; console.log(nome.toUpperCase());
  for (const s of SC) { const S = R.scene[s]; if (!S || S.errore) { console.log(`  ${s.padEnd(12)} NON GIUDICATO: ${S ? S.errore : 'assente'}`); continue; }
    console.log(`  ${s.padEnd(12)} figurina ${S.cm} cm/${S.kg} kg (corp ${S.girthFig}) · eroe dichiarato ${S.eroe.h} corp ${S.eroe.girth} · 3D vertici ${Math.round(S.eroe.alt3d * 100)} cm (altri ${Math.round(S.altMin * 100)}-${Math.round(S.altMax * 100)}, ${S.altri}) · rapporto eroe/mediana ${S.rapEroe}${S.piuAlto ? ' · IL PIU\' ALTO' : ''} · suola ${S.eroe.suola}${S.campioni ? ' · campioni ' + S.campioni : ''}`); }
  if (MISURA && R.tabIngresso) R.tabIngresso.forEach(x => console.log('     ' + x)); if (R.err.length) console.log('  errori: ' + JSON.stringify(R.err)); }
if (MISURA) process.exit(0);
const g = [];
if (out.verde) { const V = out.verde;
  for (const s of SC) { const S = V.scene[s], add = x => g.push(`verde · ${s}: ${x}`); if (!S || S.errore) { add('non giudicato — ' + (S ? S.errore : 'assente')); continue; }
    if (!S.cm) { add('non giudicato — figurina dell\'eroe senza cm'); continue; }
    if (!(Math.abs(S.eroe.h - S.cm / 100) <= 0.005)) add(`statura dichiarata ${S.eroe.h} contro figurina ${S.cm / 100}`);
    if (!(Math.abs(S.rapEroe - 1) <= 0.03)) add(`rapporto statura 3D / figurina dell'eroe ${S.rapEroe} della mediana degli altri (tolleranza ±3%)`);
    if (['ingresso', 'highlight', 'premiazione'].includes(s) && !(S.eroe.girth != null && Math.abs(S.eroe.girth - S.girthFig) <= 0.01)) add(`corporatura dell'eroe ${S.eroe.girth} contro figurina ${S.girthFig}`); }
  const Vi = V.scene.ingresso, Ri = out.rosso && out.rosso.scene.ingresso;
  if (Vi && !Vi.errore && Ri && !Ri.errore && !(Math.abs(Vi.eroe.suola - Ri.eroe.suola) <= 0.02)) g.push(`verde · ingresso: suola dell'eroe ${Vi.eroe.suola} contro rosso ${Ri.eroe.suola} (tolleranza 2 cm)`);
  if (V.err.length) g.push('verde · errori di pagina: ' + JSON.stringify(V.err)); }
if (out.rosso) { const S = out.rosso.scene.ingresso; if (!S || S.errore) g.push('rosso · ingresso: non giudicato — ' + (S ? S.errore : 'assente'));
  else if (!(S.rapEroe > 1.03 && S.cm && Math.abs(S.eroe.h - S.cm / 100) > 0.005)) g.push(`rosso · ingresso: il difetto non si vede (rapporto ${S.rapEroe}, dichiarata ${S.eroe.h}, figurina ${S.cm})`); }
if (g.length) { console.log('❌ statura-eroe-431'); g.forEach(x => console.log('  · ' + x)); process.exit(1); }
console.log('✅ statura-eroe-431 verde (e il rosso si vede)');
