import { Link } from "react-router-dom";

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem("zera_user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("zera_token");
    localStorage.removeItem("zera_user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">zeraPOS Dashboard</h1>
            <p className="text-slate-400 mt-1">
              Welcome, {user.name} · Role: {user.role}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-semibold"
          >
            Logout
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
            <p className="text-slate-400">Today Sales</p>
            <h2 className="text-2xl font-bold mt-2">UGX 0</h2>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
            <p className="text-slate-400">Open Orders</p>
            <h2 className="text-2xl font-bold mt-2">0</h2>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
            <p className="text-slate-400">Staff Online</p>
            <h2 className="text-2xl font-bold mt-2">1</h2>
          </div>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5">
            <p className="text-slate-400">Low Stock</p>
            <h2 className="text-2xl font-bold mt-2">0</h2>
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          {user.role === "admin" && (
            <Link
              to="/users"
              className="bg-purple-600 hover:bg-purple-700 rounded-3xl p-6 block"
            >
              <h2 className="text-xl font-bold">User Management</h2>
              <p className="text-purple-100 mt-2 text-sm">
                Create waiters, managers, accountants, and admins.
              </p>
            </Link>
          )}

          <Link
            to="/pos"
            className="bg-[#111827] border border-slate-800 hover:border-green-500 rounded-3xl p-6 block"
          >
            <h2 className="text-xl font-bold">POS Terminal</h2>
            <p className="text-slate-400 mt-2 text-sm">
              Open product grid, tables, cart, and checkout.
            </p>
          </Link>

          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-6">
            <h2 className="text-xl font-bold">Inventory</h2>
            <p className="text-slate-400 mt-2 text-sm">
              Stock management will connect with sales later.
            </p>
          </div>
          <Link
            to="/orders/open"
            className="bg-[#111827] border border-slate-800 hover:border-yellow-500 rounded-3xl p-6 block"
          >
            <h2 className="text-xl font-bold">Open Orders</h2>
            <p className="text-slate-400 mt-2 text-sm">
              View active table and takeaway orders.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
