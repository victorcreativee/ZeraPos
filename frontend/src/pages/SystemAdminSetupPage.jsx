import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import {
  createCategory,
  createProduct,
  createTable,
  getCategories,
  getProducts,
  getTables,
} from "../api/posApi";
import { Link } from "react-router-dom";

function SystemAdminSetupPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    type: "food",
  });

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

  const [tableForm, setTableForm] = useState({
    name: "",
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Restaurant Setup Center</h1>
            <p className="text-slate-400 mt-1">
              Configure the basic information needed to run the POS daily.
            </p>
          </div>

          <Link
            to="/admin"
            className="bg-[#111827] border border-slate-800 hover:border-purple-500 rounded-2xl px-5 py-3 font-bold"
          >
            Back to Admin
          </Link>
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-2xl px-5 py-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        <section className="grid lg:grid-cols-4 gap-5">
          <SetupCard title="Categories" value={categories.length} />
          <SetupCard title="Products" value={products.length} />
          <SetupCard title="Tables" value={tables.length} />
          <SetupCard title="Mode" value="Offline First" />
        </section>

        <section className="grid xl:grid-cols-3 gap-6">
          <Panel
            title="Create Category"
            subtitle="Food, drinks, beers, spirits"
          >
            <form onSubmit={handleCreateCategory} className="space-y-4">
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

          <Panel title="Create Product" subtitle="Menu item or stock item">
            <form onSubmit={handleCreateProduct} className="space-y-4">
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
                <span className="text-sm text-slate-300">Track stock</span>
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

          <Panel title="Create Table" subtitle="Dining area, bar counter, VIP">
            <form onSubmit={handleCreateTable} className="space-y-4">
              <Input
                label="Table Name"
                value={tableForm.name}
                onChange={(value) => setTableForm({ name: value })}
                placeholder="Example: Table 01"
                required
              />

              <SubmitButton label="Create Table" />
            </form>

            <div className="mt-6">
              <h3 className="font-black mb-3">Existing Tables</h3>
              <div className="grid grid-cols-2 gap-3">
                {tables.map((table) => (
                  <div
                    key={table.id}
                    className="bg-[#0D1117] border border-slate-800 rounded-2xl p-3"
                  >
                    <p className="font-bold">{table.name}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {table.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </section>

        <section className="grid lg:grid-cols-2 gap-6">
          <Panel
            title="Restaurant Profile & Design"
            subtitle="MVP placeholder before database settings"
          >
            <div className="space-y-3 text-slate-300">
              <InfoLine label="Business Name" value="Demo Bar & Restaurant" />
              <InfoLine label="Currency" value="UGX" />
              <InfoLine label="Theme" value="Dark POS Mode" />
              <InfoLine label="Receipt" value="Thermal receipt ready" />
            </div>

            <p className="text-sm text-slate-500 mt-5">
              Next phase: save these settings in SQLite so each client can
              customize logo, receipt footer, TIN, tax, and theme color.
            </p>
          </Panel>

          <Panel title="Quick Admin Actions" subtitle="Common setup shortcuts">
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                to="/users"
                className="bg-purple-600 hover:bg-purple-700 rounded-2xl p-4 font-black text-center"
              >
                Manage Staff
              </Link>

              <Link
                to="/manager"
                className="bg-[#0D1117] border border-slate-700 hover:border-purple-500 rounded-2xl p-4 font-black text-center"
              >
                Manager Dashboard
              </Link>

              <Link
                to="/counter"
                className="bg-[#0D1117] border border-slate-700 hover:border-green-500 rounded-2xl p-4 font-black text-center"
              >
                Cashier Counter
              </Link>

              <Link
                to="/pos"
                className="bg-[#0D1117] border border-slate-700 hover:border-blue-500 rounded-2xl p-4 font-black text-center"
              >
                POS Screen
              </Link>
            </div>
          </Panel>
        </section>
      </main>
    </div>
  );
}

function SetupCard({ title, value }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
      <p className="text-slate-400">{title}</p>
      <h2 className="text-3xl font-black mt-2">{value}</h2>
    </div>
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
          <option key={option.value} value={option.value}>
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

function InfoLine({ label, value }) {
  return (
    <div className="flex justify-between border-b border-slate-800 pb-2">
      <span className="text-slate-500">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

export default SystemAdminSetupPage;
