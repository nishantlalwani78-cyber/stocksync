import { useState, useEffect, useCallback } from 'react';
import { getProducts, getLogs, addProduct, addDelivery } from './storage.js';
import './App.css';

const PINS = { admin: '1234', staff: '0000' };

// ── FORMAT DATE ────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true });
}

// ── LOGIN ──────────────────────────────────────────────────
function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const attempt = () => {
    if (pin === PINS.admin) return onLogin('admin');
    if (pin === PINS.staff) return onLogin('staff');
    setErr('Wrong PIN. Try again.');
    setPin('');
  };

  return (
    <div className="login-wrap">
      <div className="login-card fade">
        <div className="brand"><span className="brand-mark">S</span><span className="brand-name">StockSync</span></div>
        <p className="login-sub">Inventory Tracking System</p>
        <div className="field">
          <label>PIN</label>
          <input type="password" inputMode="numeric" maxLength={6} value={pin}
            onChange={e => { setPin(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            placeholder="Enter PIN" autoFocus />
        </div>
        {err && <p className="err-msg">{err}</p>}
        <button className="btn primary full" onClick={attempt}>Login →</button>
        <p className="hint">Admin: 1234 &nbsp;·&nbsp; Staff: 0000</p>
      </div>
    </div>
  );
}

// ── ADD PRODUCT MODAL ──────────────────────────────────────
function AddProductModal({ onClose, onSaved }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [qty, setQty] = useState('');
  const [err, setErr] = useState('');

  const save = () => {
    if (!name.trim()) return setErr('Product name required.');
    const q = parseInt(qty);
    if (!q || q < 1) return setErr('Enter a valid quantity.');
    addProduct({ name, sku, ordered: q });
    onSaved();
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2>Add Product</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="field"><label>Product Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Nike Air Max 90" autoFocus /></div>
          <div className="field"><label>SKU (optional)</label><input value={sku} onChange={e => setSku(e.target.value)} placeholder="e.g. NK-AM90-BLK" /></div>
          <div className="field"><label>Total Ordered Quantity *</label><input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} placeholder="e.g. 200" /></div>
          {err && <p className="err-msg">{err}</p>}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={save}>Add Product</button>
        </div>
      </div>
    </div>
  );
}

// ── DELIVERY MODAL ─────────────────────────────────────────
function DeliveryModal({ product, role, onClose, onSaved }) {
  const [qty, setQty] = useState('');
  const [err, setErr] = useState('');
  const pending = product.ordered - product.delivered;

  const deliver = (amount) => {
    const n = amount || parseInt(qty);
    if (!n || n < 1) return setErr('Enter a valid quantity.');
    if (n > pending) return setErr(`Max you can deliver: ${pending}`);
    addDelivery(product.id, n, role === 'admin' ? 'Admin' : 'Staff');
    onSaved();
    onClose();
  };

  const quick = [5, 10, 25, 50, 100].filter(a => a <= pending);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head"><h2>Add Delivery</h2><button className="close-btn" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="product-info">
            <p className="pi-name">{product.name}</p>
            {product.sku && <p className="pi-sku">{product.sku}</p>}
            <div className="pi-stats">
              <span>Ordered <strong>{product.ordered}</strong></span>
              <span>Delivered <strong className="clr-green">{product.delivered}</strong></span>
              <span>Pending <strong className="clr-orange">{pending}</strong></span>
            </div>
          </div>

          {quick.length > 0 && (
            <div className="quick-section">
              <p className="quick-lbl">Quick add</p>
              <div className="quick-row">
                {quick.map(a => (
                  <button key={a} className="btn quick" onClick={() => deliver(a)}>+{a}</button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label>Custom quantity</label>
            <input type="number" min="1" max={pending} value={qty}
              onChange={e => { setQty(e.target.value); setErr(''); }}
              placeholder={`1 – ${pending}`} />
          </div>
          {err && <p className="err-msg">{err}</p>}
        </div>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn green" onClick={() => deliver(null)} disabled={!qty}>✓ Mark Delivered</button>
        </div>
      </div>
    </div>
  );
}

// ── ACTIVITY LOG ───────────────────────────────────────────
function LogPanel({ logs }) {
  return (
    <div className="log-panel fade">
      <div className="log-head">
        <h3>Activity Log</h3>
        <span className="log-count">{logs.length} entries</span>
      </div>
      {logs.length === 0
        ? <p className="empty-msg">No activity yet.</p>
        : (
          <div className="log-list">
            {logs.map(log => (
              <div className="log-item" key={log.id}>
                <div className="log-dot" />
                <div>
                  <p className="log-product">{log.product}</p>
                  <p className="log-action">{log.action}</p>
                  <p className="log-meta">{log.by} · {fmtDate(log.ts)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ── MAIN APP ───────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deliverTarget, setDeliverTarget] = useState(null);

  const refresh = useCallback(() => {
    setProducts(getProducts());
    setLogs(getLogs());
  }, []);

  useEffect(() => { if (role) refresh(); }, [role, refresh]);

  const filtered = products.filter(p => {
    const status = p.delivered >= p.ordered ? 'completed' : 'pending';
    const matchF = filter === 'all' || filter === status;
    const matchS = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
    return matchF && matchS;
  });

  const totalOrdered = products.reduce((s, p) => s + p.ordered, 0);
  const totalDelivered = products.reduce((s, p) => s + p.delivered, 0);
  const completedCount = products.filter(p => p.delivered >= p.ordered).length;

  if (!role) return <Login onLogin={setRole} />;

  return (
    <div className="app">
      {/* NAV */}
      <nav className="nav">
        <div className="nav-left">
          <div className="brand"><span className="brand-mark">S</span><span className="brand-name">StockSync</span></div>
          <div className="nav-tabs">
            <button className={`nav-tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>Dashboard</button>
            <button className={`nav-tab ${tab === 'log' ? 'active' : ''}`} onClick={() => setTab('log')}>Activity Log</button>
          </div>
        </div>
        <div className="nav-right">
          <span className={`role-tag ${role}`}>{role === 'admin' ? '⚙ Admin' : '👤 Staff'}</span>
          <button className="btn ghost sm" onClick={() => setRole(null)}>Logout</button>
        </div>
      </nav>

      <div className="body">
        {tab === 'dashboard' ? (
          <>
            {/* STATS */}
            <div className="stats fade">
              <div className="stat"><span className="stat-lbl">Products</span><span className="stat-val">{products.length}</span></div>
              <div className="stat"><span className="stat-lbl">Total Ordered</span><span className="stat-val">{totalOrdered}</span></div>
              <div className="stat accent"><span className="stat-lbl">Total Delivered</span><span className="stat-val">{totalDelivered}</span></div>
              <div className="stat warn"><span className="stat-lbl">Pending Units</span><span className="stat-val">{totalOrdered - totalDelivered}</span></div>
              <div className="stat good"><span className="stat-lbl">Completed</span><span className="stat-val">{completedCount}/{products.length}</span></div>
            </div>

            {/* TOOLBAR */}
            <div className="toolbar fade">
              <input className="search" type="text" placeholder="Search product or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
              <div className="filters">
                {['all', 'pending', 'completed'].map(f => (
                  <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              {role === 'admin' && (
                <button className="btn primary" onClick={() => setShowAdd(true)}>+ Add Product</button>
              )}
            </div>

            {/* TABLE */}
            {products.length === 0 ? (
              <div className="empty fade">
                <p className="empty-icon">📦</p>
                <p className="empty-txt">No products yet. Admin can add products using the button above.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty fade"><p className="empty-txt">No products match your search or filter.</p></div>
            ) : (
              <div className="table-wrap fade">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th className="num">Ordered</th>
                      <th className="num">Delivered</th>
                      <th className="num">Pending</th>
                      <th>Progress</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p => {
                      const pending = p.ordered - p.delivered;
                      const pct = Math.min(100, Math.round((p.delivered / p.ordered) * 100));
                      const done = p.delivered >= p.ordered;
                      return (
                        <tr key={p.id} className={done ? 'row-done' : ''}>
                          <td className="td-name">{p.name}</td>
                          <td className="td-mono">{p.sku || '—'}</td>
                          <td className="num">{p.ordered}</td>
                          <td className="num clr-green">{p.delivered}</td>
                          <td className="num clr-orange">{pending}</td>
                          <td>
                            <div className="prog-wrap">
                              <div className="prog-bar"><div className="prog-fill" style={{ width: `${pct}%` }} /></div>
                              <span className="prog-pct">{pct}%</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${done ? 'badge-green' : 'badge-orange'}`}>
                              {done ? '✓ Completed' : '◷ Pending'}
                            </span>
                          </td>
                          <td>
                            {!done
                              ? <button className="btn deliver" onClick={() => setDeliverTarget(p)}>+ Delivery</button>
                              : <span className="done-lbl">✓ Done</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <LogPanel logs={logs} />
        )}
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onSaved={refresh} />}
      {deliverTarget && <DeliveryModal product={deliverTarget} role={role} onClose={() => setDeliverTarget(null)} onSaved={refresh} />}
    </div>
  );
}
