// Genera docs/governo/governo.html: backlog, lotti e registro delle release con filtri per colonna.
// Uso: node tools/governo-html.mjs   (da rilanciare a ogni release, dopo aver aggiornato ROADMAP.md e BACKLOG.md)
// La pagina e' autosufficiente (dati incorporati) e segue il contratto delle pagine Artifact: niente <html>/<body>.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const leggi = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

// Tabelle markdown di una sezione (fra un titolo "## ..." e il successivo)
function sezione(md, titoloInizio) {
  const righe = md.split('\n');
  const i = righe.findIndex(r => r.startsWith('## ') && r.includes(titoloInizio));
  if (i < 0) throw new Error('sezione non trovata: ' + titoloInizio);
  let j = i + 1;
  while (j < righe.length && !righe[j].startsWith('## ')) j++;
  return righe.slice(i + 1, j);
}
function tabella(righe) {
  const t = righe.filter(r => r.startsWith('|'));
  if (t.length < 2) return { cols: [], rows: [] };
  const split = r => r.replace(/^\|/, '').replace(/\|\s*$/, '').split(' | ').map(c => c.trim());
  const cols = split(t[0]);
  const rows = t.slice(2).map(split).map(c => { while (c.length < cols.length) c.push(''); return c.slice(0, cols.length); });
  return { cols, rows };
}

const backlog = leggi('docs/governo/BACKLOG.md');
const roadmap = leggi('docs/governo/ROADMAP.md');

const aperte = tabella(sezione(backlog, 'Voci aperte o parziali'));
const chiuse = tabella(sezione(backlog, 'Storico — voci chiuse'));
const bCols = ['Sezione', ...aperte.cols];
const bRows = [...aperte.rows.map(r => ['Aperta', ...r]), ...chiuse.rows.map(r => ['Chiusa', ...r])];

const lotti = tabella(sezione(roadmap, 'Lotti'));
const reg = tabella(sezione(roadmap, 'Registro delle release'));
// Registro: si separa la versione dal testo, per filtrarla
const rCols = ['Data', 'Versione', 'Passo', 'Esito'];
const rRows = reg.rows.map(([ora, passo, num]) => {
  const m = passo.match(/^\*\*(\d+\.\d+(?:\.\d+)?)/);
  return [ora, m ? m[1] : '', passo, num];
});

// [PO-163] STABILITA': dagli esiti registrati da tests/visual/ci-runner.mjs (docs/governo/STABILITA.json)
const COPRE = {
  'test:vision': 'motore di revisione visiva (43 prove in node)', 'test:logic': 'logica pura: motore, cronaca, decisione, baseline delle scene',
  'typing-shortcuts': 'campi di testo: le scorciatoie da tastiera non scattano mentre si scrive', 'validate-situations': 'gate 14/14: 191 scene forzate, stato, coerenza, golden, partita reale breve',
  'save-compat': 'salvataggi vecchi caricabili e migrati', 'replay': 'stessa partita giocata due volte = stessa sequenza', 'career-critical': 'carriera: classifiche, calendario, tornei, prestiti, transizione pro',
  'partita-vera': 'due partite intere sul flusso vero', 'design-system': 'token grafici (raggi, colori) al posto dei valori scritti a mano', 'griglia-mobile': 'impaginazione a larghezza telefono',
  'goleade': 'coda di goleade, eroe forte e debole', 'scene-disegnabili': 'nessuna scena attiva promette un gesto senza animazione',
};
let stab = []; try { stab = JSON.parse(leggi('docs/governo/STABILITA.json')); } catch {}
const sCols = ['Catena', 'Passo', 'Ultimo esito', 'Verdi / giri', 'Durata media (s)', 'Ultimo giro', 'Cosa copre'];
const sMap = new Map();
for (const g of stab) for (const p of g.passi) { const k = g.catena + '|' + p.passo; if (!sMap.has(k)) sMap.set(k, { cat: g.catena, passo: p.passo, ultimo: p.ok ? 'verde' : 'rosso', ver: g.versione + ' · ' + g.data, n: 0, ok: 0, s: 0 });
  const e = sMap.get(k); e.n++; if (p.ok) e.ok++; e.s += p.s; }
const sRows = [...sMap.values()].map(e => [e.cat, e.passo, e.ultimo, e.ok + ' / ' + e.n, String(Math.round(e.s / e.n)), e.ver, COPRE[e.passo] || '']);

// [PO-165] STATO SETTIMANALE: una pagina, calcolata dai documenti di governo (nessun dato scritto a mano)
const oggi = new Date(), gg = d => { const m = String(d).match(/^(\d{2})\/(\d{2})/); if (!m) return null; return new Date(oggi.getFullYear(), +m[2] - 1, +m[1]); };
const inSett = d => { const x = gg(d); return x && (oggi - x) / 864e5 < 7 && (oggi - x) >= -864e5; };
const relSett = reg.rows.filter(r => inSett(r[0])).map(r => (r[1].match(/^\*\*(\d+\.\d+(?:\.\d+)?)/) || [])[1]).filter(Boolean);
const perLotto = {}; for (const r of aperte.rows) { const l = r[5] || '?'; perLotto[l] = (perLotto[l] | 0) + 1; }
const attesaCodex = aperte.rows.filter(r => /DA COLLAUDARE|IN ATTESA/.test(r[4])).map(r => r[0]);
const rischi = tabella(leggi('docs/governo/RISCHI.md').split('\n')).rows.filter(r => /^R-\d+/.test(r[0]));
const rischiAlti = rischi.filter(r => r[2] === 'A' || r[3] === 'A').map(r => r[0] + ' ' + r[1].replace(/\*\*/g, ''));
const decSett = tabella(leggi('docs/governo/DECISIONI.md').split('\n')).rows.filter(r => inSett(r[0])).map(r => r[1].replace(/\*\*/g, '').slice(0, 90));
const ultimoGiro = stab[0] ? `${stab[0].catena} su ${stab[0].versione} (${stab[0].data}): ${stab[0].passi.filter(p => p.ok).length}/${stab[0].passi.length} verdi` : 'nessun giro registrato';
// [PO-159] smistamento: ogni voce deve avere un tipo fra quelli di PROCESSO.md; le altre si segnalano qui e nella console
const TIPI = ['bloccante', 'difetto', 'miglioramento', 'nuova funzione', 'debito tecnico', 'processo', 'ricerca', 'conflitto'];
const nonSmistate = [...aperte.rows, ...chiuse.rows].filter(r => !TIPI.includes(r[3])).map(r => r[0] + ' («' + r[3] + '»)');
if (nonSmistate.length) console.warn('⚠ voci con tipo fuori dallo smistamento: ' + nonSmistate.join(', '));
const wCols = ['Voce', 'Valore'];
const wRows = [
  ['Settimana', `dal ${new Date(oggi - 6 * 864e5).toISOString().slice(0, 10)} al ${oggi.toISOString().slice(0, 10)}`],
  ['Release della settimana', `${relSett.length}: ${relSett.join(', ')}`],
  ['Voci aperte o parziali', `${aperte.rows.length} — ` + Object.entries(perLotto).sort().map(([l, n]) => `${l} ${n}`).join(' · ')],
  ['Voci chiuse in totale', String(chiuse.rows.length)],
  ['In attesa di collaudo (Codex)', `${attesaCodex.length}: ${attesaCodex.join(', ')}`],
  ['Decisioni PO della settimana', `${decSett.length}: ${decSett.join(' · ')}`],
  ['Ultimo giro della suite', ultimoGiro],
  ['Voci non smistate (tipo fuori dalle categorie)', nonSmistate.length ? `${nonSmistate.length}: ${nonSmistate.join(', ')}` : '0'],
  ['Rischi ad alta probabilità o impatto', `${rischiAlti.length}: ${rischiAlti.join(' · ')}`],
];

let commit = '';
try { commit = execSync('git rev-parse --short HEAD', { cwd: ROOT }).toString().trim(); } catch {}
const ver = (leggi('src/07-versione-save-interviste.jsx').match(/const GAME_VERSION="([^"]+)"/) || [])[1] || '';
const quando = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC';

const DATI = {
  meta: { ver, commit, quando },
  tabs: [
    { id: 'backlog', nome: 'Backlog', cols: bCols, rows: bRows, ordine: [0, 6, 1],
      menu: ['Sezione', 'Tipo', 'Stato', 'Lotto'], larga: ['Titolo', 'Fonte/citazione', 'Stato', 'Release'] },
    { id: 'lotti', nome: 'Lotti', cols: lotti.cols, rows: lotti.rows, ordine: [],
      menu: ['Lotto', 'Stato'], larga: ['Osservazioni del team', 'Lotto'] },
    { id: 'registro', nome: 'Registro release', cols: rCols, rows: rRows, ordine: [],
      menu: ['Data', 'Esito'], larga: ['Passo'] },
    { id: 'stato', nome: 'Stato settimanale', cols: wCols, rows: wRows, ordine: [], menu: [], larga: ['Valore'] },
    { id: 'stabilita', nome: 'Stabilità', cols: sCols, rows: sRows, ordine: [], menu: ['Catena', 'Ultimo esito'], larga: ['Cosa copre'] },
  ],
};

const html = `<title>Governo Korward Elite</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Registro di cantiere: una testata stretta, cinque schede, tabelle dense e filtrabili colonna per colonna. */
:root{
  --bg:#f3f5f1; --panel:#ffffff; --ink:#17201b; --muted:#5b6a61; --rule:#d5ddd6; --accent:#1f7a4d; --accent-ink:#ffffff;
  --st-ok:#1f7a4d; --st-ok-bg:#e1f1e7; --st-run:#8a5a00; --st-run-bg:#fbefd6; --st-open:#a3321f; --st-open-bg:#f8e2dc; --st-wait:#3b5aa8; --st-wait-bg:#e2e8f7;
  --f-display:"Barlow Condensed","Arial Narrow",sans-serif; --f-body:"Barlow",system-ui,sans-serif; --f-mono:"JetBrains Mono",ui-monospace,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg:#101512; --panel:#171e1a; --ink:#e4ebe6; --muted:#97a69c; --rule:#2b352f; --accent:#4cc38a; --accent-ink:#0d1611;
  --st-ok:#6fd5a1; --st-ok-bg:#183326; --st-run:#f0c46a; --st-run-bg:#352a12; --st-open:#f29a86; --st-open-bg:#3a1f19; --st-wait:#9db5f2; --st-wait-bg:#1e2740; color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#101512; --panel:#171e1a; --ink:#e4ebe6; --muted:#97a69c; --rule:#2b352f; --accent:#4cc38a; --accent-ink:#0d1611;
  --st-ok:#6fd5a1; --st-ok-bg:#183326; --st-run:#f0c46a; --st-run-bg:#352a12; --st-open:#f29a86; --st-open-bg:#3a1f19; --st-wait:#9db5f2; --st-wait-bg:#1e2740; color-scheme:dark}
body{background:var(--bg);color:var(--ink);font:15px/1.45 var(--f-body);padding-inline:16px;padding-block:18px 40px}
.wrap{max-width:1400px;margin:0 auto;display:flex;flex-direction:column;gap:14px;min-width:0}
header{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px 18px}
h1{font:700 30px/1 var(--f-display);letter-spacing:.01em;margin:0;text-wrap:balance}
.meta{font:500 12px var(--f-mono);color:var(--muted)}
nav{display:flex;gap:6px;flex-wrap:wrap}
nav button{font:600 15px var(--f-body);border:1px solid var(--rule);background:var(--panel);color:var(--ink);padding:7px 14px;border-radius:999px;cursor:pointer}
nav button[aria-selected="true"]{background:var(--accent);border-color:var(--accent);color:var(--accent-ink)}
nav button .meta{color:inherit;opacity:.7}
nav button:focus-visible,.ctl:focus-visible,th button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.barra{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ctl{font:15px var(--f-body);color:var(--ink);background:var(--panel);border:1px solid var(--rule);border-radius:8px;padding:7px 10px;min-width:0}
#cerca{flex:1 1 240px}
.conta{font:500 13px var(--f-mono);color:var(--muted)}
.btn{font:600 14px var(--f-body);background:transparent;color:var(--accent);border:1px solid var(--rule);border-radius:8px;padding:7px 12px;cursor:pointer}
.tbox{overflow-x:auto;background:var(--panel);border:1px solid var(--rule);border-radius:10px;min-width:0}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{border-bottom:1px solid var(--rule);padding:8px 10px;text-align:left;vertical-align:top}
thead th{position:sticky;top:0;background:var(--panel);z-index:1}
th button{all:unset;cursor:pointer;font:700 13px var(--f-display);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
th button .fr{font-family:var(--f-mono);color:var(--accent)}
tr.filtri th{padding-top:0;top:34px}
tr.filtri .ctl{width:100%;font-size:13px;padding:5px 7px;box-sizing:border-box}
td{min-width:70px}
td.larga{min-width:260px;max-width:620px}
td.id{font:500 13px var(--f-mono);white-space:nowrap}
tbody tr:hover{background:color-mix(in srgb,var(--accent) 6%,transparent)}
code{font:500 12.5px var(--f-mono);background:color-mix(in srgb,var(--ink) 7%,transparent);padding:1px 4px;border-radius:4px}
.chip{display:inline-block;font:600 12px var(--f-body);padding:2px 8px;border-radius:999px;white-space:nowrap;margin-bottom:3px}
.c-ok{color:var(--st-ok);background:var(--st-ok-bg)}.c-run{color:var(--st-run);background:var(--st-run-bg)}.c-open{color:var(--st-open);background:var(--st-open-bg)}.c-wait{color:var(--st-wait);background:var(--st-wait-bg)}
.vuoto{padding:24px;color:var(--muted)}
@media (max-width:600px){h1{font-size:25px}td.larga{min-width:220px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<div class="wrap">
  <header>
    <h1>Governo Korward Elite</h1>
    <span class="meta" id="meta"></span>
  </header>
  <nav role="tablist" id="tabs"></nav>
  <div class="barra">
    <input class="ctl" id="cerca" type="search" placeholder="Cerca in tutte le colonne (es. PO-147, gi133, Codex)">
    <button class="btn" id="azzera" type="button">Azzera filtri</button>
    <span class="conta" id="conta"></span>
  </div>
  <div class="tbox"><table id="t"></table></div>
</div>
<script>
const DATI=${JSON.stringify(DATI).replace(/</g, '\\u003c')};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const md=s=>esc(s).replace(/\\*\\*([^*]+)\\*\\*/g,'<strong>$1</strong>').replace(/\`([^\`]+)\`/g,'<code>$1</code>');
const testo=s=>String(s).replace(/\\*\\*|\`/g,'');
// stato normalizzato: la prima parola chiave, per il menu a tendina
const statoBase=s=>{const t=testo(s).toUpperCase();
  for(const k of ['FATTO','PARZIALE','APERTO','IN CORSO','IN ATTESA','DA COLLAUDARE','NON RIPRODOTTO','SOSPESO','NON POSSO CONFERMARLO'])if(t.startsWith(k))return k.charAt(0)+k.slice(1).toLowerCase();
  return testo(s).split(/[ —(,]/)[0]||'—';};
const chipCls=b=>/^Fatto/.test(b)?'c-ok':/^(Parziale|In corso)/.test(b)?'c-run':/^(Aperto|Non riprodotto)/.test(b)?'c-open':'c-wait';
let tab=0;try{const v=localStorage.getItem('gov-tab');if(v!==null&&DATI.tabs[+v])tab=+v;}catch(e){}
const F={};let ord=null;
function valMenu(T,c,v){return T.cols[c]==='Stato'?statoBase(v):testo(v)||'—';}
function disegna(){
  const T=DATI.tabs[tab];
  $('#tabs').innerHTML=DATI.tabs.map((x,i)=>'<button role="tab" type="button" id="tab-'+x.id+'" aria-selected="'+(i===tab)+'" data-i="'+i+'">'+x.nome+' <span class="meta">'+x.rows.length+'</span></button>').join('');
  const filtri=T.cols.map((c,ci)=>{
    if(T.menu.includes(c)){const vals=[...new Set(T.rows.map(r=>valMenu(T,ci,r[ci])))].sort((a,b)=>a.localeCompare(b,'it',{numeric:true}));
      return '<th><select class="ctl" id="f-'+T.id+'-'+ci+'" data-c="'+ci+'" aria-label="Filtra '+esc(c)+'"><option value="">tutti</option>'+vals.map(v=>'<option'+(F[T.id+ci]===v?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select></th>';}
    return '<th><input class="ctl" id="f-'+T.id+'-'+ci+'" data-c="'+ci+'" type="search" placeholder="filtra" aria-label="Filtra '+esc(c)+'" value="'+esc(F[T.id+ci]||'')+'"></th>';}).join('');
  $('#t').innerHTML='<thead><tr>'+T.cols.map((c,ci)=>'<th><button type="button" data-s="'+ci+'">'+esc(c)+' <span class="fr">'+(ord&&ord.c===ci?(ord.d>0?'▲':'▼'):'')+'</span></button></th>').join('')+'</tr><tr class="filtri">'+filtri+'</tr></thead><tbody id="tb"></tbody>';
  righe();
}
function righe(){
  const T=DATI.tabs[tab],q=$('#cerca').value.trim().toLowerCase();
  let R=T.rows.filter(r=>{
    for(let ci=0;ci<T.cols.length;ci++){const f=F[T.id+ci];if(!f)continue;
      if(T.menu.includes(T.cols[ci])){if(valMenu(T,ci,r[ci])!==f)return false;}
      else if(!testo(r[ci]).toLowerCase().includes(f.toLowerCase()))return false;}
    return !q||r.some(c=>testo(c).toLowerCase().includes(q));});
  if(ord)R=[...R].sort((a,b)=>ord.d*testo(a[ord.c]).localeCompare(testo(b[ord.c]),'it',{numeric:true}));
  $('#tb').innerHTML=R.length?R.map(r=>'<tr>'+r.map((c,ci)=>{const col=T.cols[ci];
    if(col==='Stato'){const b=statoBase(c);return '<td class="larga"><span class="chip '+chipCls(b)+'">'+esc(b)+'</span><br>'+md(c)+'</td>';}
    const cls=T.larga.includes(col)?'larga':(col==='ID'||col==='Versione'?'id':'');
    return '<td class="'+cls+'">'+md(c)+'</td>';}).join('')+'</tr>').join(''):'<tr><td class="vuoto" colspan="'+T.cols.length+'">Nessuna riga con questi filtri. Usa «Azzera filtri».</td></tr>';
  $('#conta').textContent=R.length+' di '+T.rows.length+' righe';
}
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;tab=+b.dataset.i;ord=null;try{localStorage.setItem('gov-tab',tab);}catch(err){}disegna();});
$('#t').addEventListener('input',e=>{const c=e.target.dataset.c;if(c==null)return;F[DATI.tabs[tab].id+c]=e.target.value;righe();});
$('#t').addEventListener('click',e=>{const b=e.target.closest('button[data-s]');if(!b)return;const c=+b.dataset.s;ord=ord&&ord.c===c?(ord.d>0?{c,d:-1}:null):{c,d:1};disegna();});
$('#cerca').addEventListener('input',righe);
$('#azzera').addEventListener('click',()=>{for(const k in F)delete F[k];$('#cerca').value='';ord=null;disegna();});
$('#meta').textContent='CPM '+DATI.meta.ver+' · commit '+DATI.meta.commit+' · generata '+DATI.meta.quando;
disegna();
</script>
`;
const out = path.join(ROOT, 'docs/governo/governo.html');
fs.writeFileSync(out, html);
console.log(`governo.html: backlog ${bRows.length} (aperte ${aperte.rows.length}, chiuse ${chiuse.rows.length}) · lotti ${lotti.rows.length} · registro ${rRows.length} · ${Math.round(html.length / 1024)} KB`);
