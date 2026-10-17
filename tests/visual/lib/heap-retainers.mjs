/* [giro 53 PO-275] Percorso piu' corto dalle radici del GC agli oggetti di un costruttore dato, da uno snapshot .heapsnapshot di
   Chromium. Lettura a flusso dei numeri (lo snapshot di una pagina da 500 MB supera la stringa massima di V8). Archi deboli esclusi.
   Uso: node lib/heap-retainers.mjs <file.heapsnapshot> <NomeCostruttore> [maxPercorsi] */
import fs from 'fs';
const [file, nome, maxP = '4'] = process.argv.slice(2);
const buf = fs.readFileSync(file);
const find = (s, from = 0) => buf.indexOf(Buffer.from(s), from);
const iN = find('"nodes":['), iE = find('"edges":[', iN), iS = find('"strings":[', iE);
const meta = JSON.parse(buf.slice(0, iN).toString().replace(/,\s*$/, '') + '}').snapshot.meta;
function nums(start, end) { const out = []; let v = 0, inNum = false; for (let i = start; i < end; i++) { const c = buf[i]; if (c >= 48 && c <= 57) { v = v * 10 + (c - 48); inNum = true; } else if (inNum) { out.push(v); v = 0; inNum = false; } if (c === 93) break; } return Uint32Array.from(out); }
const nodes = nums(iN + 9, iE), edges = nums(iE + 9, iS);
let sEnd = buf.lastIndexOf(Buffer.from(']')); const strings = JSON.parse(buf.slice(iS + 10, sEnd + 1).toString());
const NF = meta.node_fields.length, EF = meta.edge_fields.length;
const nT = meta.node_fields.indexOf('type'), nN = meta.node_fields.indexOf('name'), nEC = meta.node_fields.indexOf('edge_count'), nId = meta.node_fields.indexOf('id');
const eT = meta.edge_fields.indexOf('type'), eNm = meta.edge_fields.indexOf('name_or_index'), eTo = meta.edge_fields.indexOf('to_node');
const nTypes = meta.node_types[nT], eTypes = meta.edge_types[eT];
const N = nodes.length / NF; const first = new Uint32Array(N + 1); for (let i = 0, e = 0; i < N; i++) { first[i] = e; e += nodes[i * NF + nEC]; first[N] = e; }
const ESCL = process.env.CPM_ESCL ? new RegExp(process.env.CPM_ESCL) : null; /* archi da ignorare (per scoprire il trattenitore successivo) */
const ESID = process.env.CPM_ESCLID ? new Set(process.env.CPM_ESCLID.split(',').map(Number)) : null; /* nodi (id dello snapshot) da non attraversare */
const WEAK = eTypes.indexOf('weak'), SHORT = eTypes.indexOf('shortcut');
const par = new Int32Array(N).fill(-1), parE = new Int32Array(N).fill(-1); par[0] = 0;
const q = new Uint32Array(N); let h = 0, t = 0; q[t++] = 0;
while (h < t) { const n = q[h++]; for (let e = first[n]; e < first[n + 1]; e++) { const ty = edges[e * EF + eT]; if (ty === WEAK || ty === SHORT) continue; if (ESCL && (ty === eTypes.indexOf('property') || ty === eTypes.indexOf('context')) && ESCL.test(String(strings[edges[e * EF + eNm]]))) continue; const to = edges[e * EF + eTo] / NF; if (ESID && ESID.has(nodes[to * NF + nId])) continue; if (par[to] === -1) { par[to] = n; parE[to] = e; q[t++] = to; } } }
const label = n => `${nTypes[nodes[n * NF + nT]]}:${strings[nodes[n * NF + nN]].slice(0, 50)}@${nodes[n * NF + nId]}`;
const edgeName = e => { const ty = eTypes[edges[e * EF + eT]]; const v = edges[e * EF + eNm]; return ty === 'element' || ty === 'hidden' ? `[${v}]` : `${ty === 'context' ? 'ctx:' : ''}${String(strings[v]).slice(0, 40)}`; };
/* bersaglio: per nome di costruttore, oppure «prop:a,b» = oggetti che hanno TUTTE queste proprieta' proprie (il bundle minificato rinomina i costruttori) */
const target = []; const PROPS = nome.startsWith('prop:') ? nome.slice(5).split(',') : null;
for (let i = 0; i < N; i++) { if (nTypes[nodes[i * NF + nT]] !== 'object') continue;
  if (PROPS) { const have = new Set(); for (let e = first[i]; e < first[i + 1]; e++) if (eTypes[edges[e * EF + eT]] === 'property') have.add(strings[edges[e * EF + eNm]]); if (PROPS.every(p => have.has(p))) target.push(i); }
  else if (strings[nodes[i * NF + nN]] === nome) target.push(i); }
console.log(`${nome}: ${target.length} oggetti · nodi ${N}`);
for (const n of target.slice(0, +maxP)) { const path = []; let c = n; if (par[c] === -1) { console.log('  irraggiungibile', label(n)); continue; }
  while (c !== 0) { path.push(`${label(c)} ⇐(${edgeName(parE[c])})`); c = par[c]; }
  console.log(`\n== ${label(n)} (profondita' ${path.length})`); path.reverse().forEach(p => console.log('   ' + p)); }
