const API = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

async function get(path) {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${API}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ── Customers ──
export async function getCustomers() { return get('/customers'); }
export async function getCustomer(id) { return get(`/customers/${id}`); }
export async function searchCustomers(query) { return get(`/customers${query ? `?q=${encodeURIComponent(query)}` : ''}`); }
export async function saveCustomer(customer) {
  return customer._isNew !== false ? post('/customers', customer) : put(`/customers/${customer.id}`, customer);
}

// ── Recipients ──
export async function getRecipients(customerId) { return get(`/customers/${customerId}/recipients`); }
export async function getRecipient(customerId, recipientId) { return get(`/customers/${customerId}/recipients/${recipientId}`); }
export async function saveRecipient(customerId, recipient) { return post(`/customers/${customerId}/recipients`, recipient); }

// ── Invoices ──
export async function getInvoices() {
  const invoices = await get('/invoices');
  return invoices.map(normalizeInvoice);
}
export async function getInvoice(id) {
  const inv = await get(`/invoices/${id}`);
  return normalizeInvoice(inv);
}
export async function saveInvoice(invoice) {
  const { id, ...rest } = invoice;
  if (invoice._isNew !== false) {
    return post('/invoices', invoice).then(normalizeInvoice);
  }
  return put(`/invoices/${id}`, rest).then(normalizeInvoice);
}
export async function getNextInvoiceNumber() {
  const { number } = await get('/invoices/next-number');
  return number;
}

function normalizeInvoice(inv) {
  // Normalize line items from DB format to frontend format
  if (inv.lineItems) {
    inv.lineItems = inv.lineItems.map((li) => ({
      ...li,
      basePrice: parseFloat(li.basePrice),
      finalPrice: parseFloat(li.finalPrice),
      dimensions: li.dimensionsL ? { length: parseFloat(li.dimensionsL), width: parseFloat(li.dimensionsW), height: parseFloat(li.dimensionsH) } : null,
      discount: li.discountType ? { type: li.discountType, amount: parseFloat(li.discountAmount) } : null,
      photos: (li.photos || []).map((p) => p.data || p),
    }));
  }
  inv.subtotal = parseFloat(inv.subtotal) || 0;
  inv.totalDiscount = parseFloat(inv.totalDiscount) || 0;
  inv.finalTotal = parseFloat(inv.finalTotal) || 0;
  inv.amountPaid = parseFloat(inv.amountPaid) || 0;
  return inv;
}

// ── Shipments ──
export async function getShipments() { return get('/shipments'); }
export async function getShipment(id) { return get(`/shipments/${id}`); }
export async function saveShipment(shipment) {
  if (shipment._isNew !== false) return post('/shipments', shipment);
  return put(`/shipments/${shipment.id}`, shipment);
}

// ── Company Settings ──
export async function getCompanySettings() { return get('/settings'); }
export async function saveCompanySettings(settings) { return put('/settings', settings); }

// ── Catalog Items ──
export async function getCatalogItems() {
  const items = await get('/catalog');
  return items.map((i) => ({ ...i, price: parseFloat(i.price) }));
}
export async function saveCatalogItem(item, isNew = true) {
  if (isNew) return post('/catalog', item);
  return put(`/catalog/${item.id}`, item);
}
export async function deleteCatalogItem(id) { return del(`/catalog/${id}`); }
export async function getCatalogCategories() {
  const items = await getCatalogItems();
  return [...new Set(items.filter((i) => i.active).map((i) => i.category))];
}
