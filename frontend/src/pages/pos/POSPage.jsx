import { useEffect, useState } from "react";
import {
  getCategories,
  getProducts,
  getTables,
  getTableActiveBill,
} from "../../api/posApi";
import {
  createOrder,
  printCombinedTableBill,
  printOrderTicket,
} from "../../api/ordersApi";
import AppHeader from "../../components/layout/AppHeader";
import CategoryTabs from "../../components/pos/CategoryTabs";
import ProductGrid from "../../components/pos/ProductGrid";
import TableSelector from "../../components/pos/TableSelector";
import ActiveTablePanel from "../../components/pos/ActiveTablePanel";
import WaiterSummaryBar from "../../components/pos/WaiterSummaryBar";
import { getAuthUser } from "../../utils/authSession";
import { printReceiptWindow } from "../../utils/printReceipt";
import {
  buildCombinedCustomerBill,
  buildPreparationTicket,
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
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [printedKitchenTicket, setPrintedKitchenTicket] = useState(false);
  const [printedBarTicket, setPrintedBarTicket] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [waiterStats, setWaiterStats] = useState({
    my_sales_today: 0,
    my_tables_served_today: 0,
    my_open_orders: 0,
  });

  function openPreviousOrders() {
    window.location.href = "/orders";
  }

  async function loadWaiterStats() {
    try {
      const response = await getMyDashboardStats();
      setWaiterStats(response.data || {});
    } catch (err) {
      console.log("Failed to load waiter stats", err);
    }
  }
  async function loadPOSData(categoryId = selectedCategory) {
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
      setError(
        err.response?.data?.message || err.message || "Failed to load POS data"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTableBill(tableId) {
    if (!tableId) {
      setActiveTableBill(null);
      return;
    }

    const response = await getTableActiveBill(tableId);
    setActiveTableBill(response.data || null);
  }

  useEffect(() => {
    loadPOSData(null);
    loadWaiterStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectTable(table) {
    setSelectedTable(table);
    setError("");

    try {
      await loadTableBill(table?.id);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load table bill"
      );
    }
  }

  async function handleSelectCategory(categoryId) {
    setSelectedCategory(categoryId);
    await loadPOSData(categoryId);
  }

  function handleAddToCart(product) {
    setCartItems((previousItems) => {
      const existingItem = previousItems.find((item) => item.id === product.id);

      if (existingItem) {
        return previousItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...previousItems,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price || 0),
          quantity: 1,
          send_to: product.send_to || "none",
          track_stock: product.track_stock,
        },
      ];
    });
  }

  function handleIncrease(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  }

  function handleDecrease(id) {
    setCartItems((previousItems) =>
      previousItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  }

  function handleRemove(id) {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  }

  function handleClear() {
    setCartItems([]);
  }
  async function printPreparationTickets(orderId, ticketTarget = "both") {
    const response = await printOrderTicket(orderId, "preparation_ticket");
    const order = response.data;

    if (ticketTarget === "kitchen" || ticketTarget === "both") {
      const kitchenTicket = buildPreparationTicket(order, "kitchen");

      if (kitchenTicket) {
        printReceiptWindow(
          `${order.order_number} Kitchen Ticket`,
          kitchenTicket
        );
      }
    }

    if (ticketTarget === "bar" || ticketTarget === "both") {
      const barTicket = buildPreparationTicket(order, "bar");

      if (barTicket) {
        printReceiptWindow(`${order.order_number} Bar Ticket`, barTicket);
      }
    }
  }
  async function handleSaveOrder() {
    if (cartItems.length === 0) return;

    try {
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
      const createdOrder = response.data;

      setCartItems([]);

      setLastCreatedOrder(createdOrder);
      setShowTicketModal(true);
      setPrintedKitchenTicket(false);
      setPrintedBarTicket(false);

      setSuccessMessage(
        `${createdOrder.order_number} sent for ${
          selectedTable?.name || "Takeaway"
        }.`
      );

      await loadPOSData(selectedCategory);
      await loadWaiterStats();

      if (selectedTable?.id) {
        await loadTableBill(selectedTable.id);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to send order"
      );
    } finally {
      setSavingOrder(false);
    }
  }

  async function handlePrintCombinedBill() {
    if (!selectedTable?.id) return;

    try {
      setError("");
      setSuccessMessage("");

      const response = await printCombinedTableBill(selectedTable.id);
      const bill = response.data;
      const html = buildCombinedCustomerBill(bill);

      printReceiptWindow(`${selectedTable.name} Customer Bill`, html);

      setSuccessMessage(
        `Combined bill printed for ${selectedTable.name}. Total: UGX ${Number(
          bill.total || 0
        ).toLocaleString()}`
      );

      await loadPOSData(selectedCategory);
      await loadWaiterStats();
      await loadTableBill(selectedTable.id);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to print combined bill"
      );
    }
  }

  return (
    <div className="h-screen bg-slate-100 text-slate-950 overflow-hidden">
      <AppHeader
        title="Waiter POS"
        subtitle="Select a table, add items, send order, print one combined bill"
        showBackToDashboard={true}
      />

      <main className="h-[calc(100vh-78px)] p-3 grid xl:grid-cols-[minmax(0,1fr)_430px] gap-3 overflow-hidden">
        <section className="min-h-0 flex flex-col gap-3 overflow-hidden">
          <WaiterSummaryBar
            todaySales={waiterStats.my_sales_today || 0}
            tablesServed={waiterStats.my_tables_served_today || 0}
            openOrders={waiterStats.my_open_orders || 0}
            onOpenPreviousOrders={openPreviousOrders}
          />

          <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm">
            <TableSelector
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={handleSelectTable}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <CategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </div>

          <div className="min-h-0 flex-1 rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm overflow-hidden">
            {loading ? (
              <div className="h-full flex items-center justify-center font-bold text-slate-500">
                Loading POS...
              </div>
            ) : (
              <ProductGrid products={products} onAddToCart={handleAddToCart} />
            )}
          </div>
        </section>

        <section className="min-h-0">
          <ActiveTablePanel
            selectedTable={selectedTable}
            activeTableBill={activeTableBill}
            cartItems={cartItems}
            onIncrease={handleIncrease}
            onDecrease={handleDecrease}
            onRemove={handleRemove}
            onClear={handleClear}
            onSaveOrder={handleSaveOrder}
            onPrintBill={handlePrintCombinedBill}
            savingOrder={savingOrder}
          />
        </section>
      </main>
      {showTicketModal && lastCreatedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-xl overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <p className="text-xs uppercase font-black text-slate-400">
                Order Sent
              </p>

              <h2 className="text-2xl font-black text-slate-950 mt-1">
                {lastCreatedOrder.order_number}
              </h2>

              <p className="text-sm font-semibold text-slate-500 mt-1">
                Print kitchen or bar preparation tickets if this business uses
                paper tickets.
              </p>

              <div className="mt-3 flex gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    printedKitchenTicket
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Kitchen {printedKitchenTicket ? "printed ✓" : "not printed"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    printedBarTicket
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  Bar {printedBarTicket ? "printed ✓" : "not printed"}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={async () => {
                  await printPreparationTickets(lastCreatedOrder.id, "kitchen");
                  setPrintedKitchenTicket(true);
                }}
                className="w-full h-12 rounded-2xl bg-slate-950 text-white font-black"
              >
                Print Kitchen Ticket
              </button>

              <button
                onClick={async () => {
                  await printPreparationTickets(lastCreatedOrder.id, "bar");
                  setPrintedBarTicket(true);
                }}
                className="w-full h-12 rounded-2xl bg-slate-950 text-white font-black"
              >
                Print Bar Ticket
              </button>

              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setLastCreatedOrder(null);
                }}
                className="w-full h-12 rounded-2xl bg-slate-950 text-white font-black"
              >
                Done
              </button>

              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setLastCreatedOrder(null);
                }}
                className="w-full h-12 rounded-2xl bg-slate-100 text-slate-800 font-black"
              >
                Skip Printing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default POSPage;
