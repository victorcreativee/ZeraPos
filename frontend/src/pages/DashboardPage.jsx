import { Link } from "react-router-dom";
import AppHeader from "../components/layout/AppHeader";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("zera_user") || "{}");

  const isAdmin = user.role === "admin";
  const isManager = user.role === "manager";

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="zeraPOS Dashboard"
        subtitle={`${user.name} · ${user.role}`}
      />

      <main className="max-w-7xl mx-auto p-6">
        <section className="grid lg:grid-cols-[1.3fr_0.7fr] gap-6">
          <div className="bg-gradient-to-br from-purple-700 via-purple-900 to-slate-950 border border-purple-500/30 rounded-[2rem] p-8">
            <p className="text-purple-100 font-semibold">Waiter Workspace</p>

            <h2 className="text-4xl font-black mt-2">Fast order management</h2>

            <p className="text-purple-100 mt-3 max-w-xl">
              Create orders, print kitchen/bar tickets, bill customers, and
              close payments quickly.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mt-8">
              <Link
                to="/pos"
                className="bg-white text-slate-950 hover:bg-slate-100 rounded-3xl p-6 block"
              >
                <h3 className="text-2xl font-black">New Order</h3>
                <p className="text-slate-600 mt-2">
                  Start table or takeaway order.
                </p>
              </Link>

              <Link
                to="/orders/open"
                className="bg-slate-950/60 hover:bg-slate-950 border border-white/10 rounded-3xl p-6 block"
              >
                <h3 className="text-2xl font-black">Open Orders</h3>
                <p className="text-slate-300 mt-2">
                  Print tickets, bills, and payments.
                </p>
              </Link>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
              <p className="text-slate-400">My Sales Today</p>
              <h2 className="text-4xl font-black mt-3 text-green-400">UGX 0</h2>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
              <p className="text-slate-400">My Open Orders</p>
              <h2 className="text-4xl font-black mt-3">0</h2>
            </div>
          </div>
        </section>

        {(isAdmin || isManager) && (
          <section className="mt-6 grid md:grid-cols-3 gap-5">
            <Link
              to="/users"
              className="bg-purple-600 hover:bg-purple-700 rounded-3xl p-6 block"
            >
              <h2 className="text-xl font-black">User Management</h2>
              <p className="text-purple-100 mt-2">Manage staff and roles.</p>
            </Link>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-black">Inventory</h2>
              <p className="text-slate-400 mt-2">
                Stock management coming next.
              </p>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
              <h2 className="text-xl font-black">Reports</h2>
              <p className="text-slate-400 mt-2">
                Sales and performance reports coming next.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
