import { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Trash2, Plus, Minus, ShoppingBag, Info } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const CartPanel = () => {
    const { items, updateQuantity, removeItem, clearCart } = useCartStore();
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const handleUpdateQuantity = (id: string, qty: number) => {
        updateQuantity(id, qty);
        // Also update selected item if it's the one being modified
        if (selectedItem && selectedItem.id === id) {
            setSelectedItem({ ...selectedItem, quantity: qty, lineTotal: qty * selectedItem.unitPrice });
        }
    };

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl border-2 border-dashed border-slate-200 text-slate-300">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-20" />
                <p className="font-semibold">Cart is currently empty</p>
                <p className="text-xs mt-1 text-slate-400">Scan or select products to begin</p>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Billing Items ({items.length})</h3>
                    <button
                        onClick={clearCart}
                        className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider"
                    >
                        Clear All
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{item.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono uppercase">
                                            {item.sku}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            ₹{item.unitPrice.toFixed(2)} / {item.unitType.toLowerCase()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeItem(item.id);
                                    }}
                                    className="text-slate-300 hover:text-rose-500 transition-colors bg-white/50 hover:bg-rose-50 p-1.5 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex justify-between items-center mt-4">
                                <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg shadow-sm" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        className="p-1 px-2.5 hover:bg-slate-50 text-slate-500 border-r border-slate-200"
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="px-4 py-1 text-sm font-black text-slate-900 min-w-[3rem] text-center">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        className="p-1 px-2.5 hover:bg-slate-50 text-slate-500 border-l border-slate-200"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="text-right">
                                    <span className="text-base font-black text-slate-900">₹{item.lineTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedItem && (
                <Modal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    title="Item Details"
                >
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4">
                            <div className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                <ShoppingBag className="w-8 h-8 text-primary-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 leading-tight">{selectedItem.name}</h3>
                                <p className="text-sm text-slate-500 font-medium mt-1">{selectedItem.category}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{selectedItem.sku}</span>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">{selectedItem.unitType}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-slate-200 bg-white">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unit Price</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">₹{selectedItem.unitPrice.toFixed(2)}</div>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-200 bg-white">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quantity</span>
                                <div className="text-2xl font-black text-slate-900 mt-1">{selectedItem.quantity}</div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 rounded-xl text-white flex justify-between items-center shadow-lg">
                            <span className="font-bold uppercase tracking-widest text-xs text-slate-400">Total Line Amount</span>
                            <span className="text-3xl font-black">₹{selectedItem.lineTotal.toFixed(2)}</span>
                        </div>

                        {selectedItem.description && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    {selectedItem.description}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end pt-2">
                            <Button variant="outline" onClick={() => setSelectedItem(null)} className="w-full sm:w-auto">
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};
