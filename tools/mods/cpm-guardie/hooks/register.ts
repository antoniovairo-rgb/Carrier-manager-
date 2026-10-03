import type { Register, EngineInterface } from 'claude-code'
import { promuoveSuMain, ricompila, usaPkillF, commitConIdModello, versioneDa, verdettoPromozione, statoLog } from './logica'
import type { Giro } from './logica'

/* Carrier Manager — guardie sui rituali (richiesta PO 03/10: «installiamo / usiamo mod»).
   Regole di CLAUDE.md che prima dipendevano dalla disciplina, ora controllate prima che l'errore avvenga. */
const REPO = '/home/user/cm-poc'
const SRC07 = REPO + '/src/07-versione-save-interviste.jsx'
const STABILITA = REPO + '/docs/governo/STABILITA.json'
const SCRATCH = '/tmp/claude-0/-home-user/394ea3c3-9288-5fc6-bf47-a074e31528b0/scratchpad'

async function catenaInCorso($: EngineInterface): Promise<boolean> {
  try { const r = await $.process.run(['pgrep', '-f', 'ci-runner.mjs']); return r.exitCode === 0 } catch { return false }
}

/* stato della catena: il log piu' recente dello scratchpad (ci*.log), aggiornato ogni 20 s */
async function aggiornaStato($: EngineInterface): Promise<void> {
  try {
    const voci = (await $.fs.list(SCRATCH)).filter(x => x.kind === 'file' && /^ci\d*[a-z]?\.log$/.test(x.name)).sort((a, b) => b.mtimeMs - a.mtimeMs)
    if (!voci.length) { $.ui.status(undefined); return }
    const s = statoLog(await $.fs.read(SCRATCH + '/' + voci[0].name))
    if (s.finito) $.ui.status(s.esito || `catena finita: ${s.verdi} ✅ · ${s.rossi} ❌`)
    else $.ui.status(`catena in corso (${voci[0].name}): ${s.verdi} ✅${s.rossi ? ' · ' + s.rossi + ' ❌' : ''}${s.ultimo ? ' · ultimo: ' + s.ultimo : ''}`)
  } catch { /* lo stato e' un aiuto, mai un errore */ }
}

/* il sorgente e' cambiato dopo l'ultimo commit che ha registrato una catena? (una catena verde vale per il codice che ha collaudato) */
async function sorgenteDopoCatena($: EngineInterface): Promise<string[]> {
  try {
    const rif = (await $.process.run(['git', 'log', '-1', '--format=%H', '--', 'docs/governo/STABILITA.json'], { cwd: REPO })).stdout.trim()
    if (!rif) return []
    const diff = (await $.process.run(['git', 'diff', '--name-only', rif, 'HEAD', '--', 'src/', 'CARRIER-MANAGER-AV.html'], { cwd: REPO })).stdout.trim()
    return diff ? diff.split('\n') : []
  } catch { return [] }
}

export const register: Register = on => {
  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const cmd = e.command || ''
    if (usaPkillF(cmd)) return { deny: `cpm-guardie: «pkill -f» e' vietato (lo schema puo' combaciare col comando stesso e chiudere la shell). Usa pgrep per trovare i PID e kill sui PID.` }
    if (commitConIdModello(cmd)) return { deny: `cpm-guardie: il messaggio di commit contiene un identificativo del modello (claude-…-N). Negli artefatti del repo non va mai.` }
    if (ricompila(cmd) && await catenaInCorso($)) return { deny: `cpm-guardie: una catena di collaudo (ci-runner) e' in corso: durante una catena non si ricompila. Aspetta la riga FINE.` }
    if (promuoveSuMain(cmd)) {
      let giri: Giro[] = []; let src = ''
      try { giri = JSON.parse(await $.fs.read(STABILITA)) } catch {}
      try { src = await $.fs.read(SRC07) } catch {}
      const v = verdettoPromozione(giri, versioneDa(src))
      if (!v.ok) return { deny: `cpm-guardie: promozione su main rifiutata — ${v.perche}. Prima la catena, poi la promozione.` }
      const cambiati = await sorgenteDopoCatena($)
      if (cambiati.length) return { deny: `cpm-guardie: promozione su main rifiutata — dopo l'ultima catena registrata e' cambiato il gioco (${cambiati.slice(0, 4).join(', ')}): serve una catena su questo codice.` }
      $.ui.toast(`cpm-guardie: promozione ammessa (${v.perche})`)
    }
    return next(e)
  })

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'rituali', description: 'Carrier Manager: stato dei rituali (versione, catena, main, roadmap, modifiche non salvate)' })
    $.clock.every(20000, () => aggiornaStato($))
    await aggiornaStato($)
    return next(e)
  })

  on('command.run', { command: 'rituali' }, async $ => {
    const righe: string[] = []
    let src = ''; let giri: Giro[] = []
    try { src = await $.fs.read(SRC07) } catch {}
    try { giri = JSON.parse(await $.fs.read(STABILITA)) } catch {}
    const ver = versioneDa(src)
    righe.push(`Versione sul ramo: ${ver || '?'}`)
    const v = verdettoPromozione(giri, ver)
    righe.push(`Catena per ${ver || '?'}: ${v.ok ? '✅ ' : '❌ '}${v.perche}`)
    const cambiati = await sorgenteDopoCatena($)
    righe.push(cambiati.length ? `❌ Gioco cambiato dopo l'ultima catena registrata: ${cambiati.join(', ')}` : 'Gioco invariato dall\'ultima catena registrata ✅')
    try {
      const head = (await $.process.run(['git', 'rev-parse', 'HEAD'], { cwd: REPO })).stdout.trim()
      const main = ((await $.process.run(['git', 'ls-remote', 'origin', 'refs/heads/main'], { cwd: REPO, timeoutMs: 20000 })).stdout.split(/\s/)[0] || '').trim()
      righe.push(`main remoto: ${main.slice(0, 8) || '?'} · HEAD: ${head.slice(0, 8)} · ${main && main === head ? 'allineati ✅' : 'NON allineati'}`)
      const st = (await $.process.run(['git', 'status', '--short'], { cwd: REPO })).stdout.trim()
      righe.push(`Modifiche non salvate: ${st ? st.split('\n').length : 0}`)
    } catch { righe.push('git: non leggibile') }
    try {
      const rm = await $.fs.read(REPO + '/docs/governo/ROADMAP.md')
      const aperte = rm.split('\n').filter(l => /rituali in corsa/.test(l)).map(l => (l.match(/\*\*(7\.999\.\d+)/) || [])[1] || l.slice(0, 40))
      righe.push(`Righe di roadmap con «rituali in corsa»: ${aperte.length ? aperte.join(', ') : 'nessuna ✅'}`)
    } catch {}
    /* lavori in corso (richiesta PO 03/10: «dove si vede l'avanzamento»): catena e sonde dello scratchpad */
    try {
      const voci = (await $.fs.list(SCRATCH)).filter(x => x.kind === 'file')
      const ci = voci.filter(x => /^ci\d*[a-z]?\.log$/.test(x.name)).sort((a, b) => b.mtimeMs - a.mtimeMs)[0]
      if (ci) { const s = statoLog(await $.fs.read(SCRATCH + '/' + ci.name)); righe.push(`Ultima catena (${ci.name}): ${s.finito ? (s.esito || 'finita') : 'in corso'} · ${s.verdi} ✅ · ${s.rossi} ❌${s.ultimo ? ' · ultimo passo: ' + s.ultimo : ''}`) }
      let viva = false
      try { viva = (await $.process.run(['pgrep', '-f', 'scratchpad/gol190d'])).exitCode === 0 } catch {}
      for (const x of voci.filter(x => /^amp-k\d+\.log$/.test(x.name)).sort((a, b) => a.name.localeCompare(b.name))) {
        const ult = (await $.fs.read(SCRATCH + '/' + x.name)).trim().split('\n').filter(l => /^\d+ pm /.test(l)).pop() || ''
        const ris = (ult.match(/"home":(\d+),"away":(\d+)/) || []).slice(1).join('-')
        righe.push(`Sonda goleade ${x.name.replace('.log', '')} (${viva ? 'in corso' : 'ferma'}): partite fatte ${Number((ult.match(/^\d+/) || ['-1'])[0]) + 1}/30${ris ? ' · ultima: ' + ris : ''}`)
      }
    } catch {}
    return { text: righe.join('\n') }
  })
}
