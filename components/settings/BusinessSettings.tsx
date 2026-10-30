'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

const businessSettingsSchema = z.object({
    businessName: z.string().min(1, 'Business name is required'),
    address: z.string().min(1, 'Address is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email().optional().or(z.literal('')),
    taxRate: z.coerce.number().min(0) as z.ZodType<number>,
    currency: z.string().min(1),
});

type BusinessSettingsValues = z.infer<typeof businessSettingsSchema>;

interface BusinessSettingsProps {
    initialData: any;
    onSave: (data: BusinessSettingsValues) => Promise<void>;
}

export const BusinessSettings = ({ initialData, onSave }: BusinessSettingsProps) => {
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BusinessSettingsValues>({
        resolver: zodResolver(businessSettingsSchema),
        defaultValues: initialData,
    });

    const onSubmit = async (data: BusinessSettingsValues) => {
        try {
            await onSave(data);
            toast.success('Business settings updated');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    return (
        <Card title="Business Details" subtitle="Manage your shop information and tax settings">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Shop Name"
                        {...register('businessName')}
                        error={errors.businessName?.message}
                    />
                    <Input
                        label="Phone Number"
                        {...register('phone')}
                        error={errors.phone?.message}
                    />
                    <div className="md:col-span-2">
                        <Input
                            label="Address"
                            {...register('address')}
                            error={errors.address?.message}
                        />
                    </div>
                    <Input
                        label="Email Address"
                        {...register('email')}
                        error={errors.email?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Tax Rate (%)"
                            type="number"
                            {...register('taxRate', { valueAsNumber: true })}
                            error={errors.taxRate?.message}
                        />
                        <Input
                            label="Currency"
                            {...register('currency')}
                            error={errors.currency?.message}
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        Save Business Settings
                    </Button>
                </div>
            </form>
        </Card>
    );
};
