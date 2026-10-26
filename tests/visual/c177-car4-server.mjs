/* Banco persistente: tiene la pagina aperta e accetta comandi JS via HTTP locale (POST /ev, corpo = codice async con `page`, `st`). */
import http from 'node:http';
import fs from 'node:fs';
import { apri, sleep, foto, tocca, testo, SAVEF, OUT } from './c177-car4-lib.mjs';
let sv = null; if (fs.existsSync(SAVEF) && process.env.RIPRENDI) sv = JSON.parse(fs.readFileSync(SAVEF, 'utf8'));
const { page, browser, errori } = await apri({ salvataggio: sv, glb: process.env.GLB === '1' });
const st = { errori, log: [] };
const AsyncF = Object.getPrototypeOf(async function () {}).constructor;
try{const hs=fs.readFileSync(new URL('./c177-car4-helpers.mjs.txt',import.meta.url),'utf8');await new AsyncF('page','st','sleep','foto','tocca','testo','fs','OUT','SAVEF',hs)(page,st,sleep,foto,tocca,testo,fs,OUT,SAVEF);}catch(e){console.log('helpers',e.message);}
http.createServer((req, res) => {
  let b = ''; req.on('data', d => b += d); req.on('end', async () => {
    try {
      const f = new AsyncF('page', 'st', 'sleep', 'foto', 'tocca', 'testo', 'fs', 'OUT', 'SAVEF', b);
      const r = await f(page, st, sleep, foto, tocca, testo, fs, OUT, SAVEF);
      res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' }); res.end(typeof r === 'string' ? r : JSON.stringify(r));
    } catch (e) { res.writeHead(500); res.end('ERR ' + e.message); }
  });
}).listen(7177, () => console.log('pronto 7177'));
