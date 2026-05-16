import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, getProducts, getTables } from "../../api/posApi";
import CategoryTabs from "../../components/pos/CategoryTabs";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import TableSelector from "../../components/pos/TableSelector";
import { createOrder } from "../../api/ordersApi";
import AppHeader from "../../components/layout/AppHeader";
import { getAuthUser } from "../../utils/authSession";

function POSPage() {
  const user = getAuthUser();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [lastSentOrder, setLastSentOrder] = useState(null);

  async function loadPOSData(categoryId = null) {
    try {
      setLoading(true);
      setError("");

      const [categoriesResponse, productsResponse, tablesResponse] =
        await Promise.all([
          getCategories(),
          getProducts(categoryId),
          getTables(),
        ]);

      setCategories(categoriesResponse.data || []);
      setProducts(productsResponse.data || []);
      setTables(tablesResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load POS data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPOSData();
  }, []);

  async function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId);
    await loadPOSData(categoryId);
  }

  function handleAddToCart(product) {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          send_to: product.send_to,
        },
      ];
    });
  }

  function handleIncrease(id) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function handleDecrease(id) {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  }

  function handleRemove(id) {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }

  function handleClear() {
    setCartItems([]);
  }
  async function handleSaveOrder() {
    try {
      if (cartItems.length === 0) {
        return;
      }

      setSavingOrder(true);
      setError("");
      setSuccessMessage("");

      const orderData = {
        table_id: selectedTable?.id || null,
        server_id: user.id,
        order_type: selectedTable ? "table" : "takeaway",
        items: cartItems,
      };

      const response = await createOrder(orderData);
      setLastSentOrder({
        order_number: response.order_number,
        total: response.total,
        table_name: selectedTable?.name || "Takeaway",
      });

      setSuccessMessage(
        `${response.order_number} has been sent to counter. Customer should pay cashier only.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setCartItems([]);

      await loadPOSData(selectedCategory);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save order");
    } finally {
      setSavingOrder(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="POS Terminal"
        subtitle="Create orders, print tickets, and manage tables"
        showBackToDashboard={true}
      />

      <main className="p-5 grid xl:grid-cols-[1fr_420px] gap-5 h-[calc(100vh-81px)]">
        <section className="overflow-y-auto pr-1">
          <div className="mb-4">
            <TableSelector
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={setSelectedTable}
            />
          </div>

          <div className="mb-5">
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-5">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-500/10 border border-green-500 text-green-300 px-5 py-4 rounded-2xl mb-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-black text-lg">Order Sent to Counter</p>
                  <p className="text-sm mt-1">{successMessage}</p>

                  {lastSentOrder && (
                    <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-green-200/70">Order</p>
                        <p className="font-black">
                          {lastSentOrder.order_number}
                        </p>
                      </div>

                      <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-green-200/70">Table</p>
                        <p className="font-black">{lastSentOrder.table_name}</p>
                      </div>

                      <div className="bg-black/20 rounded-xl p-3">
                        <p className="text-green-200/70">Amount</p>
                        <p className="font-black">
                          UGX{" "}
                          {Number(lastSentOrder.total || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap"
                >
                  View Proof
                </Link>
              </div>
            </div>
          )}

          {loading ? (
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
              Loading POS data...
            </div>
          ) : (
            <ProductGrid products={products} onAddToCart={handleAddToCart} />
          )}
        </section>

        <aside className="min-h-0">
          <CartPanel
            cartItems={cartItems}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            onClear={handleClear}
            onSaveOrder={handleSaveOrder}
            savingOrder={savingOrder}
          />
        </aside>
      </main>
    </div>
  );
}

export default POSPage;
