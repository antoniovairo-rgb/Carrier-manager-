/* AI VISION REVIEW — PROVIDER REGISTRY (Open/Closed, LIVE_MATCH_QA_SPEC 3.12/3.13)
   Mappa nome→factory. Aggiungere un provider = registrare una factory: nessuna modifica
   al Core Engine. La factory riceve (config, logger) e ritorna un'istanza VisionProvider. */
const factories = new Map();

export function registerProvider(name, factory) {
  if (!name || typeof factory !== 'function') throw new Error('registerProvider: (name, factory) richiesti');
  factories.set(name, factory);
}

export function createProvider(name, config, logger) {
  const f = factories.get(name);
  if (!f) throw new Error(`provider sconosciuto: "${name}" — registrati: [${[...factories.keys()].join(', ') || 'nessuno'}]`);
  return f(config, logger);
}

export function listProviders() { return [...factories.keys()]; }
export function hasProvider(name) { return factories.has(name); }
export function _resetRegistry() { factories.clear(); } // solo per i test
