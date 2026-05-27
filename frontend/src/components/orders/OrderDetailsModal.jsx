function OrderDetailsModal({ order, onClose, onReprint, loading }) {
  if (!order && !loading) return null;

  if (loading && !order) {
    return (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 font-black text-slate-700">
          Loading order...
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide font-black text-slate-400">
              Order Details
            </p>
            <h2 className="text-2xl font-black text-slate-950">
              {order.order_number}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 font-black"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase font-black text-slate-400">
                Table
              </p>
              <p className="font-black text-slate-950">
                {order.table_name || "Takeaway"}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase font-black text-slate-400">
                Status
              </p>
              <p className="font-black text-slate-950">
                {order.payment_status || "pending"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3 text-xs uppercase text-slate-400">
                    Item
                  </th>
                  <th className="text-left p-3 text-xs uppercase text-slate-400">
                    Qty
                  </th>
                  <th className="text-right p-3 text-xs uppercase text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {(order.items || []).map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="p-3 font-bold text-slate-900">
                      {item.product_name || item.name}
                    </td>
                    <td className="p-3 font-bold text-slate-600">
                      {item.quantity}
                    </td>
                    <td className="p-3 text-right font-black text-slate-950">
                      UGX{" "}
                      {Number(
                        item.line_total ||
                          item.total ||
                          item.price * item.quantity ||
                          0
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <p className="text-xl font-black text-slate-950">Total</p>
            <p className="text-2xl font-black text-emerald-600">
              UGX {Number(order.total || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-100 font-black"
          >
            Close
          </button>

          <button
            onClick={() => onReprint(order)}
            className="px-5 py-3 rounded-xl bg-slate-950 text-white font-black"
          >
            Reprint Bill
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsModal;
