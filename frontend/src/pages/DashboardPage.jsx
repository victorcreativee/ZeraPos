import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";
import { useEffect, useState } from "react";
import { getMyDashboardStats } from "../api/reportsApi";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("zera_user") || "{}");

  const [stats, setStats] = useState({
    my_sales_today: 0,
    my_open_orders: 0,
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

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader title="Dashboard" subtitle="Waiter workspace" />

      <main className="max-w-7xl mx-auto p-6">
        <section className="grid lg:grid-cols-[1.45fr_1fr] gap-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-950 to-[#0D1117] border border-purple-500/30 rounded-[2rem] p-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-purple-400/20" />
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-purple-400/20" />

            <p className="text-purple-200 font-bold">
              Welcome back, {user.name}
            </p>

            <h2 className="text-4xl font-black mt-3">Fast order management</h2>

            <p className="text-slate-200 mt-4 max-w-xl text-lg">
              Create orders, print kitchen/bar tickets, bill customers, and
              close payments quickly.
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
                  <p className="text-slate-300 mt-2">
                    Print tickets, bills, and payments
                  </p>
                </div>
                <span className="text-3xl">›</span>
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-7">
              <p className="text-slate-400 text-lg">My Sales Today</p>
              <h2 className="text-4xl font-black mt-3 text-green-400">
                UGX {Number(stats.my_sales_today || 0).toLocaleString()}
              </h2>
              <p className="text-slate-500 mt-2">Total sales for today</p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-7">
              <p className="text-slate-400 text-lg">My Open Orders</p>
              <h2 className="text-4xl font-black mt-3">
                {stats.my_open_orders || 0}
              </h2>
              <p className="text-slate-500 mt-2">
                Open orders waiting to be completed
              </p>
            </div>
          </div>
        </section>

        {(isAdmin || isManager) && (
          <section className="mt-6 grid md:grid-cols-3 gap-5">
            <Link
              to="/users"
              className="bg-[#111827] border border-slate-800 hover:border-purple-500 rounded-3xl p-6 flex items-center justify-between"
            >
              <div>
                <h2 className="text-xl font-black">User Management</h2>
                <p className="text-slate-400 mt-2">Manage staff and roles</p>
              </div>
              <span className="text-3xl text-slate-400">›</span>
            </Link>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Inventory</h2>
                <p className="text-slate-400 mt-2">
                  Stock management coming next
                </p>
              </div>
              <span className="text-3xl text-slate-400">›</span>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">Reports</h2>
                <p className="text-slate-400 mt-2">
                  Sales and performance reports coming next
                </p>
              </div>
              <span className="text-3xl text-slate-400">›</span>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
