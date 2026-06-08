// ===================== SHARED UI =====================

// ---- Icons (single component, path map) ----
const ICONS = {
  search: "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35",
  plus: "M12 5v14M5 12h14",
  box: "M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8",
  cart: "M6 6h15l-1.5 9h-12zM6 6L5 3H2M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z",
  truck: "M1 4h13v11H1zM14 8h4l3 3v4h-7M5.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z",
  warehouse: "M3 21V9l9-5 9 5v12M3 21h18M7 21v-7h10v7M10 14v7M14 14v7",
  edit: "M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  eye: "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z|M12 15a3 3 0 100-6 3 3 0 000 6z",
  eyeOff: "M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19M1 1l22 22M9.5 9.5a3 3 0 004 4",
  more: "M12 6a1 1 0 100-2 1 1 0 000 2zM12 13a1 1 0 100-2 1 1 0 000 2zM12 20a1 1 0 100-2 1 1 0 000 2z",
  chevR: "M9 18l6-6-6-6",
  chevD: "M6 9l6 6 6-6",
  x: "M18 6L6 18M6 6l12 12",
  trash: "M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  check: "M20 6L9 17l-5-5",
  checkCircle: "M22 11.08V12a10 10 0 11-5.93-9.14|M22 4L12 14.01l-3-3",
  warn: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  money: "M1 4h22v16H1zM12 8a4 4 0 100 8 4 4 0 000-8z",
  clock: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 6v6l4 2",
  truck2: "M1 4h13v11H1zM14 8h4l3 3v4h-7",
  bell: "M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  adjust: "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6",
  clipboard: "M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1zM8 5H6a2 2 0 00-2 2v13a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 12l2 2 4-4",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  userPlus: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54z",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  info: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 16v-4M12 8h.01",
  layers: "M12 2l10 6-10 6L2 8zM2 14l10 6 10-6",
  arrowDown: "M12 5v14M19 12l-7 7-7-7",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  package: "M16.5 9.4L7.5 4.21M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z|M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12",
};
function Icon({ name, size = 16, className = "", style }) {
  const d = ICONS[name] || "";
  const paths = d.split("|");
  return (
    React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className, style, "aria-hidden": true },
      paths.map((p, i) => React.createElement("path", { key: i, d: p }))
    )
  );
}

function Badge({ kind, children, dot }) {
  return React.createElement("span", { className: "badge " + (kind || "slate") },
    dot && React.createElement("span", { className: "dot" }), children);
}

function StatusBadge({ status }) {
  const cls = STATUS_META[status] || "slate";
  return React.createElement(Badge, { kind: cls, dot: true }, status);
}
function StockBadge({ status }) {
  const m = STOCK_META[status];
  return React.createElement(Badge, { kind: m.cls, dot: true }, m.label);
}

// ---- Drawer ----
function Drawer({ open, onClose, width = 480, children }) {
  const [mounted, setMounted] = React.useState(open);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShow(true))); }
    else { setShow(false); const t = setTimeout(() => setMounted(false), 280); return () => clearTimeout(t); }
  }, [open]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "overlay " + (show ? "show" : ""), onClick: onClose }),
    React.createElement("div", { className: "drawer " + (show ? "show" : ""), style: { width } }, children)
  );
}

// ---- Modal ----
function Modal({ open, onClose, width = 460, children }) {
  const [mounted, setMounted] = React.useState(open);
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    if (open) { setMounted(true); requestAnimationFrame(() => requestAnimationFrame(() => setShow(true))); }
    else { setShow(false); const t = setTimeout(() => setMounted(false), 200); return () => clearTimeout(t); }
  }, [open]);
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape" && open) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted) return null;
  return React.createElement("div", { className: "modal-wrap" },
    React.createElement("div", { className: "modal-bg " + (show ? "show" : ""), onClick: onClose }),
    React.createElement("div", { className: "modal " + (show ? "show" : ""), style: { maxWidth: width } }, children)
  );
}

// ---- Toggle ----
function Toggle({ on, onChange, labelOn = "Bật", labelOff = "Tắt" }) {
  return React.createElement("button", { type: "button", className: "toggle " + (on ? "on" : ""), onClick: () => onChange(!on) },
    React.createElement("span", { className: "track" }, React.createElement("span", { className: "knob" })),
    React.createElement("span", { className: "lab", style: { color: on ? "var(--green)" : "var(--text-3)" } }, on ? labelOn : labelOff)
  );
}

// ---- Field ----
function Field({ label, required, hint, children, style }) {
  return React.createElement("div", { className: "field", style },
    label && React.createElement("label", null, label, required && React.createElement("span", { className: "req" }, " *")),
    children,
    hint && React.createElement("div", { className: "hint" }, hint)
  );
}

// ---- Money input (formats with thousands sep) ----
function MoneyInput({ value, onChange, className = "input sm num", placeholder }) {
  const display = value === "" || value == null ? "" : Number(value).toLocaleString("vi-VN");
  return React.createElement("input", {
    className, placeholder: placeholder || "0", value: display, inputMode: "numeric",
    onChange: (e) => { const raw = e.target.value.replace(/[^\d]/g, ""); onChange(raw === "" ? 0 : parseInt(raw, 10)); },
  });
}

// ---- Action menu (3 dots) ----
function ActionMenu({ items }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  return React.createElement("div", { className: "menu-wrap", ref },
    React.createElement("button", { className: "act", title: "Thêm", onClick: (e) => { e.stopPropagation(); setOpen((v) => !v); } },
      React.createElement(Icon, { name: "more" })),
    open && React.createElement("div", { className: "menu" },
      items.map((it, i) => it.sep
        ? React.createElement("div", { key: i, className: "sep" })
        : React.createElement("button", { key: i, className: it.danger ? "danger" : "", onClick: (e) => { e.stopPropagation(); setOpen(false); it.onClick(); } },
            it.icon && React.createElement(Icon, { name: it.icon, size: 14 }), it.label)
      )
    )
  );
}

// ---- Toast host ----
let _toastId = 0;
const _toastListeners = new Set();
function toast(msg, kind = "ok") {
  const t = { id: ++_toastId, msg, kind };
  _toastListeners.forEach((f) => f(t));
}
function ToastHost() {
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    const add = (t) => {
      setItems((arr) => [...arr, t]);
      setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== t.id)), 2600);
    };
    _toastListeners.add(add);
    return () => _toastListeners.delete(add);
  }, []);
  return React.createElement("div", { className: "toast-host" },
    items.map((t) => React.createElement("div", { key: t.id, className: "toast " + t.kind },
      React.createElement("span", { className: "t-ic" }, React.createElement(Icon, { name: t.kind === "ok" ? "checkCircle" : "info", size: 17 })),
      t.msg))
  );
}

// ---- Empty state ----
function Empty({ icon = "box", title, sub }) {
  return React.createElement("div", { className: "empty" },
    React.createElement("div", { className: "e-ic" }, React.createElement(Icon, { name: icon, size: 22 })),
    React.createElement("div", { className: "strong", style: { color: "var(--text-2)", marginBottom: 3 } }, title),
    sub && React.createElement("div", null, sub)
  );
}

// ---- Stat card ----
function Stat({ label, value, sub, icon, accent }) {
  return React.createElement("div", { className: "stat accent-" + accent },
    React.createElement("div", { className: "st-ic" }, React.createElement(Icon, { name: icon, size: 16 })),
    React.createElement("div", { className: "st-label" }, label),
    React.createElement("div", { className: "st-value" }, value),
    sub && React.createElement("div", { className: "st-sub" }, sub)
  );
}

// ---- Searchable combobox ----
function Combo({ value, onChange, options, placeholder = "Tìm & chọn...", renderOption, allowCreate, onCreate, getLabel }) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const ref = React.useRef(null);
  const label = getLabel ? getLabel(value) : value;
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);
  const filtered = options.filter((o) => (getLabel ? getLabel(o.value) : o.label).toLowerCase().includes(q.toLowerCase()));
  return React.createElement("div", { className: "menu-wrap", ref, style: { position: "relative" } },
    React.createElement("button", { type: "button", className: "input", style: { textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between" }, onClick: () => setOpen((v) => !v) },
      React.createElement("span", { style: { color: value ? "var(--text)" : "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, value ? label : placeholder),
      React.createElement(Icon, { name: "chevD", size: 14, style: { color: "var(--text-3)", flex: "none" } })
    ),
    open && React.createElement("div", { className: "menu", style: { left: 0, right: 0, minWidth: 0, maxHeight: 280, overflow: "auto" } },
      React.createElement("div", { style: { padding: 4 } },
        React.createElement("input", { className: "input sm", autoFocus: true, placeholder: "Gõ để tìm...", value: q, onChange: (e) => setQ(e.target.value) })),
      filtered.map((o, i) => React.createElement("button", { key: i, onClick: () => { onChange(o.value); setOpen(false); setQ(""); } },
        renderOption ? renderOption(o) : o.label)),
      filtered.length === 0 && !allowCreate && React.createElement("div", { style: { padding: 10, color: "var(--text-3)", fontSize: 12, textAlign: "center" } }, "Không tìm thấy"),
      allowCreate && q && React.createElement("button", { onClick: () => { onCreate(q); setOpen(false); setQ(""); }, style: { color: "var(--primary)", fontWeight: 600 } },
        React.createElement(Icon, { name: "plus", size: 14 }), "Tạo mới: \"" + q + "\"")
    )
  );
}

Object.assign(window, { Icon, Badge, StatusBadge, StockBadge, Drawer, Modal, Toggle, Field, MoneyInput, ActionMenu, toast, ToastHost, Empty, Stat, Combo });
