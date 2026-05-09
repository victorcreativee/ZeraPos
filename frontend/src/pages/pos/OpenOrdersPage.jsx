import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders } from "../../api/ordersApi";

function OpenOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await getOrders();

      const openOrders = (response.data || []).filter(
        (order) => order.status !== "paid" && order.status !== "cancelled"
      );

      setOrders(openOrders);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load open orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <header className="border-b border-slate-800 bg-[#07111c] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Open Orders</h1>
            <p className="text-slate-400 text-sm">
              View active table and takeaway orders
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/pos"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl font-semibold"
            >
              New Order
            </Link>

            <Link
              to="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl font-semibold"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-xl mb-5">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
            Loading open orders...
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-[#111827] border border-slate-800 rounded-3xl p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {order.table_name || "Takeaway"}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {order.order_number}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-300 text-xs uppercase">
                    {order.status}
                  </span>
                </div>

                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Server</span>
                    <span>{order.server_name || "-"}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Type</span>
                    <span className="capitalize">{order.order_type}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Created</span>
                    <span>{order.created_at}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800 mt-5 pt-5 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total</p>
                    <h3 className="text-2xl font-black text-green-400">
                      UGX {Number(order.total).toLocaleString()}
                    </h3>
                  </div>

                  <button className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl font-semibold">
                    Pay
                  </button>
                </div>
              </div>
            ))}

            {orders.length === 0 && (
              <div className="col-span-full bg-[#111827] border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
                No open orders found.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default OpenOrdersPage;
