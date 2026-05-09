function TableSelector({ tables, selectedTable, onSelectTable }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectTable(null)}
        className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap ${
          selectedTable === null
            ? "bg-green-600 text-white"
            : "bg-[#111827] text-slate-300 border border-slate-800"
        }`}
      >
        Takeaway
      </button>

      {tables.map((table) => (
        <button
          key={table.id}
          onClick={() => onSelectTable(table)}
          className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap ${
            selectedTable?.id === table.id
              ? "bg-green-600 text-white"
              : "bg-[#111827] text-slate-300 border border-slate-800"
          }`}
        >
          {table.name}
        </button>
      ))}
    </div>
  );
}

export default TableSelector;
