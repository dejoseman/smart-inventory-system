import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { customerService } from '../../services';
import { Plus, Search, Users, Eye } from 'lucide-react';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });
  const navigate = useNavigate();

  const fetchCustomers = () => {
    const params = {};
    if (search) params.search = search;
    customerService.getAll(params)
      .then(res => setCustomers(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, [search]);

  const handleAdd = async (e) => {
    e.preventDefault();
    await customerService.create(newCustomer);
    setNewCustomer({ name: '', phone: '', email: '', address: '' });
    setShowAdd(false);
    fetchCustomers();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">CUSTOMER DATABASE</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Customers</h1>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={18} /> Add Customer</button>
        </div>
      </div>

      {/* Quick Add Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <form onSubmit={handleAdd} className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: 460 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '1.125rem' }}>New Customer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <input className="input" placeholder="Full Name *" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} required />
              <input className="input" placeholder="Phone" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
              <input className="input" type="email" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
              <textarea className="input" placeholder="Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} rows={2} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Customer</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Phone</th><th>Email</th><th>Purchases</th><th>Total Spent</th><th></th></tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : customers.map(c => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.phone || '-'}</td>
                <td style={{ color: 'var(--text-muted)' }}>{c.email || '-'}</td>
                <td><span className="badge badge-info">{c.total_purchases}</span></td>
                <td style={{ fontWeight: 600 }}>${parseFloat(c.total_spending || 0).toFixed(2)}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/customers/${c.id}`)}><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={48} color="var(--text-muted)" strokeWidth={1} />
          <h3 style={{ fontWeight: 600, marginTop: '1rem' }}>No customers found</h3>
        </div>
      )}
    </div>
  );
}
