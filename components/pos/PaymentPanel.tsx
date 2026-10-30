import React, { useState, useMemo } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useCustomerStore } from '@/store/customer-store';
import { CreditCard, Banknote, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { safeDb } from '@/lib/electron-api';

export const PaymentPanel = ({ onComplete }: { onComplete: () => void }) => {
    // FIX #7: getTotals() was called at the top of each render but is NOT a Zustand selector
    // — it doesn't subscribe the component to store changes, leading to potentially stale reads.
    // Replace with direct selectors so the component re-renders only when relevant state changes.
    const items = useCartStore((state) => state.items);
    const discount = useCartStore((state) => state.discount);
    const taxRate = useCartStore((state) => state.taxRate);
    const clearCart = useCartStore((state) => state.clearCart);
    const selectedCustomer = useCustomerStore((state) => state.selectedCustomer);
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CREDIT'>('CASH');
    const [tendered, setTendered] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Compute totals reactively — only recalculates when items, discount, or taxRate change
    const { subtotal, discountAmount, taxAmount, total } = useMemo(() => {
        const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0);
        const discountAmount = discount;
        const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
        const total = subtotal - discountAmount + taxAmount;
        return { subtotal, discountAmount, taxAmount, total };
    }, [items, discount, taxRate]);
    const balance = parseFloat(tendered || '0') - total;

    const handleCheckout = async () => {
        if (items.length === 0) return;

        setIsProcessing(true);
        try {
            const saleData = {
                customerId: selectedCustomer?.id,
                items: items.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.unitPrice // Corrected from item.price to item.unitPrice
                })),
                subtotal: subtotal,
                discount: discountAmount,
                tax: taxAmount,
                total: total,
                paymentMethod,
                paymentAmount: paymentMethod === 'CREDIT' ? 0 : parseFloat(tendered) || total,
                createdBy: 'ADMIN'
            };

            await safeDb.createSale(saleData);

            // Success - Clear everything
            clearCart();
            onComplete();
        } catch (error: any) {
            alert(error.message || 'Transaction failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const methods = [
        { id: 'CASH', label: 'Cash', icon: Banknote },
        { id: 'UPI', label: 'UPI / Scan', icon: Smartphone },
        { id: 'CREDIT', label: 'Credit', icon: ShieldCheck, disabled: !selectedCustomer },
    ];

    return (
        <div className="flex flex-col gap-3 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl h-full border border-slate-800 overflow-y-auto">
            {/* Totals Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-slate-300 font-bold uppercase tracking-widest text-[10px]">Total Amount</span>
                    <div className="flex flex-col items-end">
                        {discountAmount > 0 && <span className="text-rose-400 text-[10px] line-through">₹{(total + discountAmount).toFixed(2)}</span>}
                        <span className="text-4xl font-black text-white">₹{total.toFixed(2)}</span>
                    </div>
                </div>

                <div className="h-px bg-slate-800" />

                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                    <div className="flex justify-between p-1.5 px-2 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between p-1.5 px-2 bg-slate-800/50 rounded-lg">
                        <span className="text-slate-300">Tax</span>
                        <span>₹{taxAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                    {methods.map((method) => {
                        const Icon = method.icon;
                        return (
                            <button
                                key={method.id}
                                disabled={method.disabled}
                                onClick={() => setPaymentMethod(method.id as any)}
                                className={`
                  flex items-center gap-2 p-2 rounded-xl border transition-all 
                  ${method.disabled ? 'opacity-30 border-slate-800 grayscale cursor-not-allowed' :
                                        paymentMethod === method.id
                                            ? 'border-primary-500 bg-primary-500/10 text-white ring-1 ring-primary-500/20'
                                            : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'}
                `}
                            >
                                <Icon className={`w-4 h-4 ${paymentMethod === method.id ? 'text-primary-400' : ''}`} />
                                <span className="text-xs font-bold">{method.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Change Calculation */}
            {paymentMethod === 'CASH' && (
                <div className="space-y-2 p-3 bg-slate-800/30 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-300 uppercase">Tendered Amount</label>
                        <input
                            type="number"
                            placeholder="0.00"
                            className="bg-transparent text-right text-lg font-black focus:outline-none w-24 text-primary-400"
                            value={tendered}
                            onChange={(e) => setTendered(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-800 pt-2 text-xs font-bold">
                        <span className="text-slate-300 uppercase text-[10px]">Balanced Due</span>
                        <span className={`${balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                            ₹{balance.toFixed(2)}
                        </span>
                    </div>
                </div>
            )}

            {paymentMethod === 'CREDIT' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                    <div className="bg-amber-500 p-0.5 rounded">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
                    </div>
                    <p className="text-[10px] font-bold text-amber-500">
                        The amount ₹{total.toFixed(2)} will be added to {selectedCustomer?.name}'s outstanding balance.
                    </p>
                </div>
            )}

            <div className="flex-1" />

            {/* Checkout Button */}
            <Button
                size="xl"
                className="w-full h-14 text-lg font-black uppercase rounded-2xl shadow-xl shadow-primary-500/10 active:scale-[0.98]"
                isLoading={isProcessing}
                disabled={items.length === 0 || (paymentMethod === 'CASH' && balance < 0)}
                onClick={handleCheckout}
            >
                Complete Sale <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <p className="text-[10px] text-center text-slate-600 font-medium pb-1">PRESS F10 TO FINALIZE TRANSACTION</p>
        </div>
    );
};
