import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/Card';

interface TopProduct {
    productId: string;
    productName: string;
    sku: string;
    quantitySold: number;
    revenue: number;
}

interface TopProductsProps {
    data: TopProduct[];
}

const COLORS = ['#4f46e5', '#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6'];

export const TopProducts = ({ data }: TopProductsProps) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Card title="Top 10 Best Selling Products">
                <div className="h-[300px] w-full flex items-center justify-center text-slate-400">
                    Loading products chart...
                </div>
            </Card>
        );
    }

    return (
        <Card title="Top 10 Best Selling Products">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="99%" height={300}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={100}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
