"use client";
import React from "react";
import ProductCard from "./ProductCard";

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

export default function ProductList({ products, showDetailButton = false }: { products: Product[]; showDetailButton?: boolean }) {
  if (!products || products.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">Hiện chưa có sản phẩm phù hợp. Thử tìm kiếm khác hoặc mở rộng bộ lọc.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showDetailButton={showDetailButton} />
      ))}
    </div>
  );
}
