'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { ProductForm } from '@/components/products/ProductForm';
import { safeDb } from '@/lib/electron-api';
import { Badge } from '@/components/ui/Badge';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { toast } from 'sonner';
import { BulkImportModal } from '@/components/products/BulkImportModal';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    const fetchProducts = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await safeDb.getProducts({ page, search });
            if (result) {
                setProducts(result.data);
                setPagination({
                    page: result.pagination.page,
                    totalPages: result.pagination.totalPages
                });
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchProducts(1), 300);
        return () => clearTimeout(timer);
    }, [fetchProducts]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await safeDb.deleteProduct(id);
            toast.success('Product deleted successfully');
            fetchProducts(pagination.page);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const columns = [
        { header: 'SKU', accessor: 'sku' as const },
        { header: 'Name', accessor: 'name' as const },
        { header: 'Category', accessor: 'category' as const },
        {
            header: 'Stock',
            accessor: (p: any) => (
                <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{p.currentStock}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{p.unitType}</span>
                    {p.currentStock < p.minStockLevel && (
                        <Badge variant="danger" size="sm">LOW</Badge>
                    )}
                </div>
            )
        },
        {
            header: 'Cost Price',
            accessor: (p: any) => <span className="font-bold">₹{p.costPrice.toFixed(2)}</span>
        },
        {
            header: 'Actions',
            accessor: (p: any) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelectedProduct(p); setIsFormOpen(true); }}
                        className="text-xs font-black text-primary-600 uppercase hover:underline"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete(p.id)}
                        className="text-xs font-black text-rose-500 uppercase hover:underline"
                    >
                        Delete
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <ToastProvider />
            <Navbar />

            <div className="flex-1 p-8 space-y-8">
                <header className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">PRODUCT CATALOG</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manage your inventory and pricing tiers</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2" onClick={() => setIsBulkImportOpen(true)}>
                            <Upload className="w-4 h-4" /> Bulk Import
                        </Button>
                        <Button className="gap-2" onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
                            <Plus className="w-5 h-5" /> Add Product
                        </Button>
                    </div>
                </header>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="Search by name, SKU or barcode..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" /> Category
                    </Button>
                </div>

                <DataTable
                    data={products}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={{
                        page: pagination.page,
                        totalPages: pagination.totalPages,
                        onPageChange: (p) => fetchProducts(p)
                    }}
                />
            </div>

            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => fetchProducts(pagination.page)}
                initialData={selectedProduct}
            />

            <BulkImportModal
                isOpen={isBulkImportOpen}
                onClose={() => setIsBulkImportOpen(false)}
                onSuccess={() => fetchProducts(1)}
            />
        </div>
    );
}
