# HardwarePRO 🛠️
> **Comprehensive Hardware Shop Management & POS Desktop Application**

HardwarePRO is an offline-ready, all-in-one desktop application designed specifically for hardware and electrical retail shops. It streamlines point-of-sale (POS) billing, multi-tier pricing for trade professionals (contractors, electricians, plumbers), real-time inventory management, supplier purchases, and customer credit ledger tracking.

---

## 📥 Download Desktop App (Windows .exe)

You can download and run the pre-built Windows desktop app without needing to install Node.js, databases, or build from source!

| Platform | Installer | Version | Status |
| :--- | :--- | :--- | :--- |
| **Windows (x64)** | **[Download HardwareShopPro Setup 1.0.0.exe](https://github.com/Parth15-in/HardwarePRO/releases/latest)** | `v1.0.0` | ![Ready](https://img.shields.io/badge/Status-Stable-success) |

### 🚀 How to Install and Run the `.exe`:

1. **Download the installer**: Go to the [Latest Releases](https://github.com/Parth15-in/HardwarePRO/releases) tab and download `HardwareShopPro Setup 1.0.0.exe`.
2. **Run the Setup**: Double-click `HardwareShopPro Setup 1.0.0.exe` to launch the installation.
3. **SmartScreen Prompt**: 
   > **Note**: Because this application is newly built and not signed with an expensive Microsoft enterprise certificate, Windows Defender SmartScreen may display:  
   > *"Windows protected your PC"*  
   > 👉 Simply click **"More info"** and then click **"Run anyway"**.
4. **Launch**: Once installed, a shortcut will be placed on your Desktop. Open **Hardware Shop Pro** and start managing your store!

---

## 🛠️ Clone & Run from Source (Developer Setup)

If you want to contribute, customize, or run the project in development mode:

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [PostgreSQL](https://www.postgresql.org/) (v14 or higher) or a cloud PostgreSQL instance
- [npm](https://www.npmjs.com/) or `yarn` / `pnpm`
- [Git](https://git-scm.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/Parth15-in/HardwarePRO.git
cd HardwarePRO
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Open `.env` in your text editor and set your PostgreSQL connection URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/hardware_shop_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-custom-secret-key"
NEXT_PUBLIC_SHOP_NAME="Hardware Pro Shop"
NEXT_PUBLIC_CURRENCY="INR"
NEXT_PUBLIC_TAX_RATE="18"
```

### 5. Initialize the Database
Generate the Prisma client, push the schema migrations, and seed initial demo data:
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:migrate

# Seed database with sample products, pricing tiers, and suppliers
npm run db:seed
```

*(Optional)* You can inspect and manage your database via Prisma Studio GUI:
```bash
npm run db:studio
```

### 6. Run the Application in Development Mode
Launch Next.js and Electron together:
```bash
npm run dev
```

### 7. Build Standalone Windows Installer (.exe)
To package and generate a new `.exe` installer:
```bash
npm run build
```
The installer will be generated inside the `dist/` folder:
`dist/HardwareShopPro Setup 1.0.0.exe`

---

## ✨ Features

- **⚡ Multi-Tier Customer Pricing**: Automatic price tiering based on customer classification (Regular retail, Electrician, Plumber).
- **📦 Inventory & Stock Control**: Real-time stock decrement, low-stock threshold alerts, and full audit logs for stock movements.
- **🧾 Point of Sale (POS) & Fast Billing**: Quick invoice/bill generation with barcode compatibility and support for multiple payment modes (Cash, UPI, Card, Bank Transfer, Store Credit).
- **👥 Customer Credit Ledger**: Track customer purchase history, outstanding balances, partial payments, and credit limits.
- **🚚 Supplier & Purchase Management**: Create and track purchase orders with suppliers to replenish stock.
- **📊 Sales Analytics & Reporting**: Interactive charts for daily/monthly revenues, profit margin breakdown by customer type, and best-selling product analysis. Exportable to Excel & PDF.
- **💾 Backup & Restore**: One-click data export and restoration to keep store data safe.

---

## 🏗️ Tech Stack

- **Desktop Framework**: [Electron](https://www.electronjs.org/)
- **Frontend / Fullstack**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Packaging & Distribution**: [electron-builder](https://www.electron.build/)

---

## 📂 Project Structure

```
HardwarePRO/
├── app/                  # Next.js App Router (Pages, Layouts, API routes)
├── components/           # Reusable UI & business components
├── database/             # Database SQL schemas & scripts
├── lib/                  # Database client, utilities, and helper functions
├── prisma/
│   ├── schema.prisma     # Prisma ORM schema definition
│   └── seed.ts           # Sample data seed script
├── store/                # Zustand client state stores
├── types/                # TypeScript type definitions
├── electron-builder.yml  # Electron packaging configuration
├── main.js               # Electron main process
├── preload.js            # Electron preload bridge
├── next.config.js        # Next.js configuration
├── package.json          # Project manifest and scripts
└── README.md             # Project documentation
```

---

## 📄 License

This project is licensed under the ISC License.
