import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import {
  getOrders,
  printCustomerBill,
  printOrderTicket,
  cancelOrder,
} from "../../api/ordersApi";

import { printReceiptWindow } from "../../utils/printReceipt";

import {
  buildCustomerBill,
  buildPreparationTicket,
} from "../../utils/receiptTemplates";

function OpenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

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

      const title = ticketType === "kitchen" ? "Kitchen Ticket" : "Bar Ticket";
      printReceiptWindow(title, html);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print ticket");
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePrintBill(orderId) {
    try {
      setProcessingId(orderId);
      setError("");

      const response = await printCustomerBill(orderId);
      const html = buildCustomerBill(response.data);

      printReceiptWindow("Customer Bill", html);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print bill");
    } finally {
      setProcessingId(null);
    }
  }

  // async function handlePayment(order) {
  //   try {
  //     setProcessingId(order.id);
  //     setError("");

  //     const method = window.prompt(
  //       "Enter payment method:\nCash\nMTN Mobile Money\nAirtel Money\nCard",
  //       "Cash"
  //     );

  //     if (!method) return;

  //     const response = await payOrder(order.id, {
  //       amount: order.total,
  //       method,
  //     });

  //     const html = buildPaidReceipt(response.data, method);
  //     printReceiptWindow("Paid Receipt", html);

  //     await loadOrders();
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Payment failed");
  //   } finally {
  //     setProcessingId(null);
  //   }
  // }

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

  function getStatusStyle(status) {
    if (status === "sent") {
      return "bg-blue-500/10 text-blue-300 border-blue-500/30";
    }

    if (status === "bill_printed") {
      return "bg-yellow-500/10 text-yellow-300 border-yellow-500/30";
    }

    return "bg-slate-500/10 text-slate-300 border-slate-500/30";
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="Open Orders"
        subtitle="Manage active orders, tickets, bills, payment, and cancellations"
        showBackToDashboard={true}
      />

      <main className="p-6 max-w-7xl mx-auto">
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
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {order.table_name || "Takeaway"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {order.order_number}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full border text-xs uppercase ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {order.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                  <p className="text-xs text-slate-400">
                    Flow: send order → print kitchen/bar ticket → print customer
                    bill → send customer to counter for payment.
                  </p>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Server</span>
                    <span>{order.server_name || "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="capitalize">{order.order_type}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Created</span>
                    <span>{order.created_at}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Subtotal</span>
                    <span>
                      UGX {Number(order.subtotal || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount</span>
                    <span>
                      UGX {Number(order.discount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-5 pt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Total</p>
                      <h3 className="text-2xl font-black text-green-400">
                        UGX {Number(order.total || 0).toLocaleString()}
                      </h3>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      disabled={processingId === order.id}
                      onClick={() =>
                        handlePrintPreparationTicket(order.id, "kitchen")
                      }
                      className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Kitchen Ticket
                    </button>

                    <button
                      disabled={processingId === order.id}
                      onClick={() =>
                        handlePrintPreparationTicket(order.id, "bar")
                      }
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Bar Ticket
                    </button>

                    <button
                      disabled={processingId === order.id}
                      onClick={() => handlePrintBill(order.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Customer Bill
                    </button>

                    <Link
                      to="/counter"
                      className="bg-green-600 hover:bg-green-700 px-3 py-3 rounded-xl font-semibold text-sm text-center"
                    >
                      Send to Counter
                    </Link>

                    <button
                      disabled={processingId === order.id}
                      onClick={() => handleCancelOrder(order)}
                      className="col-span-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 disabled:opacity-50 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Cancel / Void Order
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-full bg-[#111827] border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
                No open orders found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OpenOrdersPage;
