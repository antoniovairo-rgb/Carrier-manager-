#!/usr/bin/env node
/* [giro 170b PO-367] FOTOGRAMMI CHIAVE dei gesti (prima · contatto · dopo) su telefono (412x915) e PC (1280x800), scala 2.
   Strumento, non guardiano. Rigioca la stessa scena/seme del banco (gesti-170b.mjs) a tempo virtuale e si ferma sui tre
   fotogrammi: 0,20 s prima della partenza del pallone, la partenza (rilevata IN DIRETTA: __CPM_CONT121), 0,20 s dopo.
   Ritaglia attorno all'eroe (o al pallone per le parate) e compone una tavola per gesto in docs/collaudo/giro170b/.
   Uso: CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers node gesti-170b-foto.mjs [filtro] */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, __dirname as LIBDIR } from './lib/harness.mjs';
import { pagina170, scena170 } from './lib/gesti-170b.mjs';

const DOC = path.join(LIBDIR, '..', '..', '..', 'docs', 'collaudo', 'giro170b'); fs.mkdirSync(DOC, { recursive: true });
const AN = JSON.parse(fs.readFileSync(path.join(LIBDIR, '..', 'out', 'giro170b', 'analisi.json'), 'utf8'));
/* gesto → [gi, k, esito, tipo, modo] ; modo: 'arco' (prima/contatto/dopo attorno alla partenza) · 'gesto' (inizio/meta'/fine del gesto) · 'dopo' (reazione dopo l'esito) · 'palla' (ritaglio sul pallone: parata) */
const SCENE = {
  'tiro-collo': [8, 0, 'success', null, 'arco'], 'tiro-piatto': [0, 0, 'success', null, 'arco'], 'tiro-volo': [6, 1, 'success', null, 'arco'], 'pallonetto': [0, 2, 'success', null, 'arco'],
  'testa': [7, 0, 'success', null, 'arco'], 'rigore': [5, 0, 'success', null, 'arco'], 'punizione': [13, 0, 'success', null, 'arco'],
  'pass-corto': [18, 0, 'success', null, 'arco'], 'pass-lungo': [29, 0, 'success', null, 'arco'], 'cross': [42, 0, 'success', null, 'arco'],
  'dribbling': [30, 0, 'success', null, 'gesto'], 'contrasto': [31, 0, 'success', null, 'gesto'],
  'parata': [8, 0, 'fail', 'saved', 'palla'], 'disappunto': [3, 1, 'fail', 'wide', 'dopo'], 'esultanza': [3, 1, 'success', null, 'dopo'],
};
const filtro = process.argv[2] || '';
const DEV = [['telefono', 412, 915, 300], ['pc', 1280, 800, 360]];
const srv = await startServer(); const b = await launchBrowser(); const tavole = {};
const stato = page => page.evaluate(() => { const G = window.__G170; const p = window.__CPM_PROBE && window.__CPM_PROBE(); const g = window.__CPM_GST; const cv = [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0]; const r = cv ? cv.getBoundingClientRect() : null;
  return { f: G.f, na: (window.__CPM_CONT121 || []).length, ph: window.__CPM_PHASE && window.__CPM_PHASE(), g: g ? [g.cur, g.w] : null, hero: p && p.hero ? p.hero.ndc : null, ball: p && p.ball ? p.ball.ndc : null, r: r ? [r.left, r.top, r.width, r.height] : null }; });
const finoA = async (page, cond, maxF = 600) => { let s = await stato(page); let n = 0; while (!cond(s) && n++ < maxF) { await page.clock.runFor(17); s = await stato(page); } return s; };
for (const [g, [gi, k, out, kind, modo]] of Object.entries(SCENE)) {
  if (filtro && !g.includes(filtro)) continue;
  const rif = AN.esecuzioni.find(e => e.g === g && e.gi === gi && e.k === k && e.seme === 1 && !e.errore);
  const dRif = rif && rif.contatto ? rif.contatto.fotogramma + 1 : null;/* numero di fotogramma (f parte da 1) della partenza nel banco */
  tavole[g] = { gi, k, out, kind, modo, label: rif && rif.label, scatti: [] };
  for (const [dev, vw, vh, lato] of DEV) {
    const page = await pagina170(b, srv.address().port, { vw, vh, scala: 2 });
    const scatta = async (nome, s, centro) => { const c = (centro === 'palla' ? s.ball : s.hero) || s.hero; if (!c || !s.r) return; const cx = s.r[0] + (c.x + 1) / 2 * s.r[2], cy = s.r[1] + (1 - (c.y + 1) / 2) * s.r[3] - lato * 0.12;
      const x = Math.max(0, Math.min(vw - lato, cx - lato / 2)), y = Math.max(0, Math.min(vh - lato, cy - lato / 2)); const buf = await page.screenshot({ clip: { x, y, width: lato, height: lato }, type: 'jpeg', quality: 86 });
      tavole[g].scatti.push({ dev, nome, f: s.f, na: s.na, gesto: s.g, b64: buf.toString('base64') }); };
    await scena170(page, { gi, k, out, kind, seme: 1, fermaA: async pg => {
      if (modo === 'arco' || modo === 'palla') {
        const pre = dRif ? dRif - 12 : 60; let s = await finoA(pg, s => s.f >= pre || s.na > 0); if (modo === 'arco') await scatta('prima (−0,20 s)', s, 'eroe');
        s = await finoA(pg, s => s.na > 0); tavole[g].partenza = tavole[g].partenza || {}; tavole[g].partenza[dev] = s.f;
        if (modo === 'arco') { await scatta('contatto (pallone parte)', s, 'eroe'); const f1 = s.f + 12; s = await finoA(pg, s => s.f >= f1); await scatta('dopo (+0,20 s)', s, 'eroe'); }
        else { const fk = rif && rif.portiere && rif.portiere.alFotogramma ? rif.portiere.alFotogramma : s.f + 30; s = await finoA(pg, s => s.f >= fk - 10); await scatta('tuffo: prima', s, 'palla'); s = await finoA(pg, s => s.f >= fk); await scatta('tuffo: mano-pallone', s, 'palla'); s = await finoA(pg, s => s.f >= fk + 14); await scatta('tuffo: dopo', s, 'palla'); }
      } else if (modo === 'gesto') {
        let s = await finoA(pg, s => s.g && s.g[0] && s.g[1] > 0.6); await scatta('gesto: inizio', s, 'eroe'); let f1 = s.f + 14; s = await finoA(pg, s => s.f >= f1); await scatta('gesto: +0,23 s', s, 'eroe'); f1 = s.f + 18; s = await finoA(pg, s => s.f >= f1); await scatta('gesto: +0,53 s', s, 'eroe');
      } else { let s = await finoA(pg, s => s.na > 0); for (const [dd, et] of [[70, '+1,2 s dall\'arco'], [130, '+2,2 s'], [200, '+3,3 s']]) { const f1 = (tavole[g]._f0 = tavole[g]._f0 || s.f) + dd; s = await finoA(pg, s => s.f >= f1); await scatta('reazione ' + et, s, 'eroe'); } delete tavole[g]._f0; }
    } });
    await page.context().close();
    console.log(`${g} ${dev}: ${tavole[g].scatti.filter(x => x.dev === dev).map(x => x.nome + '@f' + x.f + (x.gesto ? ' ' + x.gesto[0] : '')).join(' · ')}${dRif ? ' (banco: partenza f' + dRif + ', qui f' + ((tavole[g].partenza || {})[dev] || '—') + ')' : ''}`);
  }
}
/* tavole composte: una per gesto (riga telefono, riga PC) */
const ctx = await b.newContext({ viewport: { width: 1180, height: 900 }, deviceScaleFactor: 1 }); const pg = await ctx.newPage();
for (const [g, t] of Object.entries(tavole)) { if (!t.scatti.length) continue;
  const riga = dev => `<div class=r><div class=d>${dev === 'telefono' ? 'TELEFONO 412×915 · scala 2' : 'PC 1280×800 · scala 2'}</div>${t.scatti.filter(x => x.dev === dev).map(x => `<figure><img src="data:image/jpeg;base64,${x.b64}"><figcaption>${x.nome} · fotogramma ${x.f}${x.gesto && x.gesto[0] ? ' · clip «' + x.gesto[0] + '»' : ''}</figcaption></figure>`).join('')}</div>`;
  await pg.setContent(`<style>body{margin:0;background:#111;color:#eee;font:13px system-ui;padding:10px}h1{font-size:16px;margin:0 0 6px}.r{display:flex;gap:8px;align-items:flex-start;margin-bottom:8px}.d{writing-mode:vertical-rl;transform:rotate(180deg);font-size:11px;opacity:.75}figure{margin:0}img{width:360px;height:360px;display:block}figcaption{font-size:11px;padding:3px 0;max-width:360px}</style><h1>${g} — scena gi${t.gi} az.${t.k} (${t.out}${t.kind ? '/' + t.kind : ''}) ${t.label ? '· ' + String(t.label).replace(/</g, '') : ''}</h1>${riga('telefono')}${riga('pc')}`);
  const el = await pg.$('body'); await pg.screenshot({ path: path.join(DOC, `${g}.jpg`), type: 'jpeg', quality: 82, fullPage: true }); }
await b.close(); srv.close();
fs.mkdirSync(path.join(DOC, 'dati'), { recursive: true }); fs.writeFileSync(path.join(DOC, 'dati', 'fotogrammi.json'), JSON.stringify(Object.fromEntries(Object.entries(tavole).map(([g, t]) => [g, { ...t, scatti: t.scatti.map(({ b64, ...r }) => r) }])), null, 1));
console.log('FINE tavole in docs/collaudo/giro170b/');
