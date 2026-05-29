import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import {
  getCounterDashboardStats,
  getCashierShiftSummary,
} from "../api/reportsApi";
import {
  getOrderById,
  payOrder,
  payTableOrders,
  printPaidReceipt,
} from "../api/ordersApi";
import { buildPaidReceipt } from "../utils/receiptTemplates";
import { printReceiptWindow } from "../utils/printReceipt";

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
  const [billFilter, setBillFilter] = useState("all");
  const [successMessage, setSuccessMessage] = useState("");
  const [lastPaidOrder, setLastPaidOrder] = useState(null);
  const [lastPaidTablePayment, setLastPaidTablePayment] = useState(null);
  const [shiftSummary, setShiftSummary] = useState(null);
  const [activePanel, setActivePanel] = useState("payments");

  async function loadDashboard() {
    try {
      const [dashboardResponse, shiftResponse] = await Promise.all([
        getCounterDashboardStats(),
        getCashierShiftSummary(),
      ]);

      setData(dashboardResponse.data);
      setShiftSummary(shiftResponse.data);
    } catch (error) {
      console.log("Failed to load counter dashboard", error);
    }
  }

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(loadDashboard, 15000);
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

      setSuccessMessage(
        `${selectedOrder.order_number} paid successfully. Receipt is ready.`
      );

      setLastPaidOrder(selectedOrder);
      setLastPaidTablePayment(null);
      setSelectedOrder(null);
      setReference("");

      await loadDashboard();

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
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

      const paymentResponse = await payTableOrders(selectedTableBill.table_id, {
        method: paymentMethod,
        reference,
      });

      setLastPaidTablePayment(paymentResponse.data);
      setLastPaidOrder(null);

      setSuccessMessage(
        `${selectedTableBill.table_name} fully paid. Receipt is ready.`
      );

      setSelectedTableBill(null);
      setPaymentMethod("cash");
      setReference("");

      await loadDashboard();

      setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Combined payment failed");
    } finally {
      setPaying(false);
    }
  }

  async function handlePrintPaidReceipt(orderId) {
    try {
      const orderResponse = await getOrderById(orderId);
      const order = orderResponse.data || orderResponse;

      const receiptHtml = buildPaidReceipt(order);
      printReceiptWindow(`${order.order_number} Paid Receipt`, receiptHtml);

      await printPaidReceipt(orderId);

      setSuccessMessage("Paid receipt printed successfully");
      setLastPaidOrder(null);
      setLastPaidTablePayment(null);

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to print paid receipt");
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
        server_names: [],
        orders: [],
        total: 0,
        waiting_minutes: 0,
      };
    }

    if (
      order.server_name &&
      !groups[key].server_names.includes(order.server_name)
    ) {
      groups[key].server_names.push(order.server_name);
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

  const visibleOpenBillGroups = openBillGroups.filter((group) => {
    if (billFilter === "delayed") {
      return Number(group.waiting_minutes || 0) > 20;
    }

    if (billFilter === "combined") {
      return group.orders.length > 1;
    }

    if (billFilter === "takeaway") {
      return !group.table_id;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="Cashier Counter"
        subtitle="Receive payments, close bills, and print receipts"
        showBackToDashboard={true}
      />

      <main className="p-5 space-y-5">
        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 font-black flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <span>{successMessage}</span>

            {lastPaidOrder && (
              <button
                onClick={() => handlePrintPaidReceipt(lastPaidOrder.id)}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white"
              >
                Print Paid Receipt
              </button>
            )}

            {lastPaidTablePayment?.paid_orders?.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {lastPaidTablePayment.paid_orders.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => handlePrintPaidReceipt(order.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-black text-white"
                  >
                    Print {order.order_number}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <section className="grid md:grid-cols-2 xl:grid-cols-6 gap-3">
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
            accent="text-blue-600"
          />

          <StatCard
            title="Card"
            value={`UGX ${Number(data.card_collected || 0).toLocaleString()}`}
            note="Card payments"
            accent="text-purple-600"
          />
        </section>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActivePanel("payments")}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              activePanel === "payments"
                ? "bg-slate-950 text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            Open Bills
          </button>

          <button
            onClick={() => setActivePanel("shift")}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              activePanel === "shift"
                ? "bg-slate-950 text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            Shift Summary
          </button>

          <button
            onClick={() => setActivePanel("history")}
            className={`rounded-xl px-4 py-2 text-sm font-black ${
              activePanel === "history"
                ? "bg-slate-950 text-white"
                : "bg-white border border-slate-200 text-slate-700"
            }`}
          >
            Recent Payments
          </button>
        </div>

        {activePanel === "payments" && (
          <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden min-h-[620px]">
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
                  {visibleOpenBillGroups.length} unpaid
                </span>
              </div>

              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search table, order number, or waiter..."
                className="mt-4 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-slate-400"
              />

              <div className="mt-3 flex items-center gap-2 overflow-x-auto">
                {[
                  ["all", "All"],
                  ["combined", "Combined Bills"],
                  ["delayed", "Delayed"],
                  ["takeaway", "Takeaway"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setBillFilter(value)}
                    className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black ${
                      billFilter === value
                        ? "bg-slate-950 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 max-h-[560px] overflow-y-auto">
              {visibleOpenBillGroups.length === 0 ? (
                <div className="py-20 text-center font-black text-slate-400">
                  No open bills found.
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleOpenBillGroups.map((group) => {
                    const isDelayed = Number(group.waiting_minutes || 0) > 20;
                    const hasMultipleOrders = group.orders.length > 1;

                    return (
                      <div
                        key={group.table_id || group.table_name}
                        className={`rounded-xl border bg-white px-4 py-3 hover:bg-slate-50 transition ${
                          isDelayed ? "border-red-200" : "border-slate-200"
                        }`}
                      >
                        <div className="grid grid-cols-[1.4fr_90px_120px_150px_90px] gap-3 items-center">
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

                            <p className="text-xs font-semibold text-slate-500 mt-1 truncate">
                              Waiter:{" "}
                              {group.server_names?.join(", ") || "Staff"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400">
                              Orders
                            </p>
                            <p className="font-black text-slate-950">
                              {group.orders.length}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] uppercase font-black text-slate-400">
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
                            <p className="text-[10px] uppercase font-black text-slate-400">
                              Amount Due
                            </p>
                            <p className="font-black text-emerald-600">
                              UGX {Number(group.total || 0).toLocaleString()}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setPaymentMethod("cash");
                              setReference("");

                              if (group.table_id) {
                                setSelectedOrder(null);
                                setSelectedTableBill(group);
                              } else {
                                setSelectedTableBill(null);
                                setSelectedOrder(group.orders[0]);
                              }
                            }}
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white hover:bg-slate-800"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}

        {activePanel === "shift" && shiftSummary && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Cashier Shift Summary
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Current business day collections
            </p>

            <div className="mt-5 grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <ShiftCard
                label="Total Collected"
                value={`UGX ${Number(
                  shiftSummary.summary?.total_collected || 0
                ).toLocaleString()}`}
                accent="text-emerald-600"
              />

              <ShiftCard
                label="Cash"
                value={`UGX ${Number(
                  shiftSummary.summary?.cash_total || 0
                ).toLocaleString()}`}
              />

              <ShiftCard
                label="Mobile Money"
                value={`UGX ${Number(
                  shiftSummary.summary?.mobile_money_total || 0
                ).toLocaleString()}`}
                accent="text-blue-600"
              />

              <ShiftCard
                label="Card"
                value={`UGX ${Number(
                  shiftSummary.summary?.card_total || 0
                ).toLocaleString()}`}
                accent="text-purple-600"
              />

              <ShiftCard
                label="Open Bills"
                value={`UGX ${Number(
                  shiftSummary.open_bills?.open_bill_amount || 0
                ).toLocaleString()}`}
                accent="text-amber-600"
              />

              <ShiftCard
                label="Payments"
                value={shiftSummary.summary?.payments_count || 0}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-[1fr_120px_140px_160px] gap-3 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-400">
                <span>Bill</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Time</span>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {shiftSummary.payments?.length === 0 ? (
                  <div className="py-10 text-center text-sm font-black text-slate-400">
                    No payments in this shift.
                  </div>
                ) : (
                  shiftSummary.payments?.map((payment) => (
                    <div
                      key={payment.id}
                      className="grid grid-cols-[1fr_120px_140px_160px] gap-3 border-t border-slate-100 px-4 py-3 text-sm font-semibold"
                    >
                      <span>
                        {payment.table_name || "Takeaway"} •{" "}
                        {payment.order_number}
                      </span>
                      <span className="capitalize">
                        {payment.method?.replace("_", " ")}
                      </span>
                      <span className="font-black text-emerald-600">
                        UGX {Number(payment.amount || 0).toLocaleString()}
                      </span>
                      <span className="text-slate-500">
                        {payment.created_at}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activePanel === "history" && (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Recent Payments
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Latest bills closed by cashier
            </p>

            <div className="mt-5 space-y-2 max-h-[620px] overflow-y-auto">
              {data.recent_payments.length === 0 ? (
                <div className="py-20 text-center font-black text-slate-400">
                  No payments received today.
                </div>
              ) : (
                data.recent_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-950 truncate">
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
          </section>
        )}

        {selectedTableBill && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-black text-slate-400">
                    Full Table Payment
                  </p>

                  <h2 className="text-3xl font-black text-slate-950">
                    {selectedTableBill.table_name}
                  </h2>

                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    Waiter:{" "}
                    {selectedTableBill.server_names?.join(", ") || "Staff"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedTableBill(null)}
                  className="w-10 h-10 rounded-xl bg-slate-100 font-black"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-black text-slate-400">
                        Total Due
                      </p>

                      <h3 className="mt-1 text-3xl font-black text-emerald-600">
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
                        className="flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-black text-slate-950">
                            {order.order_number}
                          </p>

                          <p className="text-xs font-semibold text-slate-500">
                            {order.server_name}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <p className="font-black text-emerald-600">
                            UGX{" "}
                            {Number(
                              order.balance || order.total || 0
                            ).toLocaleString()}
                          </p>

                          <button
                            onClick={() => {
                              setSelectedTableBill(null);
                              setSelectedOrder(order);
                              setPaymentMethod("cash");
                              setReference("");
                            }}
                            className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white"
                          >
                            Pay This
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  reference={reference}
                  setReference={setReference}
                />

                {error && <ErrorBox message={error} />}

                <button
                  disabled={paying}
                  onClick={handleReceiveTablePayment}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-lg font-black text-white"
                >
                  {paying ? "Processing..." : "Pay Full Table"}
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase font-black text-slate-400">
                    Pay Individual Order
                  </p>

                  <h2 className="text-3xl font-black text-slate-950">
                    {selectedOrder.order_number}
                  </h2>

                  <p className="text-sm font-semibold text-slate-500 mt-1">
                    {selectedOrder.table_name || "Takeaway"} • Waiter:{" "}
                    {selectedOrder.server_name || "Staff"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-xl bg-slate-100 font-black"
                >
                  ×
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs uppercase font-black text-slate-400">
                    Amount Due
                  </p>

                  <h3 className="mt-1 text-3xl font-black text-emerald-600">
                    UGX{" "}
                    {Number(
                      selectedOrder.balance || selectedOrder.total || 0
                    ).toLocaleString()}
                  </h3>
                </div>

                <PaymentMethodSelector
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  reference={reference}
                  setReference={setReference}
                />

                {error && <ErrorBox message={error} />}

                <button
                  disabled={paying}
                  onClick={handleReceivePayment}
                  className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-lg font-black text-white"
                >
                  {paying ? "Processing..." : "Confirm Order Payment"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
  reference,
  setReference,
}) {
  return (
    <>
      <div>
        <p className="text-sm font-black text-slate-950 mb-3">Payment Method</p>

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

      {(paymentMethod === "mobile_money" || paymentMethod === "card") && (
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
    </>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
      {message}
    </div>
  );
}

function StatCard({ title, value, note, accent = "text-slate-950" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-black uppercase text-slate-400">{title}</p>
      <h2 className={`mt-2 text-xl font-black ${accent}`}>{value}</h2>
      <p className="mt-1 text-xs font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function ShiftCard({ label, value, accent = "text-slate-950" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-black ${accent}`}>{value}</p>
    </div>
  );
}

export default CounterDashboardPage;
