# Coda dei rapporti Codex da lavorare

Messaggi di Codex messi in coda dal PO. Ogni rilievo resta un'ipotesi finché il team non lo riproduce.

## 04/10/2026 — Allineamento, base CPM 7.999.128 (letto dal team il 05/10)

- **Banco 7.999.105 archiviato** (decisione PO 03/10): nota pubblicata su `codex/2026-10-02-banco-deterministico`, commit `f6d96723` (verificato dal team con `git ls-remote`).
- **Ramo attivo:** `codex/2026-10-04-po077-7999128`, commit `e0bc7e9b` (verificato), creato da main `fba48b4e` (7.999.128). Nessun file del gioco modificato.
- **PO-077:** i 6 casi validi di gi64 (7.999.122) restano il riferimento. Catalogo attuale: gi86 testa all'indice 0; gi90 indici 0-2; gi171 indici 0-1. **gi86 sulla 7.999.128 non verificata:** Chrome ed Edge (D3D11, GLB acceso) sotto 3 GB liberi durante il caricamento, nessuna foto.
- **Passaggi 3D:** sonda adattata alla 7.999.128; scena 38 fermata a 2,94 GB liberi prima di scoprire le azioni: zero casi validi, codici 005/014/012/011 non verificati.
- **Restano:** gi86 e gi90 (3 success + 3 fail), rosso gi171 (3 giri), passaggi 3D, difesa 3D sulla build attuale.
- **Rapporti:** `reports/codex/2026-10-04-po077-7999128.md`, `reports/codex/2026-10-04-passaggi-7999128.md`.
- **Blocco:** memoria del computer del collaudatore. Codex mantiene la soglia di 3 GB indicata dal PO; per misure valide serve più memoria libera all'avvio del singolo caso.

Da fare dal team quando si riprende: leggere i due rapporti dal ramo `e0bc7e9b`; valutare se i casi di testa si possono misurare nella sessione cloud del team (15 GB) invece che sul computer del collaudatore.

**Lettura del team, 05/10** (ramo scaricato, `git log` fino a `e0bc7e9b`; letti `reports/codex/2026-10-04-po077-7999128.md` e `2026-10-04-passaggi-7999128.md`):
- I due rapporti confermano quanto riassunto sopra: **nessuna misura valida** sulla 7.999.128. PO-077 gi86: `valid:false`, `lowMemory:true`, 0 fotogrammi, sia con Chrome (3,510 GiB liberi all'avvio) sia con Edge (4,033 GiB). Passaggi: `discovery:0`, `cases:0`.
- Nulla da riprodurre: non ci sono rilievi sul gioco, solo tentativi non validi dichiarati come tali.
- **Discrepanza da chiarire col PO:** il rapporto parla di una soglia di **3 GiB** «indicata dal PO»; il prompt del team del 04/10 (`docs/governo/prompt/codex-2026-10-04b-ripresa.md`) dice **6 GB**. Non posso confermare quale valore il PO abbia comunicato a Codex.
- Proposta: le scene di testa (gi86, gi90, rosso gi171) si possono misurare nella sessione cloud del team, che non ha il limite di memoria; serve il via del PO, perché finora PO-077 è stato affidato a Codex.

## 06/10/2026 — Passaggio di consegne (decisione PO)

Il PO ha deciso: «le vecchie attività di collaudo in sospeso collaudale tu, ripartirà da questi nuovi collaudi».

- **Codex** riparte da zero con il prompt delle zone ferme (DECISIONI 06/10):
  - A: PO-209/216, tabellino;
  - B: PO-048/127, camera;
  - C: PO-210, fisarmoniche del post-partita;
  - D: PO-203, piedi nell'esultanza.
- **Il team** si prende i collaudi rimasti in sospeso:
  1. PO-077: colpi di testa gi86 e gi90 (3 riusciti + 3 falliti) e il rosso di gi171 (3 giri). Prima della 7.999.143 nessuna misura era valida.
  2. Passaggi 3D, conferma dei codici 005/014/012/011 (PO-147, scena 38).
  3. Difesa 3D sulla build attuale: ipotesi 001 «apertura» e 002 «fuori quadro» di PO-185 (gi138, gi36, gi45, gi133f, gi168f, gi31f, gi32, gi36s), dentro PO-123.
  4. PO-143: taccuino #64, #126, #18.
  5. PO-153, fase 1 carriere: 30 carriere × 10 stagioni con la scheda estesa (`reports/codex/PROMPT-2026-10-01-carriere-fase1-completa.md`). Sblocca PO-098 e PO-154…157 (L6).
- **Ordine:** prima le voci di L1 (1-4), poi la fase 1 carriere (L6).
- **Regola:** nessuna catena va interrotta. Le sonde pesanti girano solo fra una catena e l'altra.
