'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { UserPlus, Search, Filter, Download, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { safeDb } from '@/lib/electron-api';
import { Badge } from '@/components/ui/Badge';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { toast } from 'sonner';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

    const fetchCustomers = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const result = await safeDb.getCustomers({ page, search });
            if (result) {
                setCustomers(result.data);
                setPagination({
                    page: result.pagination.page,
                    totalPages: result.pagination.totalPages
                });
            }
        } catch (error) {
            toast.error('Failed to load customers');
        } finally {
            setIsLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(() => fetchCustomers(1), 300);
        return () => clearTimeout(timer);
    }, [fetchCustomers]);

    const columns = [
        { header: 'Full Name', accessor: 'name' as const },
        { header: 'Phone', accessor: 'phone' as const },
        {
            header: 'Category',
            accessor: (c: any) => <Badge variant="slate" size="md">{c.customerType}</Badge>
        },
        {
            header: 'Outstanding Balance',
            accessor: (c: any) => (
                <span className={cn("font-black", c.outstandingBalance > 0 ? "text-rose-600" : "text-emerald-600")}>
                    ₹{parseFloat(c.outstandingBalance).toFixed(2)}
                </span>
            )
        },
        {
            header: 'Credit Limit',
            accessor: (c: any) => <span className="font-bold text-slate-500">₹{parseFloat(c.creditLimit).toFixed(2)}</span>
        },
        {
            header: 'Actions',
            accessor: (c: any) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => { setSelectedCustomer(c); setIsFormOpen(true); }}
                        className="text-xs font-black text-primary-600 uppercase hover:underline"
                    >
                        Manage
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
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">CUSTOMER DIRECTORY</h2>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Manage profiles and professional accounts</p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download className="w-4 h-4" /> Export CSV
                        </Button>
                        <Button className="gap-2" onClick={() => { setSelectedCustomer(null); setIsFormOpen(true); }}>
                            <UserPlus className="w-5 h-5" /> Add Customer
                        </Button>
                    </div>
                </header>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100"
                            placeholder="Search by name or contact number..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="w-4 h-4" /> Account Type
                    </Button>
                </div>

                <DataTable
                    data={customers}
                    columns={columns}
                    isLoading={isLoading}
                    pagination={{
                        page: pagination.page,
                        totalPages: pagination.totalPages,
                        onPageChange: (p) => fetchCustomers(p)
                    }}
                />
            </div>

            <CustomerForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => fetchCustomers(pagination.page)}
                initialData={selectedCustomer}
            />
        </div>
    );
}

// Utility for cn in this file if not imported correctly
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
