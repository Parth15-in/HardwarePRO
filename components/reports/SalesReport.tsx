'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/ui/DataTable';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/lib/export-utils';

interface SaleEntry {
    id: string;
    billNumber: string;
    customerName: string;
    saleDate: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
}

interface SalesReportProps {
    data: any; // The report object from API
    filters: {
        startDate: string;
        endDate: string;
        period: string;
    };
    onFilterChange: (filters: any) => void;
}

export const SalesReport = ({ data, filters, onFilterChange }: SalesReportProps) => {
    const handleExportExcel = () => {
        const exportData = data.sales.map((sale: any) => ({
            'Bill Number': sale.billNumber,
            'Customer': sale.customer?.name || 'Walk-in',
            'Date': new Date(sale.saleDate).toLocaleDateString(),
            'Total Amount': sale.totalAmount,
            'Payment Method': sale.paymentMethod,
            'Status': sale.paymentStatus
        }));
        exportToExcel(exportData, `Sales_Report_${filters.startDate}_to_${filters.endDate}`);
    };

    const handleExportPDF = () => {
        const headers = ['Bill No', 'Customer', 'Date', 'Amount', 'Method', 'Status'];
        const body = data.sales.map((sale: any) => [
            sale.billNumber,
            sale.customer?.name || 'Walk-in',
            new Date(sale.saleDate).toLocaleDateString(),
            `₹${sale.totalAmount}`,
            sale.paymentMethod,
            sale.paymentStatus
        ]);
        exportToPDF(headers, body, `Sales_Report_${filters.startDate}_to_${filters.endDate}`, 'Sales Report');
    };

    const columns = [
        { header: 'Bill Number', accessor: 'billNumber' as any },
        {
            header: 'Customer',
            accessor: (item: any) => item.customer?.name || 'Walk-in'
        },
        {
            header: 'Date',
            accessor: (item: any) => new Date(item.saleDate).toLocaleDateString()
        },
        {
            header: 'Amount',
            accessor: (item: any) => `₹${item.totalAmount.toLocaleString()}`
        },
        { header: 'Method', accessor: 'paymentMethod' as any },
    ];

    return (
        <Card
            title="Sales Transactions"
            subtitle={`Showing ${data.totalSales} transactions | Total Revenue: ₹${data.totalRevenue.toLocaleString()}`}
            footer={
                <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={handleExportExcel}>
                        <TableIcon className="w-4 h-4 mr-2" />
                        Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        PDF
                    </Button>
                </div>
            }
        >
            <div className="flex flex-wrap gap-4 mb-6 items-end">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Period</label>
                    <select
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={filters.period}
                        onChange={(e) => onFilterChange({ ...filters, period: e.target.value })}
                    >
                        <option value="daily">Today</option>
                        <option value="monthly">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                {filters.period === 'custom' && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">From</label>
                            <Input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase">To</label>
                            <Input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </>
                )}
            </div>

            <DataTable
                columns={columns}
                data={data.sales || []}
                isLoading={false}
            />
        </Card>
    );
};
