'use client';

import { Toaster as Sonner } from 'sonner';

export const ToastProvider = () => {
    return (
        <Sonner
            position="top-right"
            toastOptions={{
                className: 'rounded-xl border border-slate-200 shadow-xl font-sans',
            }}
        />
    );
};
