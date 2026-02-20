'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLANS, type PlanId } from '@/lib/billing';

export default function BillingPage() {
  const [currentPlan] = useState<PlanId>('free');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (price: number) => {
    if (price <= 0) return price === 0 ? 'Free' : 'Custom';
    const adjusted = billingPeriod === 'annual' ? Math.round(price * 0.83) : price;
    return `$${adjusted}/user/mo`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link href="/settings" className="text-sky-600 text-sm font-medium">&larr; Settings</Link>
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">Plans & Billing</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Period toggle */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          <button onClick={() => setBillingPeriod('monthly')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${billingPeriod === 'monthly' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Monthly
          </button>
          <button onClick={() => setBillingPeriod('annual')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${billingPeriod === 'annual' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500'}`}>
            Annual (save 17%)
          </button>
        </div>

        {/* Plans */}
        {(Object.values(PLANS)).map(plan => {
          const isCurrent = plan.id === currentPlan;
          const isPopular = plan.id === 'pro';

          return (
            <div key={plan.id}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-5 relative ${isPopular ? 'border-sky-400 dark:border-sky-600' : 'border-zinc-200 dark:border-zinc-800'} ${isCurrent ? 'ring-2 ring-emerald-400' : ''}`}>
              {isPopular && (
                <span className="absolute -top-3 left-4 bg-sky-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</span>
              )}
              {isCurrent && (
                <span className="absolute -top-3 right-4 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Current</span>
              )}

              <div className="flex items-baseline gap-2 mb-3 mt-1">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{plan.name}</h2>
                <span className="text-lg font-semibold text-sky-600">{getPrice(plan.price)}</span>
              </div>

              <ul className="space-y-1.5 mb-4">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.id === 'free' && isCurrent && (
                <div className="text-xs text-zinc-500 text-center py-2">Your current plan</div>
              )}
              {plan.id === 'pro' && (
                <button className="w-full bg-sky-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-sky-700">
                  {isCurrent ? 'Manage Subscription' : 'Start Free Trial'}
                </button>
              )}
              {plan.id === 'enterprise' && (
                <button className="w-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-xl py-3 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  Contact Sales
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
