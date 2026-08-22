# Mappa del sorgente — Korward Elite 7.548.0

_Generata da `tools/mappa.mjs` su 41.399 righe._

```
node tools/mappa.mjs > docs/MAPPA.md
```

## Stato della partita (useRef)  (113)

Il cuore del motore: ogni ref e' un pezzo di stato che sopravvive ai render.

| riga | |
|---:|---|
| 596 | `containerRef` = null |
| 11316 | `mountRef` = null |
| 11318 | `propsRef` = props |
| 19205 | `numHLRef` = 0 |
| 19206 | `hlTimesRef` = [] |
| 19262 | `subbedOffRef` = false |
| 19270 | `heroFoulCntRef` = 0 |
| 19271 | `sentOffRef` = false |
| 19272 | `subOffMinRef` = 0 |
| 19273 | `subOffWhyRef` = "" |
| 19274 | `subOffAtRef` = (( |
| 19290 | `tacticBonusRef` = 0 |
| 19293 | `subFiredRef` = false |
| 19295 | `reactiveHLQueueRef` = [] |
| 19296 | `desperateFiredRef` = false |
| 19297 | `earlyDespRef` = false |
| 19298 | `halfFiredRef` = _rsCk138>=45 |
| 19363 | `situationsRef` = situations |
| 19372 | `heatPointsRef` = [] |
| 19374 | `gkDiveRef` = null |
| 19454 | `matchPlayersRef` = null |
| 19501 | `oppTacticRef` = null |
| 19512 | `clockRef` = _rsClock |
| 19515 | `scoreRef` = _rsScore |
| 19516 | `wasBehindRef` = false |
| 19582 | `ceremonyEndRef` = null |
| 19634 | `soStateRef` = null |
| 19636 | `soDoneRef` = false |
| 19696 | `hlIdxRef` = 0 |
| 19697 | `handleActionRef` = null |
| 19698 | `handleRigoreRef` = null |
| 19699 | `handleContinueRef` = null |
| 19700 | `_rvwChainOkRef` = true |
| 19703 | `pPosRef` = {x:58,y:50} |
| 19704 | `_contKeyRef` = null |
| 19705 | `_stagedSpotRef` = null |
| 19706 | `deliverRef` = null |
| 19707 | `_dlvSeenRef` = null |
| 19708 | `_batRef` = {arm:null,done:null} |
| 19709 | `meshDefRef` = null |
| 19712 | `mStatsSnapRef` = mStats |
| 19713 | `assistLinksRef` = {given:[],received:[]} |
| 19726 | `possessionRef` = 50 |
| 19728 | `lastShoutRef` = {ck:-99,txt:""} |
| 19730 | `ballPosRef` = {x:50,y:50} |
| 19739 | `lastBGEvtRef` = [] |
| 19748 | `_lastFlashRef` = 0 |
| 19758 | `cineBusyRef` = null |
| 19759 | `goalCelebRef` = null |
| 19761 | `_celEndRef` = 0 |
| 19763 | `celebRecentRef` = [] |
| 19836 | `outcomeRevealRef` = null |
| 19842 | `streakRef` = 0 |
| 19869 | `sceneLogRef` = [] |
| 20112 | `pressureRef` = 1 |
| 20114 | `defDistRef` = 100 |
| 20115 | `movesLeftRef` = 0 |
| 20116 | `moveCoolRef` = 0 |
| 20117 | `driftTargetsRef` = null |
| 20118 | `ballTargetRef` = {x:50,y:50} |
| 20119 | `ballRngRef` = 0 |
| 20120 | `tramaRef` = null |
| 20134 | `_formRosterRef` = {} |
| 20148 | `kickRef` = 0 |
| 20149 | `kickoffRef` = 0 |
| 20150 | `spRef` = null |
| 20151 | `counterRef` = null |
| 20152 | `possTurnRef` = 1 |
| 20153 | `possSpellRef` = 35 |
| 20154 | `counterArmRef` = null |
| 20165 | `azioneRef` = null |
| 20166 | `ponteRef` = null |
| 20167 | `pendingGoalRef` = null |
| 20179 | `bgCoolRef` = 0 |
| 20182 | `telecronistiRef` = null |
| 20184 | `tcPresRef` = false |
| 20185 | `tcCountRef` = 0 |
| 20186 | `bgSubjRef` = null |
| 20187 | `chantTimersRef` = [] |
| 20190 | `fxTimersRef` = [] |
| 20191 | `resultShownRef` = 0 |
| 20192 | `_contLockRef` = false |
| 20194 | `pendingChainSitRef` = null |
| 20195 | `_forceSeqRef` = 0 |
| 20196 | `velRef` = {} |
| 20197 | `hlTickRef` = 0 |
| 20217 | `keysRef` = new Set( |
| 20218 | `moveRef` = null |
| 20223 | `lastComWallRef` = 0 |
| 20229 | `coachTimerRef` = null |
| 20307 | `_lmAliveRef` = true |
| 22483 | `selectedActionIdxRef` = 0 |
| 22485 | `pendingActionRef` = null |
| 22486 | `_hlActionFiredRef` = false |
| 22489 | `lastKbdMoveRef` = 0 |
| 29729 | `_committedMdRef` = new Set( |
| 29764 | `_playingMdRef` = null |
| 29809 | `showMatchPromptRef` = null |
| 29845 | `_trophyCountRef` = null |
| 29855 | `pendingMisterDiscorsoRef` = null |
| 29856 | `matchBenchStartRef` = false |
| 29857 | `matchEntryMinuteRef` = 60 |
| 29858 | `matchResumeRef` = null |
| 29861 | `coachDecisionRef` = null |
| 29862 | `matchTypeRef` = "league" |
| 29863 | `titleStakesRef` = null |
| 29882 | `notifQRef` = [] |
| 30039 | `saveTimerRef` = null |
| 30092 | `_flushRef` = null |
| 30590 | `_mktDoneRef` = null |
| 30591 | `_mktWkRef` = null |
| 30671 | `_wkMomentRef` = null |
| 30687 | `continuaBusyRef` = false |

## Hook di collaudo (window.__CPM_*)  (89)

Letti dalle sonde in `tests/visual`. Espongono lo stato, non cambiano il gioco.

| riga | |
|---:|---|
| 311 | `__CPM_RESEED` |
| 3474 | `__CPM_SP` |
| 11284 | `__CPM_TIMELINE` |
| 11302 | `__CPM_EV` |
| 11308 | `__CPM_CUTLIVE` |
| 11361 | `__CPM_DECOR` |
| 11417 | `__CPM_GLLOST` |
| 11418 | `__CPM_GLRESTORED` |
| 11570 | `__CPM_STADFAIL` |
| 11706 | `__CPM_PROCVIS` |
| 12026 | `__CPM_JUMBO455` |
| 12258 | `__CPM_ULTRAS` |
| 12527 | `__CPM_PROBE` |
| 12535 | `__CPM_GESTURE` |
| 12572 | `__CPM_STATE` |
| 12605 | `__CPM_BALL` |
| 12613 | `__CPM_OWN` |
| 12622 | `__CPM_FOOTBALL_STATE` |
| 12624 | `__CPM_REC_DRAIN` |
| 12681 | `__CPM_GESTI` |
| 12952 | `__CPM_SCENET` |
| 13012 | `__CPM_WD_FILL` |
| 13013 | `__CPM_WATCH_SNAP` |
| 13025 | `__CPM_REC_BUF` |
| 13036 | `__CPM_DBG51P` |
| 13037 | `__CPM_ARC` |
| 13144 | `__CPM_AR51` |
| 13407 | `__CPM_DISPATCH` |
| 13414 | `__CPM_DISPATCH2` |
| 13461 | `__CPM_AR52` |
| 13565 | `__CPM_MATEFX` |
| 13601 | `__CPM_O2BK` |
| 13605 | `__CPM_O2` |
| 13686 | `__CPM_AR54` |
| 13705 | `__CPM_AR53` |
| 14054 | `__CPM_O2SEL` |
| 14434 | `__CPM_GKACT` |
| 14497 | `__CPM_TLSEG` |
| 14749 | `__CPM_CROWD_TICK` |
| 15005 | `__CPM_PRE` |
| 15924 | `__CPM_RUNUP` |
| 16161 | `__CPM_CELDX` |
| 16162 | `__CPM_CELPOS` |
| 16164 | `__CPM_CELN` |
| 16398 | `__CPM_CER425` |
| 17623 | `__CPM_STRIDE` |
| 17665 | `__CPM_CELGST` |
| 17675 | `__CPM_CELARM` |
| 17677 | `__CPM_GST` |
| 17678 | `__CPM_GKTL` |
| 17805 | `__CPM_BJN478` |
| 19801 | `__CPM_CELEB` |
| 19848 | `__CPM_DEFDIST` |
| 19993 | `__CPM_LOAD_ALL` |
| 19996 | `__CPM_PPOS` |
| 19997 | `__CPM_BG_INJECT` |
| 19998 | `__CPM_FORCE_SIT` |
| 20038 | `__CPM_ACTS` |
| 20040 | `__CPM_RESOLVE` |
| 20045 | `__CPM_QUEUE_REACTIVE` |
| 20046 | `__CPM_NUMHL` |
| 20049 | `__CPM_FORCE_CEREMONY` |
| 20050 | `__CPM_PHASE` |
| 20051 | `__CPM_KO544` |
| 20052 | `__CPM_HLTIMES` |
| 20053 | `__CPM_CLOCK` |
| 20054 | `__CPM_SCORE` |
| 20055 | `__CPM_KO536` |
| 20060 | `__CPM_HUD_FORCE` |
| 20064 | `__CPM_IDMAP538` |
| 20067 | `__CPM_SO_FORCE` |
| 20068 | `__CPM_SO_STATE` |
| 20073 | `__CPM_SUBOFF` |
| 20074 | `__CPM_FORCE_SUBOFF` |
| 20075 | `__CPM_FORCE_BENCH` |
| 20076 | `__CPM_MM` |
| 20080 | `__CPM_BALL3` |
| 20084 | `__CPM_MP` |
| 20085 | `__CPM_AUTOPLAY` |
| 20126 | `__CPM_FORCE_FORM538` |
| 20593 | `__CPM_FILL_MOVES` |
| 22664 | `__CPM_LAST_K` |
| 22976 | `__CPM_CHAIN_COH` |
| 25073 | `__CPM_ACTOR` |
| 25195 | `__CPM_BADGE483` |
| 25507 | `__CPM_WVDBG` |
| 25913 | `__CPM_PARATA` |
| 29676 | `__CPM_ONDA7` |
| 30716 | `__CPM_CAREER` |

## Interruttori rossi (__CPM_NO*)  (83)

Ogni rimedio ha il suo: acceso, il difetto torna.

| riga | |
|---:|---|
| 1324 | `__CPM_NO471` |
| 2235 | `__CPM_NO463` |
| 11405 | `__CPM_NO533` |
| 11406 | `__CPM_NO552` |
| 11415 | `__CPM_NO535` |
| 11440 | `__CPM_NO556` |
| 11865 | `__CPM_NO534` |
| 11874 | `__CPM_NO550` |
| 12024 | `__CPM_NO455` |
| 12654 | `__CPM_NO467` |
| 12679 | `__CPM_NO547` |
| 13064 | `__CPM_NO460` |
| 13190 | `__CPM_NO526` |
| 13200 | `__CPM_NO515` |
| 13272 | `__CPM_NO531` |
| 13435 | `__CPM_NO514` |
| 13475 | `__CPM_NO546` |
| 14016 | `__CPM_NO464` |
| 14289 | `__CPM_NO512` |
| 14305 | `__CPM_NO519` |
| 14344 | `__CPM_NO513` |
| 14443 | `__CPM_NO465` |
| 14656 | `__CPM_NO439` |
| 14672 | `__CPM_NO511` |
| 15452 | `__CPM_NO392` |
| 15971 | `__CPM_NO440` |
| 16425 | `__CPM_NO476` |
| 16854 | `__CPM_NO503` |
| 16942 | `__CPM_NO524` |
| 17037 | `__CPM_NO482` |
| 17038 | `__CPM_NO520` |
| 17045 | `__CPM_NO525` |
| 17067 | `__CPM_NO505` |
| 17182 | `__CPM_NO523` |
| 17264 | `__CPM_NO507` |
| 17292 | `__CPM_NO521` |
| 17569 | `__CPM_NO518` |
| 17636 | `__CPM_NO516` |
| 17687 | `__CPM_NO517` |
| 17816 | `__CPM_NO497` |
| 19040 | `__CPM_NO562` |
| 19194 | `__CPM_NO564` |
| 19241 | `__CPM_NO500` |
| 20064 | `__CPM_NO538` |
| 20231 | `__CPM_NO540` |
| 20259 | `__CPM_NO541` |
| 20766 | `__CPM_NO539` |
| 20949 | `__CPM_NO489` |
| 20993 | `__CPM_NO549` |
| 21186 | `__CPM_NO553` |
| 21188 | `__CPM_NO501` |
| 21189 | `__CPM_NO485` |
| 21199 | `__CPM_NO536` |
| 21232 | `__CPM_NO532` |
| 21237 | `__CPM_NO543` |
| 21243 | `__CPM_NO559` |
| 21253 | `__CPM_NO563` |
| 21262 | `__CPM_NO542` |
| 21273 | `__CPM_NO544` |
| 21304 | `__CPM_NO551` |
| 21373 | `__CPM_NO486` |
| 21374 | `__CPM_NO528` |
| 21401 | `__CPM_NO499` |
| 21428 | `__CPM_NO537` |
| 21664 | `__CPM_NO498` |
| 21755 | `__CPM_NO488` |
| 21864 | `__CPM_NO490` |
| 22129 | `__CPM_NO527` |
| 22180 | `__CPM_NO572` |
| 22214 | `__CPM_NO558` |
| 22215 | `__CPM_NO555` |
| 22273 | `__CPM_NO478` |
| 22276 | `__CPM_NO484` |
| 22314 | `__CPM_NO554` |
| 22426 | `__CPM_NO428` |
| 23314 | `__CPM_NO461` |
| 23917 | `__CPM_NO548` |
| 23932 | `__CPM_NO565` |
| 25509 | `__CPM_NO479` |
| 26578 | `__CPM_NO445` |
| 28723 | `__CPM_NO472` |
| 29127 | `__CPM_NO473` |
| 32162 | `__CPM_NO477` |

## Tabelle dati  (192)

I repertori: righe di cronaca, moduli, situazioni, palette.

| riga | |
|---:|---|
| 353 | `TH_DARK` |
| 385 | `AVATARS` |
| 428 | `COACH_NPC_FACES` |
| 436 | `JOURNALIST_NPC_FACES` |
| 740 | `CLUBS` |
| 1019 | `ALL_U18_CLUBS` |
| 1022 | `LEAGUE_PAIRS` |
| 1025 | `LEAGUE_RECORDS` |
| 1153 | `EURO_SIGLA` |
| 1163 | `EURO_COMP_WINNERS` |
| 1206 | `CLUB_FOUNDED` |
| 1232 | `SHAPES` |
| 1326 | `WEEKLY_EVENTS` |
| 1492 | `WEEKLY_RANDOM_EVENTS` |
| 1552 | `TEAMMATE_ARCHETYPES` |
| 1559 | `SPOGLIATOIO_MOMENTS` |
| 1632 | `WEEKLY_IMPULSES` |
| 2099 | `JOURNALIST_POOL` |
| 2111 | `LEAGUE_NEWS_TEMPLATES` |
| 2173 | `VITA_EVENTS` |
| 2265 | `CAREER_MOMENTS` |
| 2465 | `ULTRAS_PREFIXES` |
| 2466 | `ULTRAS_SUFFIXES` |
| 2471 | `CAPTAIN_TEAM_TALKS` |
| 2483 | `INJURY_TYPES_META` |
| 2490 | `INJURY_REHAB` |
| 2512 | `COACH_DIALOGUES` |
| 2530 | `COACH_PROMISES` |
| 2552 | `SEASON_END_COACH` |
| 2583 | `SEASON_END_PRESIDENT` |
| 2660 | `ACHIEVEMENTS` |
| 2854 | `SITUATIONS` |
| 3305 | `ZONES` |
| 3408 | `SP_PEN` |
| 3414 | `SP_FK_NEAR` |
| 3419 | `SP_FK_FAR` |
| 3482 | `TELECRONISTI` |
| 3492 | `COMMENTO_TECNICO` |
| 3501 | `BG_MATCH` |
| 3787 | `OUTCOME_TX` |
| 3805 | `HL_OVERLAY_POOLS` |
| 3915 | `STADIUMS` |
| 3916 | `STADIUM_POOLS` |
| 3924 | `CLUB_STADIUMS` |
| 3952 | `CLUB_STADIUM_STYLE` |
| 3980 | `NATIONS` |
| 3982 | `FORMATION_HOME` |
| 3983 | `FORMATION_AWAY` |
| 4030 | `ARCHETYPE_STAT_BONUS` |
| 4208 | `AGENT_ARCHETYPES` |
| 4224 | `AGENT_AMBITIONS` |
| 4244 | `AGENT_NAME_POOL` |
| 4315 | `AGENT_INTRO_REPLY` |
| 4371 | `AGENT_CHECKIN_OPTS` |
| 4377 | `AGENT_CHECKIN_REPLY` |
| 4391 | `AMB_TXT` |
| 4435 | `AGENT_INIT_KINDS` |
| 4475 | `AGENT_INIT_TXT` |
| 4554 | `AGENT_HINT_TXT` |
| 4644 | `CLUB_SPONSOR_POOL` |
| 4816 | `ARCHETYPES` |
| 4827 | `NPC_PERSONAS` |
| 4835 | `NEWSPAPERS` |
| 5210 | `EM_KO_ORDER` |
| 5211 | `EM_KO_LABEL` |
| 5217 | `EVENT_SCOPE` |
| 5247 | `IV_TONE_LBL` |
| 5248 | `IV_TONE_COL` |
| 5249 | `INTERVIEW_QS` |
| 6382 | `COACH_NAMES` |
| 6383 | `COACH_STYLES` |
| 6392 | `DERBIES` |
| 6444 | `SQUAD_ROLES` |
| 6527 | `RIVAL_FIRST` |
| 6528 | `RIVAL_LAST` |
| 6587 | `WEATHER_TYPES` |
| 6658 | `CROWD_CHANTS` |
| 6676 | `CROWD_CHANTS_LG` |
| 6768 | `CROWD_CHANTS_NAT` |
| 6800 | `LEAGUE_COMP_COL` |
| 6801 | `LG_LANG` |
| 6802 | `NAT_LANG` |
| 6803 | `LANG_CHANTS` |
| 6861 | `SLOT_KEYS` |
| 6992 | `CATS` |
| 7012 | `URL_SFX` |
| 7093 | `NOTE` |
| 7259 | `SCENES` |
| 7524 | `SCOUT_EXPLOITS` |
| 7532 | `SCOUT_SOLID` |
| 7663 | `FALLBACK_SURNAMES` |
| 7825 | `FIRSTNAMES_IT` |
| 7826 | `SURNAMES_IT` |
| 7827 | `FIRSTNAMES_EN` |
| 7828 | `SURNAMES_EN` |
| 7829 | `FIRSTNAMES_ES` |
| 7830 | `SURNAMES_ES` |
| 7831 | `FIRSTNAMES_DE` |
| 7832 | `SURNAMES_DE` |
| 7833 | `FIRSTNAMES_FR` |
| 7834 | `SURNAMES_FR` |
| 7835 | `FIRSTNAMES_PT` |
| 7836 | `SURNAMES_PT` |
| 7837 | `NAME_BY_NAT` |
| 8440 | `CROWD_CFG` |
| 8476 | `CLUB_IDENTITY` |
| 8643 | `STADIUM_TEMPLATES` |
| 8656 | `STADIUM_LG_TPL` |
| 8783 | `RITIRO_LOCS` |
| 8798 | `RITIRO_HOTELS` |
| 8799 | `RITIRO_CENTRI` |
| 8800 | `RITIRO_SPONSOR` |
| 8801 | `RITIRO_EVENTS` |
| 8860 | `PREPS` |
| 9533 | `SKINS` |
| 9534 | `HAIRS` |
| 9535 | `CLOTHES` |
| 10518 | `ATE3_LABEL` |
| 10519 | `ATE3_TYPEMS` |
| 10520 | `ATE3_ARCMS` |
| 10521 | `ATE3_ARCCOL` |
| 10523 | `HL_ZONE_3D` |
| 10693 | `CELEBRATIONS` |
| 10746 | `HL_ZONE_COL` |
| 11211 | `INTENT_TITLE` |
| 11281 | `MATCH_TL` |
| 11299 | `MATCH_EV` |
| 11576 | `SKN_TONES` |
| 11638 | `GK_POOL` |
| 11931 | `AD_BRANDS` |
| 12649 | `GESTURE_WIN` |
| 12666 | `GESTI` |
| 12717 | `BALL_ARC_BY_TYPE` |
| 18383 | `KIT_PATTERN` |
| 18574 | `HOME_NUMS` |
| 18575 | `AWAY_NUMS` |
| 18722 | `ALT_KITS` |
| 18809 | `KIT_PALETTE` |
| 18866 | `SKIN_TONES` |
| 18867 | `HAIR_COLS` |
| 18986 | `COACH_ORDERS` |
| 19018 | `COACH_SHOUTS` |
| 19061 | `SUB_EVENTS` |
| 19068 | `CHAIN_SITS` |
| 19195 | `MATCH_SPEEDS` |
| 20127 | `TRAMA_ID538` |
| 20204 | `DRIFT_PRESETS` |
| 20215 | `BG_ARC_MAP` |
| 22993 | `RIGORE_DIRS` |
| 22994 | `RIGORE_ARROWS` |
| 22995 | `RIGORE_LABELS` |
| 25915 | `SHOTS` |
| 27057 | `COACH_QUOTES` |
| 27065 | `ATMOS` |
| 27540 | `TRIAL_OPPONENTS` |
| 27714 | `NAT_DATA` |
| 27726 | `NAT_CLUB_DATA` |
| 28170 | `CHALLENGES` |
| 28190 | `LOCALE` |
| 28308 | `ROUND_KEYS` |
| 28331 | `CAREER_MILESTONES` |
| 28358 | `FNAMES` |
| 28359 | `LNAMES` |
| 28532 | `TOP_LGS` |
| 28554 | `MARKET_NEWS_TPL` |
| 28603 | `MONTHLY_COACH_REVIEWS` |
| 28794 | `TUTORIAL_STEPS` |
| 29640 | `DRIVER_MORALE` |
| 29658 | `STANCE_EVENT` |
| 30352 | `OPENING_LBL` |
| 30418 | `RITIRO_BEHAVIORS` |
| 30853 | `NAT_POOL_EU` |
| 30854 | `NAT_POOL_WORLD` |
| 31242 | `PACT_K` |
| 31248 | `PACT_OPEN` |
| 31249 | `PACT_REW` |
| 31288 | `RATE` |
| 31342 | `SAGA_ARCS` |
| 31784 | `PIAZZA` |
| 31801 | `PHASE_ARCS` |
| 32022 | `PRES_TONI` |
| 32056 | `SERIALS` |
| 33500 | `NAT_LEVEL` |
| 34465 | `CUP_ROUND_WEEKS` |
| 34466 | `CUP_ROUND_NAMES` |
| 37635 | `KO_NAMES` |
| 37742 | `ZONE_COLORS` |
| 38916 | `MEM_META` |
| 38948 | `DTYPE` |
| 40155 | `ROUNDS` |
| 40628 | `CAPS` |
| 41201 | `KEYS` |

## Funzioni di primo livello  (331)

| riga | |
|---:|---|
| 372 | `thPastel` |
| 402 | `_dbAv` |
| 409 | `AvatarSVG` |
| 444 | `NpcFace` |
| 493 | `npcFaceIdx` |
| 502 | `npcCoachAvOpts` |
| 512 | `NpcFaceCoach` |
| 524 | `_disposeHeroPhotoRenderer` |
| 527 | `_ensureHeroPhotoAssets` |
| 584 | `AvatarPhoto` |
| 595 | `Player3DViewer` |
| 739 | `mkT` |
| 1154 | `euroSig` |
| 1160 | `compLbl` |
| 1187 | `EmoText` |
| 1201 | `_surnBG` |
| 1209 | `clubFoundedYear` |
| 1210 | `TeamBadge` |
| 1323 | `_criticaOk` |
| 1324 | `_mktFresh` |
| 1325 | `_mktOk` |
| 1453 | `resolveEvText` |
| 1469 | `impulseFreshBucket` |
| 1611 | `_brandOk453` |
| 1615 | `_notoOk453` |
| 1623 | `_statusOk453` |
| 2145 | `careerPhase` |
| 2172 | `_vitaAgName` |
| 2215 | `pickVitaEvent` |
| 2256 | `markVitaEvent` |
| 2619 | `getPresidentOpeningQuote` |
| 2717 | `deriveIntent` |
| 2853 | `A` |
| 3314 | `getZone` |
| 3319 | `filterSitActions` |
| 3363 | `cappedMM` |
| 3374 | `isPenaltySit` |
| 3375 | `inBoxHL` |
| 3376 | `hideDirCursor` |
| 3381 | `isAimSit` |
| 3423 | `spSkill` |
| 3424 | `spGk` |
| 3428 | `spPressure` |
| 3437 | `setPieceChoices` |
| 3440 | `resolveSetPieceShot` |
| 3457 | `pickSetPieceChoiceAI` |
| 3466 | `setPieceOptions` |
| 3500 | `pickTelecronisti` |
| 3857 | `_missKindNorm` |
| 3868 | `_hlOvlCat` |
| 3895 | `hlOverlay` |
| 3957 | `getStadiumStyle` |
| 3961 | `getStadiumName` |
| 3993 | `_cpmRnd` |
| 4000 | `rng` |
| 4001 | `rngF` |
| 4002 | `clamp` |
| 4006 | `popGain` |
| 4016 | `pick` |
| 4017 | `shuffle` |
| 4021 | `wPick` |
| 4022 | `baseStats` |
| 4028 | `calcOvr` |
| 4040 | `succRate` |
| 4053 | `calcXG` |
| 4064 | `adaptiveDifficulty` |
| 4085 | `trainAgeMult` |
| 4087 | `archGrowthMult` |
| 4090 | `calcMarketValue` |
| 4110 | `getLeagueClubs` |
| 4133 | `getStartPos` |
| 4140 | `postHighlightDuration` |
| 4154 | `transferCredibility` |
| 4167 | `_ovrToAnnualWage133` |
| 4180 | `_ovrToWageWeekly133` |
| 4186 | `_fmtWageY133` |
| 4220 | `AGENT_ARCH_BY_ID` |
| 4245 | `agentNameFor` |
| 4252 | `agentHirePatch` |
| 4265 | `agentHireFee` |
| 4272 | `agentHintCheck` |
| 4298 | `agentIntroOptions` |
| 4326 | `agentIntroLine` |
| 4346 | `agentCheckinDue` |
| 4387 | `agentCheckinAsk` |
| 4408 | `agentCheckinApply` |
| 4443 | `_sottopagato378` |
| 4444 | `agentInitiative` |
| 4482 | `agentInitLine` |
| 4492 | `agentCandidates` |
| 4511 | `agentPartPatch` |
| 4529 | `agentRapportDrift` |
| 4545 | `agentRapportAdvice` |
| 4565 | `agentRosterFor` |
| 4571 | `agentRapportTier` |
| 4583 | `agentRemember` |
| 4595 | `agentInit` |
| 4604 | `agentAdvice` |
| 4645 | `genClubSponsor` |
| 4654 | `generateTransferOffer` |
| 4723 | `generateProContracts` |
| 4789 | `generateSeasonObjectives` |
| 4833 | `getClubPersona` |
| 4843 | `_genNpcJerseyNums` |
| 4849 | `_getAvailNums` |
| 5229 | `isNationalEvent` |
| 5234 | `openDonation` |
| 5236 | `_feedbackTo` |
| 5237 | `openFeedback` |
| 5242 | `APP_ENV` |
| 6339 | `pickInterviewByCtx` |
| 6414 | `isDerby` |
| 6419 | `calcMatchWeight` |
| 6446 | `calcSquadRole` |
| 6464 | `calcCoachDecision` |
| 6529 | `generateRival` |
| 6541 | `generateTeammates` |
| 6556 | `syncTeammateNames` |
| 6565 | `generateJournalists` |
| 6570 | `getJournalistRelLabel` |
| 6578 | `generateUltrasName` |
| 6617 | `weatherNightDisp` |
| 6626 | `climateWeights` |
| 6644 | `seasonalWeights` |
| 6855 | `chantPoolFor` |
| 6918 | `toThree` |
| 6974 | `devToolsOn` |
| 6975 | `setDevTools` |
| 7454 | `toggleAIMock` |
| 7537 | `oppMatchProfile` |
| 7547 | `scoutActionMod` |
| 7554 | `generateLocalScoutReport` |
| 7634 | `generateLocalPressAnalysis` |
| 7862 | `_auditCopyrightSafety` |
| 7899 | `hashStr` |
| 7900 | `generateTeamRoster` |
| 7925 | `seededShuffle` |
| 7932 | `generateSeasonCalendar` |
| 7969 | `_isYouthClubName` |
| 7970 | `proCareerOf` |
| 7983 | `_scOf` |
| 7994 | `buildSeasonCarry` |
| 8019 | `leagueGoalsOf` |
| 8031 | `euroSeasonGoalsOf` |
| 8040 | `euroSeasonAssistsOf` |
| 8049 | `leagueAssistsOf` |
| 8062 | `_objSpent` |
| 8064 | `objCurrent` |
| 8068 | `objDone` |
| 8076 | `seasonSplitShare` |
| 8103 | `_roundPrep91` |
| 8109 | `titleClinchedNow` |
| 8124 | `rivalSeasonGoals` |
| 8140 | `generateSeasonAwards` |
| 8315 | `initStandings` |
| 8324 | `updateStandings` |
| 8395 | `standingsSeed` |
| 8398 | `seededRng` |
| 8400 | `seededPoissonGoals` |
| 8403 | `calcWorldStandings` |
| 8527 | `_natCode` |
| 8530 | `clubProfile` |
| 8555 | `profileCapacity` |
| 8570 | `computeCrowdContext` |
| 8668 | `stadiumConfigFor` |
| 8718 | `calcAttendance` |
| 8740 | `poissonGoals` |
| 8748 | `koShootoutWin` |
| 8818 | `ritiroPlan` |
| 8869 | `ritiroHierarchyVerdict` |
| 8883 | `ritiroFriendlies` |
| 8928 | `draftBugNote` |
| 9185 | `refuseEcho` |
| 9235 | `simulateMatch` |
| 9259 | `_pSimStats` |
| 9278 | `_heroSimLine` |
| 9312 | `StatBar` |
| 9319 | `OvrRing` |
| 9323 | `Notif` |
| 9325 | `Sparkline` |
| 9353 | `SectionHeader` |
| 9367 | `Badge` |
| 9375 | `MatchBadge` |
| 9384 | `Meter` |
| 9397 | `KpiTile` |
| 9416 | `EmptyState` |
| 9426 | `Skeleton` |
| 9431 | `Modal` |
| 9446 | `BottomSheet` |
| 9458 | `Tabs` |
| 9467 | `Tooltip` |
| 9472 | `DataTable` |
| 9485 | `Bracket` |
| 9501 | `Toast` |
| 9525 | `makeCrowdTex` |
| 9711 | `getStadiumPalette` |
| 9789 | `_cvRoundRect` |
| 9791 | `_cvBall` |
| 9802 | `_cvLogoBadge` |
| 9813 | `_cvWordmark` |
| 9842 | `buildStadium` |
| 10444 | `makeToonGrad` |
| 10451 | `loadGLB` |
| 10471 | `colorCharGLB` |
| 10546 | `deriveReception` |
| 10600 | `isReceptionSit` |
| 10604 | `hlBallSpot` |
| 10637 | `goalContext` |
| 10687 | `_scrive386` |
| 10715 | `pickCelebration` |
| 10757 | `deriveBallState` |
| 10769 | `deriveSitCine` |
| 10789 | `_hyBump478` |
| 10793 | `hlBallState` |
| 10802 | `aerialContactY` |
| 10817 | `deriveHL` |
| 10927 | `buildHLTimeline` |
| 11013 | `validateHLTimeline` |
| 11042 | `resolveTimeline` |
| 11065 | `decideExecution` |
| 11134 | `resolveDefensiveOutcome` |
| 11197 | `intentLabel` |
| 11213 | `intentTitle` |
| 11224 | `stateIncoherent` |
| 11230 | `intentIntro` |
| 11237 | `intentLabelDedup` |
| 11249 | `bgMicroTick` |
| 11282 | `cpmEmit` |
| 11283 | `cpmTimelineReset` |
| 11300 | `cpmEv` |
| 11301 | `cpmEvReset` |
| 11309 | `ThreeMatchView` |
| 17890 | `DPad` |
| 17917 | `ScoutReportScreen` |
| 18013 | `PostMatchPress` |
| 18116 | `PressScreen` |
| 18220 | `AIDecisionOverlay` |
| 18263 | `flagColsOf` |
| 18264 | `_flagCode` |
| 18266 | `leagueFlagBg` |
| 18267 | `MatchdayCard` |
| 18425 | `kitPatternFor` |
| 18438 | `JerseyIcon` |
| 18525 | `rosterRows` |
| 18539 | `TeamFormation` |
| 18565 | `FormationView` |
| 18719 | `hexToRgb` |
| 18720 | `colorDist` |
| 18724 | `_hueOf` |
| 18725 | `_satOf` |
| 18727 | `kitsClash` |
| 18744 | `resolveKitConflict` |
| 18751 | `hexLum` |
| 18753 | `buildKit` |
| 18761 | `kitPatternTex` |
| 18810 | `_mixHex` |
| 18811 | `clubKits` |
| 18833 | `kitPerceived` |
| 18839 | `selectMatchKits` |
| 18869 | `_mix32` |
| 18871 | `appearanceFromSeed` |
| 18876 | `selectContextualSituations` |
| 19002 | `selectCoachOrder` |
| 19038 | `pickCoachShout` |
| 19103 | `coachPostMatch` |
| 19198 | `readMatchSpeed` |
| 19202 | `LiveMatch` |
| 24647 | `ProTransitionScreen` |
| 24737 | `getCareerPhase` |
| 24744 | `getSeasonNarrative` |
| 24775 | `getSeasonHeadline` |
| 24794 | `getBestSeasonMatch` |
| 24830 | `journalistIsFemale` |
| 24832 | `InterviewStage3D` |
| 25336 | `PresentationStage3D` |
| 25679 | `ParataBus3D` |
| 25979 | `GalaStage3D` |
| 26271 | `SeasonAwardsScreen` |
| 26509 | `SeasonEndScreen` |
| 27054 | `ClubPresentationScreen` |
| 27128 | `PwaInstallBanner` |
| 27163 | `BallO` |
| 27185 | `Wordmark` |
| 27205 | `HomeScreen` |
| 27344 | `LogoMark` |
| 27360 | `CreateScreen` |
| 27485 | `OffersScreen` |
| 27549 | `TrialFlow` |
| 27669 | `AISettingsCard` |
| 27738 | `NationalCallupScreen` |
| 27807 | `calcLegacyScore` |
| 27824 | `getLegacyGrade` |
| 27832 | `generateRetirementBio` |
| 27869 | `CareerEndScreen` |
| 28260 | `buildCareerCard` |
| 28284 | `_simCupOtherMatches` |
| 28307 | `_simCupRemainder` |
| 28351 | `generateLeagueScorers` |
| 28380 | `generateCupScorers` |
| 28423 | `euroGroupTable` |
| 28453 | `euroPlayerTop2` |
| 28463 | `euroGroupKOPatch` |
| 28486 | `natGroupTable` |
| 28501 | `generateLeagueNews` |
| 28530 | `generateWorldResults` |
| 28565 | `generateMarketNews` |
| 28594 | `getWinStreak` |
| 28708 | `pickCoachWeekMsg` |
| 28733 | `pickCoachReview` |
| 28751 | `generateBio` |
| 28802 | `TutorialOverlay` |
| 28830 | `MilestoneCelebrationModal` |
| 28848 | `TrainPanel` |
| 28948 | `migratePlayer` |
| 29641 | `deriveStances` |
| 29666 | `stanceShift` |
| 29677 | `CareerApp` |
| 30188 | `_mdMatchesCtx` |
| 30203 | `_mdSameVenue` |
| 30204 | `_isStaleMd` |
| 30241 | `getThisWeekMatchday` |
| 40450 | `_rvwLoad` |
| 40451 | `_rvwSave` |
| 40452 | `ReviewWizard` |
| 40583 | `SitTest` |
| 40623 | `IntroCinematic` |
| 40974 | `SettingsScreen` |
| 41010 | `AudioSettings` |
| 41071 | `SettingsQuickBtn` |
| 41085 | `HomeNavBar` |
| 41100 | `App` |

