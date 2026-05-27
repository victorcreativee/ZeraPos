function TableSelector({ tables, selectedTable, onSelectTable }) {
  const allTables = [{ id: null, name: "Takeaway" }, ...tables];

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
          const isOccupied = Number(table.open_orders_count || 0) > 0;

          return (
            <button
              key={table.id || "takeaway"}
              onClick={() => onSelectTable(isTakeaway ? null : table)}
              className={`h-[88px] rounded-2xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : isOccupied
                  ? "bg-amber-50 border-amber-300 text-amber-950"
                  : "bg-white border-slate-200 text-slate-950"
              }`}
            >
              <div className="flex justify-between gap-2">
                <h3 className="font-black text-base leading-tight">
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
                    {isOccupied ? "Occupied" : "Free"}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs font-bold">
                {isTakeaway
                  ? "No table"
                  : isOccupied
                  ? `${table.open_orders_count} orders`
                  : "Ready"}
              </p>

              {isOccupied && (
                <p className="mt-1 text-xs font-black">
                  UGX {Number(table.unpaid_total || 0).toLocaleString()}
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
