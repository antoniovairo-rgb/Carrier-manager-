#!/usr/bin/env node
/* [7.999.46 sonda — i codici del taccuino in PARTITA NATURALE (le scene forzate saltano l'apertura, dove nascono i 001)]
   Pilota automatico su CPM_NOMI partite (deterministiche per nome). A ogni uscita da una scena (hl_result → altro) chiama il
   rilevatore del gioco (__CPM_DRAFTNOTE, lo stesso che scrive le righe che il PO incolla) sulla scena appena chiusa e conta i codici.
   CPM_GLB=1 corpi accesi (lento) · CPM_MS per partita · CPM_INIT bracci. Sola lettura. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const NOMI = (process.env.CPM_NOMI || 'Nat1,Nat2,Nat3').split(','), MS = +(process.env.CPM_MS || 150000), GLB = process.env.CPM_GLB === '1';
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser();
const conta = {}; const righe = []; let scene = 0;
for (const nome of NOMI) {
  const page = await b.newPage({ viewport: { width: 412, height: 915 } }); await installCdnRoutes(page);
  await page.addInitScript(o => { window.__CPM_GLB = o.glb; window.__CPM_REC = true; window.__CPM_CINE = 1; window.__CPM_PRESENT = 1; try { localStorage.setItem('cpm-match-speed', '2'); } catch (e) {} }, { glb: GLB });
  if (process.env.CPM_INIT) await page.addInitScript(new Function(process.env.CPM_INIT));
  await openMatch(page, port, { skipLoadAll: true, name: nome });
  if (GLB) await page.waitForFunction(() => (window.__CPM_MXCLIP | 0) > 0, null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => window.__CPM_AUTOPLAY(true, { seed: 4545, policy: 'seeded', tickMs: 300 }));
  const t0 = Date.now(); let prev = null, gi = null;
  while (Date.now() - t0 < MS) {
    const r = await page.evaluate(() => { try { const q = window.__CPM_CURSIT && window.__CPM_CURSIT(); return { ph: window.__CPM_PHASE(), gi: q ? q.gi : null, t: q ? q.t : '', clock: window.__CPM_STATE().clock }; } catch (e) { return null; } }).catch(() => null);
    if (!r) { await sleep(150); continue; }
    if (/^hl_/.test(r.ph || '')) gi = { gi: r.gi, t: r.t, min: r.clock };
    if (prev === 'hl_result' && r.ph !== 'hl_result' && gi) {
      const out = await page.evaluate(() => { const snap = window.__CPM_WATCH_SNAP && window.__CPM_WATCH_SNAP(); if (!snap || !snap.samples || !snap.samples.length) return { err: 'nessun campione' };
        const ks = snap.samples.map(s => s.sk).filter(k => k != null && k >= 0); if (!ks.length) return { err: 'nessuna chiave' }; const k = Math.max(...ks);
        let ctx = null; try { ctx = window.__CPM_BUGCTX && window.__CPM_BUGCTX(); } catch (e) {} ctx = ctx ? { ...ctx, sceneKey: k } : { sceneKey: k };
        let txt = ''; try { txt = window.__CPM_DRAFTNOTE(snap, ctx) || ''; } catch (e) { txt = 'ERR ' + e.message; } return { txt, out: ctx.out || null, intent: ctx.intent || null }; }).catch(e => ({ err: String(e) }));
      scene++; const cod = ((out.txt || '').match(/codice \d{3}|SALTO/g) || []);
      cod.forEach(c => { conta[c] = (conta[c] || 0) + 1; });
      const lin = String(out.txt || '').split('\n').filter(l => /codice |SALTO/.test(l)).map(l => l.trim().slice(0, 220));
      righe.push({ nome, ...gi, out: out.out, cod, lin });
      console.log(`${nome} ${gi.min}' gi${gi.gi} «${(gi.t || '').slice(0, 40)}» esito ${out.out || out.err || '?'} → ${cod.length ? cod.join(', ') : '—'}`); lin.forEach(l => console.log('      ' + l));
      gi = null;
    }
    if (r.ph === 'ended') break;
    prev = r.ph; await sleep(150);
  }
  await page.close();
}
await b.close(); srv.close();
console.log(`\nscene ${scene} · codici ${JSON.stringify(conta)}`);
