import { z } from 'zod';
import { PaymentMethod, PaymentStatus, UnitType } from '@prisma/client';

// ==================== Product Validations ====================

export const createProductSchema = z.object({
    sku: z.string().min(1, 'SKU is required').max(100),
    name: z.string().min(1, 'Product name is required').max(255),
    description: z.string().optional(),
    category: z.string().min(1, 'Category is required').max(100),
    unitType: z.nativeEnum(UnitType),
    currentStock: z.number().min(0).default(0),
    minStockLevel: z.number().min(0).default(0),
    costPrice: z.number().min(0, 'Cost price must be positive'),
    supplierId: z.string().uuid().optional(),
    pricingTiers: z.array(
        z.object({
            customerType: z.string().min(1, 'Customer type is required'),
            sellingPrice: z.number().min(0, 'Selling price must be positive'),
            minQuantity: z.number().min(1).default(1),
        })
    ).min(1, 'At least one pricing tier is required'),
});

export const updateProductSchema = z.object({
    sku: z.string().min(1).max(100).optional(),
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    category: z.string().min(1).max(100).optional(),
    unitType: z.nativeEnum(UnitType).optional(),
    minStockLevel: z.number().min(0).optional(),
    costPrice: z.number().min(0).optional(),
    supplierId: z.string().uuid().optional(),
});

export const productFiltersSchema = z.object({
    category: z.string().optional(),
    search: z.string().optional(),
    lowStock: z.string().transform(val => val === 'true').optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
});

// ==================== Customer Validations ====================

export const createCustomerSchema = z.object({
    name: z.string().min(1, 'Customer name is required').max(255),
    phone: z.string().min(10, 'Valid phone number is required').max(20),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
    customerType: z.string().default('REGULAR'),
    creditLimit: z.number().min(0).default(0),
});

export const updateCustomerSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    phone: z.string().min(10).max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    customerType: z.string().optional(),
    creditLimit: z.number().min(0).optional(),
});

// ==================== Sale Validations ====================

export const createSaleSchema = z.object({
    customerId: z.string().uuid().optional(),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
        })
    ).min(1, 'At least one item is required'),
    discount: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    paymentMethod: z.nativeEnum(PaymentMethod),
    paymentAmount: z.number().min(0).optional(),
    createdBy: z.string().optional(),
});

export const saleFiltersSchema = z.object({
    customerId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
});

// ==================== Purchase Validations ====================

export const createPurchaseSchema = z.object({
    supplierId: z.string().uuid(),
    items: z.array(
        z.object({
            productId: z.string().uuid(),
            quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
            unitCost: z.number().min(0, 'Unit cost must be positive'),
        })
    ).min(1, 'At least one item is required'),
    paymentStatus: z.nativeEnum(PaymentStatus).default(PaymentStatus.UNPAID),
});

// ==================== Supplier Validations ====================

export const createSupplierSchema = z.object({
    name: z.string().min(1, 'Supplier name is required').max(255),
    contactPerson: z.string().max(255).optional(),
    phone: z.string().min(10, 'Valid phone number is required').max(20),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    address: z.string().optional(),
});

export const updateSupplierSchema = z.object({
    name: z.string().min(1).max(255).optional(),
    contactPerson: z.string().max(255).optional(),
    phone: z.string().min(10).max(20).optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
});

// ==================== Inventory Validations ====================

export const stockAdjustmentSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().refine(val => val !== 0, 'Quantity cannot be zero'),
    notes: z.string().optional(),
});

// ==================== Report Validations ====================

export const salesReportSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    period: z.enum(['daily', 'monthly', 'custom']).default('daily'),
});

export const profitReportSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

// ==================== Pagination Validation ====================

export const paginationSchema = z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
});
