import { useMemo, useState } from "react";

function ProductGrid({ products, onAddToCart }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) return products;

    return products.filter((product) => {
      return (
        product.name?.toLowerCase().includes(keyword) ||
        product.category_name?.toLowerCase().includes(keyword) ||
        product.item_type?.toLowerCase().includes(keyword) ||
        product.send_to?.toLowerCase().includes(keyword)
      );
    });
  }, [products, searchTerm]);

  return (
    <div className="space-y-3">
      <div className="sticky top-0 z-10 bg-[#0D1117] pb-2">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search product, food, drink, beer..."
          className="w-full bg-[#111827] border border-slate-800 focus:border-purple-500 outline-none rounded-2xl px-4 py-3 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[58vh] overflow-y-auto pr-1">
        {filteredProducts.map((product) => {
          const isOutOfStock =
            product.track_stock && Number(product.stock_quantity) <= 0;

          return (
            <button
              key={product.id}
              onClick={() => !isOutOfStock && onAddToCart(product)}
              disabled={isOutOfStock}
              className={`
                border rounded-3xl p-5 text-left min-h-[135px] transition active:scale-[0.98]
                ${
                  isOutOfStock
                    ? "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-[#111827] border-slate-800 hover:border-purple-500 hover:shadow-xl"
                }
              `}
            >
              <div className="flex justify-between gap-3">
                <h3 className="font-black text-lg text-white leading-tight line-clamp-2">
                  {product.name}
                </h3>

                {product.send_to !== "none" && (
                  <span className="text-[10px] uppercase bg-purple-500/10 text-purple-300 px-2 py-1 rounded-full h-fit shrink-0">
                    {product.send_to}
                  </span>
                )}
              </div>

              <p className="text-slate-400 text-sm mt-2 truncate">
                {product.category_name || product.item_type}
              </p>

              <p className="text-2xl font-black mt-4 text-green-400">
                UGX {Number(product.price).toLocaleString()}
              </p>

              {product.track_stock ? (
                <p
                  className={`text-xs mt-2 ${
                    isOutOfStock ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {isOutOfStock
                    ? "Out of stock"
                    : `Stock: ${product.stock_quantity}`}
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-2">No stock tracking</p>
              )}
            </button>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-[#111827] border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
            No products found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductGrid;
