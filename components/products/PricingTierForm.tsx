'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/Input';

export const PricingTierForm = () => {
    const { register, formState: { errors } } = useFormContext();

    const tiers = [
        { type: 'REGULAR', label: 'Regular Price' },
        { type: 'ELECTRICIAN', label: 'Electrician Price' },
        { type: 'PLUMBER', label: 'Plumber Price' },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="col-span-full mb-2">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Multi-Tier Pricing</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Set specific prices for each customer category</p>
            </div>
            {tiers.map((tier, index) => (
                <div key={tier.type} className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-tighter">
                        {tier.label}
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</div>
                        <input
                            type="number"
                            step="0.01"
                            {...register(`pricingTiers.${index}.sellingPrice`, { valueAsNumber: true })}
                            className="w-full bg-white border border-slate-200 rounded-lg pl-8 p-2 text-sm font-black focus:ring-2 focus:ring-primary-100 outline-none"
                        />
                        <input type="hidden" {...register(`pricingTiers.${index}.customerType`)} value={tier.type} />
                    </div>
                </div>
            ))}
        </div>
    );
};
