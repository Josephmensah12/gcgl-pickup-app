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

export function formatInvoiceNumber(invoiceNumber, originalItemCount, addedItemCount) {
  const base = `${invoiceNumber}-${originalItemCount}`;
  if (!addedItemCount || addedItemCount === 0) return base;
  return `${base}+${addedItemCount}`;
}

export function generateShipmentName() {
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `${date}-${seq}`;
}

export function compressImage(dataUrl, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = dataUrl;
  });
}
