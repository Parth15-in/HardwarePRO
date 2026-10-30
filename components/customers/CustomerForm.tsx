'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCustomerSchema } from '@/lib/validations';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
export const CustomerForm = ({
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
    const [isCustomType, setIsCustomType] = useState(false);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(createCustomerSchema),
        defaultValues: initialData || {
            name: '',
            phone: '',
            email: '',
            address: '',
            customerType: 'REGULAR',
            creditLimit: 0
        }
    });

    const customerType = watch('customerType');

    const onSubmit = async (data: any) => {
        try {
            if (initialData) {
                // @ts-ignore
                await window.api.db.updateCustomer(initialData.id, data);
                toast.success('Customer updated successfully');
            } else {
                // @ts-ignore
                await window.api.db.createCustomer(data);
                toast.success('Customer created successfully');
            }
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Operation failed');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Customer' : 'Add New Customer'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                    label="Full Name"
                    {...register('name')}
                    error={errors.name?.message as string}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        label="Phone Number"
                        {...register('phone')}
                        error={errors.phone?.message as string}
                    />
                    <Input
                        label="Email Address"
                        {...register('email')}
                        error={errors.email?.message as string}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 hidden">
                        {/* Hidden input to hold the actual value if we needed complex logic, but here we can just use the register directly on the visible inputs or swap them. 
                            Actually, simpler approach:
                            1. Select has [REGULAR, ELECTRICIAN, PLUMBER, OTHER]
                            2. If OTHER, show text input.
                            3. But react-hook-form needs one field 'customerType'.
                            
                            Let's handle this:
                            - Register 'customerType' on the SELECT.
                            - If Select value is 'OTHER', show another input.
                            - Wait, if select is 'OTHER', the value submitted is 'OTHER'. We want custom text.
                            
                            Better approach:
                            - Use a controlled state for the select.
                            - If select is regular value, setValue('customerType', value).
                            - If select is OTHER, setValue('customerType', '') and show input to bind to 'customerType'? No, that conflicts.
                            
                            Let's use a separate field for the "Select" UI, and sync it to the form field 'customerType'.
                        */}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Customer Type</label>
                        {!isCustomType ? (
                            <select
                                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-100 outline-none"
                                value={['REGULAR', 'ELECTRICIAN', 'PLUMBER'].includes(customerType) ? customerType : 'OTHER'}
                                onChange={(e) => {
                                    if (e.target.value === 'OTHER') {
                                        setIsCustomType(true);
                                        setValue('customerType', '');
                                    } else {
                                        setValue('customerType', e.target.value);
                                    }
                                }}
                            >
                                <option value="REGULAR">REGULAR</option>
                                <option value="ELECTRICIAN">ELECTRICIAN</option>
                                <option value="PLUMBER">PLUMBER</option>
                                <option value="OTHER">Other (Specify)</option>
                            </select>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    {...register('customerType')}
                                    placeholder="Enter type (e.g. Contractor)"
                                    className="flex-1"
                                    autoFocus
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCustomType(false);
                                        setValue('customerType', 'REGULAR');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </div>

                    <Input
                        type="number"
                        label="Credit Limit"
                        {...register('creditLimit', { valueAsNumber: true })}
                        error={errors.creditLimit?.message as string}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Residential Address</label>
                    <textarea
                        {...register('address')}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-primary-100 outline-none min-h-[80px]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>
                        {initialData ? 'Update Profile' : 'Register Customer'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};
