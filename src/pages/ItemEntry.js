import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { calculateCustomPrice, applyDiscount, formatPrice, calculateInvoiceTotals } from '../utils/pricing';
import { generateId, formatInvoiceNumber } from '../utils/helpers';
import { getCustomer, getRecipient, getInvoice, saveInvoice, getNextInvoiceNumber, getCatalogItems, getCatalogCategories, getShipments } from '../utils/api';
import PhotoCapture from '../components/PhotoCapture';
import './ItemEntry.css';

export default function ItemEntry() {
  const navigate = useNavigate();
  const { customerId, recipientId, invoiceId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [recipient, setRecipient] = useState(null);
  const [existingInvoice, setExistingInvoice] = useState(null);
  const [lineItems, setLineItems] = useState([]);
  const [itemType, setItemType] = useState('custom'); // 'custom' | 'fixed'
  const [selectedShipment, setSelectedShipment] = useState('');
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom item form
  const [customForm, setCustomForm] = useState({ length: '', width: '', height: '', quantity: '1', description: '' });
  // Catalog
  const [catalogItems, setCatalogItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [catFilter, setCatFilter] = useState('');
  const [catSearch, setCatSearch] = useState('');
  // Discount
  const [discount, setDiscount] = useState({ enabled: false, type: 'percentage', amount: '' });
  // Photos
  const [photos, setPhotos] = useState([]);
  // Toast
  const [toast, setToast] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [catItems, cats, ships] = await Promise.all([
          getCatalogItems(),
          getCatalogCategories(),
          getShipments(),
        ]);
        setCatalogItems(catItems.filter((i) => i.active));
        setCategories(cats);
        const activeShips = ships.filter((s) => s.status === 'collecting');
        setShipments(activeShips);
        if (activeShips.length > 0) setSelectedShipment(activeShips[0].id);

        if (invoiceId) {
          const inv = await getInvoice(invoiceId);
          if (inv) {
            setExistingInvoice(inv);
            const [c, r] = await Promise.all([
              getCustomer(inv.customerId),
              getRecipient(inv.customerId, inv.recipientId),
            ]);
            setCustomer(c);
            setRecipient(r);
          }
        } else if (customerId && recipientId) {
          const [c, r] = await Promise.all([
            getCustomer(customerId),
            getRecipient(customerId, recipientId),
          ]);
          setCustomer(c);
          setRecipient(r);
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [customerId, recipientId, invoiceId]);

  // Pricing
  const dims = { length: parseFloat(customForm.length) || 0, width: parseFloat(customForm.width) || 0, height: parseFloat(customForm.height) || 0 };
  const qty = parseInt(customForm.quantity) || 1;
  const customUnitPrice = (dims.length > 0 && dims.width > 0 && dims.height > 0) ? calculateCustomPrice(dims.length, dims.width, dims.height) : 0;
  const discountObj = discount.enabled && parseFloat(discount.amount) > 0 ? { type: discount.type, amount: parseFloat(discount.amount) } : null;

  const runningTotals = calculateInvoiceTotals(lineItems);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const resetForm = () => {
    setCustomForm({ length: '', width: '', height: '', quantity: '1', description: '' });
    setDiscount({ enabled: false, type: 'percentage', amount: '' });
    setPhotos([]);
  };

  const addCustomItem = () => {
    if (customUnitPrice === 0 || qty < 1) return;
    const base = customUnitPrice;
    const final = discountObj ? applyDiscount(base, discountObj) : base;
    const item = {
      id: generateId(), type: 'custom',
      dimensions: { ...dims }, quantity: qty, basePrice: base,
      discount: discountObj, finalPrice: final,
      photos: [...photos], description: customForm.description.trim() || null,
    };
    setLineItems((prev) => [...prev, item]);
    showToast('Custom item added');
    resetForm();
  };

  const addCatalogItem = (catItem) => {
    const base = catItem.price;
    const final = discountObj ? applyDiscount(base, discountObj) : base;

    // Check if same catalog item already added with same discount
    const existingIndex = lineItems.findIndex(
      (li) => li.catalogItemId === catItem.id && li.finalPrice === final
    );

    let newTotal = qty;
    if (existingIndex !== -1) {
      newTotal = lineItems[existingIndex].quantity + qty;
      setLineItems((prev) => prev.map((li, i) =>
        i === existingIndex ? { ...li, quantity: newTotal } : li
      ));
    } else {
      const item = {
        id: generateId(), type: 'fixed', catalogItemId: catItem.id,
        catalogName: catItem.name, quantity: qty, basePrice: base,
        discount: discountObj, finalPrice: final,
        photos: [...photos], description: catItem.description || null,
      };
      setLineItems((prev) => [...prev, item]);
    }
    showToast(`${catItem.name} added (${newTotal} total)`);
    resetForm();
  };

  const removeItem = (id) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
  };

  const generateInvoiceHandler = async () => {
    if (lineItems.length === 0) return;
    const totals = calculateInvoiceTotals(lineItems);

    if (existingInvoice) {
      const origCount = existingInvoice.lineItems.reduce((s, li) => s + li.quantity, 0);
      const addedCount = lineItems.reduce((s, li) => s + li.quantity, 0);
      const allItems = [...existingInvoice.lineItems, ...lineItems];
      const newTotals = calculateInvoiceTotals(allItems);
      const updated = {
        ...existingInvoice, lineItems: allItems,
        subtotal: newTotals.subtotal, totalDiscount: newTotals.totalDiscount, finalTotal: newTotals.finalTotal,
        originalItemCount: origCount, addedItemCount: (existingInvoice.addedItemCount || 0) + addedCount,
        lastEditedAt: new Date().toISOString(),
      };
      await saveInvoice(updated, false);
      navigate(`/invoice/${existingInvoice.id}`, { replace: true });
    } else {
      const totalCount = lineItems.reduce((s, li) => s + li.quantity, 0);
      const invoiceNumber = await getNextInvoiceNumber();
      const invoice = {
        id: generateId(), invoiceNumber,
        customerId: customer.id, customerName: customer.fullName,
        customerEmail: customer.email, customerAddress: customer.address, customerPhone: customer.phone,
        recipientId: recipient.id,
        recipientName: `${recipient.firstName} ${recipient.lastName}`,
        recipientPhone: recipient.phone,
        recipientAddress: `${recipient.address}, ${recipient.city}, ${recipient.country}`,
        lineItems, ...totals,
        originalItemCount: totalCount, addedItemCount: 0,
        paymentStatus: 'unpaid', paymentMethod: null, amountPaid: 0,
        shipmentId: selectedShipment || null,
        createdAt: new Date().toISOString(), status: 'completed',
      };
      await saveInvoice(invoice);
      navigate(`/invoice/${invoice.id}`, { replace: true });
    }
  };

  if (loading || !customer || !recipient) {
    return <div className="item-entry-page"><p>Loading...</p></div>;
  }

  const filteredCatalog = catalogItems.filter((i) => {
    if (catFilter && i.category !== catFilter) return false;
    if (catSearch && !i.name.toLowerCase().includes(catSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="item-entry-page">
      {toast && <div className="item-toast">{toast}</div>}
      {/* Banner */}
      <div className="pickup-banner">
        <div className="banner-col">
          <span className="banner-label">{existingInvoice ? `Adding to #${formatInvoiceNumber(existingInvoice.invoiceNumber, existingInvoice.originalItemCount, existingInvoice.addedItemCount)}` : 'From'}</span>
          <span className="banner-val">{customer.fullName}</span>
        </div>
        <div className="banner-col">
          <span className="banner-label">Ship To</span>
          <span className="banner-val">{recipient.firstName} {recipient.lastName}</span>
          <span className="banner-sub">{recipient.city}, {recipient.country}</span>
        </div>
      </div>

      {/* Item type toggle */}
      <div className="type-toggle">
        <button className={'toggle-btn' + (itemType === 'custom' ? ' active' : '')} onClick={() => setItemType('custom')}>Custom Item</button>
        <button className={'toggle-btn' + (itemType === 'fixed' ? ' active' : '')} onClick={() => setItemType('fixed')}>Catalog Item</button>
      </div>

      {/* Custom Item Form */}
      {itemType === 'custom' && (
        <div className="entry-section">
          <h3>Dimensions (inches)</h3>
          <div className="dims-row">
            <div className="dim-input">
              <label>L</label>
              <input type="number" inputMode="decimal" value={customForm.length} onChange={(e) => setCustomForm((p) => ({ ...p, length: e.target.value }))} placeholder="0" />
            </div>
            <span className="dim-x">×</span>
            <div className="dim-input">
              <label>W</label>
              <input type="number" inputMode="decimal" value={customForm.width} onChange={(e) => setCustomForm((p) => ({ ...p, width: e.target.value }))} placeholder="0" />
            </div>
            <span className="dim-x">×</span>
            <div className="dim-input">
              <label>H</label>
              <input type="number" inputMode="decimal" value={customForm.height} onChange={(e) => setCustomForm((p) => ({ ...p, height: e.target.value }))} placeholder="0" />
            </div>
          </div>

          <div className="qty-row">
            <div className="form-group">
              <label>Qty</label>
              <input type="number" inputMode="numeric" min="1" value={customForm.quantity} onChange={(e) => setCustomForm((p) => ({ ...p, quantity: e.target.value }))} />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Description</label>
              <input type="text" value={customForm.description} onChange={(e) => setCustomForm((p) => ({ ...p, description: e.target.value }))} placeholder="Optional" />
            </div>
          </div>

          {customUnitPrice > 0 && (
            <div className="price-preview">
              <div className="price-line"><span>Unit Price:</span><span>{formatPrice(customUnitPrice)}</span></div>
              {discountObj && <div className="price-line discount"><span>Discount:</span><span>-{formatPrice(customUnitPrice - applyDiscount(customUnitPrice, discountObj))}</span></div>}
              <div className="price-line total"><span>Line Total ({qty}):</span><span>{formatPrice((discountObj ? applyDiscount(customUnitPrice, discountObj) : customUnitPrice) * qty)}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Catalog Item Browser */}
      {itemType === 'fixed' && (
        <div className="entry-section">
          <h3>Select Catalog Item</h3>
          <input className="cat-search" type="text" placeholder="Search items..." value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
          <div className="cat-filters">
            <button className={'cat-tag' + (!catFilter ? ' active' : '')} onClick={() => setCatFilter('')}>All</button>
            {categories.map((cat) => (
              <button key={cat} className={'cat-tag' + (catFilter === cat ? ' active' : '')} onClick={() => setCatFilter(cat)}>{cat}</button>
            ))}
          </div>
          <div className="catalog-grid">
            {filteredCatalog.map((item) => (
              <div key={item.id} className="catalog-card" onClick={() => addCatalogItem(item)}>
                {item.image ? (
                  <div className="cat-item-img-wrap"><img src={item.image} alt={item.name} /></div>
                ) : (
                  <div className="cat-item-placeholder"><span>📦</span></div>
                )}
                <div className="cat-item-body">
                  <div className="cat-item-name">{item.name}</div>
                  <div className="cat-item-desc">{item.description}</div>
                  <div className="cat-item-price">{formatPrice(item.price)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="qty-row" style={{ marginTop: 12 }}>
            <div className="form-group">
              <label>Qty (for next selection)</label>
              <input type="number" inputMode="numeric" min="1" value={customForm.quantity} onChange={(e) => setCustomForm((p) => ({ ...p, quantity: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* Photos */}
      <div className="entry-section">
        <h3>Photos (up to 3)</h3>
        <PhotoCapture photos={photos} onChange={setPhotos} max={3} />
      </div>

      {/* Discount */}
      <div className="entry-section">
        <label className="checkbox-label">
          <input type="checkbox" checked={discount.enabled} onChange={(e) => setDiscount((p) => ({ ...p, enabled: e.target.checked }))} />
          Apply Discount
        </label>
        {discount.enabled && (
          <div className="discount-row">
            <select value={discount.type} onChange={(e) => setDiscount((p) => ({ ...p, type: e.target.value }))}>
              <option value="percentage">%</option>
              <option value="dollar">$</option>
            </select>
            <input type="number" inputMode="decimal" placeholder="Amount" value={discount.amount} onChange={(e) => setDiscount((p) => ({ ...p, amount: e.target.value }))} />
          </div>
        )}
      </div>

      {/* Add button for custom items */}
      {itemType === 'custom' && (
        <button className="add-item-btn" onClick={addCustomItem} disabled={customUnitPrice === 0}>
          + Add Custom Item
        </button>
      )}

      {/* Line Items */}
      {lineItems.length > 0 && (
        <div className="added-items">
          <h3>Added Items ({lineItems.length})</h3>
          {lineItems.map((item) => (
            <div key={item.id} className="added-item-card">
              <div className="item-row">
                <div className="item-details">
                  <span className="item-name">{item.type === 'custom' ? 'Custom Item' : item.catalogName}</span>
                  <span className="item-meta">
                    {item.type === 'custom' && `${item.dimensions.length}×${item.dimensions.width}×${item.dimensions.height}" · `}
                    Qty: {item.quantity} × {formatPrice(item.finalPrice)} = {formatPrice(item.finalPrice * item.quantity)}
                  </span>
                </div>
                <button className="remove-item-btn" onClick={() => removeItem(item.id)}>×</button>
              </div>
              {item.discount && (
                <div className="item-discount">Discount: {item.discount.type === 'percentage' ? `${item.discount.amount}%` : `$${item.discount.amount}`}</div>
              )}
              {item.photos.length > 0 && (
                <div className="item-photos">
                  {item.photos.map((p, i) => <img key={i} src={p} alt="" className="mini-thumb" />)}
                </div>
              )}
            </div>
          ))}

          <div className="invoice-totals">
            <div className="total-line"><span>Subtotal:</span><span>{formatPrice(runningTotals.subtotal)}</span></div>
            {runningTotals.totalDiscount > 0 && (
              <div className="total-line discount"><span>Discounts:</span><span>-{formatPrice(runningTotals.totalDiscount)}</span></div>
            )}
            <div className="total-line grand"><span>Total:</span><span>{formatPrice(runningTotals.finalTotal)}</span></div>
          </div>

          {/* Shipment assignment */}
          {!existingInvoice && shipments.length > 0 && (
            <div className="shipment-select">
              <label>Assign to Shipment (optional)</label>
              <select value={selectedShipment} onChange={(e) => setSelectedShipment(e.target.value)}>
                <option value="">— Unassigned —</option>
                {shipments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          <button className="generate-btn" onClick={generateInvoiceHandler}>
            {existingInvoice ? 'Update Invoice' : 'Generate Invoice'}
          </button>
        </div>
      )}
    </div>
  );
}
