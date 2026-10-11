import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart, CheckCircle, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { formatPKR } from '../services/productService';
import { ProductImage } from '../components/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, detailLoading, detailError, fetchProduct } = useProductStore();
  const { addToCart, items } = useCartStore();

  const [qty, setQty] = useState(1);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    if (id) fetchProduct(Number(id));
  }, [id, fetchProduct]);

  useEffect(() => { setQty(1); }, [detail?.id]);

  if (detailLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <p className="text-rose-600 text-sm">{detailError ?? 'Product not found.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 rounded-full bg-[#0b3b2c] text-white text-xs font-bold hover:bg-emerald-800 transition"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const inStock = detail.stock_quantity > 0;
  const alreadyInCart = items.find(i => i.productId === detail.id)?.quantity ?? 0;
  const canAddMore = Math.max(0, detail.stock_quantity - alreadyInCart);
  const maxQty = Math.max(1, canAddMore);

  const handleAddToCart = () => {
    addToCart(
      {
        productId: detail.id,
        name: detail.name,
        price_in_paisa: detail.price_in_paisa,
        image_path: detail.image_path,
        availableStock: detail.stock_quantity,
      },
      qty
    );
    setQty(1);
    setAddedFlash(true);
    setTimeout(() => setAddedFlash(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/products" className="flex items-center gap-1 hover:text-emerald-700 transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Products</span>
        </Link>
        <span>/</span>
        <span className="text-slate-400">{detail.category || 'General'}</span>
        <span>/</span>
        <span className="text-slate-800 font-bold truncate">{detail.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Image */}
        <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center p-4">
          <ProductImage
            imagePath={detail.image_path}
            alt={detail.name}
            className="w-full h-full object-contain object-center"
            fallbackClassName="w-16 h-16 text-emerald-400"
          />
        </div>

        {/* Right: Product Details */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            {detail.category && (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {detail.category}
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {detail.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl font-black text-emerald-950">
                {formatPKR(detail.price_in_paisa)}
              </span>
              <span className="text-xs text-slate-400 line-through">
                {formatPKR(Math.round(detail.price_in_paisa * 1.25))}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                Save 20%
              </span>
            </div>

            {/* Stock pill */}
            <div className="pt-1">
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Stock ({detail.stock_quantity} available)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Sold Out
                </span>
              )}
            </div>

            {/* Description */}
            <div className="pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1.5">
                About this item
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {detail.description || 'Authentic Pakistani store item produced with natural quality and craftsmanship.'}
              </p>
            </div>
          </div>

          {/* Quantity selector & Add to cart button */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {alreadyInCart > 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                You already have <strong>{alreadyInCart}</strong> in your cart.
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Counter */}
              <div className="flex items-center justify-between border border-slate-200 rounded-2xl bg-slate-50 px-3 py-1.5 w-full sm:w-36">
                <button
                  type="button"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1 || !inStock}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-extrabold text-sm text-slate-900">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(q => Math.min(maxQty, q + 1))}
                  disabled={qty >= canAddMore || !inStock}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to cart CTA */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock || canAddMore === 0}
                className={`flex-1 py-3 px-6 rounded-2xl text-xs sm:text-sm font-extrabold transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                  addedFlash
                    ? 'bg-emerald-600 text-white'
                    : !inStock || canAddMore === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#0b3b2c] hover:bg-emerald-800 text-white'
                }`}
              >
                {addedFlash ? (
                  <>
                    <CheckCircle className="w-4 h-4 stroke-[3]" />
                    <span>Added to Cart!</span>
                  </>
                ) : !inStock ? (
                  <span>Out of Stock</span>
                ) : canAddMore === 0 ? (
                  <span>Max Stock Reached</span>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>100% Authentic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>7-Day Return</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
