function WaiterSummaryBar({
  todaySales = 0,
  tablesServed = 0,
  openOrders = 0,
  onOpenPreviousOrders,
}) {
  return (
    <div className="h-[72px] rounded-[24px] border border-slate-200 bg-white px-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-14">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl">
            ↗
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Sales Today</p>
            <p className="text-xl font-black text-emerald-600">
              UGX {Number(todaySales).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-2xl">
            ▣
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">
              Tables Served
            </p>
            <p className="text-xl font-black text-orange-500">{tablesServed}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 text-2xl">
            ◷
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Open Orders</p>
            <p className="text-xl font-black text-blue-600">{openOrders}</p>
          </div>
        </div>
      </div>

      <button
        onClick={onOpenPreviousOrders}
        className="h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-950 font-black"
      >
        Previous Orders
      </button>
    </div>
  );
}

export default WaiterSummaryBar;
