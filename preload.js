const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
    send: (channel, data) => {
        // whitelist channels
        let validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    // FIX #8: Use removeAllListeners before re-registering to prevent listener accumulation.
    // Previously: ipcRenderer.on() was called on every React mount with no cleanup,
    // stacking unlimited listeners on the same channel.
    receive: (channel, func) => {
        let validChannels = ['fromMain', 'print-receipt'];
        if (validChannels.includes(channel)) {
            // Remove any previous listeners on this channel before adding a new one.
            ipcRenderer.removeAllListeners(channel);
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    },
    // Returns a cleanup function so React's useEffect can deregister the listener.
    on: (channel, func) => {
        let validChannels = ['fromMain', 'print-receipt'];
        if (validChannels.includes(channel)) {
            const listener = (event, ...args) => func(...args);
            ipcRenderer.on(channel, listener);
            // Return a cleanup function for use in useEffect return
            return () => ipcRenderer.removeListener(channel, listener);
        }
        return () => {};
    },
    db: {
        // Products
        getProducts: (filters) => ipcRenderer.invoke('db-get-products', filters),
        createProduct: (data) => ipcRenderer.invoke('db-create-product', data),
        // FIX #12: Was sending (id, data) as two separate args; main.js handler expects
        // a single object { id, data }. Mismatch caused silent failure on every update.
        updateProduct: (id, data) => ipcRenderer.invoke('db-update-product', { id, data }),
        deleteProduct: (id) => ipcRenderer.invoke('db-delete-product', id),
        searchProducts: (query) => ipcRenderer.invoke('db-search-products', query),
        bulkImportProducts: (products) => ipcRenderer.invoke('db-bulk-import-products', products),

        // Customers
        getCustomers: (filters) => ipcRenderer.invoke('db-get-customers', filters),
        createCustomer: (data) => ipcRenderer.invoke('db-create-customer', data),
        updateCustomer: (id, data) => ipcRenderer.invoke('db-update-customer', { id, data }),
        deleteCustomer: (id) => ipcRenderer.invoke('db-delete-customer', id),

        // Sales & Reports
        createSale: (data) => ipcRenderer.invoke('db-create-sale', data),
        getSalesReport: (filters) => ipcRenderer.invoke('db-get-sales-report', filters),
        getProfitReport: (filters) => ipcRenderer.invoke('db-get-profit-report', filters),
        getCustomerReport: (filters) => ipcRenderer.invoke('db-get-customer-report', filters),
        getDashboardStats: () => ipcRenderer.invoke('db-get-dashboard-stats'),

        // Inventory
        adjustStock: (data) => ipcRenderer.invoke('db-adjust-stock', data),

        // Settings
        getSettings: () => ipcRenderer.invoke('db-get-settings'),
        updateSettings: (settings) => ipcRenderer.invoke('db-update-settings', settings),
    }
});
