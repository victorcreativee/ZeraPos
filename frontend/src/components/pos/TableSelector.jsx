function TableSelector({ tables, selectedTable, onSelectTable }) {
  function getTableStyle(table) {
    const isSelected = selectedTable?.id === table.id;
    const isOccupied = table.status === "occupied";
    const hasOpenBalance = Number(table.open_balance || 0) > 0;

    if (isSelected) {
      return "bg-green-600 text-white border-green-400";
    }

    if (isOccupied || hasOpenBalance) {
      return "bg-yellow-500/10 text-yellow-200 border-yellow-500/40 hover:border-yellow-400";
    }

    return "bg-[#0D1117] text-slate-300 border-slate-800 hover:border-green-500";
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Tables
          </p>
          {/* <h2 className="text-xl font-black">Select Service Point</h2> */}
        </div>

        <span className="text-xs text-slate-400">{tables.length} tables</span>
      </div>

      <div className="grid grid-flow-col auto-cols-[160px] grid-rows-2 gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => onSelectTable(null)}
          className={`w-[160px] px-4 py-3 rounded-2xl font-black border text-left ${
            selectedTable === null
              ? "bg-green-600 text-white border-green-400"
              : "bg-[#0D1117] text-slate-300 border-slate-800 hover:border-green-500"
          }`}
        >
          <span className="block text-base">Takeaway</span>
          <span className="block text-xs opacity-70 mt-1">No table</span>
        </button>

        {tables.map((table) => {
          const isOccupied =
            table.status === "occupied" || Number(table.open_balance || 0) > 0;

          return (
            <button
              key={table.id}
              onClick={() => onSelectTable(table)}
              className={`w-[160px] px-4 py-3 rounded-2xl font-black border text-left transition ${getTableStyle(
                table
              )}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm truncate">{table.name}</span>

                <span
                  className={`text-[9px] uppercase px-2 py-0.5 rounded-full ${
                    isOccupied
                      ? "bg-yellow-500 text-black"
                      : "bg-green-500/20 text-green-200"
                  }`}
                >
                  {isOccupied ? "Occupied" : "Free"}
                </span>
              </div>

              <div className="mt-1 text-[11px] opacity-80">
                {isOccupied ? (
                  <>
                    <p>{Number(table.open_orders_count || 0)} open order(s)</p>
                    <p className="mt-1">
                      UGX {Number(table.open_balance || 0).toLocaleString()}
                    </p>
                  </>
                ) : (
                  <p>Ready for customer</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TableSelector;
