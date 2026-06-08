// ===================== STORE =====================
// Single shared store across all 4 modules. Mutations are committed in-place
// then `notify()` re-renders every subscribed component (fine at prototype scale).

const TODAY = "2026-06-08";

function vnd(n) {
  if (n == null || isNaN(n)) return "0₫";
  return Math.round(n).toLocaleString("vi-VN") + "₫";
}
function vndShort(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "tr";
  if (n >= 1000) return Math.round(n / 1000) + "k";
  return String(n);
}
function dvn(s) {
  if (!s) return "";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}

// ---- Seed: products + variants (variant = SP con) ----
// Each variant: code, name, unit, retail, wholesale, stock, min, max, lastImport
const _products = [
  {
    id: "SP001", name: "Tương ớt Mường Khương", category: "Tương ớt",
    desc: "Tương ớt truyền thống lên men tự nhiên, đặc sản OCOP Mường Khương.",
    active: true,
    variants: [
      { code: "SP001-250g", name: "Hũ 250g", unit: "Hũ", retail: 35000, wholesale: 28000, stock: 48, min: 20, max: 200, lastImport: "2026-06-02" },
      { code: "SP001-500g", name: "Hũ 500g", unit: "Hũ", retail: 62000, wholesale: 52000, stock: 120, min: 20, max: 150, lastImport: "2026-06-02" },
      { code: "SP001-T12", name: "Thùng 12 hũ", unit: "Thùng", retail: 380000, wholesale: 330000, stock: 5, min: 5, max: 40, lastImport: "2026-05-20" },
    ],
  },
  {
    id: "SP002", name: "Tương ớt cay đặc biệt", category: "Tương ớt",
    desc: "Phiên bản cay nồng, ủ ớt chỉ thiên trồng tại bản.",
    active: true,
    variants: [
      { code: "SP002-250g", name: "Hũ 250g", unit: "Hũ", retail: 45000, wholesale: 36000, stock: 0, min: 20, max: 150, lastImport: "2026-05-18" },
      { code: "SP002-500g", name: "Hũ 500g", unit: "Hũ", retail: 82000, wholesale: 70000, stock: 18, min: 20, max: 120, lastImport: "2026-05-18" },
    ],
  },
  {
    id: "SP003", name: "Gạo Séng Cù", category: "Gạo",
    desc: "Gạo đặc sản Séng Cù vùng cao Mường Khương, hạt thơm dẻo.",
    active: true,
    variants: [
      { code: "SP003-1kg", name: "Túi 1kg", unit: "Túi", retail: 38000, wholesale: 32000, stock: 340, min: 50, max: 600, lastImport: "2026-05-25" },
      { code: "SP003-5kg", name: "Túi 5kg", unit: "Túi", retail: 180000, wholesale: 160000, stock: 85, min: 20, max: 200, lastImport: "2026-05-25" },
      { code: "SP003-25kg", name: "Bao 25kg", unit: "Bao", retail: 850000, wholesale: 780000, stock: 12, min: 5, max: 60, lastImport: "2026-05-25" },
    ],
  },
  {
    id: "SP004", name: "Combo tương ớt 3 hũ", category: "Combo",
    desc: "Combo quà tặng gồm 3 hũ tương ớt 250g các vị.",
    active: true,
    variants: [],
    combo: { unit: "Combo", retail: 99000, wholesale: 85000, stock: 30, min: 10, max: 100, lastImport: "2026-06-02" },
  },
];

// A "unit" is the sellable/stockable level. Products with variants expose each
// variant; products without (combo) expose the product itself as one unit.
function unitsOf(p) {
  if (p.variants && p.variants.length) {
    return p.variants.map((v) => ({ ...v, productId: p.id, productName: p.name, category: p.category, variantName: v.name }));
  }
  if (p.combo) {
    return [{ code: p.id, name: "—", variantName: "—", unit: p.combo.unit, retail: p.combo.retail, wholesale: p.combo.wholesale, stock: p.combo.stock, min: p.combo.min, max: p.combo.max, lastImport: p.combo.lastImport, productId: p.id, productName: p.name, category: p.category, isCombo: true }];
  }
  return [];
}
function allUnits(state) {
  return state.products.flatMap((p) => unitsOf(p));
}
function findUnitRef(state, code) {
  for (const p of state.products) {
    if (p.combo && p.id === code) return { product: p, target: p.combo, isCombo: true };
    if (p.variants) {
      const v = p.variants.find((x) => x.code === code);
      if (v) return { product: p, target: v, isCombo: false };
    }
  }
  return null;
}
function stockStatus(u) {
  if (u.stock <= 0) return "out";
  if (u.stock <= Math.ceil(u.min * 2.5)) return "low";
  return "ok";
}
function productStock(p) {
  return unitsOf(p).reduce((s, u) => s + u.stock, 0);
}
function productStatus(p) {
  const us = unitsOf(p);
  if (!us.length) return "ok";
  if (us.every((u) => u.stock <= 0)) return "out";
  if (us.some((u) => stockStatus(u) !== "ok")) return "low";
  return "ok";
}
function priceRange(p, key) {
  const us = unitsOf(p);
  if (!us.length) return null;
  const vals = us.map((u) => u[key]);
  const mn = Math.min(...vals), mx = Math.max(...vals);
  return mn === mx ? vnd(mn) : `${vndShort(mn)}–${vndShort(mx)}`;
}

// ---- Seed: suppliers ----
const _suppliers = [
  { id: "NCC001", name: "HTX Hoa Lợi", note: "Nội bộ — tự sản xuất", phone: "0214 388 1xx", debt: 0 },
  { id: "NCC002", name: "Hộ ông Vàng A Páo", note: "Ớt nguyên liệu", phone: "0972 5xx xxx", debt: 4500000 },
  { id: "NCC003", name: "Công ty bao bì Lào Cai", note: "Hũ, nhãn, thùng", phone: "0214 386 2xx", debt: 0 },
  { id: "NCC004", name: "Hộ bà Giàng Thị Mai", note: "Gạo Séng Cù", phone: "0986 1xx xxx", debt: 0 },
];

// ---- Seed: customers ----
const _customers = [
  { id: "KH001", name: "Nguyễn Thị Lan", phone: "0901 234 567", addr: "12 Trần Hưng Đạo, P. Cốc Lếu, TP Lào Cai", type: "Lẻ" },
  { id: "KH002", name: "Đại lý Sapa Foods", phone: "0214 377 888", addr: "Số 5 Cầu Mây, P. Sa Pa, Lào Cai", type: "Đại lý" },
  { id: "KH003", name: "Trần Văn Hùng", phone: "0987 651 234", addr: "Tổ 4, P. Kim Tân, TP Lào Cai", type: "Lẻ" },
  { id: "KH004", name: "Cửa hàng OCOP Lào Cai", phone: "0214 366 555", addr: "Quảng trường Lào Cai, P. Bắc Cường", type: "Đại lý" },
  { id: "KH005", name: "Lê Thị Hoa", phone: "0905 778 112", addr: "Thị trấn Mường Khương, Lào Cai", type: "Lẻ" },
];

// ---- Seed: orders ----
function oItem(code, qty, price) { return { code, qty, price }; }
const _orders = [
  {
    id: "DH2406-001", date: "2026-06-08", customerId: "KH001", channel: "Web",
    items: [oItem("SP001-250g", 4, 35000), oItem("SP002-500g", 2, 82000)],
    discount: 0, ship: 30000, payMethod: "COD", status: "Chờ xác nhận",
    carrier: "GHN", addr: "12 Trần Hưng Đạo, P. Cốc Lếu, TP Lào Cai", note: "Giao giờ hành chính", stockApplied: false,
  },
  {
    id: "DH2406-002", date: "2026-06-08", customerId: "KH002", channel: "Đại lý",
    items: [oItem("SP001-T12", 3, 330000), oItem("SP003-5kg", 5, 160000)],
    discount: 5, ship: 0, payMethod: "Công nợ", status: "Đã xác nhận",
    carrier: "Tự giao", addr: "Số 5 Cầu Mây, P. Sa Pa, Lào Cai", note: "Xuất hoá đơn VAT", stockApplied: true,
  },
  {
    id: "DH2405-118", date: "2026-06-07", customerId: "KH003", channel: "Zalo",
    items: [oItem("SP001-500g", 6, 62000), oItem("SP004", 1, 99000)],
    discount: 0, ship: 25000, payMethod: "Chuyển khoản", status: "Đang giao",
    carrier: "GHTK", addr: "Tổ 4, P. Kim Tân, TP Lào Cai", note: "", stockApplied: true,
  },
  {
    id: "DH2405-117", date: "2026-06-05", customerId: "KH004", channel: "Đại lý",
    items: [oItem("SP003-25kg", 4, 780000), oItem("SP001-250g", 20, 28000)],
    discount: 3, ship: 0, payMethod: "VNPay", status: "Đã giao",
    carrier: "Tự giao", addr: "Quảng trường Lào Cai, P. Bắc Cường", note: "", stockApplied: true,
  },
  {
    id: "DH2405-115", date: "2026-06-04", customerId: "KH005", channel: "Trực tiếp",
    items: [oItem("SP002-250g", 3, 45000)],
    discount: 0, ship: 0, payMethod: "COD", status: "Huỷ",
    carrier: "Tự giao", addr: "Thị trấn Mường Khương, Lào Cai", note: "Khách đổi ý", stockApplied: false,
  },
];

// ---- Seed: purchases (phiếu nhập) ----
function pItem(code, qty, cost, note) { return { code, qty, cost, note: note || "" }; }
const _purchases = [
  {
    id: "PN2406-003", date: "2026-06-07", supplierId: "NCC001", invoiceNo: "", status: "Nháp",
    items: [pItem("SP001-250g", 100, 18000, "Lô 06/26"), pItem("SP001-500g", 60, 33000, "")],
    supDiscount: 0, ship: 0, payMethod: "Công nợ", dueDate: "2026-06-30", paid: 0, note: "Bổ sung tồn tương ớt", stockApplied: false,
  },
  {
    id: "PN2406-002", date: "2026-06-06", supplierId: "NCC002", invoiceNo: "VAP-0612", status: "Chờ duyệt",
    items: [pItem("SP001-250g", 50, 0, "Ớt nguyên liệu quy đổi"), pItem("SP002-250g", 80, 22000, "Lô cay ĐB")],
    supDiscount: 0, ship: 150000, payMethod: "Công nợ", dueDate: "2026-07-06", paid: 0, note: "Nhập ớt vụ mới", stockApplied: false,
  },
  {
    id: "PN2406-001", date: "2026-06-02", supplierId: "NCC001", invoiceNo: "HL-0601", status: "Đã nhập kho",
    items: [pItem("SP001-250g", 120, 18000, ""), pItem("SP001-500g", 80, 33000, ""), pItem("SP004", 40, 60000, "Combo quà")],
    supDiscount: 0, ship: 0, payMethod: "CK ngay", dueDate: "", paid: 5000000, note: "", stockApplied: true,
  },
  {
    id: "PN2405-014", date: "2026-05-28", supplierId: "NCC003", invoiceNo: "BBLC-2289", status: "Đã nhập kho",
    items: [pItem("SP001-T12", 30, 250000, "Đóng thùng")],
    supDiscount: 200000, ship: 80000, payMethod: "Tiền mặt", dueDate: "", paid: 7380000, note: "Bao bì + đóng thùng", stockApplied: true,
  },
  {
    id: "PN2405-013", date: "2026-05-25", supplierId: "NCC004", invoiceNo: "", status: "Đã nhập kho",
    items: [pItem("SP003-1kg", 200, 24000, "Vụ chiêm"), pItem("SP003-5kg", 60, 130000, ""), pItem("SP003-25kg", 12, 640000, "")],
    supDiscount: 0, ship: 300000, payMethod: "CK ngay", dueDate: "", paid: 20580000, note: "Nhập gạo Séng Cù", stockApplied: true,
  },
];

// ---- Seed: stock transactions (lịch sử kho) ----
const _txns = [
  { id: "t1", date: "2026-05-25", type: "Nhập NCC", doc: "PN2405-013", code: "SP003-1kg", qty: +200, after: 200, user: "Hạng A Lử" },
  { id: "t2", date: "2026-05-25", type: "Nhập NCC", doc: "PN2405-013", code: "SP003-5kg", qty: +60, after: 60, user: "Hạng A Lử" },
  { id: "t3", date: "2026-05-25", type: "Nhập NCC", doc: "PN2405-013", code: "SP003-25kg", qty: +12, after: 12, user: "Hạng A Lử" },
  { id: "t4", date: "2026-05-28", type: "Nhập NCC", doc: "PN2405-014", code: "SP001-T12", qty: +30, after: 35, user: "Hạng A Lử" },
  { id: "t5", date: "2026-06-02", type: "Nhập NCC", doc: "PN2406-001", code: "SP001-250g", qty: +120, after: 168, user: "Hạng A Lử" },
  { id: "t6", date: "2026-06-02", type: "Nhập NCC", doc: "PN2406-001", code: "SP001-500g", qty: +80, after: 200, user: "Hạng A Lử" },
  { id: "t7", date: "2026-06-02", type: "Nhập NCC", doc: "PN2406-001", code: "SP004", qty: +40, after: 70, user: "Hạng A Lử" },
  { id: "t8", date: "2026-06-04", type: "Điều chỉnh", doc: "DC-0604", code: "SP001-T12", qty: -30, after: 5, user: "Lý Thị Dung", reason: "Xuất biếu hội chợ" },
  { id: "t9", date: "2026-06-05", type: "Xuất bán", doc: "DH2405-117", code: "SP003-25kg", qty: -4, after: 8, user: "Lý Thị Dung" },
  { id: "t10", date: "2026-06-05", type: "Xuất bán", doc: "DH2405-117", code: "SP001-250g", qty: -20, after: 148, user: "Lý Thị Dung" },
  { id: "t11", date: "2026-06-05", type: "Kiểm kho", doc: "KK-0605", code: "SP003-25kg", qty: +4, after: 12, user: "Hạng A Lử", reason: "Kiểm kê thực tế" },
  { id: "t12", date: "2026-06-05", type: "Kiểm kho", doc: "KK-0605", code: "SP001-250g", qty: -100, after: 48, user: "Hạng A Lử", reason: "Kiểm kê thực tế" },
  { id: "t13", date: "2026-06-07", type: "Xuất bán", doc: "DH2405-118", code: "SP001-500g", qty: -6, after: 120, user: "Lý Thị Dung" },
  { id: "t14", date: "2026-06-07", type: "Xuất bán", doc: "DH2405-118", code: "SP004", qty: -1, after: 30, user: "Lý Thị Dung" },
  { id: "t15", date: "2026-06-08", type: "Xuất bán", doc: "DH2406-002", code: "SP001-T12", qty: -3, after: 5, user: "Lý Thị Dung" },
  { id: "t16", date: "2026-06-08", type: "Xuất bán", doc: "DH2406-002", code: "SP003-5kg", qty: -5, after: 85, user: "Lý Thị Dung" },
];

// ---------------- store core ----------------
const state = {
  products: _products,
  suppliers: _suppliers,
  customers: _customers,
  orders: _orders,
  purchases: _purchases,
  txns: _txns,
  currentUser: "Hạng A Lử",
};

const _subs = new Set();
function notify() { _subs.forEach((f) => f()); }
function subscribe(fn) { _subs.add(fn); return () => _subs.delete(fn); }

function useStore() {
  const [, force] = React.useReducer((x) => x + 1, 0);
  React.useEffect(() => subscribe(force), []);
  return state;
}

// ---------------- ID helpers ----------------
function nextProductId() {
  const nums = state.products.map((p) => parseInt(p.id.replace(/\D/g, ""), 10)).filter((n) => !isNaN(n));
  return "SP" + String(Math.max(0, ...nums) + 1).padStart(3, "0");
}
function nextOrderId() {
  const ym = "DH2406-";
  const nums = state.orders.filter((o) => o.id.startsWith(ym)).map((o) => parseInt(o.id.split("-")[1], 10));
  return ym + String(Math.max(0, ...nums) + 1).padStart(3, "0");
}
function nextPurchaseId() {
  const ym = "PN2406-";
  const nums = state.purchases.filter((o) => o.id.startsWith(ym)).map((o) => parseInt(o.id.split("-")[1], 10));
  return ym + String(Math.max(0, ...nums) + 1).padStart(3, "0");
}

// ---------------- mutations ----------------
function addTxn(t) {
  state.txns.unshift({ id: "t" + Date.now() + Math.random().toString(36).slice(2, 6), user: state.currentUser, ...t });
}

function saveProduct(prod, isNew) {
  if (isNew) state.products.unshift(prod);
  else {
    const i = state.products.findIndex((p) => p.id === prod.id);
    if (i >= 0) state.products[i] = prod;
  }
  notify();
}
function toggleProductActive(id) {
  const p = state.products.find((x) => x.id === id);
  if (p) p.active = !p.active;
  notify();
}
function deleteProduct(id) {
  state.products = state.products.filter((p) => p.id !== id);
  notify();
}

// Adjust stock for one unit by delta, with txn logging
function applyStockDelta(code, delta, type, doc, extra) {
  const ref = findUnitRef(state, code);
  if (!ref) return;
  ref.target.stock = Math.max(0, ref.target.stock + delta);
  if (delta) addTxn({ date: TODAY, type, doc, code, qty: delta, after: ref.target.stock, ...(extra || {}) });
}

// Orders: deduct stock when status becomes committed; restore on cancel
const COMMITTED = ["Đã xác nhận", "Đang giao", "Đã giao"];
function commitOrderStock(order, apply) {
  if (apply && !order.stockApplied) {
    order.items.forEach((it) => applyStockDelta(it.code, -it.qty, "Xuất bán", order.id));
    order.stockApplied = true;
  } else if (!apply && order.stockApplied) {
    order.items.forEach((it) => applyStockDelta(it.code, +it.qty, "Xuất bán", order.id + " (hoàn)"));
    order.stockApplied = false;
  }
}
function saveOrder(order, isNew) {
  if (isNew) state.orders.unshift(order);
  else {
    const i = state.orders.findIndex((o) => o.id === order.id);
    if (i >= 0) state.orders[i] = order;
  }
  commitOrderStock(order, COMMITTED.includes(order.status));
  notify();
}
function setOrderStatus(id, status) {
  const o = state.orders.find((x) => x.id === id);
  if (!o) return;
  o.status = status;
  commitOrderStock(o, COMMITTED.includes(status));
  notify();
}

// Purchases
function savePurchase(pur, isNew) {
  if (isNew) state.purchases.unshift(pur);
  else {
    const i = state.purchases.findIndex((p) => p.id === pur.id);
    if (i >= 0) state.purchases[i] = pur;
  }
  notify();
}
function receivePurchase(id) {
  const p = state.purchases.find((x) => x.id === id);
  if (!p || p.stockApplied) return;
  p.items.forEach((it) => {
    applyStockDelta(it.code, +it.qty, "Nhập NCC", p.id);
    const ref = findUnitRef(state, it.code);
    if (ref) ref.target.lastImport = TODAY;
  });
  p.stockApplied = true;
  p.status = "Đã nhập kho";
  notify();
}

// Inventory adjust
function adjustStock(code, mode, qty, reason, note) {
  const ref = findUnitRef(state, code);
  if (!ref) return;
  const before = ref.target.stock;
  let delta = 0;
  if (mode === "inc") delta = qty;
  else if (mode === "dec") delta = -qty;
  else delta = qty - before; // set
  ref.target.stock = Math.max(0, before + delta);
  addTxn({ date: TODAY, type: "Điều chỉnh", doc: "DC-" + TODAY.slice(5).replace("-", ""), code, qty: delta, after: ref.target.stock, reason, note });
  notify();
}
function applyStocktake(results) {
  // results: [{code, actual}]
  const doc = "KK-" + TODAY.slice(5).replace("-", "");
  results.forEach((r) => {
    const ref = findUnitRef(state, r.code);
    if (!ref) return;
    const before = ref.target.stock;
    const delta = r.actual - before;
    if (delta !== 0) {
      ref.target.stock = Math.max(0, r.actual);
      addTxn({ date: TODAY, type: "Kiểm kho", doc, code: r.code, qty: delta, after: ref.target.stock, reason: "Kiểm kê thực tế" });
    }
  });
  notify();
}

// order/purchase total computation
function orderTotals(items, discount, ship) {
  const sub = items.reduce((s, it) => s + it.qty * it.price, 0);
  const disc = sub * ((discount || 0) / 100);
  const total = sub - disc + (Number(ship) || 0);
  return { sub, disc, total };
}
function purchaseTotals(items, supDiscount, ship) {
  const sub = items.reduce((s, it) => s + it.qty * it.cost, 0);
  const total = sub - (Number(supDiscount) || 0) + (Number(ship) || 0);
  return { sub, total };
}

const STATUS_META = {
  // orders
  "Chờ xác nhận": "slate", "Đã xác nhận": "blue", "Đang giao": "amber", "Đã giao": "green", "Huỷ": "red",
  // purchases
  "Nháp": "slate", "Chờ duyệt": "amber", "Đã nhập kho": "green",
};
const STOCK_META = { ok: { cls: "green", label: "Còn hàng" }, low: { cls: "amber", label: "Sắp hết" }, out: { cls: "red", label: "Hết hàng" } };

Object.assign(window, {
  TODAY, vnd, vndShort, dvn,
  useStore, state, notify,
  unitsOf, allUnits, findUnitRef, stockStatus, productStock, productStatus, priceRange,
  nextProductId, nextOrderId, nextPurchaseId,
  saveProduct, toggleProductActive, deleteProduct,
  saveOrder, setOrderStatus, savePurchase, receivePurchase, adjustStock, applyStocktake,
  orderTotals, purchaseTotals,
  STATUS_META, STOCK_META, COMMITTED,
});
