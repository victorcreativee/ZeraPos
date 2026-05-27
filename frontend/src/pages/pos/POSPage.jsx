import { useEffect, useState } from "react";
import {
  getCategories,
  getProducts,
  getTables,
  getTableActiveBill,
} from "../../api/posApi";
import { createOrder, printCombinedTableBill } from "../../api/ordersApi";
import AppHeader from "../../components/layout/AppHeader";
import CategoryTabs from "../../components/pos/CategoryTabs";
import ProductGrid from "../../components/pos/ProductGrid";
import TableSelector from "../../components/pos/TableSelector";
import ActiveTablePanel from "../../components/pos/ActiveTablePanel";
import WaiterSummaryBar from "../../components/pos/WaiterSummaryBar";
import { getAuthUser } from "../../utils/authSession";
import { printReceiptWindow } from "../../utils/printReceipt";
import { buildCombinedCustomerBill } from "../../utils/receiptTemplates";

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
  const [savingOrder, setSavingOrder] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [todaySales] = useState(221000);
  const [tablesServed] = useState(5);

  function openPreviousOrders() {
    window.location.href = "/orders";
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

      setSuccessMessage(
        `${createdOrder.order_number} sent for ${
          selectedTable?.name || "Takeaway"
        }.`
      );

      await loadPOSData(selectedCategory);

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
            todaySales={221000}
            tablesServed={5}
            openOrders={7}
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
    </div>
  );
}

export default POSPage;
