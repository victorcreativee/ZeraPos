import { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import { getKitchenQueue, updateOrderItemStatus } from "../../api/ordersApi";
import { isKitchenScreenEnabled } from "../../utils/businessSettings";

function KitchenDisplayPage() {
  const kitchenScreenEnabled = isKitchenScreenEnabled();

  if (!kitchenScreenEnabled) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-950">
        <AppHeader
          title="Kitchen Screen Disabled"
          subtitle="This business is currently using paper kitchen tickets instead of a kitchen screen."
          showBackToDashboard={true}
        />

        <main className="p-6">
          <div className="max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black">
              Kitchen screen is not active
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-500">
              Enable Kitchen Screen in Settings if this restaurant has a kitchen
              display device.
            </p>
          </div>
        </main>
      </div>
    );
  }
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const previousCountRef = useRef(0);

  async function loadQueue(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");

      const response = await getKitchenQueue();
      const nextItems = response?.data || [];

      if (
        previousCountRef.current > 0 &&
        nextItems.length > previousCountRef.current
      ) {
        playAlertSound();
      }

      previousCountRef.current = nextItems.length;
      setItems(nextItems);
    } catch (err) {
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
      loadQueue(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      pending: items.filter((item) => item.status === "pending").length,
      preparing: items.filter((item) => item.status === "preparing").length,
      ready: items.filter((item) => item.status === "ready").length,
      total: items.length,
    };
  }, [items]);

  const groupedOrders = useMemo(() => {
    return items.reduce((acc, item) => {
      const key = item.order_id;

      if (!acc[key]) {
        acc[key] = {
          order_id: item.order_id,
          order_number: item.order_number,
          table_name: item.table_name || "Takeaway",
          order_type: item.order_type,
          created_at: item.created_at,
          items: [],
        };
      }

      acc[key].items.push(item);
      return acc;
    }, {});
  }, [items]);

  async function handleStatusUpdate(item, status) {
    try {
      setUpdatingId(item.id);
      await updateOrderItemStatus(item.order_id, item.id, status);
      await loadQueue(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update item status");
    } finally {
      setUpdatingId(null);
    }
  }

  function playAlertSound() {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.04;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {
      // Browser may block sound until user interacts. This is okay.
    }
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white">
      <AppHeader
        title="Kitchen Display"
        subtitle="Food preparation queue"
        showBackToDashboard={true}
      />

      <main className="p-6 max-w-[1800px] mx-auto space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 rounded-2xl px-5 py-4">
            {error}
          </div>
        )}

        <section className="grid md:grid-cols-4 gap-4">
          <StatusCard label="Total Tickets" value={stats.total} />
          <StatusCard label="Pending" value={stats.pending} tone="yellow" />
          <StatusCard label="Preparing" value={stats.preparing} tone="blue" />
          <StatusCard label="Ready" value={stats.ready} tone="green" />
        </section>

        {loading ? (
          <EmptyState text="Loading kitchen queue..." />
        ) : items.length === 0 ? (
          <EmptyState text="No kitchen items waiting." />
        ) : (
          <section className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-5">
            {Object.values(groupedOrders).map((order) => (
              <OrderTicket
                key={order.order_id}
                order={order}
                updatingId={updatingId}
                onStatusUpdate={handleStatusUpdate}
                station="kitchen"
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function OrderTicket({ order, updatingId, onStatusUpdate, station }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400 uppercase font-bold">
            {station} ticket
          </p>
          <h2 className="text-2xl font-black mt-1">{order.table_name}</h2>
          <p className="text-slate-400 mt-1">
            {order.order_number} • {formatTime(order.created_at)}
          </p>
        </div>

        <span className="bg-orange-500/10 text-orange-300 border border-orange-500/30 px-4 py-2 rounded-2xl font-black">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="p-5 space-y-4">
        {order.items.map((item) => (
          <div
            key={item.id}
            className={`rounded-3xl border p-4 ${getItemStatusStyle(
              item.status
            )}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-black">{item.product_name}</h3>
                <p className="text-slate-400 text-lg mt-1">
                  Quantity:{" "}
                  <span className="font-black text-white">{item.quantity}</span>
                </p>
              </div>

              <span className="uppercase text-xs bg-black/20 border border-white/10 px-3 py-1 rounded-full font-black">
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              <ActionButton
                label="Preparing"
                disabled={updatingId === item.id || item.status === "preparing"}
                onClick={() => onStatusUpdate(item, "preparing")}
                className="bg-blue-600 hover:bg-blue-700"
              />

              <ActionButton
                label="Ready"
                disabled={updatingId === item.id || item.status === "ready"}
                onClick={() => onStatusUpdate(item, "ready")}
                className="bg-green-600 hover:bg-green-700"
              />

              <ActionButton
                label="Served"
                disabled={updatingId === item.id}
                onClick={() => onStatusUpdate(item, "served")}
                className="bg-purple-600 hover:bg-purple-700"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({ label, value, tone = "slate" }) {
  const styles = {
    slate: "border-slate-800 bg-[#111827] text-white",
    yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    blue: "border-blue-500/30 bg-blue-500/10 text-blue-300",
    green: "border-green-500/30 bg-green-500/10 text-green-300",
  };

  return (
    <div className={`rounded-3xl border p-5 ${styles[tone]}`}>
      <p className="text-sm opacity-80">{label}</p>
      <h2 className="text-4xl font-black mt-2">{value}</h2>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 text-slate-400">
      {text}
    </div>
  );
}

function ActionButton({ label, onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${className} disabled:opacity-40 rounded-2xl py-4 font-black`}
    >
      {label}
    </button>
  );
}

function getItemStatusStyle(status) {
  if (status === "pending") {
    return "bg-yellow-500/10 border-yellow-500/30";
  }

  if (status === "preparing") {
    return "bg-blue-500/10 border-blue-500/30";
  }

  if (status === "ready") {
    return "bg-green-500/10 border-green-500/30";
  }

  return "bg-[#0D1117] border-slate-800";
}

function formatTime(value) {
  if (!value) return "Now";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default KitchenDisplayPage;
