function CartPanel({
  cartItems,
  onIncrease,
  onDecrease,
  onRemove,
  onClear,
  onSaveOrder,
  savingOrder,
}) {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Waiter Order
            </p>
            <h2 className="text-xl font-black text-white">Current Bill</h2>
          </div>

          <button
            onClick={onClear}
            disabled={cartItems.length === 0}
            className="text-red-300 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 px-3 py-2 rounded-xl text-sm font-bold"
          >
            Clear
          </button>
        </div>

        <p className="text-slate-400 text-sm mt-2">
          {totalQuantity} item{totalQuantity !== 1 ? "s" : ""} added
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cartItems.length === 0 && (
          <div className="h-full flex items-center justify-center text-center text-slate-500">
            <div>
              <p className="text-lg font-black">No items yet</p>
              <p className="text-sm mt-1">Tap products to build the order.</p>
            </div>
          </div>
        )}

        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
          >
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-black text-white truncate">{item.name}</h3>
                <p className="text-slate-400 text-sm">
                  UGX {Number(item.price).toLocaleString()} each
                </p>
              </div>

              <button
                onClick={() => onRemove(item.id)}
                className="text-red-400 hover:text-red-300 text-sm shrink-0"
              >
                Remove
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-lg"
                >
                  -
                </button>

                <span className="w-10 text-center font-black text-lg">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onIncrease(item.id)}
                  className="w-11 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 font-black text-lg"
                >
                  +
                </button>
              </div>

              <p className="font-black text-green-400 shrink-0">
                UGX {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800 p-4 space-y-4">
        <div className="bg-[#0D1117] rounded-2xl p-4 space-y-3">
          <div className="flex justify-between text-slate-300">
            <span>Subtotal</span>
            <span>UGX {subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-2xl font-black text-white">
            <span>Total</span>
            <span className="text-green-400">
              UGX {subtotal.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onSaveOrder}
          disabled={cartItems.length === 0 || savingOrder}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl py-4 font-black text-lg"
        >
          {savingOrder ? "Sending..." : "Send Bill to Counter"}
        </button>

        <p className="text-xs text-slate-500 text-center">
          Cashier confirms payment after customer pays.
        </p>
      </div>
    </div>
  );
}

export default CartPanel;
