/* AI VISION REVIEW (LIVE_MATCH_QA_SPEC cap. 3.9 + AI_VISION_REVIEW.md), slice headless
   Revisore percettivo di SECONDO LIVELLO: analizza gli screenshot del canvas con un
   modello vision e produce recognition + score (readability/cinematic/motion/footballIQ)
   + verdict. **NON blocca MAI la CI** (charter + spec): è opt-in e si ATTIVA solo se è
   presente una API key in env. Senza chiave → skip pulito (gate 10/10 invariato).
   Provider-agnostic: default Anthropic (Claude vision); override via env.

   Attivazione:
     CPM_VISION_API_KEY = <api key>        (oppure ANTHROPIC_API_KEY)
     CPM_VISION_MODEL   = claude-haiku-4-5-20251001   (default; override possibile)
     CPM_VISION_PROVIDER= anthropic        (default)
   Rete: la chiamata esce in HTTPS verso il provider → l'eventuale HTTPS_PROXY è onorato. */
import fs from 'node:fs';
import path from 'node:path';

const PROVIDER = process.env.CPM_VISION_PROVIDER || 'anthropic';
const API_KEY = process.env.CPM_VISION_API_KEY || process.env.ANTHROPIC_API_KEY || '';
const MODEL = process.env.CPM_VISION_MODEL || 'claude-haiku-4-5-20251001';

export function visionEnabled() { return !!API_KEY; }

// dispatcher proxy-aware (best-effort): il fetch globale (undici) onora `dispatcher`
let _dispatcher; let _dispatcherTried = false;
async function dispatcher() {
  if (_dispatcherTried) return _dispatcher;
  _dispatcherTried = true;
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (proxy) { try { const { ProxyAgent } = await import('undici'); _dispatcher = new ProxyAgent(proxy); } catch (_e) { /* undici assente: fetch diretto */ } }
  return _dispatcher;
}

async function callAnthropic(b64, prompt) {
  const opts = {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 700,
      messages: [{ role: 'user', content: [
        { type: 'image', source: { type: 'base64', media_type: 'image/png', data: b64 } },
        { type: 'text', text: prompt },
      ] }],
    }),
  };
  const d = await dispatcher(); if (d) opts.dispatcher = d;
  const res = await fetch('https://api.anthropic.com/v1/messages', opts);
  if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + (await res.text()).slice(0, 200));
  const j = await res.json();
  return (j.content || []).map(c => c.text || '').join('');
}

const PROMPT = sit => `Sei il revisore QA percettivo di un motore di Live Match calcistico 3D. Osserva SOLO questo frame congelato.
Situation attesa: "${sit.text}" (intent: ${sit.intent || '?'}).
Valuta se il frame rappresenta in modo CREDIBILE e LEGGIBILE l'azione attesa.
Rispondi con SOLO un JSON valido (nessun testo fuori dal JSON), schema esatto:
{"recognizedAction":"<cosa accade nel frame, breve>","matchesExpected":true|false,"readability":0-100,"cinematic":0-100,"motion":0-100,"footballIQ":0-100,"verdict":"PASS"|"WARNING"|"FAIL"|"BLOCKED","notes":"<max 180 char>"}`;

function parseJson(t) { try { const m = t.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } catch (_e) { return null; } }

export async function runAiVision(outDir, samples, { max = 6 } = {}) {
  if (!API_KEY) return { skipped: true, reason: 'CPM_VISION_API_KEY non impostata', provider: PROVIDER };
  const results = []; let errors = 0;
  for (const s of samples.slice(0, max)) {
    if (!s.shot) continue;
    try {
      const b64 = fs.readFileSync(path.join(outDir, s.shot)).toString('base64');
      const txt = (PROVIDER === 'anthropic') ? await callAnthropic(b64, PROMPT(s)) : '';
      const v = parseJson(txt) || { verdict: 'BLOCKED', notes: 'parse JSON fallito', raw: txt.slice(0, 160) };
      results.push({ gi: s.gi, ...v });
    } catch (e) { errors++; results.push({ gi: s.gi, verdict: 'BLOCKED', notes: 'errore: ' + String(e.message || e).slice(0, 160) }); }
  }
  const scored = results.filter(r => typeof r.readability === 'number');
  const avg = k => scored.length ? +(scored.reduce((s, r) => s + (r[k] || 0), 0) / scored.length).toFixed(1) : null;
  const summary = {
    skipped: false, provider: PROVIDER, model: MODEL, count: results.length, errors,
    avg: { readability: avg('readability'), cinematic: avg('cinematic'), motion: avg('motion'), footballIQ: avg('footballIQ') },
    verdicts: results.reduce((m, r) => { m[r.verdict] = (m[r.verdict] || 0) + 1; return m; }, {}),
    results,
  };
  fs.writeFileSync(path.join(outDir, 'ai-vision.json'), JSON.stringify(summary, null, 2));
  return summary;
}
