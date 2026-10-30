export interface ElectronAPI {
    send: (channel: string, data?: any) => void;
    receive: (channel: string, func: (...args: any[]) => void) => void;
    db: {
        // Products
        getProducts: (filters?: any) => Promise<any>;
        createProduct: (data: any) => Promise<any>;
        updateProduct: (id: string, data: any) => Promise<any>;
        deleteProduct: (id: string) => Promise<any>;
        searchProducts: (query: string) => Promise<any>;
        bulkImportProducts: (products: any[]) => Promise<any>;

        // Customers
        getCustomers: (filters?: any) => Promise<any>;
        createCustomer: (data: any) => Promise<any>;
        updateCustomer: (id: string, data: any) => Promise<any>;
        deleteCustomer: (id: string) => Promise<any>;

        // Sales & Reports
        createSale: (data: any) => Promise<any>;
        getSalesReport: (filters: any) => Promise<any>;
        getProfitReport: (filters: any) => Promise<any>;
        getCustomerReport: (filters: any) => Promise<any>;
        getDashboardStats: () => Promise<any>;

        // Inventory
        adjustStock: (data: any) => Promise<any>;

        // Settings
        getSettings: () => Promise<any>;
        updateSettings: (settings: any) => Promise<any>;
    };
}

declare global {
    interface Window {
        api: ElectronAPI;
    }
}
