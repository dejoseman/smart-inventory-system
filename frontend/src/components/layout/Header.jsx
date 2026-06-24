import { Search, Bell, LogOut, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMobileMenuToggle }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className="no-print"
      style={{
        background: 'var(--canvas)',
        padding: '0 2rem',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="btn-ghost"
          onClick={onMobileMenuToggle}
          style={{ display: 'none', padding: '0.5rem' }}
          id="mobile-menu-btn"
        >
          <Menu size={22} />
        </button>
        <div style={{
          position: 'relative',
          width: 320,
          maxWidth: '100%',
        }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            className="input"
            placeholder="Search products, sales, customers..."
            style={{
              paddingLeft: 36,
              background: 'white',
              borderColor: 'var(--border-light)',
              borderRadius: '9999px',
              height: 40,
              fontSize: '0.8125rem',
            }}
          />
        </div>
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notifications */}
        <button
          className="btn-ghost"
          style={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute',
            top: 6,
            right: 6,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--danger)',
            border: '2px solid var(--canvas)',
          }} />
        </button>

        {/* User */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.375rem 0.75rem 0.375rem 0.375rem',
              background: 'white',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-light)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--navy-900), var(--royal))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.full_name || 'User'}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {isAdmin ? 'Admin' : 'Sales Staff'}
              </div>
            </div>
          </button>

          {/* Dropdown */}
          {showUserMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                onClick={() => setShowUserMenu(false)}
              />
              <div
                className="animate-fade-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  width: 200,
                  background: 'white',
                  borderRadius: '0.75rem',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--border-light)',
                  padding: '0.375rem',
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    background: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'var(--text-primary)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = '#F3F4F6'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  <User size={16} /> Profile
                </button>
                <div style={{ height: 1, background: 'var(--border-light)', margin: '0.25rem 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    background: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'var(--danger)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.background = 'var(--danger-faint)'}
                  onMouseLeave={e => e.target.style.background = 'none'}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 640px) {
          header > div:first-child > div { display: none; }
        }
      `}</style>
    </header>
  );
}
