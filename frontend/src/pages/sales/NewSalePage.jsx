import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesService, productService, customerService } from '../../services';
import { useCart } from '../../context/CartContext';
import { Search, Plus, Minus, X, ShoppingCart, CreditCard, Banknote, ArrowRightLeft, Check } from 'lucide-react';

export default function NewSalePage() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const { items, addItem, updateQuantity, removeItem, clearCart, subtotal } = useCart();

  useEffect(() => {
    productService.getAll({ page_size: 100 }).then(res => setProducts(res.data.results || res.data));
    customerService.getAll({ page_size: 100 }).then(res => setCustomers(res.data.results || res.data));
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  );

  const taxRate = 7.5;
  const tax = (subtotal * taxRate) / 100;
  const total = subtotal + tax - discount;

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const data = {
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_method: paymentMethod,
        discount: discount,
        tax_rate: taxRate,
      };
      if (selectedCustomer) data.customer_id = selectedCustomer;
      const res = await salesService.create(data);
      setSuccess(res.data.data);
      clearCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 500 }}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: 500 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--emerald-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Check size={32} color="var(--emerald)" />
          </div>
          <h2 className="heading-editorial" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sale Completed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Invoice: <strong>{success.invoice_number}</strong></p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy-900)' }}>${parseFloat(success.total).toFixed(2)}</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '2rem' }}>
            <button className="btn btn-outline" onClick={() => navigate(`/sales/${success.id}`)}>View Invoice</button>
            <button className="btn btn-primary" onClick={() => setSuccess(null)}>New Sale</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <span className="eyebrow">POINT OF SALE</span>
      <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem', marginBottom: '1.5rem' }}>New Sale</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Product Search */}
        <div>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Search products by name, SKU, or barcode..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => product.quantity > 0 && addItem(product)}
                disabled={product.quantity === 0}
                className="card"
                style={{
                  padding: '1rem', textAlign: 'left', border: 'none', cursor: product.quantity > 0 ? 'pointer' : 'not-allowed',
                  opacity: product.quantity === 0 ? 0.5 : 1, transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{product.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{product.sku}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--navy-900)' }}>${parseFloat(product.price).toFixed(2)}</span>
                  <span style={{ fontSize: '0.75rem', color: product.quantity <= product.low_stock_threshold ? 'var(--warning)' : 'var(--text-muted)' }}>
                    {product.quantity} left
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="card" style={{ position: 'sticky', top: 80, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <ShoppingCart size={20} />
            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Cart ({items.length})</h3>
          </div>

          {/* Customer Selection */}
          <select className="input" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)} style={{ marginBottom: '1rem', fontSize: '0.8125rem' }}>
            <option value="">Walk-in Customer</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Cart Items */}
          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: '1rem' }}>
            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No items in cart
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: '#F9FAFB', borderRadius: '0.625rem' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>${item.price.toFixed(2)} each</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Minus size={12} />
                      </button>
                      <span style={{ fontWeight: 700, fontSize: '0.8125rem', minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: '50%', border: '1px solid var(--border)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', minWidth: 60, textAlign: 'right' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                    <button onClick={() => removeItem(item.product_id)} style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: '0.25rem' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Discount */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem' }}>Discount ($)</label>
            <input className="input" type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} style={{ fontSize: '0.875rem' }} />
          </div>

          {/* Payment Method */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {[
              { value: 'cash', label: 'Cash', icon: Banknote },
              { value: 'card', label: 'Card', icon: CreditCard },
              { value: 'transfer', label: 'Transfer', icon: ArrowRightLeft },
            ].map(pm => (
              <button
                key={pm.value}
                onClick={() => setPaymentMethod(pm.value)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
                  padding: '0.625rem', borderRadius: '0.625rem', border: `2px solid ${paymentMethod === pm.value ? 'var(--royal)' : 'var(--border)'}`,
                  background: paymentMethod === pm.value ? 'var(--royal-faint)' : 'white',
                  color: paymentMethod === pm.value ? 'var(--royal)' : 'var(--text-secondary)',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all 0.15s',
                }}
              >
                <pm.icon size={18} />
                {pm.label}
              </button>
            ))}
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Tax ({taxRate}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--emerald)' }}>
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '2px solid var(--navy-900)' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '1.25rem' }}
            disabled={items.length === 0 || loading}
            onClick={handleCheckout}
          >
            {loading ? 'Processing...' : `Complete Sale — $${total.toFixed(2)}`}
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
