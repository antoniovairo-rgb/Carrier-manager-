#!/usr/bin/env node
/* Collaudo esterno 7.999.61: una pagina fresca per ogni combinazione,
   un lotto alla volta. Non cambia il gioco né i guardiani esistenti.
   Da radice: $env:CPM_BATCH='1'; node tests/codex/collaudo-highlight.mjs
   CPM_MODE=natural esegue le sei partite vere. Il JSON è il checkpoint. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { startServer, launchBrowser, installCdnRoutes, openMatch, matchPhase, sleep } from '../visual/lib/harness.mjs';
const visualRequire = createRequire(new URL('../visual/package.json', import.meta.url));
const { PNG } = visualRequire('pngjs');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.join(root, 'reports/codex/collaudo-highlight');
const checkpoint = path.join(root, 'tests/codex/collaudo-highlight.json');
const mode = process.env.CPM_MODE || 'forced';
const batch = Math.max(1, Number(process.env.CPM_BATCH || 1));
const minFree = 1.5 * 1024 ** 3;
const versionLine = fs.readFileSync(path.join(root, 'src/07-versione-save-interviste.jsx'), 'utf8').match(/const GAME_VERSION="([^"]+)"/);
if (versionLine?.[1] !== '7.999.61') throw new Error(`Versione non prevista: ${versionLine?.[1] || 'assente'}`);
fs.mkdirSync(out, { recursive: true });
const data = fs.existsSync(checkpoint) ? JSON.parse(fs.readFileSync(checkpoint, 'utf8')) : {
  versione: versionLine[1], compito: 'collaudo highlight 3D',
  comando: 'node tests/codex/collaudo-highlight.mjs',
  ambientePrevisto: { viewport: [412,915], glb: true, present: true, cine: true, serviceWorkers: 'block', gpu: 'software headless' },
  combos: null, forced: [], natural: [], errors: []
};
if (data.versione !== versionLine[1]) throw new Error(`Checkpoint di versione ${data.versione}, codice ${versionLine[1]}`);
if (data.ambiente && !data.ambientePrevisto) { data.ambientePrevisto = data.ambiente; delete data.ambiente; }
const save = () => {
  const tmp = `${checkpoint}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, checkpoint);
};
save();
if (os.freemem() < minFree) {
  console.error(`RAM libera ${(os.freemem()/1024**3).toFixed(2)} GB < 1,50 GB: checkpoint salvato; nessun browser avviato.`);
  process.exit(75);
}
const runKey = r => `${r.gi}:${r.ai}:${r.outcome}`;
const srv = await startServer();
const port = srv.address().port;
let browser;
try {
  browser = await launchBrowser();
  const newPage = async name => {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const page = await ctx.newPage();
    // La scelta a tempo continua a scorrere durante gli screenshot: il clock
    // installato prima della navigazione consente di fermarlo solo per le foto.
    if (mode === 'forced') await page.clock.install();
    await installCdnRoutes(page);
    await page.addInitScript(() => {
      window.__CPM_GLB = true;
      window.__CPM_PRESENT = 1;
      window.__CPM_CINE = 1;
      window.__CPM_REC = true;
    });
    const pageErrors = [];
    page.on('pageerror', e => pageErrors.push(String(e.message)));
    await openMatch(page, port, { skipLoadAll: true, name });
    if (mode === 'forced') await page.evaluate(() => window.__CPM_AUTOPLAY?.(false));
    return { ctx, page, pageErrors };
  };
  if (!data.combos) {
    const { ctx, page } = await newPage('HighlightIndice');
    data.combos = await page.evaluate(() => (window.__CPM_SITS || []).flatMap((s, gi) =>
      (s.actions || []).map((a, ai) => ({ gi, ai, text: String(s.text || ''), label: String(a.label || ''),
        intent: (typeof window.deriveHL === 'function' ? window.deriveHL(s, a)?.type : null) || s.it || null,
        def: !!(s.def || s.type === 'def') }))));
    data.situations = await page.evaluate(() => (window.__CPM_SITS || []).length);
    await ctx.close();
    save();
    console.log(`Indice: ${data.situations} situazioni, ${data.combos.length} azioni, ${data.combos.length * 2} esiti.`);
  }
  const masked = file => {
    const p = PNG.sync.read(fs.readFileSync(file));
    let dark = 0, samples = 0;
    for (let y=130; y<Math.min(p.height,620); y+=14) for (let x=12; x<p.width-12; x+=14) {
      const i=(y*p.width+x)*4; samples++;
      if (p.data[i]<18 && p.data[i+1]<18 && p.data[i+2]<18) dark++;
    }
    return samples > 0 && dark/samples > 0.95;
  };
  const capture = async (page, base, label, frames, probe = null, maxRecaptures = 8) => {
    const file = path.join(out, `${base}-${label}.png`);
    let retry = 0, black = true;
    while (retry <= maxRecaptures) {
      await page.screenshot({ path: file, animations: 'disabled' });
      black = masked(file);
      if (!black) break;
      retry++; if (retry <= maxRecaptures) await sleep(280);
    }
    frames.push({ label, png: path.relative(root, file).replaceAll('\\','/'),
      phase: await matchPhase(page), probe, masked: black, recaptures: retry });
  };
  const draft = async (page, combo) => page.evaluate(c => {
    const snap = window.__CPM_WATCH_SNAP?.();
    const last = snap?.samples?.filter(q => q.sk >= 0).at(-1);
    const outcome = window.__CPM_OUTCOME || null;
    const context = { sceneKey: last?.sk, intent: c.intent, act: c.label,
      def: c.def, out: outcome?.outKey || outcome?.outKind || null, ok: outcome?.ok };
    const draftNote = window.__CPM_DRAFTNOTE || window.draftBugNote;
    return { sceneKey: last?.sk ?? null, sampleCount: snap?.samples?.length || 0,
      context, text: typeof draftNote === 'function' ? draftNote(snap, context) : null,
      contact: (window.__CPM_CONT53 || []).at(-1) || null,
      outcome: outcome ? { outKey: outcome.outKey || null, ok: !!outcome.ok } : null };
  }, combo);
  const forceOne = async (combo, outcome) => {
    const base = `gi${String(combo.gi).padStart(3,'0')}-a${combo.ai}-${outcome}`;
    const frames = [];
    const { ctx, page, pageErrors } = await newPage(`Highlight${base}`);
    try {
      const forced = await page.evaluate(gi => window.__CPM_FORCE_SIT(gi, false), combo.gi);
      if (!forced) throw new Error(`__CPM_FORCE_SIT(${combo.gi},false) ha restituito false`);
      await page.waitForFunction(() => ['hl_move','hl_choose'].includes(window.__CPM_PHASE?.()), null, { timeout: 12000 });
      await sleep(450); // un primo disegno prima del fermo immagine
      await page.clock.pauseAt((await page.evaluate(() => Date.now())) + 1000);
      await capture(page, base, '01-apertura', frames, null, 0);
      if (await matchPhase(page) === 'hl_move') {
        const choose = page.locator('[data-cpm="scegli"]');
        if (await choose.count()) await page.evaluate(() => document.querySelector('[data-cpm="scegli"]')?.click());
        else await page.getByRole('button', { name: /Scegli/i }).first().evaluate(el => el.click());
      }
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_choose', null, { timeout: 30000 })
        .catch(async e => { const st=await page.evaluate(() => ({ phase: window.__CPM_PHASE?.(), auto: window.__CPM_AUTOPLAY_ON }));
          throw new Error(`hl_choose non raggiunta: ${JSON.stringify(st)}; ${e.message}`); });
      if (frames[0].masked) { frames.shift(); await capture(page, base, '01-apertura', frames, { recoveredAfterChoose: true }); }
      await capture(page, base, '02-scelta', frames);
      const beforeResolve = await matchPhase(page);
      if (beforeResolve !== 'hl_choose') throw new Error(`Scelta già risolta prima dell'azione: fase ${beforeResolve}; caso invalido`);
      await page.clock.resume();
      const n0 = await page.evaluate(() => (window.__CPM_CONT53 || []).length);
      const resolved = await page.evaluate(([ai, oo]) => { window.__CPM_FORCE_OUTCOME = oo; return window.__CPM_RESOLVE(ai); }, [combo.ai, outcome]);
      if (!resolved) throw new Error(`__CPM_RESOLVE(${combo.ai}) ha restituito false`);
      await page.waitForFunction(() => window.__CPM_PHASE?.() === 'hl_result', null, { timeout: 12000 });
      await sleep(300);
      await capture(page, base, '03-rincorsa', frames);
      const contactSeen = await page.waitForFunction(n => (window.__CPM_CONT53 || []).length > n, n0, { timeout: 4000 }).then(() => true).catch(() => false);
      await capture(page, base, '04-contatto', frames, { contactSeen });
      const flightSeen = await page.waitForFunction(() => !!window.__CPM_ARC?.arc, { timeout: 3500 }).then(() => true).catch(() => false);
      await capture(page, base, '05-volo', frames, { flightSeen });
      const continueButton = page.getByRole('button', { name: /^Continua$/i }).first();
      const resultReady = await continueButton.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
      await capture(page, base, '06-esito', frames, { resultReady });
      const auto = await draft(page, combo);
      if (auto.outcome?.ok !== (outcome === 'success')) throw new Error(`Esito inatteso ${JSON.stringify(auto.outcome)} per ${outcome}; caso invalido`);
      if (resultReady) {
        /* __CPM_FORCED_MODE mantiene apposta la scena statica: il pulsante
           Continua non cambia fase finché resta acceso (src/15 handleContinue).
           Lo si disarma solo dopo aver fotografato e letto l'esito. */
        await page.evaluate(() => { window.__CPM_FORCED_MODE = false; });
        await sleep(850);
        await continueButton.click({ timeout: 8000, noWaitAfter: true });
      }
      const exitSeen = resultReady && await page.waitForFunction(() => window.__CPM_PHASE?.() !== 'hl_result', null, { timeout: 30000 }).then(() => true).catch(() => false);
      return { ...combo, outcome, frames, auto, pageErrors, resultReady, exitSeen,
        note: null, codes: [], review: 'da esaminare visivamente',
        observedAt: new Date().toISOString() };
    } finally { await ctx.close(); }
  };
  if (mode === 'forced') {
    const retryKey = process.env.CPM_RETRY_KEY || null;
    if (retryKey) { data.forced = data.forced.filter(x => runKey(x) !== retryKey); save(); }
    const done = new Set(data.forced.map(runKey));
    const pending = data.combos.flatMap(c => ['success','fail'].map(outcome => ({ ...c, outcome })))
      .filter(c => !done.has(runKey(c)) && (!retryKey || runKey(c) === retryKey));
    for (const c of pending.slice(0, batch)) {
      if (os.freemem() < minFree) {
        console.log(`RAM libera ${(os.freemem()/1024**3).toFixed(2)} GB < 1,50 GB: lotto fermato al checkpoint.`);
        break;
      }
      try { data.forced.push(await forceOne(c, c.outcome)); }
      catch (e) { data.errors.push({ key: runKey(c), error: String(e.stack || e), at: new Date().toISOString() }); }
      save();
      console.log(`${data.forced.length}/${data.combos.length * 2} scene acquisite · ultimo ${runKey(c)}`);
    }
  } else if (mode === 'natural') {
    const seeds = [5100,5197,5294,5391,5488,5585];
    const done = new Set(data.natural.map(x => x.match));
    let processed = 0;
    for (let i=0; i<seeds.length && data.natural.length<6 && processed<batch; i++) {
      if (os.freemem() < minFree) {
        console.log(`RAM libera ${(os.freemem()/1024**3).toFixed(2)} GB < 1,50 GB: lotto naturale fermato al checkpoint.`);
        break;
      }
      if (done.has(i)) continue;
      processed++;
      const { ctx, page, pageErrors } = await newPage(`HighlightNaturale${i}-${seeds[i]}`);
      const match = { match: i, seed: seeds[i], name: `HighlightNaturale${i}-${seeds[i]}`, highlights: [], pageErrors };
      try {
        await page.evaluate(seed => window.__CPM_AUTOPLAY(true, { seed, policy:'seeded', tickMs:300 }), seeds[i]);
        let lastKey = null, active = null;
        const start = Date.now();
        while (Date.now()-start < 300000) {
          await sleep(150);
          const ph = await matchPhase(page);
          if (ph === 'ended' || ph === 'ceremony') break;
          const current = await page.evaluate(() => window.__CPM_CURSIT?.() || null);
          const key = current ? `${current.gi}:${current.i}` : null;
          if (ph?.startsWith('hl_') && key && key !== lastKey) {
            active = { key, gi: current.gi, intent: current.intent, text: current.t, frames: [], codes: [], note: null, review: 'da esaminare visivamente' };
            match.highlights.push(active); lastKey = key;
            await capture(page, `naturale-${i}-h${match.highlights.length}`, '01-apertura', active.frames);
          }
          if (active && ph === 'hl_choose' && !active.frames.some(f=>f.label==='02-scelta'))
            await capture(page, `naturale-${i}-h${match.highlights.length}`, '02-scelta', active.frames);
          if (active && ph === 'hl_result' && !active.frames.some(f=>f.label==='03-rincorsa')) {
            await capture(page, `naturale-${i}-h${match.highlights.length}`, '03-rincorsa', active.frames);
            await sleep(400); await capture(page, `naturale-${i}-h${match.highlights.length}`, '04-contatto', active.frames);
            await sleep(400); await capture(page, `naturale-${i}-h${match.highlights.length}`, '05-volo', active.frames);
          }
          if (active && !ph?.startsWith('hl_') && active.frames.length) {
            await capture(page, `naturale-${i}-h${match.highlights.length}`, '06-esito', active.frames);
            active.auto = await draft(page, { intent: active.intent, label: null, def: false });
            active = null;
          }
        }
      } catch (e) { match.error = String(e.stack || e); }
      finally { await ctx.close(); }
      data.natural.push(match); save();
      console.log(`Partita naturale ${i + 1}/6: ${match.highlights.length} highlight acquisiti`);
    }
  } else throw new Error(`CPM_MODE sconosciuto: ${mode}`);
} finally {
  if (browser) {
    let closed = false;
    await Promise.race([browser.close().then(() => { closed = true; }), sleep(8000)]);
    if (!closed) browser.process?.()?.kill();
  }
  srv.closeAllConnections?.();
  srv.close();
}
process.exit(0);
