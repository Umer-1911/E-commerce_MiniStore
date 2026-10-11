import React from 'react';
import type { OrderStatus } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const sizeClasses = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-xs';

  switch (status) {
    case 'pending':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-amber-100 text-amber-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
          Pending
        </span>
      );
    case 'processing':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-blue-100 text-blue-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
          Processing
        </span>
      );
    case 'shipped':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-purple-100 text-purple-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-1.5" />
          Shipped
        </span>
      );
    case 'completed':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-emerald-100 text-emerald-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          Completed
        </span>
      );
    case 'cancelled':
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-rose-100 text-rose-800 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center rounded-full font-semibold bg-slate-100 text-slate-800 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
};
