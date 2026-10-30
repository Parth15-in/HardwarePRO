'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { SalesReport } from '@/components/reports/SalesReport';
import { ProfitAnalysis } from '@/components/reports/ProfitAnalysis';
import { TopProducts } from '@/components/reports/TopProducts';
import { CustomerReport } from '@/components/reports/CustomerReport';
import { Card } from '@/components/ui/Card';

export default function ReportsPage() {
    const [filters, setFilters] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        period: 'monthly'
    });

    const { data: salesData, isLoading: isLoadingSales } = useQuery({
        queryKey: ['reports', 'sales', filters],
        queryFn: async () => {
            // @ts-ignore
            return await window.api.db.getSalesReport(filters);
        }
    });

    const { data: profitData, isLoading: isLoadingProfit } = useQuery({
        queryKey: ['reports', 'profit', filters],
        queryFn: async () => {
            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate
            };
            // @ts-ignore
            return await window.api.db.getProfitReport(params);
        }
    });

    const { data: customerData, isLoading: isLoadingCustomers } = useQuery({
        queryKey: ['reports', 'customers'],
        queryFn: async () => {
            // @ts-ignore
            return await window.api.db.getCustomerReport();
        }
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="p-8 max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">REPORTING DASHBOARD</h1>
                    <p className="text-slate-500 font-medium">Analyze your business performance and growth</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {isLoadingProfit ? (
                        <div className="h-[400px] bg-white rounded-xl animate-pulse" />
                    ) : (
                        profitData && <ProfitAnalysis data={profitData.data} />
                    )}

                    {isLoadingSales ? (
                        <div className="h-[400px] bg-white rounded-xl animate-pulse" />
                    ) : (
                        salesData && <TopProducts data={salesData.data.topProducts} />
                    )}
                </div>

                <div className="space-y-8">
                    {isLoadingSales ? (
                        <div className="h-[600px] bg-white rounded-xl animate-pulse" />
                    ) : (
                        salesData && (
                            <SalesReport
                                data={salesData.data}
                                filters={filters}
                                onFilterChange={setFilters}
                            />
                        )
                    )}

                    {isLoadingCustomers ? (
                        <div className="h-[600px] bg-white rounded-xl animate-pulse" />
                    ) : (
                        customerData && <CustomerReport data={customerData.data} />
                    )}
                </div>
            </main>
        </div>
    );
}
