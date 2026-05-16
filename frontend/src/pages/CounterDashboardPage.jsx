import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { getCounterDashboardStats } from "../api/reportsApi";
import { payOrder, printPaidReceipt } from "../api/ordersApi";

function CounterDashboardPage() {
  const [data, setData] = useState({
    open_bills: 0,
    open_bill_amount: 0,
    paid_orders_today: 0,
    total_collected_today: 0,
    cash_collected: 0,
    mobile_money_collected: 0,
    card_collected: 0,
    open_orders: [],
    recent_payments: [],
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastPaidOrder, setLastPaidOrder] = useState(null);

  useEffect(() => {
    async function loadCounterStats() {
      try {
        const response = await getCounterDashboardStats();
        setData(response.data);
      } catch (error) {
        console.log("Failed to load counter dashboard", error);
      }
    }

    loadCounterStats();

    const interval = setInterval(loadCounterStats, 15000);
    return () => clearInterval(interval);
  }, []);
  async function handleReceivePayment() {
    if (!selectedOrder) return;

    try {
      setPaying(true);
      setError("");

      await payOrder(selectedOrder.id, {
        amount: Number(selectedOrder.balance || selectedOrder.total || 0),
        method: paymentMethod,
        reference,
      });

      setSuccessMessage(`${selectedOrder.order_number} paid successfully`);
      setLastPaidOrder(selectedOrder);
      setSelectedOrder(null);
      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      setReference("");

      const response = await getCounterDashboardStats();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  const filteredOpenOrders = data.open_orders.filter((order) => {
    const keyword = searchTerm.toLowerCase();

    return (
      order.order_number?.toLowerCase().includes(keyword) ||
      order.table_name?.toLowerCase().includes(keyword) ||
      order.server_name?.toLowerCase().includes(keyword)
    );
  });

  async function handlePrintPaidReceipt(orderId) {
    try {
      await printPaidReceipt(orderId);
      setSuccessMessage("Paid receipt printed successfully");
      setLastPaidOrder(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print paid receipt");
    }
  }
  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title="Counter Dashboard"
        subtitle="Receive payments, manage open bills, and monitor cashier collections"
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500 text-green-300 px-5 py-4 rounded-2xl flex items-center justify-between gap-4">
            <span> {successMessage}</span>

            {lastPaidOrder && (
              <button
                onClick={() => handlePrintPaidReceipt(lastPaidOrder.id)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
              >
                Print Paid Receipt
              </button>
            )}
          </div>
        )}

        <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
          <StatCard
            title="Open Bills"
            value={data.open_bills}
            note={`UGX ${Number(
              data.open_bill_amount || 0
            ).toLocaleString()} unpaid`}
            accent="text-yellow-400"
          />

          <StatCard
            title="Paid Orders"
            value={data.paid_orders_today}
            note="Received by you today"
            accent="text-green-400"
          />

          <StatCard
            title="Total Collected"
            value={`UGX ${Number(
              data.total_collected_today || 0
            ).toLocaleString()}`}
            note="Your cashier collection"
          />

          <StatCard
            title="Cash"
            value={`UGX ${Number(data.cash_collected || 0).toLocaleString()}`}
            note="Cash payments"
          />

          <StatCard
            title="Mobile Money"
            value={`UGX ${Number(
              data.mobile_money_collected || 0
            ).toLocaleString()}`}
            note="MoMo payments"
            accent="text-blue-400"
          />
        </section>

        <section className="grid xl:grid-cols-[1.35fr_0.65fr] gap-6 min-h-[620px]">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Open Bills</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Confirm money received and close customer bills
                  </p>
                </div>

                <span className="bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full text-xs font-black">
                  {filteredOpenOrders.length} Live
                </span>
              </div>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search table, order number, or waiter..."
                className="w-full mt-5 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-4 text-white outline-none focus:border-green-500"
              />
            </div>

            <div className="p-5 space-y-4 max-h-[520px] overflow-y-auto">
              {filteredOpenOrders.length === 0 ? (
                <p className="text-slate-400">No open bills found.</p>
              ) : (
                filteredOpenOrders.map((order) => {
                  const isDelayed = Number(order.waiting_minutes || 0) > 20;

                  return (
                    <div
                      key={order.id}
                      className={`bg-[#0D1117] border rounded-3xl p-5 ${
                        isDelayed ? "border-red-500/40" : "border-slate-800"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-5">
                        <div className="min-w-0">
                          <p className="font-black text-xl truncate">
                            {order.table_name || "Takeaway"}
                          </p>

                          <p className="text-sm text-slate-400 mt-1">
                            {order.order_number} • Waiter:{" "}
                            {order.server_name || "N/A"}
                          </p>

                          <p
                            className={`text-sm font-black mt-3 ${
                              isDelayed ? "text-red-400" : "text-yellow-300"
                            }`}
                          >
                            Waiting {Number(order.waiting_minutes || 0)} min
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black text-2xl text-yellow-300">
                            UGX{" "}
                            {Number(
                              order.balance || order.total || 0
                            ).toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500 capitalize mt-1">
                            {order.status}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setPaymentMethod("cash");
                          setReference("");
                        }}
                        className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-4 rounded-2xl font-black"
                      >
                        Confirm Money Received & Close Bill
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-2xl font-black">Recent Payments</h2>
              <p className="text-slate-400 text-sm mt-1">
                Latest bills closed by cashier
              </p>
            </div>

            <div className="p-5 space-y-4 max-h-[520px] overflow-y-auto">
              {data.recent_payments.length === 0 ? (
                <p className="text-slate-400">No payments received today.</p>
              ) : (
                data.recent_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-black truncate">
                          {payment.table_name || "Takeaway"}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {payment.order_number} • {payment.method}
                        </p>
                      </div>

                      <p className="font-black text-green-400 shrink-0">
                        UGX {Number(payment.amount || 0).toLocaleString()}
                      </p>
                    </div>

                    {payment.reference && (
                      <p className="text-xs text-slate-500 mt-3 truncate">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-md bg-[#111827] border border-slate-700 rounded-3xl p-6">
              <h2 className="text-2xl font-black">Receive Payment</h2>

              <p className="text-slate-400 mt-2">
                {selectedOrder.table_name || "Takeaway"} •{" "}
                {selectedOrder.order_number}
              </p>

              <div className="mt-5 bg-[#0D1117] rounded-2xl p-4">
                <p className="text-slate-400 text-sm">Amount Due</p>
                <p className="text-3xl font-black text-green-400 mt-2">
                  UGX{" "}
                  {Number(
                    selectedOrder.balance || selectedOrder.total || 0
                  ).toLocaleString()}
                </p>
              </div>
              <div className="mt-5">
                <label className="text-sm text-slate-400">Payment Method</label>

                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: "cash", label: "Cash" },
                    { value: "mobile_money", label: "MoMo" },
                    { value: "card", label: "Card" },
                  ].map((method) => (
                    <button
                      key={method.value}
                      type="button"
                      onClick={() => setPaymentMethod(method.value)}
                      className={`rounded-2xl py-4 font-bold border transition ${
                        paymentMethod === method.value
                          ? "bg-green-500 border-green-400 text-white"
                          : "bg-[#0D1117] border-slate-700 text-slate-300 hover:border-green-500"
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-400">
                  Reference / Transaction ID
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={
                    paymentMethod === "cash"
                      ? "Optional for cash"
                      : "Enter MoMo/Card transaction reference"
                  }
                  className="w-full mt-2 bg-[#0D1117] border border-slate-700 rounded-2xl px-4 py-3"
                />
              </div>

              {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-slate-700 hover:bg-slate-600 rounded-2xl py-3 font-bold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReceivePayment}
                  disabled={paying}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-2xl py-3 font-bold"
                >
                  {paying ? "Processing..." : "Receive & Close Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, note, accent = "text-white" }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
      <p className="text-slate-400 text-sm">{title}</p>
      <h2 className={`text-3xl font-black mt-3 ${accent}`}>{value}</h2>
      <p className="text-slate-500 text-sm mt-2">{note}</p>
    </div>
  );
}

export default CounterDashboardPage;
