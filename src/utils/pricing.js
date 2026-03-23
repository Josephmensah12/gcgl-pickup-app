const RATE_PER_CUBIC_INCH = 0.011;

export function calculateCustomPrice(length, width, height) {
  const volume = length * width * height;
  return Math.max(0.01, Math.round(volume * RATE_PER_CUBIC_INCH * 100) / 100);
}

export function applyDiscount(basePrice, discount) {
  if (!discount || !discount.amount) return basePrice;
  const discountAmount =
    discount.type === 'percentage'
      ? basePrice * (discount.amount / 100)
      : discount.amount;
  return Math.max(0.01, Math.round((basePrice - discountAmount) * 100) / 100);
}

export function calculateInvoiceTotals(lineItems) {
  let subtotal = 0;
  let totalDiscount = 0;
  lineItems.forEach((item) => {
    const base = item.basePrice * item.quantity;
    const final = item.finalPrice * item.quantity;
    subtotal += base;
    totalDiscount += base - final;
  });
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    totalDiscount: Math.round(totalDiscount * 100) / 100,
    finalTotal: Math.round((subtotal - totalDiscount) * 100) / 100,
  };
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}
