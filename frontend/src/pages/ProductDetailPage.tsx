import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
  ShieldCheck,
  Truck,
  MapPin,
  Star,
  Share2,
} from 'lucide-react';
import { useProductStore } from '../store/useProductStore';
import { useCartStore } from '../store/useCartStore';
import { useAppStore } from '../store/useAppStore';
import { formatPKR } from '../services/productService';
import { ProductImage } from '../components/ProductImage';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { detail, detailLoading, detailError, fetchProduct } = useProductStore();
  const { addToCart, items } = useCartStore();
  const { showNotification } = useAppStore();

  const [qty, setQty] = useState(1);
  const [addedFlash, setAddedFlash] = useState(false);

  useEffect(() => {
    if (id) fetchProduct(Number(id));
  }, [id, fetchProduct]);

  useEffect(() => {
    setQty(1);
  }, [detail?.id]);

  if (detailLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 space-y-3" role="status">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F45CAB]" />
        <span className="text-xs text-stone-500 font-medium">Loading product details...</span>
      </div>
    );
  }

  if (detailError || !detail) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto px-4">
        <p className="text-rose-600 text-sm font-semibold">{detailError ?? 'Product not found.'}</p>
        <button
          onClick={() => navigate('/products')}
          className="px-6 py-2.5 rounded-full bg-[#03081E] text-white text-xs font-bold hover:bg-[#F45CAB] transition cursor-pointer"
        >
          Back to Catalog
        </button>
      </div>
    );
  }

  const inStock = detail.stock_quantity > 0;
  const alreadyInCart = items.find((i) => i.productId === detail.id)?.quantity ?? 0;
  const canAddMore = Math.max(0, detail.stock_quantity - alreadyInCart);
  const maxQty = Math.max(1, canAddMore);

  const handleAddToCart = () => {
    if (!inStock || canAddMore === 0) return;
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
    showNotification(`Added ${qty} × ${detail.name} to your basket!`);
    setTimeout(() => setAddedFlash(false), 2000);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showNotification('Product link copied to clipboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between border-b border-[#E9DCE4] pb-4 gap-3">
        <button
          onClick={() => navigate('/products')}
          className="w-8 h-8 rounded-full border border-stone-200 hover:border-[#03081E] hover:bg-[#03081E] hover:text-white flex items-center justify-center text-stone-700 transition cursor-pointer shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-stone-500 min-w-0 overflow-hidden">
          <Link to="/" className="shrink-0 hover:text-stone-800">Home</Link>
          <span className="shrink-0 text-stone-300">/</span>
          <Link
            to={`/products?category=${encodeURIComponent(detail.category || '')}`}
            className="shrink-0 hover:text-stone-800"
          >
            {detail.category || 'General'}
          </Link>
          <span className="shrink-0 text-stone-300">/</span>
          <span className="text-stone-900 font-medium truncate">{detail.name}</span>
        </div>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Image */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square bg-white rounded-2xl overflow-hidden border border-[#E9DCE4] flex items-center justify-center p-6 shadow-xs">
            <ProductImage
              imagePath={detail.image_path}
              alt={detail.name}
              className="w-full h-full object-contain object-center"
              fallbackClassName="w-20 h-20 text-[#F45CAB]"
            />
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 bg-white border border-[#E9DCE4] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
              <span className="flex items-center gap-1 text-stone-700">
                <MapPin className="w-3.5 h-3.5 text-[#E13288]" />
                <span>Pakistan Origin</span>
              </span>
              <span>·</span>
              <span className="font-semibold text-[#A93870]">{detail.category || 'General'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
              {detail.name}
            </h1>

            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-semibold text-stone-800">Verified Stock</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="pt-4 border-t border-[#F2ECE1]">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#E13288] tracking-tight">
                {formatPKR(detail.price_in_paisa)}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Inclusive of all domestic provincial duties and artisan packaging.
            </p>
          </div>

          {/* Stock Indicator */}
          <div className="text-xs">
            {inStock ? (
              <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>
                  {detail.stock_quantity < 10
                    ? `Artisan batch low: Only ${detail.stock_quantity} units remain`
                    : `In Stock: ${detail.stock_quantity} available in database`}
                </span>
              </div>
            ) : (
              <div className="text-rose-700 font-medium">
                Out of Stock
              </div>
            )}
          </div>

          {/* Quantity Selector & Purchase Actions */}
          {inStock && (
            <div className="space-y-4 pt-2">
              {alreadyInCart > 0 && (
                <p className="text-xs text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200 font-medium">
                  You already have <strong>{alreadyInCart}</strong> of this item in your shopping basket.
                </p>
              )}

              <div className="flex items-center gap-4">
                <span className="text-xs font-medium text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-mono font-semibold text-stone-900">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= canAddMore}
                    className="p-2 text-stone-600 hover:text-stone-900 disabled:opacity-30 cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={canAddMore === 0}
                  className={`flex-1 py-3.5 px-6 rounded-full font-bold text-xs sm:text-sm text-white shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    addedFlash
                      ? 'bg-[#028643]'
                      : canAddMore === 0
                      ? 'bg-stone-300 cursor-not-allowed'
                      : 'bg-[#F45CAB] hover:bg-[#03081E]'
                  }`}
                >
                  {addedFlash ? (
                    <>
                      <CheckCircle className="w-4 h-4 stroke-[3]" />
                      <span>Added to Basket</span>
                    </>
                  ) : canAddMore === 0 ? (
                    <span>Maximum Stock in Basket</span>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Basket</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-3 rounded-full border border-stone-200 text-stone-600 hover:text-[#03081E] hover:border-[#03081E] hover:bg-white transition cursor-pointer shrink-0"
                  title="Share product"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Micro Trust Points */}
          <div className="pt-4 border-t border-[#F2ECE1] space-y-2.5 text-xs text-stone-600">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#E13288] shrink-0" />
              <span>Cash on Delivery available nationwide via express courier.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#E13288] shrink-0" />
              <span>Direct regional origin guarantee with 7-day exchange window.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="bg-white border border-[#E9DCE4] rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-stone-900 pb-3 border-b border-stone-100">
            Craftsmanship Story and Details
          </h3>
          <p className="text-sm text-stone-700 leading-relaxed mt-4 max-w-4xl whitespace-pre-line">
            {detail.description || 'Authentic Pakistani store item produced with natural quality and craftsmanship.'}
          </p>
        </div>
      </div>
    </div>
  );
};
