import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { formatPKR } from '../services/productService';
import { ProductImage } from './ProductImage';
import { useCartStore } from '../store/useCartStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  badge?: string;
  isDeal?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  badge,
  isDeal = false,
}) => {
  const { addToCart, items } = useCartStore();
  const [added, setAdded] = useState(false);
  const [wished, setWished] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const alreadyInCart = cartItem?.quantity ?? 0;
  const inStock = product.stock_quantity > 0;
  const canAdd = inStock && alreadyInCart < product.stock_quantity;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAdd) return;

    addToCart(
      {
        productId: product.id,
        name: product.name,
        price_in_paisa: product.price_in_paisa,
        image_path: product.image_path,
        availableStock: product.stock_quantity,
      },
      1
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  // Original slashed price for visual discount appeal (e.g. 25% higher)
  const originalPaisa = Math.round(product.price_in_paisa * 1.25);

  return (
    <div className="group relative bg-white border border-slate-200/90 rounded-2xl p-4 transition-all duration-300 hover:shadow-lg hover:border-emerald-300 flex flex-col justify-between">
      {/* Top badges & heart */}
      <div className="flex items-center justify-between z-10">
        {badge ? (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-rose-600 text-white shadow-xs">
            {badge}
          </span>
        ) : isDeal ? (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide bg-emerald-700 text-white shadow-xs">
            DEAL
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
            {product.category || 'Store Item'}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setWished(!wished);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            wished ? 'text-rose-500 bg-rose-50' : 'text-slate-300 hover:text-rose-500 hover:bg-slate-50'
          }`}
          title="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Image Clickable to Detail */}
      <Link to={`/products/${product.id}`} className="block my-3 overflow-hidden rounded-xl">
        <div className="aspect-square w-full bg-slate-50/70 rounded-xl overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <ProductImage
            imagePath={product.image_path}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            fallbackClassName="w-10 h-10 text-emerald-400"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="space-y-1.5">
        {/* Pricing */}
        <div className="flex items-baseline gap-2">
          {isDeal && (
            <span className="text-xs text-slate-400 line-through">
              {formatPKR(originalPaisa)}
            </span>
          )}
          <span className="text-base font-extrabold text-emerald-950">
            {formatPKR(product.price_in_paisa)}
          </span>
        </div>

        {/* Name */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Subtitle / Description excerpt */}
        <p className="text-xs text-slate-500 line-clamp-1">
          {product.description || (inStock ? `${product.stock_quantity} available in stock` : 'Out of stock')}
        </p>
      </div>

      {/* Bottom Action: Add to Cart button */}
      <div className="pt-3 mt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs ${
            added
              ? 'bg-emerald-600 text-white'
              : !inStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200/80 hover:border-emerald-600'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Added!</span>
            </>
          ) : !inStock ? (
            <span>Sold Out</span>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>+ Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
