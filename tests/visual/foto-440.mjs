#!/usr/bin/env node
/* [giro 440 · PO-686 bis] FOTO per il PO (non guardiano): PRIMA (= resa del 432, rosso window.__CPM_NO_G440) e DOPO, notte e giorno,
   all'ingresso in campo, formato del 432/414 (figurina | corpo in campo | primo piano del viso). Uscita out/g440/foto/{tod}-{prima|dopo}-*.png;
   tools/foto-440.py le monta in docs/collaudo-po/440-*.png. CPM_NOMI="a,b" per un sottoinsieme, CPM_TODS="night" per una sola ora.
   I tagli «lunghi raccolti» e «stempiati e corti» non ci sono fra i 22 del salvataggio di prova: sul banco li si da' a due corpi con
   window.__CPM_TAGLIO440 (solo ?cpmtest=1, dichiarato nelle foto: «taglio forzato dal banco»). */
import { startServer, launchBrowser } from './lib/harness.mjs';
import { foto414 } from './misura-414.mjs';
import { apriEPronti } from './misura-432.mjs';
import fs from 'node:fs';
export const NOMI440 = ['Samuelito Vairo', 'Sebastian Maxwell', 'Norman Bailey', 'Connor Quinn', 'Keith Thornton', 'Keith Carr', 'Declan Russell', 'Aaron Lane'];
export const FORZA440 = { 'Declan Russell': 'lunghi raccolti', 'Aaron Lane': 'lunghi raccolti' };
const NOMI = process.env.CPM_NOMI ? process.env.CPM_NOMI.split(',') : NOMI440;
const D = 'out/g440/foto'; fs.mkdirSync(D, { recursive: true });
/* testa vista di lato e di tre quarti da dietro (lo chignon non si vede di fronte) */
export async function fotoDietro(p, nome, file, titolo) {
  const url = await p.evaluate(async ([nome, titolo]) => { const T = THREE, D = window.__CPM3D, S = D.scene, R = D.renderer; let o = null; S.traverseVisible(x => { if (!o && x.userData && x.userData.chi240 && x.userData.chi240.nome === nome) o = x; }); if (!o) return null;
    S.updateMatrixWorld(true); let head = null; o.traverse(b => { if (b.isBone && /^head$/i.test(b.name) && !head) head = b.getWorldPosition(new T.Vector3()); }); if (!head) return null;
    const mie = new Set(); o.traverse(x => mie.add(x)); const altri = []; S.traverseVisible(x => { if ((x.isSkinnedMesh || (x.isMesh && x.material && !Array.isArray(x.material) && x.material.depthTest === false)) && !mie.has(x)) altri.push(x); }); altri.forEach(x => x.visible = false);
    const root = o.parent || o, ry = root.rotation.y, gl = R.getContext(), W = gl.drawingBufferWidth, H = gl.drawingBufferHeight; const shots = [];
    for (const a of [Math.PI / 2, Math.PI * 0.8]) { const fw = new T.Vector3(Math.sin(ry + a), 0, Math.cos(ry + a)); const c = new T.PerspectiveCamera(22, W / H, 0.5, 60); const hp = head.clone(); hp.y += 0.02; c.position.copy(hp).addScaledVector(fw, 1.1); c.position.y += 0.1; c.lookAt(hp); c.updateMatrixWorld(true); R.render(S, c); shots.push(R.domElement.toDataURL('image/png')); }
    altri.forEach(x => x.visible = true);
    const ld = (u) => new Promise(r => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = u; });
    const cv = document.createElement('canvas'); cv.width = 940; cv.height = 520; const g = cv.getContext('2d'); g.fillStyle = '#111'; g.fillRect(0, 0, 940, 520);
    for (let i = 0; i < 2; i++) { const c = await ld(shots[i]); const s = Math.min(c.width, c.height); g.drawImage(c, (c.width - s) / 2, (c.height - s) / 2, s, s, 20 + i * 460, 40, 440, 440); }
    g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.fillText(nome + ' · ' + titolo, 20, 28); g.font = '16px sans-serif'; g.fillText('di lato', 20, 505); g.fillText('tre quarti da dietro', 480, 505);
    return cv.toDataURL('image/png'); }, [nome, titolo || '']);
  if (url) fs.writeFileSync(file, Buffer.from(url.split(',')[1], 'base64'));
  return !!url;
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
  async function giro(tod, braccio, flags) {
    const { ctx, p, ok } = await apriEPronti(b, port, flags, tod, { width: 1000, height: 640 }, FORZA440);
    if (!ok) { console.log('ingresso non raggiunto', tod, braccio); await ctx.close(); return; }
    await p.screenshot({ path: `${D}/${tod}-${braccio}-ingresso.png` });
    for (const n of NOMI) if (FORZA440[n] || /Carr/.test(n)) await fotoDietro(p, n, `${D}/${tod}-${braccio}-${n.replace(/\W+/g, '_')}-dietro.png`, `${braccio} · ${tod === 'night' ? 'notte' : 'giorno'}`);
    for (const n of NOMI) await foto414(p, n, `${D}/${tod}-${braccio}-${n.replace(/\W+/g, '_')}.png`, `${braccio} · ${tod === 'night' ? 'notte' : 'giorno'}${FORZA440[n] ? ' · taglio «' + FORZA440[n] + '» forzato dal banco' : ''}`);
    await ctx.close();
  }
  for (const tod of (process.env.CPM_TODS || 'night,day').split(',')) await Promise.all([giro(tod, 'prima', ['__CPM_NO_G440']), giro(tod, 'dopo', [])]);
  await b.close(); srv.close(); console.log('foto in', D);
}
