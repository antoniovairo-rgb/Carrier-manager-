#!/usr/bin/env bash
# [giro 184 — 180d] rifa' assets/cgtrader-clip-rohr.glb dall'elenco clip-184.txt. $1 = cartella con p05/ e p04/ (FBX UE5 estratti
# dagli zip del PO, FUORI dal repo), $2 = GLB d'uscita. Serve Python con bpy (pip install bpy, Python 3.13) in $CPM_PY.
set -euo pipefail
QUI="$(cd "$(dirname "$0")" && pwd)"; RADICE="$(cd "$QUI/../.." && pwd)"
A=(); while read -r f n; do [[ -z "$f" || "$f" == \#* ]] && continue; A+=("$1/${f}_ue5.fbx" "$n"); done < "$QUI/clip-184.txt"
"${CPM_PY:-python3}" -I "$QUI/riadatta_rohr.py" -- "$RADICE/assets/cgtrader-review-lod1-kit-adapter.glb" "$2" "${A[@]}"
