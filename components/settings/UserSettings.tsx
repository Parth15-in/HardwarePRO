'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface UserSettingsProps {
    initialData: any;
    onSave: (data: any) => Promise<void>;
}

export const UserSettings = ({ initialData, onSave }: UserSettingsProps) => {
    const { register, handleSubmit, formState: { isSubmitting } } = useForm({
        defaultValues: initialData,
    });

    const onSubmit = async (data: any) => {
        try {
            await onSave(data);
            toast.success('Preferences updated');
        } catch (error) {
            toast.error('Failed to update preferences');
        }
    };

    return (
        <Card title="User Preferences" subtitle="Customize your display and receipt settings">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-slate-900">Display Theme</p>
                            <p className="text-sm text-slate-500">Choose between light and dark mode</p>
                        </div>
                        <select
                            {...register('displayTheme')}
                            className="flex h-10 w-32 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <div>
                            <p className="font-bold text-slate-900">Receipt Template</p>
                            <p className="text-sm text-slate-500">Select the layout for printed receipts</p>
                        </div>
                        <select
                            {...register('receiptTemplate')}
                            className="flex h-10 w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Standard">Standard (80mm)</option>
                            <option value="Compact">Compact (58mm)</option>
                            <option value="A4">Full Page (A4)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={isSubmitting}>
                        Save Preferences
                    </Button>
                </div>
            </form>
        </Card>
    );
};
