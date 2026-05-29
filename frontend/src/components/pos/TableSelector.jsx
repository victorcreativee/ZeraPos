function TableSelector({ tables, selectedTable, onSelectTable }) {
  const allTables = [
    { id: null, name: "Takeaway", status: "available" },
    ...tables,
  ];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
          Tables
        </p>

        <p className="text-xs font-bold text-slate-400">
          {tables.length} tables
        </p>
      </div>

      <div className="grid grid-cols-6 gap-3 max-h-[205px] overflow-y-auto pr-1">
        {allTables.map((table) => {
          const isTakeaway = table.id === null;

          const isSelected =
            selectedTable?.id === table.id || (!selectedTable && isTakeaway);

          const openOrdersCount = Number(table.open_orders_count || 0);
          const unpaidTotal = Number(table.unpaid_total || 0);

          const isOccupied =
            openOrdersCount > 0 ||
            unpaidTotal > 0 ||
            table.status === "occupied";

          const hasLargeBill = unpaidTotal >= 100000;
          const isBusy = openOrdersCount >= 3;

          return (
            <button
              key={table.id || "takeaway"}
              onClick={() => onSelectTable(isTakeaway ? null : table)}
              className={`h-[88px] rounded-2xl border px-4 py-3 text-left transition active:scale-[0.98] ${
                isSelected
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : hasLargeBill
                  ? "bg-red-50 border-red-300 text-red-950"
                  : isBusy
                  ? "bg-orange-50 border-orange-300 text-orange-950"
                  : isOccupied
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-white border-slate-200 text-slate-950 hover:border-emerald-300"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-black text-base leading-tight truncate">
                  {table.name}
                </h3>

                {!isTakeaway && (
                  <span
                    className={`h-fit rounded-full px-2 py-1 text-[9px] font-black uppercase ${
                      isOccupied
                        ? "bg-amber-400 text-slate-950"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {hasLargeBill
                      ? "High Bill"
                      : isBusy
                      ? "Busy"
                      : isOccupied
                      ? "Occupied"
                      : "Free"}
                  </span>
                )}
              </div>

              <p
                className={`mt-2 text-xs font-bold ${
                  isSelected ? "text-white/90" : "text-slate-600"
                }`}
              >
                {isTakeaway
                  ? "Walk-in order"
                  : isOccupied
                  ? `${openOrdersCount} open order${
                      openOrdersCount === 1 ? "" : "s"
                    }`
                  : "Ready"}
              </p>

              {isOccupied && (
                <p
                  className={`mt-1 text-xs font-black ${
                    isSelected ? "text-white" : "text-amber-800"
                  }`}
                >
                  UGX {unpaidTotal.toLocaleString()}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TableSelector;
