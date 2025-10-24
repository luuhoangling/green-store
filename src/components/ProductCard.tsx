"use client";
import React from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number | string;
  title: string;
  slug?: string;
  price: number;
  price_sale?: number | null;
  is_sale?: boolean;
  stock?: number | null;
  category_id?: number | null;
  image_url?: string | null;
};

export default function ProductCard({ product, showDetailButton = false }: { product: Product; showDetailButton?: boolean }) {
  const router = useRouter();

  const handleViewDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to product detail page
    if (product.slug) {
      router.push(`/products/${product.slug}`);
    } else {
      router.push(`/products/${product.id}`);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-2xl shadow-md bg-white dark:bg-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">No image</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{product.title}</h3>
            <div className="text-right">
              {product.is_sale && product.price_sale ? (
                <div className="text-sm">
                  <div className="text-xs text-red-500 font-semibold">Giảm giá</div>
                  <div className="text-sm text-slate-900 dark:text-slate-100 font-semibold">{formatVnd(product.price_sale)}</div>
                  <div className="text-xs line-through text-gray-400">{formatVnd(product.price)}</div>
                </div>
              ) : (
                <div className="text-sm text-slate-900 dark:text-slate-100 font-semibold">{formatVnd(product.price)}</div>
              )}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">{product.stock != null ? `Tồn: ${product.stock}` : ""}</div>
        </div>
      </div>
      {showDetailButton && (
        <button
          onClick={handleViewDetail}
          className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          Xem chi tiết
        </button>
      )}
    </div>
  );
}

function formatVnd(value?: number | null) {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);
}
