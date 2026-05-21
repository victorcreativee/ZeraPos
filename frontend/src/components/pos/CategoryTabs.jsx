function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap ${
          selectedCategory === null
            ? "bg-purple-600 text-white"
            : "bg-[#111827] text-slate-300 border border-slate-800"
        }`}
      >
        All
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap ${
            selectedCategory === category.id
              ? "bg-purple-600 text-white"
              : "bg-[#111827] text-slate-300 border border-slate-800"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

export default CategoryTabs;
