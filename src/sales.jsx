// ===================== MODULE: BÁN HÀNG =====================
const CHANNELS = ["Web", "Zalo", "Đại lý", "Trực tiếp"];
const PAY_METHODS = ["COD", "Chuyển khoản", "VNPay", "Công nợ"];
const CARRIERS = ["GHN", "GHTK", "Tự giao"];
const ORDER_FLOW = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao", "Huỷ"];

function channelKind(ch) { return { "Web": "blue", "Zalo": "primary", "Đại lý": "amber", "Trực tiếp": "slate" }[ch] || "slate"; }

function OrderLineItems({ items, setItems, priceKey }) {
  const st = useStore();
  const units = allUnits(st);
  const addLine = () => setItems([...items, { code: "", qty: 1, price: 0 }]);
  const setLine = (i, patch) => { const a = items.slice(); a[i] = { ...a[i], ...patch }; setItems(a); };
  const rmLine = (i) => setItems(items.filter((_, j) => j !== i));
  const pickProduct = (i, code) => {
    const u = units.find((x) => x.code === code);
    setLine(i, { code, price: u ? u[priceKey] : 0 });
  };
  return React.createElement("div", null,
    React.createElement("div", { className: "vb" },
      React.createElement("table", { className: "li-table" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Sản phẩm / biến thể"),
          React.createElement("th", { style: { width: 52 } }, "SL"),
          React.createElement("th", { style: { width: 92 } }, "Đơn giá"),
          React.createElement("th", { style: { width: 92 } }, "Thành tiền"),
          React.createElement("th", { style: { width: 30 } }))),
        React.createElement("tbody", null,
          items.length === 0
            ? React.createElement("tr", null, React.createElement("td", { colSpan: 5, className: "vb-empty" }, "Chưa có sản phẩm. Bấm + Thêm dòng."))
            : items.map((it, i) => {
                const u = units.find((x) => x.code === it.code);
                return React.createElement("tr", { key: i },
                  React.createElement("td", { className: "li-prod" },
                    React.createElement("select", { className: "input sm", value: it.code, onChange: (e) => pickProduct(i, e.target.value) },
                      React.createElement("option", { value: "" }, "— Chọn —"),
                      st.products.map((p) => React.createElement("optgroup", { key: p.id, label: p.id + " · " + p.name },
                        unitsOf(p).map((un) => React.createElement("option", { key: un.code, value: un.code }, un.variantName === "—" ? p.name : un.variantName + " (" + un.code + ")"))))),
                    u && React.createElement("div", { className: "meta" }, "Tồn: ", u.stock, " ", u.unit, u.stock < it.qty ? " · ⚠ vượt tồn" : "")),
                  React.createElement("td", null, React.createElement("input", { className: "input sm num", value: it.qty, onChange: (e) => setLine(i, { qty: Math.max(1, parseInt(e.target.value.replace(/\D/g, "")) || 0) }) })),
                  React.createElement("td", null, React.createElement(MoneyInput, { value: it.price, onChange: (v) => setLine(i, { price: v }) })),
                  React.createElement("td", { className: "num strong", style: { whiteSpace: "nowrap" } }, vnd(it.qty * it.price)),
                  React.createElement("td", null, React.createElement("button", { className: "rm-btn", type: "button", onClick: () => rmLine(i) }, React.createElement(Icon, { name: "x", size: 14 }))));
              }))
      )),
    React.createElement("button", { className: "btn sm", type: "button", style: { marginTop: 8 }, onClick: addLine },
      React.createElement(Icon, { name: "plus", size: 14 }), "Thêm dòng")
  );
}

function OrderDetail({ form, cust, sub, disc, total }) {
  const st = useStore();
  const cancelled = form.status === "Huỷ";
  const curIdx = ORDER_FLOW.indexOf(form.status);
  const steps = ["Chờ xác nhận", "Đã xác nhận", "Đang giao", "Đã giao"];
  return React.createElement("div", { className: "drawer-cols" },
    // LEFT — customer + items
    React.createElement("div", null,
      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Khách hàng")),
      React.createElement("div", { className: "info-card" },
        React.createElement("div", { className: "ic-name" }, cust ? cust.name : "—"),
        React.createElement("div", { className: "ic-line" },
          React.createElement(Icon, { name: "user", size: 13, style: { color: "var(--text-3)" } }), cust ? cust.phone : "",
          cust && React.createElement(Badge, { kind: cust.type === "Đại lý" ? "amber" : "slate" }, cust.type)),
        React.createElement("div", { className: "ic-addr" },
          React.createElement(Icon, { name: "truck2", size: 13, style: { color: "var(--text-3)", flex: "none", marginTop: 1 } }),
          React.createElement("span", null, form.addr || "—"))),

      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Thông tin đơn")),
      React.createElement("div", { className: "kv-grid" },
        React.createElement("div", { className: "kv" }, React.createElement("span", { className: "k" }, "Mã đơn"), React.createElement("span", { className: "v code" }, form.id)),
        React.createElement("div", { className: "kv" }, React.createElement("span", { className: "k" }, "Ngày tạo"), React.createElement("span", { className: "v" }, dvn(form.date))),
        React.createElement("div", { className: "kv" }, React.createElement("span", { className: "k" }, "Kênh bán"), React.createElement("span", { className: "v" }, React.createElement(Badge, { kind: channelKind(form.channel) }, form.channel))),
        React.createElement("div", { className: "kv" }, React.createElement("span", { className: "k" }, "Đơn vị vận chuyển"), React.createElement("span", { className: "v" }, form.carrier))),

      React.createElement("div", { className: "section-head" },
        React.createElement("div", null, React.createElement("h3", null, "Sản phẩm"), React.createElement("div", { className: "sh-sub" }, form.items.length + " mặt hàng"))),
      React.createElement("div", { className: "vb" }, React.createElement("table", { className: "li-table" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Sản phẩm"), React.createElement("th", { style: { width: 90 } }, "Mã SP"),
          React.createElement("th", { className: "num", style: { width: 40 } }, "SL"), React.createElement("th", { className: "num", style: { width: 86 } }, "Đơn giá"), React.createElement("th", { className: "num", style: { width: 92 } }, "Thành tiền"))),
        React.createElement("tbody", null, form.items.map((it, i) => { const u = allUnits(st).find((x) => x.code === it.code); return React.createElement("tr", { key: i },
          React.createElement("td", null, React.createElement("div", { className: "nm" }, u ? u.productName : it.code), u && u.variantName !== "—" && React.createElement("div", { className: "meta" }, u.variantName)),
          React.createElement("td", null, React.createElement("span", { className: "code" }, it.code)),
          React.createElement("td", { className: "num" }, it.qty),
          React.createElement("td", { className: "num" }, vnd(it.price)),
          React.createElement("td", { className: "num strong" }, vnd(it.qty * it.price))); }))) ),
      form.note && React.createElement(React.Fragment, null,
        React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Ghi chú")),
        React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-2)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "9px 12px" } }, form.note))
    ),
    // RIGHT — status + payment + shipping
    React.createElement("div", { style: { background: "var(--surface-2)" } },
      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Trạng thái đơn")),
      React.createElement("div", { className: "timeline" },
        cancelled
          ? [React.createElement("div", { key: "x", className: "tl-step cancelled" },
              React.createElement("div", { className: "tl-mark" }, React.createElement("div", { className: "tl-dot" }, React.createElement(Icon, { name: "x", size: 13 }))),
              React.createElement("div", { className: "tl-body" }, React.createElement("div", { className: "tl-title" }, "Đã huỷ"), React.createElement("div", { className: "tl-sub" }, form.note || "Đơn hàng đã bị huỷ")))]
          : steps.map((s, i) => {
              const cls = i < curIdx ? "done" : i === curIdx ? "current" : "";
              return React.createElement("div", { key: s, className: "tl-step " + cls },
                React.createElement("div", { className: "tl-mark" },
                  React.createElement("div", { className: "tl-dot" }, i <= curIdx ? React.createElement(Icon, { name: "check", size: 12 }) : i + 1),
                  React.createElement("div", { className: "tl-bar" })),
                React.createElement("div", { className: "tl-body" },
                  React.createElement("div", { className: "tl-title" }, s),
                  i === curIdx && React.createElement("div", { className: "tl-sub" }, "Trạng thái hiện tại")));
            })),

      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Thanh toán")),
      React.createElement("div", { className: "totals", style: { marginBottom: 12 } },
        React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Tạm tính"), React.createElement("span", { className: "val" }, vnd(sub))),
        form.discount > 0 && React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Chiết khấu (" + form.discount + "%)"), React.createElement("span", { style: { color: "var(--red)" } }, "−" + vnd(disc))),
        React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Phí ship"), React.createElement("span", { className: "val" }, vnd(form.ship))),
        React.createElement("div", { className: "row grand" }, React.createElement("span", null, "Tổng cộng"), React.createElement("span", { className: "val" }, vnd(total)))),
      React.createElement("div", { style: { padding: "0 0 6px" } },
        React.createElement("div", { className: "read-row" }, React.createElement("span", { className: "rr-k" }, "Phương thức TT"), React.createElement("span", { className: "rr-v" }, React.createElement("span", { className: "chip" }, form.payMethod))),
        React.createElement("div", { className: "read-row" }, React.createElement("span", { className: "rr-k" }, "Đơn vị vận chuyển"), React.createElement("span", { className: "rr-v" }, form.carrier))),
      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Địa chỉ giao hàng")),
      React.createElement("div", { style: { fontSize: 12.5, color: "var(--text-2)", lineHeight: 1.6 } }, form.addr || "—")
    )
  );
}

function OrderDrawer({ open, onClose, editing }) {
  const st = useStore();
  const readOnly = editing && editing.status !== "Chờ xác nhận" && !editing._forceEdit;
  const blank = () => ({ id: nextOrderId(), date: TODAY, customerId: "", channel: "Web", items: [], discount: 0, ship: 0, payMethod: "COD", status: "Chờ xác nhận", carrier: "GHN", addr: "", note: "", stockApplied: false });
  const [form, setForm] = React.useState(blank);
  React.useEffect(() => { if (open) setForm(editing ? JSON.parse(JSON.stringify(editing)) : blank()); }, [open, editing]);
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const cust = st.customers.find((c) => c.id === form.customerId);
  const priceKey = cust && cust.type === "Đại lý" ? "wholesale" : "retail";
  const { sub, disc, total } = orderTotals(form.items, form.discount, form.ship);

  const pickCustomer = (id) => { const c = st.customers.find((x) => x.id === id); set({ customerId: id, addr: c ? c.addr : form.addr }); };
  const createCustomer = (name) => { const id = "KH" + String(st.customers.length + 1).padStart(3, "0"); st.customers.push({ id, name, phone: "", addr: "", type: "Lẻ" }); set({ customerId: id }); notify(); toast("Đã tạo khách hàng " + name, "info"); };

  const save = (status) => {
    if (!form.customerId) { toast("Vui lòng chọn khách hàng", "info"); return; }
    if (form.items.length === 0 || form.items.some((it) => !it.code)) { toast("Vui lòng chọn sản phẩm cho đơn", "info"); return; }
    saveOrder({ ...form, status }, !editing);
    toast(editing ? "Đã cập nhật " + form.id : status === "Đã xác nhận" ? "Đã xác nhận đơn " + form.id + " · đã trừ tồn kho" : "Đã lưu " + form.id);
    onClose();
  };
  const advance = () => {
    const i = ORDER_FLOW.indexOf(form.status);
    const next = ORDER_FLOW[Math.min(i + 1, 3)];
    setOrderStatus(form.id, next);
    set({ status: next });
    toast("Đơn " + form.id + " → " + next, next === "Đã giao" ? "ok" : "info");
  };

  return React.createElement(Drawer, { open, onClose, width: readOnly ? 760 : 560 },
    React.createElement("div", { className: "drawer-head" },
      React.createElement("div", null,
        React.createElement("h2", null, editing ? (readOnly ? "Chi tiết đơn hàng" : "Cập nhật đơn hàng") : "Tạo đơn hàng"),
        React.createElement("div", { className: "dh-sub" }, editing ? React.createElement("span", null, React.createElement("span", { className: "code" }, form.id), " · ", dvn(form.date)) : "Đơn hàng mới")),
      editing && React.createElement("div", { style: { marginLeft: 8 } }, React.createElement(StatusBadge, { status: form.status })),
      React.createElement("button", { className: "x-btn", onClick: onClose }, React.createElement(Icon, { name: "x" }))
    ),
    React.createElement("div", { style: { flex: 1, overflow: "hidden", display: "flex" } },
      readOnly
      ? React.createElement(OrderDetail, { form, cust, sub, disc, total })
      : React.createElement("div", { className: "drawer-cols" },
        // LEFT
        React.createElement("div", null,
          React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Thông tin đơn")),
          React.createElement(Field, { label: "Khách hàng", required: true },
            readOnly
              ? React.createElement("input", { className: "input", readOnly: true, value: cust ? cust.name : "" })
              : React.createElement(Combo, { value: form.customerId, onChange: pickCustomer, allowCreate: true, onCreate: createCustomer,
                  getLabel: (id) => { const c = st.customers.find((x) => x.id === id); return c ? c.name + " · " + c.phone : id; },
                  options: st.customers.map((c) => ({ value: c.id, label: c.name })),
                  renderOption: (o) => { const c = st.customers.find((x) => x.id === o.value); return React.createElement("div", null, React.createElement("div", { className: "strong" }, c.name), React.createElement("div", { className: "meta", style: { fontSize: 11, color: "var(--text-3)" } }, c.phone + " · " + c.type)); } })),
          cust && React.createElement("div", { style: { fontSize: 11.5, color: "var(--text-3)", marginTop: -8, marginBottom: 12 } }, cust.phone, " · ", React.createElement(Badge, { kind: cust.type === "Đại lý" ? "amber" : "slate" }, cust.type), priceKey === "wholesale" ? " · áp giá sỉ" : ""),
          React.createElement(Field, { label: "Kênh bán" },
            React.createElement("select", { className: "input", disabled: readOnly, value: form.channel, onChange: (e) => set({ channel: e.target.value }) },
              CHANNELS.map((c) => React.createElement("option", { key: c, value: c }, c)))),
          React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Sản phẩm")),
          readOnly
            ? React.createElement("div", { className: "vb" }, React.createElement("table", { className: "li-table" },
                React.createElement("thead", null, React.createElement("tr", null, React.createElement("th", null, "Sản phẩm"), React.createElement("th", { className: "num" }, "SL"), React.createElement("th", { className: "num" }, "Đơn giá"), React.createElement("th", { className: "num" }, "Thành tiền"))),
                React.createElement("tbody", null, form.items.map((it, i) => { const u = allUnits(st).find((x) => x.code === it.code); return React.createElement("tr", { key: i },
                  React.createElement("td", null, React.createElement("div", { className: "nm" }, u ? u.productName : it.code), React.createElement("div", { className: "meta" }, u && u.variantName !== "—" ? u.variantName : it.code)),
                  React.createElement("td", { className: "num" }, it.qty), React.createElement("td", { className: "num" }, vnd(it.price)), React.createElement("td", { className: "num strong" }, vnd(it.qty * it.price))); }))))
            : React.createElement(OrderLineItems, { items: form.items, setItems: (v) => set({ items: v }), priceKey }),
          React.createElement(Field, { label: "Ghi chú đơn hàng", style: { marginTop: 16 } },
            React.createElement("textarea", { className: "input", rows: 2, readOnly: readOnly, value: form.note, onChange: (e) => set({ note: e.target.value }) }))
        ),
        // RIGHT
        React.createElement("div", { style: { background: "var(--surface-2)" } },
          React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Thanh toán")),
          React.createElement("div", { className: "totals", style: { marginBottom: 16 } },
            React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Tạm tính"), React.createElement("span", { className: "val" }, vnd(sub))),
            React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Chiết khấu (%)"),
              readOnly ? React.createElement("span", null, form.discount + "%") : React.createElement("input", { className: "input sm num", style: { width: 64 }, value: form.discount, onChange: (e) => set({ discount: Math.min(100, parseInt(e.target.value.replace(/\D/g, "")) || 0) }) })),
            disc > 0 && React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Giảm"), React.createElement("span", { style: { color: "var(--red)" } }, "−" + vnd(disc))),
            React.createElement("div", { className: "row" }, React.createElement("span", { className: "lab" }, "Phí ship"),
              readOnly ? React.createElement("span", null, vnd(form.ship)) : React.createElement(MoneyInput, { value: form.ship, onChange: (v) => set({ ship: v }), className: "input sm num", })),
            React.createElement("div", { className: "row grand" }, React.createElement("span", null, "Tổng cộng"), React.createElement("span", { className: "val" }, vnd(total)))),
          React.createElement(Field, { label: "Phương thức thanh toán" },
            React.createElement("div", { className: "radio-row cols2" }, PAY_METHODS.map((m) =>
              React.createElement("button", { key: m, type: "button", disabled: readOnly, className: "radio-card " + (form.payMethod === m ? "on" : ""), onClick: () => set({ payMethod: m }) },
                React.createElement("span", { className: "rdot" }), m)))),
          React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Giao hàng")),
          React.createElement(Field, { label: "Địa chỉ giao hàng" },
            React.createElement("textarea", { className: "input", rows: 2, readOnly: readOnly, value: form.addr, onChange: (e) => set({ addr: e.target.value }) })),
          React.createElement(Field, { label: "Đơn vị vận chuyển" },
            React.createElement("select", { className: "input", disabled: readOnly, value: form.carrier, onChange: (e) => set({ carrier: e.target.value }) },
              CARRIERS.map((c) => React.createElement("option", { key: c, value: c }, c))))
        )
      )
    ),
    React.createElement("div", { className: "drawer-foot" },
      React.createElement("button", { className: "btn ghost", onClick: onClose }, "Đóng"),
      React.createElement("div", { className: "spacer" }),
      readOnly
        ? (form.status !== "Đã giao" && form.status !== "Huỷ"
            ? [React.createElement("button", { key: "c", className: "btn danger", onClick: () => { setOrderStatus(form.id, "Huỷ"); set({ status: "Huỷ" }); toast("Đã huỷ đơn " + form.id + " · hoàn tồn kho", "info"); } }, "Huỷ đơn"),
               React.createElement("button", { key: "a", className: "btn primary", onClick: advance }, React.createElement(Icon, { name: "check", size: 15 }), "Cập nhật → " + ORDER_FLOW[Math.min(ORDER_FLOW.indexOf(form.status) + 1, 3)])]
            : React.createElement("span", { className: "muted", style: { fontSize: 12 } }, "Đơn đã ", form.status.toLowerCase(), " — không thể thay đổi"))
        : [React.createElement("button", { key: "d", className: "btn", onClick: () => save("Chờ xác nhận") }, "Lưu nháp"),
           React.createElement("button", { key: "s", className: "btn primary", onClick: () => save("Đã xác nhận") }, React.createElement(Icon, { name: "check", size: 15 }), "Xác nhận đơn")]
    )
  );
}

function SalesModule() {
  const st = useStore();
  const [q, setQ] = React.useState("");
  const [fStatus, setFStatus] = React.useState("all");
  const [fChannel, setFChannel] = React.useState("all");
  const [drawer, setDrawer] = React.useState({ open: false, editing: null });

  const custName = (id) => { const c = st.customers.find((x) => x.id === id); return c ? c.name : id; };
  const rows = st.orders.filter((o) => {
    const hay = (o.id + " " + custName(o.customerId)).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    if (fStatus !== "all" && o.status !== fStatus) return false;
    if (fChannel !== "all" && o.channel !== fChannel) return false;
    return true;
  });

  const todays = st.orders.filter((o) => o.date === TODAY && o.status !== "Huỷ");
  const revenueToday = todays.reduce((s, o) => s + orderTotals(o.items, o.discount, o.ship).total, 0);
  const processing = st.orders.filter((o) => ["Chờ xác nhận", "Đã xác nhận", "Đang giao"].includes(o.status)).length;
  const delivered = st.orders.filter((o) => o.status === "Đã giao").length;

  const summary = (o) => { const first = o.items[0]; const u = allUnits(st).find((x) => x.code === (first && first.code)); const name = u ? u.productName : "—"; return o.items.length > 1 ? name + " +" + (o.items.length - 1) : name; };

  return React.createElement("div", { className: "content-inner", "data-screen-label": "Bán hàng" },
    React.createElement("div", { className: "stats" },
      React.createElement(Stat, { label: "Tổng đơn hôm nay", value: todays.length, sub: dvn(TODAY), icon: "cart", accent: "blue" }),
      React.createElement(Stat, { label: "Doanh thu hôm nay", value: vnd(revenueToday), sub: todays.length + " đơn hợp lệ", icon: "money", accent: "green" }),
      React.createElement(Stat, { label: "Đang xử lý", value: processing, sub: "Chờ XN · đã XN · đang giao", icon: "clock", accent: "amber" }),
      React.createElement(Stat, { label: "Đã giao thành công", value: delivered, sub: "Tổng tích luỹ", icon: "checkCircle", accent: "green" })),

    React.createElement("div", { className: "toolbar" },
      React.createElement("div", { className: "search" },
        React.createElement("span", { className: "si" }, React.createElement(Icon, { name: "search", size: 15 })),
        React.createElement("input", { placeholder: "Tìm mã đơn / tên khách...", value: q, onChange: (e) => setQ(e.target.value) })),
      React.createElement("select", { className: "input", style: { width: 150 }, value: fStatus, onChange: (e) => setFStatus(e.target.value) },
        React.createElement("option", { value: "all" }, "Mọi trạng thái"), ORDER_FLOW.map((s) => React.createElement("option", { key: s, value: s }, s))),
      React.createElement("select", { className: "input", style: { width: 130 }, value: fChannel, onChange: (e) => setFChannel(e.target.value) },
        React.createElement("option", { value: "all" }, "Mọi kênh"), CHANNELS.map((s) => React.createElement("option", { key: s, value: s }, s))),
      React.createElement("button", { className: "btn", title: "Khoảng ngày" }, React.createElement(Icon, { name: "calendar", size: 15 }), "Tháng 6/2026"),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", { className: "btn primary", onClick: () => setDrawer({ open: true, editing: null }) },
        React.createElement(Icon, { name: "plus", size: 16 }), "Tạo đơn hàng")),

    React.createElement("div", { className: "panel" }, React.createElement("div", { className: "tbl-wrap" },
      React.createElement("table", { className: "tbl" },
        React.createElement("thead", null, React.createElement("tr", null,
          React.createElement("th", null, "Mã đơn"), React.createElement("th", null, "Ngày"), React.createElement("th", null, "Khách hàng"),
          React.createElement("th", null, "Kênh"), React.createElement("th", null, "Sản phẩm"), React.createElement("th", { className: "num" }, "Tổng tiền"),
          React.createElement("th", null, "Thanh toán"), React.createElement("th", null, "Trạng thái"), React.createElement("th", { style: { width: 90 } }, "Thao tác"))),
        React.createElement("tbody", null,
          rows.length === 0
            ? React.createElement("tr", null, React.createElement("td", { colSpan: 9 }, React.createElement(Empty, { icon: "cart", title: "Không có đơn hàng" })))
            : rows.map((o) => {
                const total = orderTotals(o.items, o.discount, o.ship).total;
                return React.createElement("tr", { className: "row", key: o.id, style: { cursor: "pointer" }, onClick: () => setDrawer({ open: true, editing: o }) },
                  React.createElement("td", null, React.createElement("button", { className: "linkish" }, o.id)),
                  React.createElement("td", { className: "nowrap muted" }, dvn(o.date)),
                  React.createElement("td", { className: "strong" }, custName(o.customerId)),
                  React.createElement("td", null, React.createElement(Badge, { kind: channelKind(o.channel) }, o.channel)),
                  React.createElement("td", { className: "muted", style: { maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, summary(o)),
                  React.createElement("td", { className: "num strong" }, vnd(total)),
                  React.createElement("td", { className: "nowrap" }, React.createElement("span", { className: "chip" }, o.payMethod)),
                  React.createElement("td", null, React.createElement(StatusBadge, { status: o.status })),
                  React.createElement("td", null, React.createElement("div", { className: "row-actions" },
                    React.createElement("button", { className: "act", title: "Xem", onClick: (e) => { e.stopPropagation(); setDrawer({ open: true, editing: o }); } }, React.createElement(Icon, { name: "eye", size: 15 })))));
              }))
      )
    )),
    React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--text-3)" } }, "Hiển thị ", rows.length, " / ", st.orders.length, " đơn hàng"),
    React.createElement(OrderDrawer, { open: drawer.open, editing: drawer.editing, onClose: () => setDrawer({ open: false, editing: null }) })
  );
}

Object.assign(window, { SalesModule, CHANNELS, PAY_METHODS, CARRIERS });
