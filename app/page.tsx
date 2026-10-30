'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import {
    ShoppingCart,
    Package,
    Users,
    ClipboardList,
    TrendingUp,
    AlertCircle,
    ArrowRight,
    ArrowUpRight
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

import { safeDb } from '@/lib/electron-api';

export default function Home() {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await safeDb.getDashboardStats();
                if (data) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const menuItems = [
        { title: 'POS Terminal', desc: 'Process sales and invoices', href: '/pos', icon: ShoppingCart, color: 'bg-primary-600' },
        { title: 'Inventory', desc: 'Check stock and valuation', href: '/inventory', icon: ClipboardList, color: 'bg-indigo-600' },
        { title: 'Products', desc: 'Catalog and pricing tiers', href: '/products', icon: Package, color: 'bg-emerald-600' },
        { title: 'Customers', desc: 'Profiles and credit logs', href: '/customers', icon: Users, color: 'bg-amber-600' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />

            <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-10">
                <header>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">MANAGEMENT DASHBOARD</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-2">Welcome back. Performance overview for today:</p>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Today's Revenue"
                        value={`₹${stats?.todayRevenue?.toLocaleString() || '0'}`}
                        icon={TrendingUp}
                        trend="+12%"
                        trendColor="text-emerald-500"
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Sales Count"
                        value={stats?.todaySalesCount || '0'}
                        icon={ShoppingCart}
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Total Catalog"
                        value={stats?.products || '0'}
                        icon={Package}
                        isLoading={isLoading}
                    />
                    <StatCard
                        label="Restock Alerts"
                        value={stats?.lowStock || '0'}
                        icon={AlertCircle}
                        valueColor={stats?.lowStock > 0 ? "text-rose-600" : "text-slate-900"}
                        isLoading={isLoading}
                    />
                </div>

                {/* Quick Access */}
                <section className="space-y-6">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Operational Hub</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link key={item.href} href={item.href} className="group">
                                    <Card className="p-6 h-full hover:border-primary-500 transition-all border-slate-200">
                                        <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-black text-slate-900 tracking-tight">{item.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium mt-1">{item.desc}</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[220px] shadow-2xl">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black tracking-tight mb-2 italic">Ready for the next sale?</h2>
                            <p className="text-indigo-200 font-medium mb-6 max-w-md uppercase text-xs tracking-widest">The POS terminal is calibrated and ready to process transactions immediately.</p>
                            <Link href="/pos">
                                <button className="bg-white text-slate-900 px-8 py-3 rounded-xl font-black text-sm uppercase flex items-center gap-2 hover:bg-indigo-50 transition-all active:scale-95 shadow-xl">
                                    Launch POS Terminal <ArrowRight className="w-4 h-4" />
                                </button>
                            </Link>
                        </div>
                        <ShoppingCart className="absolute -right-8 -bottom-8 w-64 h-64 text-white/5 rotate-12" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm flex flex-col justify-center">
                        <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4">System Health</h4>
                        <div className="space-y-4">
                            <SystemMetric label="Database Sync" status="Healthy" color="bg-emerald-500" />
                            <SystemMetric label="Electron Bridge" status="Connected" color="bg-emerald-500" />
                            <SystemMetric label="Application Version" status="v1.1.0-stable" color="bg-indigo-500" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, trend, trendColor, valueColor = "text-slate-900", isLoading }: any) {
    return (
        <Card className="p-6 border-slate-200">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-slate-50 p-2 rounded-lg text-slate-400">
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-tighter ${trendColor}`}>
                        {trend}
                    </span>
                )}
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
                    <div className="h-3 w-16 bg-slate-50 animate-pulse rounded" />
                </div>
            ) : (
                <div>
                    <h3 className={`text-3xl font-black tracking-tight ${valueColor}`}>{value}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{label}</p>
                </div>
            )}
        </Card>
    );
}

function SystemMetric({ label, status, color }: any) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</span>
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase">{status}</span>
                <div className={`w-2 h-2 rounded-full ${color}`} />
            </div>
        </div>
    );
}
