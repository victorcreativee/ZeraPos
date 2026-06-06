import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import { getMyOrdersHistory } from "../../api/reportsApi";

function getYesterdayDate() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function MyOrdersHistoryPage() {
  const [selectedDate, setSelectedDate] = useState(getYesterdayDate());
  const [history, setHistory] = useState({
    total_sales: 0,
    total_orders: 0,
    paid_orders: 0,
    orders: [],
  });

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await getMyOrdersHistory(selectedDate);
        setHistory(response.data);
      } catch (error) {
        console.log("Failed to load order history", error);
      }
    }

    loadHistory();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-[#07111c] text-white">
      <AppHeader
        title="My Order History"
        subtitle="Previous day and past shift orders"
      />

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link to="/pos" className="text-slate-300 hover:text-white">
            ← Back to POS
          </Link>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#111827] border border-slate-700 rounded-2xl px-4 py-3 text-white"
          />
        </div>

        <section className="grid md:grid-cols-3 gap-5">
          <StatCard
            title="Total Sales"
            value={`UGX ${Number(history.total_sales || 0).toLocaleString()}`}
          />
          <StatCard title="Total Orders" value={history.total_orders || 0} />
          <StatCard title="Paid Orders" value={history.paid_orders || 0} />
        </section>

        <section className="mt-6 bg-[#111827] border border-slate-800 rounded-3xl p-6">
          <h2 className="text-xl font-black mb-5">Orders</h2>

          <div className="space-y-3">
            {history.orders?.length === 0 ? (
              <p className="text-slate-400">No orders found for this date.</p>
            ) : (
              history.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
                >
                  <div>
                    <p className="font-bold">
                      {order.table_name || "Takeaway"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {order.order_number}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-black">
                      UGX {Number(order.total || 0).toLocaleString()}
                    </p>
                    <span
                      className={`text-xs capitalize ${
                        order.status === "paid"
                          ? "text-green-400"
                          : order.status === "cancelled"
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-7">
      <p className="text-slate-400 text-lg">{title}</p>
      <h2 className="text-4xl font-black mt-3">{value}</h2>
    </div>
  );
}

export default MyOrdersHistoryPage;
