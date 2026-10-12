import React from 'react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: string;
  description?: string;
  count?: number;
  image: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  count = 12,
  image,
}) => {
  return (
    <Link
      to={`/products?category=${encodeURIComponent(category)}`}
      className="group text-left bg-white border border-[#E9DCE4] rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-xl hover:border-[#F45CAB]/60 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all duration-300 flex flex-col items-center cursor-pointer w-full text-center"
    >
      {/* Circular Product / Dish Presentation matching prototype */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 transition-transform group-hover:scale-105 duration-200 mb-3 shadow-inner bg-[#FFF0F7]">
        <div className="w-full h-full rounded-full overflow-hidden">
          <img
            src={image}
            alt={category}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Category Title */}
      <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#E13288] transition-colors leading-tight">
        {category}
      </h3>

      {/* Item count tag */}
      <p className="text-xs font-semibold mt-1 text-[#A93870]">
        {count} Artisans and Items
      </p>
    </Link>
  );
};
