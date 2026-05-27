function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <button
        onClick={() => onSelectCategory(null)}
        className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black border ${
          selectedCategory === null
            ? "bg-slate-950 text-white border-slate-950"
            : "bg-white text-slate-700 border-slate-200"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-black border ${
            selectedCategory === category.id
              ? "bg-slate-950 text-white border-slate-950"
              : "bg-white text-slate-700 border-slate-200"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
