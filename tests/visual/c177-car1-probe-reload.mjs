/* Collaudo 177 carriera 1 — differenze di stato dopo salva e ricarica (cup.club, teammates) */
import { apri, sleep, caricaCarriera, dumpLS } from './c177-car1-lib.mjs';
import fs from 'node:fs';
const save = JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const g = await apri({ save, glb: false }); const page = g.page; await caricaCarriera(page); await sleep(2500);
const pick = async () => { const ls = await dumpLS(page); const p = JSON.parse(ls['cpm-v3']).player; return { cupClub: p.cup && p.cup.club, cupKeys: p.cup && Object.keys(p.cup).slice(0,12), tm: (p.teammates||[]).map(t=>[t.name,t.archetype,t.icon]) }; };
const A = await pick();
await page.reload({ waitUntil: 'load' }); await page.waitForFunction(() => document.getElementById('root').children.length > 0, null, { timeout: 90000 }); await sleep(2500);
const ls0 = await dumpLS(page); const B = JSON.parse(ls0['cpm-v3']) ; 
console.log('A', JSON.stringify(A)); const pB = B.player || {}; console.log('B', JSON.stringify({ phase: B.phase, cupClub: pB.cup && pB.cup.club, tm: (pB.teammates||[]).map(t=>[t.name,t.archetype,t.icon]) }));
await g.close();
