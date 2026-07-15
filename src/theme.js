/* ============================================================================
   CPM — DESIGN TOKENS (theme.js)  ·  Fase 2  ·  UNICA FONTE DI VERITA'
   ----------------------------------------------------------------------------
   Ogni valore qui e' ESTRATTO da CARRIER-MANAGER-AV.html (riferimento a riga nel
   commento). Nulla e' inventato: dove un valore non e' deducibile dal codice, il
   campo dice "DA CONFERMARE". Meccanismo = valori JS (il gioco usa style inline).

   NB adattamento repo: il gioco e' single-file (nessun bundler) → questi TOKENS
   verranno INLINE-ati nell'HTML in fase di integrazione (blocco const TOKENS).
   Qui il file espone TOKENS come oggetto + su window (per il prototipo standalone).

   ------------------------------  REGOLE D'USO  ------------------------------
   1. SUPERFICIE:
      - LIGHT  = contenuti (Home, Classifica, Mercato, Post-partita, modali dati).
      - DARK   = superficie cinematica (Match view, Gala/premi, "La tua storia").
        La DARK cinematica piu' profonda e' `surfaces.cinematic` (#050810, match).
      Un componente riceve la superficie attiva; non decide da solo il tema.
   2. COLORE SEMPRE SEMANTICO, MAI DECORATIVO:
      - brand (bordeaux) = SOLO accento di marca (nav attiva, CTA primaria, header
        giocatore, banner "Sostieni"). Non usarlo per stati.
      - success=verde SOLO conferma/positivo · danger=rosso SOLO errore/negativo ·
        warning=oro/arancio SOLO attenzione/highlight · info=blu SOLO informativo ·
        neutral SOLO testo/bordi/sfondi neutri.
      - outcome.win/draw/loss SOLO per risultati partita (ResultRow, tabelloni).
   3. NUMERI / STAT: colore = semantico del SIGNIFICATO (crescita→success, calo→
      danger, energia→info…) oppure neutro. Mai un colore decorativo arbitrario.
   4. CTA — UNA sola primaria per vista: `brand`. `success` e `danger` sono azioni
      confermativa/distruttiva, NON primarie. (Oggi convivono primary/green/gold:
      Btn righe 6658-6666 → in migrazione resta la sola primaria brand.)
   5. Testo sopra un fondo pieno (solid) = `on` del semantico corrispondente.
   6. Radius/spacing/tipografia SEMPRE dalle scale sotto (niente literal inline).
   ============================================================================ */

const TOKENS = {

  /* -- BRAND (bordeaux) — TH.primary/primaryDk riga 270; tint/border riga 289 -- */
  brand: {
    base:    "#8e1f33",  // TH.primary        (270)
    dark:    "#6a1326",  // TH.primaryDk      (270)
    tint:    "#f7e9ec",  // TH.primaryTint    (289)  fondo tenue selezione
    border:  "#e3c3cb",  // TH.primaryBorder  (289)
    on:      "#ffffff",  // testo su brand pieno — Btn color:"#fff" (6659)
  },

  /* -- SUPERFICI LIGHT — TH righe 267-269, 284 -- */
  surfaces: {
    light: {
      bg0:    "#f0f7ff",         // TH.bg       (267)  pagina/sfondo app
      bg1:    "#f4f7fb",         // TH.surface2 (284)  sezione/riga zebra
      bg2:    "#ffffff",         // TH.card / surface3 (268/284) card in rilievo
      text:   "#1e293b",         // TH.text     (269)
      text2:  "#64748b",         // TH.muted    (269)
      muted:  "#94a3b8",         // TH.faint    (269)
      border: "#e6edf5",         // TH.divider  (284)  (card = #dde6f0, 268)
      scrim:  "rgba(15,23,42,0.45)", // TH.scrim (284)
    },
    /* -- SUPERFICI DARK (tema toggle) — TH_DARK righe 301, 309-310 -- */
    dark: {
      bg0:    "#0f172a",         // TH_DARK.bg       (301)
      bg1:    "#172033",         // TH_DARK.surface2 (309)
      bg2:    "#1e293b",         // TH_DARK.card     (301)  (surface3 #21304a, 309)
      text:   "#f1f5f9",         // TH_DARK.text     (301)
      text2:  "#94a3b8",         // TH_DARK.muted    (301)
      muted:  "#64748b",         // TH_DARK.faint    (301)
      border: "#2c3a52",         // TH_DARK.divider  (309)  (cardBorder #334155, 301)
      scrim:  "rgba(0,0,0,0.62)",// TH_DARK.scrim    (309)
    },
    /* -- DARK CINEMATICA (match / gala / intro) — hardcoded nel gioco -- */
    cinematic: {
      bg0:    "#050810",         // match container/setClearColor (10508-10509, 13811, 14449)
      text:   "#ffffff",         // HUD match su fondo scuro (uso diffuso)
      // I sottotoni HUD (rgba bianco) restano dal gioco — DA CONFERMARE se tokenizzare.
    },
  },

  /* -- SEMANTIC — solid (271-272) · tint fg/bg/bd LIGHT (275-278) + DARK (303-307)
        · on = testo su solid (Btn 6659-6660). "info.solid" = uso #2563eb (36 occ). -- */
  semantic: {
    success: { solid:"#16a34a", on:"#ffffff", // 271 / 6660
      light:{ fg:"#166534", bg:"#f0fdf4", bd:"#bbf7d0" },   // txGreen/bgGreen/bdGreen (276)
      dark: { fg:"#86efac", bg:"#102b1d", bd:"#1d4d33" } }, // (304)
    danger:  { solid:"#dc2626", on:"#ffffff", // 271
      light:{ fg:"#b91c1c", bg:"#fff1f2", bd:"#fecaca" },   // txRed/bgRed/bdRed (277)
      dark: { fg:"#fca5a5", bg:"#2c1518", bd:"#5b2530" } }, // (305)
    warning: { solid:"#d97706", on:"#ffffff", // TH.warning (271)
      light:{ fg:"#92400e", bg:"#fef3c7", bd:"#fcd34d" },   // txAmber/bgAmber/bdAmber (278)
      dark: { fg:"#fcd34d", bg:"#2a1f0c", bd:"#5a430f" } }, // (306)
    info:    { solid:"#2563eb", on:"#ffffff", // uso diffuso (36 occ; #1d4ed8 109 occ)
      light:{ fg:"#1e40af", bg:"#eff6ff", bd:"#bfdbfe" },   // txBlue/bgBlue/bdBlue (275)
      dark: { fg:"#93c5fd", bg:"#16233b", bd:"#1e3a5f" } }, // (303)
    neutral: { solid:"#64748b", on:"#ffffff", // TH.muted (269)
      light:{ fg:"#1e293b", bg:"#f4f7fb", bd:"#e6edf5" },   // text/surface2/divider (269/284)
      dark: { fg:"#f1f5f9", bg:"#172033", bd:"#2c3a52" } }, // TH_DARK (301/309)
    /* highlight oro/ambra — colore inline PIU' USATO (#f59e0b, 182 occ) = Btn gold (6665) */
    highlight: { solid:"#f59e0b", grad:"linear-gradient(135deg,#f59e0b,#d97706)", on:"#ffffff",
      gold:"#b45309" /* TH.gold/goldText (272/291) */,
      goldGrad:"linear-gradient(135deg,#f6c04b,#d4922a)" /* TH.goldGrad (291) */ },
  },

  /* -- OUTCOME (risultati) — TH win/draw/loss Fg/Bg/Bd (293-295) + TH_DARK (314-316) -- */
  outcome: {
    win:  { light:{ fg:"#15803d", bg:"#e7f6ec", bd:"#b7e4c4" }, dark:{ fg:"#4ade80", bg:"#12321f", bd:"#1d4d33" } }, // 293 / 314
    draw: { light:{ fg:"#a16207", bg:"#fbf3dd", bd:"#f0dca6" }, dark:{ fg:"#fbbf24", bg:"#2c2410", bd:"#4a3a12" } }, // 294 / 315
    loss: { light:{ fg:"#b91c1c", bg:"#fbe9e9", bd:"#f3c9c9" }, dark:{ fg:"#f87171", bg:"#331519", bd:"#5b2530" } }, // 295 / 316
  },

  /* -- SPACING (griglia 4pt) — SP riga 324 (spec: 4/8/12/16/24/32) -- */
  spacing: { xs:4, sm:8, md:12, lg:16, xl:24, xxl:32 }, // SP.xs/sm/md/lg/xxl/xxxl (324)

  /* -- RADIUS — RAD riga 325 (spec: sm/md/lg/pill) -- */
  radius: { sm:8, md:12, lg:16, pill:999 }, // RAD.sm/md/lg/pill (325)
  // NB valori attualmente fuori scala nelle primitive: Card 14 (6651), Btn 10 (6669),
  //    Notif 40 (6684) → in migrazione convergono su radius.md/sm/pill. (documentato)

  /* -- SHADOW (3 livelli) — TH.el1/el2/el3 LIGHT (287) + TH_DARK (311) -- */
  shadow: {
    light: { s1:"0 2px 12px rgba(0,0,0,0.07)", s2:"0 4px 16px rgba(0,0,0,0.10)", s3:"0 12px 40px rgba(0,0,0,0.18)" }, // 287
    dark:  { s1:"0 2px 12px rgba(0,0,0,0.4)",  s2:"0 4px 16px rgba(0,0,0,0.5)",  s3:"0 12px 48px rgba(0,0,0,0.6)"  }, // 311
  },

  /* -- TYPOGRAPHY -- */
  typography: {
    family:   "-apple-system,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif", // body (89/116)
    familyNum:"inherit + .cpm-num (tabular-nums)", // le cifre usano la classe .cpm-num (head CSS) — DA CONFERMARE la regola esatta
    familyDisplay:"'KWScript','Segoe Script','Snell Roundhand','Apple Chancery',cursive", // logo/wordmark (121)
    // scala size — FS riga 322
    size:   { caption:11, small:12, body:13, bodyLg:15, subhead:17, title:20, h:24, display:32, displayLg:44, hero:64 }, // FS (322)
    // pesi — FW riga 323
    weight: { regular:400, medium:500, semibold:600, bold:700, black:800 }, // FW (323)
    // REGOLA UNICA letter-spacing (oggi 0.5/1/1.5/2/3 misti): label uppercase = wide;
    // corpo = normal. wide=1.5 e' il valore piu' usato (129 occ).
    tracking: { normal:0, wide:1.5, wider:2 }, // 1.5 (129 occ) · 2 (47 occ)
  },

  /* -- Z-INDEX — dai valori usati nel gioco -- */
  zIndex: {
    base:    1,     // zIndex:1 (uso diffuso)
    overlay: 3,     // vignette/overlay leggeri (zIndex:2/3)
    sticky:  16,    // barre sticky (zIndex:16, 4 occ)
    dropdown:60,    // menu/nav flottanti (zIndex:60, 3 occ)
    modal:   9998,  // dietro il toast (zIndex:9998, 9 occ)
    toast:   9999,  // Notif/modali in primo piano (Notif 6684; zIndex:9999, 11 occ)
    top:     99999, // massimo (zIndex:99999, 3 occ)
  },

  /* -- MOTION — MO riga 326 (per transizioni/animazioni) -- */
  motion: {
    fast:120, base:200, slow:320, cine:550, // MO (326)
    easeStd:"cubic-bezier(.2,0,0,1)", easeOut:"cubic-bezier(0,0,.2,1)", easeIn:"cubic-bezier(.4,0,1,1)", // MO (326)
  },
};

/* export universale: prototipo standalone (window) + eventuale require -- */
if (typeof window !== "undefined") window.TOKENS = TOKENS;
if (typeof module !== "undefined" && module.exports) module.exports = { TOKENS };
