import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategories,
  getProducts,
  getTables,
  getTableActiveBill,
} from "../../api/posApi";
import CategoryTabs from "../../components/pos/CategoryTabs";
import ProductGrid from "../../components/pos/ProductGrid";
import CartPanel from "../../components/pos/CartPanel";
import TableSelector from "../../components/pos/TableSelector";
import {
  createOrder,
  printOrderTicket,
  printCustomerBill,
  printCombinedTableBill,
} from "../../api/ordersApi";
import AppHeader from "../../components/layout/AppHeader";
import { getAuthUser } from "../../utils/authSession";
import { printReceiptWindow } from "../../utils/printReceipt";
import {
  buildPreparationTicket,
  buildCombinedCustomerBill,
} from "../../utils/receiptTemplates";
import { getMyDashboardStats } from "../../api/reportsApi";

function POSPage() {
  const user = getAuthUser();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTableBill, setActiveTableBill] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [lastSentOrder, setLastSentOrder] = useState(null);
  const [waiterStats, setWaiterStats] = useState({
    my_sales_today: 0,
    my_open_orders: 0,
    my_tables_served_today: 0,
  });

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
  async function loadWaiterStats() {
    try {
      const response = await getMyDashboardStats();
      setWaiterStats(response.data || {});
    } catch (err) {
      console.log("Failed to load waiter stats", err);
    }
  }

  useEffect(() => {
    loadPOSData();
    loadWaiterStats();
  }, []);

  async function handleSelectTable(table) {
    setSelectedTable(table);
    setActiveTableBill(null);

    if (!table) return;

    try {
      const response = await getTableActiveBill(table.id);
      setActiveTableBill(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load table bill");
    }
  }
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
  async function handlePrintCombinedBill() {
    if (!selectedTable) return;

    try {
      setError("");

      const response = await printCombinedTableBill(selectedTable.id);
      const bill = response.data;

      const html = buildCombinedCustomerBill(bill);

      printReceiptWindow(`${selectedTable.name} Customer Bill`, html);

      setSuccessMessage(
        `Customer bill printed for ${selectedTable.name}. Total: UGX ${Number(
          bill.total || 0
        ).toLocaleString()}`
      );

      const billResponse = await getTableActiveBill(selectedTable.id);
      setActiveTableBill(billResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print customer bill");
    }
  }
  async function handlePrintSingleBill(order) {
    try {
      setError("");

      await printCustomerBill(order.id);

      setSuccessMessage(
        `${order.order_number} customer bill generated separately.`
      );

      const billResponse = await getTableActiveBill(selectedTable.id);
      setActiveTableBill(billResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print separate bill");
    }
  }
  async function handlePrintLastOrderTicket(ticketType) {
    if (!lastSentOrder?.id) return;

    try {
      setError("");

      const response = await printOrderTicket(
        lastSentOrder.id,
        ticketType === "kitchen" ? "kitchen_ticket" : "bar_ticket"
      );

      const html = buildPreparationTicket(response.data, ticketType);

      if (!html) {
        setError(
          ticketType === "kitchen"
            ? "This order has no kitchen items."
            : "This order has no bar items."
        );
        return;
      }

      printReceiptWindow(
        ticketType === "kitchen" ? "Kitchen Ticket" : "Bar Ticket",
        html
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print ticket");
    }
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
        id: response.id,
        order_number: response.order_number,
        total: response.total,
        table_name: selectedTable?.name || "Takeaway",
      });

      setSuccessMessage(
        `${response.order_number} saved for ${
          selectedTable?.name || "Takeaway"
        }.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);

      setCartItems([]);

      await loadWaiterStats();
      if (selectedTable) {
        const billResponse = await getTableActiveBill(selectedTable.id);
        setActiveTableBill(billResponse.data);
      }
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
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <MiniStat
                label="Sales Today"
                value={`UGX ${Number(
                  waiterStats.my_sales_today || 0
                ).toLocaleString()}`}
              />

              <MiniStat
                label="Open Orders"
                value={waiterStats.my_open_orders || 0}
              />

              <MiniStat
                label="Tables Served"
                value={waiterStats.my_tables_served_today || 0}
              />
            </div>
            <TableSelector
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={handleSelectTable}
            />
            {selectedTable && activeTableBill?.orders?.length > 0 && (
              <div className="mt-2 bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] text-slate-500 uppercase font-bold">
                    Active Bill
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mt-1">
                    <span className="text-sm font-black">
                      {selectedTable.name}
                    </span>

                    {activeTableBill.orders.map((order) => (
                      <span
                        key={order.id}
                        className="text-[11px] px-2 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        {order.order_number} · UGX{" "}
                        {Number(
                          order.balance || order.total || 0
                        ).toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-500">Total</p>
                  <p className="text-base font-black text-green-400">
                    UGX {Number(activeTableBill.total || 0).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={handlePrintCombinedBill}
                  className="shrink-0 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-black"
                >
                  Print Bill
                </button>

                <Link
                  to="/orders/open"
                  className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-black"
                >
                  Orders
                </Link>
              </div>
            )}
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
                  <p className="font-black text-lg">Order Saved</p>
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

                <div className="flex flex-col sm:flex-row gap-2">
                  <Link
                    to="/orders/open"
                    className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap text-center"
                  >
                    View Orders
                  </Link>
                </div>
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
function MiniStat({ label, value }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-2xl px-4 py-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="text-lg font-black text-white mt-1">{value}</p>
    </div>
  );
}
export default POSPage;
