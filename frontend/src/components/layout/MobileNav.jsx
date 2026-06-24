import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
} from 'lucide-react';

const mobileItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid var(--border)',
        display: 'none',
        padding: '0.375rem 0.5rem',
        paddingBottom: 'env(safe-area-inset-bottom, 0.375rem)',
        zIndex: 50,
      }}
      id="mobile-nav"
    >
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path ||
          (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

        return (
          <NavLink
            key={item.path}
            to={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              padding: '0.375rem',
              flex: 1,
              borderRadius: '0.5rem',
              textDecoration: 'none',
              color: isActive ? 'var(--royal)' : 'var(--text-muted)',
              background: isActive ? 'var(--royal-faint)' : 'transparent',
              transition: 'all 0.2s',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '0.625rem', fontWeight: isActive ? 600 : 500 }}>
              {item.label}
            </span>
          </NavLink>
        );
      })}

      <style>{`
        @media (max-width: 768px) {
          #mobile-nav { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}
