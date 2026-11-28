#!/usr/bin/env node
/* [giro 445] FOTO per il PO (non guardiano): testa di STEMPIATI e LUNGHI RACCOLTI vista davanti, di lato, tre quarti da dietro e da dietro,
   PRIMA (= resa del 440, rosso window.__CPM_NO_G445) e DOPO, notte e giorno, all'ingresso in campo, GLB acceso. Per ogni giocatore anche
   la figurina e il primo piano frontale (foto414). Uscita out/g445/foto/{tod}-{prima|dopo}-*.png; tools/foto-445.py le monta in
   docs/collaudo-po/445-*.png. I «lunghi raccolti» del manifest non sono fra i 22 del salvataggio di prova: Declan Russell e Aaron Lane li
   ricevono dal banco (window.__CPM_TAGLIO440, solo ?cpmtest=1), come nel 440; lo stesso per lo stempiato Rupert Hammond. Keith Carr e
   Noah Marshall sono stempiati veri del salvataggio. CPM_NOMI="a,b" · CPM_TODS="night" · CPM_BRACCI="dopo". */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { foto414 } from './misura-414.mjs';
import { apriEPronti } from './misura-432.mjs';
import { FORZA445G, FIG445G, conFig } from './capelli-445.mjs';
import fs from 'node:fs';
export const FORZA445 = FORZA445G;
export const NOMI445 = ['Keith Carr', 'Noah Marshall', 'Jackson Burke', 'Declan Russell', 'Gary Howard'];
const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : NOMI445;
const D = 'out/g445/foto'; fs.mkdirSync(D, { recursive: true });
export const VISTE445 = [['davanti', 0], ['di lato', Math.PI / 2], ['tre quarti da dietro', Math.PI * 0.78], ['da dietro', Math.PI]];
/* quattro viste della testa: la camera gira attorno alla testa, rispetto al verso del corpo */
export async function fotoViste(p, nome, file, titolo) {
  const url = await p.evaluate(async ([nome, titolo, V]) => { const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true); let head = null, hb = null; o.traverse(b => { if (b.isBone && /^head$/i.test(b.name) && !head) { hb = b; head = b.getWorldPosition(new T.Vector3()); } }); if (!head) return null;
    const mie = new Set(); o.traverse(x => mie.add(x)); const altri = []; S.traverseVisible(x => { if ((x.isSkinnedMesh || (x.isMesh && x.material && !Array.isArray(x.material) && x.material.depthTest === false)) && !mie.has(x)) altri.push(x); }); altri.forEach(x => x.visible = false);
    const root = o.parent || o, ry = root.rotation.y, gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const shots = [];
    for (const [, a] of V) { const fw = new T.Vector3(Math.sin(ry + a), 0, Math.cos(ry + a)); const c = new T.PerspectiveCamera(20, W / H, 0.3, 60); const hp = head.clone(); hp.y += 0.07; c.position.copy(hp).addScaledVector(fw, 1.25); c.position.y += 0.1; c.lookAt(hp); c.updateMatrixWorld(true); R.render(S, c); shots.push(R.domElement.toDataURL('image/png')); }
    altri.forEach(x => x.visible = true);
    const ld = (u) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
    let fu = null; try { const fz = window.__CPM_FIG445 && window.__CPM_FIG445[nome]; if (fz && VOLTI23.idx) { const r = VOLTI23.idx.g.find(x => x.n === fz); if (r) fu = VOLTI23.idx.base + r.f; } else { const fg = aspettoFigurina225(nome); fu = fg && fg.file; } } catch (e) {}
    const fim = fu ? await ld(fu) : null;
    const cv = document.createElement('canvas'); cv.width = 20 + (V.length + 1) * 340; cv.height = 410; const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < V.length; i++) { const c = await ld(shots[i]); const s = Math.min(c.width, c.height) * 0.72; g.drawImage(c, (c.width - s) / 2, (c.height - s) / 2, s, s, 360 + i * 340, 40, 320, 320); g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText(V[i][0], 360 + i * 340, 390); }
    if (fim) { g.drawImage(fim, 20, 40, 320, 320); g.fillStyle = '#fff'; g.font = '16px sans-serif'; g.fillText('figurina' + (window.__CPM_FIG445 && window.__CPM_FIG445[nome] ? ' ' + window.__CPM_FIG445[nome] + ' (manifest)' : ''), 20, 390); }
    g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.fillText(nome + ' · ' + titolo, 20, 28);
    return cv.toDataURL('image/png'); }, [nome, titolo || '', VISTE445]);
  if (url) fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  return !!url;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  async function giro(tod, braccio, flags) {
    const { ctx, p, ok } = await apriEPronti(conFig(b, FIG445G), port, flags, tod, { width: 1000, height: 640 }, FORZA445);
    if (!ok) { console.log('ingresso non raggiunto', tod, braccio); await ctx.close(); return; }
    const it = tod === 'night' ? 'notte' : 'giorno';
    for (const n of NOMI) { const f = FORZA445[n] ? ' · taglio «' + FORZA445[n] + '» forzato dal banco' : FIG445G[n] ? ' · taglio e colore dei capelli della figurina ' + FIG445G[n] + ' (manifest) forzati dal banco' : ''; const s = n.replace(/\W+/g, '_');
      await fotoViste(p, n, `${D}/${tod}-${braccio}-${s}-viste.png`, `${braccio} · ${it}${f}`);
      if (!process.env.CPM_SOLO_VISTE && !FIG445G[n]) await foto414(p, n, `${D}/${tod}-${braccio}-${s}.png`, `${braccio} · ${it}${f}`); }
    await ctx.close();
  }
  const bracci = (process.env.CPM_BRACCI || 'prima,dopo').split(',');
  for (const tod of (process.env.CPM_TODS || 'night,day').split(',')) await Promise.all(bracci.map(x => giro(tod, x, x === 'prima' ? ['__CPM_NO_G445'] : [])));
  await b.close(); srv.close(); console.log('foto in', D);
}
