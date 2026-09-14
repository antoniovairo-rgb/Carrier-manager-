/* [STRUMENTO] CHI RISCRIVE L'IMBARDATA DELLA ROVESCIATA — il testimone 7.611, mai esercitato.
   Il PO l'ha segnalata SETTE volte («la rovesciata/sforbiciata e' al contrario»). Nel 7.597 avevo
   scritto: «letta dalla mesh a fine fotogramma l'imbardata NON e' quella che scrivo: qualcuno la
   riscrive dopo. Quello e' il filo, e finche' non so CHI non tocco l'imbardata». Nel 7.611 ho messo
   il testimone che intercetta OGNI scrittura di hero.rotation.y durante l'acrobazia, con l'impronta
   della pila — e non l'ha mai acceso nessuna sonda: un testimone che nessuno interroga e' un buco.
   Qui si accende, su tre scene acrobatiche, e si stampa CHI scrive e con quale valore.
   CPM_GLBON=1 ripete la stessa misura nel ramo del gioco vero. */
/* ⚠️ QUESTO STRUMENTO NON E' ANCORA UN GIUDICE — cosa misura e cosa NON puo' dire:
   MISURA, bene: l'angolo fra il corpo dell'eroe e la porta, letto dalla MESH a fine fotogramma
   (non dall'interno del blocco che lo scrive: quell'errore l'ho gia' fatto nel 7.597, lo strumento
   si guardava allo specchio), e chi riscrive l'imbardata, con l'impronta della pila.
   MISURATO finora, GLB SPENTO, solo nei fotogrammi di gesto: gi1 163 gradi, gi41 150, gi68 136
   (spalle alla porta: il verso GIUSTO per un'acrobazia) e gi88 24 gradi (fronte alla porta: giusto
   per una volee' di collo). Nessuno di questi condanna l'imbardata.
   NON PUO' DIRE, e va saputo prima di usarlo: con GLB ACCESO il gesto occupa 84 campioni su 90 e il
   filtro «durante il gesto» smette di selezionare — l'angolo che ne esce (gi88: 150 gradi) puo'
   essere la corsa prima del contatto, non l'acrobazia. Per giudicare il ramo GLB serve prima un
   confine di gesto che venga dalla CLIP (peso/avanzamento dell'AnimationAction), non da `act.t`.
   Finche' quel confine non c'e', questo strumento censisce: non condanna. */
import { startServer, launchBrowser, installCdnRoutes, openMatch, sleep } from './lib/harness.mjs';
const srv = await startServer(); const port = srv.address().port;
const b = await launchBrowser();
const page = await b.newPage({ viewport: { width: 412, height: 915 } });
await installCdnRoutes(page);
await page.addInitScript((g) => { window.__CPM_GLB = !!g; window.__CPM_PRESENT = 1; window.__CPM_ROV611 = []; }, !!process.env.CPM_GLBON);
await openMatch(page, port, { skipLoadAll: true, name: 'Rov' });
const GIs = (process.env.CPM_GI || '68,1,41,88').split(',').map(Number);
console.log('\n=== CHI RISCRIVE L\'IMBARDATA DELLA ROVESCIATA ===\n');
for (const gi of GIs) {
  await page.evaluate(() => { window.__CPM_ROV611 = []; });
  try { await page.evaluate(([i, c]) => window.__CPM_FORCE_SIT(i, c), [gi, true]); } catch (_e) { console.log(`  gi${gi}: non forzabile`); continue; }
  /* ⚠️ il gesto acrobatico cade nell'ESITO: forzare la scena non basta, bisogna anche SCEGLIERE
     l'azione acrobatica e risolverla. Alla prima stesura questa sonda campionava 90 fotogrammi di
     fase di lettura e trovava il testimone vuoto — non perche' l'imbardata non venga riscritta, ma
     perche' la rovesciata non era mai partita. */
  const ai = await page.evaluate((g) => { const s = (window.__CPM_SITS || [])[g] || {};
    const A = s.actions || []; for (let k = 0; k < A.length; k++) if (/rovesciat|sforbiciat|vol[eèé]e|al volo/i.test(String(A[k].label || ''))) return k; return -1; }, gi);
  if (ai < 0) { console.log(`  gi${gi}: nessuna azione acrobatica in questa scena`); continue; }
  await sleep(500);
  await page.evaluate((k) => { window.__CPM_FORCE_OUTCOME = 'success'; window.__CPM_RESOLVE(k); }, ai);
  const ang = [];
  for (let k = 0; k < 90; k++) {
    const a = await page.evaluate(() => { try {
      const st = window.__CPM_STATE && window.__CPM_STATE(); if (!st || !st.hero) return null;
      /* la porta avversaria e' a gx=100: la direzione dell'imbardata si confronta con quella. In three
         l'asse x del mondo cresce verso la porta away, e rotation.y=0 guarda +z: l'angolo verso porta
         e' atan2(dx,dz) con dz=0 -> pi/2. Si riporta tutto in gradi 0-180. */
      const ry = st.hero.ry || 0;
      const versoPorta = Math.PI / 2;
      let d = ((ry - versoPorta) % (2 * Math.PI) + 3 * Math.PI) % (2 * Math.PI) - Math.PI;
      return { deg: Math.abs(d) * 180 / Math.PI, act: (st.act && st.act.t) || null, pat: (st.act && st.act.pat) || null };
    } catch (_e) { return null; } });
    if (a) ang.push(a);
    await sleep(60);
  }
  const R = await page.evaluate(() => (window.__CPM_ROV611 || []).slice());
  const acro = ang.filter(a => a.act && /volley|shot/.test(String(a.act)));
  const med = (arr) => { if (!arr.length) return null; const s = arr.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
  /* ⚠️ l'angolo si misura SOLO nei fotogrammi in cui il gesto e' davvero in corso: la mediana su
     tutti i campioni includeva la corsa prima e dopo, dove il corpo giustamente guarda altrove. */
  const mA = med(acro.map(a => a.deg));
  console.log(`  gi${gi} · fotogrammi DI GESTO ${acro.length}/${ang.length} · angolo corpo-porta durante il gesto: mediano ${mA == null ? '?' : mA.toFixed(0) + '°'} · min ${acro.length ? Math.min(...acro.map(a => a.deg)).toFixed(0) : '?'}° max ${acro.length ? Math.max(...acro.map(a => a.deg)).toFixed(0) : '?'}° (una rovesciata vuole ~180°, una volee di collo ~0°)`);
  if (!R.length) { console.log('    testimone VUOTO: nessuna scrittura intercettata (il blocco acrobatico non e\' passato di qui)'); continue; }
  /* si contano SOLO le scritture avvenute DENTRO il gesto (u<1): fuori di li' il facing di corsa
     deve riprendere il comando, ed e' giusto che scriva. */
  const dentro = R.filter(r => r.u != null && r.u < 1);
  const perFonte = {};
  for (const r of dentro) { const k = r.st || '?'; (perFonte[k] = perFonte[k] || []).push(r); }
  const righe = Object.entries(perFonte).sort((a, c) => c[1].length - a[1].length).slice(0, 6);
  console.log(`    scritture DENTRO il gesto: ${dentro.length} (su ${R.length} totali) da ${Object.keys(perFonte).length} sorgenti`);
  for (const [fonte, rs] of righe) {
    const conLucchetto = rs.filter(r => r.L).length;
    console.log(`      ${String(rs.length).padStart(4)}x  ${fonte}  · di cui a LUCCHETTO ATTIVO ${conLucchetto} · valori ${rs.slice(0, 4).map(r => r.v).join(', ')}${rs.length > 4 ? ' …' : ''}`);
  }
}
await b.close(); srv.close();
console.log('');
