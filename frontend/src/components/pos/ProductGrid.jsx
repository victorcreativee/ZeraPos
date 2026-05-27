import { useMemo, useState } from "react";

function ProductGrid({ products, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((product) =>
      `${product.name || ""} ${product.category_name || ""} ${
        product.item_type || ""
      } ${product.send_to || ""}`
        .toLowerCase()
        .includes(keyword)
    );
  }, [products, searchTerm]);

  return (
    <div className="h-full flex flex-col gap-2">
      <input
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search product..."
        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400"
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-3 pb-2">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product)}
              className="h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-left hover:border-emerald-400 transition"
            >
              <div className="flex justify-between gap-2">
                <h3 className="text-base font-black text-slate-950 line-clamp-1">
                  {" "}
                  {product.name}
                </h3>

                {product.send_to && product.send_to !== "none" && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500">
                    {product.send_to}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-500">
                {product.category_name || product.item_type || "Item"}
              </p>

              <p className="mt-3 text-xl font-black text-emerald-600">
                {" "}
                UGX {Number(product.price || 0).toLocaleString()}
              </p>

              <p className="text-[11px] text-slate-400 leading-none">
                {Number(product.track_stock) === 1
                  ? `Stock: ${product.stock_quantity || 0}`
                  : "Tap to add"}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductGrid;
