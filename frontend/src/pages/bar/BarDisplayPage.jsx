import { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import { getBarQueue, updateOrderItemStatus } from "../../api/ordersApi";
import { isBarScreenEnabled } from "../../utils/businessSettings";

function BarDisplayPage() {
  const barScreenEnabled = isBarScreenEnabled();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const previousCountRef = useRef(0);

  async function loadQueue(silent = false) {
    try {
      if (!silent) setLoading(true);
      setError("");

      const response = await getBarQueue();
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
          "Failed to load bar queue"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!barScreenEnabled) {
      setLoading(false);
      return;
    }

    loadQueue();

    const interval = setInterval(() => {
      loadQueue(true);
    }, 3000);

    return () => clearInterval(interval);
  }, [barScreenEnabled]);

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

      oscillator.frequency.value = 740;
      gainNode.gain.value = 0.04;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch {}
  }

  if (!barScreenEnabled) {
    return <DisabledScreen type="Bar" />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title="Bar Production"
        subtitle="Drink orders waiting for preparation"
        showBackToDashboard={true}
      />

      <main className="mx-auto max-w-[1600px] p-5 space-y-5">
        {error && <ErrorBox message={error} />}

        <section className="grid md:grid-cols-4 gap-3">
          <StatusCard label="Total Items" value={stats.total} />
          <StatusCard label="Pending" value={stats.pending} />
          <StatusCard label="Preparing" value={stats.preparing} />
          <StatusCard label="Ready" value={stats.ready} />
        </section>

        {loading ? (
          <EmptyState text="Loading bar queue..." />
        ) : items.length === 0 ? (
          <EmptyState text="No bar items waiting." />
        ) : (
          <section className="grid xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {Object.values(groupedOrders).map((order) => (
              <OrderTicket
                key={order.order_id}
                order={order}
                updatingId={updatingId}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

function OrderTicket({ order, updatingId, onStatusUpdate }) {
  return (
    <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-3">
        <div>
          <p className="text-xs font-black uppercase text-slate-400">
            Bar Ticket
          </p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">
            {order.table_name}
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            {order.order_number} • {formatTime(order.created_at)}
          </p>
        </div>

        <span className="bg-blue-100 px-3 py-2 text-sm font-black text-blue-700">
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {order.items.map((item) => (
          <div key={item.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-950">
                  {item.product_name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Qty:{" "}
                  <span className="font-black text-slate-950">
                    {item.quantity}
                  </span>
                </p>
              </div>

              <StatusBadge status={item.status} />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <ActionButton
                label="Preparing"
                disabled={updatingId === item.id || item.status === "preparing"}
                onClick={() => onStatusUpdate(item, "preparing")}
              />

              <ActionButton
                label="Ready"
                disabled={updatingId === item.id || item.status === "ready"}
                onClick={() => onStatusUpdate(item, "ready")}
              />

              <ActionButton
                label="Served"
                disabled={updatingId === item.id}
                onClick={() => onStatusUpdate(item, "served")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusCard({ label, value }) {
  return (
    <div className="border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <h2 className="mt-2 text-3xl font-black text-slate-950">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className="bg-slate-100 px-3 py-1 text-xs font-black uppercase text-slate-700">
      {status}
    </span>
  );
}

function EmptyState({ text }) {
  return (
    <div className="border border-slate-200 bg-white p-8 text-sm font-black text-slate-400 shadow-sm">
      {text}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-black text-red-700">
      {message}
    </div>
  );
}

function DisabledScreen({ type }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <AppHeader
        title={`${type} Screen Disabled`}
        subtitle={`This business is currently not using the ${type.toLowerCase()} display screen.`}
        showBackToDashboard={true}
      />

      <main className="p-6">
        <div className="max-w-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-black">{type} screen is not active</h2>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            Enable it in Settings only if this restaurant has a separate{" "}
            {type.toLowerCase()} display device.
          </p>
        </div>
      </main>
    </div>
  );
}

function ActionButton({ label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-slate-950 px-3 py-3 text-sm font-black text-white disabled:opacity-40"
    >
      {label}
    </button>
  );
}

function formatTime(value) {
  if (!value) return "Now";

  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default BarDisplayPage;
