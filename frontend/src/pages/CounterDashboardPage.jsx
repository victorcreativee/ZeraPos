import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { getCounterDashboardStats } from "../api/reportsApi";
import { payOrder, payTableOrders, printPaidReceipt } from "../api/ordersApi";

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
  const [selectedTableBill, setSelectedTableBill] = useState(null);
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
  async function handleReceiveTablePayment() {
    if (!selectedTableBill) return;

    try {
      setPaying(true);
      setError("");

      await payTableOrders(selectedTableBill.table_id, {
        method: paymentMethod,
        reference,
      });

      setSuccessMessage(
        `${selectedTableBill.table_name} payment received. Table is now ready if no other unpaid orders remain.`
      );

      setSelectedTableBill(null);
      setReference("");

      const response = await getCounterDashboardStats();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Combined payment failed");
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
  const groupedOpenBills = filteredOpenOrders.reduce((groups, order) => {
    const key = order.table_id
      ? `table-${order.table_id}`
      : `takeaway-${order.id}`;

    if (!groups[key]) {
      groups[key] = {
        table_id: order.table_id,
        table_name: order.table_name || "Takeaway",
        server_name: order.server_name || "N/A",
        orders: [],
        total: 0,
        waiting_minutes: 0,
      };
    }

    groups[key].orders.push(order);
    groups[key].total += Number(order.balance || order.total || 0);
    groups[key].waiting_minutes = Math.max(
      groups[key].waiting_minutes,
      Number(order.waiting_minutes || 0)
    );

    return groups;
  }, {});

  const openBillGroups = Object.values(groupedOpenBills);

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
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="Cashier Counter"
        subtitle="Receive payments, close bills, and print receipts"
        showBackToDashboard={true}
      />

      <main className="p-5 space-y-5">
        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-700 font-black flex items-center justify-between">
            <span>{successMessage}</span>

            {lastPaidOrder && (
              <button
                onClick={() => handlePrintPaidReceipt(lastPaidOrder.id)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
              >
                Print Paid Receipt
              </button>
            )}
          </div>
        )}

        <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
          <StatCard
            title="Open Bills"
            value={data.open_bills}
            note={`UGX ${Number(
              data.open_bill_amount || 0
            ).toLocaleString()} unpaid`}
            accent="text-amber-600"
          />

          <StatCard
            title="Paid Orders"
            value={data.paid_orders_today}
            note="Received today"
            accent="text-emerald-600"
          />

          <StatCard
            title="Total Collected"
            value={`UGX ${Number(
              data.total_collected_today || 0
            ).toLocaleString()}`}
            note="Cashier collection"
            accent="text-slate-950"
          />

          <StatCard
            title="Cash"
            value={`UGX ${Number(data.cash_collected || 0).toLocaleString()}`}
            note="Cash payments"
            accent="text-slate-950"
          />

          <StatCard
            title="Mobile Money"
            value={`UGX ${Number(
              data.mobile_money_collected || 0
            ).toLocaleString()}`}
            note="MoMo payments"
            accent="text-blue-600"
          />
        </section>

        <section className="grid xl:grid-cols-[1.35fr_0.65fr] gap-5 min-h-[620px]">
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">
                    Open Bills
                  </h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">
                    Grouped by table. Cashier confirms payment and closes bills.
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-700">
                  {openBillGroups.length} unpaid
                </span>
              </div>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search table, order number, or waiter..."
                className="mt-4 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
              />
            </div>

            <div className="p-3 max-h-[560px] overflow-y-auto">
              {openBillGroups.length === 0 ? (
                <div className="py-20 text-center font-black text-slate-400">
                  No open bills found.
                </div>
              ) : (
                <div className="space-y-2">
                  {openBillGroups.map((group) => {
                    const isDelayed = Number(group.waiting_minutes || 0) > 20;
                    const hasMultipleOrders = group.orders.length > 1;

                    return (
                      <div
                        key={group.table_id || group.table_name}
                        className={`rounded-2xl border bg-white px-4 py-3 shadow-sm hover:bg-slate-50 transition ${
                          isDelayed ? "border-red-200" : "border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 items-center">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-slate-950 truncate">
                                {group.table_name}
                              </h3>

                              {hasMultipleOrders && (
                                <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase text-blue-700">
                                  Combined
                                </span>
                              )}
                            </div>

                            <p className="text-xs font-semibold text-slate-500 mt-1">
                              Server: {group.server_name || "Staff"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase font-black text-slate-400">
                              Orders
                            </p>
                            <p className="font-black text-slate-950">
                              {group.orders.length}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase font-black text-slate-400">
                              Waiting
                            </p>
                            <p
                              className={`font-black ${
                                isDelayed ? "text-red-600" : "text-amber-600"
                              }`}
                            >
                              {Number(group.waiting_minutes || 0)} min
                            </p>
                          </div>

                          <div>
                            <p className="text-xs uppercase font-black text-slate-400">
                              Amount
                            </p>
                            <p className="font-black text-emerald-600">
                              UGX {Number(group.total || 0).toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedOrder(null);
                              setSelectedTableBill(group);
                              setPaymentMethod("cash");
                              setReference("");
                            }}
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                          >
                            Open
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-2xl font-black text-slate-950">
                Recent Payments
              </h2>
              <p className="text-slate-500 text-sm font-medium mt-1">
                Latest bills closed by cashier
              </p>
            </div>

            <div className="p-5 space-y-3 max-h-[620px] overflow-y-auto">
              {data.recent_payments.length === 0 ? (
                <div className="py-20 text-center font-black text-slate-400">
                  No payments received today.
                </div>
              ) : (
                data.recent_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-black text-slate-950 truncate">
                          {payment.table_name || "Takeaway"}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-500">
                          {payment.order_number} • {payment.method}
                        </p>
                      </div>

                      <p className="shrink-0 font-black text-emerald-600">
                        UGX {Number(payment.amount || 0).toLocaleString()}
                      </p>
                    </div>

                    {payment.reference && (
                      <p className="mt-3 truncate text-xs font-semibold text-slate-400">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {selectedTableBill && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-xl rounded-3xl bg-white shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-black text-slate-400">
                    Receive Payment
                  </p>

                  <h2 className="text-3xl font-black text-slate-950">
                    {selectedTableBill.table_name}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedTableBill(null)}
                  className="w-10 h-10 rounded-xl bg-slate-100 font-black"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-black text-slate-400">
                        Total Due
                      </p>

                      <h3 className="mt-2 text-4xl font-black text-emerald-600">
                        UGX{" "}
                        {Number(selectedTableBill.total || 0).toLocaleString()}
                      </h3>
                    </div>

                    <div className="text-right">
                      <p className="text-xs uppercase font-black text-slate-400">
                        Orders
                      </p>

                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {selectedTableBill.orders.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950 mb-3">
                    Orders Included
                  </p>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    {selectedTableBill.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-black text-slate-950">
                            {order.order_number}
                          </p>

                          <p className="text-xs font-semibold text-slate-500">
                            {order.server_name}
                          </p>
                        </div>

                        <p className="font-black text-emerald-600">
                          UGX{" "}
                          {Number(
                            order.balance || order.total || 0
                          ).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950 mb-3">
                    Payment Method
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {["cash", "mobile_money", "card"].map((method) => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`h-12 rounded-2xl border text-sm font-black uppercase ${
                          paymentMethod === method
                            ? "bg-slate-950 border-slate-950 text-white"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}
                      >
                        {method.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                {(paymentMethod === "mobile_money" ||
                  paymentMethod === "card") && (
                  <div>
                    <p className="text-sm font-black text-slate-950 mb-2">
                      Reference Number
                    </p>

                    <input
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      placeholder="Transaction reference..."
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
                    {error}
                  </div>
                )}

                <button
                  disabled={paying}
                  onClick={handleReceiveTablePayment}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-lg font-black text-white"
                >
                  {paying ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, note, accent = "text-slate-950" }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase text-slate-400">{title}</p>
      <h2 className={`mt-3 text-2xl font-black ${accent}`}>{value}</h2>
      <p className="mt-2 text-sm font-semibold text-slate-500">{note}</p>
    </div>
  );
}

export default CounterDashboardPage;
