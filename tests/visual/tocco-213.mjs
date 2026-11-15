#!/usr/bin/env node
/* [giro 213 · PO-475] GUARDIANO tocco-213 — riscontro al tocco uniforme su tutti i pulsanti (decisione PO 15/11: il tasto SI SCHIACCIA
   e SI ILLUMINA SUBITO; se l'azione richiede tempo compare una ROTELLINA sul tasto; anche col mouse).
   Lancia la sonda misura-213 (tocco vero via CDP su telefono 375x667 pointer:coarse, mouse su PC 1366x768) e giudica, per ogni tasto
   elencato (schede, Vai al prossimo momento + conferma, Vivi la settimana, Simula, Gioca, pre-partita, Salta ingresso, pad, giocata,
   Salta festeggiamenti, Avanti/Salta della rassegna, Scegli delle offerte):
     R1 riscontro (o l'effetto dell'azione) nel PRIMO fotogramma dopo l'elaborazione del tocco, entro 50 ms da essa (dove il fotogramma
        stesso dura piu' di 50 ms — scene 3D headless — entro quel fotogramma, la cui durata si stampa);
        dove la pagina elabora il tocco subito (attesa del pointerdown < 30 ms, schermate 2D) entro 50 ms dal tocco stesso;
     R2 luce (brightness) sempre e scala 0,96 dove lo strato la applica; col moto ridotto (prefers-reduced-motion) solo luce;
     R3 layout invariato sul fotogramma premuto e area di tocco invariata (i punti a 2 px dai bordi che a riposo colpiscono il tasto);
     R4 rotellina presente per i tasti a lavoro sincrono misurato (data-pesante213) e per ogni azione che parte oltre 400 ms dal clic;
     R5 doppio tocco rapido su Simula: UNA sola partita salvata (non-regressione dello strato: il differimento non deve raddoppiare).
   Braccio rosso: window.__CPM_NO_G213 (strato spento, vecchio :active) → DEVE essere bocciato. «Non giudicato» (tasto non trovato,
   misura mancante) = rosso. Verde e rosso stampati per ultimi.
   Uso: cd tests/visual && CPM_CHROME=/opt/pw-browsers/chromium node tocco-213.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
if (!process.env.CPM_CHROME) process.env.CPM_CHROME = '/opt/pw-browsers/chromium';
const DIR = path.dirname(new URL(import.meta.url).pathname);
const TMP = fs.mkdtempSync('/tmp/tocco213-');
const PESANTI = /^(Simula \(prompt\)|Simula doppio tocco|Gioca la partita|Avanti pre-partita \(formations\)|Salta ingresso|Salta festeggiamenti|offerta)/;
const ATTESI = {
  tel: ['scheda Stagione', 'scheda Home', 'Vivi la Settimana', 'Vai al prossimo momento', 'Vai (conferma corsa)', 'Simula (prompt)', 'Simula doppio tocco', 'Gioca la partita',
    'Avanti pre-partita (matchday)', 'Avanti pre-partita (formations)', 'Salta ingresso', 'pad (freccia)', 'giocata highlight', 'Salta festeggiamenti', 'Avanti (rassegna)', 'Salta (rassegna)', 'offerta (scegli club)'],
  pc: ['scheda Stagione', 'scheda Home', 'Vivi la Settimana', 'Vai al prossimo momento', 'Vai (conferma corsa)', 'Simula (prompt)', 'Simula doppio tocco', 'offerta (scegli club)'],
};
function corsa(nome, dove, gruppi, args = [], env = {}) {
  const out = path.join(TMP, nome + '.json');
  console.log(`\n▶ ${nome}: ${dove} · ${gruppi}`);
  const r = spawnSync('node', ['misura-213.mjs', ...args], { cwd: DIR, encoding: 'utf8', env: { ...process.env, CPM_DOVE: dove, CPM_GRUPPI: gruppi, CPM_OUT: out, ...env }, timeout: 1500000 });
  const riep = (r.stdout || '').split('RIEPILOGO')[1] || ''; console.log(riep.trim().split('\n').slice(1).join('\n'));
  try { return JSON.parse(fs.readFileSync(out, 'utf8')); } catch (e) { console.log('  ! nessun risultato: ' + String(r.stderr || '').slice(-300)); return null; }
}
const attesaGiu = r => { const m = /pointerdown\+0:attesa(\d+)/.exec(r.eventi || ''); return m ? +m[1] : null; };
/* giudizio di una riga: lista dei motivi di bocciatura (vuota = passa) */
function giudica(r, { ridotto = false } = {}) {
  const ko = [];
  if (!r || r.assente) return ['tasto non trovato (non giudicato)'];
  /* «entro 50 ms» dal gestore del tocco; dove il fotogramma stesso dura piu' di 50 ms (scene 3D headless, disegno in software) nessun
     riscontro puo' arrivare prima del fotogramma successivo: li' si pretende il PRIMO fotogramma e si stampa la sua durata */
  const fotLungo = r.durFot != null && r.durFot > 50;
  const risc = r.riscontro != null && r.fotRisc != null && r.fotRisc <= 1 && r.dopoGestore != null && (r.dopoGestore <= 50 || (fotLungo && r.dopoGestore <= r.durFot + 1));
  const eff1 = r.effetto != null && r.fotEff != null && r.fotEff <= 1 && r.riscontro == null;
  if (!risc && !eff1) ko.push(`R1 nessun riscontro nel primo fotogramma (riscontro ${r.riscontro} · fotogrammi ${r.fotRisc} · dopo il gestore ${r.dopoGestore})`);
  const ag = attesaGiu(r);
  if (risc && ag != null && ag < 30 && r.riscontro > 50) ko.push(`R1 riscontro ${r.riscontro} ms > 50 su schermata pronta (attesa ${ag})`);
  if (risc) { const p = String(r.premuto || '');
    if (!/brightness/.test(p)) ko.push('R2 nessuna luce'); 
    if (ridotto ? /0\.96/.test(p) : (!/0\.96/.test(p) && (r.areaSint || {}).premuto !== 'n')) ko.push(ridotto ? 'R2 scala col moto ridotto' : 'R2 nessuna scala'); }
  if (r.layoutMosso) ko.push('R3 layout mosso');
  const area = r.area || (r.areaSint && r.areaSint.punti);
  if (!area || !area.length) ko.push('R3 area non misurata'); else if (area.some(x => !x)) ko.push('R3 area ristretta ' + JSON.stringify(area));
  const lenta = r.effetto != null && r.clickElab != null && r.effetto - r.clickElab > 400;
  if ((PESANTI.test(r.nome) || lenta) && r.rotella == null) ko.push(`R4 nessuna rotellina (${PESANTI.test(r.nome) ? 'lavoro sincrono misurato' : 'azione a ' + (r.effetto - r.clickElab) + ' ms dal clic'})`);
  if (r.nome === 'Simula doppio tocco' && r.partite !== 1) ko.push(`R5 partite salvate +${r.partite}`);
  return ko;
}
function giudicaCorsa(R, dove, attesi, opz) {
  if (!R) return { ok: false, righe: [`${dove}: nessun risultato (non giudicato)`] };
  const righe = []; let ok = true;
  for (const nome of attesi) { const r = R.find(x => x.nome === nome && !x.assente) || R.find(x => x.nome === nome); const ko = giudica(r, opz);
    if (ko.length) ok = false; righe.push(`${ko.length ? '✗' : '✓'} ${dove} ${nome}${r && !r.assente ? ` (riscontro ${r.riscontro} · dopo il gestore ${r.dopoGestore} · fotogramma ${r.durFot} ms · effetto ${r.effetto} · rotella ${r.rotella})` : ''}${ko.length ? ' — ' + ko.join(' · ') : ''}`); }
  return { ok, righe };
}
const V = [], ROSSI = [];
/* verde */
const vt = giudicaCorsa(corsa('verde-tel', 'tel', 'casa,vai,simula,doppio,partita,rassegna,offerte'), 'tel', ATTESI.tel); V.push(vt);
const vp = giudicaCorsa(corsa('verde-pc', 'pc', 'casa,vai,simula,doppio,offerte', [], { CPM_DP_PAUSA: '5', CPM_DP_TIENI: '10' }), 'pc', ATTESI.pc); V.push(vp);
const vr = giudicaCorsa(corsa('verde-ridotto', 'tel', 'casa', [], { CPM_RIDOTTO: '1' }), 'tel moto ridotto', ['scheda Stagione', 'Vivi la Settimana'], { ridotto: true }); V.push(vr);
/* rosso */
const rt = giudicaCorsa(corsa('rosso-tel', 'tel', 'casa,simula,offerte', ['--rosso']), 'tel', ['scheda Stagione', 'scheda Home', 'Vivi la Settimana', 'Simula (prompt)', 'offerta (scegli club)']); ROSSI.push(rt);
const rp = giudicaCorsa(corsa('rosso-pc', 'pc', 'casa,simula', ['--rosso']), 'pc', ['scheda Stagione', 'scheda Home', 'Vivi la Settimana', 'Simula (prompt)']); ROSSI.push(rp);
console.log('\nVERDE'); for (const g of V) for (const l of g.righe) console.log('  ' + l);
console.log('\nROSSO __CPM_NO_G213 (deve essere bocciato)'); for (const g of ROSSI) for (const l of g.righe) console.log('  ' + l);
const vOk = V.every(g => g.ok);
const giudicato = ROSSI.every(g => g.righe.length && !g.righe.some(l => /non giudicato/.test(l)));
const rOk = giudicato && ROSSI.every(g => !g.ok);
console.log(`\nVERDE: ${vOk ? '✓ promosso' : '✗ bocciato'}`);
console.log(`ROSSO __CPM_NO_G213: ${rOk ? '✓ bocciato come deve' : '✗ NON bocciato (o non giudicato)'}`);
console.log(vOk && rOk ? '✓ tocco-213 VERDE' : '✗ tocco-213 ROSSO');
process.exit(vOk && rOk ? 0 : 1);
