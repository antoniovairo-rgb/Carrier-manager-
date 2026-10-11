#!/usr/bin/env bash
# Lotto PO-221 T3 (7.999.159): due worker in parallelo, nessun nuovo avvio oltre 230 s, chiamata sotto i 9 min.
cd "$(dirname "$0")"
export CPM_CHROME=/opt/pw-browsers/chromium PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers
DL=$(( $(date +%s%3N) + 230000 ))
W=0 NW=2 KMAX=60 DEADLINE=$DL OUT=po221-t3-159-w0.jsonl node po221-t3-159.mjs > lotto-w0.log 2>&1 &
W=1 NW=2 KMAX=60 DEADLINE=$DL OUT=po221-t3-159-w1.jsonl node po221-t3-159.mjs > lotto-w1.log 2>&1 &
wait
cat lotto-w0.log lotto-w1.log
echo "RIGHE: $(cat po221-t3-159-w*.jsonl 2>/dev/null | wc -l) · FINALI: $(grep -h '"final":true' po221-t3-159-w*.jsonl 2>/dev/null | wc -l)"
