import React, { useState } from 'react';
import { getCatalogItems, saveCatalogItem, deleteCatalogItem, getCatalogCategories } from '../../utils/storage';
import { generateId } from '../../utils/helpers';
import { formatPrice } from '../../utils/pricing';
import './Admin.css';

export default function CatalogManager() {
  const [items, setItems] = useState(getCatalogItems());
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', price: '', active: true });
  const categories = getCatalogCategories();

  const refresh = () => setItems(getCatalogItems());

  const openNew = () => {
    setForm({ name: '', description: '', category: '', price: '', active: true });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ name: item.name, description: item.description, category: item.category, price: String(item.price), active: item.active });
    setEditing(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) return;
    const item = {
      id: editing || generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category.trim() || 'Uncategorized',
      price: parseFloat(form.price),
      active: form.active,
      createdAt: editing ? undefined : new Date().toISOString(),
    };
    saveCatalogItem(item);
    refresh();
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this catalog item?')) {
      deleteCatalogItem(id);
      refresh();
    }
  };

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
