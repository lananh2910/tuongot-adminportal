// ===================== APP SHELL =====================
const MODULES = [
  { key: "products", label: "Hàng hoá", icon: "box" },
  { key: "sales", label: "Bán hàng", icon: "cart" },
  { key: "purchasing", label: "Nhập hàng", icon: "truck" },
  { key: "inventory", label: "Kho hàng", icon: "warehouse" },
];

function Placeholder({ name }) {
  return React.createElement("div", { className: "content-inner" },
    React.createElement(Empty, { icon: "layers", title: "Module \"" + name + "\" đang được dựng…", sub: "Sẽ sẵn sàng ngay sau khi bạn duyệt module Hàng hoá." }));
}

function Sidebar({ active, setActive }) {
  const st = useStore();
  const counts = {
    products: st.products.length,
    sales: st.orders.filter((o) => ["Chờ xác nhận", "Đã xác nhận", "Đang giao"].includes(o.status)).length,
    purchasing: st.purchases.filter((p) => p.status === "Chờ duyệt").length,
    inventory: allUnits(st).filter((u) => stockStatus(u) !== "ok").length,
  };
  return React.createElement("aside", { className: "sidebar" },
    React.createElement("div", { className: "brand" },
      React.createElement("div", { className: "brand-mark" }, "MK"),
      React.createElement("div", null,
        React.createElement("div", { className: "brand-name" }, "HTX Tương ớt"),
        React.createElement("div", { className: "brand-sub" }, "Mường Khương · Lào Cai"))),
    React.createElement("nav", { className: "nav" },
      React.createElement("div", { className: "nav-label" }, "Quản lý bán hàng"),
      MODULES.map((m) =>
        React.createElement("button", { key: m.key, className: "nav-item " + (active === m.key ? "active" : ""), onClick: () => setActive(m.key) },
          React.createElement("span", { className: "nav-icon" }, React.createElement(Icon, { name: m.icon, size: 17 })),
          React.createElement("span", null, m.label),
          counts[m.key] ? React.createElement("span", { className: "nav-count" }, counts[m.key]) : null))),
    React.createElement("div", { className: "sidebar-foot" },
      React.createElement("div", { className: "avatar" }, "HL"),
      React.createElement("div", null,
        React.createElement("div", { className: "who" }, st.currentUser),
        React.createElement("div", { className: "role" }, "Quản lý kho")))
  );
}

const TITLES = {
  products: ["Quản lý hàng hoá", "Danh mục sản phẩm & biến thể"],
  sales: ["Quản lý bán hàng", "Đơn hàng & doanh thu"],
  purchasing: ["Quản lý nhập hàng", "Phiếu nhập & nhà cung cấp"],
  inventory: ["Quản lý kho hàng", "Tồn kho & lịch sử xuất nhập"],
};

function App() {
  const [active, setActive] = React.useState("products");
  const [t1, t2] = TITLES[active];
  const M = {
    products: window.ProductsModule,
    sales: window.SalesModule,
    purchasing: window.PurchasingModule,
    inventory: window.InventoryModule,
  }[active];

  return React.createElement("div", { className: "app" },
    React.createElement(Sidebar, { active, setActive }),
    React.createElement("div", { className: "main" },
      React.createElement("div", { className: "topbar" },
        React.createElement("div", null,
          React.createElement("h1", null, t1),
          React.createElement("div", { className: "crumb" }, t2)),
        React.createElement("div", { className: "topbar-spacer" }),
        React.createElement("div", { className: "topbar-tools" },
          React.createElement("span", { className: "kbd" }, TODAY.split("-").reverse().join("/")),
          React.createElement("button", { className: "icon-btn", title: "Thông báo" }, React.createElement(Icon, { name: "bell", size: 17 })))),
      React.createElement("div", { className: "content" },
        M ? React.createElement(M) : React.createElement(Placeholder, { name: TITLES[active][0] }))
    ),
    React.createElement(ToastHost)
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
