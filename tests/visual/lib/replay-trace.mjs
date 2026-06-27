/* LMQP-10 — REPLAY TRACE (LIVE_MATCH_QA_SPEC cap. 3.5), slice headless
   Persiste la TRACCIA per-frame dello stato (camera/palla/giocatori/fase) già
   campionata dal pass post-highlight, che altrimenti veniva ridotta ad aggregati
   e scartata. Primo artefatto concreto del Replay Engine: stato replayabile
   frame-by-frame (out/validate/replay/sit_NNN.json), referenziato dal run-summary.
   Additivo: scrive solo file di traccia, non tocca il gate. */
import fs from 'node:fs';
import path from 'node:path';

const r2 = n => (n == null ? null : +n.toFixed(2));

export function writeReplayTrace(outDir, sample) {
  const dir = path.join(outDir, 'replay');
  fs.mkdirSync(dir, { recursive: true });
  const rel = `replay/sit_${String(sample.gi).padStart(3, '0')}.json`;
  const frames = (sample.frames || []).map(f => ({
    cam: f.cam ? { x: r2(f.cam.x), y: r2(f.cam.y), z: r2(f.cam.z) } : null,
    ball: f.ball ? { x: r2(f.ball.x), y: r2(f.ball.y), z: r2(f.ball.z) } : null,
    players: f.players ? f.players.map(p => [r2(p.x), r2(p.y)]) : null,
    phase: f.phase || null,
  }));
  fs.writeFileSync(path.join(outDir, rel), JSON.stringify({ gi: sample.gi, durMs: sample.durMs, frameCount: frames.length, frames }));
  return { gi: sample.gi, file: rel, frames: frames.length, durMs: sample.durMs };
}
