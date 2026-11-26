#!/usr/bin/env node
/* [giro 412 · PO-612] SONDA dell'aspetto: il giocatore 3D contro la sua figurina.
   Apre una partita vera (GLB acceso, ora congelata, salvataggio fixtures/save-190-s12-ovr93.json), si ferma all'INGRESSO IN CAMPO
   (i ventidue corpi in fila, fermi, tutti con nome) e per ogni corpo CGTrader con nome legge:
     · dalla figurina (stesse funzioni del gioco): statura e peso dichiarati (datiFigurina23), volto, carnagione, colore dei capelli
       (aspettoFigurina225) e, dal manifest dei ritratti, taglio/lunghezza dei capelli e barba;
     · dal corpo 3D: altezza in scena (riquadro delle maglie visibili e scheletro, in unita' di scena = metri: la porta e' 2,44),
       corporatura (scala x/y), variante della testa (black/brown/blond/auburn), quota della suola.
   Con CPM_FOTO=1 scrive per FOTO corpi un'immagine affiancata figurina | corpo 3D (primo piano a figura intera, gli altri corpi
   nascosti) in docs/collaudo-po/412-confronto-<n>.png.
   Uso: node misura-412.mjs [--rosso] · CPM_TOD=night|day|dusk · CPM_FOTO=1 · CPM_NFOTO=6 · CPM_JSON=out/g412/x.json */
import { startServer, launchBrowser, installCdnRoutes, sleep } from './lib/harness.mjs';
import fs from 'node:fs';
import path from 'node:path';
fs.mkdirSync('out/g412', { recursive: true });
const ROSSO = process.argv.includes('--rosso'), TOD = process.env.CPM_TOD || 'night', FOTO = !!process.env.CPM_FOTO, NFOTO = +(process.env.CPM_NFOTO || 6);
const SAVE = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const MAN = Object.values(JSON.parse(fs.readFileSync(new URL('../../assets/portraits/ai/manifest.json', import.meta.url))));
const perN = new Map(MAN.map(x => [+x.id.replace(/\D/g, ''), x]));
export async function apriIngresso(b, port, flags, vp) {
  const ctx = await b.newContext({ viewport: vp || { width: 800, height: 450 }, serviceWorkers: 'block' }); await installCdnRoutes(ctx); const p = await ctx.newPage(); const err = [];
  p.on('pageerror', e => err.push(String(e.message).slice(0, 160)));
  await p.addInitScript(([o, f, tod]) => { window.__CPM_GLB = true; window.__CPM_PRESENT = 1; window.__CPM_TOD = tod; for (const k of f) window[k] = 1; localStorage.setItem('cpm-v3', JSON.stringify(o)); localStorage.setItem('cpm-intro-seen', '1'); }, [SAVE, flags, TOD]);
  await p.goto(`http://localhost:${port}/CARRIER-MANAGER-AV.html?cpmtest=1&cpmwx=partly`, { waitUntil: 'load', timeout: 120000 });
  await p.waitForFunction(() => { const r = document.getElementById('root'); return r && r.children.length > 0; }, null, { timeout: 90000 }); await sleep(1200);
  try { await p.getByText('Continua', { exact: false }).first().click({ timeout: 5000 }); } catch (e) {}
  await p.waitForFunction(() => !!window.__CPM_CAREER, null, { timeout: 40000 }); await sleep(1200);
  try { await p.evaluate(() => window.__CPM_CAREER.dismiss()); } catch (e) {}
  await p.evaluate(() => window.__CPM_CAREER.playMatch());
  const ph = () => p.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE()).catch(() => null);
  const pronto = () => p.evaluate(() => !!(window.__CPM3D && window.__CPM3D.renderer && window.__CPM_GLB_READY)).catch(() => false);
  const clic = (re) => p.evaluate((s) => { const bs = [...document.querySelectorAll('button')].filter(x => x.offsetParent !== null); const x = bs.find(q => new RegExp(s, 'i').test(q.textContent || '')); if (x) x.click(); return !!x; }, re).catch(() => false);
  let ok = false;
  for (let k = 0; k < 140; k++) { const f = await ph(); if (f === 'walkout' && await pronto()) { ok = true; break; } if (f === 'playing') break; await clic('Vedi le formazioni|Ingresso in campo|Diplomatico|Siamo pronti|Continua'); await sleep(700); }
  if (ok) { /* si attende un EVENTO: tutte le teste con la loro mappa (giro 240) */
    await p.waitForFunction(() => { const S = window.__CPM3D && window.__CPM3D.scene; if (!S) return false; let n = 0, pr = 0; S.traverseVisible(o => { if (o.userData && o.userData.chi240 && o.userData.chi240.nome) { n++; const h = o.userData.cpmNativeHair; if (h && h.applied) pr++; } }); return n >= 22 && pr === n; }, null, { timeout: 60000 }).catch(() => {});
    await sleep(2500); }
  return { ctx, p, err, ok };
}
/* lettura nel gioco: un record per corpo visibile con nome */
export async function leggiCorpi(p) {
  return p.evaluate(() => { const T = THREE, S = window.__CPM3D.scene, out = []; const v = new T.Vector3(), box = new T.Box3();
    S.updateMatrixWorld(true);
    S.traverseVisible(o => { const c = o.userData && o.userData.chi240; if (!c || !c.nome) return;
      let lo = Infinity, hi = -Infinity, sole = Infinity, head = null; o.traverse(b => { if (!b.isBone) return; b.getWorldPosition(v); lo = Math.min(lo, v.y); hi = Math.max(hi, v.y); if (/^head$/i.test(b.name)) head = v.y; });
      box.makeEmpty(); o.traverseVisible(m => { if (m.isSkinnedMesh || m.isMesh) { m.geometry.computeBoundingBox && !m.geometry.boundingBox && m.geometry.computeBoundingBox(); const bb = m.geometry.boundingBox; if (bb) { const b2 = bb.clone().applyMatrix4(m.matrixWorld); box.union(b2); } } });
      /* suola: vertici dei piedi disegnati (stessa idea di __CPM_VOLA366): minimo y dei vertici deformati delle maglie visibili, a campione */
      o.traverseVisible(m => { if (!m.isSkinnedMesh || !m.geometry || !m.geometry.attributes.position) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count / 1500)); for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i); m.boneTransform ? m.boneTransform(i, v) : 0; v.applyMatrix4(m.matrixWorld); if (v.y < sole) sole = v.y; } });
      let alto = -Infinity; o.traverseVisible(m => { if (!m.isSkinnedMesh || !m.geometry || !m.geometry.attributes.position) return; const pa = m.geometry.attributes.position, st = Math.max(1, Math.floor(pa.count / 3000)); for (let i = 0; i < pa.count; i += st) { v.fromBufferAttribute(pa, i); m.boneTransform ? m.boneTransform(i, v) : 0; v.applyMatrix4(m.matrixWorld); if (v.y > alto) alto = v.y; } });
      const ws = new T.Vector3(); o.getWorldScale(ws);
      let fig = null, dati = null; try { fig = aspettoFigurina225(c.nome); } catch (e) {} try { dati = datiFigurina23('giocatore', c.ruolo === 'eroe' ? 'eroe' : c.nome, c.ruolo === 'eroe' ? null : c.nome); } catch (e) {}
      out.push({ nome: c.nome, ruolo: c.ruolo, testa: (o.userData.cpmNativeHair || {}).variant || null, alt3d: +(alto - sole).toFixed(3), ossa: +(hi - lo).toFixed(3), testaY: head != null ? +(head - sole).toFixed(3) : null, suola: +sole.toFixed(3), corp: +(ws.x / ws.y).toFixed(3), riq: +(box.max.y - box.min.y).toFixed(3),
        fig: fig ? { n: fig.n, k: fig.k, h: fig.h, p: fig.p } : null, cm: dati ? dati.cm : null, kg: dati ? dati.kg : null, g412: o.userData.g412 || null }); });
    return out; });
}
/* foto affiancate: figurina | corpo 3D (figura intera, gli altri corpi nascosti, luci della scena) */
export async function foto(p, nome, file) {
  const url = await p.evaluate(async (nome) => { const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    const fg = aspettoFigurina225(nome); const dati = datiFigurina23('giocatore', o.userData.chi240.ruolo === 'eroe' ? 'eroe' : nome, o.userData.chi240.ruolo === 'eroe' ? null : nome);
    const v = new T.Vector3(); let head = null, hips = null; o.traverse(b => { if (!b.isBone) return; if (/^head$/i.test(b.name)) head = b.getWorldPosition(new T.Vector3()); if (/^pelvis$|hips/i.test(b.name) && !hips) hips = b.getWorldPosition(new T.Vector3()); });
    const root = o.parent || o; const ry = root.rotation.y; const fw = new T.Vector3(Math.sin(ry), 0, Math.cos(ry)); const base = (hips || head).clone(); const sole = 0;
    const mie = new Set(); o.traverse(x => mie.add(x)); const altri = []; S.traverseVisible(x => { if (x.isSkinnedMesh && !mie.has(x)) altri.push(x); }); altri.forEach(x => x.visible = false);
    const gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const cam = new T.PerspectiveCamera(24, W / H, 0.05, 80);
    const mid = new T.Vector3(base.x, (head ? head.y : 1.6) * 0.55, base.z); cam.position.copy(mid).addScaledVector(fw, 5.2); cam.position.y = mid.y + 0.25; cam.lookAt(mid); cam.updateMatrixWorld(true);
    R.render(S, cam); const shot = R.domElement.toDataURL('image/png');
    let shot2 = null; if (head) { const c2 = new T.PerspectiveCamera(20, W / H, 0.03, 40); const hp = head.clone(); hp.y += 0.06; c2.position.copy(hp).addScaledVector(fw, 1.0); c2.lookAt(hp); c2.updateMatrixWorld(true); R.render(S, c2); shot2 = R.domElement.toDataURL('image/png'); }
    altri.forEach(x => x.visible = true);
    /* foglio: figurina (immagine del ritratto + dati) a sinistra, corpo 3D a destra */
    const ld = (u) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
    const a = fg ? await ld(fg.file) : null, b = await ld(shot), c = shot2 ? await ld(shot2) : null; const cv = document.createElement('canvas'); cv.width = 1400; cv.height = 560; const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, 1400, 560);
    if (a) g.drawImage(a, 20, 40, 440, 440); if (b) { const sc = Math.min(460 / b.width, 480 / b.height), w = b.width * sc, h = b.height * sc; g.drawImage(b, 480 + (460 - w) / 2, 40 + (480 - h) / 2, w, h); }
    if (c) { const s = Math.min(c.width, c.height); g.drawImage(c, (c.width - s) / 2, (c.height - s) / 2, s, s, 940, 40, 440, 440); }
    g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.fillText(nome + (dati && dati.cm ? ` — figurina ${dati.cm} cm, ${dati.kg} kg` : ''), 20, 28);
    g.font = '16px sans-serif'; g.fillText('figurina (ritratto ' + (fg ? fg.n : '—') + ')', 20, 510); g.fillText('corpo 3D in partita (ingresso, GLB acceso)', 480, 510); g.fillText('primo piano del viso 3D', 940, 510);
    return cv.toDataURL('image/png'); }, nome);
  if (url) fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  return !!url;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  const { ctx, p, err, ok } = await apriIngresso(b, port, ROSSO ? ['__CPM_NO_G412'] : []);
  if (!ok) { console.log('NON GIUDICATO: ingresso in campo mai raggiunto coi corpi pronti', err); process.exit(1); }
  const C = await leggiCorpi(p);
  C.forEach(c => { const m = c.fig ? perN.get(c.fig.n) : null; c.capelli = m ? m.capelli : null; c.barba = m ? m.barba : null; c.carnagione = m ? m.carnagione : null; c.viso = m ? m.viso : null; c.eta = m ? m.eta : null; c.cm3d = Math.round(c.alt3d * 100); c.scarto = c.cm != null ? c.cm3d - c.cm : null; });
  const J = process.env.CPM_JSON || `out/g412/misura-412-${ROSSO ? 'rosso' : 'verde'}.json`; fs.writeFileSync(J, JSON.stringify({ tod: TOD, rosso: ROSSO, corpi: C, err }, null, 1));
  console.log(`${ROSSO ? 'ROSSO' : 'VERDE'} · ora ${TOD} · corpi con nome ${C.length}`);
  console.log('nome | ruolo | figurina cm/kg | 3D cm (suola→cima) | scarto | corporatura | testa 3D | capelli figurina | barba | carnagione');
  C.forEach(c => console.log([c.nome, c.ruolo, `${c.cm}/${c.kg}`, c.cm3d, c.scarto, c.corp, c.testa, c.capelli, c.barba, c.carnagione].join(' | ')));
  if (FOTO) { const dir = path.resolve('../../docs/collaudo-po'); fs.mkdirSync(dir, { recursive: true }); const scelti = [C.find(c => c.ruolo === 'eroe'), ...C.filter(c => c.ruolo !== 'eroe')].filter(Boolean).filter((c, i, a) => a.indexOf(c) === i);
    const pick = [scelti[0]]; const resto = scelti.slice(1).sort((x, y) => (x.cm || 0) - (y.cm || 0)); const passo = Math.max(1, Math.floor(resto.length / (NFOTO - 1)));
    for (let i = 0; i < resto.length && pick.length < NFOTO; i += passo) pick.push(resto[i]);
    for (let i = 0; i < pick.length; i++) { const f = path.join(dir, `412-confronto-${ROSSO ? 'prima' : 'dopo'}-${i + 1}.png`); const r = await foto(p, pick[i].nome, f); console.log(`foto ${r ? f : 'NON SCRITTA'} (${pick[i].nome})`); } }
  if (err.length) console.log('errori di pagina', err);
  await ctx.close(); await b.close(); srv.close();
}
