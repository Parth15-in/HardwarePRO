import { PrismaClient, UnitType, CustomerType, PaymentStatus, TransactionType, PaymentMethod } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.paymentTransaction.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.pricingTier.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();

  // Create Suppliers
  console.log('👷 Creating suppliers...');
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: 'ABC Hardware Distributors',
        contactPerson: 'Rajesh Kumar',
        phone: '+91-9876543210',
        email: 'rajesh@abchardware.com',
        address: 'Plot 45, Industrial Area, Phase 1, Delhi',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'National Electrical Supplies',
        contactPerson: 'Priya Sharma',
        phone: '+91-9876543211',
        email: 'priya@nationalsupplies.com',
        address: '23, Nehru Place, New Delhi',
      },
    }),
    prisma.supplier.create({
      data: {
        name: 'Metro Plumbing Wholesale',
        contactPerson: 'Amit Patel',
        phone: '+91-9876543212',
        email: 'amit@metroplumbing.com',
        address: '67, Okhla Industrial Estate, Delhi',
      },
    }),
  ]);

  console.log(`✅ Created ${suppliers.length} suppliers`);

  // Create Products
  console.log('📦 Creating products...');
  const products = await Promise.all([
    // Electrical Items
    prisma.product.create({
      data: {
        sku: 'WIRE-CU-001',
        name: 'Copper Wire 2.5mm',
        description: 'High quality copper wire for electrical installations',
        category: 'Electrical',
        unitType: UnitType.METER,
        currentStock: 500,
        minStockLevel: 100,
        costPrice: 15,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'WIRE-CU-002',
        name: 'Copper Wire 4mm',
        description: 'Heavy duty copper wire',
        category: 'Electrical',
        unitType: UnitType.METER,
        currentStock: 300,
        minStockLevel: 50,
        costPrice: 25,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SWITCH-001',
        name: 'Modular Switch (Single)',
        description: 'Premium quality modular switch',
        category: 'Electrical',
        unitType: UnitType.PIECE,
        currentStock: 200,
        minStockLevel: 50,
        costPrice: 45,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'SOCKET-001',
        name: '3-Pin Socket',
        description: 'Standard 3-pin electrical socket',
        category: 'Electrical',
        unitType: UnitType.PIECE,
        currentStock: 150,
        minStockLevel: 30,
        costPrice: 55,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'MCB-001',
        name: 'MCB 16A Single Pole',
        description: 'Miniature Circuit Breaker',
        category: 'Electrical',
        unitType: UnitType.PIECE,
        currentStock: 100,
        minStockLevel: 20,
        costPrice: 120,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'LED-001',
        name: 'LED Bulb 9W',
        description: 'Energy efficient LED bulb',
        category: 'Electrical',
        unitType: UnitType.PIECE,
        currentStock: 250,
        minStockLevel: 50,
        costPrice: 80,
        supplierId: suppliers[1].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TUBE-001',
        name: 'LED Tube Light 20W',
        description: '4 feet LED tube light',
        category: 'Electrical',
        unitType: UnitType.PIECE,
        currentStock: 80,
        minStockLevel: 20,
        costPrice: 180,
        supplierId: suppliers[1].id,
      },
    }),

    // Plumbing Items
    prisma.product.create({
      data: {
        sku: 'PIPE-PVC-001',
        name: 'PVC Pipe 1/2 inch',
        description: 'Standard PVC pipe for water supply',
        category: 'Plumbing',
        unitType: UnitType.METER,
        currentStock: 400,
        minStockLevel: 100,
        costPrice: 35,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PIPE-PVC-002',
        name: 'PVC Pipe 1 inch',
        description: 'Large diameter PVC pipe',
        category: 'Plumbing',
        unitType: UnitType.METER,
        currentStock: 300,
        minStockLevel: 80,
        costPrice: 55,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TAP-001',
        name: 'Brass Tap (Standard)',
        description: 'Chrome plated brass tap',
        category: 'Plumbing',
        unitType: UnitType.PIECE,
        currentStock: 120,
        minStockLevel: 30,
        costPrice: 250,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'ELBOW-001',
        name: 'PVC Elbow 1/2 inch',
        description: '90 degree PVC elbow joint',
        category: 'Plumbing',
        unitType: UnitType.PIECE,
        currentStock: 200,
        minStockLevel: 50,
        costPrice: 8,
        supplierId: suppliers[2].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'VALVE-001',
        name: 'Ball Valve 1/2 inch',
        description: 'Brass ball valve',
        category: 'Plumbing',
        unitType: UnitType.PIECE,
        currentStock: 90,
        minStockLevel: 20,
        costPrice: 150,
        supplierId: suppliers[2].id,
      },
    }),

    // General Hardware
    prisma.product.create({
      data: {
        sku: 'SCREW-001',
        name: 'Wood Screws (Box)',
        description: 'Box of 100 wood screws',
        category: 'Hardware',
        unitType: UnitType.BOX,
        currentStock: 150,
        minStockLevel: 30,
        costPrice: 85,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'NAIL-001',
        name: 'Steel Nails (1kg)',
        description: 'Assorted steel nails',
        category: 'Hardware',
        unitType: UnitType.KG,
        currentStock: 200,
        minStockLevel: 40,
        costPrice: 95,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'HAMMER-001',
        name: 'Claw Hammer',
        description: 'Professional claw hammer',
        category: 'Tools',
        unitType: UnitType.PIECE,
        currentStock: 50,
        minStockLevel: 10,
        costPrice: 280,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'DRILL-001',
        name: 'Drill Bit Set',
        description: 'Set of 13 HSS drill bits',
        category: 'Tools',
        unitType: UnitType.BOX,
        currentStock: 40,
        minStockLevel: 10,
        costPrice: 450,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'TAPE-001',
        name: 'Measuring Tape 5m',
        description: 'Steel measuring tape',
        category: 'Tools',
        unitType: UnitType.PIECE,
        currentStock: 75,
        minStockLevel: 15,
        costPrice: 120,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'PAINT-001',
        name: 'Emulsion Paint (White)',
        description: 'Interior emulsion paint 4L',
        category: 'Paint',
        unitType: UnitType.PIECE,
        currentStock: 60,
        minStockLevel: 15,
        costPrice: 580,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'BRUSH-001',
        name: 'Paint Brush 2 inch',
        description: 'Professional paint brush',
        category: 'Paint',
        unitType: UnitType.PIECE,
        currentStock: 100,
        minStockLevel: 20,
        costPrice: 65,
        supplierId: suppliers[0].id,
      },
    }),
    prisma.product.create({
      data: {
        sku: 'CEMENT-001',
        name: 'White Cement (5kg)',
        description: 'Premium white cement',
        category: 'Construction',
        unitType: UnitType.KG,
        currentStock: 120,
        minStockLevel: 30,
        costPrice: 180,
        supplierId: suppliers[0].id,
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // Create Pricing Tiers for all products
  console.log('💰 Creating pricing tiers...');
  const pricingTiers = [];
  
  for (const product of products) {
    // Regular customer pricing (30% markup)
    pricingTiers.push(
      prisma.pricingTier.create({
        data: {
          productId: product.id,
          customerType: CustomerType.REGULAR,
          sellingPrice: Math.round(product.costPrice * 1.30),
          minQuantity: 1,
        },
      })
    );

    // Electrician pricing (20% markup)
    pricingTiers.push(
      prisma.pricingTier.create({
        data: {
          productId: product.id,
          customerType: CustomerType.ELECTRICIAN,
          sellingPrice: Math.round(product.costPrice * 1.20),
          minQuantity: 1,
        },
      })
    );

    // Plumber pricing (20% markup)
    pricingTiers.push(
      prisma.pricingTier.create({
        data: {
          productId: product.id,
          customerType: CustomerType.PLUMBER,
          sellingPrice: Math.round(product.costPrice * 1.20),
          minQuantity: 1,
        },
      })
    );
  }

  await Promise.all(pricingTiers);
  console.log(`✅ Created ${pricingTiers.length} pricing tiers`);

  // Create Customers
  console.log('👥 Creating customers...');
  const customers = await Promise.all([
    // Regular Customers
    prisma.customer.create({
      data: {
        name: 'Ramesh Singh',
        phone: '+91-9123456780',
        email: 'ramesh.singh@email.com',
        address: 'H-123, Sector 15, Noida',
        customerType: CustomerType.REGULAR,
        creditLimit: 5000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Sunita Devi',
        phone: '+91-9123456781',
        address: 'B-45, Vasant Kunj, Delhi',
        customerType: CustomerType.REGULAR,
        creditLimit: 3000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Vikram Mehta',
        phone: '+91-9123456782',
        email: 'vikram.mehta@email.com',
        address: 'F-78, Dwarka, Delhi',
        customerType: CustomerType.REGULAR,
        creditLimit: 10000,
        outstandingBalance: 0,
      },
    }),

    // Electrician Customers
    prisma.customer.create({
      data: {
        name: 'Suresh Electricals',
        phone: '+91-9123456783',
        email: 'suresh.electric@email.com',
        address: 'Shop 12, Lajpat Nagar, Delhi',
        customerType: CustomerType.ELECTRICIAN,
        creditLimit: 50000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Ravi Kumar (Electrician)',
        phone: '+91-9123456784',
        email: 'ravi.electrician@email.com',
        address: 'C-234, Rohini, Delhi',
        customerType: CustomerType.ELECTRICIAN,
        creditLimit: 30000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Modern Electrical Works',
        phone: '+91-9123456785',
        email: 'modern.electric@email.com',
        address: 'Plot 89, Mayur Vihar, Delhi',
        customerType: CustomerType.ELECTRICIAN,
        creditLimit: 75000,
        outstandingBalance: 0,
      },
    }),

    // Plumber Customers
    prisma.customer.create({
      data: {
        name: 'Sharma Plumbing Services',
        phone: '+91-9123456786',
        email: 'sharma.plumbing@email.com',
        address: 'Shop 5, Karol Bagh, Delhi',
        customerType: CustomerType.PLUMBER,
        creditLimit: 40000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Anil Plumber',
        phone: '+91-9123456787',
        address: 'D-567, Janakpuri, Delhi',
        customerType: CustomerType.PLUMBER,
        creditLimit: 25000,
        outstandingBalance: 0,
      },
    }),
    prisma.customer.create({
      data: {
        name: 'City Plumbing Solutions',
        phone: '+91-9123456788',
        email: 'city.plumbing@email.com',
        address: 'G-123, Pitampura, Delhi',
        customerType: CustomerType.PLUMBER,
        creditLimit: 60000,
        outstandingBalance: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${customers.length} customers`);

  // Create some sample inventory transactions
  console.log('📊 Creating inventory transactions...');
  const inventoryTransactions = await Promise.all([
    prisma.inventoryTransaction.create({
      data: {
        productId: products[0].id,
        transactionType: TransactionType.PURCHASE,
        quantity: 500,
        referenceType: 'INITIAL_STOCK',
        notes: 'Initial stock entry',
      },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: products[1].id,
        transactionType: TransactionType.PURCHASE,
        quantity: 300,
        referenceType: 'INITIAL_STOCK',
        notes: 'Initial stock entry',
      },
    }),
  ]);

  console.log(`✅ Created ${inventoryTransactions.length} inventory transactions`);

  console.log('✨ Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - Suppliers: ${suppliers.length}`);
  console.log(`   - Products: ${products.length}`);
  console.log(`   - Pricing Tiers: ${pricingTiers.length}`);
  console.log(`   - Customers: ${customers.length}`);
  console.log(`   - Inventory Transactions: ${inventoryTransactions.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
