'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Package, Users, ClipboardList, Settings, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'POS Terminal', href: '/pos', icon: ShoppingCart },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Inventory', href: '/inventory', icon: ClipboardList },
    { label: 'Reports', href: '/reports', icon: LayoutDashboard },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const isHome = pathname === '/';

    return (
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-6">
                {!isHome && (
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 transition-all border border-slate-100 shadow-sm flex items-center justify-center group"
                        title="Go Back"
                    >
                        <ChevronLeft className="w-5 h-5 group-active:-translate-x-1 transition-transform" />
                    </button>
                )}

                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary-600 p-1.5 rounded-lg text-white">
                        <Package className="w-5 h-5" />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tight">HARDWARE<span className="text-primary-600">PRO</span></span>
                </Link>

                <div className="hidden md:flex items-center gap-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-primary-50 text-primary-600"
                                        : "text-slate-800 hover:bg-slate-50 hover:text-slate-950"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex flex-col items-end mr-2 text-right">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none">Logged in as</span>
                    <span className="text-sm font-black text-slate-950">ADMINISTRATOR</span>
                </div>
                <div className="h-10 w-10 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-600">
                    <Settings className="w-5 h-5" />
                </div>
            </div>
        </nav>
    );
};
