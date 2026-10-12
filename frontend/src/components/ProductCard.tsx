import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Star } from 'lucide-react';
import { formatPKR } from '../services/productService';
import { ProductImage } from './ProductImage';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  variant?: 'standard' | 'exclusive-deal';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'standard' }) => {
  const { addToCart, items } = useCartStore();
  const { showNotification } = useAppStore();
  const [justAdded, setJustAdded] = useState(false);

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

    setJustAdded(true);
    showNotification(`Added ${product.name} to your basket!`);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article className="group bg-white border border-[#E9DCE4] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#F45CAB]/70 hover:shadow-md transition-all duration-200">
      {/* 1. Square Product Image */}
      <Link
        to={`/products/${product.id}`}
        aria-label={`View details for ${product.name}`}
        className="relative overflow-hidden bg-[#FAF7F9] aspect-square block cursor-pointer"
      >
        <ProductImage
          imagePath={product.image_path}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          fallbackClassName="w-12 h-12 text-[#F45CAB]"
        />

        {/* Optional Deal Badge */}
        {variant === 'exclusive-deal' && (
          <div className="absolute top-2.5 left-2.5 bg-[#03081E] text-[#F45CAB] text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs border border-[#F45CAB]/30">
            DEAL
          </div>
        )}

        {/* Stock badge */}
        {!inStock && (
          <div className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
            Sold Out
          </div>
        )}
      </Link>

      {/* 2. Text Details & Actions */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Category Tag */}
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A93870] block">
            {product.category || 'General'}
          </span>

          {/* Product Title */}
          <Link to={`/products/${product.id}`} className="block">
            <h3 className="text-xs sm:text-sm font-medium text-stone-900 leading-snug line-clamp-2 h-9 sm:h-10 group-hover:text-[#E13288] transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
            <span className="text-base sm:text-lg font-black text-[#E13288] tracking-tight">
              {formatPKR(product.price_in_paisa)}
            </span>
          </div>

          {/* Real Stock Status */}
          <div className="flex items-center gap-1 pt-0.5 text-xs text-stone-400">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-stone-700 font-semibold text-[11px]">
              {inStock ? `${product.stock_quantity} in stock` : 'Out of stock'}
            </span>
          </div>
        </div>

        {/* Add to Cart button themed in Pink and Black */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!canAdd}
          aria-label={
            justAdded
              ? `Added ${product.name} to cart`
              : !inStock
              ? `${product.name} is out of stock`
              : `Add ${product.name} to cart`
          }
          className={`w-full mt-3 py-2 px-3 text-xs font-bold rounded-lg text-white shadow-xs flex items-center justify-center gap-1.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 hover:shadow-lg cursor-pointer ${
            justAdded
              ? 'bg-[#028643] hover:shadow-emerald-700/25'
              : !inStock
              ? 'bg-stone-300 cursor-not-allowed text-stone-500 hover:translate-y-0 hover:shadow-none'
              : !canAdd
              ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-not-allowed'
              : 'bg-[#F45CAB] hover:bg-[#03081E] hover:shadow-[#F45CAB]/30'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Added to Cart</span>
            </>
          ) : !inStock ? (
            <span>Out of Stock</span>
          ) : !canAdd ? (
            <span>Max in Cart ({product.stock_quantity})</span>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
