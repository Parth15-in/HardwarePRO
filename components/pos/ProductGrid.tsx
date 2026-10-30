import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useCustomerStore } from '@/store/customer-store';
import { Plus } from 'lucide-react';

interface ProductGridProps {
    products: any[];
    onAdd: (product: any) => void;
}

export const ProductGrid = ({ products, onAdd }: ProductGridProps) => {
    const selectedCustomer = useCustomerStore((state) => state.selectedCustomer);
    const customerType = selectedCustomer?.customerType || 'REGULAR';

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 mt-6">
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm">Start typing in the search box above</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {products.map((product) => {
                const tier = product.pricingTiers.find((t: any) => t.customerType === customerType);
                const price = tier ? tier.sellingPrice : product.costPrice * 1.3;
                const isOutOfStock = product.currentStock <= 0;

                return (
                    <div
                        key={product.id}
                        onClick={() => !isOutOfStock && onAdd(product)}
                        className={`
              group relative flex flex-col justify-between p-4 bg-white rounded-xl border-2 transition-all cursor-pointer h-full
              ${isOutOfStock ? 'opacity-60 cursor-not-allowed grayscale' : 'hover:border-primary-500 hover:shadow-lg active:scale-95 border-slate-100'}
            `}
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{product.sku}</span>
                                <Badge variant={isOutOfStock ? 'danger' : product.currentStock < product.minStockLevel ? 'warning' : 'success'}>
                                    {product.currentStock} {product.unitType}
                                </Badge>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 leading-tight mb-1 group-hover:text-primary-600">
                                {product.name}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-2">{product.category}</p>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-slate-900">₹{price.toFixed(2)}</span>
                                <span className="text-[10px] text-primary-600 font-bold uppercase">{customerType} PRICE</span>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
                                <Plus className="h-6 w-6" />
                            </div>
                        </div>

                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-xl">
                                <Badge variant="danger" size="md">OUT OF STOCK</Badge>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
