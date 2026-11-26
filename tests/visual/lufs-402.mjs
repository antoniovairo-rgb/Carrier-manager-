/* [giro 402 · PO-577] GUARDIANO DELLA SONORITA' DELLA PARTITA — `npm run lufs-402`.
   Gioca una partita VERA seedata (?cpmtest=1, pilota automatico seedato, clock vero) con l'AudioMgr acceso dal solo interruttore di
   collaudo window.__CPM_AUDIO402, cattura l'uscita PCM del master (ScriptProcessor in src/09) dal fischio d'inizio al fischio finale e
   calcola in node (lib/lufs-402.mjs, ITU-R BS.1770-4) LUFS integrati, breve termine e picco vero.
   OBIETTIVO (PO-577): telefoni −18 ±2 LUFS integrati → [−20, −16]; picco vero ≤ −1,0 dBTP (soglia dichiarata, EBU R128 / piattaforme).
   «Non giudicato» = ROSSO: contesto audio non in corsa, cattura che copre meno del 90% del tempo di partita, partita non finita,
   meno di 60 s catturati, letto della folla non caricato.
   Bracci: VERDE (gioco com'e') deve stare nell'obiettivo; ROSSO (window.__CPM_NO_G402 = guadagno di bus 1, comportamento di prima)
   deve stare FUORI. `CPM_BRACCIO=verde|rosso` ne gira uno solo (sonda); `CPM_WAV=1` salva il WAV per il riascolto e il controllo
   incrociato con ffmpeg ebur128. Uscita 0 solo se il verde passa e il rosso viene bocciato. */
import fs from 'node:fs';
import path from 'node:path';
import { launchBrowser, startServer, installCdnRoutes, openMatch, sleep, ROOT } from './lib/harness.mjs';
import { misura, scriviWav, verificaFfmpeg } from './lib/lufs-402.mjs';

const OUT = path.join(ROOT, 'tests', 'visual', 'out', 'lufs-402'); fs.mkdirSync(OUT, { recursive: true });
const OBI = { min: -20, max: -16, tp: -1.0 };
const SEME = +(process.env.CPM_SEME || 402), NOME = process.env.CPM_NOME || 'Lufs402';

async function braccio(rosso) {
  const s = await startServer(); const port = s.address().port; const b = await launchBrowser();
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 } }); const page = await ctx.newPage(); await installCdnRoutes(page);
  await page.addInitScript((r) => { window.__CPM_GLB = false; window.__CPM_AUDIO402 = true; if (r) window.__CPM_NO_G402 = true; }, rosso);
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  const parti = [], partiF = []; let fs_ = 0, stato = null, finita = false, trim = null, deb = null, t0 = 0, t1 = 0, score = null, s172 = null;
  const tira = async () => { const x = await page.evaluate(() => (window.__CPM_CAP402_PULL ? window.__CPM_CAP402_PULL() : null)).catch(() => null);
    if (x) { fs_ = x.sr; stato = x.state; trim = x.trim; if (x.frames) { const u = Buffer.from(x.b64, 'base64'); parti.push(new Float32Array(u.buffer, u.byteOffset, u.byteLength / 4).slice());
      if (process.env.CPM_WAV === '1') { const f = Buffer.from(x.b64f, 'base64'); partiF.push(new Float32Array(f.buffer, f.byteOffset, f.byteLength / 4).slice()); } } } return x; };
  try {
    await openMatch(page, port, { skipLoadAll: true, name: NOME });
    await page.mouse.click(206, 40).catch(() => {});
    /* i campioni (letto della folla, eventi) si caricano al primo gesto: si aspetta che siano decodificati prima del fischio */
    for (let k = 0; k < 40; k++) { s172 = await page.evaluate(() => (window.__CPM_AUDIO172 ? window.__CPM_AUDIO172() : null)).catch(() => null); if (s172 && s172.letto && s172.letto.real) break; await sleep(500); }
    deb = await page.evaluate(() => AudioMgr.debug()).catch(() => null);
    await tira(); parti.length = 0; partiF.length = 0;/* si scarta cio' che precede il pilota: la misura parte col pilota */
    t0 = Date.now();
    await page.evaluate((sm) => window.__CPM_AUTOPLAY(true, { seed: sm, policy: 'seeded', tickMs: 300 }), SEME);
    while (Date.now() - t0 < 540000) {
      await sleep(2000); await tira();
      finita = await page.evaluate(() => window.__CPM_PHASE && window.__CPM_PHASE() === 'ended').catch(() => false);
      if (finita) break;
    }
    t1 = Date.now(); await tira();
    score = await page.evaluate(() => { const x = window.__CPM_SCORE && window.__CPM_SCORE(); return x ? { h: x.home | 0, a: x.away | 0 } : null; }).catch(() => null);
  } catch (e) { errs.push('braccio: ' + String(e.message).slice(0, 140)); }
  await b.close(); s.close();
  let tot = 0; parti.forEach(p => tot += p.length); const all = new Float32Array(tot); let o = 0; parti.forEach(p => { all.set(p, o); o += p.length; });
  const parete = (t1 - t0) / 1000, catt = fs_ ? (tot / 2) / fs_ : 0;
  const nome = rosso ? 'rosso' : 'verde';
  const m = fs_ && tot ? misura(all, fs_) : null;
  let ff = null; if (process.env.CPM_WAV === '1' && m) { const f = path.join(OUT, `partita-${nome}.wav`); scriviWav(f, all, fs_); ff = verificaFfmpeg(f);
    const allF = new Float32Array(tot); let q = 0; partiF.forEach(p => { allF.set(p, q); q += p.length; }); scriviWav(path.join(OUT, `partita-${nome}-folla.wav`), allF, fs_); }
  const ng = [];
  if (!deb || deb.silent || deb.ctx !== 'running') ng.push(`contesto audio non in corsa (${deb ? deb.ctx + (deb.silent ? ', muto' : '') : 'nessuno'})`);
  if (stato && stato !== 'running') ng.push(`contesto a fine partita: ${stato}`);
  if (!finita) ng.push('partita non finita');
  if (catt < 60) ng.push(`catturati solo ${catt.toFixed(1)} s`);
  if (parete > 0 && catt / parete < 0.9) ng.push(`cattura ${catt.toFixed(1)} s su ${parete.toFixed(1)} s di partita (${(100 * catt / parete).toFixed(0)}%)`);
  if (!s172 || !s172.letto || !s172.letto.real) ng.push('letto della folla non caricato');
  if (errs.length) ng.push('errori di pagina: ' + errs.slice(0, 2).join(' | '));
  const dentro = m && m.lufs_i != null && m.lufs_i >= OBI.min && m.lufs_i <= OBI.max && m.picco_vero_dbtp != null && m.picco_vero_dbtp <= OBI.tp;
  const r = { braccio: nome, trim, seme: SEME, nome: NOME, parete_s: +parete.toFixed(1), catturati_s: +catt.toFixed(1), score, misura: m, ffmpeg: ff, non_giudicato: ng, dentro_obiettivo: !!dentro };
  fs.writeFileSync(path.join(OUT, `esito-${nome}.json`), JSON.stringify(r, null, 2));
  console.log(`[${nome}] guadagni ${JSON.stringify(trim)} · ${r.catturati_s}/${r.parete_s} s · ${score ? score.h + '-' + score.a : '?'} · I ${m && m.lufs_i} LUFS · breve termine max ${m && m.st_max} / mediana ${m && m.st_mediana} · picco vero ${m && m.picco_vero_dbtp} dBTP · campione ${m && m.picco_dbfs} dBFS${ff ? ` · ffmpeg I ${ff.lufs_i} TP ${ff.picco_vero_dbtp}` : ''}${ng.length ? ' · NON GIUDICATO: ' + ng.join('; ') : ''}`);
  return r;
}

const solo = process.env.CPM_BRACCIO;
/* i due bracci girano INSIEME (due browser): ciascuno e' una partita in tempo reale di ~5 minuti; la copertura della cattura (>= 90%
   del tempo di partita) resta giudicata per braccio, quindi un banco troppo carico esce «non giudicato», non verde */
const [V, R] = await Promise.all([solo === 'rosso' ? null : braccio(false), solo === 'verde' ? null : braccio(true)]);
let ok = true; const motivi = [];
if (V) { if (V.non_giudicato.length) { ok = false; motivi.push('verde non giudicato'); } else if (!V.dentro_obiettivo) { ok = false; motivi.push(`verde fuori obiettivo (I ${V.misura.lufs_i}, TP ${V.misura.picco_vero_dbtp})`); } }
if (R) { if (R.non_giudicato.length) { ok = false; motivi.push('rosso non giudicato'); } else if (R.dentro_obiettivo) { ok = false; motivi.push('il rosso (__CPM_NO_G402) passa: il guardiano non vede la correzione'); } }
console.log(ok ? `✅ lufs-402 VERDE — obiettivo [${OBI.min}, ${OBI.max}] LUFS, picco vero ≤ ${OBI.tp} dBTP${R ? '; rosso bocciato come atteso' : ''}` : `❌ lufs-402 ROSSO — ${motivi.join(' · ')}`);
process.exit(ok ? 0 : 1);
