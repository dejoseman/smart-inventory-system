import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  BarChart3, UserCog, FolderOpen, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/sales', label: 'Sales', icon: ShoppingCart },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/staff', label: 'Staff', icon: UserCog, adminOnly: true },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();
  const location = useLocation();

  const filteredItems = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <aside
      className="sidebar no-print"
      style={{ width: collapsed ? 72 : 260 }}
    >
      {/* Logo */}
      <div style={{
        padding: collapsed ? '1.25rem 0.75rem' : '1.25rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '0.625rem',
          background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <img src="/logo.png" alt="SmartInv" style={{ width: 32, height: 32, borderRadius: '0.5rem', objectFit: 'cover' }} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'white', lineHeight: 1.2 }}>
              SmartInv
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--navy-500)' }}>
              Management System
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1rem 0.5rem', flex: 1 }}>
        <div style={{ marginBottom: '0.5rem', padding: '0 0.75rem' }}>
          {!collapsed && (
            <span style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--navy-500)',
            }}>
              Navigation
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? item.label : undefined}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          margin: '0.75rem',
          padding: '0.625rem',
          borderRadius: '0.625rem',
          border: 'none',
          background: 'rgba(255,255,255,0.06)',
          color: 'var(--navy-500)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.2s',
        }}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {!collapsed && <span style={{ fontSize: '0.8125rem' }}>Collapse</span>}
      </button>
    </aside>
  );
}
