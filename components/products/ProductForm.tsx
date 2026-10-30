'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema } from '@/lib/validations';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PricingTierForm } from './PricingTierForm';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

type UnitType = 'PIECE' | 'KG' | 'METER' | 'BOX';
type CustomerType = 'REGULAR' | 'ELECTRICIAN' | 'PLUMBER';

export const ProductForm = ({
    isOpen,
    onClose,
    onSuccess,
    initialData
}: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}) => {
    const methods = useForm({
        resolver: zodResolver(createProductSchema),
        defaultValues: initialData || {
            name: '',
            sku: '',
            category: '',
            unitType: 'PIECE' as UnitType,
            costPrice: 0,
            currentStock: 0,
            minStockLevel: 0,
            pricingTiers: [
                { customerType: 'REGULAR' as CustomerType, sellingPrice: 0 },
                { customerType: 'ELECTRICIAN' as CustomerType, sellingPrice: 0 },
                { customerType: 'PLUMBER' as CustomerType, sellingPrice: 0 },
            ]
        }
    });

    const onSubmit = async (data: any) => {
        try {
            if (initialData) {
                // @ts-ignore
                await window.api.db.updateProduct(initialData.id, data);
                toast.success('Product updated successfully');
            } else {
                // @ts-ignore
                await window.api.db.createProduct(data);
                toast.success('Product created successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Product' : 'Add New Product'}>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Product Name"
                            {...methods.register('name')}
                            error={methods.formState.errors.name?.message as string}
                        />
                        <Input
                            label="SKU / Barcode"
                            {...methods.register('sku')}
                            error={methods.formState.errors.sku?.message as string}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Category"
                            {...methods.register('category')}
                            error={methods.formState.errors.category?.message as string}
                        />
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Unit Type</label>
                            <select
                                {...methods.register('unitType')}
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                            >
                                <option value="PIECE">PIECE</option>
                                <option value="KG">KG</option>
                                <option value="METER">METER</option>
                                <option value="BOX">BOX</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <Input
                            type="number"
                            step="0.01"
                            label="Cost Price"
                            {...methods.register('costPrice', { valueAsNumber: true })}
                            error={methods.formState.errors.costPrice?.message as string}
                        />
                        <Input
                            type="number"
                            label="Initial Stock"
                            {...methods.register('currentStock', { valueAsNumber: true })}
                            error={methods.formState.errors.currentStock?.message as string}
                        />
                        <Input
                            type="number"
                            label="Min Stock Lvl"
                            {...methods.register('minStockLevel', { valueAsNumber: true })}
                            error={methods.formState.errors.minStockLevel?.message as string}
                        />
                    </div>

                    <PricingTierForm />

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-6">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={methods.formState.isSubmitting}>
                            {initialData ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </Modal>
    );
};
