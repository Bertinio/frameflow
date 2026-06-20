export function roundPrice(value: number, precision = 2) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function applyMargin(price: number, marginRate: number) {
  const safePrice = roundPrice(price);
  const safeMarginRate = Number.isFinite(marginRate) ? marginRate : 0;
  const margin = roundPrice(safePrice * safeMarginRate);
  const total = roundPrice(safePrice + margin);

  return {
    price: safePrice,
    margin,
    total,
  };
}

export function calculatePriceWithMargin(price: number, marginRate: number) {
  return applyMargin(price, marginRate);
}
