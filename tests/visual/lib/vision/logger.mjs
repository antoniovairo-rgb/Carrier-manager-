/* AI VISION REVIEW — LOGGER strutturato (AI_VISION_REVIEW.md §LOGGING)
   Log con timestamp + campi di contesto (highlight, provider, modello, validator, score,
   confidence, tempo, warning, errori). Raccoglie anche le entry per il report. Senza dipendenze. */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };

export function createLogger(level = 'info', base = {}) {
  const min = LEVELS[level] != null ? LEVELS[level] : LEVELS.info;
  const entries = [];
  const emit = (lvl, msg, fields) => {
    const e = { t: new Date().toISOString(), level: lvl, msg, ...base, ...(fields || {}) };
    entries.push(e);
    if (LEVELS[lvl] >= min) {
      const tag = `[vision:${lvl}]`;
      const ctx = fields && Object.keys(fields).length ? ' ' + JSON.stringify(fields) : '';
      const line = `${tag} ${msg}${ctx}`;
      (lvl === 'error' ? console.error : lvl === 'warn' ? console.warn : console.log)(line);
    }
    return e;
  };
  const api = {
    debug: (m, f) => emit('debug', m, f),
    info: (m, f) => emit('info', m, f),
    warn: (m, f) => emit('warn', m, f),
    error: (m, f) => emit('error', m, f),
    entries: () => entries.slice(),
    child: (fields) => createLogger(level, { ...base, ...fields }),
  };
  return api;
}
