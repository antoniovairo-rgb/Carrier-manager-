#!/usr/bin/env node
/* [giro 140 · PO-338] SOLA VERIFICA di alcuni bassi carriera sul flusso vero (telefono 412x915). Non tocca src/.
   D10 fase d'eta' in home contro ruolo nel profilo · D14 «Prossimo gradino — Leader» · B12 bottone di fine stagione sotto la piega ·
   D16 slot dopo il ritiro · B5 compagni nel salvataggio dopo un trasferimento. Foto in docs/collaudo-grafico/140/foto/. */
import fs from 'node:fs'; import path from 'node:path';
import { startServer, launchBrowser, apriPagina, entraInCarriera, sleep, SAVE, ferma } from './c178-graf-lib.mjs';
const ROOT = new URL('../../', import.meta.url).pathname; const FOTO = path.join(ROOT, 'docs/collaudo-grafico/140/foto');
const TEL = { k: 'tel', w: 412, h: 915, touch: true };
const srv = await startServer(); const port = srv.address().port; const b = await launchBrowser(); const errs = []; const R = {};
const shot = async (page, nome) => { const p = path.join(FOTO, nome + '.jpg'); await page.screenshot({ path: p, type: 'jpeg', quality: 70 }); return path.relative(ROOT, p); };
const testo = (page) => page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' '));
const quale = (process.env.C140_PARTI || 'd10,d14,b12,d16,b5').split(',');
const apri = async () => { const { ctx, page } = await apriPagina(b, port, TEL, { save: SAVE }, '?cpmtest=1', errs); const ok = await entraInCarriera(page, errs); return { ctx, page, ok }; };
const salvato = (page) => page.evaluate(async () => { try { const s = await storage.listSlots(); return s; } catch (e) { return 'err:' + e.message; } });
const grezzo = (page) => page.evaluate(() => { try { const r = localStorage.getItem('cpm-v3'); try { return JSON.parse(r); } catch (e) { return { nonJSON: (r || '').slice(0, 40) }; } } catch (e) { return null; } });

if (quale.includes('d10')) { const { ctx, page, ok } = await apri(); R.d10 = {};
  if (ok) { await page.evaluate(() => window.__CPM_CAREER.patch({ age: 24, coachTrust: 45, ruoloPromesso94: null, squadRole: 'riserva' })); await sleep(700);
    await page.evaluate(() => window.__CPM_CAREER.goTab('dashboard')); await sleep(700); await ferma(page);
    const t = await testo(page); const m = /(Giovane promessa|Titolare affermato|Nel pieno della carriera|Veterano|Fine carriera)/.exec(t); R.d10.home = m ? m[1] : null; R.d10.fotoHome = await shot(page, 'd10-tel-home-fase');
    await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(800); await ferma(page);
    const t2 = await testo(page); const r = /(Primavera|Riserva|In rotazione|Rotazione|Titolare|Leader)\b/.exec(t2.slice(t2.indexOf('Prossimo gradino') - 400 > 0 ? t2.indexOf('Prossimo gradino') - 400 : 0)); R.d10.profiloRuolo = r ? r[1] : null;
    const g = /Prossimo gradino[^.]{0,200}/.exec(t2); R.d10.gradino = g ? g[0] : null; R.d10.fotoProfilo = await shot(page, 'd10-tel-profilo-ruolo');
    R.d10.snap = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { age: s.age, coachTrust: s.coachTrust, squadRole: s.squadRole, ovr: s.ovr }; }); }
  console.log('D10', JSON.stringify(R.d10)); await ctx.close(); }

if (quale.includes('d14')) { const { ctx, page, ok } = await apri(); R.d14 = {};
  if (ok) { await page.evaluate(() => window.__CPM_CAREER.patch({ age: 33, totalMatches: 602, coachTrust: 100, isCaptain: false, popularity: 40 })); await sleep(700);
    await page.evaluate(() => window.__CPM_CAREER.goTab('profile')); await sleep(800); await ferma(page);
    const t = await testo(page); const g = /Prossimo gradino[^)]*\)[^)]*\)[^)]*\)\)?/.exec(t); R.d14.gradino = g ? g[0] : null;
    R.d14.snap = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { age: s.age, totalMatches: s.totalMatches, coachTrust: s.coachTrust, popularity: s.popularity, ovr: s.ovr, clubP: s.club && (s.club.prestige || s.club.p), isCaptain: s.isCaptain, squadRole: s.squadRole }; });
    try { const el = page.getByText('Prossimo gradino', { exact: false }).first(); await el.scrollIntoViewIfNeeded({ timeout: 3000 }); await sleep(300); } catch (e) {}
    R.d14.foto = await shot(page, 'd14-tel-profilo-gradino'); }
  console.log('D14', JSON.stringify(R.d14)); await ctx.close(); }

if (quale.includes('b12')) { const { ctx, page, ok } = await apri(); R.b12 = {};
  if (ok) { const r = await page.evaluate(() => window.__CPM_CAREER.apriFine302('stagione')); await sleep(2500); await ferma(page, 9000);
    const m = await page.evaluate(() => { const H = innerHeight; const bt = [...document.querySelectorAll('button')].filter(x => /Inizia Stagione|giorno dell'addio|Riepilogo in corso/.test(x.textContent || '')); const sc = document.querySelector('.cpm-scroll');
      const det = [...document.querySelectorAll('details,[aria-expanded]')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
      const vis = [...document.querySelectorAll('button')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.top >= 0 && r.bottom <= H; }).map(x => (x.textContent || '').trim().slice(0, 30));
      return { H, bottoni: bt.map(x => { const r = x.getBoundingClientRect(); return { t: (x.textContent || '').trim(), top: Math.round(r.top), bottom: Math.round(r.bottom), pos: getComputedStyle(x).position }; }), fisarmoniche: det.length, scrollH: sc ? sc.scrollHeight : null, bottoniInVista: vis.slice(0, 12) }; });
    R.b12 = { apri: r, ...m, foto: await shot(page, 'b12-tel-fine-stagione-prima-vista') }; }
  console.log('B12', JSON.stringify(R.b12)); await ctx.close(); }

if (quale.includes('d16')) { const { ctx, page, ok } = await apri(); R.d16 = {};
  if (ok) { R.d16.slotPrima = await salvato(page);
    const r = await page.evaluate(() => window.__CPM_CAREER.apriFine302('carriera')); await sleep(2500);
    R.d16.apri = r; R.d16.slotDopo = await salvato(page); const g = await grezzo(page); R.d16.grezzo = g && g.player ? { retired: g.player.retired, season: g.player.season, week: g.player.week, club: g.player.club && g.player.club.n } : g;
    R.d16.foto = await shot(page, 'd16-tel-fine-carriera'); }
  console.log('D16', JSON.stringify(R.d16).slice(0, 900)); await ctx.close(); }

if (quale.includes('d16b')) { /* la scheda dello slot nel menu, con un salvataggio ritirato */
  const { ctx, page } = await apriPagina(b, port, TEL, { save: { ...SAVE, player: { ...SAVE.player, retired: true } } }, '?cpmtest=1', errs); await sleep(1500); await ferma(page);
  const t = await testo(page); const m = /Grafica Probe.{0,160}/.exec(t); R.d16b = { scheda: m ? m[0] : null, foto: await shot(page, 'd16-tel-menu-slot-ritirato') };
  console.log('D16b', JSON.stringify(R.d16b)); await ctx.close(); }

if (quale.includes('b5')) { const { ctx, page, ok } = await apri(); R.b5 = {};
  if (ok) { const prima = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { club: s.club && s.club.n, tm: (s.teammates || []).slice(0, 4).map(t => t.name), cupClub: s.cup && s.cup.club ? (s.cup.club.n || s.cup.club) : null }; });
    const f = await page.evaluate(() => window.__CPM_CAREER.forceOffer()); await sleep(1200);
    let acc = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => /^(✅\s*)?Accett/.test((y.textContent || '').trim())); if (x) { x.click(); return (x.textContent || '').trim().slice(0, 40); } return null; });
    await sleep(800); if (acc) { const c2 = await page.evaluate(() => { const x = [...document.querySelectorAll('button')].find(y => /Conferm|Firma|Accett/.test((y.textContent || '').trim())); if (x) { x.click(); return (x.textContent || '').trim().slice(0, 40); } return null; }); R.b5.secondoTocco = c2; }
    await sleep(2500);
    const vivo = await page.evaluate(() => { const s = window.__CPM_CAREER.snapshot(); return { club: s.club && s.club.n, tm: (s.teammates || []).slice(0, 4).map(t => t.name), cupClub: s.cup && s.cup.club ? (s.cup.club.n || s.cup.club) : null, week: s.week }; });
    const g = await grezzo(page); const sv = g && g.player ? { club: g.player.club && g.player.club.n, tm: (g.player.teammates || []).slice(0, 4).map(t => t.name), cupClub: g.player.cup && g.player.cup.club ? (g.player.cup.club.n || g.player.cup.club) : null } : g;
    R.b5 = { ...R.b5, offerta: f, accetta: acc, prima, vivo, salvato: sv, compagniUguali: JSON.stringify(vivo.tm) === JSON.stringify(sv && sv.tm) }; }
  console.log('B5', JSON.stringify(R.b5)); await ctx.close(); }

R.errori = errs; fs.writeFileSync(path.join(ROOT, process.env.C140_OUT || 'docs/collaudo-grafico/140/misure-carriera.json'), JSON.stringify(R, null, 1)); console.log('errori:', errs.slice(0, 5));
await b.close(); srv.close();
