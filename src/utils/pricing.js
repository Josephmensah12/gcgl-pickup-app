// Pricing algorithm: $0.011 per cubic inch
const RATE_PER_CUBIC_INCH = 0.011;

export function calculatePrice(length, width, height) {
  const volume = length * width * height;
  const price = volume * RATE_PER_CUBIC_INCH;
  return Math.max(0.01, Math.round(price * 100) / 100);
}

export function formatPrice(amount) {
  return `$${amount.toFixed(2)}`;
}
