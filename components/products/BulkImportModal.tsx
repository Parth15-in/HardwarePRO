'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as Papa from 'papaparse';
import { read, utils } from 'xlsx';
import { toast } from 'sonner';

// Using local types and strings to avoid Prisma type propagation issues in the UI layer
type UnitType = 'PIECE' | 'KG' | 'METER' | 'BOX';
type CustomerType = 'REGULAR' | 'ELECTRICIAN' | 'PLUMBER';

interface BulkImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const BulkImportModal = ({ isOpen, onClose, onSuccess }: BulkImportModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isParsing, setIsParsing] = useState(false);
    const [preview, setPreview] = useState<any[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            if (selectedFile.name.endsWith('.csv')) {
                parseCSV(selectedFile);
            } else if (selectedFile.name.match(/\.(xlsx|xls)$/)) {
                parseExcel(selectedFile);
            } else {
                toast.error('Unsupported file format. Please upload CSV or Excel.');
            }
        }
    };

    const parseCSV = (file: File) => {
        setIsParsing(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setPreview(results.data);
                setIsParsing(false);
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
                setIsParsing(false);
            }
        });
    };

    const parseExcel = async (file: File) => {
        setIsParsing(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = read(buffer);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = utils.sheet_to_json(sheet);
            setPreview(data);
        } catch (error: any) {
            toast.error(`Error parsing Excel: ${error.message}`);
        } finally {
            setIsParsing(false);
        }
    };

    const handleImport = async () => {
        if (preview.length === 0) return;

        try {
            // Map CSV/Excel data to Prisma Model
            const productsToImport = preview.map((row: any) => {
                const rawUnit = (row.Unit || row.unit || 'PIECE').toUpperCase();
                // @ts-ignore
                const unitType = ['PIECE', 'KG', 'METER', 'BOX'].includes(rawUnit) ? rawUnit as UnitType : 'PIECE' as UnitType;

                return {
                    sku: row.SKU || row.sku || row.Barcode,
                    name: row.Name || row.name || row.Product,
                    category: row.Category || row.category || 'General',
                    unitType: unitType,
                    costPrice: parseFloat(row.CostPrice || row.cost || row.Price || '0') || 0,
                    currentStock: parseFloat(row.Stock || row.quantity || '0') || 0,
                    minStockLevel: parseFloat(row.MinStock || '5') || 0,
                    pricingTiers: [
                        { customerType: 'REGULAR', sellingPrice: parseFloat(row.RegularPrice || row.selling || row.SellingPrice || '0') || 0 },
                        { customerType: 'ELECTRICIAN', sellingPrice: parseFloat(row.ElectricianPrice || row.selling || '0') || 0 },
                        { customerType: 'PLUMBER', sellingPrice: parseFloat(row.PlumberPrice || row.selling || '0') || 0 },
                    ].filter(t => t.sellingPrice > 0)
                };
            });

            // @ts-ignore
            await window.api.db.bulkImportProducts(productsToImport);
            toast.success(`Successfully imported ${productsToImport.length} products`);
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || 'Import failed');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Products">
            <div className="space-y-6">
                <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-primary-600 shrink-0" />
                    <div className="text-xs text-primary-800 space-y-1">
                        <p className="font-bold uppercase tracking-tight">File Requirements:</p>
                        <p>Format: CSV or Excel (.xlsx, .xls)</p>
                        <p>Columns: Name, SKU, Category, CostPrice, Stock, RegularPrice</p>
                    </div>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary-400 transition-all bg-slate-50 relative overflow-hidden">
                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                    />
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400">
                        <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-900">{file ? file.name : 'Select File'}</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase tracking-tight">Click or drag and drop to upload</p>
                    </div>
                </div>

                {preview.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                File Ready ({preview.length} items)
                            </span>
                        </div>
                        <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl text-[10px] font-medium bg-slate-50/50">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 bg-white border-b border-slate-100">
                                    <tr>
                                        <th className="px-3 py-2 text-slate-400 uppercase">Name</th>
                                        <th className="px-3 py-2 text-slate-400 uppercase">SKU</th>
                                        <th className="px-3 py-2 text-slate-400 uppercase text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="border-b border-white">
                                            <td className="px-3 py-2 text-slate-700 truncate max-w-[120px]">{row.Name || row.name || row.Product}</td>
                                            <td className="px-3 py-2 text-slate-500">{row.SKU || row.sku || row.Barcode}</td>
                                            <td className="px-3 py-2 text-slate-900 font-bold text-right">₹{row.RegularPrice || row.Price || 0}</td>
                                        </tr>
                                    ))}
                                    {preview.length > 10 && (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-2 text-slate-400 italic text-center">...plus {preview.length - 10} more items</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        disabled={preview.length === 0}
                        isLoading={isParsing}
                        onClick={handleImport}
                        className="gap-2"
                    >
                        <Upload className="w-4 h-4" /> Start Bulk Import
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
