import { Prisma, CustomerType, PaymentStatus, PaymentMethod, UnitType, TransactionType } from '@prisma/client';

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
    success: true;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    error: string;
    details?: any;
    statusCode: number;
}

// ==================== Pagination ====================

export interface PaginationParams {
    page?: number;
    limit?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ==================== Product Types ====================

export interface ProductWithPricing {
    id: string;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    unitType: UnitType;
    currentStock: number;
    minStockLevel: number;
    costPrice: number;
    supplierId: string | null;
    createdAt: Date;
    updatedAt: Date;
    pricingTiers: PricingTierDTO[];
    supplier?: SupplierDTO | null;
}

export interface PricingTierDTO {
    id: string;
    customerType: CustomerType;
    sellingPrice: number;
    minQuantity: number;
}

export interface CreateProductDTO {
    sku: string;
    name: string;
    description?: string;
    category: string;
    unitType: UnitType;
    currentStock?: number;
    minStockLevel?: number;
    costPrice: number;
    supplierId?: string;
    pricingTiers: {
        customerType: CustomerType;
        sellingPrice: number;
        minQuantity?: number;
    }[];
}

export interface UpdateProductDTO {
    sku?: string;
    name?: string;
    description?: string;
    category?: string;
    unitType?: UnitType;
    minStockLevel?: number;
    costPrice?: number;
    supplierId?: string;
}

export interface ProductFilters {
    category?: string;
    search?: string;
    lowStock?: boolean;
}

// ==================== Customer Types ====================

export interface CustomerDTO {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
    customerType: CustomerType;
    creditLimit: number;
    outstandingBalance: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CustomerWithHistory extends CustomerDTO {
    sales: SaleDTO[];
    totalPurchases: number;
    totalSpent: number;
}

export interface CreateCustomerDTO {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    customerType: CustomerType;
    creditLimit?: number;
}

export interface UpdateCustomerDTO {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    customerType?: CustomerType;
    creditLimit?: number;
}

// ==================== Sale Types ====================

export interface SaleDTO {
    id: string;
    billNumber: string;
    customerId: string | null;
    saleDate: Date;
    subtotal: number;
    discount: number;
    tax: number;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    createdBy: string | null;
    createdAt: Date;
    customer?: CustomerDTO | null;
}

export interface SaleWithItems extends SaleDTO {
    saleItems: SaleItemDTO[];
    paymentTransactions: PaymentTransactionDTO[];
}

export interface SaleItemDTO {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    product?: {
        id: string;
        name: string;
        sku: string;
        unitType: UnitType;
    };
}

export interface CreateSaleDTO {
    customerId?: string;
    items: {
        productId: string;
        quantity: number;
    }[];
    discount?: number;
    tax?: number;
    paymentMethod: PaymentMethod;
    paymentAmount?: number; // For partial payments
    createdBy?: string;
}

export interface SaleFilters extends PaginationParams {
    customerId?: string;
    startDate?: string;
    endDate?: string;
    paymentStatus?: PaymentStatus;
}

// ==================== Purchase Types ====================

export interface PurchaseDTO {
    id: string;
    purchaseOrderNumber: string;
    supplierId: string;
    purchaseDate: Date;
    totalAmount: number;
    paymentStatus: PaymentStatus;
    createdAt: Date;
    supplier?: SupplierDTO;
}

export interface PurchaseWithItems extends PurchaseDTO {
    purchaseItems: PurchaseItemDTO[];
}

export interface PurchaseItemDTO {
    id: string;
    productId: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
    product?: {
        id: string;
        name: string;
        sku: string;
    };
}

export interface CreatePurchaseDTO {
    supplierId: string;
    items: {
        productId: string;
        quantity: number;
        unitCost: number;
    }[];
    paymentStatus?: PaymentStatus;
}

// ==================== Supplier Types ====================

export interface SupplierDTO {
    id: string;
    name: string;
    contactPerson: string | null;
    phone: string;
    email: string | null;
    address: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateSupplierDTO {
    name: string;
    contactPerson?: string;
    phone: string;
    email?: string;
    address?: string;
}

export interface UpdateSupplierDTO {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}

// ==================== Inventory Types ====================

export interface InventoryTransactionDTO {
    id: string;
    productId: string;
    transactionType: TransactionType;
    quantity: number;
    referenceId: string | null;
    referenceType: string | null;
    notes: string | null;
    createdAt: Date;
    product?: {
        id: string;
        name: string;
        sku: string;
    };
}

export interface StockAdjustmentDTO {
    productId: string;
    quantity: number;
    notes?: string;
}

export interface LowStockItem {
    id: string;
    sku: string;
    name: string;
    currentStock: number;
    minStockLevel: number;
    deficit: number;
}

// ==================== Payment Types ====================

export interface PaymentTransactionDTO {
    id: string;
    saleId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionDate: Date;
    notes: string | null;
}

// ==================== Report Types ====================

export interface SalesReportDTO {
    period: string;
    totalSales: number;
    totalRevenue: number;
    totalProfit: number;
    transactionCount: number;
    averageOrderValue: number;
    paymentMethodBreakdown: {
        method: PaymentMethod;
        count: number;
        amount: number;
    }[];
    topProducts: {
        productId: string;
        productName: string;
        sku: string;
        quantitySold: number;
        revenue: number;
    }[];
}

export interface ProfitReportDTO {
    customerType: CustomerType;
    totalRevenue: number;
    totalCost: number;
    profit: number;
    profitMargin: number;
    transactionCount: number;
}

export interface DashboardStats {
    todaySales: {
        count: number;
        revenue: number;
    };
    lowStockCount: number;
    pendingPayments: {
        count: number;
        amount: number;
    };
    topSellingProducts: {
        id: string;
        name: string;
        quantitySold: number;
    }[];
}
