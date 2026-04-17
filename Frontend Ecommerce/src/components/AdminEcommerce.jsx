'use client';
import React, { useState, useEffect, useRef } from 'react';
import AxiosInstance from "@/components/AxiosInstance";

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (same luxury dark-gold system)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }

  :root {
    --gold:       #c9a84c;
    --gold-lt:    #e8c96e;
    --gold-dk:    #8a6a1f;
    --onyx:       #080809;
    --charcoal:   #0e0e10;
    --surface:    #141418;
    --surface2:   #1c1c22;
    --surface3:   #242430;
    --border:     #252530;
    --border-lt:  #343442;
    --text:       #ece9e0;
    --text-muted: #858590;
    --text-dim:   #3e3e4e;
    --emerald:    #2ec49a;
    --sapphire:   #4c8ef5;
    --ruby:       #e8506a;
    --amber:      #e8a030;
    --violet:     #9b6ef0;
    --font-serif: 'Cormorant Garamond', Georgia, serif;
    --font-sans:  'DM Sans', system-ui, sans-serif;
    --font-mono:  'DM Mono', 'JetBrains Mono', monospace;
  }

  body { background: var(--onyx); }

  ::-webkit-scrollbar       { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--gold-dk); border-radius: 2px; }

  @keyframes fadeUp    { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
  @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
  @keyframes spinCW    { to { transform: rotate(360deg); } }
  @keyframes shimmer   { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
  @keyframes goldPulse { 0%,100%{ box-shadow:0 0 0 0 #c9a84c20; } 50%{ box-shadow:0 0 0 6px #c9a84c00; } }
  @keyframes blink     { 0%,100%{ opacity:1; } 50%{ opacity:.3; } }

  .fade-up  { animation: fadeUp .32s cubic-bezier(.2,.8,.4,1) both; }
  .fade-in  { animation: fadeIn .22s ease both; }
  .spin     { animation: spinCW .7s linear infinite; }
  .shimmer-text {
    background: linear-gradient(90deg, var(--gold-dk) 0%, var(--gold-lt) 40%, var(--gold) 50%, var(--gold-lt) 60%, var(--gold-dk) 100%);
    background-size: 400% 100%;
    animation: shimmer 2.4s linear infinite;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .gold-text {
    background: linear-gradient(135deg, var(--gold-lt) 0%, var(--gold) 50%, var(--gold-dk) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* ── Noise overlay ── */
  .noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .018;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 160px;
  }

  /* ── Card ── */
  .card {
    background: linear-gradient(145deg, var(--surface) 0%, #131316 100%);
    border: 1px solid var(--border);
    position: relative;
  }
  .card::before {
    content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px;
    background: linear-gradient(135deg, var(--gold-dk), transparent 60%, var(--gold-dk));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none;
  }

  /* ── Buttons ── */
  .btn-primary {
    background: linear-gradient(135deg, var(--gold-dk) 0%, var(--gold) 50%, var(--gold-lt) 100%);
    color: #060608; font-family: var(--font-sans); font-weight: 700;
    font-size: .7rem; letter-spacing: .1em; text-transform: uppercase;
    border: none; cursor: pointer; position: relative; overflow: hidden;
    transition: all .2s;
  }
  .btn-primary::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent);
    transform: translateX(-100%); transition: transform .35s;
  }
  .btn-primary:hover::after { transform: translateX(100%); }
  .btn-primary:hover { box-shadow: 0 0 22px #c9a84c45, 0 4px 14px #00000060; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:disabled { background: var(--surface2); color: var(--text-dim); cursor: not-allowed; box-shadow: none; transform: none; }

  .btn-ghost {
    background: transparent; color: var(--text-muted);
    font-family: var(--font-mono); font-size: .65rem; letter-spacing: .12em; text-transform: uppercase;
    border: 1px solid var(--border); cursor: pointer; transition: all .2s;
  }
  .btn-ghost:hover { border-color: var(--gold); color: var(--gold); background: #c9a84c08; }

  .btn-danger {
    background: transparent; color: var(--ruby);
    font-family: var(--font-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
    border: 1px solid #e8506a28; cursor: pointer; transition: all .2s;
  }
  .btn-danger:hover { border-color: var(--ruby); background: #e8506a10; }

  .btn-success {
    background: transparent; color: var(--emerald);
    font-family: var(--font-mono); font-size: .65rem; letter-spacing: .1em; text-transform: uppercase;
    border: 1px solid #2ec49a28; cursor: pointer; transition: all .2s;
  }
  .btn-success:hover { border-color: var(--emerald); background: #2ec49a10; }

  /* ── Inputs ── */
  .inp {
    background: var(--surface2); border: 1px solid var(--border); color: var(--text);
    font-family: var(--font-mono); font-size: .78rem; outline: none;
    transition: border-color .2s, box-shadow .2s; width: 100%;
  }
  .inp:focus { border-color: var(--gold); box-shadow: 0 0 0 3px #c9a84c12; }
  .inp::placeholder { color: var(--text-dim); }
  .inp-label {
    font-family: var(--font-mono); font-size: .58rem; letter-spacing: .2em;
    text-transform: uppercase; color: var(--text-dim); display: block; margin-bottom: 5px;
  }

  /* ── Badges ── */
  .badge {
    font-family: var(--font-mono); font-size: .58rem; letter-spacing: .14em;
    text-transform: uppercase; padding: 2px 8px; border: 1px solid; display: inline-flex; align-items: center;
  }

  /* ── Section label ── */
  .sec-lbl {
    font-family: var(--font-mono); font-size: .56rem; letter-spacing: .24em;
    text-transform: uppercase; color: var(--text-dim);
    display: flex; align-items: center; gap: 10px; margin-bottom: 14px;
  }
  .sec-lbl::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, var(--border), transparent); }

  /* ── Tab buttons ── */
  .tab {
    font-family: var(--font-sans); font-size: .7rem; font-weight: 600;
    letter-spacing: .07em; text-transform: uppercase; padding: 14px 18px;
    background: transparent; border: none; border-bottom: 2px solid transparent;
    color: var(--text-dim); cursor: pointer; transition: all .2s; white-space: nowrap;
  }
  .tab:hover { color: var(--text-muted); }
  .tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* ── Table ── */
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl th {
    font-family: var(--font-mono); font-size: .54rem; letter-spacing: .2em;
    text-transform: uppercase; color: var(--text-dim); text-align: left;
    padding: 10px 14px; border-bottom: 1px solid var(--border); font-weight: 500;
  }
  .tbl td { padding: 12px 14px; border-bottom: 1px solid var(--border); font-size: .78rem; color: var(--text-muted); vertical-align: middle; }
  .tbl tr:hover td { background: var(--surface2); }
  .tbl tr:last-child td { border-bottom: none; }

  /* ── Status dot ── */
  .dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
  .dot-green  { background: var(--emerald); box-shadow: 0 0 6px var(--emerald); }
  .dot-red    { background: var(--ruby);    box-shadow: 0 0 6px var(--ruby); }
  .dot-amber  { background: var(--amber);   box-shadow: 0 0 6px var(--amber); }
  .dot-dim    { background: var(--text-dim); }

  /* ── Toast ── */
  .toast {
    font-family: var(--font-mono); font-size: .68rem;
    padding: 10px 16px; display: flex; align-items: center; gap: 10px;
    border-left: 3px solid; animation: fadeUp .22s ease;
    min-width: 200px; max-width: 320px;
  }

  /* ── Modal backdrop ── */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.75); z-index: 100;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn .18s ease;
  }
  .modal {
    background: var(--charcoal); border: 1px solid var(--border-lt);
    width: 100%; max-height: 90vh; overflow-y: auto;
    animation: fadeUp .22s cubic-bezier(.2,.8,.4,1);
  }

  /* ── Stat card ── */
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 18px 20px; display: flex; flex-direction: column; gap: 4px;
    position: relative; overflow: hidden; transition: border-color .2s;
  }
  .stat-card:hover { border-color: var(--border-lt); }
  .stat-card-accent { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; }

  /* ── Progress bar ── */
  .prog { height: 3px; background: var(--surface3); overflow: hidden; border-radius: 2px; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, var(--gold-dk), var(--gold-lt)); transition: width .5s; }

  /* ── Order status colors ── */
  .status-pending    { color: var(--amber); border-color: var(--amber); background: #e8a03010; }
  .status-booked     { color: var(--sapphire); border-color: var(--sapphire); background: #4c8ef510; }
  .status-in_process { color: var(--violet); border-color: var(--violet); background: #9b6ef010; }
  .status-delivered  { color: var(--emerald); border-color: var(--emerald); background: #2ec49a10; }
  .status-cancelled  { color: var(--ruby); border-color: var(--ruby); background: #e8506a10; }

  .payment-true  { color: var(--emerald); border-color: #2ec49a40; background: #2ec49a0d; }
  .payment-false { color: var(--amber);   border-color: #e8a03040; background: #e8a0300d; }
`;

/* ─── Toast system ─── */
let setToastsGlobal = null;
const toast = {
  push(type, msg) {
    const id = Date.now();
    if (setToastsGlobal) {
      setToastsGlobal(prev => [...prev, { id, type, msg }]);
    }
    setTimeout(() => {
      if (setToastsGlobal) {
        setToastsGlobal(prev => prev.filter(t => t.id !== id));
      }
    }, 4000);
  },
  success: (m) => toast.push('success', m),
  error:   (m) => toast.push('error', m),
  warn:    (m) => toast.push('warn', m),
  info:    (m) => toast.push('info', m),
};

const TOAST_CFG = {
  success: { bg: '#0b1c14', border: '#2ec49a', color: '#2ec49a', icon: '✓' },
  error:   { bg: '#1c0b10', border: '#e8506a', color: '#e8506a', icon: '✕' },
  warn:    { bg: '#1c160b', border: '#e8a030', color: '#e8a030', icon: '!' },
  info:    { bg: '#0b1018', border: '#4c8ef5', color: '#4c8ef5', icon: 'i' },
};

function Toasts() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => { 
    setToastsGlobal = setToasts; 
  }, []);
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999, display:'flex', flexDirection:'column', gap:8, pointerEvents:'none' }}>
      {toasts.map((t) => {
        const c = TOAST_CFG[t.type];
        return (
          <div key={t.id} className="toast" style={{ background: c.bg, borderLeftColor: c.border, color: c.color }}>
            <span style={{ fontWeight: 700 }}>[{c.icon}]</span>{t.msg}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Helpers ─── */
const fmt = {
  date:  (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'2-digit' }) : '—',
  dt:    (d) => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—',
  price: (v) => v != null ? `Rs.${Number(v).toLocaleString()}` : '—',
  cut:   (s, n = 40) => s && s.length > n ? s.slice(0, n) + '…' : (s || '—'),
  pct:   (v) => v != null ? `${v}%` : '—',
};

/* ─── UI Primitives ─── */
const SecLbl = ({ children }) => (
  <div className="sec-lbl"><span>{children}</span></div>
);

const Badge = ({ children, cls = '', color = '' }) => (
  <span className={`badge ${cls}`} style={color ? { color, borderColor: color + '40', background: color + '10' } : {}}>
    {children}
  </span>
);

const StatusBadge = ({ status }) => (
  <span className={`badge status-${status}`}>{status?.replace('_', ' ')}</span>
);

const PayBadge = ({ paid }) => (
  <span className={`badge payment-${paid}`}>{paid ? 'Paid' : 'Unpaid'}</span>
);

function PrimaryBtn({ children, loading, loadText = 'Loading…', style = {}, ...props }) {
  return (
    <button className="btn-primary" style={{ padding: '11px 22px', ...style }} {...props}>
      {loading ? (
        <span style={{ display:'flex', alignItems:'center', gap:7, justifyContent:'center' }}>
          <span className="spin" style={{ width:12, height:12, border:'2px solid #06060830', borderTop:'2px solid #060608', borderRadius:'50%', display:'inline-block' }}/>
          {loadText}
        </span>
      ) : children}
    </button>
  );
}

function Card({ children, style = {}, className = '' }) {
  return (
    <div className={`card ${className}`} style={{ padding: 20, ...style }}>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 600 }) {
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 22px', borderBottom:'1px solid var(--border)' }}>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.1rem', color:'var(--text)', letterSpacing:'.02em' }}>{title}</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-dim)', cursor:'pointer', fontSize:'1.2rem', lineHeight:1 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ruby)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}>✕</button>
        </div>
        <div style={{ padding:'20px 22px' }}>{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label className="inp-label">{label}</label>
      {children}
    </div>
  );
}

function EmptyState({ icon, text, action, actionLabel }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 20px', gap:14 }}>
      <span style={{ fontSize:'2.6rem', color:'var(--text-dim)' }}>{icon}</span>
      <p style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'.72rem', letterSpacing:'.14em', textTransform:'uppercase' }}>{text}</p>
      {action && <button className="btn-primary" style={{ padding:'10px 22px' }} onClick={action}>{actionLabel}</button>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' }}>
      <div className="spin" style={{ width:28, height:28, border:'2px solid var(--border)', borderTop:'2px solid var(--gold)', borderRadius:'50%' }}/>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════ */
export default function EcommerceAdmin() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab]         = useState('dashboard');
  const [loading, setLoading] = useState(false);

  /* Dashboard stats */
  const [dashStats, setDashStats] = useState(null);

  /* Products */
  const [products, setProducts]   = useState([]);
  const [prodPage, setProdPage]   = useState(1);
  const [prodCount, setProdCount] = useState(0);
  const [prodSearch, setProdSearch] = useState('');
  const [prodModal, setProdModal] = useState(null);
  const [editProd, setEditProd]   = useState(null);
  const [prodForm, setProdForm]   = useState({ name:'', description:'', price:'', group:'General', prod_has_category:'' });
  const [prodImages, setProdImages] = useState(null);

  /* Categories */
  const [categories, setCategories] = useState([]);
  const [catModal, setCatModal]     = useState(null);
  const [editCat, setEditCat]       = useState(null);
  const [catForm, setCatForm]       = useState({ name:'', description:'' });
  const [catImg, setCatImg]         = useState(null);

  /* Sales Products */
  const [salesProds, setSalesProds]   = useState([]);
  const [salesModal, setSalesModal]   = useState(null);
  const [editSales, setEditSales]     = useState(null);
  const [salesForm, setSalesForm]     = useState({ name:'', description:'', original_price:'', discount_percent:'0', salesprod_has_category:'' });

  /* Orders */
  const [orders, setOrders]           = useState([]);
  const [orderCount, setOrderCount]   = useState(0);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [orderModal, setOrderModal]   = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);

  /* Inventory */
  const [inventory, setInventory]     = useState([]);
  const [lowStock, setLowStock]       = useState([]);

  /* Coupons */
  const [coupons, setCoupons]         = useState([]);
  const [couponModal, setCouponModal] = useState(null);
  const [editCoupon, setEditCoupon]   = useState(null);
  const [couponForm, setCouponForm]   = useState({ code:'', discount_type:'percentage', discount_value:'', min_order_amount:'0', valid_from:'', valid_to:'', is_active:true });

  /* Returns */
  const [returns, setReturns]         = useState([]);
  const [returnFilter, setReturnFilter] = useState('');

  /* Contacts */
  const [contacts, setContacts]       = useState([]);

  /* Shipping */
  const [shipping, setShipping]       = useState([]);
  const [shipModal, setShipModal]     = useState(null);
  const [editShip, setEditShip]       = useState(null);
  const [shipForm, setShipForm]       = useState({ name:'', estimated_days:'', cost:'', is_active:true });

  /* Reviews */
  const [reviews, setReviews]         = useState([]);

  const imgRef = useRef(null);
  const catImgRef = useRef(null);

  /* ─── Init ─── */
  useEffect(() => {
    setMounted(true);
    loadDashboard();
    loadCategories();
  }, []);

  useEffect(() => {
    if (tab === 'products')   loadProducts();
    if (tab === 'categories') loadCategories();
    if (tab === 'sales')      loadSalesProducts();
    if (tab === 'orders')     loadOrders();
    if (tab === 'inventory')  loadInventory();
    if (tab === 'coupons')    loadCoupons();
    if (tab === 'returns')    loadReturns();
    if (tab === 'contacts')   loadContacts();
    if (tab === 'shipping')   loadShipping();
    if (tab === 'reviews')    loadReviews();
  }, [tab]);

  /* ─── Data loaders ─── */
  const loadDashboard = async () => {
    try {
      const [ord, prod, inv] = await Promise.allSettled([
        AxiosInstance.get('/api/myapp/v1/order/?limit=5'),
        AxiosInstance.get('/api/myapp/v1/product/?limit=1'),
        AxiosInstance.get('/api/myapp/v1/inventory/?is_low_stock=true&limit=1'),
      ]);
      setDashStats({
        orders:    ord.value?.data?.count ?? 0,
        products:  prod.value?.data?.count ?? 0,
        low_stock: inv.value?.data?.count ?? 0,
      });
    } catch (_) {}
  };

  const loadProducts = async (search = prodSearch, page = 1) => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get(`/api/myapp/v1/product/?search=${search}&page=${page}`);
      setProducts(r.data.data || []);
      setProdCount(r.data.count || 0);
    } catch (_) { toast.error('Could not load products'); }
    finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/category/?limit=100');
      setCategories(r.data.data || []);
    } catch (_) {}
  };

  const loadSalesProducts = async () => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/sales/product/');
      setSalesProds(r.data.data || []);
    } catch (_) { toast.error('Could not load sales products'); }
    finally { setLoading(false); }
  };

  const loadOrders = async (search = orderSearch, status = orderStatus, page = 1) => {
    setLoading(true);
    try {
      let url = `/api/myapp/v1/order/?page=${page}`;
      if (search) url += `&search=${search}`;
      if (status) url += `&status=${status}`;
      const r = await AxiosInstance.get(url);
      setOrders(r.data.data || []);
      setOrderCount(r.data.count || 0);
    } catch (_) { toast.error('Could not load orders'); }
    finally { setLoading(false); }
  };

  const loadOrderDetail = async (id) => {
    try {
      const r = await AxiosInstance.get(`/api/myapp/v1/order/?id=${id}`);
      setOrderDetail(r.data.data);
    } catch (_) {}
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [all, low] = await Promise.all([
        AxiosInstance.get('/api/myapp/v1/inventory/'),
        AxiosInstance.get('/api/myapp/v1/inventory/?is_low_stock=true'),
      ]);
      setInventory(all.data.data || []);
      setLowStock(low.data.data || []);
    } catch (_) { toast.error('Could not load inventory'); }
    finally { setLoading(false); }
  };

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/coupon/');
      setCoupons(r.data.data || []);
    } catch (_) { toast.error('Could not load coupons'); }
    finally { setLoading(false); }
  };

  const loadReturns = async (status = returnFilter) => {
    setLoading(true);
    try {
      const url = status ? `/api/myapp/v1/return/?status=${status}` : '/api/myapp/v1/return/';
      const r = await AxiosInstance.get(url);
      setReturns(r.data.data || []);
    } catch (_) { toast.error('Could not load returns'); }
    finally { setLoading(false); }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/contact/');
      setContacts(r.data.data || []);
    } catch (_) { toast.error('Could not load contacts'); }
    finally { setLoading(false); }
  };

  const loadShipping = async () => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/shipping/');
      setShipping(r.data.data || []);
    } catch (_) { toast.error('Could not load shipping'); }
    finally { setLoading(false); }
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const r = await AxiosInstance.get('/api/myapp/v1/review/');
      setReviews(r.data.data || []);
    } catch (_) { toast.error('Could not load reviews'); }
    finally { setLoading(false); }
  };

  /* ─── Product CRUD ─── */
  const submitProduct = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(prodForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (prodImages) Array.from(prodImages).forEach(f => fd.append('images', f));

      if (prodModal === 'create') {
        await AxiosInstance.post('/api/myapp/v1/product/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product created');
      } else {
        const data = { id: editProd.id, ...prodForm };
        if (prodImages) {
          const pfd = new FormData();
          Object.entries(data).forEach(([k, v]) => { if (v) pfd.append(k, v); });
          Array.from(prodImages).forEach(f => pfd.append('images', f));
          await AxiosInstance.patch('/api/myapp/v1/product/', pfd, { headers: { 'Content-Type': 'multipart/form-data' } });
        } else {
          await AxiosInstance.patch('/api/myapp/v1/product/', data);
        }
        toast.success('Product updated');
      }
      setProdModal(null); 
      setProdForm({ name:'', description:'', price:'', group:'General', prod_has_category:'' }); 
      setProdImages(null);
      loadProducts();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save product'); }
    finally { setLoading(false); }
  };

  const deleteProduct = async (id, name) => {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await AxiosInstance.delete(`/api/myapp/v1/product/?id=${id}`);
      toast.success('Product deleted');
      loadProducts();
    } catch (_) { toast.error('Delete failed'); }
  };

  /* ─── Category CRUD ─── */
  const submitCategory = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('name', catForm.name);
      if (catForm.description) fd.append('description', catForm.description);
      if (catImg) fd.append('image', catImg);

      if (catModal === 'create') {
        await AxiosInstance.post('/api/myapp/v1/category/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category created');
      } else {
        fd.append('id', editCat.id);
        await AxiosInstance.patch(`/api/myapp/v1/category/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Category updated');
      }
      setCatModal(null); 
      setCatForm({ name:'', description:'' }); 
      setCatImg(null); 
      loadCategories();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save category'); }
    finally { setLoading(false); }
  };

  const deleteCategory = async (id, name) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await AxiosInstance.delete(`/api/myapp/v1/category/?id=${id}`);
      toast.success('Category deleted'); 
      loadCategories();
    } catch (_) { toast.error('Delete failed'); }
  };

  /* ─── Sales Products CRUD ─── */
  const submitSalesProduct = async () => {
    setLoading(true);
    try {
      if (salesModal === 'create') {
        await AxiosInstance.post('/api/myapp/v1/sales/product/', salesForm);
        toast.success('Sales product created');
      } else {
        await AxiosInstance.patch(`/api/myapp/v1/sales/product/`, { id: editSales.id, ...salesForm });
        toast.success('Sales product updated');
      }
      setSalesModal(null); 
      setSalesForm({ name:'', description:'', original_price:'', discount_percent:'0', salesprod_has_category:'' }); 
      loadSalesProducts();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save'); }
    finally { setLoading(false); }
  };

  /* ─── Order actions ─── */
  const updateOrderStatus = async (id, status) => {
    try {
      await AxiosInstance.patch(`/api/myapp/v1/order/`, { id, status });
      toast.success(`Status → ${status}`);
      setOrderDetail((d) => d ? { ...d, status } : d);
      loadOrders();
    } catch (_) { toast.error('Update failed'); }
  };

  /* ─── Coupon CRUD ─── */
  const submitCoupon = async () => {
    setLoading(true);
    try {
      if (couponModal === 'create') {
        await AxiosInstance.post('/api/myapp/v1/coupon/', couponForm);
        toast.success('Coupon created');
      } else {
        await AxiosInstance.patch(`/api/myapp/v1/coupon/`, { id: editCoupon.id, ...couponForm });
        toast.success('Coupon updated');
      }
      setCouponModal(null); 
      setCouponForm({ code:'', discount_type:'percentage', discount_value:'', min_order_amount:'0', valid_from:'', valid_to:'', is_active:true }); 
      loadCoupons();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed to save coupon'); }
    finally { setLoading(false); }
  };

  const deleteCoupon = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try { 
      await AxiosInstance.delete(`/api/myapp/v1/coupon/?id=${id}`); 
      toast.success('Deleted'); 
      loadCoupons(); 
    }
    catch (_) { toast.error('Delete failed'); }
  };

  /* ─── Return actions ─── */
  const updateReturn = async (id, status) => {
    try {
      await AxiosInstance.patch(`/api/myapp/v1/return/`, { id, status });
      toast.success(`Return marked as ${status}`); 
      loadReturns();
    } catch (_) { toast.error('Update failed'); }
  };

  /* ─── Shipping CRUD ─── */
  const submitShipping = async () => {
    setLoading(true);
    try {
      if (shipModal === 'create') {
        await AxiosInstance.post('/api/myapp/v1/shipping/', shipForm);
        toast.success('Shipping method created');
      } else {
        await AxiosInstance.patch(`/api/myapp/v1/shipping/`, { id: editShip.id, ...shipForm });
        toast.success('Shipping method updated');
      }
      setShipModal(null); 
      setShipForm({ name:'', estimated_days:'', cost:'', is_active:true }); 
      loadShipping();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const deleteShipping = async (id, name) => {
    if (!confirm(`Delete shipping method "${name}"?`)) return;
    try { 
      await AxiosInstance.delete(`/api/myapp/v1/shipping/?id=${id}`); 
      toast.success('Deleted'); 
      loadShipping(); 
    }
    catch (_) { toast.error('Delete failed'); }
  };

  const deleteContact = async (id) => {
    if (!confirm('Delete this contact?')) return;
    try { 
      await AxiosInstance.delete(`/api/myapp/v1/contact/?id=${id}`); 
      toast.success('Deleted'); 
      loadContacts(); 
    }
    catch (_) { toast.error('Delete failed'); }
  };

  const deleteReview = async (id) => {
    if (!confirm('Delete this review?')) return;
    try { 
      await AxiosInstance.delete(`/api/myapp/v1/review/?id=${id}`); 
      toast.success('Deleted'); 
      loadReviews(); 
    }
    catch (_) { toast.error('Delete failed'); }
  };

  /* ─────────────────────── TABS CONFIG ─────────────────────── */
  const TABS = [
    { id:'dashboard', label:'Dashboard', icon:'◈' },
    { id:'products',  label:'Products',  icon:'◫' },
    { id:'categories',label:'Categories',icon:'⊞' },
    { id:'sales',     label:'Sales',     icon:'◑' },
    { id:'inventory', label:'Inventory', icon:'◧' },
    { id:'orders',    label:'Orders',    icon:'◉' },
    { id:'coupons',   label:'Coupons',   icon:'◊' },
    { id:'returns',   label:'Returns',   icon:'↩' },
    { id:'shipping',  label:'Shipping',  icon:'◻' },
    { id:'contacts',  label:'Contacts',  icon:'◌' },
    { id:'reviews',   label:'Reviews',   icon:'★' },
  ];

  /* ══════════════════════════ RENDER ══════════════════════════ */
  return (
    <>
      {mounted && <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} suppressHydrationWarning />}
      <div className="noise" suppressHydrationWarning />
      <Toasts />

      <div style={{ background:'var(--onyx)', minHeight:'100vh', color:'var(--text)', position:'relative', zIndex:1, fontFamily:'var(--font-sans)' }}>

        {/* ═══ HEADER ═══ */}
        <header style={{ background:'var(--charcoal)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:50 }}>
          <div style={{ padding:'0 24px', height:56, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <svg viewBox="0 0 28 28" fill="none" style={{ width:28, height:28, flexShrink:0 }}>
                <polygon points="14,2 26,9 26,19 14,26 2,19 2,9" stroke="#c9a84c" strokeWidth="1.2" fill="none"/>
                <polygon points="14,7 21,12 21,17 14,22 7,17 7,12" stroke="#c9a84c50" strokeWidth=".8" fill="none"/>
                <circle cx="14" cy="14" r="2.5" fill="#c9a84c"/>
              </svg>
              <div>
                <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.15rem', letterSpacing:'.03em' }}>
                  <span className="gold-text">Ecom</span>
                  <span style={{ color:'var(--text-dim)', fontWeight:300 }}>merce</span>
                </span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:'.52rem', letterSpacing:'.2em', color:'var(--text-dim)', textTransform:'uppercase', display:'block', marginTop:1 }}>Admin Console</span>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'.6rem', color:'var(--text-dim)' }}>
                {mounted ? new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : ''}
              </span>
            </div>
          </div>

          {/* Tab Bar */}
          <div style={{ borderTop:'1px solid var(--border)', overflowX:'auto', padding:'0 24px', display:'flex' }}>
            {TABS.map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:'.75rem', opacity:.7 }}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </header>

        <main style={{ padding:'24px', maxWidth:1400, margin:'0 auto' }}>

          {/* ══ DASHBOARD ══ */}
          {tab === 'dashboard' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'1.8rem', letterSpacing:'-.01em' }}>
                  Store <span className="gold-text">Overview</span>
                </h1>
                <button className="btn-ghost" style={{ padding:'8px 16px' }} onClick={loadDashboard}>↻ Refresh</button>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                {[
                  { label:'Total Orders',    val: dashStats?.orders    ?? '…', icon:'◉', color:'var(--gold)',     accent:'var(--gold-dk)', tab:'orders' },
                  { label:'Total Products',  val: dashStats?.products  ?? '…', icon:'◫', color:'var(--sapphire)', accent:'#1a3a7a',        tab:'products' },
                  { label:'Low Stock Items', val: dashStats?.low_stock ?? '…', icon:'◧', color:'var(--ruby)',     accent:'#6a1a26',        tab:'inventory' },
                  { label:'Categories',      val: categories.length,            icon:'⊞', color:'var(--emerald)',  accent:'#0a4a32',        tab:'categories' },
                ].map(s => (
                  <div key={s.label} className="stat-card" style={{ cursor:'pointer' }} onClick={() => setTab(s.tab)}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontSize:'1.4rem', color: s.color, opacity:.5 }}>{s.icon}</span>
                    </div>
                    <div style={{ fontFamily:'var(--font-serif)', fontSize:'2.2rem', color: s.color, lineHeight:1, letterSpacing:'-.02em' }}>{s.val}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:'.56rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-dim)', marginTop:4 }}>{s.label}</div>
                    <div className="stat-card-accent" style={{ background:`linear-gradient(90deg, ${s.accent}, ${s.color})` }}/>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <Card>
                  <SecLbl>Quick Actions</SecLbl>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {[
                      { label:'+ New Product',   action: () => { setProdModal('create'); setTab('products'); } },
                      { label:'+ New Category',  action: () => { setCatModal('create'); setTab('categories'); } },
                      { label:'+ New Coupon',    action: () => { setCouponModal('create'); setTab('coupons'); } },
                      { label:'View Orders',     action: () => setTab('orders') },
                      { label:'Check Returns',   action: () => setTab('returns') },
                      { label:'Low Stock Alert', action: () => setTab('inventory') },
                    ].map(a => (
                      <button key={a.label} className="btn-ghost" style={{ padding:'11px 14px', textAlign:'center' }} onClick={a.action}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </Card>
                <Card>
                  <SecLbl>System Status</SecLbl>
                  <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                    {[
                      { label:'Products API',   ok: true },
                      { label:'Orders API',     ok: true },
                      { label:'Inventory API',  ok: true },
                      { label:'Coupons API',    ok: true },
                    ].map(s => (
                      <div key={s.label} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingBottom:10, borderBottom:'1px solid var(--border)' }}>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'.7rem', color:'var(--text-muted)' }}>{s.label}</span>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span className={`dot ${s.ok ? 'dot-green' : 'dot-red'}`}/>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:'.62rem', color: s.ok ? 'var(--emerald)' : 'var(--ruby)' }}>
                            {s.ok ? 'Operational' : 'Error'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ══ PRODUCTS ══ */}
          {tab === 'products' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Products <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({prodCount})</span>
                </h2>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <input className="inp" placeholder="Search products…" value={prodSearch}
                    onChange={e => setProdSearch(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && loadProducts(prodSearch)}
                    style={{ padding:'9px 14px', width:220 }}/>
                  <button className="btn-ghost" style={{ padding:'9px 16px' }} onClick={() => loadProducts(prodSearch)}>Search</button>
                  <PrimaryBtn style={{ padding:'9px 18px' }} onClick={() => { setEditProd(null); setProdForm({ name:'', description:'', price:'', group:'General', prod_has_category:'' }); setProdModal('create'); }}>
                    + New Product
                  </PrimaryBtn>
                </div>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : products.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Name','Price','Group','Category','Variants','Avg Rating','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p.id}>
                          <td style={{ color:'var(--text)', fontWeight:500 }}>{p.name}</td>
                          <td style={{ color:'var(--gold)', fontFamily:'var(--font-mono)' }}>{fmt.price(p.price)}</td>
                          <td><Badge color="var(--sapphire)">{p.group || '—'}</Badge></td>
                          <td style={{ color:'var(--text-dim)' }}>{p.category_name || p.category?.name || '—'}</td>
                          <td style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{p.variants_count ?? '—'}</td>
                          <td style={{ color:'var(--amber)', fontFamily:'var(--font-mono)' }}>
                            {p.average_rating ? `★ ${p.average_rating}` : '—'}
                          </td>
                          <td>
                            <div style={{ display:'flex', gap:8 }}>
                              <button className="btn-ghost" style={{ padding:'5px 12px' }} onClick={() => {
                                setEditProd(p);
                                setProdForm({ name: p.name, description: p.description || '', price: p.price, group: p.group || 'General', prod_has_category: p.prod_has_category || '' });
                                setProdModal('edit');
                              }}>Edit</button>
                              <button className="btn-danger" style={{ padding:'5px 12px' }} onClick={() => deleteProduct(p.id, p.name)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <EmptyState icon="◫" text="No products found" action={() => setProdModal('create')} actionLabel="Create First Product" />
                )}
              </Card>
            </div>
          )}

          {/* ══ CATEGORIES ══ */}
          {tab === 'categories' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Categories <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({categories.length})</span>
                </h2>
                <PrimaryBtn style={{ padding:'9px 18px' }} onClick={() => { setEditCat(null); setCatForm({ name:'', description:'' }); setCatImg(null); setCatModal('create'); }}>
                  + New Category
                </PrimaryBtn>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
                {categories.map(c => (
                  <Card key={c.id} style={{ padding:'18px' }}>
                    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
                      <div style={{ flex:1 }}>
                        <p style={{ fontFamily:'var(--font-serif)', fontSize:'1.1rem', color:'var(--text)', marginBottom:4 }}>{c.name}</p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'.62rem', color:'var(--text-dim)', marginBottom:8 }}>
                          {c.products_count || 0} products · {c.sales_products_count || 0} sales
                        </p>
                        {c.description && <p style={{ fontSize:'.76rem', color:'var(--text-muted)', lineHeight:1.5 }}>{fmt.cut(c.description, 60)}</p>}
                      </div>
                      {c.image && <img src={c.image} alt={c.name} style={{ width:52, height:52, objectFit:'cover', border:'1px solid var(--border)', flexShrink:0 }}/>}
                    </div>
                    <div style={{ display:'flex', gap:8, marginTop:14 }}>
                      <button className="btn-ghost" style={{ padding:'6px 14px', flex:1 }} onClick={() => {
                        setEditCat(c); setCatForm({ name: c.name, description: c.description || '' }); setCatModal('edit');
                      }}>Edit</button>
                      <button className="btn-danger" style={{ padding:'6px 14px' }} onClick={() => deleteCategory(c.id, c.name)}>Del</button>
                    </div>
                  </Card>
                ))}
                {categories.length === 0 && <EmptyState icon="⊞" text="No categories yet" action={() => setCatModal('create')} actionLabel="Create Category"/>}
              </div>
            </div>
          )}

          {/* ══ SALES PRODUCTS ══ */}
          {tab === 'sales' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Sales Products <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({salesProds.length})</span>
                </h2>
                <PrimaryBtn style={{ padding:'9px 18px' }} onClick={() => { setEditSales(null); setSalesForm({ name:'', description:'', original_price:'', discount_percent:'0', salesprod_has_category:'' }); setSalesModal('create'); }}>
                  + New Sale
                </PrimaryBtn>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : salesProds.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Name','Original','Discount','Final','Category','Rating','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {salesProds.map(s => (
                        <tr key={s.id}>
                          <td style={{ color:'var(--text)', fontWeight:500 }}>{s.name}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', textDecoration:'line-through' }}>{fmt.price(s.original_price)}</td>
                          <td><Badge color="var(--ruby)">{s.discount_percent}% off</Badge></td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--emerald)', fontWeight:600 }}>{fmt.price(s.final_price)}</td>
                          <td style={{ color:'var(--text-dim)' }}>{s.category_name || '—'}</td>
                          <td style={{ color:'var(--amber)', fontFamily:'var(--font-mono)' }}>{s.average_rating ? `★ ${s.average_rating}` : '—'}</td>
                          <td>
                            <div style={{ display:'flex', gap:8 }}>
                              <button className="btn-ghost" style={{ padding:'5px 12px' }} onClick={() => {
                                setEditSales(s);
                                setSalesForm({ name: s.name, description: s.description || '', original_price: s.original_price, discount_percent: s.discount_percent, salesprod_has_category: s.salesprod_has_category || '' });
                                setSalesModal('edit');
                              }}>Edit</button>
                              <button className="btn-danger" style={{ padding:'5px 12px' }} onClick={async () => {
                                if (!confirm(`Delete "${s.name}"?`)) return;
                                try { await AxiosInstance.delete(`/api/myapp/v1/sales/product/?id=${s.id}`); toast.success('Deleted'); loadSalesProducts(); }
                                catch (_) { toast.error('Delete failed'); }
                              }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="◑" text="No sales products" action={() => setSalesModal('create')} actionLabel="Add Sales Product"/>}
              </Card>
            </div>
          )}

          {/* ══ INVENTORY ══ */}
          {tab === 'inventory' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>Inventory</h2>
                <button className="btn-ghost" style={{ padding:'9px 16px' }} onClick={loadInventory}>↻ Refresh</button>
              </div>

              {lowStock.length > 0 && (
                <Card style={{ borderColor:'#e8506a50', padding:'16px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <span className="dot dot-red" style={{ animation:'blink 1.4s ease infinite' }}/>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'.62rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--ruby)' }}>
                      {lowStock.length} Low Stock Alert{lowStock.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                    {lowStock.map(i => (
                      <div key={i.id} style={{ background:'#e8506a10', border:'1px solid #e8506a30', padding:'8px 14px' }}>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'.7rem', color:'var(--ruby)' }}>{i.product_name || i.variant_sku}</p>
                        <p style={{ fontFamily:'var(--font-mono)', fontSize:'.6rem', color:'var(--text-dim)' }}>Stock: {i.current_stock} / Min: {i.minimum_stock_level}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : inventory.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Product','SKU','Current Stock','Min Level','Reorder Point','Status','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(i => (
                        <tr key={i.id}>
                          <td style={{ color:'var(--text)' }}>{i.product_name}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{i.variant_sku}</td>
                          <td style={{ fontFamily:'var(--font-mono)', fontWeight:600, color: i.is_low_stock ? 'var(--ruby)' : 'var(--text)' }}>{i.current_stock}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{i.minimum_stock_level}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{i.reorder_point}</td>
                          <td>
                            {i.is_low_stock ? <Badge color="var(--ruby)">Low Stock</Badge>
                              : i.needs_reorder ? <Badge color="var(--amber)">Reorder</Badge>
                              : <Badge color="var(--emerald)">OK</Badge>}
                          </td>
                          <td>
                            <button className="btn-ghost" style={{ padding:'5px 12px' }} onClick={() => {
                              const newStock = prompt(`Update stock for ${i.product_name} (current: ${i.current_stock}):`, i.current_stock);
                              if (newStock && !isNaN(+newStock)) {
                                AxiosInstance.patch(`/api/myapp/v1/inventory/`, { id: i.id, current_stock: +newStock })
                                  .then(() => { toast.success('Stock updated'); loadInventory(); })
                                  .catch(() => toast.error('Update failed'));
                              }
                            }}>Update</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="◧" text="No inventory records"/>}
              </Card>
            </div>
          )}

          {/* ══ ORDERS ══ */}
          {tab === 'orders' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Orders <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({orderCount})</span>
                </h2>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  <input className="inp" placeholder="Search by name / email…" value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && loadOrders(orderSearch, orderStatus)}
                    style={{ padding:'9px 14px', width:220 }}/>
                  <select className="inp" value={orderStatus} onChange={e => { setOrderStatus(e.target.value); loadOrders(orderSearch, e.target.value); }}
                    style={{ padding:'9px 12px', width:160, cursor:'pointer' }}>
                    <option value="">All statuses</option>
                    {['pending','booked','in_process','delivered','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                  <button className="btn-ghost" style={{ padding:'9px 16px' }} onClick={() => loadOrders(orderSearch, orderStatus)}>Search</button>
                </div>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : orders.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Order #','Customer','Email','Status','Payment','Bill','Date','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:700 }}>#{o.id}</td>
                          <td style={{ color:'var(--text)' }}>{o.customer_name}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{o.customer_email}</td>
                          <td><StatusBadge status={o.status}/></td>
                          <td><PayBadge paid={o.payment_status}/></td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:600 }}>{fmt.price(o.bill)}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{fmt.date(o.created_at)}</td>
                          <td>
                            <button className="btn-ghost" style={{ padding:'5px 12px' }} onClick={async () => {
                              await loadOrderDetail(o.id);
                              setOrderModal(o);
                            }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="◉" text="No orders found"/>}
              </Card>
            </div>
          )}

          {/* ══ COUPONS ══ */}
          {tab === 'coupons' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Coupons <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({coupons.length})</span>
                </h2>
                <PrimaryBtn style={{ padding:'9px 18px' }} onClick={() => { setEditCoupon(null); setCouponForm({ code:'', discount_type:'percentage', discount_value:'', min_order_amount:'0', valid_from:'', valid_to:'', is_active:true }); setCouponModal('create'); }}>
                  + New Coupon
                </PrimaryBtn>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : coupons.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Code','Type','Value','Min Order','Used','Valid Until','Active','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map(c => (
                        <tr key={c.id}>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:700, fontSize:'.82rem', letterSpacing:'.08em' }}>{c.code}</td>
                          <td><Badge color="var(--sapphire)">{c.discount_type}</Badge></td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--emerald)', fontWeight:600 }}>
                            {c.discount_type === 'percentage' ? `${c.discount_value}%` : fmt.price(c.discount_value)}
                          </td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)' }}>{fmt.price(c.min_order_amount)}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>{c.used_count} {c.max_uses ? `/ ${c.max_uses}` : ''}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{fmt.date(c.valid_to)}</td>
                          <td>{c.is_active ? <Badge color="var(--emerald)">Active</Badge> : <Badge color="var(--ruby)">Inactive</Badge>}</td>
                          <td>
                            <div style={{ display:'flex', gap:8 }}>
                              <button className="btn-ghost" style={{ padding:'5px 12px' }} onClick={() => {
                                setEditCoupon(c);
                                setCouponForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, min_order_amount: c.min_order_amount, valid_from: c.valid_from?.slice(0,16) || '', valid_to: c.valid_to?.slice(0,16) || '', is_active: c.is_active });
                                setCouponModal('edit');
                              }}>Edit</button>
                              <button className="btn-danger" style={{ padding:'5px 12px' }} onClick={() => deleteCoupon(c.id, c.code)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="◊" text="No coupons created" action={() => setCouponModal('create')} actionLabel="Create Coupon"/>}
              </Card>
            </div>
          )}

          {/* ══ RETURNS ══ */}
          {tab === 'returns' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Return Requests <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({returns.length})</span>
                </h2>
                <select className="inp" value={returnFilter} onChange={e => { setReturnFilter(e.target.value); loadReturns(e.target.value); }}
                  style={{ padding:'9px 12px', width:180, cursor:'pointer' }}>
                  <option value="">All statuses</option>
                  {['requested','approved','rejected','completed'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : returns.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Return #','Order','Product','Reason','Refund','Status','Date','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {returns.map(r => (
                        <tr key={r.id}>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--gold)', fontWeight:700 }}>#{r.id}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>#{r.order_number || r.order}</td>
                          <td style={{ color:'var(--text)' }}>{fmt.cut(r.product_name || '', 30)}</td>
                          <td><Badge color="var(--amber)">{r.reason?.replace('_',' ')}</Badge></td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--emerald)' }}>{fmt.price(r.refund_amount)}</td>
                          <td><StatusBadge status={r.status}/></td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{fmt.date(r.created_at)}</td>
                          <td>
                            {r.status === 'requested' && (
                              <div style={{ display:'flex', gap:6 }}>
                                <button className="btn-success" style={{ padding:'5px 10px' }} onClick={() => updateReturn(r.id, 'approved')}>Approve</button>
                                <button className="btn-danger" style={{ padding:'5px 10px' }} onClick={() => updateReturn(r.id, 'rejected')}>Reject</button>
                              </div>
                            )}
                            {r.status === 'approved' && (
                              <button className="btn-success" style={{ padding:'5px 12px' }} onClick={() => updateReturn(r.id, 'completed')}>Complete</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="↩" text="No return requests"/>}
              </Card>
            </div>
          )}

          {/* ══ SHIPPING ══ */}
          {tab === 'shipping' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>Shipping Methods</h2>
                <PrimaryBtn style={{ padding:'9px 18px' }} onClick={() => { setEditShip(null); setShipForm({ name:'', estimated_days:'', cost:'', is_active:true }); setShipModal('create'); }}>
                  + New Method
                </PrimaryBtn>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
                {shipping.map(s => (
                  <Card key={s.id} style={{ padding:'18px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                      <span className={`dot ${s.is_active ? 'dot-green' : 'dot-dim'}`}/>
                      <span style={{ fontFamily:'var(--font-serif)', fontSize:'1.05rem', color:'var(--text)' }}>{s.name}</span>
                    </div>
                    <div style={{ display:'flex', gap:16, marginBottom:14 }}>
                      <div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:'.56rem', letterSpacing:'.16em', color:'var(--text-dim)', textTransform:'uppercase', marginBottom:2 }}>Estimated</div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:'.82rem', color:'var(--text)' }}>{s.estimated_days} days</div>
                      </div>
                      <div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:'.56rem', letterSpacing:'.16em', color:'var(--text-dim)', textTransform:'uppercase', marginBottom:2 }}>Cost</div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:'.82rem', color:'var(--gold)', fontWeight:600 }}>{fmt.price(s.cost)}</div>
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="btn-ghost" style={{ padding:'6px 14px', flex:1 }} onClick={() => {
                        setEditShip(s); setShipForm({ name: s.name, estimated_days: s.estimated_days, cost: s.cost, is_active: s.is_active }); setShipModal('edit');
                      }}>Edit</button>
                      <button className="btn-danger" style={{ padding:'6px 14px' }} onClick={() => deleteShipping(s.id, s.name)}>Del</button>
                    </div>
                  </Card>
                ))}
                {shipping.length === 0 && !loading && <EmptyState icon="◻" text="No shipping methods" action={() => setShipModal('create')} actionLabel="Add Method"/>}
                {loading && <Spinner/>}
              </div>
            </div>
          )}

          {/* ══ CONTACTS ══ */}
          {tab === 'contacts' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Contact Submissions <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({contacts.length})</span>
                </h2>
                <button className="btn-ghost" style={{ padding:'9px 16px' }} onClick={loadContacts}>↻ Refresh</button>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : contacts.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Name','Email','Phone','Message','Date','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map(c => (
                        <tr key={c.id}>
                          <td style={{ color:'var(--text)' }}>{c.name}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--sapphire)', fontSize:'.7rem' }}>{c.email}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.7rem' }}>{c.phone_number}</td>
                          <td style={{ color:'var(--text-muted)', maxWidth:240 }}>{fmt.cut(c.message || '', 60)}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{fmt.date(c.created_at)}</td>
                          <td><button className="btn-danger" style={{ padding:'5px 12px' }} onClick={() => deleteContact(c.id)}>Del</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="◌" text="No contact submissions"/>}
              </Card>
            </div>
          )}

          {/* ══ REVIEWS ══ */}
          {tab === 'reviews' && (
            <div className="fade-up" style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <h2 style={{ fontFamily:'var(--font-serif)', fontSize:'1.5rem' }}>
                  Reviews <span style={{ color:'var(--text-dim)', fontWeight:300, fontSize:'1rem' }}>({reviews.length})</span>
                </h2>
                <button className="btn-ghost" style={{ padding:'9px 16px' }} onClick={loadReviews}>↻ Refresh</button>
              </div>

              <Card style={{ padding:0, overflow:'hidden' }}>
                {loading ? <Spinner /> : reviews.length > 0 ? (
                  <table className="tbl">
                    <thead>
                      <tr>
                        {['Author','Product','Rating','Comment','Date','Actions'].map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(r => (
                        <tr key={r.id}>
                          <td style={{ color:'var(--text)' }}>{r.author_name || r.name || 'Anonymous'}</td>
                          <td style={{ color:'var(--text-muted)' }}>{fmt.cut(r.item_name || '', 30)}</td>
                          <td>
                            <span style={{ color:'var(--amber)', fontFamily:'var(--font-mono)', fontWeight:700 }}>
                              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                            </span>
                          </td>
                          <td style={{ color:'var(--text-muted)', maxWidth:260 }}>{fmt.cut(r.comment, 70)}</td>
                          <td style={{ fontFamily:'var(--font-mono)', color:'var(--text-dim)', fontSize:'.68rem' }}>{fmt.date(r.created_at)}</td>
                          <td><button className="btn-danger" style={{ padding:'5px 12px' }} onClick={() => deleteReview(r.id)}>Del</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <EmptyState icon="★" text="No reviews yet"/>}
              </Card>
            </div>
          )}

        </main>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Product Modal */}
      {prodModal && (
        <Modal title={prodModal === 'create' ? 'Create Product' : 'Edit Product'} onClose={() => setProdModal(null)} maxWidth={560}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Product Name *">
                <input className="inp" value={prodForm.name} onChange={e => setProdForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Classic Linen Shirt" style={{ padding:'10px 12px' }}/>
              </FormField>
            </div>
            <FormField label="Price (Rs) *">
              <input className="inp" type="number" value={prodForm.price} onChange={e => setProdForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Group">
              <select className="inp" value={prodForm.group} onChange={e => setProdForm(p => ({ ...p, group: e.target.value }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
                {['Men','Women','Kids','General'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </FormField>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Category">
                <select className="inp" value={prodForm.prod_has_category} onChange={e => setProdForm(p => ({ ...p, prod_has_category: e.target.value }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
                  <option value="">— No Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Description *">
                <textarea className="inp" rows={4} value={prodForm.description} onChange={e => setProdForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the product…" style={{ padding:'10px 12px', resize:'vertical' }}/>
              </FormField>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label className="inp-label">Product Images {prodModal === 'create' ? '*' : '(optional)'}</label>
              <div style={{ border:'1px dashed var(--border-lt)', padding:'20px', textAlign:'center', cursor:'pointer', background:'var(--surface2)' }}
                onClick={() => imgRef.current?.click()}>
                <input ref={imgRef} type="file" multiple accept="image/*" style={{ display:'none' }} onChange={e => setProdImages(e.target.files)}/>
                <p style={{ fontFamily:'var(--font-mono)', fontSize:'.68rem', color: prodImages ? 'var(--gold)' : 'var(--text-dim)' }}>
                  {prodImages ? `${prodImages.length} file(s) selected` : 'Click to upload images (max 5)'}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding:'10px 20px' }} onClick={() => setProdModal(null)}>Cancel</button>
            <PrimaryBtn loading={loading} loadText="Saving…" onClick={submitProduct} style={{ padding:'10px 24px' }}>
              {prodModal === 'create' ? 'Create Product' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* Category Modal */}
      {catModal && (
        <Modal title={catModal === 'create' ? 'Create Category' : 'Edit Category'} onClose={() => setCatModal(null)} maxWidth={480}>
          <FormField label="Category Name *">
            <input className="inp" value={catForm.name} onChange={e => setCatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Collection" style={{ padding:'10px 12px' }}/>
          </FormField>
          <FormField label="Description">
            <textarea className="inp" rows={3} value={catForm.description} onChange={e => setCatForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description…" style={{ padding:'10px 12px', resize:'vertical' }}/>
          </FormField>
          <FormField label="Category Image">
            <div style={{ border:'1px dashed var(--border-lt)', padding:'16px', textAlign:'center', cursor:'pointer', background:'var(--surface2)' }}
              onClick={() => catImgRef.current?.click()}>
              <input ref={catImgRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => setCatImg(e.target.files?.[0] || null)}/>
              <p style={{ fontFamily:'var(--font-mono)', fontSize:'.68rem', color: catImg ? 'var(--gold)' : 'var(--text-dim)' }}>
                {catImg ? catImg.name : 'Click to upload image'}
              </p>
            </div>
          </FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding:'10px 20px' }} onClick={() => setCatModal(null)}>Cancel</button>
            <PrimaryBtn loading={loading} loadText="Saving…" onClick={submitCategory} style={{ padding:'10px 24px' }}>
              {catModal === 'create' ? 'Create Category' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* Sales Product Modal */}
      {salesModal && (
        <Modal title={salesModal === 'create' ? 'Create Sales Product' : 'Edit Sales Product'} onClose={() => setSalesModal(null)} maxWidth={540}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Product Name *">
                <input className="inp" value={salesForm.name} onChange={e => setSalesForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Summer Clearance Shirt" style={{ padding:'10px 12px' }}/>
              </FormField>
            </div>
            <FormField label="Original Price (Rs) *">
              <input className="inp" type="number" value={salesForm.original_price} onChange={e => setSalesForm(p => ({ ...p, original_price: e.target.value }))} placeholder="0.00" style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Discount (%)">
              <input className="inp" type="number" min="0" max="100" value={salesForm.discount_percent} onChange={e => setSalesForm(p => ({ ...p, discount_percent: e.target.value }))} style={{ padding:'10px 12px' }}/>
            </FormField>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Category">
                <select className="inp" value={salesForm.salesprod_has_category} onChange={e => setSalesForm(p => ({ ...p, salesprod_has_category: e.target.value }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
                  <option value="">— No Category —</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </FormField>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Description *">
                <textarea className="inp" rows={3} value={salesForm.description} onChange={e => setSalesForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe the sale…" style={{ padding:'10px 12px', resize:'vertical' }}/>
              </FormField>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding:'10px 20px' }} onClick={() => setSalesModal(null)}>Cancel</button>
            <PrimaryBtn loading={loading} loadText="Saving…" onClick={submitSalesProduct} style={{ padding:'10px 24px' }}>
              {salesModal === 'create' ? 'Create Sale' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* Coupon Modal */}
      {couponModal && (
        <Modal title={couponModal === 'create' ? 'Create Coupon' : 'Edit Coupon'} onClose={() => setCouponModal(null)} maxWidth={540}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <FormField label="Coupon Code *">
                <input className="inp" value={couponForm.code} onChange={e => setCouponForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" style={{ padding:'10px 12px', letterSpacing:'.1em' }}/>
              </FormField>
            </div>
            <FormField label="Discount Type *">
              <select className="inp" value={couponForm.discount_type} onChange={e => setCouponForm(p => ({ ...p, discount_type: e.target.value }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount (Rs)</option>
              </select>
            </FormField>
            <FormField label={`Discount Value ${couponForm.discount_type === 'percentage' ? '(%)' : '(Rs)'} *`}>
              <input className="inp" type="number" value={couponForm.discount_value} onChange={e => setCouponForm(p => ({ ...p, discount_value: e.target.value }))} placeholder="0" style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Min Order Amount (Rs)">
              <input className="inp" type="number" value={couponForm.min_order_amount} onChange={e => setCouponForm(p => ({ ...p, min_order_amount: e.target.value }))} placeholder="0" style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Active">
              <select className="inp" value={String(couponForm.is_active)} onChange={e => setCouponForm(p => ({ ...p, is_active: e.target.value === 'true' }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </FormField>
            <FormField label="Valid From *">
              <input className="inp" type="datetime-local" value={couponForm.valid_from} onChange={e => setCouponForm(p => ({ ...p, valid_from: e.target.value }))} style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Valid To *">
              <input className="inp" type="datetime-local" value={couponForm.valid_to} onChange={e => setCouponForm(p => ({ ...p, valid_to: e.target.value }))} style={{ padding:'10px 12px' }}/>
            </FormField>
          </div>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding:'10px 20px' }} onClick={() => setCouponModal(null)}>Cancel</button>
            <PrimaryBtn loading={loading} loadText="Saving…" onClick={submitCoupon} style={{ padding:'10px 24px' }}>
              {couponModal === 'create' ? 'Create Coupon' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* Shipping Method Modal */}
      {shipModal && (
        <Modal title={shipModal === 'create' ? 'Create Shipping Method' : 'Edit Shipping Method'} onClose={() => setShipModal(null)} maxWidth={460}>
          <FormField label="Method Name *">
            <input className="inp" value={shipForm.name} onChange={e => setShipForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Express Delivery" style={{ padding:'10px 12px' }}/>
          </FormField>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <FormField label="Estimated Days *">
              <input className="inp" type="number" min="1" value={shipForm.estimated_days} onChange={e => setShipForm(p => ({ ...p, estimated_days: e.target.value }))} placeholder="3" style={{ padding:'10px 12px' }}/>
            </FormField>
            <FormField label="Cost (Rs) *">
              <input className="inp" type="number" value={shipForm.cost} onChange={e => setShipForm(p => ({ ...p, cost: e.target.value }))} placeholder="0" style={{ padding:'10px 12px' }}/>
            </FormField>
          </div>
          <FormField label="Active">
            <select className="inp" value={String(shipForm.is_active)} onChange={e => setShipForm(p => ({ ...p, is_active: e.target.value === 'true' }))} style={{ padding:'10px 12px', cursor:'pointer' }}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FormField>
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <button className="btn-ghost" style={{ padding:'10px 20px' }} onClick={() => setShipModal(null)}>Cancel</button>
            <PrimaryBtn loading={loading} loadText="Saving…" onClick={submitShipping} style={{ padding:'10px 24px' }}>
              {shipModal === 'create' ? 'Create Method' : 'Save Changes'}
            </PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* Order Detail Modal */}
      {orderModal && (
        <Modal title={`Order #${orderModal.id}`} onClose={() => { setOrderModal(null); setOrderDetail(null); }} maxWidth={680}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
            {[
              { label:'Customer',   val: orderModal.customer_name },
              { label:'Email',      val: orderModal.customer_email },
              { label:'Phone',      val: orderModal.customer_phone },
              { label:'City',       val: orderModal.city || '—' },
              { label:'Payment',    val: orderModal.payment_method?.replace('_',' ') },
              { label:'Bill',       val: fmt.price(orderModal.bill) },
            ].map(f => (
              <div key={f.label} style={{ background:'var(--surface2)', border:'1px solid var(--border)', padding:'10px 14px' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'.54rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:3 }}>{f.label}</div>
                <div style={{ fontSize:'.82rem', color:'var(--text)' }}>{f.val}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom:18 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:'.56rem', letterSpacing:'.18em', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:6 }}>Delivery Address</div>
            <div style={{ background:'var(--surface2)', border:'1px solid var(--border)', padding:'10px 14px', fontSize:'.8rem', color:'var(--text-muted)' }}>
              {orderModal.delivery_address}
            </div>
          </div>

          {orderDetail?.order_details?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <SecLbl>Order Items</SecLbl>
              {orderDetail.order_details.map((d, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--surface2)', border:'1px solid var(--border)', marginBottom:6 }}>
                  <span style={{ fontSize:'.8rem', color:'var(--text)' }}>{d.product_name || '—'}</span>
                  <div style={{ display:'flex', gap:16 }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'.72rem', color:'var(--text-dim)' }}>×{d.quantity}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:'.72rem', color:'var(--gold)' }}>{fmt.price(d.total_price)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div>
            <SecLbl>Update Status</SecLbl>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['pending','booked','in_process','delivered','cancelled'].map(s => (
                <button key={s} className={`btn-ghost ${orderModal.status === s ? 'active' : ''}`}
                  style={{ padding:'8px 16px', color: orderModal.status === s ? 'var(--gold)' : undefined, borderColor: orderModal.status === s ? 'var(--gold)' : undefined }}
                  onClick={() => { updateOrderStatus(orderModal.id, s); setOrderModal((m) => ({ ...m, status: s })); }}>
                  {s.replace('_',' ')}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}

    </>
  );
}