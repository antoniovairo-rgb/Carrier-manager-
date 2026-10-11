#!/usr/bin/env node
/* PROBE RILASCIO giro 2 (punto 2): scheda «Profilo» sulla DIST (dist/index.html) a 375x812.
   Elenca le voci di navigazione VERE nel DOM, poi percorre il cammino utente (contenitore → sottotab)
   e dichiara se l'etichetta «Profilo» esiste e si raggiunge. Esplorativa: registra, non asserisce. */
import fs from 'node:fs';
import path from 'node:path';
import { startServer, launchBrowser, sleep } from './lib/harness.mjs';
const OUT = process.env.PROBE_OUT || path.join(process.cwd(), 'shots-profilo');
fs.mkdirSync(OUT, { recursive: true });
const save = JSON.parse(fs.readFileSync(new URL('./fixtures/save-190-s12-ovr93.json', import.meta.url)));
const srv = await startServer(); const b = await launchBrowser();
const ctx = await b.newContext({ viewport: { width: 375, height: 812 } }); const page = await ctx.newPage();
const msgs = []; page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') msgs.push(m.type() + ': ' + m.text().slice(0, 120)); });
page.on('pageerror', e => msgs.push('pageerror: ' + String(e.message).slice(0, 120)));
// dist: niente hook __CPM_*, solo percorso utente. Il salvataggio si inietta come nel gate.
await page.addInitScript(s => { localStorage.setItem('cpm-v3', JSON.stringify(s)); }, save);
await page.goto(`http://localhost:${srv.address().port}/dist/index.html`, { waitUntil: 'load', timeout: 60000 });
await page.waitForFunction(() => !!document.getElementById('root').children.length, null, { timeout: 60000 }); await sleep(1500);
try { await page.getByText('CONTINUA', { exact: false }).first().click({ timeout: 8000 }); } catch (e) { console.log('CONTINUA non cliccato: ' + e.message.slice(0, 80)); }
await sleep(2500);
const voci = await page.evaluate(() => [...document.querySelectorAll('button, [role="tab"], nav *')].map(e => (e.innerText || '').replace(/\s+/g, ' ').trim()).filter(t => t && t.length <= 24));
console.log('VOCI NAV/BOTTONI (dist, unici): ' + [...new Set(voci)].slice(0, 60).join(' | '));
const hasProfilo = await page.evaluate(() => [...document.querySelectorAll('*')].some(e => e.children.length === 0 && /^Profilo$/.test((e.textContent || '').trim())));
console.log('etichetta «Profilo» (foglia) presente al primo livello: ' + hasProfilo);
await page.screenshot({ path: path.join(OUT, '01-dashboard.png') });
// cammino utente: tocca «Carriera» (contenitore), poi «Profilo» (sottotab)
const tap = async t => { const ok = await page.evaluate(lbl => { const els = [...document.querySelectorAll('button,[role="tab"],div,span')].filter(e => { const x = (e.innerText || '').replace(/\s+/g, ' ').trim(); return x === lbl || x.endsWith(' ' + lbl) && e.children.length <= 2; }); const el = els.sort((a, b) => (a.innerText || '').length - (b.innerText || '').length)[0]; if (!el) return false; el.click(); return true; }, t); await sleep(1500); return ok; };
const c = await tap(process.env.PROBE_NAV || 'CARRIERA'); await page.screenshot({ path: path.join(OUT, '01b-dopo-carriera.png') });
console.log('tap «Carriera»: ' + (c ? 'trovato' : 'NON trovato'));
const p = await tap('👤 Profilo');
console.log('tap «Profilo» (dopo Carriera): ' + (p ? 'trovato e toccato' : 'NON trovato'));
const testo = await page.evaluate(() => (document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 200)); const stat = await page.evaluate(() => (document.body.innerText||'').includes('Statistiche'));console.log('contenuto Profilo (Statistiche presente): ' + stat);
console.log('testo dopo il percorso: «' + testo + '»');
const ov = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log('overflowX=' + ov + 'px');
await page.screenshot({ path: path.join(OUT, '02-profilo.png') });
console.log('messaggi console: ' + msgs.length); msgs.forEach(m => console.log('  ' + m));
await b.close(); srv.close();
