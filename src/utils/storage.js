// localStorage utility for data persistence

const KEYS = {
  CUSTOMERS: 'gcgl_customers',
  INVOICES: 'gcgl_invoices',
  SHIPMENTS: 'gcgl_shipments',
  COMPANY_SETTINGS: 'gcgl_company_settings',
  CATALOG_ITEMS: 'gcgl_catalog_items',
  NEXT_INVOICE_NUM: 'gcgl_next_invoice_num',
};

function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Customers ──
export function getCustomers() {
  return get(KEYS.CUSTOMERS) || [];
}

export function getCustomer(id) {
  return getCustomers().find((c) => c.id === id) || null;
}

export function saveCustomer(customer) {
  const customers = getCustomers();
  const idx = customers.findIndex((c) => c.id === customer.id);
  if (idx >= 0) customers[idx] = customer;
  else customers.push(customer);
  set(KEYS.CUSTOMERS, customers);
  return customer;
}

export function searchCustomers(query) {
  if (!query) return getCustomers();
  const q = query.toLowerCase();
  return getCustomers().filter(
    (c) =>
      c.fullName.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
  );
}

// ── Recipients ──
export function getRecipients(customerId) {
  const customer = getCustomer(customerId);
  return customer?.recipients || [];
}

export function saveRecipient(customerId, recipient) {
  const customer = getCustomer(customerId);
  if (!customer) return null;
  if (!customer.recipients) customer.recipients = [];
  const idx = customer.recipients.findIndex((r) => r.id === recipient.id);
  if (idx >= 0) customer.recipients[idx] = recipient;
  else customer.recipients.push(recipient);
  // If marked default, unset others
  if (recipient.isDefault) {
    customer.recipients.forEach((r) => {
      if (r.id !== recipient.id) r.isDefault = false;
    });
  }
  saveCustomer(customer);
  return recipient;
}

export function getRecipient(customerId, recipientId) {
  return getRecipients(customerId).find((r) => r.id === recipientId) || null;
}

// ── Invoices ──
export function getInvoices() {
  return get(KEYS.INVOICES) || [];
}

export function getInvoice(id) {
  return getInvoices().find((inv) => inv.id === id) || null;
}

export function saveInvoice(invoice) {
  const invoices = getInvoices();
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) invoices[idx] = invoice;
  else invoices.push(invoice);
  set(KEYS.INVOICES, invoices);
  return invoice;
}

export function getNextInvoiceNumber() {
  const num = get(KEYS.NEXT_INVOICE_NUM) || 10001;
  set(KEYS.NEXT_INVOICE_NUM, num + 1);
  return num;
}

// ── Shipments ──
export function getShipments() {
  return get(KEYS.SHIPMENTS) || [];
}

export function getShipment(id) {
  return getShipments().find((s) => s.id === id) || null;
}

export function saveShipment(shipment) {
  const shipments = getShipments();
  const idx = shipments.findIndex((s) => s.id === shipment.id);
  if (idx >= 0) shipments[idx] = shipment;
  else shipments.push(shipment);
  set(KEYS.SHIPMENTS, shipments);
  return shipment;
}

// ── Company Settings ──
const DEFAULT_SETTINGS = {
  companyInfo: {
    name: 'GCGL Logistics',
    logo: null,
    address: 'Houston, TX',
    phone: '',
    email: '',
    website: '',
  },
  branding: {
    primaryColor: '#1a56db',
    footerText: 'Thank you for choosing GCGL Logistics!',
  },
  paymentMethods: {
    square: { enabled: false, instructions: '' },
    zelle: { enabled: false, instructions: '' },
    cash: { enabled: true, instructions: 'Cash accepted at pickup' },
    check: { enabled: false, instructions: '' },
  },
  shipmentSettings: {
    capacityType: 'money',
    moneyThresholds: { min: 25000, max: 30000 },
    volumeCapacity: 2390,
    weightCapacity: 67200,
  },
  policies: {
    prohibited: [
      'Flammable materials',
      'Explosives',
      'Perishable goods without proper packaging',
      'Illegal substances',
    ],
    terms: 'All items shipped at owner\'s risk. GCGL Logistics is not liable for damages during transit. Items must be properly packaged.',
    disclaimers: 'Prices are subject to change. Delivery times are estimated and not guaranteed.',
  },
};

export function getCompanySettings() {
  return get(KEYS.COMPANY_SETTINGS) || DEFAULT_SETTINGS;
}

export function saveCompanySettings(settings) {
  set(KEYS.COMPANY_SETTINGS, settings);
  return settings;
}

// ── Catalog Items ──
const DEFAULT_CATALOG = [
  { id: 'cat-1', name: 'Small Box', description: '12"×12"×12"', category: 'Boxes', price: 15.84, active: true },
  { id: 'cat-2', name: 'Medium Box', description: '18"×18"×18"', category: 'Boxes', price: 35.64, active: true },
  { id: 'cat-3', name: 'Large Box', description: '24"×24"×24"', category: 'Boxes', price: 63.50, active: true },
  { id: 'cat-4', name: 'TV 32" LED', description: '32 inch LED Television', category: 'Televisions', price: 45.00, active: true },
  { id: 'cat-5', name: 'TV 55" LED', description: '55 inch LED Television', category: 'Televisions', price: 75.00, active: true },
  { id: 'cat-6', name: 'Ice Chest Small', description: 'Small ice chest / cooler', category: 'Ice Chests', price: 25.00, active: true },
  { id: 'cat-7', name: 'Ice Chest Large', description: 'Large ice chest / cooler', category: 'Ice Chests', price: 40.00, active: true },
  { id: 'cat-8', name: 'Tote Standard', description: 'Standard storage tote', category: 'Totes', price: 20.00, active: true },
];

export function getCatalogItems() {
  const items = get(KEYS.CATALOG_ITEMS);
  if (!items) {
    set(KEYS.CATALOG_ITEMS, DEFAULT_CATALOG);
    return DEFAULT_CATALOG;
  }
  return items;
}

export function saveCatalogItem(item) {
  const items = getCatalogItems();
  const idx = items.findIndex((i) => i.id === item.id);
  if (idx >= 0) items[idx] = item;
  else items.push(item);
  set(KEYS.CATALOG_ITEMS, items);
  return item;
}

export function deleteCatalogItem(id) {
  const items = getCatalogItems().filter((i) => i.id !== id);
  set(KEYS.CATALOG_ITEMS, items);
}

export function getCatalogCategories() {
  const items = getCatalogItems().filter((i) => i.active);
  return [...new Set(items.map((i) => i.category))];
}
