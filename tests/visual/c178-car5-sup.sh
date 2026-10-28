#!/bin/bash
# Supervisore: rilancia il ciclo di carriera da ultimo salvataggio se muore (crash/watchdog); si ferma al ritiro (10) o a STUCK (4).
cd "$(dirname "$0")"
SC=${C178_SCR:-/tmp/claude-0/-home-user-Carrier-manager-/a0f17158-39e0-5c25-a099-08d6e73df7ad/scratchpad}
DATI=../../docs/collaudi/dati-carriera-178-5
N=0
while true; do
  N=$((N+1))
  M=$(node -e "try{const p=JSON.parse(require('fs').readFileSync('$DATI/progress.json'));console.log(p.matchIdx+' '+p.conta.n)}catch(e){console.log('0 0')}")
  MI=${M% *}; CN=${M#* }
  echo "[sup] avvio #$N matchIdx=$MI conta=$CN $(date +%T)" >> $SC/sup.log
  cp $SC/stato-corrente.json $SC/stato-resume.json
  C178_STATO=$SC/stato-resume.json C178_MATCHIDX=$MI C178_CONTA=$CN CPM_CHROME=/opt/pw-browsers/chromium node c178-car5-carriera.mjs >> $SC/run.log 2>&1
  RC=$?
  echo "[sup] uscita rc=$RC $(date +%T)" >> $SC/sup.log
  if [ $RC -eq 10 ] || [ $RC -eq 4 ]; then break; fi
  if [ $N -ge 60 ]; then break; fi
  sleep 3
done
