// ===================== MODULE: NHẬP HÀNG =====================
const PUR_PAY = ["Tiền mặt", "CK ngay", "Công nợ"];
const PUR_STATUS = ["Nháp", "Chờ duyệt", "Đã nhập kho", "Huỷ"];

function PurchaseLineItems({ items, setItems }) {
  const st = useStore();
  const addLine = () => setItems([...items, { code: "", qty: 1, cost: 0, note: "" }]);
  const setLine = (i, patch) => { const a = items.slice(); a[i] = { ...a[i], ...patch }; setItems(a); };
  const rmLine = (i) => setItems(items.filter((_, j) => j !== i));
  return React.createElement("div", null,
    React.createElement("div", { className: "vb" },
      React.createElement("table", { className: "li-table" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Sản phẩm / biến thể"),
          React.createElement("th", { style: { width: 50 } }, "SL"),
          React.createElement("th", { style: { width: 90 } }, "Đơn giá nhập"),
          React.createElement("th", { style: { width: 88 } }, "Thành tiền"),
          React.createElement("th", { style: { width: 30 } }))),
        React.createElement("tbody", null,
          items.length === 0
            ? React.createElement("tr", null, React.createElement("td", { colSpan: 5, className: "vb-empty" }, "Chưa có mặt hàng. Bấm + Thêm mặt hàng."))
            : items.map((it, i) =>
                React.createElement(React.Fragment, { key: i },
                  React.createElement("tr", null,
                    React.createElement("td", { className: "li-prod" },
                      React.createElement("select", { className: "input sm", value: it.code, onChange: (e) => setLine(i, { code: e.target.value }) },
                        React.createElement("option", { value: "" }, "— Chọn —"),
                        st.products.map((p) => React.createElement("optgroup", { key: p.id, label: p.id + " · " + p.name },
                          unitsOf(p).map((un) => React.createElement("option", { key: un.code, value: un.code }, un.variantName === "—" ? p.name : un.variantName + " (" + un.code + ")")))))),
                    React.createElement("td", null, React.createElement("input", { className: "input sm num", value: it.qty, onChange: (e) => setLine(i, { qty: Math.max(1, parseInt(e.target.value.replace(/\D/g, "")) || 0) }) })),
                    React.createElement("td", null, React.createElement(MoneyInput, { value: it.cost, onChange: (v) => setLine(i, { cost: v }) })),
                    React.createElement("td", { className: "num strong", style: { whiteSpace: "nowrap" } }, vnd(it.qty * it.cost)),
                    React.createElement("td", null, React.createElement("button", { className: "rm-btn", type: "button", onClick: () => rmLine(i) }, React.createElement(Icon, { name: "x", size: 14 })))),
                  React.createElement("tr", null,
                    React.createElement("td", { colSpan: 5, style: { paddingTop: 0 } },
                      React.createElement("input", { className: "input sm", placeholder: "Ghi chú lô (số lô, hạn dùng…)", value: it.note, onChange: (e) => setLine(i, { note: e.target.value }) }))))
              ))
      )),
    React.createElement("button", { className: "btn sm", type: "button", style: { marginTop: 8 }, onClick: addLine },
      React.createElement(Icon, { name: "plus", size: 14 }), "Thêm mặt hàng")
  );
}

function PurchaseDrawer({ open, onClose, editing, onReceive }) {
  const st = useStore();
  const readOnly = editing && editing.status === "Đã nhập kho";
  const blank = () => ({ id: nextPurchaseId(), date: TODAY, supplierId: "", invoiceNo: "", status: "Nháp", items: [], supDiscount: 0, ship: 0, payMethod: "Công nợ", dueDate: "", paid: 0, note: "", stockApplied: false });
  const [form, setForm] = React.useState(blank);
  React.useEffect(() => { if (open) setForm(editing ? JSON.parse(JSON.stringify(editing)) : blank()); }, [open, editing]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const sup = st.suppliers.find((s) => s.id === form.supplierId);
  const { sub, total } = purchaseTotals(form.items, form.supDiscount, form.ship);

  const createSupplier = (name) => { const id = "NCC" + String(st.suppliers.length + 1).padStart(3, "0"); st.suppliers.push({ id, name, note: "", phone: "", debt: 0 }); set({ supplierId: id }); notify(); toast("Đã tạo NCC " + name, "info"); };
  const validate = () => {
    if (!form.supplierId) { toast("Vui lòng chọn nhà cung cấp", "info"); return false; }
    if (form.items.length === 0 || form.items.some((it) => !it.code)) { toast("Vui lòng chọn mặt hàng nhập", "info"); return false; }
    return true;
  };
  const save = (status) => { if (!validate()) return; savePurchase({ ...form, status }, !editing); toast(status === "Chờ duyệt" ? "Đã gửi duyệt " + form.id : "Đã lưu nháp " + form.id); onClose(); };
  const confirmReceive = () => { if (!validate()) return; savePurchase({ ...form }, !editing); onReceive(form.id, form.items.length); };

  return React.createElement(Drawer, { open, onClose, width: 560 },
    React.createElement("div", { className: "drawer-head" },
      React.createElement("div", null,
        React.createElement("h2", null, editing ? (readOnly ? "Chi tiết phiếu nhập" : "Phiếu nhập hàng") : "Tạo phiếu nhập"),
        React.createElement("div", { className: "dh-sub" }, editing ? React.createElement("span", null, React.createElement("span", { className: "code" }, form.id), " · ", dvn(form.date)) : "Phiếu nhập kho mới")),
      editing && React.createElement("div", { style: { marginLeft: 8 } }, React.createElement(StatusBadge, { status: form.status })),
      React.createElement("button", { className: "x-btn", onClick: onClose }, React.createElement(Icon, { name: "x" }))),
    React.createElement("div", { className: "drawer-body" },
      React.createElement("div", { className: "grid-2" },
        React.createElement(Field, { label: "Nhà cung cấp", required: true },
          readOnly
            ? React.createElement("input", { className: "input", readOnly: true, value: sup ? sup.name : "" })
            : React.createElement(Combo, { value: form.supplierId, onChange: (id) => set({ supplierId: id }), allowCreate: true, onCreate: createSupplier,
                getLabel: (id) => { const s = st.suppliers.find((x) => x.id === id); return s ? s.name : id; },
                options: st.suppliers.map((s) => ({ value: s.id, label: s.name })),
                renderOption: (o) => { const s = st.suppliers.find((x) => x.id === o.value); return React.createElement("div", null, React.createElement("div", { className: "strong" }, s.name), React.createElement("div", { style: { fontSize: 11, color: "var(--text-3)" } }, s.id + " · " + s.note)); } })),
        React.createElement(Field, { label: "Ngày nhập" }, React.createElement("input", { className: "input", type: "date", readOnly: readOnly, value: form.date, onChange: (e) => set({ date: e.target.value }) }))),
      React.createElement(Field, { label: "Số hoá đơn NCC", hint: "Nếu có" },
        React.createElement("input", { className: "input", placeholder: "VD: HL-0601", readOnly: readOnly, value: form.invoiceNo, onChange: (e) => set({ invoiceNo: e.target.value }) })),

      React.createElement("div", { className: "section-head" },
        React.createElement("div", null, React.createElement("h3", null, "Hàng nhập"), React.createElement("div", { className: "sh-sub" }, form.items.length + " mặt hàng"))),
      readOnly
        ? React.createElement("div", { className: "vb" }, React.createElement("table", { className: "li-table" },
            React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Mặt hàng"), React.createElement("th", { className: "num" }, "SL"), React.createElement("th", { className: "num" }, "Đơn giá"), React.createElement("th", { className: "num" }, "Thành tiền"))),
            React.createElement("tbody", null, form.items.map((it, i) => { const u = allUnits(st).find((x) => x.code === it.code); return React.createElement("tr", { key: i },
              React.createElement("td", null, React.createElement("div", { className: "nm" }, u ? u.productName : it.code), React.createElement("div", { className: "meta" }, (u && u.variantName !== "—" ? u.variantName : it.code) + (it.note ? " · " + it.note : ""))),
              React.createElement("td", { className: "num" }, it.qty), React.createElement("td", { className: "num" }, vnd(it.cost)), React.createElement("td", { className: "num strong" }, vnd(it.qty * it.cost))); }))))
        : React.createElement(PurchaseLineItems, { items: form.items, setItems: (v) => set({ items: v }) }),

      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Thanh toán")),
      React.createElement("div", { className: "totals" },
        React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Tổng tiền hàng"), React.createElement("span", null, vnd(sub))),
        React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Chiết khấu NCC"),
          readOnly ? React.createElement("span", null, vnd(form.supDiscount)) : React.createElement(MoneyInput, { value: form.supDiscount, onChange: (v) => set({ supDiscount: v }), className: "input sm num" })),
        React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Phí vận chuyển"),
          readOnly ? React.createElement("span", null, vnd(form.ship)) : React.createElement(MoneyInput, { value: form.ship, onChange: (v) => set({ ship: v }), className: "input sm num" })),
        React.createElement("div", { className: "row grand" }, React.createElement("span", null, "Tổng cộng"), React.createElement("span", { className: "val" }, vnd(total)))),
      React.createElement("div", { className: "grid-2", style: { marginTop: 14 } },
        React.createElement(Field, { label: "Phương thức thanh toán" },
          React.createElement("select", { className: "input", disabled: readOnly, value: form.payMethod, onChange: (e) => set({ payMethod: e.target.value }) },
            PUR_PAY.map((m) => React.createElement("option", { key: m, value: m }, m)))),
        form.payMethod === "Công nợ" && React.createElement(Field, { label: "Hạn thanh toán" },
          React.createElement("input", { className: "input", type: "date", readOnly: readOnly, value: form.dueDate, onChange: (e) => set({ dueDate: e.target.value }) }))),
      React.createElement(Field, { label: "Ghi chú phiếu nhập" },
        React.createElement("textarea", { className: "input", rows: 2, readOnly: readOnly, value: form.note, onChange: (e) => set({ note: e.target.value }) }))
    ),
    React.createElement("div", { className: "drawer-foot" },
      React.createElement("button", { className: "btn ghost", onClick: onClose }, "Đóng"),
      React.createElement("div", { className: "spacer" }),
      readOnly
        ? React.createElement("span", { className: "muted", style: { fontSize: 12, display: "flex", alignItems: "center", gap: 6 } }, React.createElement(Icon, { name: "checkCircle", size: 15, style: { color: "var(--green)" } }), "Đã nhập kho — tồn đã được cộng")
        : [React.createElement("button", { key: "d", className: "btn", onClick: () => save("Nháp") }, "Lưu nháp"),
           React.createElement("button", { key: "r", className: "btn", onClick: () => save("Chờ duyệt") }, "Gửi duyệt"),
           React.createElement("button", { key: "c", className: "btn primary", onClick: confirmReceive }, React.createElement(Icon, { name: "warehouse", size: 15 }), "Xác nhận nhập kho")]
    )
  );
}

function PurchasingModule() {
  const st = useStore();
  const [q, setQ] = React.useState("");
  const [fStatus, setFStatus] = React.useState("all");
  const [fSup, setFSup] = React.useState("all");
  const [drawer, setDrawer] = React.useState({ open: false, editing: null });
  const [confirm, setConfirm] = React.useState(null); // {id, count}

  const supName = (id) => { const s = st.suppliers.find((x) => x.id === id); return s ? s.name : id; };
  const rows = st.purchases.filter((p) => {
    const hay = (p.id + " " + supName(p.supplierId) + " " + p.invoiceNo).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (fStatus !== "all" && p.status !== fStatus) return false;
    if (fSup !== "all" && p.supplierId !== fSup) return false;
    return true;
  });

  const monthCount = st.purchases.filter((p) => p.date.startsWith("2026-06")).length;
  const totalValue = st.purchases.filter((p) => p.status === "Đã nhập kho").reduce((s, p) => s + purchaseTotals(p.items, p.supDiscount, p.ship).total, 0);
  const pending = st.purchases.filter((p) => p.status === "Chờ duyệt").length;
  const supplierDebt = st.suppliers.reduce((s, x) => s + (x.debt || 0), 0);

  const doReceive = (id, count) => { setDrawer({ open: false, editing: null }); setConfirm({ id, count }); };
  const confirmReceive = () => { receivePurchase(confirm.id); toast("Đã nhập " + confirm.count + " mặt hàng vào kho · tồn đã cập nhật", "ok"); setConfirm(null); };

  return React.createElement("div", { className: "content-inner", "data-screen-label": "Nhập hàng" },
    React.createElement("div", { className: "stats" },
      React.createElement(Stat, { label: "Phiếu nhập tháng này", value: monthCount, sub: "Tháng 6/2026", icon: "truck", accent: "blue" }),
      React.createElement(Stat, { label: "Tổng giá trị nhập", value: vnd(totalValue), sub: "Đã nhập kho", icon: "money", accent: "green" }),
      React.createElement(Stat, { label: "Đang chờ duyệt", value: pending, sub: "Cần xử lý", icon: "clock", accent: "amber" }),
      React.createElement(Stat, { label: "Công nợ nhà cung cấp", value: vnd(supplierDebt), sub: "Phải trả", icon: "warn", accent: "red" })),

    React.createElement("div", { className: "toolbar" },
      React.createElement("div", { className: "search" },
        React.createElement("span", { className: "si" }, React.createElement(Icon, { name: "search", size: 15 })),
        React.createElement("input", { placeholder: "Tìm mã phiếu / NCC / số HĐ...", value: q, onChange: (e) => setQ(e.target.value) })),
      React.createElement("select", { className: "input", style: { width: 140 }, value: fStatus, onChange: (e) => setFStatus(e.target.value) },
        React.createElement("option", { value: "all" }, "Mọi trạng thái"), PUR_STATUS.map((s) => React.createElement("option", { key: s, value: s }, s))),
      React.createElement("select", { className: "input", style: { width: 180 }, value: fSup, onChange: (e) => setFSup(e.target.value) },
        React.createElement("option", { value: "all" }, "Mọi nhà cung cấp"), st.suppliers.map((s) => React.createElement("option", { key: s.id, value: s.id }, s.name))),
      React.createElement("button", { className: "btn", title: "Khoảng ngày" }, React.createElement(Icon, { name: "calendar", size: 15 }), "Tháng 6/2026"),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", { className: "btn primary", onClick: () => setDrawer({ open: true, editing: null }) },
        React.createElement(Icon, { name: "plus", size: 16 }), "Tạo phiếu nhập")),

    React.createElement("div", { className: "panel" }, React.createElement("div", { className: "tbl-wrap" },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Mã phiếu"), React.createElement("th", null, "Ngày nhập"), React.createElement("th", null, "Nhà cung cấp"),
          React.createElement("th", { className: "center" }, "Số mặt hàng"), React.createElement("th", { className: "num" }, "Tổng giá trị"),
          React.createElement("th", { className: "num" }, "Đã thanh toán"), React.createElement("th", { className: "num" }, "Còn nợ"),
          React.createElement("th", null, "Trạng thái"), React.createElement("th", { style: { width: 110 } }, "Thao tác"))),
        React.createElement("tbody", null,
          rows.length === 0
            ? React.createElement("tr", null, React.createElement("td", { colSpan: 9 }, React.createElement(Empty, { icon: "truck", title: "Không có phiếu nhập" })))
            : rows.map((p) => {
                const total = purchaseTotals(p.items, p.supDiscount, p.ship).total;
                const debt = Math.max(0, total - (p.paid || 0));
                return React.createElement("tr", { className: "row", key: p.id, style: { cursor: "pointer" }, onClick: () => setDrawer({ open: true, editing: p }) },
                  React.createElement("td", null, React.createElement("button", { className: "linkish" }, p.id)),
                  React.createElement("td", { className: "nowrap muted" }, dvn(p.date)),
                  React.createElement("td", { className: "strong" }, supName(p.supplierId)),
                  React.createElement("td", { className: "center" }, p.items.length),
                  React.createElement("td", { className: "num strong" }, vnd(total)),
                  React.createElement("td", { className: "num muted" }, vnd(p.paid || 0)),
                  React.createElement("td", { className: "num" }, debt > 0 ? React.createElement("span", { style: { color: "var(--red)", fontWeight: 600 } }, vnd(debt)) : React.createElement("span", { className: "muted" }, "—")),
                  React.createElement("td", null, React.createElement(StatusBadge, { status: p.status })),
                  React.createElement("td", null, React.createElement("div", { className: "row-actions" },
                    React.createElement("button", { className: "act", title: "Xem / sửa", onClick: (e) => { e.stopPropagation(); setDrawer({ open: true, editing: p }); } }, React.createElement(Icon, { name: p.status === "Đã nhập kho" ? "eye" : "edit", size: 15 })),
                    p.status !== "Đã nhập kho" && p.status !== "Huỷ" && React.createElement("button", { className: "act", title: "Nhập kho ngay", onClick: (e) => { e.stopPropagation(); setConfirm({ id: p.id, count: p.items.length }); } }, React.createElement(Icon, { name: "warehouse", size: 15 })))));
              }))
      )
    )),
    React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--text-3)" } }, "Hiển thị ", rows.length, " / ", st.purchases.length, " phiếu nhập"),

    React.createElement(PurchaseDrawer, { open: drawer.open, editing: drawer.editing, onClose: () => setDrawer({ open: false, editing: null }), onReceive: doReceive }),

    React.createElement(Modal, { open: !!confirm, onClose: () => setConfirm(null), width: 420 },
      confirm && React.createElement(React.Fragment, null,
        React.createElement("div", { className: "modal-head" },
          React.createElement("div", { className: "mh-ic", style: { background: "var(--primary-soft)", color: "var(--primary)" } }, React.createElement(Icon, { name: "warehouse", size: 19 })),
          React.createElement("div", null, React.createElement("h2", null, "Xác nhận nhập kho"), React.createElement("div", { className: "mh-sub" }, "Phiếu " + confirm.id))),
        React.createElement("div", { className: "modal-body" },
          React.createElement("div", { style: { fontSize: 13.5 } }, "Xác nhận nhập ", React.createElement("b", null, confirm.count + " mặt hàng"), " vào kho?"),
          React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-3)", marginTop: 8 } }, "Số lượng sẽ được ", React.createElement("b", { style: { color: "var(--text-2)" } }, "cộng tự động vào tồn kho"), " và ghi nhận vào lịch sử xuất/nhập. Thao tác này không thể hoàn tác.")),
        React.createElement("div", { className: "modal-foot" },
          React.createElement("button", { className: "btn", onClick: () => setConfirm(null) }, "Huỷ"),
          React.createElement("button", { className: "btn primary", onClick: confirmReceive }, React.createElement(Icon, { name: "check", size: 15 }), "Xác nhận nhập kho"))))
  );
}

Object.assign(window, { PurchasingModule, PUR_PAY, PUR_STATUS });
