import React, { useState, useEffect, useRef } from 'react';
import { getCatalogItems, saveCatalogItem, deleteCatalogItem, getCatalogCategories } from '../../utils/api';
import { generateId, compressImage } from '../../utils/helpers';
import { formatPrice } from '../../utils/pricing';
import './Admin.css';

export default function CatalogManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', active: true, image: null });
  const [loading, setLoading] = useState(true);
  const fileRef = useRef(null);

  const refresh = async () => {
    const [catItems, cats] = await Promise.all([getCatalogItems(), getCatalogCategories()]);
    setItems(catItems);
    setCategories(cats);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const openNew = () => {
    setForm({ name: '', description: '', category: '', price: '', active: true, image: null });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description, category: item.category, price: String(item.price), active: item.active, image: item.image || null });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result, 400, 0.7);
      setForm((p) => ({ ...p, image: compressed }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return;
    const item = {
      id: editing || generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Uncategorized',
      price: parseFloat(form.price),
      active: form.active,
      image: form.image || null,
      createdAt: editing ? undefined : new Date().toISOString(),
    };
    await saveCatalogItem(item, !editing);
    await refresh();
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this catalog item?')) {
      await deleteCatalogItem(id);
      await refresh();
    }
  };

  if (loading) return <div className="admin-page"><p>Loading...</p></div>;

  return (
    <div className="admin-page">
      <h2>Item Catalog</h2>
      <button className="add-btn" onClick={openNew}>+ Add Catalog Item</button>

      {showForm && (
        <div className="admin-form" style={{ background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
          <div className="form-group">
            <label>Item Name</label>
            <input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Large Box" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="e.g. 24×24×24 inches" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input list="cat-suggestions" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Boxes" />
            <datalist id="cat-suggestions">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label>Price ($)</label>
            <input type="number" inputMode="decimal" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Item Photo</label>
            <div className="catalog-image-upload">
              {form.image ? (
                <div className="catalog-image-preview">
                  <img src={form.image} alt="Item" />
                  <button className="catalog-image-remove" onClick={() => setForm((p) => ({ ...p, image: null }))}>×</button>
                </div>
              ) : (
                <button className="catalog-image-btn" onClick={() => fileRef.current.click()}>📷 Upload Photo</button>
              )}
              {form.image && <button className="catalog-image-change" onClick={() => fileRef.current.click()}>Change Photo</button>}
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </div>
          </div>
          <label className="checkbox-label" style={{ marginBottom: 12 }}>
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
            Active (visible to drivers)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="save-btn" onClick={handleSave}>{editing ? 'Update' : 'Add Item'}</button>
            <button className="save-btn" style={{ background: '#6b7280' }} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {items.map((item) => (
        <div key={item.id} className="admin-list-card" style={{ opacity: item.active ? 1 : 0.5 }}>
          {item.image && <img src={item.image} alt={item.name} className="card-thumb" />}
          <div className="card-info">
            <div className="card-name">{item.name}</div>
            <div className="card-sub">{item.category} — {item.description}</div>
          </div>
          <div className="card-price">{formatPrice(item.price)}</div>
          <div className="card-actions">
            <button className="icon-btn edit" onClick={() => openEdit(item)}>✏️</button>
            <button className="icon-btn delete" onClick={() => handleDelete(item.id)}>🗑️</button>
          </div>
        </div>
      ))}
    </div>
  );
}
