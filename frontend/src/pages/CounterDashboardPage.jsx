import { useEffect, useState } from "react";
import AppHeader from "../components/layout/AppHeader";
import { getCounterDashboardStats } from "../api/reportsApi";

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

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title="Counter Dashboard"
        subtitle="Receive payments, manage open bills, and monitor cashier collections"
      />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
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

        <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black">Open Bills</h2>
                <p className="text-slate-400 text-sm">
                  Orders waiting for payment
                </p>
              </div>

              <span className="bg-yellow-500/10 text-yellow-300 px-3 py-1 rounded-full text-xs">
                Live
              </span>
            </div>

            <div className="space-y-3">
              {data.open_orders.length === 0 ? (
                <p className="text-slate-400">No open bills found.</p>
              ) : (
                data.open_orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-black">
                        {order.table_name || "Takeaway"}
                      </p>
                      <p className="text-sm text-slate-400">
                        {order.order_number} • Waiter:{" "}
                        {order.server_name || "N/A"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-yellow-300">
                        UGX{" "}
                        {Number(
                          order.balance || order.total || 0
                        ).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black mb-5">Recent Payments</h2>

            <div className="space-y-3">
              {data.recent_payments.length === 0 ? (
                <p className="text-slate-400">No payments received today.</p>
              ) : (
                data.recent_payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">
                          {payment.table_name || "Takeaway"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {payment.order_number} • {payment.method}
                        </p>
                      </div>

                      <p className="font-black text-green-400">
                        UGX {Number(payment.amount || 0).toLocaleString()}
                      </p>
                    </div>

                    {payment.reference && (
                      <p className="text-xs text-slate-500 mt-2">
                        Ref: {payment.reference}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
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
