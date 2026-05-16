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
  { key: "profile", label: "Profile", title: "Restaurant / Bar Profile" },
  { key: "branches", label: "Branches", title: "Branches" },
  { key: "tables", label: "Tables", title: "Tables & Areas" },
  { key: "menu", label: "Menu", title: "Menu Setup" },
  { key: "payments", label: "Payments", title: "Payment Settings" },
  { key: "receipts", label: "Receipts", title: "Receipt Settings" },
  { key: "backup", label: "Backup", title: "Backup & Sync" },
];

function SystemAdminSetupPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeModule = searchParams.get("module") || "profile";

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
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader title="System Admin Setup" showBackToDashboard />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Link
              to="/admin"
              className="text-sm text-slate-400 hover:text-white"
            >
              ← Back to System Admin
            </Link>

            <h1 className="text-3xl font-black mt-3">{activeTitle}</h1>
            <p className="text-slate-400 mt-1">
              Configure this section in a simple, practical way for daily
              restaurant operations.
            </p>
          </div>
        </div>

        {(message || error) && (
          <div
            className={`rounded-2xl px-5 py-4 border ${
              message
                ? "bg-green-500/10 border-green-500/30 text-green-300"
                : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}
          >
            {message || error}
          </div>
        )}

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-[#111827] border border-slate-800 rounded-3xl p-4 h-fit">
            <p className="text-xs uppercase tracking-wide text-slate-500 px-3 mb-3">
              Setup Modules
            </p>

            <div className="space-y-2">
              {modules.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setSearchParams({ module: item.key })}
                  className={`w-full text-left px-4 py-3 rounded-2xl font-bold transition ${
                    activeModule === item.key
                      ? "bg-purple-600 text-white"
                      : "text-slate-300 hover:bg-[#0D1117]"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <Link
                to="/users"
                className="block px-4 py-3 rounded-2xl font-bold text-slate-300 hover:bg-[#0D1117]"
              >
                Users & Roles
              </Link>
            </div>
          </aside>

          <section>
            {activeModule === "profile" && <ProfileModule />}
            {activeModule === "branches" && <BranchesModule />}
            {activeModule === "tables" && (
              <TablesModule
                tables={tables}
                tableForm={tableForm}
                setTableForm={setTableForm}
                onCreateTable={handleCreateTable}
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
            {activeModule === "payments" && <PaymentsModule />}
            {activeModule === "receipts" && <ReceiptsModule />}
            {activeModule === "backup" && <BackupModule />}
          </section>
        </div>
      </main>
    </div>
  );
}

function ProfileModule() {
  return (
    <div className="grid xl:grid-cols-2 gap-6">
      <Panel
        title="Business Identity"
        subtitle="What appears on receipts and reports"
      >
        <div className="space-y-4">
          <Input
            label="Business Name"
            value="Zera Restaurant"
            onChange={() => {}}
          />
          <Input
            label="Business Type"
            value="Restaurant & Bar"
            onChange={() => {}}
          />
          <Input
            label="Phone Number"
            value="+256 700 000 000"
            onChange={() => {}}
          />
          <Input label="Address" value="Kampala, Uganda" onChange={() => {}} />
          <Input label="TIN / Tax Number" value="" onChange={() => {}} />
          <Select
            label="Currency"
            value="UGX"
            onChange={() => {}}
            options={[
              { value: "UGX", label: "UGX" },
              { value: "RWF", label: "RWF" },
              { value: "KES", label: "KES" },
            ]}
          />
        </div>
      </Panel>

      <Panel title="Design Preview" subtitle="Simple, clear, readable branding">
        <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-6">
          <p className="text-slate-400 text-sm">Receipt Header Preview</p>
          <h2 className="text-2xl font-black mt-3">Zera Restaurant</h2>
          <p className="text-slate-400">Kampala, Uganda</p>
          <p className="text-slate-400">+256 700 000 000</p>
          <div className="border-t border-dashed border-slate-700 my-5" />
          <p className="text-sm text-slate-300">
            These fields will be saved to SQLite in the next backend settings
            step.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function BranchesModule() {
  return (
    <Panel
      title="Branches"
      subtitle="Keep one main branch first, add more later"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <InfoCard
          title="Main Branch"
          value="Active"
          text="This desktop device is connected to the main local SQLite database."
        />
        <InfoCard
          title="Multi-Branch"
          value="Later"
          text="Cloud sync will handle multiple branches after the local desktop system is stable."
        />
      </div>
    </Panel>
  );
}

function TablesModule({ tables, tableForm, setTableForm, onCreateTable }) {
  return (
    <div className="grid xl:grid-cols-[420px_1fr] gap-6">
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
      </Panel>

      <Panel title="Existing Tables" subtitle={`${tables.length} configured`}>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
            >
              <p className="font-black">{table.name}</p>
              <p className="text-xs text-slate-500 capitalize mt-1">
                {table.status}
              </p>
            </div>
          ))}
        </div>
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
    <div className="space-y-6">
      <div className="grid xl:grid-cols-2 gap-6">
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
          <form onSubmit={onCreateProduct} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  { value: "kitchen", label: "Kitchen" },
                  { value: "bar", label: "Bar" },
                  { value: "none", label: "None" },
                ]}
              />
            </div>

            <label className="flex items-center gap-3 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3">
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
              <span className="text-sm text-slate-300">
                Track stock for this item
              </span>
            </label>

            {productForm.track_stock && (
              <div className="grid grid-cols-2 gap-3">
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
              </div>
            )}

            <SubmitButton label="Create Product" />
          </form>
        </Panel>
      </div>

      <Panel
        title="Current Menu"
        subtitle={`${products.length} products configured`}
      >
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
            >
              <div className="flex justify-between gap-3">
                <p className="font-black">{product.name}</p>
                <p className="text-green-400 font-black">
                  {Number(product.price).toLocaleString()}
                </p>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {product.category_name || product.item_type} • {product.send_to}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function PaymentsModule() {
  return (
    <Panel title="Payment Settings" subtitle="Control accepted payment methods">
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <InfoCard
          title="Cash"
          value="Enabled"
          text="Cashier can receive cash payments."
        />
        <InfoCard
          title="Mobile Money"
          value="Enabled"
          text="Manual MTN/Airtel reference entry."
        />
        <InfoCard
          title="Card"
          value="Enabled"
          text="Manual card transaction reference."
        />
        <InfoCard
          title="Split Payment"
          value="Coming"
          text="Will be added after single-payment flow is complete."
        />
      </div>
    </Panel>
  );
}

function ReceiptsModule() {
  return (
    <Panel
      title="Receipt Settings"
      subtitle="Prepare receipt structure for thermal printing"
    >
      <div className="grid xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Receipt Footer"
            value="Thank you for choosing us"
            onChange={() => {}}
          />
          <Input label="Tax Label" value="TIN" onChange={() => {}} />
          <Select
            label="Receipt Width"
            value="80mm"
            onChange={() => {}}
            options={[
              { value: "58mm", label: "58mm" },
              { value: "80mm", label: "80mm" },
            ]}
          />
        </div>

        <div className="bg-white text-black rounded-3xl p-6 font-mono text-sm">
          <h3 className="font-black text-center">ZERA RESTAURANT</h3>
          <p className="text-center">Kampala, Uganda</p>
          <div className="border-t border-black my-3" />
          <p>Receipt #: DEMO-001</p>
          <p>Cashier: Admin</p>
          <div className="border-t border-black my-3" />
          <div className="flex justify-between">
            <span>Nile Special x2</span>
            <span>10,000</span>
          </div>
          <div className="border-t border-black my-3" />
          <div className="flex justify-between font-black">
            <span>TOTAL</span>
            <span>UGX 10,000</span>
          </div>
          <p className="text-center mt-5">Thank you for choosing us</p>
        </div>
      </div>
    </Panel>
  );
}

function BackupModule() {
  return (
    <Panel title="Backup & Sync" subtitle="Protect local business data">
      <div className="grid md:grid-cols-3 gap-4">
        <InfoCard
          title="Local SQLite"
          value="Primary"
          text="The desktop database remains the source of truth."
        />
        <InfoCard
          title="Manual Backup"
          value="Needed"
          text="Next: add a button to copy the SQLite file safely."
        />
        <InfoCard
          title="Cloud Sync"
          value="Later"
          text="Sync will be optional for paying cloud customers."
        />
      </div>
    </Panel>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
      <h2 className="text-xl font-black">{title}</h2>
      <p className="text-slate-400 text-sm mt-1 mb-5">{subtitle}</p>
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
      <span className="text-sm text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-purple-500"
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
    <button className="w-full bg-purple-600 hover:bg-purple-700 rounded-2xl py-4 font-black">
      {label}
    </button>
  );
}

function InfoCard({ title, value, text }) {
  return (
    <div className="bg-[#0D1117] border border-slate-800 rounded-3xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <h3 className="text-xl font-black mt-2">{value}</h3>
      <p className="text-slate-500 text-sm mt-3 leading-6">{text}</p>
    </div>
  );
}

export default SystemAdminSetupPage;
