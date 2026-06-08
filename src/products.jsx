// ===================== MODULE: HÀNG HOÁ =====================
const CATEGORIES = ["Tương ớt", "Gạo", "Combo", "Khác"];

function ProductDrawer({ open, onClose, editing }) {
  const blank = () => ({ id: nextProductId(), name: "", category: "Tương ớt", desc: "", active: true, variants: [], combo: null });
  const [form, setForm] = React.useState(blank);
  const [idEdited, setIdEdited] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      if (editing) setForm(JSON.parse(JSON.stringify(editing)));
      else { setForm(blank()); setIdEdited(false); }
    }
  }, [open, editing]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const variants = form.variants || [];

  const addVariant = () => {
    const n = variants.length + 1;
    set({ variants: [...variants, { code: `${form.id}-V${n}`, name: "", unit: "Hũ", retail: 0, wholesale: 0, stock: 0, min: 0, max: 0, lastImport: TODAY }] });
  };
  const setVariant = (i, patch) => { const v = variants.slice(); v[i] = { ...v[i], ...patch }; set({ variants: v }); };
  const rmVariant = (i) => set({ variants: variants.filter((_, j) => j !== i) });

  const save = (publish) => {
    if (!form.name.trim()) { toast("Vui lòng nhập tên sản phẩm", "info"); return; }
    const prod = { ...form, active: publish ? true : form.active };
    saveProduct(prod, !editing);
    toast(editing ? "Đã cập nhật sản phẩm " + prod.id : (publish ? "Đã xuất bản " + prod.id : "Đã lưu nháp " + prod.id));
    onClose();
  };

  return React.createElement(Drawer, { open, onClose, width: 480 },
    React.createElement("div", { className: "drawer-head" },
      React.createElement("div", null,
        React.createElement("h2", null, editing ? "Sửa sản phẩm" : "Thêm sản phẩm"),
        React.createElement("div", { className: "dh-sub" }, editing ? form.id : "Tạo sản phẩm mới cho danh mục HTX")),
      React.createElement("button", { className: "x-btn", onClick: onClose }, React.createElement(Icon, { name: "x" }))
    ),
    React.createElement("div", { className: "drawer-body" },
      React.createElement("div", { className: "grid-2" },
        React.createElement(Field, { label: "Mã SP", hint: idEdited ? null : "Tự sinh — có thể sửa" },
          React.createElement("input", { className: "input", value: form.id, onChange: (e) => { setIdEdited(true); set({ id: e.target.value }); } })),
        React.createElement(Field, { label: "Danh mục", required: true },
          React.createElement("select", { className: "input", value: form.category, onChange: (e) => set({ category: e.target.value }) },
            CATEGORIES.map((c) => React.createElement("option", { key: c, value: c }, c))))
      ),
      React.createElement(Field, { label: "Tên sản phẩm", required: true },
        React.createElement("input", { className: "input", placeholder: "VD: Tương ớt Mường Khương", value: form.name, onChange: (e) => set({ name: e.target.value }) })),
      React.createElement(Field, { label: "Mô tả ngắn" },
        React.createElement("textarea", { className: "input", rows: 2, placeholder: "Mô tả đặc điểm sản phẩm...", value: form.desc, onChange: (e) => set({ desc: e.target.value }) })),

      React.createElement("div", { className: "section-head" },
        React.createElement("div", null,
          React.createElement("h3", null, "Biến thể / Sản phẩm con"),
          React.createElement("div", { className: "sh-sub" }, variants.length ? variants.length + " biến thể" : "Để trống nếu SP không có biến thể")),
        React.createElement("button", { className: "btn sm", type: "button", onClick: addVariant },
          React.createElement(Icon, { name: "plus", size: 14 }), "Thêm biến thể")),

      React.createElement("div", { className: "vb" },
        variants.length === 0
          ? React.createElement("div", { className: "vb-empty" }, "Chưa có biến thể. Nhấn ", React.createElement("b", null, "+ Thêm biến thể"), " để thêm.")
          : React.createElement("table", null,
              React.createElement("thead", null, React.createElement("tr", null,
                React.createElement("th", { style: { width: "20%" } }, "Mã con"),
                React.createElement("th", null, "Tên biến thể"),
                React.createElement("th", { style: { width: 64 } }, "ĐVT"),
                React.createElement("th", { style: { width: 78 } }, "Giá lẻ"),
                React.createElement("th", { style: { width: 78 } }, "Giá sỉ"),
                React.createElement("th", { style: { width: 56 } }, "Tồn"),
                React.createElement("th", { style: { width: 34 } }))),
              React.createElement("tbody", null, variants.map((v, i) =>
                React.createElement("tr", { key: i },
                  React.createElement("td", null, React.createElement("input", { className: "input sm", value: v.code, onChange: (e) => setVariant(i, { code: e.target.value }) })),
                  React.createElement("td", null, React.createElement("input", { className: "input sm", placeholder: "Hũ 250g", value: v.name, onChange: (e) => setVariant(i, { name: e.target.value }) })),
                  React.createElement("td", null, React.createElement("input", { className: "input sm", value: v.unit, onChange: (e) => setVariant(i, { unit: e.target.value }) })),
                  React.createElement("td", null, React.createElement(MoneyInput, { value: v.retail, onChange: (val) => setVariant(i, { retail: val }) })),
                  React.createElement("td", null, React.createElement(MoneyInput, { value: v.wholesale, onChange: (val) => setVariant(i, { wholesale: val }) })),
                  React.createElement("td", null, React.createElement("input", { className: "input sm num", value: v.stock, onChange: (e) => setVariant(i, { stock: parseInt(e.target.value.replace(/\D/g, "")) || 0 }) })),
                  React.createElement("td", null, React.createElement("button", { className: "rm-btn", type: "button", onClick: () => rmVariant(i) }, React.createElement(Icon, { name: "x", size: 14 })))
                )))
            )
      ),

      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Ảnh sản phẩm")),
      React.createElement("label", { className: "upload" },
        React.createElement(Icon, { name: "upload", size: 20 }),
        React.createElement("div", { className: "ut" }, "Kéo thả hoặc bấm để tải ảnh"),
        React.createElement("div", { className: "us" }, "PNG, JPG tối đa 2MB"),
        React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: () => toast("Đã chọn ảnh (demo)", "info") })),

      React.createElement("div", { className: "section-head" }, React.createElement("h3", null, "Trạng thái bán")),
      React.createElement(Toggle, { on: form.active, onChange: (v) => set({ active: v }), labelOn: "Đang bán", labelOff: "Ngừng bán" })
    ),
    React.createElement("div", { className: "drawer-foot" },
      React.createElement("button", { className: "btn ghost", onClick: onClose }, "Huỷ"),
      React.createElement("div", { className: "spacer" }),
      React.createElement("button", { className: "btn", onClick: () => save(false) }, "Lưu nháp"),
      React.createElement("button", { className: "btn primary", onClick: () => save(true) },
        React.createElement(Icon, { name: "check", size: 15 }), editing ? "Lưu thay đổi" : "Lưu & Xuất bản")
    )
  );
}

function SubRow({ product }) {
  const us = unitsOf(product);
  return React.createElement("tr", { className: "sub-row" },
    React.createElement("td", { colSpan: 9 },
      us.length === 0
        ? React.createElement("div", { style: { padding: "10px 0", color: "var(--text-3)", fontSize: 12 } }, "Sản phẩm này không có biến thể.")
        : React.createElement("table", { className: "sub-table" },
            React.createElement("thead", null, React.createElement("tr", null,
              ["Mã SP con", "Tên biến thể", "ĐVT", "Giá lẻ", "Giá sỉ", "Tồn", "Trạng thái"].map((h, i) =>
                React.createElement("th", { key: i, className: i >= 3 && i <= 5 ? "num" : "" }, h)))),
            React.createElement("tbody", null, us.map((u) =>
              React.createElement("tr", { key: u.code },
                React.createElement("td", null, React.createElement("span", { className: "code" }, u.code)),
                React.createElement("td", { className: "strong" }, u.variantName),
                React.createElement("td", null, u.unit),
                React.createElement("td", { className: "num" }, vnd(u.retail)),
                React.createElement("td", { className: "num muted" }, vnd(u.wholesale)),
                React.createElement("td", { className: "num strong" }, u.stock),
                React.createElement("td", null, React.createElement(StockBadge, { status: stockStatus(u) }))
              )))
          )
    )
  );
}

function ProductsModule() {
  const st = useStore();
  const [q, setQ] = React.useState("");
  const [filter, setFilter] = React.useState("all"); // all | ok | out
  const [expanded, setExpanded] = React.useState({});
  const [drawer, setDrawer] = React.useState({ open: false, editing: null });

  const rows = st.products.filter((p) => {
    const hay = (p.id + " " + p.name + " " + p.category).toLowerCase();
    if (q && !hay.includes(q.toLowerCase())) return false;
    const status = productStatus(p);
    if (filter === "ok" && status === "out") return false;
    if (filter === "out" && status !== "out") return false;
    return true;
  });

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return React.createElement("div", { className: "content-inner", "data-screen-label": "Hàng hoá" },
    React.createElement("div", { className: "help-banner" },
      React.createElement("span", { className: "hb-ic" }, React.createElement(Icon, { name: "info", size: 16 })),
      React.createElement("div", null, React.createElement("b", null, "Mẹo: "), "Bấm mũi tên ở đầu mỗi hàng để xem các biến thể (SP con). Tồn kho ở đây được đồng bộ realtime với module Kho hàng, Nhập hàng và Bán hàng.")),

    React.createElement("div", { className: "toolbar" },
      React.createElement("div", { className: "search" },
        React.createElement("span", { className: "si" }, React.createElement(Icon, { name: "search", size: 15 })),
        React.createElement("input", { placeholder: "Tìm theo mã, tên, danh mục...", value: q, onChange: (e) => setQ(e.target.value) })),
      React.createElement("div", { className: "segmented" },
        [["all", "Tất cả"], ["ok", "Còn hàng"], ["out", "Hết hàng"]].map(([k, l]) =>
          React.createElement("button", { key: k, className: filter === k ? "on" : "", onClick: () => setFilter(k) }, l))),
      React.createElement("div", { style: { flex: 1 } }),
      React.createElement("button", { className: "btn primary", onClick: () => setDrawer({ open: true, editing: null }) },
        React.createElement(Icon, { name: "plus", size: 16 }), "Thêm sản phẩm")
    ),

    React.createElement("div", { className: "panel" },
      React.createElement("div", { className: "tbl-wrap" },
        React.createElement("table", { className: "tbl" },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", { style: { width: 34 } }),
            React.createElement("th", null, "Mã SP"),
            React.createElement("th", null, "Tên sản phẩm"),
            React.createElement("th", null, "Danh mục"),
            React.createElement("th", { className: "center" }, "Số SP con"),
            React.createElement("th", { className: "num" }, "Giá bán lẻ"),
            React.createElement("th", { className: "num" }, "Giá sỉ"),
            React.createElement("th", { className: "num" }, "Tồn kho"),
            React.createElement("th", null, "Trạng thái"),
            React.createElement("th", { style: { width: 110 } }, "Thao tác"))),
          React.createElement("tbody", null,
            rows.length === 0
              ? React.createElement("tr", null, React.createElement("td", { colSpan: 10 }, React.createElement(Empty, { title: "Không có sản phẩm", sub: "Thử đổi bộ lọc hoặc thêm sản phẩm mới" })))
              : rows.flatMap((p) => {
                  const isOpen = !!expanded[p.id];
                  const main = React.createElement("tr", { className: "row", key: p.id, onClick: () => toggle(p.id), style: { cursor: "pointer", opacity: p.active ? 1 : 0.55 } },
                    React.createElement("td", null, React.createElement("button", { className: "expand-btn " + (isOpen ? "open" : ""), onClick: (e) => { e.stopPropagation(); toggle(p.id); } }, React.createElement(Icon, { name: "chevR", size: 14 }))),
                    React.createElement("td", null, React.createElement("span", { className: "code" }, p.id)),
                    React.createElement("td", null,
                      React.createElement("div", { className: "strong" }, p.name),
                      !p.active && React.createElement("span", { className: "muted", style: { fontSize: 11 } }, "Ngừng bán")),
                    React.createElement("td", null, React.createElement("span", { className: "chip" }, React.createElement(Icon, { name: "tag", size: 11 }), p.category)),
                    React.createElement("td", { className: "center" }, (p.variants && p.variants.length) ? p.variants.length : React.createElement("span", { className: "muted" }, "—")),
                    React.createElement("td", { className: "num" }, priceRange(p, "retail") || "—"),
                    React.createElement("td", { className: "num muted" }, priceRange(p, "wholesale") || "—"),
                    React.createElement("td", { className: "num strong" }, productStock(p)),
                    React.createElement("td", null, React.createElement(StockBadge, { status: productStatus(p) })),
                    React.createElement("td", null, React.createElement("div", { className: "row-actions" },
                      React.createElement("button", { className: "act", title: "Sửa", onClick: (e) => { e.stopPropagation(); setDrawer({ open: true, editing: p }); } }, React.createElement(Icon, { name: "edit", size: 15 })),
                      React.createElement("button", { className: "act", title: "Xem biến thể", onClick: (e) => { e.stopPropagation(); toggle(p.id); } }, React.createElement(Icon, { name: "eye", size: 15 })),
                      React.createElement(ActionMenu, { items: [
                        { label: p.active ? "Ẩn (ngừng bán)" : "Hiện (đang bán)", icon: p.active ? "eyeOff" : "eye", onClick: () => { toggleProductActive(p.id); toast(p.active ? "Đã ẩn " + p.id : "Đã hiện " + p.id, "info"); } },
                        { sep: true },
                        { label: "Xoá sản phẩm", icon: "trash", danger: true, onClick: () => { if (confirm("Xoá sản phẩm " + p.id + "?")) { deleteProduct(p.id); toast("Đã xoá " + p.id); } } },
                      ] })))
                  );
                  return isOpen ? [main, React.createElement(SubRow, { product: p, key: p.id + "-sub" })] : [main];
                })
          )
        )
      )
    ),
    React.createElement("div", { style: { marginTop: 12, fontSize: 12, color: "var(--text-3)" } }, "Hiển thị ", rows.length, " / ", st.products.length, " sản phẩm"),

    React.createElement(ProductDrawer, { open: drawer.open, editing: drawer.editing, onClose: () => setDrawer({ open: false, editing: null }) })
  );
}

Object.assign(window, { ProductsModule, CATEGORIES });
