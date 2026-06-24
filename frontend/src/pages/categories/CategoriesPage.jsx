import { useState, useEffect } from 'react';
import { categoryService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const { isAdmin } = useAuth();

  const fetch = () => {
    categoryService.getAll().then(res => setCategories(res.data.results || res.data));
  };
  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) {
      await categoryService.update(editing, form);
    } else {
      await categoryService.create(form);
    }
    setForm({ name: '', description: '' });
    setEditing(null);
    setShowForm(false);
    fetch();
  };

  const handleEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description });
    setEditing(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await categoryService.delete(id);
    fetch();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="animate-fade-in">
        <span className="eyebrow">PRODUCT ORGANIZATION</span>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 className="heading-editorial" style={{ fontSize: '2rem', marginTop: '0.375rem' }}>Categories</h1>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => { setForm({ name: '', description: '' }); setEditing(null); setShowForm(true); }}>
              <Plus size={18} /> Add Category
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <form onSubmit={handleSubmit} className="card animate-fade-in" style={{ padding: '2rem', width: '100%', maxWidth: 420 }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>{editing ? 'Edit Category' : 'New Category'}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <input className="input" placeholder="Category Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <textarea className="input" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {categories.map((cat, i) => (
          <div key={cat.id} className="card animate-fade-in" style={{ padding: '1.25rem', animationDelay: `${i * 0.03}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 40, height: 40, borderRadius: '0.625rem', background: 'var(--royal-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FolderOpen size={20} color="var(--royal)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{cat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.product_count} product{cat.product_count !== 1 ? 's' : ''}</div>
                </div>
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button className="btn-ghost" onClick={() => handleEdit(cat)} style={{ padding: '0.375rem', border: 'none', cursor: 'pointer' }}><Edit size={15} /></button>
                  <button className="btn-ghost" onClick={() => handleDelete(cat.id)} style={{ padding: '0.375rem', color: 'var(--danger)', border: 'none', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              )}
            </div>
            {cat.description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>{cat.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
