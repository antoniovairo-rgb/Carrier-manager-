# Coda dei rapporti Codex da lavorare

Messaggi di Codex messi in coda dal PO. Ogni rilievo resta un'ipotesi finché il team non lo riproduce.

## 04/10/2026 — Allineamento, base CPM 7.999.128 (in coda, non ancora lavorato)

- **Banco 7.999.105 archiviato** (decisione PO 03/10): nota pubblicata su `codex/2026-10-02-banco-deterministico`, commit `f6d96723` (verificato dal team con `git ls-remote`).
- **Ramo attivo:** `codex/2026-10-04-po077-7999128`, commit `e0bc7e9b` (verificato), creato da main `fba48b4e` (7.999.128). Nessun file del gioco modificato.
- **PO-077:** i 6 casi validi di gi64 (7.999.122) restano il riferimento. Catalogo attuale: gi86 testa all'indice 0; gi90 indici 0-2; gi171 indici 0-1. **gi86 sulla 7.999.128 non verificata:** Chrome ed Edge (D3D11, GLB acceso) sotto 3 GB liberi durante il caricamento, nessuna foto.
- **Passaggi 3D:** sonda adattata alla 7.999.128; scena 38 fermata a 2,94 GB liberi prima di scoprire le azioni: zero casi validi, codici 005/014/012/011 non verificati.
- **Restano:** gi86 e gi90 (3 success + 3 fail), rosso gi171 (3 giri), passaggi 3D, difesa 3D sulla build attuale.
- **Rapporti:** `reports/codex/2026-10-04-po077-7999128.md`, `reports/codex/2026-10-04-passaggi-7999128.md`.
- **Blocco:** memoria del computer del collaudatore. Codex mantiene la soglia di 3 GB indicata dal PO; per misure valide serve più memoria libera all'avvio del singolo caso.

Da fare dal team quando si riprende: leggere i due rapporti dal ramo `e0bc7e9b`; valutare se i casi di testa si possono misurare nella sessione cloud del team (15 GB) invece che sul computer del collaudatore.
