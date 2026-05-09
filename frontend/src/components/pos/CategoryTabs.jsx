function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap ${
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
          className={`px-5 py-3 rounded-2xl font-semibold whitespace-nowrap ${
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
