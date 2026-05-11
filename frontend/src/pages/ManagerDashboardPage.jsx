import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { getManagerRestaurantDashboard } from "../api/reportsApi";

function ManagerDashboardPage() {
  const [data, setData] = useState({
    summary: {},
    tables: [],
    waiters: [],
    recent_orders: [],
  });

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await getManagerRestaurantDashboard();
        setData(response.data);
      } catch (error) {
        console.log("Failed to load manager restaurant dashboard", error);
      }
    }

    loadDashboard();

    const interval = setInterval(loadDashboard, 15000);
    return () => clearInterval(interval);
  }, []);

  const summary = data.summary || {};

  const occupiedTables = data.tables.filter(
    (table) => table.order_status && table.order_status !== "paid"
  ).length;

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title="Restaurant Manager"
        subtitle="Live floor, waiter performance, and daily restaurant operations"
      />
      <div className="max-w-7xl mx-auto px-6 pt-5 flex justify-end">
        <Link
          to="/admin"
          className="bg-purple-500 hover:bg-purple-600 rounded-2xl px-5 py-3 font-bold text-sm"
        >
          System Admin
        </Link>
      </div>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
          <StatCard
            title="Today Revenue"
            value={`UGX ${Number(summary.today_revenue || 0).toLocaleString()}`}
            note="Closed paid orders"
            accent="text-green-400"
          />
          <StatCard
            title="Orders Today"
            value={summary.orders_today || 0}
            note="All created orders"
          />
          <StatCard
            title="Open Orders"
            value={summary.open_orders || 0}
            note="Still active"
            accent="text-yellow-400"
          />
          <StatCard
            title="Active Tables"
            value={occupiedTables}
            note="Currently occupied"
            accent="text-purple-400"
          />
          <StatCard
            title="Average Ticket"
            value={`UGX ${Number(
              summary.average_ticket || 0
            ).toLocaleString()}`}
            note="Average paid bill"
            accent="text-blue-400"
          />
        </section>

        <section className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-black">Live Floor</h2>
                <p className="text-slate-400 text-sm">
                  Table status and assigned waiters
                </p>
              </div>
              <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full">
                Live
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.tables.map((table) => {
                const isOccupied = Boolean(table.order_status);

                return (
                  <div
                    key={table.id}
                    className={`rounded-2xl p-4 border ${
                      isOccupied
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-[#0D1117] border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-black">{table.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          isOccupied
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-green-500/10 text-green-400"
                        }`}
                      >
                        {isOccupied ? "Occupied" : "Available"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-400 mt-3">
                      Waiter: {table.server_name || "None"}
                    </p>

                    {isOccupied && (
                      <p className="font-black mt-2">
                        UGX {Number(table.total || 0).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-black mb-5">Recent Orders</h2>

            <div className="space-y-3">
              {data.recent_orders.length === 0 ? (
                <p className="text-slate-400">No orders today.</p>
              ) : (
                data.recent_orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))
              )}
            </div>
          </div>
        </section>

        <section className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-black mb-5">Waiter Performance</h2>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.waiters.map((waiter) => (
              <div
                key={waiter.id}
                className="bg-[#0D1117] border border-slate-800 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-lg">{waiter.name}</h3>
                    <p className="text-slate-400 text-sm">Server / Waiter</p>
                  </div>

                  <span className="bg-purple-500/10 text-purple-300 text-xs px-3 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-slate-400 text-sm">Sales</p>
                  <p className="text-2xl font-black text-green-400">
                    UGX {Number(waiter.total_sales || 0).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  <MiniStat label="Paid" value={waiter.paid_orders || 0} />
                  <MiniStat label="Open" value={waiter.open_orders || 0} />
                  <MiniStat label="Tables" value={waiter.tables_served || 0} />
                </div>
              </div>
            ))}
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

function MiniStat({ label, value }) {
  return (
    <div className="bg-[#111827] rounded-xl p-3">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function OrderRow({ order }) {
  return (
    <div className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="font-bold">{order.table_name || "Takeaway"}</p>
        <p className="text-sm text-slate-400">
          {order.order_number} • {order.server_name || "No waiter"}
        </p>
      </div>

      <div className="text-right">
        <p className="font-black">
          UGX {Number(order.total || 0).toLocaleString()}
        </p>
        <span
          className={`text-xs capitalize ${
            order.status === "paid" ? "text-green-400" : "text-yellow-400"
          }`}
        >
          {order.status}
        </span>
      </div>
    </div>
  );
}

export default ManagerDashboardPage;
