import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Dashboard
import OverviewPage from './pages/dashboard/OverviewPage';

// Products & Categories
import ProductListPage from './pages/products/ProductListPage';
import ProductFormPage from './pages/products/ProductFormPage';
import CategoriesPage from './pages/categories/CategoriesPage';

// Sales (POS)
import SalesListPage from './pages/sales/SalesListPage';
import NewSalePage from './pages/sales/NewSalePage';
import SaleDetailPage from './pages/sales/SaleDetailPage';

// Customers
import CustomerListPage from './pages/customers/CustomerListPage';

// Inventory
import InventoryPage from './pages/inventory/InventoryPage';

// Reports
import ReportsPage from './pages/reports/ReportsPage';

// Staff (Admin)
import StaffPage from './pages/staff/StaffPage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes inside Dashboard Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<OverviewPage />} />
              
              <Route path="products">
                <Route index element={<ProductListPage />} />
                <Route path="new" element={<ProtectedRoute adminOnly><ProductFormPage /></ProtectedRoute>} />
                <Route path=":id/edit" element={<ProtectedRoute adminOnly><ProductFormPage /></ProtectedRoute>} />
              </Route>

              <Route path="categories" element={<CategoriesPage />} />

              <Route path="sales">
                <Route index element={<SalesListPage />} />
                <Route path="new" element={<NewSalePage />} />
                <Route path=":id" element={<SaleDetailPage />} />
              </Route>

              <Route path="customers" element={<CustomerListPage />} />
              
              <Route path="inventory" element={<InventoryPage />} />
              
              <Route path="reports" element={<ReportsPage />} />
              
              <Route path="staff" element={
                <ProtectedRoute adminOnly>
                  <StaffPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
