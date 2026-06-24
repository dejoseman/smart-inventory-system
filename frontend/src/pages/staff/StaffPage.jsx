import { useState, useEffect } from 'react';
import { staffService } from '../../services';
import { Plus, Shield, ShieldOff } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'sales_staff', phone: '' });

  const fetchStaff = () => {
    staffService.getAll().then(res => setStaff(res.data.results || res.data));
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await staffService.create(form);
      setForm({ full_name: '', email: '', password: '', role: 'sales_staff', phone: '' });
      setShowAdd(false);
      fetchStaff();
    } catch (err) {
      alert(JSON.stringify(err.response?.data?.errors || err.message));
    }
  };

  const handleToggle = async (id) => {
    await staffService.toggleActive(id);
    fetchStaff();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">TEAM MANAGEMENT</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Staff</h1>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Staff</button>
        </div>
      </div>

      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <form onSubmit={handleAdd} className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: 460 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Add Staff Member</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <input className="input" placeholder="Full Name *" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} required />
              <input className="input" type="email" placeholder="Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              <input className="input" type="password" placeholder="Password *" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={8} />
              <input className="input" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <select className="input" value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                <option value="sales_staff">Sales Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Staff</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.full_name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                <td><span className={`badge ${s.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>{s.role === 'admin' ? 'Admin' : 'Sales Staff'}</span></td>
                <td style={{ color: 'var(--text-muted)' }}>{s.phone || '-'}</td>
                <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-danger'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <button className={`btn ${s.is_active ? 'btn-outline' : 'btn-primary'} btn-sm`} onClick={() => handleToggle(s.id)}>
                    {s.is_active ? <><ShieldOff size={14} /> Deactivate</> : <><Shield size={14} /> Activate</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
