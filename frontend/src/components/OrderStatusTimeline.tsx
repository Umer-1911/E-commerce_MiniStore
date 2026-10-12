import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle } from 'lucide-react';
import type { OrderStatus } from '../types';

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

const STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'processing', label: 'Processing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'completed', label: 'Completed', icon: CheckCircle2 },
] as const;

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ status }) => {
  if (status === 'cancelled') {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
          <XCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-rose-900">Order Cancelled</h4>
          <p className="text-xs text-rose-600">
            This order has been cancelled and is no longer being processed.
          </p>
        </div>
      </div>
    );
  }

  const stepKeys = ['pending', 'processing', 'shipped', 'completed'];
  const currentIndex = stepKeys.indexOf(status);

  return (
    <div className="py-4">
      <div className="relative flex items-center justify-between w-full">
        {/* Background Connecting Bar */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-stone-200 z-0" />
        
        {/* Active Progress Bar in Pink */}
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-[#F45CAB] transition-all duration-500 z-0"
          style={{
            width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isPassed
                    ? 'bg-[#03081E] border-[#03081E] text-white'
                    : isCurrent
                    ? 'bg-white border-[#F45CAB] text-[#E13288] ring-4 ring-[#FFF0F7] shadow-sm'
                    : 'bg-white border-stone-300 text-stone-400'
                }`}
              >
                {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`mt-2 text-xs font-bold ${
                  isCurrent
                    ? 'text-[#E13288]'
                    : isPassed
                    ? 'text-stone-800'
                    : 'text-stone-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
