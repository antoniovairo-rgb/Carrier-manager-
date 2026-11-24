#!/usr/bin/env python3
"""Posizione in coda delle voci aperte del BACKLOG (decisione PO 23/11 00:25: «In coda con la posizione»).

Lo stato di una voce aperta che nessun giro sta lavorando diventa «IN CODA · n° K — <dettaglio>»; la colonna Lotto
diventa «in coda». La versione compare solo quando un giro ci lavora («IN CORSO — <versione>») o e' uscita («FATTO —
<versione>»): niente piu' etichette «— 206» spostate in blocco a ogni rilascio.

Ordine (priorita' del PO, DECISIONI 22/11 17:20):
  1. velocita' dei rilasci, nell'ordine dichiarato;
  2. chiarezza delle schermate, nell'ordine dichiarato;
  3. difetti nell'ordine AREA3 confermato dal PO il 23/11 (A partita, B carriera, C Primavera, D scene 3D);
  4. il resto per ordine di arrivo;
  5. le idee dei questionari di novembre (PO-381…PO-447), per ordine di arrivo.
Non toccate: IN CORSO, FATTO e CHIUSO/A (da spostare nello storico). Idempotente: si rilancia dopo ogni modifica del BACKLOG.
Uso: python3 tools/coda-backlog.py
"""
import re, pathlib

P = pathlib.Path(__file__).resolve().parent.parent / 'docs/governo/BACKLOG.md'
AREA1 = [630, 624, 621, 620, 610, 603]
AREA2 = [623, 608, 609, 606, 617, 615, 614, 595, 616, 569, 570, 618, 622]
IDEE = range(381, 448)
# area 3, ordine confermato dal PO il 23/11 07:10 («A, B, C, D»): A partita · B carriera · C Primavera · D scene 3D
AREA3 = [629, 587, 611, 585, 376, 561, 599, 607, 613, 522, 557, 586, 463, 462, 356, 625, 612, 531, 526, 533, 593, 591, 554, 505, 525]
TESTA = re.compile(r'^(?:IN CODA · n° \d+|(?:DA FARE|IN CODA|DA DECIDERE|DA VERIFICARE|DA MISURARE)(?: — \d+)?)\s*(?:—\s*)?')


def rango(n):
    if n in AREA1: return (1, AREA1.index(n))
    if n in AREA2: return (2, AREA2.index(n))
    if n in AREA3: return (3, AREA3.index(n))
    if n in IDEE: return (5, n)
    return (4, n)


def main():
    L = P.read_text().split('\n')
    s = next(i for i, l in enumerate(L) if l.startswith('## Voci aperte'))
    e = next(i for i in range(s + 1, len(L)) if L[i].startswith('## '))
    righe = []
    for i in range(s, e):
        l = L[i]
        if not l.startswith('| PO-'): continue
        c = l.split('|')
        st = c[5].strip()
        if st.startswith(('IN CORSO', 'FATTO', 'CHIUS', 'DA VERIFICARE DAL PO')) or re.match(r'IN CODA · n° \d+ — DAL PO', st): continue  # chiuse o in attesa del collaudo del PO  # le voci chiuse vanno nello storico, non in coda
        righe.append((rango(int(c[1].strip()[3:])), i))
    righe.sort()
    for k, (_, i) in enumerate(righe, 1):
        c = L[i].split('|')
        st = c[5].strip()
        if st.startswith('PARZIALE'):
            # PO 23/11: «parziale» non dice nulla → in coda con la posizione, e la parte gia' uscita scritta per esteso
            st = re.sub(r'^PARZIALE(?: · in coda n° \d+)*\s*—?\s*', '', st)
            st = re.sub(r'resta per la \d+', 'resta', st)
            nuovo = f'IN CODA · n° {k} — già uscita una parte: {st}'
        else:
            resto = TESTA.sub('', st).strip()
            resto = re.sub(r'^\((.*)\)$', r'\1', resto)
            nuovo = f'IN CODA · n° {k}' + (f' — {resto}' if resto else '')
        c[5] = f' {nuovo} '
        c[6] = ' in coda '
        L[i] = '|'.join(c)
    P.write_text('\n'.join(L))
    print(f'in coda: {len(righe)}')


if __name__ == '__main__':
    main()
