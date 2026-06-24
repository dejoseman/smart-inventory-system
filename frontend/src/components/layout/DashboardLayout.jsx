import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';
import { useState } from 'react';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--canvas)' }}>
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 50,
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{ width: 260, height: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} />

        <main style={{
          flex: 1,
          padding: '1.5rem 2rem',
          paddingBottom: '6rem',
          maxWidth: 1400,
          width: '100%',
          margin: '0 auto',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav />

      <style>{`
        @media (max-width: 768px) {
          main { padding: 1rem !important; }
        }
      `}</style>
    </div>
  );
}
