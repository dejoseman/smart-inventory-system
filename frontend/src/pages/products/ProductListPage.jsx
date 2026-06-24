import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productService, categoryService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Plus, Search, Package, Grid3X3, List, Edit, Trash2, AlertTriangle } from 'lucide-react';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (categoryFilter) params.category = categoryFilter;

    setLoading(true);
    Promise.all([
      productService.getAll(params),
      categoryService.getAll(),
    ]).then(([prodRes, catRes]) => {
      setProducts(prodRes.data.results || prodRes.data);
      setCategories(catRes.data.results || catRes.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [search, categoryFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this product?')) return;
    await productService.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">PRODUCT CATALOG</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Products</h1>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
              <Plus size={18} /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <select className="input" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--border-light)', borderRadius: '0.5rem', padding: '0.25rem' }}>
          <button className={`btn-ghost ${viewMode === 'grid' ? '' : ''}`} onClick={() => setViewMode('grid')} style={{ padding: '0.375rem', background: viewMode === 'grid' ? 'white' : 'transparent', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
            <Grid3X3 size={18} />
          </button>
          <button className="btn-ghost" onClick={() => setViewMode('list')} style={{ padding: '0.375rem', background: viewMode === 'list' ? 'white' : 'transparent', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
            <List size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading products...</div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {products.map((product, i) => (
            <div key={product.id} className="card animate-fade-in" style={{ overflow: 'hidden', animationDelay: `${i * 0.03}s` }}>
              <div style={{ height: 160, background: 'linear-gradient(135deg, var(--royal-faint), #F1F5F9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.image ? (
                  <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Package size={48} color="var(--navy-500)" strokeWidth={1} />
                )}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <Link to={`/products/${product.id}`} style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', textDecoration: 'none' }}>
                      {product.name}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.125rem' }}>{product.sku}</div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--navy-900)' }}>
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                </div>
                {product.category_name && (
                  <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>{product.category_name}</span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    {product.is_low_stock && <AlertTriangle size={14} color="var(--warning)" />}
                    <span style={{ fontSize: '0.8125rem', color: product.is_low_stock ? 'var(--warning)' : 'var(--text-secondary)', fontWeight: product.is_low_stock ? 600 : 400 }}>
                      {product.quantity} in stock
                    </span>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="btn-ghost" onClick={() => navigate(`/products/${product.id}/edit`)} style={{ padding: '0.375rem', border: 'none', cursor: 'pointer' }}>
                        <Edit size={15} />
                      </button>
                      <button className="btn-ghost" onClick={() => handleDelete(product.id)} style={{ padding: '0.375rem', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td><Link to={`/products/${product.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>{product.name}</Link></td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8125rem' }}>{product.sku}</td>
                  <td>{product.category_name && <span className="badge badge-info">{product.category_name}</span>}</td>
                  <td style={{ fontWeight: 600 }}>${parseFloat(product.price).toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td><span className={`badge ${product.is_low_stock ? 'badge-warning' : 'badge-success'}`}>{product.is_low_stock ? 'Low Stock' : 'In Stock'}</span></td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn-ghost btn-sm" onClick={() => navigate(`/products/${product.id}/edit`)}><Edit size={14} /></button>
                        <button className="btn-ghost btn-sm" onClick={() => handleDelete(product.id)} style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {products.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Package size={48} color="var(--text-muted)" strokeWidth={1} />
          <h3 style={{ fontWeight: 600, marginTop: '1rem' }}>No products found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
