import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService, categoryService } from '../../services';
import { ArrowLeft, Upload } from 'lucide-react';

export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', sku: '', barcode: '', price: '', cost_price: '',
    quantity: '', low_stock_threshold: '10', category: '', description: '', image: null,
  });

  useEffect(() => {
    categoryService.getAll().then(res => setCategories(res.data.results || res.data));
    if (isEdit) {
      productService.getOne(id).then(res => {
        const p = res.data;
        setForm({
          name: p.name, sku: p.sku, barcode: p.barcode || '', price: p.price,
          cost_price: p.cost_price, quantity: p.quantity, low_stock_threshold: p.low_stock_threshold,
          category: p.category || '', description: p.description || '', image: null,
        });
      });
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (!data.image) delete data.image;
      if (isEdit) {
        await productService.update(id, data);
      } else {
        await productService.create(data);
      }
      navigate('/products');
    } catch (err) {
      alert(JSON.stringify(err.response?.data?.errors || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
        <ArrowLeft size={18} /> Back
      </button>
      <span className="eyebrow">{isEdit ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</span>
      <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem', marginBottom: '1.5rem' }}>
        {isEdit ? 'Edit Product' : 'Add New Product'}
      </h1>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Product Name *</label>
            <input className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Wireless Mouse" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>SKU *</label>
            <input className="input" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required placeholder="ELEC-001" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Barcode</label>
            <input className="input" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="123456789" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Selling Price *</label>
            <input className="input" type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required placeholder="29.99" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Cost Price</label>
            <input className="input" type="number" step="0.01" value={form.cost_price} onChange={e => setForm({...form, cost_price: e.target.value})} placeholder="15.00" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Quantity</label>
            <input className="input" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} placeholder="100" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Low Stock Threshold</label>
            <input className="input" type="number" value={form.low_stock_threshold} onChange={e => setForm({...form, low_stock_threshold: e.target.value})} placeholder="10" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Category</label>
            <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Description</label>
            <textarea className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="Product description..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem' }}>Product Image</label>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '0.75rem', cursor: 'pointer', color: 'var(--text-muted)', transition: 'all 0.2s' }}>
              <Upload size={20} />
              <span>{form.image?.name || 'Click to upload image'}</span>
              <input type="file" accept="image/*" onChange={e => setForm({...form, image: e.target.files[0]})} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
