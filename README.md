# SmartInv - Smart Inventory & Sales Management System

SmartInv is a modern, enterprise-grade, responsive platform for businesses to manage their products, sales (POS), customers, and staff. Built with an editorial design aesthetic inspired by top-tier platforms.

## Technology Stack
- **Backend:** Django 5, Django REST Framework, PostgreSQL, JWT Auth
- **Frontend:** React (Vite), Tailwind CSS v4, Context API, Recharts
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

## Features
- **Dashboard:** Real-time business intelligence and KPI tracking.
- **Inventory Management:** Full CRUD on products and categories. Automated low-stock thresholds and comprehensive restock auditing/logging.
- **Point of Sale (POS):** Atomic transaction management for processing sales, calculating tax/discounts, and automatic stock deduction.
- **Customer Database:** Track customer spending and purchase history.
- **Reports:** Generate daily revenue trends and export data via PDF, Excel, and CSV.
- **Staff Management:** Role-based access (Admin vs Sales Staff).

## Getting Started Locally

### 1. With Docker (Recommended)
Make sure you have Docker and Docker Compose installed.

```bash
# Clone the repository and copy the example environment file
cp .env.example .env

# Build and start the services
docker-compose up --build
```
The application will be accessible at:
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:8000

### 2. Manual Setup (Without Docker)

**Backend Setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

## Default Seed Credentials
If you seeded the database via our initial migrations, you can log in using:
- **Email:** `admin@inventory.com`
- **Password:** `admin123`

## Environment Variables
Refer to `.env.example` for the required configuration strings for the database, JWT secret keys, and Cloudinary API credentials.
