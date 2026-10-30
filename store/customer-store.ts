import { create } from 'zustand';
import { CustomerType } from '@prisma/client';

export interface SelectedCustomer {
    id: string;
    name: string;
    phone: string;
    customerType: CustomerType;
    outstandingBalance: number;
}

interface CustomerState {
    selectedCustomer: SelectedCustomer | null;
    selectCustomer: (customer: SelectedCustomer | null) => void;
}

export const useCustomerStore = create<CustomerState>((set) => ({
    selectedCustomer: null,
    selectCustomer: (customer) => set({ selectedCustomer: customer }),
}));
