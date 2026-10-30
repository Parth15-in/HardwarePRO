'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { POSProductSearch } from '@/components/pos/POSProductSearch';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartPanel } from '@/components/pos/CartPanel';
import { CustomerSelector } from '@/components/pos/CustomerSelector';
import { PaymentPanel } from '@/components/pos/PaymentPanel';
import { useCartStore } from '@/store/cart-store';
import { useCustomerStore } from '@/store/customer-store';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Package, ShoppingBag, CheckCircle2, LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

import { useRouter } from 'next/navigation';

export default function POSPage() {
    const router = useRouter();
    const [products, setProducts] = useState<any[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const addItem = useCartStore((state) => state.addItem);
    const selectedCustomer = useCustomerStore((state) => state.selectedCustomer);
    const customerType = selectedCustomer?.customerType || 'REGULAR';

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F2') {
                e.preventDefault();
                document.getElementById('pos-search-input')?.focus();
            }
            if (e.key === 'F3') {
                e.preventDefault();
                // Trigger customer search focus if implemented
            }
            if (e.key === 'F10') {
                e.preventDefault();
                // Trigger checkout
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                // Optional: Confirm exit if cart has items?
                // For now, just focus search or clear selection
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleComplete = () => {
        setShowSuccessModal(true);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Left Column: Product Selection */}
            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <header className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                <Package className="w-8 h-8 text-primary-600" />
                                POS TERMINAL
                            </h1>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">Hardware Shop Management v1.0</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/')}
                                className="hidden lg:flex gap-2 items-center text-slate-500 hover:text-slate-900"
                            >
                                <LogOut className="w-4 h-4" />
                                Exit POS
                            </Button>
                            <div className="hidden lg:flex flex-col items-end border-l border-slate-200 pl-4">
                                <span className="text-[10px] text-slate-400 font-bold uppercase">System Status</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-bold text-slate-700">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <POSProductSearch
                        onSelect={(p) => addItem(p, customerType)}
                        onProductsLoaded={setProducts}
                    />
                </header>

                <main className="flex-1 overflow-y-auto pr-2">
                    <ProductGrid
                        products={products}
                        onAdd={(p) => addItem(p, customerType)}
                    />
                </main>

                <footer className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-tighter">
                    <div className="flex gap-4">
                        <span>[F2] Search</span>
                        <span>[F3] Customer</span>
                        <span>[F10] Checkout</span>
                        <span>[ESC] Clear</span>
                    </div>
                    <div>Terminal ID: 001-ALPHA</div>
                </footer>
            </div>

            {/* Right Column: Billing & Checkout */}
            <div className="w-[450px] bg-slate-100 border-l border-slate-200 p-6 flex flex-col gap-6 pt-8">
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Active Customer</label>
                    <CustomerSelector />
                </div>

                <div className="flex-1 overflow-hidden">
                    <CartPanel />
                </div>

                <div className="h-auto">
                    <PaymentPanel onComplete={handleComplete} />
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border-4 border-emerald-50">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">Sale Completed!</h2>
                            <p className="text-slate-500 font-medium">The transaction was processed successfully.</p>
                        </div>
                        <div className="w-full h-px bg-slate-100 my-2" />
                        <div className="flex flex-col w-full gap-2">
                            <Button variant="primary" size="lg" className="w-full" onClick={() => setShowSuccessModal(false)}>
                                New Transaction
                            </Button>
                            <Button variant="outline" className="w-full">
                                Print Invoice
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
