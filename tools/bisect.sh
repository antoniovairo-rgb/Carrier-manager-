#!/usr/bin/env bash
# TROVA LA RELEASE CHE HA CAMBIATO UN NUMERO — `tools/bisect.sh <sonda> <regex> [n]`
#
# Collaudo PO: «non c'e' modo di ottimizzare anche 2 e 3?» — cioe' capire QUALE codice e' il colpevole,
# e aspettare meno. Questa e' la leva sul primo: oggi due casi su tre sono stati risolti misurando una
# versione vecchia e guardando dove il numero e' cambiato — la doppia conversione dei colori (7.529) e
# l'accentramento del gioco (7.546). Fatto a mano ogni volta; qui diventa uno strumento.
#
#   tools/bisect.sh possesso "fascia centrale" 6     ultime 6 release
#   tools/bisect.sh giro "RETTILINEIT" 8
#
# Gira la sonda su ogni release risalendo la storia e stampa il numero accanto alla versione: la riga in
# cui il numero salta E' la release colpevole. Non giudica: mostra la serie.
set -u
SONDA="${1:?sonda: nome npm run o file .mjs}"
FILTRO="${2:?regex della riga da estrarre}"
N="${3:-6}"
REPO="$(cd "$(dirname "$0")/.." && pwd)"
CHROME="${CPM_CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}"
cd "$REPO"
COMMITS=$(git log --oneline --format='%h %s' | grep -E '^\w+ 7\.[0-9]+\.[0-9]+ —' | head -"$N" | awk '{print $1}')
echo "=== BISECT · sonda '$SONDA' · filtro '$FILTRO' · $N release ==="
for c in $COMMITS; do
  V=$(git show "$c:CARRIER-MANAGER-AV.html" 2>/dev/null | grep -o 'const GAME_VERSION="[0-9.]*"' | head -1 | grep -o '[0-9][0-9.]*')
  W="/tmp/bisect-$c"
  rm -rf "$W"; cp -a "$REPO" "$W" >/dev/null 2>&1
  git -C "$W" checkout -q "$c" -- CARRIER-MANAGER-AV.html 2>/dev/null
  if [ -f "$W/tests/visual/$SONDA" ]; then CMD="node $SONDA"; else CMD="npm run --silent $SONDA"; fi
  OUT=$(cd "$W/tests/visual" && CPM_CHROME="$CHROME" timeout 1200 $CMD 2>&1 | grep -E "$FILTRO" | head -3)
  printf '  %-10s %s\n' "$V" "$(echo "$OUT" | tr '\n' ' | ')"
  rm -rf "$W"
done
echo "=== la riga in cui il numero SALTA e' la release colpevole ==="
