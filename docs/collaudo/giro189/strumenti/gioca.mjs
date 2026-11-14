/* [giro 189] Giocatore a mosse: node gioca.mjs <tel|pc> <statoIn|-> <statoOut|-> mossa mossa ...
   mossa = testo/regex del tasto da toccare, oppure:
     @foto:nome[:full]   fotografia        @log[:N]      stampa tasti e testo (N caratteri)
     @att:ms             attesa            @scrivi:testo scrive nel primo campo di testo
     @auto:N[:politica]  N passi col pilota (politiche in fondo)   @stato   riga di stato dal salvataggio
     @xy:x,y             tocco a coordinate   @test  (solo come PRIMA mossa) apre con ?cpmtest=1
   Dopo ogni tocco stampa una riga: cosa ha toccato e l'inizio del testo della schermata. */
import { apri, sleep } from './lib189.mjs';
const [fmt, sin, sout, ...mosse] = process.argv.slice(2);
const test = mosse[0] === '@test'; if (test) mosse.shift();
const H = await apri({ fmt, stato: sin === '-' ? null : sin, test });
const breve = async (n = 110) => (await H.txt(n + 200)).replace(/\n/g, ' · ').slice(0, n);
/* politiche del pilota: lista ordinata di regex; tocca la prima che trova in primo piano */
const POL = {
  /* avanza la carriera simulando le partite */
  sim: [/^Salta$/i, /Salta intro|Salta ▸|Salta tutorial|^Salta/i, /Simula(?! tutta)/i, /Capito|Ho capito|Ricevuto/i, /Continua|Avanti|Prosegui|Vai avanti|Chiudi|^OK$|Va bene|Fatto|Torna alla|Conferma|Inizia|Accetta|Firma/i, /Vivi la settimana/i, /Gioca/i],
  /* avanza la carriera giocando le partite */
  gioca: [/^Salta$/i, /Salta intro|Salta ▸|Salta tutorial|^Salta/i, /Gioca(?!.*simul)/i, /Capito|Ho capito|Ricevuto/i, /Continua|Avanti|Prosegui|Vai avanti|Chiudi|^OK$|Va bene|Fatto|Torna alla|Conferma|Inizia|Accetta|Firma|Scendi in campo|Calcio d'inizio/i, /Vivi la settimana/i],
};
let giro = 0;
/* pilota di carriera. Se c'e' un riquadro aperto (alcuni tasti risultano coperti) sceglie fra i tasti del riquadro;
   altrimenti tocca il tasto principale della Home secondo la politica:
   sim = simula le partite · gioca = le gioca (poi serve @partita) · momento = «Vai al prossimo momento importante».
   Si ferma (ritorna il motivo) quando trova un tasto di partita, un testo di stop o non sa cosa fare. */
const NO = /^\d+ATT|La tua settimana|Obiettivi della|Ultime notizie|^(Salva carriera|Opzioni|Home|Stagione|Club|Carriera|Agente|Ufficio|Calendario|☕|💡|BUTTON|INPUT|SELECT)|Chiudi — riprendi|Licenzia|lista transfer|Cambia procuratore|Richiedi cessione/i;
const PREF = /Capito|Continua|Avanti|Prosegui|Va bene|^OK|Fatto|Conferma|Inizia|Accetta|Firma|Chiudi|Salta|Torna|Vai|Grazie|Ricevuto|Apri|Scopri|Prossim/i;
async function auto(n, pol, stop) {
  const reStop = stop ? new RegExp(stop, 'i') : null; let fermo = 0, ultimo = '', ultimoTap = null, rip = 0;
  for (let i = 0; i < n; i++) {
    const tutti = await H.btns(); const b = tutti.filter(x => !/\[coperto\]/.test(x)); const aperto = tutti.some(x => /^(Home|Stagione|Agente|Ufficio) \[coperto\]/.test(x)) || !tutti.some(x => /^Home/.test(x));
    const testo = await H.txt(2500);
    if (reStop && reStop.test(testo)) return 'STOP testo «' + stop + '»';
    if (b.some(x => /^(⏸|▶)$/.test(x)) && b.some(x => /×$/.test(x))) return 'IN PARTITA';
    let fatto = null;
    if (aperto) { const c = b.filter(x => !NO.test(x)); if (c.length) { const sc = c.filter(x => !PREF.test(x) && !/^(Non ora|Annulla|Più tardi|Dopo|No, )/i.test(x)); /* scelte vere prima dei tasti di passaggio */
        const rf = process.env.G189_ACCETTA ? null : c.find(x => /Rifiut|Resto qui|Declin|No, grazie/i.test(x)); if (rf) { fatto = await H.tap(rf.slice(0, 30).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); console.log('     OFFERTA/PROPOSTA rifiutata fra: ' + JSON.stringify(c.map(x => x.slice(0, 40)))); }
        const cf = c.find(x => /Conferma|Tieni #/.test(x)); const k = (sc.length > 8 && cf) ? cf : sc.length ? sc[(giro++) % sc.length] : c[0]; if (!fatto) fatto = await H.tap(k.slice(0, 45).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); if (sc.length > 8) { const r2 = await H.tap(/Conferma/); console.log('     griglia di ' + sc.length + ' tasti: scelto ' + fatto + ', poi ' + r2); } else if (sc.length > 1) console.log('     scelte(' + sc.length + '): ' + JSON.stringify(sc.slice(0, 6).map(x => x.slice(0, 60)))); } }
    else { const ord = pol === 'momento' ? [/Vai al prossimo momento/i, /Avvia Stagione/i, /Vivi la settimana/i, /Avanza Settimana/i, /^.{0,3}Simula/i, /^.{0,3}Gioca/i] : pol === 'gioca' ? [/Avvia Stagione/i, /Vivi la settimana/i, /Avanza Settimana/i, /^.{0,3}Gioca/i, /^.{0,3}Simula/i] : [/Avvia Stagione/i, /Vivi la settimana/i, /Avanza Settimana/i, /^.{0,3}Simula/i, /^.{0,3}Gioca/i];
      for (const re of ord) { if (b.some(x => re.test(x))) { fatto = await H.tap(re); break; } }
      if (!fatto && b.includes('Vai')) fatto = await H.tap(/^Vai$/);
      if (!fatto && b.includes('Home') && !b.some(x => /Vai al prossimo momento/.test(x))) fatto = await H.tap(/^Home$/);
      if (!fatto) { const c = b.filter(x => !NO.test(x)); const k = c.find(x => PREF.test(x)) || (c.length === 1 ? c[0] : null); if (k) fatto = await H.tap(k.slice(0, 45).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); } }
    const t = (await breve(/prossimo momento/i.test(fatto || '') ? 330 : 120));
    if (fatto && fatto === ultimoTap) { if (++rip >= 4) return 'RIPETO «' + fatto + '»'; } else rip = 0; ultimoTap = fatto;
    if (fatto) { console.log(`  [${i}] ${aperto ? '▣' : '·'} ${fatto} → ${t}`); fermo = 0; } else { fermo++; if (t !== ultimo) console.log(`  [${i}] (nessun tasto) ${t} | ${JSON.stringify(b).slice(0, 300)}`); if (/Tocca per chiudere/.test(testo)) await H.tocca(195, 420); await sleep(1200); if (fermo > 6) return 'FERMO'; }
    ultimo = t; await sleep(450);
  }
  return 'passi finiti';
}
/* partita osservata: stampa ogni cambio dei tasti, fotografa le prime nf schermate nuove, sceglie le azioni a rotazione.
   Si ferma quando non ci sono piu' i comandi di partita (velocita') per 6 letture di fila, o allo scadere dei secondi. */
const CTRL = /^(⚠️|⏸|▶|1×|1,5×|2×|1x|2x|🔊|🔇|🎧|BUTTON|✕|Pausa|Riprendi|Statistiche|Pagelle|›|⌄|˅|⌃)$|^(⚠️|⏸|▶|🔊|🔇)|Audio|velocit/i;
async function partita(sec, pref, nf, stop) {
  const reStop = stop ? new RegExp(stop, 'i') : null;
  const t0 = Date.now(); let prima = '', foto = 0, fuori = 0, vel = false, visti = 0;
  while (Date.now() - t0 < sec * 1000) {
    const b = (await H.btns()).filter(x => !/\[coperto\]/.test(x)); const firma = b.join('|');
    if (reStop && reStop.test(await H.txt(3000))) { console.log('  STOP: trovato «' + stop + '»'); break; }
    if (!vel && process.env.G189_VEL !== '1') { if (b.includes('1×')) { await H.tap(/^1×$/); } else if (b.includes('1,5×')) { await H.tap(/^1,5×$/); } else if (b.includes('2×')) { vel = true; } }
    const az = b.filter(x => !CTRL.test(x));
    if (firma !== prima) { visti++; const tt = (await H.txt(700)).replace(/\n/g, ' · ');
      console.log(`  t+${Math.round((Date.now() - t0) / 1000)}s TASTI ${JSON.stringify(b)}\n     TESTO ${tt.slice(0, 420)}`);
      if (az.length && foto < nf && pref) { await H.foto(pref + '-' + String(++foto).padStart(2, '0')); } prima = firma; }
    if (az.length) { fuori = 0; const k = az[(giro++) % az.length]; const r = await H.tap(k.slice(0, 40)); console.log('     ► ' + r); await sleep(600); }
    else { if (!b.some(x => CTRL.test(x))) fuori++; else fuori = 0; if (fuori > 8 && visti > 3) break; await sleep(900); }
  }
  console.log('  fine osservazione dopo ' + Math.round((Date.now() - t0) / 1000) + ' s');
}
for (const m of mosse) {
  if (m.startsWith('@foto:')) { const [, nome, full] = m.split(':'); console.log('FOTO', await H.foto(nome, !!full)); }
  else if (m.startsWith('@log')) { const n = +(m.split(':')[1] || 1200); console.log('TASTI:', JSON.stringify(await H.btns()), '\nTESTO:', await H.txt(n)); }
  else if (m.startsWith('@att:')) await sleep(+m.split(':')[1]);
  else if (m.startsWith('@scrivi:')) { await H.page.locator('input[type="text"],input:not([type])').first().fill(m.slice(8)); await sleep(300); }
  else if (m.startsWith('@auto:')) { const [, n, pol, stop] = m.split(':'); console.log('  AUTO → ' + await auto(+n, pol || 'sim', stop)); }
  else if (m.startsWith('@partita:')) { const [, sec, pref, nf, stop] = m.split(':'); await partita(+sec, pref, +(nf || 6), stop); }
  else if (m === '@stato') console.log('STATO', JSON.stringify(await H.stato()));
  else if (m.startsWith('@xy:')) { const [x, y] = m.slice(4).split(',').map(Number); await H.tocca(x, y); await sleep(500); console.log(`xy ${x},${y} → ${await breve()}`); }
  else if (m.startsWith('@tap2:')) { const r = await H.tap(new RegExp(m.slice(6), 'i'), 1); await sleep(700); console.log(`2° «${m.slice(6)}» → ${r} → ${await breve()}`); }
  else { const r = await H.tap(new RegExp(m, 'i')); await sleep(700); console.log(`«${m}» → ${r === null ? 'NON TROVATO' : r} → ${await breve()}`); }
}
if (H.errori.length) console.log('ERRORI PAGINA', H.errori.slice(0, 5));
if (sout && sout !== '-') await H.salva(sout);
await H.chiudi();
