import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { resolveImageUrl } from '../services/productService';

interface ProductImageProps {
  imagePath: string | null | undefined;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  imagePath,
  alt,
  className = 'w-full h-full object-cover',
  fallbackClassName = 'w-8 h-8 text-emerald-300',
}) => {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveImageUrl(imagePath);

  if (!resolvedUrl || imageError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-slate-50 to-amber-50 flex flex-col items-center justify-center p-3 text-center select-none">
        <Package className={fallbackClassName} />
        <span className="text-[10px] font-medium text-slate-400 mt-1 line-clamp-1 truncate max-w-full px-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={resolvedUrl}
      alt={alt}
      loading="lazy"
      onError={() => setImageError(true)}
      className={className}
    />
  );
};
