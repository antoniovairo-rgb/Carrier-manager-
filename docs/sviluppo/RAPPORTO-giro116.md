# RAPPORTO giro 116 — lotto 7.999.184, parte tecnica di PO-322 (uscita Google Play)

Ramo `sviluppo/giro116-store` (da `lavoro/184`). Dettaglio, numeri e prove: `docs/governo/USCITA-STORE-184.md` §6 (tabella aggiornata) e §9.

| # | Punto del mandato | Esito |
|---|---|---|
| 1 | Target API 36 | Capacitor 8.6.0 (target/compileSdk 36, minSdk 24, JDK 21, Node 22); workflow e doc aggiornati |
| 2 | `assets/source/` e non referenziati fuori da `dist/` | 348 → 138 MB (298 → 107 MB tar.gz); `validate-dist` verde, 45/45 asset di una partita presenti |
| 3 | Icona 512 con alfa | RGBA 512×512, 25 KB (generatore corretto) |
| 4 | `TESTER_ONBOARDING.md` | ID `com.korward.elite`; passi da Google answer/14151465, riletta il 07/11/2026 |
| 5 | `audit-copyright` | 0 hit |
| 6 | Link privacy in app | **assente**: va messo in Crediti/Opzioni (non aggiunto) |
| 7 | AAB | **costruito, non firmato**, 109.731.296 B, minSdk 24/targetSdk 36 (da manifest fuso); 2 tentativi su 3 falliti per HTTP 429 di Maven Central via proxy; bundletool non scaricato (negato) |
| 8 | Ripetizione verifiche | `check-src` allineato · `validate-dist` · `test:logic` 43/43 · `save-compat` 12/0 |

Non fatto / limiti: workflow CI non eseguito; nessuna firma; nessuna prova su telefono; sonda asset su una sola partita; privacy in app e bottone PayPal restano decisioni/lavori per il giro successivo. Nessun file di `src/` toccato.
