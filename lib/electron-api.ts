import { ElectronAPI } from '../types/electron';

/**
 * Safely accesses the Electron API exposed via contextBridge.
 * Returns null if not in an Electron environment or if the API is not yet initialized.
 */
export const getElectronApi = (): ElectronAPI | null => {
    if (typeof window !== 'undefined' && window.api) {
        return window.api;
    }
    return null;
};

/**
 * Proxy-based safe database access.
 * Returns a fallback that logs a warning if the API is unavailable.
 */
export const safeDb = new Proxy({} as ElectronAPI['db'], {
    get: (target, prop: keyof ElectronAPI['db']) => {
        const api = getElectronApi();
        if (api && api.db && typeof api.db[prop] === 'function') {
            return api.db[prop];
        }

        return async (...args: any[]) => {
            console.warn(`Electron API (db.${String(prop)}) is not available.`);
            return null;
        };
    }
});
