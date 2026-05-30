import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { getManagerRestaurantDashboard } from "../api/reportsApi";
import { getCombinedTableBill, getOrderById } from "../api/ordersApi";

function ManagerDashboardPage() {
  const [data, setData] = useState({
    summary: {},
    tables: [],
    top_waiters: [],
    top_items: [],
    payment_breakdown: [],
    kitchen_delays: [],
  });

  const [selectedBill, setSelectedBill] = useState(null);
  const [billLoading, setBillLoading] = useState(false);
  const [billError, setBillError] = useState("");
  const [attentionFilter, setAttentionFilter] = useState("all");
  const [managerNotes, setManagerNotes] = useState({});

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getManagerRestaurantDashboard();
        setData(response.data);
      } catch (error) {
        console.log("Failed to load manager dashboard", error);
      }
    }

    loadDashboard();

    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const summary = data.summary || {};

  const busyTables = data.tables.filter(
    (table) => Number(table.open_orders_count || 0) > 0
  );

  const totalSales = Number(summary.today_sales || 0);
  const delayedOrders = data.kitchen_delays.filter(
    (order) => Number(order.waiting_minutes || 0) >= 10
  );

  const criticalDelayedOrders = data.kitchen_delays.filter(
    (order) => Number(order.waiting_minutes || 0) >= 20
  );

  const visibleDelayOrders =
    attentionFilter === "critical"
      ? criticalDelayedOrders
      : attentionFilter === "delays"
      ? delayedOrders
      : data.kitchen_delays;

  const notesCount = Object.values(managerNotes).filter(Boolean).length;
  async function handleViewTableBill(tableId) {
    try {
      setBillLoading(true);
      setBillError("");

      const response = await getCombinedTableBill(tableId);
      setSelectedBill(response.data);
    } catch (error) {
      setBillError(
        error.response?.data?.message || "Failed to load table bill"
      );
    } finally {
      setBillLoading(false);
    }
  }

  async function handleViewOrderBill(orderId) {
    try {
      setBillLoading(true);
      setBillError("");

      const response = await getOrderById(orderId);
      const order = response.data || response;

      setSelectedBill({
        table: {
          name: order.table_name || "Takeaway",
        },
        orders: [order],
        items: order.items || [],
        total: Number(order.balance || order.total || 0),
      });
    } catch (error) {
      setBillError(
        error.response?.data?.message || "Failed to load order bill"
      );
    } finally {
      setBillLoading(false);
    }
  }
  function handleSetManagerNote(key, note) {
    setManagerNotes((currentNotes) => ({
      ...currentNotes,
      [key]: note,
    }));
  }
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="Manager Operations"
        subtitle="Restaurant floor, sales, waiters, payments, and delays"
      />

      <main className="mx-auto max-w-[1500px] p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-950">
              Today’s Operations
            </h1>
            <p className="text-sm font-semibold text-slate-500">
              Focus on the floor first, then sales and reconciliation.
            </p>
          </div>

          <Link
            to="/admin"
            className="border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800"
          >
            System Admin
          </Link>
        </div>

        <section className="border border-slate-300 bg-white">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <StatusItem
              label="Sales Today"
              value={`UGX ${totalSales.toLocaleString()}`}
            />

            <StatusItem
              label="Open Bills"
              value={summary.open_bills || 0}
              note={`UGX ${Number(
                summary.open_bill_amount || 0
              ).toLocaleString()} unpaid`}
            />

            <StatusItem label="Busy Tables" value={busyTables.length} />

            <StatusItem
              label="Orders Today"
              value={summary.orders_today || 0}
              note={`${summary.paid_orders || 0} paid`}
            />
          </div>
        </section>
        <section className="border border-slate-300 bg-white">
          <div className="grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <AttentionCell label="Busy Tables" value={busyTables.length} />
            <AttentionCell
              label="Delayed Orders"
              value={delayedOrders.length}
            />
            <AttentionCell
              label="Critical Delays"
              value={criticalDelayedOrders.length}
            />
            <AttentionCell label="Notes Added" value={notesCount} />
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-3">
            {[
              ["all", "All Attention"],
              ["tables", "Busy Tables"],
              ["delays", "Delayed Orders"],
              ["critical", "Critical Delays"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setAttentionFilter(value)}
                className={`border px-3 py-2 text-xs font-black ${
                  attentionFilter === value
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-300 bg-white text-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section
          className={`grid gap-5 ${
            attentionFilter === "tables" ||
            attentionFilter === "delays" ||
            attentionFilter === "critical"
              ? "xl:grid-cols-1"
              : "xl:grid-cols-2"
          }`}
        >
          {attentionFilter !== "delays" && attentionFilter !== "critical" && (
            <Panel
              title="Busy Tables"
              subtitle="Tables that still have unpaid orders"
            >
              <SimpleTable
                minWidth="620px"
                headers={[
                  "Table",
                  "Waiter",
                  "Orders",
                  "Amount Due",
                  "Note",
                  "Action",
                ]}
                emptyText="No busy tables now."
                rows={busyTables.map((table) => [
                  table.name,
                  table.waiter_names || "Staff",
                  table.open_orders_count || 0,
                  `UGX ${Number(table.unpaid_total || 0).toLocaleString()}`,
                  <ManagerNoteSelect
                    value={managerNotes[`table-${table.id}`] || ""}
                    onChange={(note) =>
                      handleSetManagerNote(`table-${table.id}`, note)
                    }
                  />,
                  <button
                    onClick={() => handleViewTableBill(table.id)}
                    className="border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-100"
                  >
                    View Bill
                  </button>,
                ])}
              />
            </Panel>
          )}
          {attentionFilter !== "tables" && (
            <Panel
              title="Kitchen / Bar Delays"
              subtitle="Open orders taking longest"
            >
              <SimpleTable
                headers={[
                  "Order",
                  "Table",
                  "Waiter",
                  "Waiting",
                  "Note",
                  "Action",
                ]}
                emptyText="No delayed open orders."
                rows={visibleDelayOrders.map((order) => [
                  order.order_number,
                  order.table_name || "Takeaway",
                  order.waiter_name || "Staff",
                  <DelayBadge minutes={Number(order.waiting_minutes || 0)} />,
                  <ManagerNoteSelect
                    value={managerNotes[`order-${order.id}`] || ""}
                    onChange={(note) =>
                      handleSetManagerNote(`order-${order.id}`, note)
                    }
                  />,
                  <button
                    onClick={() => handleViewOrderBill(order.id)}
                    className="border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-800 hover:bg-slate-100"
                  >
                    View
                  </button>,
                ])}
              />
            </Panel>
          )}
        </section>

        <section className="grid xl:grid-cols-2 gap-5">
          <Panel title="Top Waiters" subtitle="Waiter performance today">
            <SimpleTable
              headers={["Waiter", "Sales", "Tables", "Paid", "Open"]}
              emptyText="No waiter activity yet."
              rows={data.top_waiters.map((waiter) => [
                waiter.name,
                `UGX ${Number(waiter.total_sales || 0).toLocaleString()}`,
                waiter.tables_served || 0,
                waiter.paid_orders || 0,
                waiter.open_orders || 0,
              ])}
            />
          </Panel>

          <Panel title="Top Selling Items" subtitle="Most ordered items today">
            <SimpleTable
              headers={["Item", "Qty", "Sales", "Share"]}
              emptyText="No items sold yet."
              rows={data.top_items.map((item) => {
                const itemSales = Number(item.total_sales || 0);
                const share =
                  totalSales > 0
                    ? Math.round((itemSales / totalSales) * 100)
                    : 0;

                return [
                  item.product_name,
                  Number(item.quantity_sold || 0),
                  `UGX ${itemSales.toLocaleString()}`,
                  `${share}%`,
                ];
              })}
            />
          </Panel>
        </section>

        <Panel title="Payment Breakdown" subtitle="Cashier collection channels">
          <SimpleTable
            headers={["Method", "Payments", "Amount"]}
            emptyText="No payments received yet."
            rows={data.payment_breakdown.map((payment) => [
              payment.method?.replace("_", " ") || "cash",
              payment.payments_count || 0,
              `UGX ${Number(payment.total_amount || 0).toLocaleString()}`,
            ])}
          />
        </Panel>
      </main>
      {billLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="border border-slate-300 bg-white px-6 py-4 text-sm font-black text-slate-700">
            Loading bill...
          </div>
        </div>
      )}

      {billError && (
        <div className="fixed bottom-5 right-5 z-50 border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
          {billError}
        </div>
      )}

      {selectedBill && (
        <BillModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
      )}
    </div>
  );
}
function AttentionCell({ label, value }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function StatusItem({ label, value, note }) {
  return (
    <div className="px-4 py-4">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
      {note && (
        <p className="mt-1 text-xs font-semibold text-slate-500">{note}</p>
      )}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="border border-slate-300 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>

      {children}
    </section>
  );
}

function SimpleTable({ headers, rows, emptyText, minWidth = "680px" }) {
  return (
    <div className="overflow-x-auto">
      <div
        className="grid border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase text-slate-500"
        style={{
          minWidth,
          gridTemplateColumns: `repeat(${headers.length}, minmax(100px, 1fr))`,
        }}
      >
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm font-black text-slate-400">
          {emptyText}
        </div>
      ) : (
        rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="grid items-center border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            style={{
              minWidth,
              gridTemplateColumns: `repeat(${headers.length}, minmax(120px, 1fr))`,
            }}
          >
            {row.map((cell, cellIndex) => (
              <span key={cellIndex}>{cell}</span>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
function getManagerNoteLabel(note) {
  const labels = {
    check_table: "Check table",
    customer_waiting: "Customer waiting",
    call_waiter: "Call waiter",
    kitchen_priority: "Kitchen priority",
    payment_issue: "Payment issue",
  };

  return labels[note] || "No note";
}
function ManagerNoteSelect({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-8 w-full max-w-[130px] border border-slate-300 bg-white px-2 text-xs font-bold text-slate-700"
    >
      <option value="">No note</option>
      <option value="check_table">Check</option>
      <option value="customer_waiting">Waiting</option>
      <option value="call_waiter">Call waiter</option>
      <option value="kitchen_priority">Priority</option>
      <option value="payment_issue">Payment</option>
    </select>
  );
}
function DelayBadge({ minutes }) {
  let className = "bg-emerald-50 text-emerald-700 border-emerald-200";
  let label = "Normal";

  if (minutes >= 20) {
    className = "bg-red-50 text-red-700 border-red-200";
    label = "Critical";
  } else if (minutes >= 10) {
    className = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Watch";
  }

  return (
    <span
      className={`inline-flex border px-2 py-1 text-xs font-black ${className}`}
    >
      {minutes} min · {label}
    </span>
  );
}
function BillModal({ bill, onClose }) {
  const orders = bill.orders || [];
  const items = bill.items || [];

  const waiterNames = [
    ...new Set(orders.map((order) => order.server_name).filter(Boolean)),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl border border-slate-300 bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase text-slate-500">
              Manager Bill Review
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-950">
              {bill.table?.name || "Takeaway"}
            </h2>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Waiter: {waiterNames.join(", ") || "Staff"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="border border-slate-300 bg-white px-3 py-1 text-lg font-black"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-3 border-b border-slate-200">
          <BillSummaryCell label="Orders" value={orders.length} />
          <BillSummaryCell label="Items" value={items.length} />
          <BillSummaryCell
            label="Total Due"
            value={`UGX ${Number(bill.total || 0).toLocaleString()}`}
            strong
          />
        </div>

        <div className="max-h-[520px] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm font-black text-slate-400">
              No orders found for this bill.
            </div>
          ) : (
            orders.map((order) => {
              const orderItems = items.filter(
                (item) => Number(item.order_id) === Number(order.id)
              );

              return (
                <div key={order.id} className="border-b border-slate-200">
                  <div className="flex items-center justify-between bg-slate-50 px-5 py-3">
                    <div>
                      <p className="font-black text-slate-950">
                        {order.order_number}
                      </p>

                      <p className="text-xs font-semibold text-slate-500">
                        {order.status} • {order.created_at}
                      </p>
                    </div>

                    <p className="font-black text-emerald-600">
                      UGX{" "}
                      {Number(
                        order.balance || order.total || 0
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-[1.5fr_70px_120px_120px] border-b border-slate-100 px-5 py-2 text-xs font-black uppercase text-slate-500">
                    <span>Item</span>
                    <span>Qty</span>
                    <span>Total</span>
                    <span>Status</span>
                  </div>

                  {orderItems.length === 0 ? (
                    <div className="px-5 py-4 text-sm font-semibold text-slate-400">
                      No items found for this order.
                    </div>
                  ) : (
                    orderItems.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.5fr_70px_120px_120px] items-center border-b border-slate-100 px-5 py-2 text-sm font-semibold text-slate-700 last:border-b-0"
                      >
                        <span>{item.product_name}</span>

                        <span>{item.quantity}</span>

                        <span>
                          UGX {Number(item.total_price || 0).toLocaleString()}
                        </span>

                        <ItemStatusBadge status={item.status} />
                      </div>
                    ))
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm font-semibold text-slate-500">
            View only. Cashier handles payment and receipt printing.
          </p>

          <button
            onClick={onClose}
            className="bg-slate-950 px-4 py-3 text-sm font-black text-white"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
function BillSummaryCell({ label, value, strong = false }) {
  return (
    <div className="border-r border-slate-200 px-4 py-3 last:border-r-0">
      <p className="text-xs font-black uppercase text-slate-500">{label}</p>
      <p
        className={`mt-1 text-lg font-black ${
          strong ? "text-emerald-600" : "text-slate-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
function ItemStatusBadge({ status }) {
  const normalizedStatus = status || "pending";

  let className = "border-slate-200 bg-slate-50 text-slate-600";
  let label = normalizedStatus;

  if (normalizedStatus === "ready") {
    className = "border-emerald-200 bg-emerald-50 text-emerald-700";
    label = "Ready";
  }

  if (normalizedStatus === "preparing") {
    className = "border-amber-200 bg-amber-50 text-amber-700";
    label = "Preparing";
  }

  if (normalizedStatus === "served") {
    className = "border-blue-200 bg-blue-50 text-blue-700";
    label = "Served";
  }

  if (normalizedStatus === "cancelled") {
    className = "border-red-200 bg-red-50 text-red-700";
    label = "Cancelled";
  }

  return (
    <span
      className={`inline-flex border px-2 py-1 text-xs font-black ${className}`}
    >
      {label}
    </span>
  );
}

export default ManagerDashboardPage;
