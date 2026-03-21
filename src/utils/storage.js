// localStorage utility for data persistence

const KEYS = {
  CUSTOMERS: 'gcgl_customers',
  INVOICES: 'gcgl_invoices',
  CURRENT_INVOICE: 'gcgl_current_invoice',
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

// Customers
export function getCustomers() {
  return get(KEYS.CUSTOMERS) || [];
}

export function saveCustomer(customer) {
  const customers = getCustomers();
  const existing = customers.findIndex((c) => c.id === customer.id);
  if (existing >= 0) {
    customers[existing] = customer;
  } else {
    customers.push(customer);
  }
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

// Invoices
export function getInvoices() {
  return get(KEYS.INVOICES) || [];
}

export function getInvoice(id) {
  return getInvoices().find((inv) => inv.id === id) || null;
}

export function saveInvoice(invoice) {
  const invoices = getInvoices();
  const existing = invoices.findIndex((i) => i.id === invoice.id);
  if (existing >= 0) {
    invoices[existing] = invoice;
  } else {
    invoices.push(invoice);
  }
  set(KEYS.INVOICES, invoices);
  return invoice;
}

export function getNextInvoiceNumber() {
  const num = get(KEYS.NEXT_INVOICE_NUM) || 10001;
  set(KEYS.NEXT_INVOICE_NUM, num + 1);
  return num;
}

// Current invoice in progress
export function getCurrentInvoice() {
  return get(KEYS.CURRENT_INVOICE);
}

export function setCurrentInvoice(invoice) {
  set(KEYS.CURRENT_INVOICE, invoice);
}

export function clearCurrentInvoice() {
  localStorage.removeItem(KEYS.CURRENT_INVOICE);
}
