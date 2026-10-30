const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const prisma = require('./prisma-main');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1280,
        minHeight: 800,
        show: false,
        backgroundColor: '#ffffff',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const startURL = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, 'out/index.html')}`;

    mainWindow.loadURL(startURL);

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.maximize();
        mainWindow.show();
    });

    mainWindow.on('closed', () => (mainWindow = null));

    // Create Menu
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                { label: 'Print Receipt', accelerator: 'CmdOrCtrl+P', click: () => mainWindow.webContents.send('print-receipt') },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: async () => {
                        await shell.openExternal('https://github.com/Rdhobe/indiamornings');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC communication
// FIX #9: guard debug log behind isDev — console.log from main is synchronous I/O
ipcMain.on('toMain', (event, args) => {
    if (isDev) console.log('[toMain]', args);
});

// Database IPC Handlers

// PRODUCTS
ipcMain.handle('db-get-products', async (event, filters = {}) => {
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};

        if (filters.category) where.category = filters.category;
        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { sku: { contains: filters.search, mode: 'insensitive' } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { pricingTiers: true, supplier: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.product.count({ where })
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('db-get-products error:', error);
        throw error;
    }
});

ipcMain.handle('db-create-product', async (event, data) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    sku: data.sku,
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    unitType: data.unitType,
                    currentStock: data.currentStock || 0,
                    minStockLevel: data.minStockLevel || 0,
                    costPrice: data.costPrice,
                },
            });

            await tx.pricingTier.createMany({
                data: data.pricingTiers.map(tier => ({
                    productId: product.id,
                    customerType: tier.customerType,
                    sellingPrice: tier.sellingPrice,
                    minQuantity: tier.minQuantity || 1,
                })),
            });

            return product;
        });
    } catch (error) {
        console.error('db-create-product error:', error);
        throw error;
    }
});

ipcMain.handle('db-update-product', async (event, { id, data }) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.update({
                where: { id },
                data: {
                    sku: data.sku,
                    name: data.name,
                    description: data.description,
                    category: data.category,
                    unitType: data.unitType,
                    currentStock: data.currentStock,
                    minStockLevel: data.minStockLevel,
                    costPrice: data.costPrice,
                },
            });

            await tx.pricingTier.deleteMany({ where: { productId: id } });
            await tx.pricingTier.createMany({
                data: data.pricingTiers.map(tier => ({
                    productId: id,
                    customerType: tier.customerType,
                    sellingPrice: tier.sellingPrice,
                    minQuantity: tier.minQuantity || 1,
                })),
            });

            return product;
        });
    } catch (error) {
        console.error('db-update-product error:', error);
        throw error;
    }
});

ipcMain.handle('db-delete-product', async (event, id) => {
    try {
        return await prisma.product.delete({ where: { id } });
    } catch (error) {
        console.error('db-delete-product error:', error);
        throw error;
    }
});

ipcMain.handle('db-search-products', async (event, query) => {
    try {
        if (!query || query.length < 2) return [];
        return await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { sku: { contains: query, mode: 'insensitive' } },
                ],
            },
            include: { pricingTiers: { orderBy: { customerType: 'asc' } } },
            take: 10,
            orderBy: [{ name: 'asc' }]
        });
    } catch (error) {
        console.error('db-search-products error:', error);
        throw error;
    }
});

// CUSTOMERS
ipcMain.handle('db-get-customers', async (event, filters = {}) => {
    try {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search } },
            ];
        }

        const [data, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.customer.count({ where })
        ]);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        console.error('db-get-customers error:', error);
        throw error;
    }
});

ipcMain.handle('db-create-customer', async (event, data) => {
    try {
        return await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                address: data.address,
                customerType: data.customerType,
                creditLimit: data.creditLimit || 0,
                outstandingBalance: 0,
            },
        });
    } catch (error) {
        console.error('db-create-customer error:', error);
        throw error;
    }
});

ipcMain.handle('db-update-customer', async (event, { id, data }) => {
    try {
        return await prisma.customer.update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                email: data.email || null,
                address: data.address,
                customerType: data.customerType,
                creditLimit: data.creditLimit,
            },
        });
    } catch (error) {
        console.error('db-update-customer error:', error);
        throw error;
    }
});

ipcMain.handle('db-bulk-import-products', async (event, products) => {
    try {
        // FIX #3: Previously ran N×3 sequential awaits (upsert + deleteMany + createMany)
        // inside a single loop — 100 products = 300 sequential DB round-trips.
        // Now: upsert all products first (must stay sequential to avoid SKU race conditions),
        // then batch all tier deletions and creations in two parallel Promise.all calls.
        return await prisma.$transaction(async (tx) => {
            const results = [];

            // Phase 1: upsert all products sequentially (SKU uniqueness requires this)
            for (const data of products) {
                const product = await tx.product.upsert({
                    where: { sku: data.sku },
                    update: {
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        unitType: data.unitType,
                        currentStock: { increment: data.currentStock || 0 },
                        costPrice: data.costPrice,
                    },
                    create: {
                        sku: data.sku,
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        unitType: data.unitType,
                        currentStock: data.currentStock || 0,
                        minStockLevel: data.minStockLevel || 0,
                        costPrice: data.costPrice,
                    }
                });
                results.push({ product, tiers: data.pricingTiers });
            }

            // Phase 2: batch delete all existing tiers in parallel
            await Promise.all(
                results.map(({ product }) =>
                    tx.pricingTier.deleteMany({ where: { productId: product.id } })
                )
            );

            // Phase 3: batch create all new tiers in parallel
            await Promise.all(
                results.map(({ product, tiers }) =>
                    tx.pricingTier.createMany({
                        data: tiers.map(tier => ({
                            productId: product.id,
                            customerType: tier.customerType,
                            sellingPrice: tier.sellingPrice,
                            minQuantity: tier.minQuantity || 1,
                        })),
                    })
                )
            );

            return results.map(r => r.product);
        });
    } catch (error) {
        console.error('db-bulk-import-products error:', error);
        throw error;
    }
});



// CUSTOMERS
// SALES REPORT
ipcMain.handle('db-get-sales-report', async (event, filters) => {
    try {
        const dateFilter = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
        };

        // FIX #5: Previously fetched all saleItems with full product objects into JS memory,
        // then aggregated topProducts in JS with forEach/reduce/sort.
        // Now: run topProducts as a DB-side groupBy + _sum query — much less data transferred.
        const [sales, topProductsRaw, revenueAgg] = await Promise.all([
            prisma.sale.findMany({
                where: { createdAt: dateFilter },
                include: {
                    saleItems: {
                        select: {
                            productId: true,
                            quantity: true,
                            lineTotal: true,
                            unitPrice: true,
                        }
                    },
                    customer: { select: { id: true, name: true, phone: true } }
                },
                orderBy: { createdAt: 'desc' }
            }),
            // DB-side groupBy aggregation for top products — avoids hydrating product rows
            prisma.saleItem.groupBy({
                by: ['productId'],
                where: { createdAt: dateFilter },
                _sum: { quantity: true, lineTotal: true },
                orderBy: { _sum: { lineTotal: 'desc' } },
                take: 5,
            }),
            prisma.sale.aggregate({
                where: { createdAt: dateFilter },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
        ]);

        // Resolve product names for top 5 (only 5 lookups, not all products)
        const topProductIds = topProductsRaw.map(r => r.productId);
        const topProductNames = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true },
        });
        const nameMap = Object.fromEntries(topProductNames.map(p => [p.id, p.name]));

        const topProducts = topProductsRaw.map(r => ({
            name: nameMap[r.productId] || r.productId,
            quantity: r._sum.quantity || 0,
            revenue: r._sum.lineTotal || 0,
        }));

        return {
            data: {
                sales,
                totalRevenue: revenueAgg._sum.totalAmount || 0,
                totalSales: revenueAgg._count.id || 0,
                topProducts
            }
        };
    } catch (error) {
        console.error('db-get-sales-report error:', error);
        throw error;
    }
});

// PROFIT REPORT
ipcMain.handle('db-get-profit-report', async (event, filters) => {
    try {
        const sales = await prisma.sale.findMany({
            where: {
                createdAt: {
                    gte: new Date(filters.startDate),
                    lte: new Date(filters.endDate)
                }
            },
            include: {
                saleItems: {
                    include: {
                        product: true
                    }
                },
                customer: true // Include customer to get customerType
            },
            orderBy: { createdAt: 'asc' }
        });

        // Group and calculate profit by customer type
        const profitMap = {
            REGULAR: { customerType: 'REGULAR', revenue: 0, cost: 0, profit: 0 },
            ELECTRICIAN: { customerType: 'ELECTRICIAN', revenue: 0, cost: 0, profit: 0 },
            PLUMBER: { customerType: 'PLUMBER', revenue: 0, cost: 0, profit: 0 },
        };

        sales.forEach(sale => {
            const customerType = sale.customer?.customerType || 'REGULAR';
            const revenue = sale.totalAmount;
            const cost = sale.saleItems.reduce((acc, item) => {
                return acc + (item.quantity * (item.product?.costPrice || 0));
            }, 0);

            if (!profitMap[customerType]) {
                profitMap[customerType] = { customerType, revenue: 0, cost: 0, profit: 0 };
            }
            profitMap[customerType].revenue += revenue;
            profitMap[customerType].cost += cost;
            profitMap[customerType].profit += (revenue - cost);
        });

        return { data: Object.values(profitMap) };
    } catch (error) {
        console.error('db-get-profit-report error:', error);
        throw error;
    }
});

// SETTINGS
ipcMain.handle('db-get-settings', async () => {
    return { data: { businessName: 'Hardware Shop Pro', currency: 'INR' } };
});

ipcMain.handle('db-update-settings', async (event, settings) => {
    return { success: true };
});

// DASHBOARD
ipcMain.handle('db-get-dashboard-stats', async () => {
    try {
        // FIX #1: prisma.product.fields.minStockLevel is not valid for column-to-column
        // comparisons in Prisma v5 where clauses. Use $queryRaw for the low-stock count.
        const [productCount, lowStockResult, todaySales] = await Promise.all([
            prisma.product.count(),
            prisma.$queryRaw`SELECT COUNT(*) as count FROM "products" WHERE "currentStock" < "minStockLevel"`,
            prisma.sale.aggregate({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                },
                _sum: { totalAmount: true },
                _count: { id: true }
            })
        ]);

        // $queryRaw returns BigInt counts — convert to Number
        const lowStockCount = Number(lowStockResult[0]?.count ?? 0);

        return {
            products: productCount,
            lowStock: lowStockCount,
            todayRevenue: todaySales._sum.totalAmount || 0,
            todaySalesCount: todaySales._count.id || 0
        };
    } catch (error) {
        console.error('db-get-dashboard-stats error:', error);
        throw error;
    }
});

// SALES
ipcMain.handle('db-get-customer-report', async (event, filters) => {
    try {
        // FIX #4: Previously fetched ALL customers + ALL their sales rows into memory
        // with no limit, then sorted and summed them in JS — OOM risk as data grows.
        // Now: use Prisma _sum/_count/_max aggregates via a relational groupBy pattern,
        // and cap results at 200 customers.
        const customers = await prisma.customer.findMany({
            take: 200,
            select: {
                id: true,
                name: true,
                phone: true,
                customerType: true,
                outstandingBalance: true,
                _count: { select: { sales: true } },
                sales: {
                    select: { totalAmount: true, createdAt: true },
                    orderBy: { createdAt: 'desc' },
                    take: 1, // Only fetch the most recent sale for lastPurchaseDate
                }
            },
            orderBy: { sales: { _count: 'desc' } },
        });

        // Fetch purchase totals via aggregation to avoid loading all sale amounts
        const salesAgg = await prisma.sale.groupBy({
            by: ['customerId'],
            where: { customerId: { in: customers.map(c => c.id) } },
            _sum: { totalAmount: true },
            _count: { id: true },
        });
        const aggMap = Object.fromEntries(
            salesAgg.map(a => [a.customerId, { total: a._sum.totalAmount || 0, count: a._count.id || 0 }])
        );

        const reportData = customers.map(c => ({
            id: c.id,
            name: c.name,
            phone: c.phone,
            customerType: c.customerType,
            totalPurchaseAmount: aggMap[c.id]?.total || 0,
            saleCount: aggMap[c.id]?.count || 0,
            lastPurchaseDate: c.sales[0]?.createdAt || null,
        }));

        return { data: reportData };
    } catch (error) {
        console.error('db-get-customer-report error:', error);
        throw error;
    }
});

// SALES
ipcMain.handle('db-create-sale', async (event, data) => {
    try {
        return await prisma.$transaction(async (tx) => {
            const billNumber = `SALE-${Date.now()}`;
            const sale = await tx.sale.create({
                data: {
                    billNumber,
                    customerId: data.customerId,
                    subtotal: data.subtotal || itemsSubtotal(data.items),
                    tax: data.tax || 0,
                    discount: data.discount || 0,
                    totalAmount: data.total,
                    paymentStatus: 'PAID',
                    paymentMethod: data.paymentMethod,
                    saleItems: {
                        create: data.items.map(item => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: item.price,
                            lineTotal: item.price * item.quantity
                        }))
                    }
                }
            });

            // FIX #2: Previously awaited each stock update sequentially in a loop.
            // For an N-item cart this was N serial DB round-trips inside the transaction.
            // Promise.all is safe here — each update targets a different productId.
            await Promise.all(
                data.items.map(item =>
                    tx.product.update({
                        where: { id: item.productId },
                        data: { currentStock: { decrement: item.quantity } }
                    })
                )
            );

            // If credit, update customer balance
            if (data.paymentMethod === 'CREDIT' && data.customerId) {
                await tx.customer.update({
                    where: { id: data.customerId },
                    data: { outstandingBalance: { increment: data.total } }
                });
            }

            return sale;
        });
    } catch (error) {
        console.error('db-create-sale error:', error);
        throw error;
    }
});

function itemsSubtotal(items) {
    return items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
}

// INVENTORY
ipcMain.handle('db-adjust-stock', async (event, data) => {
    try {
        return await prisma.product.update({
            where: { id: data.productId },
            data: { currentStock: data.newStock }
        });
    } catch (error) {
        console.error('db-adjust-stock error:', error);
        throw error;
    }
});
