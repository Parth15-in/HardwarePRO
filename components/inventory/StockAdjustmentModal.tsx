'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { safeDb } from '@/lib/electron-api';
import { toast } from 'sonner';

export const StockAdjustmentModal = ({
    product,
    isOpen,
    onClose,
    onSuccess
}: {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: {
            quantity: 1,
            notes: ''
        }
    });

    const onSubmit = async (data: any) => {
        try {
            await safeDb.adjustStock({
                productId: product.id,
                newStock: product.currentStock + data.quantity
            });
            toast.success('Inventory adjusted successfully');
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Adjustment failed');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Adjust Stock: ${product?.name}`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex justify-between items-center mb-4">
                    <div>
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Current Inventory</span>
                        <p className="text-2xl font-black text-primary-900">{product?.currentStock} {product?.unitType}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">SKU</span>
                        <p className="font-mono text-sm font-bold text-primary-600">{product?.sku}</p>
                    </div>
                </div>

                <Input
                    type="number"
                    label="Adjustment Quantity (+ to Add, - to Deduct)"
                    {...register('quantity', { valueAsNumber: true })}
                />

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Reason / Reference</label>
                    <textarea
                        {...register('notes')}
                        placeholder="e.g., Damage, Returns, Stock Correction..."
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-100 outline-none min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Discard</Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        Commit Adjustment
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
