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

  return (
    <div className="bg-[#111827] border border-slate-800 rounded-3xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold">Current Order</h2>
          <p className="text-slate-400 text-sm">{cartItems.length} items</p>
        </div>

        <button
          onClick={onClear}
          className="text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-2 rounded-xl text-sm"
        >
          Clear
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#0D1117] border border-slate-800 rounded-2xl p-4"
          >
            <div className="flex justify-between gap-3">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-slate-400 text-sm">
                  UGX {Number(item.price).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => onRemove(item.id)}
                className="text-red-400 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onDecrease(item.id)}
                  className="w-9 h-9 rounded-xl bg-slate-800 font-bold"
                >
                  -
                </button>

                <span className="w-8 text-center font-bold">
                  {item.quantity}
                </span>

                <button
                  onClick={() => onIncrease(item.id)}
                  className="w-9 h-9 rounded-xl bg-slate-800 font-bold"
                >
                  +
                </button>
              </div>

              <p className="font-bold text-green-400">
                UGX {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          </div>
        ))}

        {cartItems.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            No items added yet.
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 mt-5 pt-5 space-y-4">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span>UGX {subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-2xl font-black">
          <span>Total</span>
          <span className="text-green-400">
            UGX {subtotal.toLocaleString()}
          </span>
        </div>

        <button
          onClick={onSaveOrder}
          disabled={cartItems.length === 0 || savingOrder}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-2xl py-4 font-bold"
        >
          {savingOrder ? "Saving..." : "Save Order"}
        </button>

        <button
          disabled={cartItems.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-2xl py-4 font-bold"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
}

export default CartPanel;
