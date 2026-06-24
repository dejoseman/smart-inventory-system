import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { salesService } from '../../services';
import { ArrowLeft, Printer } from 'lucide-react';

export default function SaleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);

  useEffect(() => {
    salesService.getOne(id).then(res => setSale(res.data)).catch(() => navigate('/sales'));
  }, [id]);

  if (!sale) return <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost"><ArrowLeft size={18} /> Back</button>
        <button onClick={() => window.print()} className="btn btn-outline"><Printer size={16} /> Print Invoice</button>
      </div>

      <div className="card" style={{ padding: '2.5rem' }}>
        {/* Invoice Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', fontWeight: 700 }}>INVOICE</h1>
            <p style={{ color: 'var(--royal)', fontWeight: 700, fontSize: '1.125rem', marginTop: '0.25rem' }}>{sale.invoice_number}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>SmartInv</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Inventory Management System</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Customer</div>
            <div style={{ fontWeight: 600 }}>{sale.customer_name || 'Walk-in Customer'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Date</div>
            <div style={{ fontWeight: 600 }}>{new Date(sale.created_at).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Staff</div>
            <div style={{ fontWeight: 600 }}>{sale.staff_name || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>Payment</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{sale.payment_method}</span>
              <span className={`badge ${sale.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{sale.payment_status}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table className="table" style={{ marginBottom: '1.5rem' }}>
          <thead>
            <tr>
              <th>Product</th><th>SKU</th><th style={{ textAlign: 'right' }}>Price</th><th style={{ textAlign: 'center' }}>Qty</th><th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items?.map(item => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.product_name}</td>
                <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{item.product_sku}</td>
                <td style={{ textAlign: 'right' }}>${parseFloat(item.unit_price).toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>${parseFloat(item.total).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 260 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>${parseFloat(sale.subtotal).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tax ({parseFloat(sale.tax_rate)}%)</span>
              <span>${parseFloat(sale.tax).toFixed(2)}</span>
            </div>
            {parseFloat(sale.discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.875rem', color: 'var(--emerald)' }}>
                <span>Discount</span>
                <span>-${parseFloat(sale.discount).toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '2px solid var(--navy-900)', marginTop: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <span>Total</span>
              <span>${parseFloat(sale.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
