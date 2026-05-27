import { useEffect, useMemo, useState } from "react";
import AppHeader from "../../components/layout/AppHeader";
import { getOrders, getOrderById } from "../../api/ordersApi";
import OrderDetailsModal from "../../components/orders/OrderDetailsModal";
import { printReceiptWindow } from "../../utils/printReceipt";

function PreviousOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await getOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  function handleReprintOrder(order) {
    const html = `
      <div style="font-family: Arial; padding: 20px;">
        <h2>${order.order_number}</h2>
        <p>${order.table_name || "Takeaway"}</p>
        <hr />
        <h3>Total: UGX ${Number(order.total || 0).toLocaleString()}</h3>
      </div>
    `;

    printReceiptWindow(`${order.order_number} Bill`, html);
  }
  async function handleOpenOrder(order) {
    try {
      setSelectedOrder(order);
      setLoadingOrder(true);

      const response = await getOrderById(order.id);

      const fullOrder = response?.data || response;

      setSelectedOrder({
        ...order,
        ...fullOrder,
      });
    } catch (error) {
      console.error(error);
      setSelectedOrder(order);
    } finally {
      setLoadingOrder(false);
    }
  }
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        order.order_number?.toLowerCase().includes(keyword) ||
        order.table_name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" ? true : order.payment_status === statusFilter;

      const orderDate = order.created_at
        ? new Date(order.created_at).toISOString().slice(0, 10)
        : "";

      const matchesDate = dateFilter ? orderDate === dateFilter : true;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const totalSales = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const paidOrders = filteredOrders.filter(
    (order) => order.payment_status === "paid"
  ).length;

  const unpaidOrders = filteredOrders.filter(
    (order) => order.payment_status !== "paid"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100">
      <AppHeader title="Previous Orders" showBackToDashboard={true} />

      <main className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase font-black text-slate-400">
              Total Orders
            </p>
            <p className="text-3xl font-black text-slate-950">
              {filteredOrders.length}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase font-black text-slate-400">
              Total Sales
            </p>
            <p className="text-3xl font-black text-emerald-600">
              UGX {totalSales.toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase font-black text-slate-400">
              Paid Orders
            </p>
            <p className="text-3xl font-black text-blue-600">{paidOrders}</p>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 p-5 shadow-sm">
            <p className="text-xs uppercase font-black text-slate-400">
              Unpaid Orders
            </p>
            <p className="text-3xl font-black text-amber-600">{unpaidOrders}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between mb-5">
            <div>
              <h1 className="text-2xl font-black text-slate-950">
                Orders History
              </h1>
              <p className="text-slate-500 font-medium">
                Search, filter, view, and reprint previous orders.
              </p>
            </div>

            <button
              onClick={loadOrders}
              className="h-11 px-5 rounded-xl bg-slate-950 text-white text-sm font-black"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order or table..."
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none"
            >
              <option value="all">All Orders</option>
              <option value="paid">Paid Only</option>
              <option value="pending">Unpaid Only</option>
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold outline-none"
            />

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDateFilter("");
              }}
              className="h-11 px-4 rounded-xl bg-slate-100 text-slate-900 text-sm font-black"
            >
              Clear Filters
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center font-bold text-slate-500">
              Loading orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center font-bold text-slate-400">
              No orders found.
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Order
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Table
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Items
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Total
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Status
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Time
                    </th>
                    <th className="py-3 px-3 text-xs uppercase text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="py-4 px-3">
                        <p className="font-black text-slate-950">
                          {order.order_number}
                        </p>
                      </td>

                      <td className="py-4 px-3 font-semibold text-slate-700">
                        {order.table_name || "Takeaway"}
                      </td>

                      <td className="py-4 px-3 font-semibold text-slate-700">
                        {order.items_count || order.items?.length || 0}
                      </td>

                      <td className="py-4 px-3 font-black text-emerald-600">
                        UGX {Number(order.total || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            order.payment_status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.payment_status || "pending"}
                        </span>
                      </td>

                      <td className="py-4 px-3 font-medium text-slate-500">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "-"}
                      </td>

                      <td className="py-4 px-3">
                        <button
                          onClick={() => handleOpenOrder(order)}
                          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <OrderDetailsModal
        order={selectedOrder}
        loading={loadingOrder}
        onClose={() => setSelectedOrder(null)}
        onReprint={handleReprintOrder}
      />
    </div>
  );
}

export default PreviousOrdersPage;
