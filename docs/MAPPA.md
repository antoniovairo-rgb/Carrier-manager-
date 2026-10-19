# Mappa del sorgente — Korward Elite 7.999.172

_Generata da `tools/mappa.mjs` su 59.127 righe._

```
node tools/mappa.mjs > docs/MAPPA.md
```

## Stato della partita (useRef)  (149)

Il cuore del motore: ogni ref e' un pezzo di stato che sopravvive ai render.

| riga | |
|---:|---|
| 1008 | `containerRef` = null |
| 13545 | `mountRef` = null |
| 13547 | `propsRef` = props |
| 29865 | `numHLRef` = 0 |
| 29866 | `hlTimesRef` = [] |
| 29938 | `subbedOffRef` = false |
| 29946 | `heroFoulCntRef` = 0 |
| 29947 | `sentOffRef` = false |
| 29948 | `subOffMinRef` = 0 |
| 29949 | `subOffWhyRef` = "" |
| 29950 | `subOffAtRef` = (( |
| 29967 | `tacticBonusRef` = 0 |
| 29970 | `subFiredRef` = false |
| 29972 | `reactiveHLQueueRef` = [] |
| 29973 | `desperateFiredRef` = false |
| 29974 | `earlyDespRef` = false |
| 29975 | `halfFiredRef` = _rsCk138>=45 |
| 30062 | `situationsRef` = situations |
| 30077 | `matchStateRef` = null |
| 30105 | `heatPointsRef` = [] |
| 30107 | `gkDiveRef` = null |
| 30188 | `matchPlayersRef` = null |
| 30277 | `oppTacticRef` = null |
| 30288 | `clockRef` = _rsClock |
| 30291 | `scoreRef` = _rsScore |
| 30292 | `rip202Ref` = null |
| 30293 | `debito202Ref` = 0 |
| 30294 | `ko207Ref` = null |
| 30295 | `golScena235Ref` = 0 |
| 30320 | `wasBehindRef` = false |
| 30396 | `ceremonyEndRef` = null |
| 30422 | `fine977Ref` = false |
| 30551 | `soStateRef` = null |
| 30553 | `soDoneRef` = false |
| 30613 | `hlIdxRef` = 0 |
| 30614 | `handleActionRef` = null |
| 30615 | `handleRigoreRef` = null |
| 30616 | `handleContinueRef` = null |
| 30617 | `_rvwChainOkRef` = true |
| 30620 | `pPosRef` = {x:58,y:50} |
| 30621 | `_contKeyRef` = null |
| 30622 | `_stagedSpotRef` = null |
| 30623 | `deliverRef` = null |
| 30624 | `_dlvSeenRef` = null |
| 30625 | `_batRef` = {arm:null,done:null} |
| 30626 | `meshDefRef` = null |
| 30630 | `voto29Ref` = {k:null,v:null} |
| 30631 | `mStatsSnapRef` = mStats |
| 30632 | `assistLinksRef` = {given:[],received:[]} |
| 30636 | `golSubito85Ref` = 0 |
| 30647 | `possessionRef` = 50 |
| 30649 | `lastShoutRef` = {ck:-99,txt:""} |
| 30651 | `preSp41Ref` = null |
| 30652 | `ballPosRef` = {x:50,y:50} |
| 30653 | `ripresaSemeRef` = null |
| 30659 | `fase161Ref` = null |
| 30672 | `lastBGEvtRef` = [] |
| 30695 | `_lastFlashRef` = 0 |
| 30708 | `cineBusyRef` = null |
| 30709 | `goalCelebRef` = null |
| 30711 | `_celEndRef` = 0 |
| 30713 | `celebRecentRef` = [] |
| 30787 | `outcomeRevealRef` = null |
| 30793 | `streakRef` = 0 |
| 30828 | `_fps907Ref` = [] |
| 30868 | `sceneLogRef` = [] |
| 30938 | `corpiHold232Ref` = false |
| 30939 | `corpiCap232Ref` = {t:0,fatto:false} |
| 31178 | `pressureRef` = 1 |
| 31180 | `defDistRef` = 100 |
| 31181 | `movesLeftRef` = 0 |
| 31182 | `moveCoolRef` = 0 |
| 31183 | `driftTargetsRef` = null |
| 31184 | `ballTargetRef` = {x:50,y:50} |
| 31185 | `ultimaFase964Ref` = '' |
| 31186 | `passi966Ref` = 0 |
| 31187 | `scenaPend964Ref` = 0 |
| 31188 | `ballRngRef` = 0 |
| 31221 | `tramaRef` = null |
| 31235 | `_formRosterRef` = {} |
| 31259 | `kickRef` = 0 |
| 31260 | `kickoffRef` = 0 |
| 31272 | `ripTickRef` = 0 |
| 31285 | `holdArrRef` = 0 |
| 31286 | `pendingBtRef` = null |
| 31287 | `ballLagRef` = false |
| 31288 | `carrierRef` = null |
| 31289 | `motoreRef` = null |
| 31290 | `evAcc898Ref` = [] |
| 31297 | `outStoryRef` = 0 |
| 31298 | `outCool843Ref` = 0 |
| 31299 | `outRef` = null |
| 31310 | `fermoRef` = null |
| 31319 | `spRef` = null |
| 31320 | `counterRef` = null |
| 31321 | `possTurnRef` = 1 |
| 31322 | `possSpellRef` = 35 |
| 31323 | `counterArmRef` = null |
| 31358 | `azioneRef` = null |
| 31359 | `ponteRef` = null |
| 31366 | `libGol822Ref` = null |
| 31376 | `pendingGoalRef` = null |
| 31377 | `direttoreRef` = {f:null,l:0,dal:0} |
| 31471 | `chiestaScena879Ref` = null |
| 31472 | `bgCoolRef` = 0 |
| 31475 | `telecronistiRef` = null |
| 31477 | `tcPresRef` = false |
| 31478 | `tcCountRef` = 0 |
| 31479 | `tcUsateRef` = {} |
| 31480 | `bgSubjRef` = null |
| 31481 | `chantTimersRef` = [] |
| 31484 | `fxTimersRef` = [] |
| 31485 | `resultShownRef` = 0 |
| 31486 | `_contLockRef` = false |
| 31488 | `pendingChainSitRef` = null |
| 31489 | `_forceSeqRef` = 0 |
| 31490 | `velRef` = {} |
| 31491 | `hlTickRef` = 0 |
| 31516 | `keysRef` = new Set( |
| 31517 | `moveRef` = null |
| 31522 | `lastComWallRef` = 0 |
| 31607 | `spNet62Ref` = null |
| 31633 | `codaPiano816Ref` = [] |
| 31696 | `coachTimerRef` = null |
| 31815 | `_lmAliveRef` = true |
| 37294 | `selectedActionIdxRef` = 0 |
| 37296 | `pendingActionRef` = null |
| 37297 | `_hlActionFiredRef` = false |
| 37300 | `lastKbdMoveRef` = 0 |
| 46537 | `_committedMdRef` = new Set( |
| 46620 | `_playingMdRef` = null |
| 46673 | `showMatchPromptRef` = null |
| 46709 | `_trophyCountRef` = null |
| 46719 | `attesaConf194Ref` = false |
| 46720 | `pendingMisterDiscorsoRef` = null |
| 46721 | `matchBenchStartRef` = false |
| 46722 | `matchEntryMinuteRef` = 60 |
| 46724 | `matchResumeRef` = null |
| 46727 | `coachDecisionRef` = null |
| 46728 | `matchTypeRef` = "league" |
| 46729 | `titleStakesRef` = null |
| 46748 | `notifQRef` = [] |
| 46754 | `ivAperta247Ref` = false |
| 46935 | `saveTimerRef` = null |
| 46988 | `_flushRef` = null |
| 47546 | `_mktDoneRef` = null |
| 47547 | `_mktWkRef` = null |
| 47627 | `_wkMomentRef` = null |
| 47644 | `continuaBusyRef` = false |

## Hook di collaudo (window.__CPM_*)  (267)

Letti dalle sonde in `tests/visual`. Espongono lo stato, non cambiano il gioco.

| riga | |
|---:|---|
| 325 | `__CPM_RESEED` |
| 3954 | `__CPM_SP` |
| 8656 | `__CPM_BRUSIO238` |
| 11462 | `__CPM_STADI246` |
| 11878 | `__CPM_PALI69` |
| 12297 | `__CPM_PRE237` |
| 13282 | `__CPM_TIMELINE` |
| 13300 | `__CPM_EV` |
| 13306 | `__CPM_CUTLIVE` |
| 13644 | `__CPM_TOON_N` |
| 13651 | `__CPM_DECOR` |
| 13700 | `__CPM_CGTRADER_RENDER_BUDGET` |
| 13709 | `__CPM_RINFO769` |
| 13721 | `__CPM_GLLOST` |
| 13722 | `__CPM_GLRESTORED` |
| 13891 | `__CPM_STADFAIL` |
| 13947 | `__CPM_FONDALE70` |
| 14135 | `__CPM_BURST77` |
| 14136 | `__CPM_F077_SET` |
| 14140 | `__CPM_GESTI_CLIP045` |
| 14144 | `__CPM_FOOT77` |
| 14145 | `__CPM_ANIM_AUDIT` |
| 14177 | `__CPM_PIEDI_SINT252` |
| 14216 | `__CPM_PANCHINA904` |
| 14251 | `__CPM_CAM_DUGOUT904` |
| 14256 | `__CPM_CAM904` |
| 14257 | `__CPM_CAM_RESET904` |
| 14262 | `__CPM_TRI907` |
| 14293 | `__CPM_BODY909` |
| 14343 | `__CPM_PROCVIS` |
| 14476 | `__CPM_PRECOMP769` |
| 14484 | `__CPM_TEX16` |
| 14491 | `__CPM_RECOMP16` |
| 14492 | `__CPM_TEX16B` |
| 14493 | `__CPM_PROGS16` |
| 14494 | `__CPM_TEXNEW16` |
| 14666 | `__CPM_CGTRADER_REVIEW_METRICS` |
| 14853 | `__CPM_CGTRADER_LOD_RUNTIME` |
| 14907 | `__CPM_CGTRADER_LOD_AUDIT` |
| 14921 | `__CPM_CGTRADER_ACTORS_AUDIT` |
| 14922 | `__CPM_CGTRADER_KEEPER_AUDIT` |
| 14923 | `__CPM_CGTRADER_CONTACT_AUDIT` |
| 14951 | `__CPM_HYPER_BENCH` |
| 14975 | `__CPM_HYPER_MASCOTS` |
| 14998 | `__CPM_HYPER_ASSISTANTS` |
| 15013 | `__CPM_CADUTA8` |
| 15044 | `__CPM_HYPER_ANIMATIONS` |
| 15164 | `__CPM_MASCOT911` |
| 15473 | `__CPM_JUMBO455` |
| 15540 | `__CPM_HYPER_ASSISTANT_LIST` |
| 15728 | `__CPM_ULTRAS` |
| 15758 | `__CPM_LED70` |
| 15824 | `__CPM_LED23` |
| 16040 | `__CPM_TIFO` |
| 16101 | `__CPM_PROBE` |
| 16109 | `__CPM_GESTURE` |
| 16146 | `__CPM_STATE` |
| 16179 | `__CPM_INQ74` |
| 16180 | `__CPM_PALL278` |
| 16186 | `__CPM_BALL` |
| 16194 | `__CPM_OWN` |
| 16208 | `__CPM_PLPOS` |
| 16210 | `__CPM_WS` |
| 16227 | `__CPM_FOOTBALL_STATE` |
| 16229 | `__CPM_REC_DRAIN` |
| 16342 | `__CPM_GESTI` |
| 16749 | `__CPM_FPS708` |
| 16756 | `__CPM_SCENET` |
| 16816 | `__CPM_WD_FILL` |
| 16817 | `__CPM_WATCH_SNAP` |
| 16829 | `__CPM_REC_BUF` |
| 16840 | `__CPM_DBG51P` |
| 16841 | `__CPM_ARC` |
| 16873 | `__CPM_BRAINFR` |
| 17046 | `__CPM_AR51` |
| 17525 | `__CPM_DISPATCH` |
| 17532 | `__CPM_DISPATCH2` |
| 17608 | `__CPM_AR52` |
| 17764 | `__CPM_MATEFX` |
| 17800 | `__CPM_O2BK` |
| 17804 | `__CPM_O2` |
| 17886 | `__CPM_AR54` |
| 17905 | `__CPM_AR53` |
| 17975 | `__CPM_COL618` |
| 17980 | `__CPM_FILTR23` |
| 18041 | `__CPM_CGTRADER_DRIBBLE_TOUCH` |
| 18058 | `__CPM_VOLEE62` |
| 18079 | `__CPM_CGTRADER_KICK_TOUCH` |
| 18226 | `__CPM_STILE79` |
| 18466 | `__CPM_O2SEL` |
| 18736 | `__CPM_INTM80` |
| 18853 | `__CPM_GKLOD1` |
| 19021 | `__CPM_GKACT` |
| 19061 | `__CPM_GK229ARM` |
| 19150 | `__CPM_PASS65` |
| 19152 | `__CPM_TLSEG` |
| 19293 | `__CPM_V241` |
| 19344 | `__CPM_ARCSCART` |
| 19371 | `__CPM_SOST806` |
| 19498 | `__CPM_CROWD_TICK` |
| 19535 | `__CPM_WALKDBG74` |
| 19915 | `__CPM_PRE` |
| 20132 | `__CPM_PO229` |
| 20232 | `__CPM_W266T` |
| 20440 | `__CPM_HERODRV769` |
| 20668 | `__CPM_TESTA63` |
| 20983 | `__CPM_GK229TARDI` |
| 21026 | `__CPM_GKW` |
| 21318 | `__CPM_RUNUP` |
| 21361 | `__CPM_DIF252` |
| 21454 | `__CPM_VOLLEY` |
| 21784 | `__CPM_TIENI31` |
| 21811 | `__CPM_CELDX` |
| 21812 | `__CPM_CELPOS` |
| 21814 | `__CPM_CELN` |
| 22071 | `__CPM_CER425` |
| 22282 | `__CPM_MANI137` |
| 22308 | `__CPM_PREM24` |
| 22336 | `__CPM_PASSA137` |
| 22340 | `__CPM_PREMIO23` |
| 22364 | `__CPM_FOTO23` |
| 22582 | `__CPM_CAMING246` |
| 22625 | `__CPM_MIR732` |
| 22693 | `__CPM_RIG565` |
| 23337 | `__CPM_AP261` |
| 23479 | `__CPM_VIS665` |
| 23495 | `__CPM_GLBPOSE675` |
| 23537 | `__CPM_PROJ767` |
| 24010 | `__CPM_FRENO671` |
| 24098 | `__CPM_RECINTO24` |
| 24186 | `__CPM_CGTRADER_CINEMA_ROSTER` |
| 24201 | `__CPM_PIEDI` |
| 24273 | `__CPM_ROV19` |
| 24331 | `__CPM_STRIDE` |
| 24411 | `__CPM_CELGST` |
| 24421 | `__CPM_CELARM` |
| 24423 | `__CPM_GST` |
| 24424 | `__CPM_GKTL` |
| 24465 | `__CPM_ROVESCIATA23` |
| 24761 | `__CPM_BJN478` |
| 24848 | `__CPM_INS807` |
| 24883 | `__CPM_LONT812` |
| 24886 | `__CPM_BU229L` |
| 24897 | `__CPM_LOCK811` |
| 24924 | `__CPM_RUBA87` |
| 24931 | `__CPM_C92` |
| 24946 | `__CPM_RIC92` |
| 24982 | `__CPM_CON93` |
| 25007 | `__CPM_PAN72` |
| 25031 | `__CPM_NOMI51` |
| 25041 | `__CPM_RESIZE74` |
| 29012 | `__CPM_CAMPO19` |
| 29138 | `__CPM_HEAT23` |
| 29225 | `__CPM_E2D` |
| 29251 | `__CPM_PALL2D` |
| 29294 | `__CPM_RIFAI12` |
| 29748 | `__CPM_STAT279` |
| 30507 | `__CPM_FESTA942` |
| 30751 | `__CPM_CELEB` |
| 30799 | `__CPM_DEFDIST` |
| 30821 | `__CPM_FPS771` |
| 30843 | `__CPM_FPS907` |
| 31025 | `__CPM_LOAD_ALL` |
| 31028 | `__CPM_SITCTX` |
| 31029 | `__CPM_PPOS` |
| 31030 | `__CPM_HERO_NAME` |
| 31031 | `__CPM_NARR669` |
| 31038 | `__CPM_HOLD` |
| 31039 | `__CPM_BG_INJECT` |
| 31040 | `__CPM_CURSIT` |
| 31042 | `__CPM_FORCE_SIT` |
| 31082 | `__CPM_ACTS` |
| 31086 | `__CPM_RESOLVE` |
| 31091 | `__CPM_QUEUE_REACTIVE` |
| 31092 | `__CPM_NUMHL` |
| 31096 | `__CPM_SET_NUMHL` |
| 31099 | `__CPM_FORCE_CEREMONY` |
| 31100 | `__CPM_PHASE` |
| 31105 | `__CPM_FORCE_WALKOUT` |
| 31106 | `__CPM_RIPBREVE` |
| 31107 | `__CPM_KO544` |
| 31108 | `__CPM_HLTIMES` |
| 31109 | `__CPM_CLOCK` |
| 31110 | `__CPM_SCORE` |
| 31111 | `__CPM_KO536` |
| 31116 | `__CPM_HUD_FORCE` |
| 31120 | `__CPM_IDMAP538` |
| 31123 | `__CPM_SO_FORCE` |
| 31124 | `__CPM_SO_STATE` |
| 31129 | `__CPM_SUBOFF` |
| 31130 | `__CPM_FORCE_SUBOFF` |
| 31131 | `__CPM_FORCE_BENCH` |
| 31132 | `__CPM_MM` |
| 31136 | `__CPM_BALL3` |
| 31140 | `__CPM_MP` |
| 31141 | `__CPM_MS` |
| 31142 | `__CPM_FERMO_NOW` |
| 31143 | `__CPM_FERMO_SET` |
| 31144 | `__CPM_AUTOPLAY` |
| 31227 | `__CPM_FORCE_FORM538` |
| 31532 | `__CPM_SC681_NOPEND` |
| 31611 | `__CPM_AFF811` |
| 31625 | `__CPM_SUB813` |
| 31656 | `__CPM_SC681_REF` |
| 31661 | `__CPM_CODA816` |
| 31663 | `__CPM_SC681_IN` |
| 31672 | `__CPM_POP260_FINE` |
| 31681 | `__CPM_SC681_TOP` |
| 31688 | `__CPM_SC681_TMR` |
| 31689 | `__CPM_SC681_FIRE` |
| 31690 | `__CPM_SC681_CLR` |
| 32150 | `__CPM_FILL_MOVES` |
| 32251 | `__CPM_B3MUOVI` |
| 32254 | `__CPM_B3VECCHIO` |
| 32398 | `__CPM_PALLA84` |
| 32491 | `__CPM_N706` |
| 32513 | `__CPM_MK720` |
| 33115 | `__CPM_TAB228_PROVA` |
| 33208 | `__CPM_OCC28` |
| 33242 | `__CPM_PROM44` |
| 33258 | `__CPM_REC967` |
| 33540 | `__CPM_HT637` |
| 33544 | `__CPM_HT828` |
| 33545 | `__CPM_HT842` |
| 34073 | `__CPM_MOTORE` |
| 34074 | `__CPM_MOTORE_OBJ` |
| 34118 | `__CPM_DEB202T` |
| 34169 | `__CPM_MIN202` |
| 34180 | `__CPM_MOTORE_EV` |
| 34232 | `__CPM_TURN836` |
| 34710 | `__CPM_LIBMORTA846` |
| 35157 | `__CPM_SALVA812` |
| 35476 | `__CPM_LIB833T` |
| 35977 | `__CPM_GK823` |
| 36038 | `__CPM_REF_PIANO` |
| 36043 | `__CPM_SC681_PEND` |
| 36426 | `__CPM_VOLO851` |
| 36768 | `__CPM_TRK860` |
| 37274 | `__CPM_EROE726` |
| 37525 | `__CPM_LAST_K` |
| 37929 | `__CPM_CHAIN_COH` |
| 38047 | `__CPM_SETPIECE` |
| 38246 | `__CPM_ENDRESULT20` |
| 38455 | `__CPM_FORCE_SAL691` |
| 38556 | `__CPM_PARTITA23` |
| 39072 | `__CPM_FK62` |
| 40953 | `__CPM_ACTOR` |
| 41075 | `__CPM_BADGE483` |
| 41237 | `__CPM_CORPI948` |
| 41508 | `__CPM_PRES200` |
| 41620 | `__CPM_WVDBG` |
| 41923 | `__CPM_FOLLA137` |
| 42127 | `__CPM_PARATA` |
| 42255 | `__CPM_GALAFOV137` |
| 42316 | `__CPM_FLASH137` |
| 42459 | `__CPM_GALA52` |
| 42507 | `__CPM_GALA51` |
| 45633 | `__CPM_CLASSIFICA102` |
| 45666 | `__CPM_MIG194` |
| 46351 | `__CPM_ONDA7` |
| 46488 | `__CPM_EROE23` |
| 46581 | `__CPM_RECUPERO103` |
| 46600 | `__CPM_RINVIO107` |
| 47654 | `__CPM_FRENO23` |
| 47679 | `__CPM_CAREER` |
| 49838 | `__CPM_IV231` |
| 53146 | `__CPM_ANTE212` |

## Interruttori rossi (__CPM_NO*)  (328)

Ogni rimedio ha il suo: acceso, il difetto torna.

| riga | |
|---:|---|
| 395 | `__CPM_NO944` |
| 449 | `__CPM_NO968` |
| 460 | `__CPM_NO945` |
| 1736 | `__CPM_NO471` |
| 2654 | `__CPM_NO463` |
| 12054 | `__CPM_NO768` |
| 12167 | `__CPM_NO662` |
| 12718 | `__CPM_NO784` |
| 12734 | `__CPM_NO798` |
| 12768 | `__CPM_NO786` |
| 12889 | `__CPM_NO775` |
| 13701 | `__CPM_NO769` |
| 13708 | `__CPM_NO533` |
| 13710 | `__CPM_NO552` |
| 13719 | `__CPM_NO535` |
| 13744 | `__CPM_NO556` |
| 14287 | `__CPM_NO909` |
| 14291 | `__CPM_NO910` |
| 15090 | `__CPM_NO904` |
| 15151 | `__CPM_NO911` |
| 15251 | `__CPM_NO794` |
| 15269 | `__CPM_NO534` |
| 15278 | `__CPM_NO550` |
| 15328 | `__CPM_NO758` |
| 15398 | `__CPM_NO573` |
| 15450 | `__CPM_NO455` |
| 15463 | `__CPM_NO895` |
| 16259 | `__CPM_NO467` |
| 16340 | `__CPM_NO547` |
| 16619 | `__CPM_NO635` |
| 16625 | `__CPM_NO611` |
| 16862 | `__CPM_NO673` |
| 16931 | `__CPM_NO460` |
| 17144 | `__CPM_NO850` |
| 17147 | `__CPM_NO897` |
| 17152 | `__CPM_NO526` |
| 17162 | `__CPM_NO515` |
| 17189 | `__CPM_NO898` |
| 17217 | `__CPM_NO559` |
| 17244 | `__CPM_NO670` |
| 17248 | `__CPM_NO609` |
| 17252 | `__CPM_NO555` |
| 17372 | `__CPM_NO531` |
| 17542 | `__CPM_NO772` |
| 17565 | `__CPM_NO514` |
| 17606 | `__CPM_NO557` |
| 17622 | `__CPM_NO546` |
| 17657 | `__CPM_NO652` |
| 17757 | `__CPM_NO605` |
| 17968 | `__CPM_NO618` |
| 18133 | `__CPM_NO862` |
| 18147 | `__CPM_NO899` |
| 18428 | `__CPM_NO464` |
| 18726 | `__CPM_NO512` |
| 18747 | `__CPM_NO519` |
| 18829 | `__CPM_NO513` |
| 18868 | `__CPM_NO773` |
| 18910 | `__CPM_NO777` |
| 19062 | `__CPM_NO465` |
| 19387 | `__CPM_NO439` |
| 19388 | `__CPM_NO808` |
| 19396 | `__CPM_NO705` |
| 19404 | `__CPM_NO511` |
| 19779 | `__CPM_NO853` |
| 19844 | `__CPM_NO593` |
| 19940 | `__CPM_NO706` |
| 20295 | `__CPM_NO685` |
| 20533 | `__CPM_NO568` |
| 20560 | `__CPM_NO392` |
| 20765 | `__CPM_NO613` |
| 20957 | `__CPM_NO695` |
| 21011 | `__CPM_NO800` |
| 21043 | `__CPM_NO603` |
| 21061 | `__CPM_NO674` |
| 21131 | `__CPM_NO576` |
| 21383 | `__CPM_NO440` |
| 21429 | `__CPM_NO569` |
| 21449 | `__CPM_NO586` |
| 21456 | `__CPM_NO575` |
| 22098 | `__CPM_NO476` |
| 22546 | `__CPM_NO729` |
| 22624 | `__CPM_NO732` |
| 22626 | `__CPM_NO561` |
| 22679 | `__CPM_NO564` |
| 22780 | `__CPM_NO503` |
| 22807 | `__CPM_NO581` |
| 22886 | `__CPM_NO650` |
| 22910 | `__CPM_NO766` |
| 22948 | `__CPM_NO524` |
| 22949 | `__CPM_NO614` |
| 23058 | `__CPM_NO482` |
| 23059 | `__CPM_NO520` |
| 23066 | `__CPM_NO525` |
| 23104 | `__CPM_NO505` |
| 23242 | `__CPM_NO584` |
| 23246 | `__CPM_NO523` |
| 23294 | `__CPM_NO689` |
| 23387 | `__CPM_NO660` |
| 23420 | `__CPM_NO688` |
| 23450 | `__CPM_NO814` |
| 23457 | `__CPM_NO865` |
| 23566 | `__CPM_NO507` |
| 23577 | `__CPM_NO619` |
| 23608 | `__CPM_NO521` |
| 23657 | `__CPM_NO580` |
| 23709 | `__CPM_NO707` |
| 23751 | `__CPM_NO563` |
| 23772 | `__CPM_NO704` |
| 23806 | `__CPM_NO598` |
| 23973 | `__CPM_NO671` |
| 23995 | `__CPM_NO697` |
| 24126 | `__CPM_NO672` |
| 24236 | `__CPM_NO518` |
| 24265 | `__CPM_NO636` |
| 24267 | `__CPM_NO517` |
| 24346 | `__CPM_NO516` |
| 24449 | `__CPM_NO676` |
| 24527 | `__CPM_NO709` |
| 24540 | `__CPM_NO855` |
| 24773 | `__CPM_NO497` |
| 24834 | `__CPM_NO807` |
| 24857 | `__CPM_NO811` |
| 24882 | `__CPM_NO812` |
| 26539 | `__CPM_NO788` |
| 26603 | `__CPM_NO562` |
| 26995 | `__CPM_NO912` |
| 27114 | `__CPM_NO928` |
| 27176 | `__CPM_NO943` |
| 27202 | `__CPM_NO923` |
| 27217 | `__CPM_NO932` |
| 27313 | `__CPM_NO929` |
| 27324 | `__CPM_NO925` |
| 27382 | `__CPM_NO913` |
| 27430 | `__CPM_NO936` |
| 27518 | `__CPM_NO894` |
| 27536 | `__CPM_NO900` |
| 27538 | `__CPM_NO903` |
| 27561 | `__CPM_NO933` |
| 27572 | `__CPM_NO950` |
| 27592 | `__CPM_NO884` |
| 27603 | `__CPM_NO888` |
| 27864 | `__CPM_NO924` |
| 27916 | `__CPM_NO883` |
| 27930 | `__CPM_NO939` |
| 28621 | `__CPM_NO748` |
| 28851 | `__CPM_NO824` |
| 29224 | `__CPM_NO953` |
| 29319 | `__CPM_NO970` |
| 29455 | `__CPM_NO956` |
| 29584 | `__CPM_NO927` |
| 29917 | `__CPM_NO500` |
| 29994 | `__CPM_NO819` |
| 30186 | `__CPM_NO825` |
| 30425 | `__CPM_NO977` |
| 30489 | `__CPM_NO942` |
| 30831 | `__CPM_NO907` |
| 31120 | `__CPM_NO538` |
| 31250 | `__CPM_NO630` |
| 31336 | `__CPM_NO646` |
| 31340 | `__CPM_NO641` |
| 31386 | `__CPM_NO809` |
| 31508 | `__CPM_NO634` |
| 31584 | `__CPM_NO719` |
| 31624 | `__CPM_NO813` |
| 31640 | `__CPM_NO926` |
| 31661 | `__CPM_NO816` |
| 31698 | `__CPM_NO540` |
| 31726 | `__CPM_NO541` |
| 31785 | `__CPM_NO964` |
| 31842 | `__CPM_NO890` |
| 31843 | `__CPM_NO891` |
| 31868 | `__CPM_NO657` |
| 32099 | `__CPM_NO621` |
| 32245 | `__CPM_NO870` |
| 32342 | `__CPM_NO539` |
| 32474 | `__CPM_NO589` |
| 32505 | `__CPM_NO720` |
| 32525 | `__CPM_NO735` |
| 32534 | `__CPM_NO848` |
| 32573 | `__CPM_NO743` |
| 32574 | `__CPM_NO750` |
| 32702 | `__CPM_NO738` |
| 32715 | `__CPM_NO741` |
| 32749 | `__CPM_NO749` |
| 32763 | `__CPM_NO739` |
| 32800 | `__CPM_NO721` |
| 32851 | `__CPM_NO682` |
| 32948 | `__CPM_NO966` |
| 32958 | `__CPM_NO489` |
| 33003 | `__CPM_NO549` |
| 33115 | `__CPM_NO645` |
| 33164 | `__CPM_NO803` |
| 33175 | `__CPM_NO844` |
| 33232 | `__CPM_NO879` |
| 33252 | `__CPM_NO967` |
| 33283 | `__CPM_NO834` |
| 33306 | `__CPM_NO880` |
| 33474 | `__CPM_NO553` |
| 33476 | `__CPM_NO501` |
| 33477 | `__CPM_NO485` |
| 33494 | `__CPM_NO648` |
| 33539 | `__CPM_NO637` |
| 33544 | `__CPM_NO828` |
| 33545 | `__CPM_NO842` |
| 33550 | `__CPM_NO536` |
| 33610 | `__CPM_NO587` |
| 33677 | `__CPM_NO852` |
| 33781 | `__CPM_NO792` |
| 33797 | `__CPM_NO847` |
| 33829 | `__CPM_NO829` |
| 33848 | `__CPM_NO866` |
| 33885 | `__CPM_NO615` |
| 33906 | `__CPM_NO727` |
| 33907 | `__CPM_NO718` |
| 33917 | `__CPM_NO728` |
| 33947 | `__CPM_NO724` |
| 33986 | `__CPM_NO633` |
| 34002 | `__CPM_NO623` |
| 34035 | `__CPM_NO730` |
| 34131 | `__CPM_NO543` |
| 34210 | `__CPM_NO532` |
| 34229 | `__CPM_NO836` |
| 34297 | `__CPM_NO790` |
| 34298 | `__CPM_NO714` |
| 34300 | `__CPM_NO849` |
| 34361 | `__CPM_NO649` |
| 34362 | `__CPM_NO644` |
| 34368 | `__CPM_NO693` |
| 34373 | `__CPM_NO854` |
| 34374 | `__CPM_NO818` |
| 34385 | `__CPM_NO702` |
| 34398 | `__CPM_NO616` |
| 34439 | `__CPM_NO638` |
| 34449 | `__CPM_NO542` |
| 34459 | `__CPM_NO839` |
| 34464 | `__CPM_NO544` |
| 34501 | `__CPM_NO551` |
| 34543 | `__CPM_NO653` |
| 34622 | `__CPM_NO723` |
| 34640 | `__CPM_NO722` |
| 34709 | `__CPM_NO845` |
| 34710 | `__CPM_NO846` |
| 34711 | `__CPM_NO833` |
| 34744 | `__CPM_NO570` |
| 34753 | `__CPM_NO656` |
| 34779 | `__CPM_NO486` |
| 34780 | `__CPM_NO528` |
| 34807 | `__CPM_NO499` |
| 34824 | `__CPM_NO577` |
| 34863 | `__CPM_NO537` |
| 34921 | `__CPM_NO572` |
| 34940 | `__CPM_NO632` |
| 34942 | `__CPM_NO843` |
| 34950 | `__CPM_NO629` |
| 35034 | `__CPM_NO856` |
| 35158 | `__CPM_NO684` |
| 35228 | `__CPM_NO826` |
| 35321 | `__CPM_NO683` |
| 35401 | `__CPM_NO785` |
| 35423 | `__CPM_NO822` |
| 35467 | `__CPM_NO687` |
| 35515 | `__CPM_NO617` |
| 35527 | `__CPM_NO835` |
| 35543 | `__CPM_NO830` |
| 35631 | `__CPM_NO574` |
| 35647 | `__CPM_NO578` |
| 35648 | `__CPM_NO498` |
| 35670 | `__CPM_NO655` |
| 35683 | `__CPM_NO612` |
| 35697 | `__CPM_NO639` |
| 35778 | `__CPM_NO608` |
| 35850 | `__CPM_NO643` |
| 35912 | `__CPM_NO827` |
| 35939 | `__CPM_NO488` |
| 35941 | `__CPM_NO823` |
| 35980 | `__CPM_NO821` |
| 36091 | `__CPM_NO490` |
| 36105 | `__CPM_NO882` |
| 36110 | `__CPM_NO885` |
| 36163 | `__CPM_NO628` |
| 36179 | `__CPM_NO566` |
| 36318 | `__CPM_NO602` |
| 36366 | `__CPM_NO610` |
| 36376 | `__CPM_NO590` |
| 36377 | `__CPM_NO588` |
| 36408 | `__CPM_NO642` |
| 36764 | `__CPM_NO863` |
| 36816 | `__CPM_NO527` |
| 36874 | `__CPM_NO631` |
| 36933 | `__CPM_NO558` |
| 36965 | `__CPM_NO861` |
| 37047 | `__CPM_NO478` |
| 37050 | `__CPM_NO484` |
| 37094 | `__CPM_NO554` |
| 37206 | `__CPM_NO428` |
| 37255 | `__CPM_NO726` |
| 37454 | `__CPM_NO752` |
| 37660 | `__CPM_NO840` |
| 37761 | `__CPM_NO820` |
| 37821 | `__CPM_NO864` |
| 38057 | `__CPM_NO781` |
| 38128 | `__CPM_NO620` |
| 38349 | `__CPM_NO461` |
| 38529 | `__CPM_NO892` |
| 38722 | `__CPM_NO893` |
| 38731 | `__CPM_NO901` |
| 38929 | `__CPM_NO917` |
| 39044 | `__CPM_NO918` |
| 39110 | `__CPM_NO791` |
| 39136 | `__CPM_NO661` |
| 39137 | `__CPM_NO565` |
| 39183 | `__CPM_NO919` |
| 39389 | `__CPM_NO548` |
| 41622 | `__CPM_NO479` |
| 41800 | `__CPM_NO949` |
| 42798 | `__CPM_NO946` |
| 43108 | `__CPM_NO445` |
| 45465 | `__CPM_NO472` |
| 45790 | `__CPM_NO473` |
| 46360 | `__CPM_NO686` |
| 46577 | `__CPM_NO103` |
| 46593 | `__CPM_NO107` |
| 46611 | `__CPM_NO181` |
| 48688 | `__CPM_NO783` |
| 49197 | `__CPM_NO477` |
| 50603 | `__CPM_NO782` |
| 52264 | `__CPM_NO947` |
| 52817 | `__CPM_NO963` |

## Tabelle dati  (235)

I repertori: righe di cronaca, moduli, situazioni, palette.

| riga | |
|---:|---|
| 441 | `INK945` |
| 476 | `TH_DARK` |
| 517 | `AVATARS` |
| 603 | `VOLTI23` |
| 840 | `COACH_NPC_FACES` |
| 848 | `JOURNALIST_NPC_FACES` |
| 1152 | `CLUBS` |
| 1431 | `ALL_U18_CLUBS` |
| 1434 | `LEAGUE_PAIRS` |
| 1437 | `LEAGUE_RECORDS` |
| 1565 | `EURO_SIGLA` |
| 1575 | `EURO_COMP_WINNERS` |
| 1618 | `CLUB_FOUNDED` |
| 1644 | `SHAPES` |
| 1738 | `WEEKLY_EVENTS` |
| 1904 | `WEEKLY_RANDOM_EVENTS` |
| 1964 | `TEAMMATE_ARCHETYPES` |
| 1971 | `SPOGLIATOIO_MOMENTS` |
| 2044 | `WEEKLY_IMPULSES` |
| 2511 | `JOURNALIST_POOL` |
| 2530 | `LEAGUE_NEWS_TEMPLATES` |
| 2592 | `VITA_EVENTS` |
| 2684 | `CAREER_MOMENTS` |
| 2884 | `ULTRAS_PREFIXES` |
| 2885 | `ULTRAS_SUFFIXES` |
| 2890 | `CAPTAIN_TEAM_TALKS` |
| 2902 | `INJURY_TYPES_META` |
| 2909 | `INJURY_REHAB` |
| 2931 | `COACH_DIALOGUES` |
| 2949 | `COACH_PROMISES` |
| 2971 | `SEASON_END_COACH` |
| 3002 | `SEASON_END_PRESIDENT` |
| 3079 | `ACHIEVEMENTS` |
| 3289 | `GESTI_PROMESSI` |
| 3301 | `GESTI_COLLEGATI` |
| 3310 | `SITUATIONS` |
| 3784 | `ZONES` |
| 3888 | `SP_PEN` |
| 3894 | `SP_FK_NEAR` |
| 3899 | `SP_FK_FAR` |
| 3962 | `TELECRONISTI` |
| 3980 | `COMMENTO_TECNICO` |
| 4016 | `P6_CONCLUSIONE` |
| 4073 | `P6_SPALLE` |
| 4094 | `P6_FASCIA` |
| 4105 | `P6_LINEE` |
| 4137 | `P6_CROSS` |
| 4162 | `P6_DIFESA` |
| 4188 | `P6_PUNIZIONE` |
| 4195 | `P6_RIGORE` |
| 4225 | `P6_SEGUITO` |
| 4338 | `BG_MATCH` |
| 4636 | `OUTCOME_TX` |
| 4654 | `HL_OVERLAY_POOLS` |
| 4778 | `STADIUMS` |
| 4779 | `STADIUM_POOLS` |
| 4787 | `CLUB_STADIUMS` |
| 4815 | `CLUB_STADIUM_STYLE` |
| 4843 | `NATIONS` |
| 4845 | `FORMATION_HOME` |
| 4846 | `FORMATION_AWAY` |
| 4893 | `ARCHETYPE_STAT_BONUS` |
| 5077 | `AGENT_ARCHETYPES` |
| 5093 | `AGENT_AMBITIONS` |
| 5113 | `AGENT_NAME_POOL` |
| 5184 | `AGENT_INTRO_REPLY` |
| 5240 | `AGENT_CHECKIN_OPTS` |
| 5246 | `AGENT_CHECKIN_REPLY` |
| 5260 | `AMB_TXT` |
| 5304 | `AGENT_INIT_KINDS` |
| 5344 | `AGENT_INIT_TXT` |
| 5423 | `AGENT_HINT_TXT` |
| 5513 | `CLUB_SPONSOR_POOL` |
| 5685 | `ARCHETYPES` |
| 5696 | `NPC_PERSONAS` |
| 5704 | `NEWSPAPERS` |
| 6176 | `EM_KO_ORDER` |
| 6177 | `EM_KO_LABEL` |
| 6183 | `EVENT_SCOPE` |
| 6213 | `IV_TONE_LBL` |
| 6214 | `IV_TONE_COL` |
| 6225 | `IV_NOCOMMENT24` |
| 6226 | `RILANCIO24` |
| 6292 | `PRIMA24` |
| 6300 | `RIL_PRES214` |
| 6328 | `INTERVIEW_QS` |
| 7461 | `COACH_NAMES` |
| 7462 | `COACH_STYLES` |
| 7478 | `STAFF24` |
| 7483 | `STAFF_COSTX24` |
| 7505 | `INVEST24` |
| 7517 | `BENI24` |
| 7551 | `DERBIES` |
| 7603 | `SQUAD_ROLES` |
| 7686 | `RIVAL_FIRST` |
| 7687 | `RIVAL_LAST` |
| 7746 | `WEATHER_TYPES` |
| 7817 | `CROWD_CHANTS` |
| 7835 | `CROWD_CHANTS_LG` |
| 7927 | `CROWD_CHANTS_NAT` |
| 7959 | `LEAGUE_COMP_COL` |
| 7960 | `LG_LANG` |
| 7961 | `NAT_LANG` |
| 7962 | `LANG_CHANTS` |
| 8020 | `SLOT_KEYS` |
| 8200 | `CATS` |
| 8226 | `URL_SFX` |
| 8308 | `NOTE` |
| 8474 | `SCENES` |
| 8743 | `SCOUT_EXPLOITS` |
| 8751 | `SCOUT_SOLID` |
| 8882 | `FALLBACK_SURNAMES` |
| 9056 | `FIRSTNAMES_IT` |
| 9057 | `SURNAMES_IT` |
| 9058 | `FIRSTNAMES_EN` |
| 9059 | `SURNAMES_EN` |
| 9060 | `FIRSTNAMES_ES` |
| 9061 | `SURNAMES_ES` |
| 9062 | `FIRSTNAMES_DE` |
| 9063 | `SURNAMES_DE` |
| 9064 | `FIRSTNAMES_FR` |
| 9065 | `SURNAMES_FR` |
| 9066 | `FIRSTNAMES_PT` |
| 9067 | `SURNAMES_PT` |
| 9068 | `NAME_BY_NAT` |
| 9099 | `CLUB_RENAME_6` |
| 9810 | `CROWD_CFG` |
| 9846 | `CLUB_IDENTITY` |
| 10013 | `STADIUM_TEMPLATES` |
| 10051 | `STADIUM_LG_TPL` |
| 10179 | `RITIRO_LOCS` |
| 10194 | `RITIRO_HOTELS` |
| 10195 | `RITIRO_CENTRI` |
| 10196 | `RITIRO_SPONSOR` |
| 10197 | `RITIRO_EVENTS` |
| 10256 | `PREPS` |
| 11133 | `SKINS` |
| 11134 | `HAIRS` |
| 11135 | `CLOTHES` |
| 12355 | `ATE3_LABEL` |
| 12356 | `ATE3_TYPEMS` |
| 12357 | `ATE3_ARCMS` |
| 12358 | `ATE3_ARCCOL` |
| 12360 | `HL_ZONE_3D` |
| 12534 | `CELEBRATIONS` |
| 12587 | `HL_ZONE_COL` |
| 13209 | `INTENT_TITLE` |
| 13279 | `MATCH_TL` |
| 13297 | `MATCH_EV` |
| 13399 | `CONTATTO_CLIP` |
| 13953 | `SKN_TONES` |
| 14015 | `GK_POOL` |
| 15347 | `AD_BRANDS` |
| 16254 | `GESTURE_WIN` |
| 16295 | `BRAIN_GESTI` |
| 16321 | `GESTI` |
| 16338 | `GESTI_ALIAS` |
| 16397 | `BALL_ARC_BY_TYPE` |
| 25827 | `KIT_PATTERN` |
| 26018 | `HOME_NUMS` |
| 26019 | `AWAY_NUMS` |
| 26237 | `ALT_KITS` |
| 26324 | `KIT_PALETTE` |
| 26381 | `SKIN_TONES` |
| 26382 | `HAIR_COLS` |
| 26515 | `COACH_ORDERS` |
| 26572 | `COACH_SHOUTS` |
| 26624 | `SUB_EVENTS` |
| 26631 | `CHAIN_SITS` |
| 26732 | `TATTICHE_MOTORE` |
| 26748 | `INT226` |
| 26793 | `INT259` |
| 26959 | `SLOT_H` |
| 26960 | `SLOT_A` |
| 26961 | `SLOT_EROE` |
| 28051 | `K259` |
| 28443 | `LIB662` |
| 28462 | `LIB662_START` |
| 28567 | `SCHEDE226` |
| 28599 | `INTX669` |
| 28765 | `BEAT664` |
| 28826 | `ESITI664` |
| 28908 | `MATCH_SPEEDS` |
| 31228 | `TRAMA_ID538` |
| 31395 | `PRIO` |
| 31498 | `DRIFT_PRESETS` |
| 31514 | `BG_ARC_MAP` |
| 34036 | `S730` |
| 37946 | `RIGORE_DIRS` |
| 37947 | `RIGORE_ARROWS` |
| 37948 | `RIGORE_LABELS` |
| 42129 | `SHOTS` |
| 43578 | `COACH_QUOTES` |
| 43586 | `ATMOS` |
| 43742 | `CREDITI238` |
| 43774 | `CREDITI254` |
| 44206 | `TRIAL_OPPONENTS` |
| 44380 | `NAT_DATA` |
| 44392 | `NAT_CLUB_DATA` |
| 44905 | `CHALLENGES` |
| 44927 | `LOCALE` |
| 45045 | `ROUND_KEYS` |
| 45068 | `CAREER_MILESTONES` |
| 45095 | `FNAMES` |
| 45096 | `LNAMES` |
| 45269 | `TOP_LGS` |
| 45296 | `MARKET_NEWS_TPL` |
| 45345 | `MONTHLY_COACH_REVIEWS` |
| 45536 | `TUTORIAL_STEPS` |
| 46315 | `DRIVER_MORALE` |
| 46333 | `STANCE_EVENT` |
| 46459 | `INV223` |
| 47271 | `OPENING_LBL` |
| 47337 | `RITIRO_BEHAVIORS` |
| 47863 | `NAT_POOL_EU` |
| 47864 | `NAT_POOL_WORLD` |
| 48254 | `PACT_K` |
| 48260 | `PACT_OPEN` |
| 48261 | `PACT_REW` |
| 48300 | `RATE` |
| 48363 | `SAGA_ARCS` |
| 48669 | `NAT_CALL_LEVEL` |
| 48813 | `PIAZZA` |
| 48830 | `PHASE_ARCS` |
| 49051 | `PRES_TONI` |
| 49091 | `SERIALS` |
| 51596 | `CUP_ROUND_WEEKS` |
| 51597 | `CUP_ROUND_NAMES` |
| 55268 | `KO_NAMES` |
| 55385 | `ZONE_COLORS` |
| 56581 | `MEM_META` |
| 56613 | `DTYPE` |
| 57827 | `ROUNDS` |
| 58310 | `CAPS` |
| 58920 | `KEYS` |

## Funzioni di primo livello  (515)

| riga | |
|---:|---|
| 376 | `_lum944` |
| 382 | `_rap944` |
| 384 | `_mix944` |
| 388 | `legCol944` |
| 426 | `_mixNero945` |
| 442 | `_rgb945` |
| 447 | `_agganciaInk945` |
| 458 | `semTesto945` |
| 468 | `inkSu945` |
| 473 | `inkVelo945` |
| 496 | `thPastel` |
| 509 | `fsScala` |
| 534 | `_dbAv` |
| 541 | `AvatarSVG` |
| 589 | `_slugVolto` |
| 604 | `_caricaVolti23` |
| 617 | `_hash23` |
| 619 | `candidatiEroe23` |
| 628 | `_eroe23` |
| 629 | `voltoEroeId23` |
| 631 | `voltoId23` |
| 659 | `ScenaVolti23` |
| 660 | `_fileVolto23` |
| 661 | `voltoUrl` |
| 679 | `Figurina` |
| 738 | `datiFigurina23` |
| 768 | `_largTesto23` |
| 770 | `_passoFS23` |
| 772 | `fmtEuro23` |
| 773 | `FigurinaKorward23` |
| 856 | `NpcFace` |
| 905 | `npcFaceIdx` |
| 914 | `npcCoachAvOpts` |
| 924 | `NpcFaceCoach` |
| 936 | `_disposeHeroPhotoRenderer` |
| 939 | `_ensureHeroPhotoAssets` |
| 996 | `AvatarPhoto` |
| 1007 | `Player3DViewer` |
| 1151 | `mkT` |
| 1566 | `euroSig` |
| 1572 | `compLbl` |
| 1599 | `EmoText` |
| 1613 | `_surnBG` |
| 1621 | `clubFoundedYear` |
| 1622 | `TeamBadge` |
| 1735 | `_criticaOk` |
| 1736 | `_mktFresh` |
| 1737 | `_mktOk` |
| 1865 | `resolveEvText` |
| 1881 | `impulseFreshBucket` |
| 2023 | `_brandOk453` |
| 2027 | `_notoOk453` |
| 2035 | `_statusOk453` |
| 2523 | `giornalistaDonna` |
| 2564 | `careerPhase` |
| 2591 | `_vitaAgName` |
| 2634 | `pickVitaEvent` |
| 2675 | `markVitaEvent` |
| 3038 | `getPresidentOpeningQuote` |
| 3136 | `deriveIntent` |
| 3302 | `richiedeDi` |
| 3303 | `gestoCollegato` |
| 3304 | `_noRichiede` |
| 3305 | `azioneDisegnabile` |
| 3306 | `sitSospesa` |
| 3308 | `soloDisegnabili` |
| 3309 | `A` |
| 3793 | `getZone` |
| 3798 | `filterSitActions` |
| 3843 | `cappedMM` |
| 3854 | `isPenaltySit` |
| 3855 | `inBoxHL` |
| 3856 | `hideDirCursor` |
| 3861 | `isAimSit` |
| 3903 | `spSkill` |
| 3904 | `spGk` |
| 3908 | `spPressure` |
| 3917 | `setPieceChoices` |
| 3920 | `resolveSetPieceShot` |
| 3937 | `pickSetPieceChoiceAI` |
| 3946 | `setPieceOptions` |
| 3997 | `pickTelecronisti` |
| 4015 | `_r068` |
| 4028 | `_p6Costruisci` |
| 4055 | `_p6Manovra` |
| 4066 | `_p6Nomi` |
| 4080 | `scenaDalMotoreSpalle` |
| 4113 | `scenaDalMotoreFascia` |
| 4122 | `scenaDalMotoreLinee` |
| 4144 | `scenaDalMotoreCross` |
| 4169 | `scenaDalMotoreDifesa` |
| 4201 | `scenaDalMotorePiazzato` |
| 4252 | `scenaSecondoTempo` |
| 4285 | `_p6Pressione` |
| 4293 | `scenaDalMotore` |
| 4306 | `scenaDalMotoreConclusione` |
| 4712 | `_missKindNorm` |
| 4724 | `_hlOvlCat` |
| 4753 | `hlOverlay` |
| 4820 | `getStadiumStyle` |
| 4824 | `getStadiumName` |
| 4856 | `_cpmRnd` |
| 4863 | `rng` |
| 4864 | `rngF` |
| 4865 | `clamp` |
| 4869 | `popGain` |
| 4879 | `pick` |
| 4880 | `shuffle` |
| 4884 | `wPick` |
| 4885 | `baseStats` |
| 4891 | `calcOvr` |
| 4903 | `succRate` |
| 4916 | `calcXG` |
| 4927 | `adaptiveDifficulty` |
| 4948 | `trainAgeMult` |
| 4950 | `archGrowthMult` |
| 4954 | `offerGrowthMult` |
| 4957 | `calcMarketValue` |
| 4977 | `getLeagueClubs` |
| 5000 | `getStartPos` |
| 5008 | `postHighlightDuration` |
| 5022 | `transferCredibility` |
| 5035 | `_ovrToAnnualWage133` |
| 5048 | `_ovrToWageWeekly133` |
| 5054 | `_fmtWageY133` |
| 5089 | `AGENT_ARCH_BY_ID` |
| 5114 | `agentNameFor` |
| 5121 | `agentHirePatch` |
| 5134 | `agentHireFee` |
| 5141 | `agentHintCheck` |
| 5167 | `agentIntroOptions` |
| 5195 | `agentIntroLine` |
| 5215 | `agentCheckinDue` |
| 5256 | `agentCheckinAsk` |
| 5277 | `agentCheckinApply` |
| 5312 | `_sottopagato378` |
| 5313 | `agentInitiative` |
| 5351 | `agentInitLine` |
| 5361 | `agentCandidates` |
| 5380 | `agentPartPatch` |
| 5398 | `agentRapportDrift` |
| 5414 | `agentRapportAdvice` |
| 5434 | `agentRosterFor` |
| 5440 | `agentRapportTier` |
| 5452 | `agentRemember` |
| 5464 | `agentInit` |
| 5473 | `agentAdvice` |
| 5514 | `genClubSponsor` |
| 5523 | `generateTransferOffer` |
| 5592 | `generateProContracts` |
| 5658 | `generateSeasonObjectives` |
| 5702 | `getClubPersona` |
| 5712 | `_genNpcJerseyNums` |
| 5718 | `_getAvailNums` |
| 5734 | `capDiary` |
| 6195 | `isNationalEvent` |
| 6200 | `openDonation` |
| 6202 | `_feedbackTo` |
| 6203 | `openFeedback` |
| 6208 | `APP_ENV` |
| 6290 | `hashIv24` |
| 6291 | `rilancio24` |
| 6309 | `rilPres214` |
| 6310 | `primaPagina24` |
| 6321 | `_primaCasa77` |
| 7418 | `pickInterviewByCtx` |
| 7484 | `staffLv24` |
| 7485 | `staffCost24` |
| 7486 | `staffCostTot24` |
| 7491 | `academyCost24` |
| 7492 | `academyName24` |
| 7493 | `academyGrad24` |
| 7497 | `academySeason24` |
| 7506 | `investRate24` |
| 7507 | `investSeason24` |
| 7522 | `beniMorale24` |
| 7523 | `patrimonioNetto24` |
| 7524 | `legacyPatrimonio24` |
| 7531 | `ctDiNazione` |
| 7537 | `misterInPartita` |
| 7544 | `misterUsati215` |
| 7545 | `misterLibero215` |
| 7548 | `coachDiClub23` |
| 7573 | `isDerby` |
| 7578 | `calcMatchWeight` |
| 7605 | `calcSquadRole` |
| 7623 | `calcCoachDecision` |
| 7688 | `generateRival` |
| 7700 | `generateTeammates` |
| 7715 | `syncTeammateNames` |
| 7724 | `generateJournalists` |
| 7729 | `getJournalistRelLabel` |
| 7737 | `generateUltrasName` |
| 7776 | `weatherNightDisp` |
| 7785 | `climateWeights` |
| 7803 | `seasonalWeights` |
| 8014 | `chantPoolFor` |
| 8126 | `toThree` |
| 8182 | `devToolsOn` |
| 8183 | `setDevTools` |
| 8673 | `toggleAIMock` |
| 8756 | `oppMatchProfile` |
| 8766 | `scoutActionMod` |
| 8773 | `generateLocalScoutReport` |
| 8853 | `generateLocalPressAnalysis` |
| 9101 | `_renameClub6` |
| 9102 | `_auditCopyrightSafety` |
| 9140 | `hashStr` |
| 9141 | `generateTeamRoster` |
| 9170 | `seededShuffle` |
| 9177 | `generateSeasonCalendar` |
| 9214 | `_isYouthClubName` |
| 9215 | `proCareerOf` |
| 9228 | `_scOf` |
| 9239 | `buildSeasonCarry` |
| 9264 | `leagueGoalsOf` |
| 9276 | `euroSeasonGoalsOf` |
| 9285 | `euroSeasonAssistsOf` |
| 9294 | `leagueAssistsOf` |
| 9307 | `_objSpent` |
| 9309 | `objCurrent` |
| 9313 | `objDone` |
| 9321 | `seasonSplitShare` |
| 9348 | `_roundPrep91` |
| 9354 | `titleClinchedNow` |
| 9369 | `rivalSeasonGoals` |
| 9385 | `generateSeasonAwards` |
| 9560 | `initStandings` |
| 9569 | `updateStandings` |
| 9640 | `standingsSeed` |
| 9649 | `leagueClubsFromCalendar` |
| 9653 | `rebuildStandingsFromCalendar` |
| 9670 | `riparaClassifica194` |
| 9692 | `legaDopoTrasferimento212` |
| 9740 | `avversarioDiGiornata` |
| 9745 | `recuperaGiornateMancate` |
| 9768 | `seededRng` |
| 9770 | `seededPoissonGoals` |
| 9773 | `calcWorldStandings` |
| 9897 | `_natCode` |
| 9900 | `clubProfile` |
| 9925 | `profileCapacity` |
| 9940 | `computeCrowdContext` |
| 10036 | `stadiumKind46` |
| 10063 | `stadiumConfigFor` |
| 10114 | `calcAttendance` |
| 10136 | `poissonGoals` |
| 10144 | `koShootoutWin` |
| 10214 | `ritiroPlan` |
| 10265 | `ritiroHierarchyVerdict` |
| 10279 | `ritiroFriendlies` |
| 10324 | `draftBugNote` |
| 10621 | `refuseEcho` |
| 10671 | `simulateMatch` |
| 10705 | `_pSimStats` |
| 10724 | `_heroSimLine` |
| 10746 | `dup068On` |
| 10747 | `_senzaDoppione068` |
| 10797 | `StatBar` |
| 10804 | `OvrRing` |
| 10811 | `_NotifVecchio` |
| 10812 | `Notif` |
| 10823 | `Sparkline` |
| 10851 | `SectionHeader` |
| 10872 | `Fisarmonica` |
| 10906 | `Badge` |
| 10914 | `MatchBadge` |
| 10923 | `Meter` |
| 10936 | `KpiTile` |
| 10955 | `EmptyState` |
| 10965 | `Skeleton` |
| 10973 | `finestraStd` |
| 10974 | `finestraOn230` |
| 10983 | `modaleAperto256` |
| 10984 | `_avvisaModali256` |
| 10985 | `ModalPannello` |
| 10997 | `Modal` |
| 11008 | `_isOcchiello230` |
| 11009 | `_isTitoletto230` |
| 11010 | `_isAzioni230` |
| 11011 | `cardInFinestra230` |
| 11026 | `AnteprimaSezione` |
| 11046 | `BottomSheet` |
| 11058 | `Tabs` |
| 11067 | `Tooltip` |
| 11072 | `DataTable` |
| 11085 | `Bracket` |
| 11101 | `Toast` |
| 11125 | `makeCrowdTex` |
| 11316 | `getStadiumPalette` |
| 11394 | `_cvRoundRect` |
| 11396 | `_cvBall` |
| 11407 | `_cvLogoBadge` |
| 11418 | `_cvWordmark` |
| 11447 | `buildStadium` |
| 12242 | `makeToonGrad` |
| 12249 | `loadGLB` |
| 12308 | `colorCharGLB` |
| 12383 | `deriveReception` |
| 12437 | `isReceptionSit` |
| 12444 | `hlBallSpot` |
| 12478 | `goalContext` |
| 12528 | `_scrive386` |
| 12556 | `pickCelebration` |
| 12598 | `deriveBallState` |
| 12610 | `deriveSitCine` |
| 12630 | `_hyBump478` |
| 12634 | `hlBallState` |
| 12643 | `aerialContactY` |
| 12644 | `_aerialContactY0` |
| 12665 | `hlPreDribble` |
| 12679 | `deriveHL` |
| 12880 | `buildHLTimeline` |
| 13011 | `validateHLTimeline` |
| 13040 | `resolveTimeline` |
| 13063 | `decideExecution` |
| 13132 | `resolveDefensiveOutcome` |
| 13195 | `intentLabel` |
| 13211 | `intentTitle` |
| 13222 | `stateIncoherent` |
| 13228 | `intentIntro` |
| 13235 | `intentLabelDedup` |
| 13247 | `bgMicroTick` |
| 13280 | `cpmEmit` |
| 13281 | `cpmTimelineReset` |
| 13298 | `cpmEv` |
| 13299 | `cpmEvReset` |
| 13313 | `_specchiaClip23` |
| 13352 | `_mira20` |
| 13359 | `_tiro242` |
| 13362 | `_tuffoTesto23` |
| 13377 | `_tiro34Prep` |
| 13382 | `_tiro34D` |
| 13388 | `_attesa32` |
| 13403 | `_scegliGesto23` |
| 13439 | `_guanti201` |
| 13455 | `corpoCG23` |
| 13474 | `_scalaCorpo21` |
| 13504 | `_ossa23` |
| 13505 | `_hyperQ23` |
| 13538 | `ThreeMatchView` |
| 25112 | `DPad` |
| 25153 | `ScoutReportScreen` |
| 25397 | `PostMatchPress` |
| 25503 | `PressScreen` |
| 25607 | `AIDecisionOverlay` |
| 25650 | `flagColsOf` |
| 25651 | `_flagCode` |
| 25653 | `leagueFlagBg` |
| 25654 | `MatchdayCard` |
| 25869 | `kitPatternFor` |
| 25882 | `JerseyIcon` |
| 25969 | `rosterRows` |
| 25983 | `TeamFormation` |
| 26009 | `FormationView` |
| 26234 | `hexToRgb` |
| 26235 | `colorDist` |
| 26239 | `_hueOf` |
| 26240 | `_satOf` |
| 26242 | `kitsClash` |
| 26259 | `resolveKitConflict` |
| 26266 | `hexLum` |
| 26268 | `buildKit` |
| 26276 | `kitPatternTex` |
| 26325 | `_mixHex` |
| 26326 | `clubKits` |
| 26348 | `kitPerceived` |
| 26354 | `selectMatchKits` |
| 26384 | `_mix32` |
| 26386 | `appearanceFromSeed` |
| 26391 | `selectContextualSituations` |
| 26536 | `coachSay` |
| 26547 | `selectCoachOrder` |
| 26601 | `pickCoachShout` |
| 26666 | `coachPostMatch` |
| 26911 | `creaMotorePossesso` |
| 28419 | `simulaPartitaMotore` |
| 28463 | `_libH662` |
| 28471 | `_libCtxW662` |
| 28482 | `libCompose662` |
| 28554 | `latiTabellino10` |
| 28555 | `golScarto10` |
| 28560 | `ordineTabellino280` |
| 28596 | `schedaVista234` |
| 28842 | `libRender664` |
| 28911 | `readMatchSpeed` |
| 28917 | `_rgb917` |
| 28918 | `_lum917` |
| 28919 | `_sca917` |
| 28920 | `_rgba917` |
| 28921 | `_dist917` |
| 28926 | `_kit917` |
| 28939 | `_gk917` |
| 28966 | `Campo2D` |
| 29319 | `_sigla970` |
| 29321 | `_voto918` |
| 29322 | `_num918` |
| 29323 | `_dec918` |
| 29326 | `_uomo918` |
| 29332 | `Riga918` |
| 29349 | `Pagella918` |
| 29386 | `_testo919` |
| 29397 | `FestaFine942` |
| 29457 | `PopScelta919` |
| 29543 | `Sez210` |
| 29549 | `brain137` |
| 29550 | `righeTabellino23` |
| 29574 | `_rateUI82` |
| 29575 | `_BRAIN82_UI` |
| 29576 | `_brainIn82` |
| 29582 | `PannelloLive2D` |
| 29729 | `tassoOccasioni28` |
| 29757 | `scenaExtraAmmessa` |
| 29758 | `schedePiazzato` |
| 29775 | `stat279On` |
| 29777 | `fatti279` |
| 29818 | `indietro279` |
| 29824 | `scegli279` |
| 29841 | `attesa241On` |
| 29842 | `schedeAttesa241` |
| 29862 | `LiveMatch` |
| 40415 | `ProTransitionScreen` |
| 40503 | `getCareerPhase` |
| 40510 | `getSeasonNarrative` |
| 40541 | `getSeasonHeadline` |
| 40560 | `getBestSeasonMatch` |
| 40596 | `journalistIsFemale` |
| 40616 | `sponsorDi947` |
| 40619 | `InterviewScena2D` |
| 40712 | `InterviewStage3D` |
| 41237 | `_corpo948` |
| 41241 | `ParataScena2D` |
| 41268 | `TavoloStampa24` |
| 41327 | `StrisciaScena948` |
| 41352 | `PresentazioneScena2D` |
| 41408 | `PresentationStage3D` |
| 41797 | `ParataCompleta198` |
| 41804 | `ParataBus3D` |
| 42220 | `GalaScena2D` |
| 42237 | `GalaStage3D` |
| 42598 | `SeasonAwardsScreen` |
| 43039 | `SeasonEndScreen` |
| 43575 | `ClubPresentationScreen` |
| 43649 | `PwaInstallBanner` |
| 43684 | `BallO` |
| 43706 | `Wordmark` |
| 43804 | `crediti254On` |
| 43805 | `crediti238On` |
| 43806 | `Crediti238` |
| 43840 | `HomeScreen` |
| 43995 | `VersioneTestata269` |
| 44002 | `LogoMark` |
| 44018 | `CreateScreen` |
| 44151 | `OffersScreen` |
| 44215 | `TrialFlow` |
| 44335 | `AISettingsCard` |
| 44410 | `NationalCallupScreen` |
| 44469 | `_NationalCallupScreenOld235` |
| 44538 | `calcLegacyScore` |
| 44556 | `getLegacyGrade` |
| 44564 | `generateRetirementBio` |
| 44601 | `CareerEndScreen` |
| 44997 | `buildCareerCard` |
| 45021 | `_simCupOtherMatches` |
| 45044 | `_simCupRemainder` |
| 45088 | `generateLeagueScorers` |
| 45117 | `generateCupScorers` |
| 45160 | `euroGroupTable` |
| 45190 | `euroPlayerTop2` |
| 45200 | `euroGroupKOPatch` |
| 45223 | `natGroupTable` |
| 45238 | `generateLeagueNews` |
| 45267 | `generateWorldResults` |
| 45307 | `generateMarketNews` |
| 45336 | `getWinStreak` |
| 45450 | `pickCoachWeekMsg` |
| 45475 | `pickCoachReview` |
| 45493 | `generateBio` |
| 45544 | `TutorialOverlay` |
| 45572 | `MilestoneCelebrationModal` |
| 45592 | `migratePlayer` |
| 46316 | `deriveStances` |
| 46341 | `stanceShift` |
| 46358 | `natCupStake686` |
| 46372 | `natCupNext700` |
| 46391 | `_etichettaTurno957` |
| 46401 | `_eur49` |
| 46406 | `_contratto49` |
| 46411 | `DiarioSfoglia` |
| 46445 | `FisHome66` |
| 46460 | `invEsito223` |
| 46464 | `invEsiti223` |
| 46465 | `invLegacy223` |
| 46466 | `eur223` |
| 46473 | `bank265` |
| 46475 | `efConto265` |
| 46476 | `sotto265` |
| 46477 | `invTesto223` |
| 46481 | `CareerApp` |
| 47084 | `_mdMatchesCtx` |
| 47109 | `_emInAttesa` |
| 47110 | `_mdSameVenue` |
| 47111 | `_isStaleMd` |
| 47152 | `getThisWeekMatchday` |
| 58132 | `_rvwLoad` |
| 58133 | `_rvwSave` |
| 58134 | `ReviewWizard` |
| 58265 | `SitTest` |
| 58305 | `IntroCinematic` |
| 58684 | `_cpmDev49` |
| 58685 | `SettingsScreen` |
| 58717 | `AudioSettings` |
| 58782 | `SettingsQuickBtn` |
| 58796 | `HomeNavBar` |
| 58811 | `App` |

