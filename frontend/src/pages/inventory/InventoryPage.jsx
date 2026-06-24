import { useState, useEffect } from 'react';
import { productService, inventoryService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Plus } from 'lucide-react';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('stock');
  const [showRestock, setShowRestock] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    Promise.all([
      productService.getAll({ page_size: 100 }),
      inventoryService.getLogs({ page_size: 50 }),
    ]).then(([prodRes, logRes]) => {
      setProducts(prodRes.data.results || prodRes.data);
      setLogs(logRes.data.results || logRes.data);
    });
  }, []);

  const handleRestock = async (productId) => {
    if (!restockQty || parseInt(restockQty) <= 0) return;
    await inventoryService.restock({ product_id: productId, quantity: parseInt(restockQty), notes: 'Manual restock' });
    setShowRestock(null);
    setRestockQty('');
    // Refresh
    const [prodRes, logRes] = await Promise.all([
      productService.getAll({ page_size: 100 }),
      inventoryService.getLogs({ page_size: 50 }),
    ]);
    setProducts(prodRes.data.results || prodRes.data);
    setLogs(logRes.data.results || logRes.data);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">STOCK MANAGEMENT</span>
        <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Inventory</h1>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {['stock', 'logs'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'} btn-sm`} onClick={() => setTab(t)} style={{ textTransform: 'capitalize' }}>
            {t === 'stock' ? 'Stock Levels' : 'Activity Log'}
          </button>
        ))}
      </div>

      {tab === 'stock' ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Product</th><th>SKU</th><th>Category</th><th>In Stock</th><th>Threshold</th><th>Status</th>{isAdmin && <th>Action</th>}</tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{p.sku}</td>
                  <td>{p.category_name && <span className="badge badge-info">{p.category_name}</span>}</td>
                  <td style={{ fontWeight: 700 }}>{p.quantity}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.low_stock_threshold}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.is_low_stock ? 'badge-warning' : 'badge-success'}`}>
                      {p.quantity === 0 ? 'Out of Stock' : p.is_low_stock ? 'Low Stock' : 'OK'}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {showRestock === p.id ? (
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <input className="input" type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} style={{ width: 70, padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }} placeholder="Qty" />
                          <button className="btn btn-primary btn-sm" onClick={() => handleRestock(p.id)}>Add</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setShowRestock(null)}>✕</button>
                        </div>
                      ) : (
                        <button className="btn btn-outline btn-sm" onClick={() => setShowRestock(p.id)}>
                          <Plus size={14} /> Restock
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Previous</th><th>Change</th><th>New</th><th>Type</th><th>By</th><th>Date</th></tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600 }}>{log.product_name}</td>
                  <td>{log.previous_quantity}</td>
                  <td style={{ fontWeight: 700, color: log.change > 0 ? 'var(--emerald)' : 'var(--danger)' }}>
                    {log.change > 0 ? '+' : ''}{log.change}
                  </td>
                  <td>{log.new_quantity}</td>
                  <td><span className={`badge ${log.action_type === 'sale' ? 'badge-danger' : log.action_type === 'restock' ? 'badge-success' : 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{log.action_type}</span></td>
                  <td style={{ color: 'var(--text-muted)' }}>{log.performed_by_name}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
