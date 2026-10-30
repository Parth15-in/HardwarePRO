'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { AlertTriangle, TrendingUp, DollarSign, RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { safeDb } from '@/lib/electron-api';
import { Badge } from '@/components/ui/Badge';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { toast } from 'sonner';

export default function InventoryPage() {
    const [items, setItems] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'LOW' | 'IN'>('ALL');

    const fetchInventory = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await safeDb.getProducts({ limit: 100 });
            if (result) {
                setItems(result.data);
            }
        } catch (error) {
            toast.error('Failed to load inventory data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const totalValue = items.reduce((acc, curr) => acc + (curr.currentStock * curr.costPrice), 0);
    const lowStockCount = items.filter(i => i.currentStock < i.minStockLevel).length;

    const filteredItems = items.filter(item => {
        if (activeFilter === 'LOW') return item.currentStock < item.minStockLevel;
        if (activeFilter === 'IN') return item.currentStock >= item.minStockLevel;
        return true;
    });

    const columns = [
        { header: 'Product SKU', accessor: 'sku' as const },
        { header: 'Item Name', accessor: 'name' as const },
        { header: 'Category', accessor: 'category' as const },
        {
            header: 'On Hand',
            accessor: (i: any) => (
                <div className="flex items-center gap-2">
                    <span className={`font-black ${i.currentStock < i.minStockLevel ? 'text-rose-600' : 'text-slate-900'}`}>
                        {i.currentStock}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{i.unitType}</span>
                    {i.currentStock < i.minStockLevel && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                </div>
            )
        },
        {
            header: 'Min Threshold',
            accessor: (i: any) => <span className="font-bold text-slate-400">{i.minStockLevel}</span>
        },
        {
            header: 'Valuation',
            accessor: (i: any) => <span className="font-bold">₹{(i.currentStock * i.costPrice).toFixed(2)}</span>
        },
        {
            header: 'Control',
            accessor: (i: any) => (
                <button
                    onClick={() => { setSelectedProduct(i); setIsAdjustOpen(true); }}
                    className="bg-primary-50 text-primary-600 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider hover:bg-slate-900 hover:text-white transition-all"
                >
                    Adjust
                </button>
            )
        }
    ];

    const handleSync = async () => {
        await fetchInventory();
        toast.success('Inventory synced successfully');
    };

    const handleDownloadReport = () => {
        const headers = ['SKU', 'Name', 'Category', 'Stock', 'Unit', 'Cost Price', 'Valuation'];
        const csvContent = [
            headers.join(','),
            ...filteredItems.map(item => [
                item.sku,
                `"${item.name}"`,
                item.category,
                item.currentStock,
                item.unitType,
                item.costPrice,
                (item.currentStock * item.costPrice).toFixed(2)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `valuation_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Valuation report downloaded');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <ToastProvider />
            <Navbar />

            <div className="flex-1 p-8 space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-primary-800 to-indigo-900">
                            INVENTORY INTELLIGENCE
                        </h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time stock valuation and logistics monitoring</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none block">Total Valuation</span>
                                <span className="text-lg font-black text-slate-900">₹{totalValue.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                            <div className="bg-rose-50 text-rose-600 p-2 rounded-xl">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none block">Restock Alerts</span>
                                <span className="text-lg font-black text-slate-900">{lowStockCount} Items</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex justify-between items-center py-4">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50" onClick={handleDownloadReport}>
                            <BarChart3 className="w-4 h-4 mr-2" /> Valuation Report
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50" onClick={handleSync}>
                            <RefreshCw className="w-4 h-4 mr-2" /> Sync Local
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase">Filters:</span>
                        <button
                            onClick={() => setActiveFilter(activeFilter === 'LOW' ? 'ALL' : 'LOW')}
                            className={`transition-all ${activeFilter === 'LOW' ? 'ring-2 ring-rose-500 ring-offset-2 rounded-full' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <Badge variant="danger">Low Stock</Badge>
                        </button>
                        <button
                            onClick={() => setActiveFilter(activeFilter === 'IN' ? 'ALL' : 'IN')}
                            className={`transition-all ${activeFilter === 'IN' ? 'ring-2 ring-emerald-500 ring-offset-2 rounded-full' : 'opacity-70 hover:opacity-100'}`}
                        >
                            <Badge variant="success">In-Stock</Badge>
                        </button>
                    </div>
                </div>

                <DataTable
                    data={filteredItems}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>

            {selectedProduct && (
                <StockAdjustmentModal
                    product={selectedProduct}
                    isOpen={isAdjustOpen}
                    onClose={() => setIsAdjustOpen(false)}
                    onSuccess={fetchInventory}
                />
            )}
        </div>
    );
}
