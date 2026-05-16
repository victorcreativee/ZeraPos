import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { useEffect, useState } from "react";
import { getMyDashboardStats } from "../api/reportsApi";
import { getAuthUser } from "../utils/authSession";

function DashboardPage() {
  const user = getAuthUser();

  const [stats, setStats] = useState({
    my_sales_today: 0,
    my_paid_orders_today: 0,
    my_open_orders: 0,
    my_tables_served_today: 0,
    tables_served: [],
    recent_orders: [],
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await getMyDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.log("Failed to load dashboard stats", error);
      }
    }

    loadStats();
  }, []);

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";
  const isServer = user.role === "server";

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title={
          isServer
            ? "My Waiter Dashboard"
            : isManager
            ? "Manager Dashboard"
            : "Dashboard"
        }
        subtitle={`Welcome back, ${user.name || "User"}`}
      />

      <main className="max-w-7xl mx-auto p-6">
        <section className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-950 to-[#0D1117] border border-purple-500/30 rounded-[2rem] p-8">
            <p className="text-purple-200 font-bold">
              {isServer ? "Your shift workspace" : "ZERA POS workspace"}
            </p>

            <h2 className="text-4xl font-black mt-3">
              {isServer
                ? "Track your tables, orders, and sales"
                : "Fast order management"}
            </h2>

            <p className="text-slate-200 mt-4 max-w-xl text-lg">
              Create orders, serve tables, print bills, and close payments
              quickly.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Link
                to="/pos"
                className="bg-white text-slate-950 hover:bg-slate-100 rounded-3xl p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black">New Order</h3>
                  <p className="text-slate-600 mt-2">
                    Start table or takeaway order
                  </p>
                </div>
                <span className="text-3xl">›</span>
              </Link>

              <Link
                to="/orders/open"
                className="bg-[#0D1117]/70 hover:bg-[#0D1117] border border-white/10 rounded-3xl p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black">Open Orders</h3>
                  <p className="text-slate-300 mt-2">View your active tables</p>
                </div>

                <span className="text-3xl">›</span>
              </Link>
              <Link
                to="/orders/history"
                className="bg-[#0D1117]/70 hover:bg-[#0D1117] border border-white/10 rounded-3xl p-6 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-2xl font-black">Previous Orders</h3>
                  <p className="text-slate-300 mt-2">
                    View yesterday or past shift orders
                  </p>
                </div>
                <span className="text-3xl">›</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <StatCard
              title="My Sales Today"
              value={`UGX ${Number(
                stats.my_sales_today || 0
              ).toLocaleString()}`}
              note="Paid orders closed today"
              accent="text-green-400"
            />

            <StatCard
              title="Tables Served Today"
              value={stats.my_tables_served_today || 0}
              note="Tables assigned to you today"
            />
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-5 mt-6">
          <StatCard
            title="My Open Orders"
            value={stats.my_open_orders || 0}
            note="Orders still active"
          />

          <StatCard
            title="Paid Orders Today"
            value={stats.my_paid_orders_today || 0}
            note="Completed payments"
            accent="text-blue-400"
          />

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <p className="text-slate-400">Role</p>
            <h2 className="text-3xl font-black mt-3 capitalize">{user.role}</h2>
            <p className="text-slate-500 mt-2">Logged-in staff account</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Tables I Served Today</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Paid and completed tables from this shift
                </p>
              </div>

              <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-sm font-black">
                {stats.tables_served?.length || 0}
              </span>
            </div>

            <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
              {stats.tables_served?.length === 0 ? (
                <p className="text-slate-400 p-3">
                  No tables served yet today.
                </p>
              ) : (
                stats.tables_served.map((table) => (
                  <div
                    key={`${table.order_id}-${table.id}`}
                    className="flex items-center justify-between bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
                  >
                    <div className="min-w-0">
                      <p className="font-black truncate">{table.name}</p>
                      <p className="text-sm text-slate-400">
                        Order #{table.order_id}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-black">
                        UGX {Number(table.total || 0).toLocaleString()}
                      </p>
                      <span className="text-xs text-slate-400 capitalize">
                        {table.order_status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">
                  Payment Proof & Recent Orders
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Confirm cashier payment status without scrolling the whole
                  dashboard.
                </p>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl font-bold"
              >
                Refresh
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[460px] overflow-y-auto">
              {stats.recent_orders?.length === 0 ? (
                <p className="text-slate-400 p-3">No recent orders found.</p>
              ) : (
                stats.recent_orders.map((order) => {
                  const isPaid = order.status === "paid";
                  const isDelayed =
                    !isPaid && Number(order.waiting_minutes || 0) > 20;

                  return (
                    <div
                      key={order.id}
                      className={`border rounded-2xl p-4 ${
                        isPaid
                          ? "bg-green-500/10 border-green-500/30"
                          : isDelayed
                          ? "bg-red-500/10 border-red-500/30"
                          : "bg-yellow-500/10 border-yellow-500/30"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-black text-lg truncate">
                            {order.table_name || "Takeaway"}
                          </p>
                          <p className="text-sm text-slate-300">
                            {order.order_number}
                          </p>

                          {!isPaid && (
                            <p
                              className={`text-sm mt-2 font-bold ${
                                isDelayed ? "text-red-400" : "text-yellow-300"
                              }`}
                            >
                              Waiting • {Number(order.waiting_minutes || 0)} min
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="font-black">
                            UGX {Number(order.total || 0).toLocaleString()}
                          </p>

                          <span
                            className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                              isPaid
                                ? "bg-green-500 text-white"
                                : isDelayed
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-black"
                            }`}
                          >
                            {isPaid
                              ? "Paid"
                              : isDelayed
                              ? "Delayed"
                              : "Awaiting"}
                          </span>
                        </div>
                      </div>

                      {isPaid && (
                        <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
                          <ProofLine
                            label="Method"
                            value={order.payment_method || "Recorded"}
                          />

                          <ProofLine
                            label="Cashier"
                            value={order.cashier_name || "Cashier recorded"}
                          />

                          <ProofLine
                            label="Amount"
                            value={`UGX ${Number(
                              order.payment_amount || order.total || 0
                            ).toLocaleString()}`}
                          />

                          <ProofLine
                            label="Paid At"
                            value={
                              order.payment_time
                                ? new Date(order.payment_time).toLocaleString()
                                : "Paid"
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {(isAdmin || isManager) && (
          <section className="mt-6 grid md:grid-cols-3 gap-5">
            <Link
              to="/counter"
              className="bg-[#111827] border border-slate-800 hover:border-green-500 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-black">Counter / Cashier</h2>
                <p className="text-slate-400 mt-2">
                  Receive payments and close bills
                </p>
              </div>
              <span className="text-3xl text-green-400">›</span>
            </Link>
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, note, accent = "text-white" }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-7">
      <p className="text-slate-400 text-lg">{title}</p>
      <h2 className={`text-4xl font-black mt-3 ${accent}`}>{value}</h2>
      <p className="text-slate-500 mt-2">{note}</p>
    </div>
  );
}
function ProofLine({ label, value }) {
  return (
    <div className="bg-black/20 border border-white/10 rounded-xl p-3">
      <p className="text-slate-400 text-xs">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

export default DashboardPage;
