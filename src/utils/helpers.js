export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatItemCount(original, additions) {
  if (!additions || additions === 0) return `${original}`;
  return `${original}+${additions}`;
}

// Format invoice number with package count: "10001-5" or "10001-5+3"
export function formatInvoiceNumber(invoiceNumber, originalItemCount, addedItemCount) {
  const base = `${invoiceNumber}-${originalItemCount}`;
  if (!addedItemCount || addedItemCount === 0) return base;
  return `${base}+${addedItemCount}`;
}
