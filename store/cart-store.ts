import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CustomerType, Product, PricingTier } from '@prisma/client';

export interface CartItem {
    id: string; // Product ID
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    stock: number;
    unitType: string;
}

interface CartState {
    items: CartItem[];
    discount: number;
    taxRate: number; // Percentage

    // Actions
    addItem: (product: any, customerType: CustomerType) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    setDiscount: (amount: number) => void;
    clearCart: () => void;

    // Computed (Calculated in the store update)
    getTotals: () => {
        subtotal: number;
        discountAmount: number;
        taxAmount: number;
        total: number;
    };
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            discount: 0,
            taxRate: 0, // Hardware shops often show inclusive tax or simple discount-based pricing

            addItem: (product, customerType) => {
                const { items } = get();
                const existingItem = items.find((i) => i.id === product.id);

                // Find correct price from pricing tiers
                const tier = product.pricingTiers.find((t: any) => t.customerType === customerType);
                const price = tier ? tier.sellingPrice : product.costPrice * 1.3; // Fallback to 30% markup

                if (existingItem) {
                    set({
                        items: items.map((i) =>
                            i.id === product.id
                                ? {
                                    ...i,
                                    quantity: i.quantity + 1,
                                    lineTotal: (i.quantity + 1) * price
                                }
                                : i
                        ),
                    });
                } else {
                    set({
                        items: [
                            ...items,
                            {
                                id: product.id,
                                sku: product.sku,
                                name: product.name,
                                quantity: 1,
                                unitPrice: price,
                                lineTotal: price,
                                stock: product.currentStock,
                                unitType: product.unitType,
                            },
                        ],
                    });
                }
            },

            removeItem: (productId) => {
                set({ items: get().items.filter((i) => i.id !== productId) });
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }

                set({
                    items: get().items.map((i) =>
                        i.id === productId
                            ? { ...i, quantity, lineTotal: quantity * i.unitPrice }
                            : i
                    ),
                });
            },

            setDiscount: (amount) => set({ discount: amount }),

            clearCart: () => set({ items: [], discount: 0 }),

            getTotals: () => {
                const subtotal = get().items.reduce((acc, item) => acc + item.lineTotal, 0);
                const discountAmount = get().discount;
                const taxAmount = (subtotal - discountAmount) * (get().taxRate / 100);
                const total = subtotal - discountAmount + taxAmount;

                return { subtotal, discountAmount, taxAmount, total };
            },
        }),
        {
            name: 'hardware-pos-cart',
        }
    )
);
