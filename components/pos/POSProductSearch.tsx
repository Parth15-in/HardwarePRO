import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { safeDb } from '@/lib/electron-api';

interface POSProductSearchProps {
    onSelect: (product: any) => void;
    onProductsLoaded: (products: any[]) => void;
}

export const POSProductSearch = ({ onSelect, onProductsLoaded }: POSProductSearchProps) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // FIX #6: onProductsLoaded in the useEffect dependency array means the effect re-fires
    // any time the parent re-renders and produces a new function reference (even if stable).
    // Capture it in a ref so changes to the callback never trigger an extra search.
    const onProductsLoadedRef = useRef(onProductsLoaded);
    useEffect(() => { onProductsLoadedRef.current = onProductsLoaded; });

    useEffect(() => {
        const searchProducts = async () => {
            if (query.length < 2) {
                onProductsLoadedRef.current([]);
                return;
            }

            setIsLoading(true);
            try {
                const products = await safeDb.searchProducts(query);
                if (products) {
                    onProductsLoadedRef.current(products);
                }
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(searchProducts, 300);
        return () => clearTimeout(debounce);
    }, [query]); // query is the only real trigger — callback changes are absorbed by the ref

    return (
        <div className="relative">
            <Input
                autoFocus
                id="pos-search-input"
                placeholder="Scan barcode or type name/SKU (F2)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="text-lg py-3 shadow-md border-primary-100"
            />
            {isLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent animate-spin rounded-full"></div>
                </div>
            )}
        </div>
    );
};
