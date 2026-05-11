import { useEffect, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";

import { getKitchenQueue, updateOrderItemStatus } from "../../api/ordersApi";

function KitchenDisplayPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadQueue() {
    try {
      setError("");

      const response = await getKitchenQueue();

      console.log("Kitchen Queue Response:", response);

      setItems(response?.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load kitchen queue"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue();

    const interval = setInterval(() => {
      loadQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function handleStatusUpdate(item, status) {
    try {
      await updateOrderItemStatus(item.order_id, item.id, status);

      await loadQueue();
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.message || "Failed to update item status");
    }
  }

  function getStatusColor(status) {
    if (status === "pending") {
      return "border-yellow-500";
    }

    if (status === "preparing") {
      return "border-blue-500";
    }

    if (status === "ready") {
      return "border-green-500";
    }

    return "border-slate-700";
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="Kitchen Display"
        subtitle="Kitchen preparation queue"
        showBackToDashboard={true}
      />

      <main className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-5 bg-red-500/10 border border-red-500 text-red-300 rounded-2xl px-4 py-3">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
            Loading kitchen queue...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
            No kitchen items waiting.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {items.map((item) => (
              <div
                key={item.id}
                className={`bg-[#111827] border-2 ${getStatusColor(
                  item.status
                )} rounded-3xl p-5 shadow-xl`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      {item.table_name || "Takeaway"}
                    </h2>

                    <p className="text-slate-400 text-sm mt-1">
                      {item.order_number}
                    </p>
                  </div>

                  <span className="uppercase text-xs bg-slate-900 border border-slate-700 px-3 py-1 rounded-full">
                    {item.status}
                  </span>
                </div>

                <div className="mt-6">
                  <h3 className="text-2xl font-bold">{item.product_name}</h3>

                  <p className="text-slate-400 mt-2">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                  <button
                    onClick={() => handleStatusUpdate(item, "preparing")}
                    className="bg-blue-600 hover:bg-blue-700 rounded-xl py-2 text-sm font-medium"
                  >
                    Preparing
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(item, "ready")}
                    className="bg-green-600 hover:bg-green-700 rounded-xl py-2 text-sm font-medium"
                  >
                    Ready
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(item, "served")}
                    className="bg-purple-600 hover:bg-purple-700 rounded-xl py-2 text-sm font-medium"
                  >
                    Served
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default KitchenDisplayPage;
