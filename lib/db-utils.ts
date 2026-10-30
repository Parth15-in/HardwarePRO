import { CustomerType, TransactionType, PaymentStatus } from '@prisma/client';
import prisma from './prisma';

/**
 * Get the correct selling price for a product based on customer type
 * @param productId - Product ID
 * @param customerType - Type of customer (REGULAR, ELECTRICIAN, PLUMBER)
 * @returns Selling price for the customer type
 */
export async function getPriceForCustomer(
    productId: string,
    customerType: CustomerType
): Promise<number> {
    const pricingTier = await prisma.pricingTier.findUnique({
        where: {
            productId_customerType: {
                productId,
                customerType,
            },
        },
    });

    if (!pricingTier) {
        throw new Error(`No pricing tier found for product ${productId} and customer type ${customerType}`);
    }

    return pricingTier.sellingPrice;
}

/**
 * Generate a unique bill number in format: BILL-YYYYMMDD-XXX
 * @returns Unique bill number
 */
export async function generateBillNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

    // Find the last bill number for today
    const lastBill = await prisma.sale.findFirst({
        where: {
            billNumber: {
                startsWith: `BILL-${dateStr}`,
            },
        },
        orderBy: {
            billNumber: 'desc',
        },
    });

    let sequence = 1;
    if (lastBill) {
        // Extract sequence number from last bill (BILL-YYYYMMDD-XXX)
        const lastSequence = parseInt(lastBill.billNumber.split('-')[2]);
        sequence = lastSequence + 1;
    }

    // Pad sequence to 3 digits
    const sequenceStr = sequence.toString().padStart(3, '0');

    return `BILL-${dateStr}-${sequenceStr}`;
}

/**
 * Generate a unique purchase order number in format: PO-YYYYMMDD-XXX
 * @returns Unique purchase order number
 */
export async function generatePurchaseOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

    // Find the last PO number for today
    const lastPO = await prisma.purchase.findFirst({
        where: {
            purchaseOrderNumber: {
                startsWith: `PO-${dateStr}`,
            },
        },
        orderBy: {
            purchaseOrderNumber: 'desc',
        },
    });

    let sequence = 1;
    if (lastPO) {
        // Extract sequence number from last PO (PO-YYYYMMDD-XXX)
        const lastSequence = parseInt(lastPO.purchaseOrderNumber.split('-')[2]);
        sequence = lastSequence + 1;
    }

    // Pad sequence to 3 digits
    const sequenceStr = sequence.toString().padStart(3, '0');

    return `PO-${dateStr}-${sequenceStr}`;
}

/**
 * Update product stock level
 * @param productId - Product ID
 * @param quantity - Quantity to add (positive) or subtract (negative)
 * @returns Updated product
 */
export async function updateStock(productId: string, quantity: number) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
    });

    if (!product) {
        throw new Error(`Product ${productId} not found`);
    }

    const newStock = Number(product.currentStock) + quantity;

    if (newStock < 0) {
        throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.currentStock}, Required: ${Math.abs(quantity)}`);
    }

    return await prisma.product.update({
        where: { id: productId },
        data: {
            currentStock: newStock,
        },
    });
}

/**
 * Create an inventory transaction record
 * @param data - Transaction data
 */
export async function createInventoryTransaction(data: {
    productId: string;
    transactionType: TransactionType;
    quantity: number;
    referenceId?: string;
    referenceType?: string;
    notes?: string;
}) {
    return await prisma.inventoryTransaction.create({
        data: {
            productId: data.productId,
            transactionType: data.transactionType,
            quantity: data.quantity,
            referenceId: data.referenceId,
            referenceType: data.referenceType,
            notes: data.notes,
        },
    });
}

/**
 * Calculate payment status based on amount paid vs total amount
 * @param totalAmount - Total bill amount
 * @param paidAmount - Amount paid
 * @returns Payment status
 */
export function calculatePaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus {
    if (paidAmount >= totalAmount) {
        return PaymentStatus.PAID;
    } else if (paidAmount > 0) {
        return PaymentStatus.PARTIAL;
    } else {
        return PaymentStatus.UNPAID;
    }
}

/**
 * Update customer outstanding balance
 * @param customerId - Customer ID
 * @param amount - Amount to add (positive) or subtract (negative)
 */
export async function updateCustomerBalance(customerId: string, amount: number) {
    const customer = await prisma.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        throw new Error(`Customer ${customerId} not found`);
    }

    const newBalance = Number(customer.outstandingBalance) + amount;

    // Check credit limit
    if (newBalance > Number(customer.creditLimit)) {
        throw new Error(
            `Credit limit exceeded. Limit: ${customer.creditLimit}, New balance would be: ${newBalance}`
        );
    }

    return await prisma.customer.update({
        where: { id: customerId },
        data: {
            outstandingBalance: newBalance,
        },
    });
}

/**
 * Get products with low stock (below minimum level)
 */
export async function getLowStockProducts() {
    return await prisma.product.findMany({
        where: {
            currentStock: {
                lt: prisma.product.fields.minStockLevel,
            },
        },
        orderBy: {
            currentStock: 'asc',
        },
    });
}

/**
 * Calculate profit for a sale item
 * @param costPrice - Product cost price
 * @param sellingPrice - Selling price
 * @param quantity - Quantity sold
 */
export function calculateProfit(costPrice: number, sellingPrice: number, quantity: number): number {
    return (sellingPrice - costPrice) * quantity;
}
