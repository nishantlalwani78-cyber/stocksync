const KEYS = {
  PRODUCTS: 'stocksync_products',
  LOGS: 'stocksync_logs',
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error('Storage error', e); }
}

// ── Products ──────────────────────────────────────────────
export function getProducts() { return load(KEYS.PRODUCTS, []); }

export function saveProducts(products) { save(KEYS.PRODUCTS, products); }

export function addProduct({ name, sku, ordered }) {
  const products = getProducts();
  const newProduct = {
    id: Date.now().toString(),
    name: name.trim(),
    sku: sku?.trim() || '',
    ordered: parseInt(ordered),
    delivered: 0,
    createdAt: new Date().toISOString(),
  };
  products.unshift(newProduct);
  saveProducts(products);
  addLog({ product: name, action: `Product added — ${ordered} units ordered`, by: 'Admin' });
  return newProduct;
}

export function addDelivery(productId, qty, by) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === productId);
  if (idx === -1) return;
  const p = products[idx];
  const amount = Math.min(qty, p.ordered - p.delivered);
  if (amount <= 0) return;
  products[idx] = { ...p, delivered: p.delivered + amount };
  saveProducts(products);
  addLog({ product: p.name, action: `+${amount} units delivered`, by });
  return products[idx];
}

// ── Logs ─────────────────────────────────────────────────
export function getLogs() { return load(KEYS.LOGS, []); }

export function addLog({ product, action, by }) {
  const logs = getLogs();
  logs.unshift({ id: Date.now().toString() + Math.random(), product, action, by, ts: new Date().toISOString() });
  // Keep only last 500 entries
  if (logs.length > 500) logs.length = 500;
  save(KEYS.LOGS, logs);
}
