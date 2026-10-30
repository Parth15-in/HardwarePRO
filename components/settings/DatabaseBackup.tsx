'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export const DatabaseBackup = () => {
    const handleExport = async () => {
        try {
            const res = await fetch('/api/settings/backup');
            if (!res.ok) throw new Error('Backup failed');

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hardware_shop_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            toast.success('Backup downloaded successfully');
        } catch (error) {
            toast.error('Failed to export data');
        }
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (event: any) => {
                try {
                    const data = JSON.parse(event.target.result);
                    const res = await fetch('/api/settings/backup', {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (!res.ok) throw new Error('Restore failed');
                    toast.success('Data restored successfully. Please refresh the page.');
                } catch (error) {
                    toast.error('Failed to restore data. Invalid file format.');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <Card title="Database & Backup" subtitle="Secure your data with manual backups and restore options">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-2">
                        <Download className="w-5 h-5 text-primary-600" />
                        <h4 className="font-bold text-slate-900">Export All Data</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Download a complete backup of all products, customers, and sales in JSON format.</p>
                    <Button variant="outline" className="w-full" onClick={handleExport}>
                        Generate Backup
                    </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 mb-2">
                        <Upload className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-slate-900">Restore from Backup</h4>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">Restore your business data from a previously generated backup file. This will overwrite current data.</p>
                    <Button variant="outline" className="w-full" onClick={handleImport}>
                        Upload & Restore
                    </Button>
                </div>
            </div>
            <div className="mt-6 flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs font-medium">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                <span>Cloud sync is not active. Please perform regular manual backups.</span>
            </div>
        </Card>
    );
};
