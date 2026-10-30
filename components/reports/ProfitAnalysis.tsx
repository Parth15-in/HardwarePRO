import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/Card';

interface ProfitData {
    customerType: string;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    transactionCount: number;
}

interface ProfitAnalysisProps {
    data: ProfitData[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b'];

export const ProfitAnalysis = ({ data }: ProfitAnalysisProps) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Card title="Profit Analysis by Customer Type">
                <div className="h-[300px] w-full flex items-center justify-center text-slate-400">
                    Loading profit chart...
                </div>
            </Card>
        );
    }

    return (
        <Card title="Profit Analysis by Customer Type">
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="99%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="profit"
                            nameKey="customerType"
                            label={({ payload, percent }) => payload?.customerType ? `${payload.customerType} (${(percent ? percent * 100 : 0).toFixed(1)}%)` : ''}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Profit']}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
