import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', password_confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        setError(typeof firstError === 'string' ? firstError : JSON.stringify(firstError));
      } else {
        setError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--canvas)', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="SmartInv" style={{ width: 48, height: 48, borderRadius: '0.75rem', objectFit: 'cover' }} />
            <span style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--navy-900)' }}>SmartInv</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-serif)' }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Start managing your inventory today.</p>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'var(--danger-faint)', color: '#991B1B', fontSize: '0.875rem', marginBottom: '1.25rem', border: '1px solid #FECACA' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Full Name</label>
            <input className="input" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="John Doe" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Phone (Optional)</label>
            <input className="input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+1 555 0100" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Password</label>
              <input className="input" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min 8 chars" required minLength={8} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Confirm</label>
              <input className="input" type="password" value={form.password_confirm} onChange={e => setForm({...form, password_confirm: e.target.value})} placeholder="Repeat" required minLength={8} />
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--royal)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
