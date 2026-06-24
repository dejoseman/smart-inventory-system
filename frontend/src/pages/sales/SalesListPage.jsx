import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesService } from '../../services';
import { Plus, Search, Eye } from 'lucide-react';

export default function SalesListPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    salesService.getAll(params)
      .then(res => setSales(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">SALES RECORDS</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Sales</h1>
          <button className="btn btn-primary" onClick={() => navigate('/sales/new')}>
            <Plus size={18} /> New Sale
          </button>
        </div>
      </div>
      <div className="card" style={{ padding: '1rem 1.25rem' }}>
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search by invoice number..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th><th>Customer</th><th>Staff</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
            ) : sales.map(sale => (
              <tr key={sale.id}>
                <td style={{ fontWeight: 600, color: 'var(--royal)' }}>{sale.invoice_number}</td>
                <td>{sale.customer_name}</td>
                <td>{sale.staff_name}</td>
                <td>{sale.item_count}</td>
                <td style={{ fontWeight: 700 }}>${parseFloat(sale.total).toFixed(2)}</td>
                <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{sale.payment_method}</span></td>
                <td><span className={`badge ${sale.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{sale.payment_status}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(sale.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/sales/${sale.id}`)}><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
