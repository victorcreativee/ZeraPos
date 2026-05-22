import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import {
  getOrders,
  printCombinedTableBill,
  printOrderTicket,
  cancelOrder,
} from "../../api/ordersApi";
import { printReceiptWindow } from "../../utils/printReceipt";
import {
  buildCombinedCustomerBill,
  buildPreparationTicket,
} from "../../utils/receiptTemplates";

function OpenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders();

      const openOrders = (response.data || []).filter(
        (order) => order.status !== "paid" && order.status !== "cancelled"
      );

      setOrders(openOrders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load open orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handlePrintPreparationTicket(orderId, ticketType) {
    try {
      setProcessingId(orderId);
      setError("");

      const response = await printOrderTicket(
        orderId,
        ticketType === "kitchen" ? "kitchen_ticket" : "bar_ticket"
      );

      const order = response.data;
      const html = buildPreparationTicket(order, ticketType);

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

      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print ticket");
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePrintBill(tableGroup) {
    try {
      setProcessingId(tableGroup.table_id || tableGroup.orders[0]?.id);
      setError("");

      if (!tableGroup.table_id) {
        setError("Takeaway combined bill is not supported yet.");
        return;
      }

      const response = await printCombinedTableBill(tableGroup.table_id);
      const html = buildCombinedCustomerBill(response.data);

      printReceiptWindow(`${tableGroup.table_name} Customer Bill`, html);

      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print customer bill");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleCancelOrder(order) {
    try {
      setProcessingId(order.id);
      setError("");

      const reason = window.prompt(
        `Why are you cancelling ${order.order_number}?`
      );

      if (!reason) return;

      await cancelOrder(order.id, reason);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setProcessingId(null);
    }
  }

  const filteredOrders = orders.filter((order) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return true;

    return (
      order.order_number?.toLowerCase().includes(keyword) ||
      order.table_name?.toLowerCase().includes(keyword) ||
      order.server_name?.toLowerCase().includes(keyword) ||
      order.status?.toLowerCase().includes(keyword)
    );
  });

  const groupedTables = Object.values(
    filteredOrders.reduce((acc, order) => {
      const key = order.table_id || `takeaway-${order.id}`;

      if (!acc[key]) {
        acc[key] = {
          table_id: order.table_id,
          table_name: order.table_name || "Takeaway",
          orders: [],
          total: 0,
        };
      }

      acc[key].orders.push(order);
      acc[key].total += Number(order.balance || order.total || 0);

      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="Open Orders"
        subtitle="Tables are grouped so customer bills are easier to manage"
        showBackToDashboard={true}
      />

      <main className="p-6 max-w-7xl mx-auto">
        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Open Orders"
            value={orders.length}
            accent="text-yellow-300"
          />

          <SummaryCard
            title="Bills Printed"
            value={
              orders.filter((order) => order.status === "bill_printed").length
            }
            accent="text-blue-300"
          />

          <SummaryCard
            title="Tables Occupied"
            value={
              new Set(
                orders
                  .filter((order) => order.table_name)
                  .map((order) => order.table_name)
              ).size
            }
            accent="text-purple-300"
          />

          <SummaryCard
            title="Open Balance"
            value={`UGX ${orders
              .reduce(
                (sum, order) => sum + Number(order.balance || order.total || 0),
                0
              )
              .toLocaleString()}`}
            accent="text-green-300"
          />
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
            Loading open orders...
          </div>
        ) : (
          <section>
            <div className="mb-4">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search table, order number, waiter, or status..."
                className="w-full bg-[#111827] border border-slate-800 focus:border-purple-500 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-5 max-h-[68vh] overflow-y-auto pr-1">
              {groupedTables.map((tableGroup) => (
                <div
                  key={tableGroup.table_id || tableGroup.table_name}
                  className="bg-[#111827] border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col min-h-[360px]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-lg font-black truncate">
                        {tableGroup.table_name}
                      </h2>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {tableGroup.orders.map((order) => (
                          <span
                            key={order.id}
                            className="text-[11px] px-2 py-1 rounded-full bg-[#0D1117] border border-slate-700 text-slate-300"
                          >
                            {order.order_number} · UGX{" "}
                            {Number(
                              order.balance || order.total || 0
                            ).toLocaleString()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full border text-[11px] uppercase font-black bg-yellow-500/10 text-yellow-300 border-yellow-500/30">
                      {tableGroup.orders.length} order
                      {tableGroup.orders.length > 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="mt-4 bg-[#0D1117] border border-slate-800 rounded-2xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">
                        Customer Bill Total
                      </span>
                      <span className="font-black text-green-400">
                        UGX {tableGroup.total.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-400">Orders Included</span>
                      <span>{tableGroup.orders.length}</span>
                    </div>
                  </div>

                  <div className="mt-4 grid md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                    {tableGroup.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-[#0D1117] border border-slate-800 rounded-2xl p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-black text-sm">
                              {order.order_number}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.server_name || "-"} •{" "}
                              {order.status?.replace("_", " ")}
                            </p>
                          </div>

                          <p className="font-black text-sm">
                            UGX{" "}
                            {Number(
                              order.balance || order.total || 0
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            disabled={processingId === order.id}
                            onClick={() =>
                              handlePrintPreparationTicket(order.id, "kitchen")
                            }
                            className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 px-3 py-2 rounded-xl font-black text-xs"
                          >
                            Kitchen
                          </button>

                          <button
                            disabled={processingId === order.id}
                            onClick={() =>
                              handlePrintPreparationTicket(order.id, "bar")
                            }
                            className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 px-3 py-2 rounded-xl font-black text-xs"
                          >
                            Bar
                          </button>

                          <button
                            disabled={processingId === order.id}
                            onClick={() => handleCancelOrder(order)}
                            className="col-span-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 disabled:opacity-50 px-3 py-2 rounded-xl font-black text-xs"
                          >
                            Cancel / Void {order.order_number}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={processingId === tableGroup.orders[0]?.id}
                    onClick={() => handlePrintBill(tableGroup)}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black disabled:opacity-50 px-3 py-3 rounded-xl font-black text-sm"
                  >
                    Print Customer Bill
                  </button>
                </div>
              ))}

              {groupedTables.length === 0 && (
                <div className="col-span-full bg-[#111827] border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
                  No open orders found.
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function SummaryCard({ title, value, accent = "text-white" }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className={`text-3xl font-black mt-3 ${accent}`}>{value}</h2>
    </div>
  );
}

export default OpenOrdersPage;
