'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Navbar } from '@/components/layout/Navbar';
import { BusinessSettings } from '@/components/settings/BusinessSettings';
import { UserSettings } from '@/components/settings/UserSettings';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { toast } from 'sonner';

export default function SettingsPage() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            // @ts-ignore
            const result = await window.api.db.getSettings();
            return result.data;
        }
    });

    const updateSettingsMutation = useMutation({
        mutationFn: async (newSettings: any) => {
            // @ts-ignore
            return await window.api.db.updateSettings(newSettings);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        }
    });

    const handleSaveBusiness = async (data: any) => {
        await updateSettingsMutation.mutateAsync({ ...settings, ...data });
    };

    const handleSaveUser = async (data: any) => {
        await updateSettingsMutation.mutateAsync({ ...settings, ...data });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Navbar />
                <main className="p-8 max-w-4xl mx-auto space-y-8">
                    <div className="h-64 bg-white rounded-xl animate-pulse" />
                    <div className="h-64 bg-white rounded-xl animate-pulse" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="p-8 max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">SYSTEM SETTINGS</h1>
                    <p className="text-slate-500 font-medium">Configure your business details and application preferences</p>
                </div>

                <div className="space-y-8">
                    <BusinessSettings
                        initialData={settings}
                        onSave={handleSaveBusiness}
                    />

                    <UserSettings
                        initialData={settings}
                        onSave={handleSaveUser}
                    />

                    <DatabaseBackup />
                </div>
            </main>
        </div>
    );
}
