# API Documentation

Complete API reference for the Hardware Shop Management System.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... },
  "statusCode": 400
}
```

---

## Products API

### List Products
`GET /api/products`

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `search` (string, optional) - Search by name or SKU
- `lowStock` (boolean, optional) - Filter low stock items
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 10)

**Example:**
```bash
GET /api/products?category=Electrical&page=1&limit=10
```

### Create Product
`POST /api/products`

**Request Body:**
```json
{
  "sku": "WIRE-CU-001",
  "name": "Copper Wire 2.5mm",
  "description": "High quality copper wire",
  "category": "Electrical",
  "unitType": "METER",
  "currentStock": 500,
  "minStockLevel": 100,
  "costPrice": 15,
  "supplierId": "uuid",
  "pricingTiers": [
    {
      "customerType": "REGULAR",
      "sellingPrice": 20,
      "minQuantity": 1
    },
    {
      "customerType": "ELECTRICIAN",
      "sellingPrice": 18,
      "minQuantity": 1
    },
    {
      "customerType": "PLUMBER",
      "sellingPrice": 18,
      "minQuantity": 1
    }
  ]
}
```

### Get Product by ID
`GET /api/products/{id}`

### Update Product
`PUT /api/products/{id}`

### Delete Product
`DELETE /api/products/{id}`

### Search Products (POS)
`GET /api/products/search?q=wire`

---

## Customers API

### List Customers
`GET /api/customers`

**Query Parameters:**
- `search` (string, optional) - Search by name, phone, or email
- `customerType` (string, optional) - Filter by type (REGULAR, ELECTRICIAN, PLUMBER)
- `page` (number, optional)
- `limit` (number, optional)

### Create Customer
`POST /api/customers`

**Request Body:**
```json
{
  "name": "Ramesh Singh",
  "phone": "+91-9123456780",
  "email": "ramesh@email.com",
  "address": "H-123, Sector 15, Noida",
  "customerType": "REGULAR",
  "creditLimit": 5000
}
```

### Get Customer with History
`GET /api/customers/{id}`

Returns customer details with purchase history and statistics.

### Update Customer
`PUT /api/customers/{id}`

### Delete Customer
`DELETE /api/customers/{id}`

---

## Sales API

### List Sales
`GET /api/sales`

**Query Parameters:**
- `customerId` (string, optional)
- `startDate` (string, optional) - ISO date
- `endDate` (string, optional) - ISO date
- `paymentStatus` (string, optional) - PAID, PARTIAL, UNPAID
- `page` (number, optional)
- `limit` (number, optional)

### Create Sale
`POST /api/sales`

**Request Body:**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 10
    }
  ],
  "discount": 0,
  "tax": 0,
  "paymentMethod": "CASH",
  "paymentAmount": 200,
  "createdBy": "admin"
}
```

**Features:**
- Auto-generates unique bill number (BILL-YYYYMMDD-XXX)
- Calculates prices based on customer type
- Updates inventory atomically
- Creates inventory transactions
- Handles partial payments
- Updates customer outstanding balance

### Get Sale Details
`GET /api/sales/{id}`

Returns complete sale information with line items and payment history.

---

## Inventory API

### Get Stock Levels
`GET /api/inventory`

**Query Parameters:**
- `category` (string, optional) - Filter by category

### Manual Stock Adjustment
`POST /api/inventory`

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 50,
  "notes": "Received new stock"
}
```

Use negative quantity to reduce stock.

### Get Low Stock Items
`GET /api/inventory/low-stock`

Returns products where currentStock < minStockLevel.

---

## Purchases API

### List Purchases
`GET /api/purchases`

**Query Parameters:**
- `supplierId` (string, optional)
- `page` (number, optional)
- `limit` (number, optional)

### Create Purchase
`POST /api/purchases`

**Request Body:**
```json
{
  "supplierId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 100,
      "unitCost": 15
    }
  ],
  "paymentStatus": "PAID"
}
```

**Features:**
- Auto-generates PO number (PO-YYYYMMDD-XXX)
- Updates product stock automatically
- Updates product cost price
- Creates inventory transactions

### Get Purchase Details
`GET /api/purchases/{id}`

---

## Suppliers API

### List Suppliers
`GET /api/suppliers`

**Query Parameters:**
- `search` (string, optional) - Search by name, phone, or email

### Create Supplier
`POST /api/suppliers`

**Request Body:**
```json
{
  "name": "ABC Hardware Distributors",
  "contactPerson": "Rajesh Kumar",
  "phone": "+91-9876543210",
  "email": "rajesh@abchardware.com",
  "address": "Plot 45, Industrial Area, Delhi"
}
```

### Get Supplier Details
`GET /api/suppliers/{id}`

Returns supplier with associated products and recent purchases.

### Update Supplier
`PUT /api/suppliers/{id}`

### Delete Supplier
`DELETE /api/suppliers/{id}`

---

## Reports API

### Sales Report
`GET /api/reports/sales`

**Query Parameters:**
- `startDate` (string, optional) - ISO date
- `endDate` (string, optional) - ISO date
- `period` (string, optional) - daily, monthly, custom (default: daily)

**Response:**
```json
{
  "period": "2026-01-26 to 2026-01-26",
  "totalSales": 10,
  "totalRevenue": 5000,
  "totalProfit": 1500,
  "transactionCount": 10,
  "averageOrderValue": 500,
  "paymentMethodBreakdown": [
    {
      "method": "CASH",
      "count": 5,
      "amount": 2500
    }
  ],
  "topProducts": [
    {
      "productId": "uuid",
      "productName": "Copper Wire 2.5mm",
      "sku": "WIRE-CU-001",
      "quantitySold": 100,
      "revenue": 2000
    }
  ]
}
```

### Profit Report
`GET /api/reports/profit`

**Query Parameters:**
- `startDate` (string, optional)
- `endDate` (string, optional)

**Response:**
```json
[
  {
    "customerType": "REGULAR",
    "totalRevenue": 10000,
    "totalCost": 7000,
    "profit": 3000,
    "profitMargin": 30,
    "transactionCount": 15
  },
  {
    "customerType": "ELECTRICIAN",
    "totalRevenue": 8000,
    "totalCost": 6000,
    "profit": 2000,
    "profitMargin": 25,
    "transactionCount": 10
  }
]
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 404 | Resource not found |
| 409 | Conflict (duplicate unique field) |
| 500 | Internal server error |

---

## Enums

### UnitType
- `PIECE`
- `KG`
- `METER`
- `BOX`

### CustomerType
- `REGULAR`
- `ELECTRICIAN`
- `PLUMBER`

### PaymentStatus
- `PAID`
- `PARTIAL`
- `UNPAID`

### PaymentMethod
- `CASH`
- `CARD`
- `UPI`
- `BANK_TRANSFER`
- `CREDIT`

### TransactionType
- `SALE`
- `PURCHASE`
- `ADJUSTMENT`

---

## Testing with cURL

### Create a Sale
```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "product-uuid-here",
        "quantity": 5
      }
    ],
    "paymentMethod": "CASH"
  }'
```

### Get Low Stock Items
```bash
curl http://localhost:3000/api/inventory/low-stock
```

### Search Products
```bash
curl "http://localhost:3000/api/products/search?q=wire"
```
