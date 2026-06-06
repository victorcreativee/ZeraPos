import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import {
  createCategory,
  createProduct,
  createTable,
  getCategories,
  getProducts,
  getTables,
} from "../api/posApi";

const modules = [
  { key: "tables", label: "Tables", title: "Tables & Areas" },
  { key: "menu", label: "Menu", title: "Menu Setup" },
  { key: "backup", label: "Backup", title: "Backup & Sync" },
];

function SystemAdminSetupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeModule = searchParams.get("module") || "tables";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categoryForm, setCategoryForm] = useState({ name: "", type: "food" });
  const [tableForm, setTableForm] = useState({ name: "" });

  const [productForm, setProductForm] = useState({
    name: "",
    category_id: "",
    price: "",
    cost_price: "",
    item_type: "food",
    send_to: "kitchen",
    track_stock: false,
    stock_quantity: "",
    low_stock_level: "",
  });

  const activeTitle = useMemo(() => {
    return modules.find((item) => item.key === activeModule)?.title || "Setup";
  }, [activeModule]);

  async function loadSetupData() {
    const [categoryResponse, productResponse, tableResponse] =
      await Promise.all([getCategories(), getProducts(), getTables()]);

    setCategories(categoryResponse.data || []);
    setProducts(productResponse.data || []);
    setTables(tableResponse.data || []);
  }

  useEffect(() => {
    loadSetupData();
  }, []);

  function showSuccess(text) {
    setMessage(text);
    setError("");
    setTimeout(() => setMessage(""), 3000);
  }

  function showError(err, fallback) {
    setError(err.response?.data?.message || fallback);
    setMessage("");
  }

  async function handleCreateCategory(e) {
    e.preventDefault();

    try {
      await createCategory(categoryForm);
      setCategoryForm({ name: "", type: "food" });
      await loadSetupData();
      showSuccess("Category created successfully");
    } catch (err) {
      showError(err, "Failed to create category");
    }
  }

  async function handleCreateProduct(e) {
    e.preventDefault();

    try {
      await createProduct({
        ...productForm,
        price: Number(productForm.price),
        cost_price: Number(productForm.cost_price || 0),
        stock_quantity: Number(productForm.stock_quantity || 0),
        low_stock_level: Number(productForm.low_stock_level || 0),
        track_stock: productForm.track_stock ? 1 : 0,
      });

      setProductForm({
        name: "",
        category_id: "",
        price: "",
        cost_price: "",
        item_type: "food",
        send_to: "kitchen",
        track_stock: false,
        stock_quantity: "",
        low_stock_level: "",
      });

      await loadSetupData();
      showSuccess("Product created successfully");
    } catch (err) {
      showError(err, "Failed to create product");
    }
  }

  async function handleCreateTable(e) {
    e.preventDefault();

    try {
      await createTable(tableForm);
      setTableForm({ name: "" });
      await loadSetupData();
      showSuccess("Table created successfully");
    } catch (err) {
      showError(err, "Failed to create table");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="System Admin Setup"
        subtitle={activeTitle}
        showBackToDashboard
      />

      <main className="mx-auto max-w-[1500px] p-5 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link to="/admin" className="text-sm font-black text-slate-500">
            ← Back to System Admin
          </Link>

          <div className="flex gap-2">
            {modules.map((item) => (
              <button
                key={item.key}
                onClick={() => setSearchParams({ module: item.key })}
                className={`px-4 py-2 text-sm font-black ${
                  activeModule === item.key
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {(message || error) && (
          <div
            className={`border px-5 py-4 text-sm font-black ${
              message
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {message || error}
          </div>
        )}

        <section className="border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase text-slate-400">
            Current Module
          </p>
          <h1 className="mt-2 text-3xl font-black">{activeTitle}</h1>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Practical setup for daily restaurant operations.
          </p>
        </section>

        {activeModule === "tables" && (
          <TablesModule
            tables={tables}
            tableForm={tableForm}
            setTableForm={setTableForm}
            onCreateTable={handleCreateTable}
            onRefresh={loadSetupData}
          />
        )}

        {activeModule === "menu" && (
          <MenuModule
            categories={categories}
            products={products}
            categoryForm={categoryForm}
            setCategoryForm={setCategoryForm}
            productForm={productForm}
            setProductForm={setProductForm}
            onCreateCategory={handleCreateCategory}
            onCreateProduct={handleCreateProduct}
          />
        )}

        {activeModule === "backup" && <BackupModule />}
      </main>
    </div>
  );
}

function TablesModule({
  tables,
  tableForm,
  setTableForm,
  onCreateTable,
  onRefresh,
}) {
  return (
    <div className="grid xl:grid-cols-[380px_1fr] gap-5">
      <Panel
        title="Create Table / Area"
        subtitle="Dining tables, VIP rooms, bar counter"
      >
        <form onSubmit={onCreateTable} className="space-y-4">
          <Input
            label="Table or Area Name"
            value={tableForm.name}
            onChange={(value) => setTableForm({ name: value })}
            placeholder="Example: Table 01, VIP 1, Bar Counter"
            required
          />

          <SubmitButton label="Create Table" />
        </form>

        <div className="mt-5 border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-black text-slate-950">Naming Tip</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            Use clear names like Table 01, VIP Table 1, Bar Counter, Terrace 1,
            or Takeaway.
          </p>
        </div>
      </Panel>

      <Panel
        title="Existing Tables"
        subtitle={`${tables.length} configured`}
        action={
          <button
            onClick={onRefresh}
            className="border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        }
      >
        {tables.length === 0 ? (
          <div className="border border-slate-200 bg-slate-50 p-8 text-center text-sm font-black text-slate-400">
            No tables created yet.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
            {tables.map((table) => {
              const meta = getTableMeta(table.name);

              return (
                <div
                  key={table.id}
                  className="border border-slate-200 bg-white p-4 shadow-sm hover:bg-slate-50 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {table.name}
                      </h3>

                      <p className="mt-4 text-sm font-semibold text-slate-500">
                        <span className="mr-2">{meta.icon}</span>
                        {meta.label}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 text-[10px] font-black uppercase ${
                        table.status === "available"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {table.status || "available"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

function MenuModule({
  categories,
  products,
  categoryForm,
  setCategoryForm,
  productForm,
  setProductForm,
  onCreateCategory,
  onCreateProduct,
}) {
  return (
    <div className="space-y-5">
      <div className="grid xl:grid-cols-[380px_1fr] gap-5">
        <Panel title="Create Category" subtitle="Food, drinks, beers, spirits">
          <form onSubmit={onCreateCategory} className="space-y-4">
            <Input
              label="Category Name"
              value={categoryForm.name}
              onChange={(value) =>
                setCategoryForm((prev) => ({ ...prev, name: value }))
              }
              placeholder="Example: Soft Drinks"
              required
            />

            <Select
              label="Type"
              value={categoryForm.type}
              onChange={(value) =>
                setCategoryForm((prev) => ({ ...prev, type: value }))
              }
              options={[
                { value: "food", label: "Food" },
                { value: "drink", label: "Drink" },
                { value: "general", label: "General" },
              ]}
            />

            <SubmitButton label="Create Category" />
          </form>
        </Panel>

        <Panel
          title="Create Product"
          subtitle="Menu item, drink, or stock item"
        >
          <form
            onSubmit={onCreateProduct}
            className="grid md:grid-cols-2 gap-4"
          >
            <Input
              label="Product Name"
              value={productForm.name}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, name: value }))
              }
              placeholder="Example: Nile Special"
              required
            />

            <Select
              label="Category"
              value={productForm.category_id}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, category_id: value }))
              }
              options={[
                { value: "", label: "No category" },
                ...categories.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                })),
              ]}
            />

            <Input
              label="Selling Price"
              type="number"
              value={productForm.price}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, price: value }))
              }
              required
            />

            <Input
              label="Cost Price"
              type="number"
              value={productForm.cost_price}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, cost_price: value }))
              }
            />

            <Select
              label="Item Type"
              value={productForm.item_type}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, item_type: value }))
              }
              options={[
                { value: "food", label: "Food" },
                { value: "drink", label: "Drink" },
                { value: "general", label: "General" },
              ]}
            />

            <Select
              label="Send To"
              value={productForm.send_to}
              onChange={(value) =>
                setProductForm((prev) => ({ ...prev, send_to: value }))
              }
              options={[
                { value: "kitchen", label: "Kitchen Screen" },
                { value: "bar", label: "Bar Screen" },
                { value: "none", label: "No production screen" },
              ]}
            />

            <label className="md:col-span-2 flex items-center justify-between border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-black text-slate-950">Track Stock</p>
                <p className="text-xs font-semibold text-slate-500">
                  Use this for drinks or inventory items that need quantity
                  control.
                </p>
              </div>

              <input
                type="checkbox"
                checked={productForm.track_stock}
                onChange={(e) =>
                  setProductForm((prev) => ({
                    ...prev,
                    track_stock: e.target.checked,
                  }))
                }
              />
            </label>

            {productForm.track_stock && (
              <>
                <Input
                  label="Stock Qty"
                  type="number"
                  value={productForm.stock_quantity}
                  onChange={(value) =>
                    setProductForm((prev) => ({
                      ...prev,
                      stock_quantity: value,
                    }))
                  }
                />

                <Input
                  label="Low Stock Level"
                  type="number"
                  value={productForm.low_stock_level}
                  onChange={(value) =>
                    setProductForm((prev) => ({
                      ...prev,
                      low_stock_level: value,
                    }))
                  }
                />
              </>
            )}

            <div className="md:col-span-2">
              <SubmitButton label="Create Product" />
            </div>
          </form>
        </Panel>
      </div>

      <Panel
        title="Current Menu"
        subtitle={`${products.length} products configured`}
      >
        <div className="divide-y divide-slate-100 border border-slate-200">
          {products.map((product) => (
            <div
              key={product.id}
              className="grid gap-3 px-4 py-3 md:grid-cols-[1fr_140px_140px_120px] md:items-center"
            >
              <div>
                <p className="font-black text-slate-950">{product.name}</p>
                <p className="text-sm font-semibold text-slate-500">
                  {product.category_name || product.item_type}
                </p>
              </div>

              <span className="font-black text-emerald-600">
                {Number(product.price).toLocaleString()}
              </span>

              <span className="text-sm font-black text-slate-700">
                {product.send_to || "none"}
              </span>

              <span className="w-fit bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-600">
                {product.item_type}
              </span>
            </div>
          ))}

          {products.length === 0 && (
            <div className="p-8 text-center text-sm font-black text-slate-400">
              No products created yet.
            </div>
          )}
        </div>
      </Panel>
    </div>
  );
}

function BackupModule() {
  return (
    <Panel title="Backup & Sync" subtitle="Protect local business data">
      <div className="grid md:grid-cols-3 gap-3">
        <InfoCard
          title="Local SQLite"
          value="Primary"
          text="The desktop database remains the source of truth for offline operations."
        />
        <InfoCard
          title="Manual Backup"
          value="Next"
          text="We will add a safe backup button that copies the SQLite database file."
        />
        <InfoCard
          title="Cloud Sync"
          value="Later"
          text="Optional cloud sync can be added for multi-device or premium packages."
        />
      </div>
    </Panel>
  );
}

function Panel({ title, subtitle, action, children }) {
  return (
    <section className="border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {subtitle}
          </p>
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
}) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm font-black text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-12 w-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none focus:border-slate-500"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SubmitButton({ label }) {
  return (
    <button className="h-12 w-full bg-slate-950 px-4 text-sm font-black text-white hover:bg-slate-800">
      {label}
    </button>
  );
}

function InfoCard({ title, value, text }) {
  return (
    <div className="border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{title}</p>
      <h3 className="mt-2 text-xl font-black text-slate-950">{value}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}
function getTableMeta(name = "") {
  const lowerName = name.toLowerCase();

  if (lowerName.includes("vip")) {
    return { icon: "♛", label: "VIP Room" };
  }

  if (lowerName.includes("bar")) {
    return { icon: "🍷", label: "Bar Counter" };
  }

  if (lowerName.includes("terrace")) {
    return { icon: "☂", label: "Terrace" };
  }

  if (lowerName.includes("takeaway")) {
    return { icon: "▣", label: "Takeaway" };
  }

  return { icon: "▥", label: "Dining Table" };
}
export default SystemAdminSetupPage;
