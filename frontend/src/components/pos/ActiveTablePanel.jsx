function ActiveTablePanel({
  selectedTable,
  activeTableBill,
  cartItems,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onSaveOrder,
  onPrintBill,
  savingOrder,
}) {
  const newOrderTotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  const previousUnpaidTotal = Number(activeTableBill?.total || 0);
  const finalTotal = previousUnpaidTotal + newOrderTotal;
  const hasPreviousBill = Number(activeTableBill?.orders?.length || 0) > 0;

  return (
    <aside className="h-full bg-white border border-slate-200 rounded-[28px] shadow-sm flex flex-col overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-white">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 font-black">
          Active Service
        </p>

        <h2 className="text-2xl font-black text-slate-950 mt-1">
          {selectedTable ? selectedTable.name : "Takeaway"}
        </h2>

        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          {selectedTable
            ? "New items and unpaid orders stay under this table until cashier payment."
            : "Quick counter order without table service."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {hasPreviousBill && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-slate-900">Existing unpaid bill</h3>
              <span className="text-sm font-black text-amber-700">
                UGX {previousUnpaidTotal.toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              {activeTableBill.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-900">
                        {order.order_number}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.items?.length || 0} item(s) · {order.status}
                      </p>
                    </div>

                    <p className="font-black text-slate-900">
                      UGX {Number(order.balance || order.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-black text-slate-900">New order</h3>

            {cartItems.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                className="text-sm font-black text-red-500 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="border border-dashed border-slate-300 rounded-3xl p-8 text-center bg-slate-50">
              <p className="font-black text-slate-700">No items yet</p>
              <p className="text-sm text-slate-400 mt-1">
                Tap products to add them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-950 truncate">
                        {item.name}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">
                        UGX {Number(item.price).toLocaleString()} each
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="text-xs font-black text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-black"
                      >
                        −
                      </button>

                      <span className="w-8 text-center font-black text-slate-950">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        className="h-10 w-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-black"
                      >
                        +
                      </button>
                    </div>

                    <p className="font-black text-slate-950">
                      UGX {(Number(item.price) * Number(item.quantity)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Previous unpaid</span>
            <span>UGX {previousUnpaidTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>New order</span>
            <span>UGX {newOrderTotal.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-2xl font-black text-slate-950 pt-3 border-t border-slate-200">
            <span>Total</span>
            <span>UGX {finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveOrder}
          disabled={cartItems.length === 0 || savingOrder}
          className="w-full rounded-2xl bg-slate-950 py-4 text-white font-black text-lg hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {savingOrder ? "Sending order..." : "Send Order"}
        </button>

        <button
          type="button"
          onClick={onPrintBill}
          disabled={!selectedTable || previousUnpaidTotal <= 0}
          className="w-full rounded-2xl bg-emerald-600 py-4 text-white font-black hover:bg-emerald-700 disabled:bg-emerald-200 disabled:cursor-not-allowed"
        >
          Print Combined Bill
        </button>
      </div>
    </aside>
  );
}

export default ActiveTablePanel;
