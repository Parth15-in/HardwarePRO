'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';

interface CustomerSalesData {
    id: string;
    name: string;
    phone: string;
    customerType: string;
    totalPurchaseAmount: number;
    saleCount: number;
    lastPurchaseDate: string | null;
}

interface CustomerReportProps {
    data: CustomerSalesData[];
}

export const CustomerReport = ({ data }: CustomerReportProps) => {
    const columns = [
        { header: 'Customer Name', accessor: 'name' as any },
        { header: 'Phone', accessor: 'phone' as any },
        {
            header: 'Type',
            accessor: (item: any) => (
                <Badge variant={
                    item.customerType === 'ELECTRICIAN' ? 'info' :
                        item.customerType === 'PLUMBER' ? 'warning' : 'slate'
                }>
                    {item.customerType}
                </Badge>
            )
        },
        {
            header: 'Total Purchases',
            accessor: (item: any) => `₹${item.totalPurchaseAmount.toLocaleString()}`
        },
        { header: 'Orders', accessor: 'saleCount' as any },
        {
            header: 'Last Purchase',
            accessor: (item: any) => item.lastPurchaseDate
                ? new Date(item.lastPurchaseDate).toLocaleDateString()
                : 'Never'
        },
    ];

    return (
        <Card
            title="Customer Purchase Summary"
            subtitle="Ranking customers by total purchase volume"
        >
            <DataTable
                columns={columns}
                data={data}
                isLoading={false}
            />
        </Card>
    );
};
