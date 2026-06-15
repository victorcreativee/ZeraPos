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
          {filteredProducts.map((product) => {
            const isTracked = Number(product.track_stock) === 1;
            const stockQuantity = Number(product.stock_quantity || 0);
            const lowStockLevel = Number(product.low_stock_level || 0);

            const isOutOfStock = isTracked && stockQuantity <= 0;
            const isLowStock =
              isTracked &&
              !isOutOfStock &&
              lowStockLevel > 0 &&
              stockQuantity <= lowStockLevel;

            const isLastItem = isTracked && stockQuantity === 1;

            return (
              <button
                key={product.id}
                onClick={() => {
                  if (!isOutOfStock) onAddToCart(product);
                }}
                disabled={isOutOfStock}
                className={`h-[120px] rounded-2xl border p-4 text-left transition ${
                  isOutOfStock
                    ? "border-red-200 bg-red-50 opacity-70 cursor-not-allowed"
                    : isLowStock
                    ? "border-amber-300 bg-amber-50 hover:border-amber-400"
                    : "border-slate-200 bg-white hover:border-emerald-400"
                }`}
              >
                <div className="flex justify-between gap-2">
                  <h3 className="text-base font-black text-slate-950 line-clamp-1">
                    {product.name}
                  </h3>

                  {isOutOfStock ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-[8px] font-black uppercase text-red-700">
                      Out
                    </span>
                  ) : isLastItem ? (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-[8px] font-black uppercase text-red-700">
                      Last
                    </span>
                  ) : isLowStock ? (
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[8px] font-black uppercase text-amber-700">
                      Low
                    </span>
                  ) : product.send_to && product.send_to !== "none" ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-black uppercase text-slate-500">
                      {product.send_to}
                    </span>
                  ) : null}
                </div>

                <p className="mt-1 text-xs text-slate-500">
                  {product.category_name || product.item_type || "Item"}
                </p>

                <p className="mt-3 text-xl font-black text-emerald-600">
                  UGX {Number(product.price || 0).toLocaleString()}
                </p>

                <p
                  className={`text-[11px] leading-none font-black ${
                    isOutOfStock
                      ? "text-red-600"
                      : isLastItem
                      ? "text-red-600"
                      : isLowStock
                      ? "text-amber-700"
                      : "text-slate-400"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of stock"
                    : isLastItem
                    ? "Last 1 left"
                    : isLowStock
                    ? `Low stock • ${stockQuantity} left`
                    : isTracked
                    ? `Stock: ${stockQuantity}`
                    : "Tap to add"}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductGrid;
