import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import {
  getOrders,
  printCustomerBill,
  printOrderTicket,
  payOrder,
} from "../../api/ordersApi";

import { printReceiptWindow } from "../../utils/printReceipt";

import {
  buildCustomerBill,
  buildPreparationTicket,
  buildPaidReceipt,
} from "../../utils/receiptTemplates";

function OpenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setError("");

      const response = await printOrderTicket(orderId);
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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print ticket");
    }
  }

  async function handlePrintBill(orderId) {
    try {
      const response = await printCustomerBill(orderId);
      const html = buildCustomerBill(response.data);
      printReceiptWindow("Customer Bill", html);
      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print bill");
    }
  }
  async function handlePayment(order) {
    try {
      const method = window.prompt(
        "Enter payment method:\nCash\nMTN MoMo\nAirtel Money\nCard",
        "Cash"
      );

      if (!method) {
        return;
      }

      const response = await payOrder(order.id, {
        order_id: order.id,
        amount: order.total,
        method,
      });

      const html = buildPaidReceipt(response.data, method);

      printReceiptWindow("Paid Receipt", html);

      await loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="Open Orders"
        subtitle="Print tickets, bills, and close payments"
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
                className="bg-[#111827] border border-slate-800 rounded-3xl p-6"
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

                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 text-xs uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="mt-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-3">
                  <p className="text-xs text-slate-400">
                    Print kitchen ticket for food, bar ticket for drinks, then
                    print customer bill when the client is ready to pay.
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
                </div>

                <div className="border-t border-slate-800 mt-5 pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total</p>
                    <h3 className="text-2xl font-black text-green-400">
                      UGX {Number(order.total).toLocaleString()}
                    </h3>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handlePrintPreparationTicket(order.id, "kitchen")
                      }
                      className="bg-orange-600 hover:bg-orange-700 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Kitchen Ticket
                    </button>

                    <button
                      onClick={() =>
                        handlePrintPreparationTicket(order.id, "bar")
                      }
                      className="bg-purple-600 hover:bg-purple-700 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Bar Ticket
                    </button>

                    <button
                      onClick={() => handlePrintBill(order.id)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Customer Bill
                    </button>

                    <button
                      onClick={() => handlePayment(order)}
                      className="bg-green-600 hover:bg-green-700 px-3 py-3 rounded-xl font-semibold text-sm"
                    >
                      Pay Order
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
