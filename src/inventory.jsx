// ===================== MODULE: KHO HÀNG =====================
const ADJ_REASONS = ["Kiểm kê thực tế", "Hàng hỏng vỡ", "Nhầm lẫn nhập liệu", "Khác"];
const TXN_KIND = { "Nhập NCC": "green", "Xuất bán": "blue", "Điều chỉnh": "amber", "Kiểm kho": "primary" };

function AdjustModal({ open, onClose, unit }) {
  const [mode, setMode] = React.useState("inc");
  const [qty, setQty] = React.useState(0);
  const [reason, setReason] = React.useState(ADJ_REASONS[0]);
  const [note, setNote] = React.useState("");
  React.useEffect(() => { if (open) { setMode("inc"); setQty(0); setReason(ADJ_REASONS[0]); setNote(""); } }, [open]);
  if (!unit) return null;
  const result = mode === "inc" ? unit.stock + qty : mode === "dec" ? Math.max(0, unit.stock - qty) : qty;
  const save = () => {
    adjustStock(unit.code, mode, qty, reason, note);
    toast("Đã điều chỉnh tồn " + unit.code + " → " + result + " " + unit.unit);
    onClose();
  };
  return React.createElement(Modal, { open, onClose, width: 440 },
    React.createElement("div", { className: "modal-head" },
      React.createElement("div", { className: "mh-ic", style: { background: "var(--amber-soft)", color: "var(--amber)" } }, React.createElement(Icon, { name: "adjust", size: 19 })),
      React.createElement("div", null, React.createElement("h2", null, "Điều chỉnh tồn kho"),
        React.createElement("div", { className: "mh-sub" }, unit.productName, " · ", unit.variantName === "—" ? unit.code : unit.variantName)),
      React.createElement("button", { className: "x-btn", onClick: onClose }, React.createElement(Icon, { name: "x" }))),
    React.createElement("div", { className: "modal-body" },
      React.createElement("div", { style: { display: "flex", gap: 10, marginBottom: 16 } },
        React.createElement("div", { className: "totals", style: { flex: 1, textAlign: "center", padding: "10px 8px" } },
          React.createElement("div", { style: { fontSize: 11, color: "var(--text-3)" } }, "Tồn hiện tại"),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 800 } }, unit.stock)),
        React.createElement("div", { style: { display: "grid", placeItems: "center", color: "var(--text-3)" } }, React.createElement(Icon, { name: "chevR", size: 18 })),
        React.createElement("div", { className: "totals", style: { flex: 1, textAlign: "center", padding: "10px 8px", borderColor: "var(--primary-border)", background: "var(--primary-soft)" } },
          React.createElement("div", { style: { fontSize: 11, color: "var(--primary)" } }, "Sau điều chỉnh"),
          React.createElement("div", { style: { fontSize: 22, fontWeight: 800, color: "var(--primary-hover)" } }, result))),
      React.createElement(Field, { label: "Loại điều chỉnh" },
        React.createElement("div", { className: "radio-row", style: { gridTemplateColumns: "1fr 1fr 1fr" } },
          [["inc", "Tăng (+)"], ["dec", "Giảm (−)"], ["set", "Đặt mới"]].map(([k, l]) =>
            React.createElement("button", { key: k, type: "button", className: "radio-card " + (mode === k ? "on" : ""), style: { justifyContent: "center" }, onClick: () => setMode(k) }, l)))),
      React.createElement(Field, { label: mode === "set" ? "Giá trị tồn mới" : "Số lượng điều chỉnh", required: true },
        React.createElement("input", { className: "input", type: "number", min: 0, value: qty, onChange: (e) => setQty(Math.max(0, parseInt(e.target.value) || 0)) })),
      React.createElement(Field, { label: "Lý do", required: true },
        React.createElement("select", { className: "input", value: reason, onChange: (e) => setReason(e.target.value) }, ADJ_REASONS.map((r) => React.createElement("option", { key: r, value: r }, r)))),
      React.createElement(Field, { label: "Ghi chú" },
        React.createElement("textarea", { className: "input", rows: 2, placeholder: "Mô tả chi tiết...", value: note, onChange: (e) => setNote(e.target.value) }))),
    React.createElement("div", { className: "modal-foot" },
      React.createElement("button", { className: "btn", onClick: onClose }, "Huỷ"),
      React.createElement("button", { className: "btn primary", onClick: save }, React.createElement(Icon, { name: "check", size: 15 }), "Xác nhận điều chỉnh")));
}

function StocktakeModal({ open, onClose }) {
  const st = useStore();
  const units = allUnits(st);
  const [actual, setActual] = React.useState({});
  React.useEffect(() => { if (open) { const m = {}; units.forEach((u) => { m[u.code] = u.stock; }); setActual(m); } }, [open]);
  const setVal = (code, v) => setActual((a) => ({ ...a, [code]: v === "" ? "" : Math.max(0, parseInt(v.replace(/\D/g, "")) || 0) }));
  const diffs = units.filter((u) => actual[u.code] !== "" && actual[u.code] !== u.stock);
  const save = () => {
    applyStocktake(units.map((u) => ({ code: u.code, actual: actual[u.code] === "" ? u.stock : actual[u.code] })));
    toast("Đã lưu kết quả kiểm kho · " + diffs.length + " mặt hàng được cập nhật", "ok");
    onClose();
  };
  return React.createElement(Modal, { open, onClose, width: 680 },
    React.createElement("div", { className: "modal-head" },
      React.createElement("div", { className: "mh-ic", style: { background: "var(--primary-soft)", color: "var(--primary)" } }, React.createElement(Icon, { name: "clipboard", size: 19 })),
      React.createElement("div", null, React.createElement("h2", null, "Kiểm kho"),
        React.createElement("div", { className: "mh-sub" }, "Nhập tồn thực tế đếm được — chênh lệch tính tự động")),
      React.createElement("button", { className: "x-btn", onClick: onClose }, React.createElement(Icon, { name: "x" }))),
    React.createElement("div", { className: "modal-body", style: { padding: 0 } },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Sản phẩm"), React.createElement("th", null, "Biến thể"),
          React.createElement("th", { className: "num" }, "Tồn hệ thống"), React.createElement("th", { className: "num", style: { width: 120 } }, "Tồn thực tế"),
          React.createElement("th", { className: "num" }, "Chênh lệch"))),
        React.createElement("tbody", null, units.map((u) => {
          const a = actual[u.code]; const d = a === "" || a == null ? 0 : a - u.stock;
          return React.createElement("tr", { key: u.code },
            React.createElement("td", { className: "strong" }, u.productName),
            React.createElement("td", { className: "muted" }, u.variantName === "—" ? u.code : u.variantName),
            React.createElement("td", { className: "num" }, u.stock),
            React.createElement("td", { className: "num" }, React.createElement("input", { className: "input sm num", style: { width: 90, marginLeft: "auto" }, value: a, onChange: (e) => setVal(u.code, e.target.value) })),
            React.createElement("td", { className: "num" }, d === 0 ? React.createElement("span", { className: "muted" }, "0") : React.createElement("span", { className: d > 0 ? "delta-pos" : "delta-neg" }, (d > 0 ? "+" : "") + d)));
        }))) ),
    React.createElement("div", { className: "modal-foot" },
      React.createElement("div", { style: { marginRight: "auto", fontSize: 12, color: "var(--text-2)", alignSelf: "center" } }, diffs.length, " mặt hàng có chênh lệch"),
      React.createElement("button", { className: "btn", onClick: onClose }, "Huỷ"),
      React.createElement("button", { className: "btn primary", onClick: save }, React.createElement(Icon, { name: "check", size: 15 }), "Lưu kết quả kiểm kho")));
}

function StockTab() {
  const st = useStore();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const units = allUnits(st).filter((u) => {
    const hay = (u.code + " " + u.productName + " " + u.variantName).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    const s = stockStatus(u);
    if (filter !== "all" && s !== filter) return false;
    return true;
  });
  return React.createElement("div", null,
    React.createElement("div", { className: "toolbar" },
      React.createElement("div", { className: "search" },
        React.createElement("span", { className: "si" }, React.createElement(Icon, { name: "search", size: 15 })),
        React.createElement("input", { placeholder: "Tìm mã / tên sản phẩm...", value: q, onChange: (e) => setQ(e.target.value) })),
      React.createElement("div", { className: "segmented" },
        [["all", "Tất cả"], ["ok", "Còn hàng"], ["low", "Sắp hết"], ["out", "Hết hàng"]].map(([k, l]) =>
          React.createElement("button", { key: k, className: filter === k ? "on" : "", onClick: () => setFilter(k) }, l)))),
    React.createElement("div", { className: "panel" }, React.createElement("div", { className: "tbl-wrap" },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Mã SP"), React.createElement("th", null, "Tên SP"), React.createElement("th", null, "Biến thể"),
          React.createElement("th", null, "ĐVT"), React.createElement("th", { className: "num" }, "Tồn hiện tại"), React.createElement("th", { className: "num" }, "Tồn tối thiểu"),
          React.createElement("th", { className: "num" }, "Tồn tối đa"), React.createElement("th", null, "Trạng thái"), React.createElement("th", null, "Lần nhập cuối"),
          React.createElement("th", { style: { width: 110 } }, "Thao tác"))),
        React.createElement("tbody", null, units.map((u) => {
          const s = stockStatus(u);
          return React.createElement("tr", { key: u.code, className: "row " + (s === "out" ? "row-out" : "") },
            React.createElement("td", null, React.createElement("span", { className: "code" }, u.code)),
            React.createElement("td", { className: "strong" }, u.productName),
            React.createElement("td", { className: "muted" }, u.variantName),
            React.createElement("td", null, u.unit),
            React.createElement("td", { className: "num strong", style: s === "out" ? { color: "var(--red)" } : null }, u.stock),
            React.createElement("td", { className: "num muted" }, u.min),
            React.createElement("td", { className: "num muted" }, u.max),
            React.createElement("td", null, React.createElement(StockBadge, { status: s })),
            React.createElement("td", { className: "muted nowrap" }, dvn(u.lastImport)),
            React.createElement("td", null, React.createElement("button", { className: "btn sm", onClick: () => window.__openAdjust(u) }, React.createElement(Icon, { name: "adjust", size: 14 }), "Điều chỉnh")));
        }))) )),
    React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--text-3)" } }, "Hiển thị ", units.length, " SKU"));
}

function HistoryTab() {
  const st = useStore();
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState("all");
  const rows = st.txns.filter((t) => {
    const hay = (t.code + " " + t.doc + " " + t.type).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (kind !== "all" && t.type !== kind) return false;
    return true;
  });
  const pname = (code) => { const u = allUnits(st).find((x) => x.code === code); return u ? (u.variantName === "—" ? u.productName : u.productName + " · " + u.variantName) : code; };
  return React.createElement("div", null,
    React.createElement("div", { className: "toolbar" },
      React.createElement("div", { className: "search" },
        React.createElement("span", { className: "si" }, React.createElement(Icon, { name: "search", size: 15 })),
        React.createElement("input", { placeholder: "Tìm mã SP / chứng từ...", value: q, onChange: (e) => setQ(e.target.value) })),
      React.createElement("select", { className: "input", style: { width: 170 }, value: kind, onChange: (e) => setKind(e.target.value) },
        React.createElement("option", { value: "all" }, "Mọi loại giao dịch"), Object.keys(TXN_KIND).map((k) => React.createElement("option", { key: k, value: k }, k)))),
    React.createElement("div", { className: "panel" }, React.createElement("div", { className: "tbl-wrap" },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Ngày"), React.createElement("th", null, "Loại"), React.createElement("th", null, "Mã chứng từ"),
          React.createElement("th", null, "Sản phẩm"), React.createElement("th", { className: "num" }, "Số lượng"), React.createElement("th", { className: "num" }, "Tồn sau"),
          React.createElement("th", null, "Người thực hiện"))),
        React.createElement("tbody", null,
          rows.length === 0
            ? React.createElement("tr", null, React.createElement("td", { colSpan: 7 }, React.createElement(Empty, { icon: "layers", title: "Chưa có giao dịch" })))
            : rows.map((t) => React.createElement("tr", { className: "row", key: t.id },
                React.createElement("td", { className: "nowrap muted" }, dvn(t.date)),
                React.createElement("td", null, React.createElement(Badge, { kind: TXN_KIND[t.type] || "slate" }, t.type)),
                React.createElement("td", null, React.createElement("span", { className: "code" }, t.doc)),
                React.createElement("td", null, React.createElement("div", { className: "strong", style: { fontSize: 12 } }, pname(t.code)), t.reason && React.createElement("div", { className: "muted", style: { fontSize: 11 } }, t.reason)),
                React.createElement("td", { className: "num" }, React.createElement("span", { className: t.qty > 0 ? "delta-pos" : "delta-neg" }, (t.qty > 0 ? "+" : "") + t.qty)),
                React.createElement("td", { className: "num strong" }, t.after),
                React.createElement("td", { className: "muted" }, t.user)))
        ))) ),
    React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--text-3)" } }, rows.length, " giao dịch"));
}

function InventoryModule() {
  const st = useStore();
  const [tab, setTab] = React.useState("stock");
  const [adjustUnit, setAdjustUnit] = React.useState(null);
  const [stocktake, setStocktake] = React.useState(false);
  React.useEffect(() => { window.__openAdjust = (u) => setAdjustUnit(u); }, []);

  const units = allUnits(st);
  const totalValue = units.reduce((s, u) => s + u.stock * u.wholesale, 0);
  const low = units.filter((u) => stockStatus(u) === "low").length;
  const out = units.filter((u) => stockStatus(u) === "out").length;

  return React.createElement("div", { className: "content-inner", "data-screen-label": "Kho hàng" },
    React.createElement("div", { className: "stats" },
      React.createElement(Stat, { label: "Tổng SKU", value: units.length, sub: "Mã hàng đang quản lý", icon: "package", accent: "blue" }),
      React.createElement(Stat, { label: "Tổng giá trị tồn", value: vnd(totalValue), sub: "Theo giá vốn (giá sỉ)", icon: "money", accent: "green" }),
      React.createElement(Stat, { label: "Sắp hết hàng", value: low, sub: "Cần lên kế hoạch nhập", icon: "warn", accent: "amber" }),
      React.createElement(Stat, { label: "Hết hàng", value: out, sub: "Ngừng bán tạm thời", icon: "warn", accent: "red" })),

    React.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" } },
      React.createElement("div", { className: "tabs", style: { marginBottom: 0, borderBottom: "none" } },
        React.createElement("button", { className: tab === "stock" ? "on" : "", onClick: () => setTab("stock") }, "Tồn kho"),
        React.createElement("button", { className: tab === "history" ? "on" : "", onClick: () => setTab("history") }, "Lịch sử xuất/nhập")),
      React.createElement("div", { style: { display: "flex", gap: 8 } },
        React.createElement("button", { className: "btn", onClick: () => setStocktake(true) }, React.createElement(Icon, { name: "clipboard", size: 15 }), "Kiểm kho"),
        React.createElement("button", { className: "btn", onClick: () => toast("Đang xuất báo cáo tồn kho (demo)", "info") }, React.createElement(Icon, { name: "download", size: 15 }), "Xuất báo cáo"))),
    React.createElement("div", { style: { borderBottom: "1px solid var(--border)", margin: "0 0 16px" } }),

    tab === "stock" ? React.createElement(StockTab) : React.createElement(HistoryTab),

    React.createElement(AdjustModal, { open: !!adjustUnit, unit: adjustUnit, onClose: () => setAdjustUnit(null) }),
    React.createElement(StocktakeModal, { open: stocktake, onClose: () => setStocktake(false) })
  );
}

Object.assign(window, { InventoryModule, ADJ_REASONS });
