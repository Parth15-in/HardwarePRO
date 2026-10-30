import React, { useState, useEffect } from 'react';
import { User, Phone, Check } from 'lucide-react';
import { useCustomerStore, SelectedCustomer } from '@/store/customer-store';
import { Badge } from '@/components/ui/Badge';
import { apiClient } from '@/lib/api-client';

export const CustomerSelector = () => {
    const { selectedCustomer, selectCustomer } = useCustomerStore();
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const fetchCustomers = async () => {
            if (search.length < 2) {
                setCustomers([]);
                return;
            }
            try {
                // @ts-ignore
                const result = await window.api.db.getCustomers({ search, limit: 5 });
                setCustomers(result.data);
            } catch (error) {
                console.error('Failed to fetch customers:', error);
            }
        };

        const timer = setTimeout(fetchCustomers, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const handleSelect = (customer: any) => {
        selectCustomer({
            id: customer.id,
            name: customer.name,
            phone: customer.phone,
            customerType: customer.customerType,
            outstandingBalance: customer.outstandingBalance,
        });
        setSearch('');
        setIsDropdownOpen(false);
    };

    return (
        <div className="relative w-full">
            <div
                className={`
          flex items-center gap-3 p-3 bg-white border rounded-xl shadow-sm transition-all cursor-pointer
          ${selectedCustomer ? 'border-primary-200 bg-primary-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-white'}
        `}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <div className={`p-2 rounded-full ${selectedCustomer ? 'bg-primary-100 text-primary-600' : 'bg-slate-200 text-slate-400'}`}>
                    <User className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    {selectedCustomer ? (
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 truncate leading-tight">{selectedCustomer.name}</span>
                                <Badge variant="info" size="sm" className="py-0 h-5">{selectedCustomer.customerType}</Badge>
                            </div>
                            <span className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                                <Phone className="w-3 h-3 text-primary-500" />
                                <span className="tracking-wide">{selectedCustomer.phone}</span>
                            </span>
                        </div>
                    ) : (
                        <div className="text-sm font-black text-slate-700">Select Customer (Walk-in)...</div>
                    )}
                </div>

                {selectedCustomer && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            selectCustomer(null);
                        }}
                        className="text-[10px] font-black text-rose-500 uppercase px-2 py-1 rounded-md hover:bg-rose-50"
                    >
                        Reset
                    </button>
                )}
            </div>

            {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <input
                            autoFocus
                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                            placeholder="Type name or phone (F3)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {customers.map((c) => (
                            <div
                                key={c.id}
                                className="px-4 py-3 hover:bg-primary-50 cursor-pointer flex items-center justify-between group transition-colors"
                                onClick={() => handleSelect(c)}
                            >
                                <div>
                                    <div className="font-bold text-slate-900 group-hover:text-primary-700">{c.name}</div>
                                    <div className="text-xs text-slate-700 font-black tracking-tight">{c.phone}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge variant="slate" size="sm">{c.customerType}</Badge>
                                    {c.outstandingBalance > 0 && (
                                        <span className="text-[10px] text-rose-500 font-black">₹{c.outstandingBalance} DUE</span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {search.length >= 2 && customers.length === 0 && (
                            <div className="px-4 py-8 text-center text-slate-700 font-bold text-sm">No customers found</div>
                        )}

                        {search.length < 2 && (
                            <div className="px-4 py-8 text-center text-slate-600 font-bold text-sm italic">Search to see results</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
