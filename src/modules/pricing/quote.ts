export type CatalogVariantForQuote = {
  variantId: string;
  productId: string;
  name: string;
  unitPriceAmount: number | null;
  stockQuantity: number;
  trackInventory: boolean;
  allowPreorder: boolean;
  taxRateBps: number;
  taxIncluded: boolean;
};

export type CouponForQuote = {
  kind: "percentage" | "fixed" | "free_shipping";
  value: number;
  minimumCartAmount?: number | null;
  maximumDiscountAmount?: number | null;
};

type BuildQuoteInput = {
  requestedLines: Array<{ variantId: string; quantity: number }>;
  catalog: CatalogVariantForQuote[];
  shipping: { baseAmount: number; freeThresholdAmount: number | null };
  coupon?: CouponForQuote;
};

export type Quote = {
  lines: Array<{
    variantId: string;
    productId: string;
    name: string;
    unitPriceAmount: number;
    quantity: number;
    lineTotalAmount: number;
    taxAmount: number;
  }>;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  taxAmount: number;
  totalAmount: number;
};

function asNonNegativeInteger(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} geçersiz`);
  }
  return value;
}

export function buildQuote({ requestedLines, catalog, shipping, coupon }: BuildQuoteInput): Quote {
  if (requestedLines.length === 0) throw new Error("Sepet boş");

  const catalogByVariant = new Map(catalog.map((item) => [item.variantId, item]));
  const lines = requestedLines.map(({ variantId, quantity }) => {
    const item = catalogByVariant.get(variantId);
    if (!item) throw new Error("Ürün varyasyonu bulunamadı");
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Adet geçersiz");
    }
    if (item.unitPriceAmount === null || item.unitPriceAmount <= 0) {
      throw new Error("Satış fiyatı tanımlanmamış");
    }
    if (item.trackInventory && !item.allowPreorder && quantity > item.stockQuantity) {
      throw new Error("Yeterli stok yok");
    }

    const unitPriceAmount = asNonNegativeInteger(item.unitPriceAmount, "Fiyat");
    const lineTotalAmount = unitPriceAmount * quantity;
    const taxAmount = item.taxIncluded
      ? Math.round((lineTotalAmount * item.taxRateBps) / (10_000 + item.taxRateBps))
      : Math.round((lineTotalAmount * item.taxRateBps) / 10_000);

    return {
      variantId,
      productId: item.productId,
      name: item.name,
      unitPriceAmount,
      quantity,
      lineTotalAmount,
      taxAmount,
    };
  });

  const subtotalAmount = lines.reduce((sum, line) => sum + line.lineTotalAmount, 0);
  let discountAmount = 0;

  if (coupon && subtotalAmount >= (coupon.minimumCartAmount ?? 0)) {
    if (coupon.kind === "percentage") {
      discountAmount = Math.round((subtotalAmount * coupon.value) / 10_000);
    } else if (coupon.kind === "fixed") {
      discountAmount = coupon.value;
    }
    if (coupon.maximumDiscountAmount !== null && coupon.maximumDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maximumDiscountAmount);
    }
    discountAmount = Math.min(discountAmount, subtotalAmount);
  }

  const qualifiesForFreeShipping =
    coupon?.kind === "free_shipping" ||
    (shipping.freeThresholdAmount !== null && subtotalAmount >= shipping.freeThresholdAmount);
  const shippingAmount = qualifiesForFreeShipping
    ? 0
    : asNonNegativeInteger(shipping.baseAmount, "Kargo tutarı");
  const taxAmount = lines.reduce((sum, line) => sum + line.taxAmount, 0);

  return {
    lines,
    subtotalAmount,
    discountAmount,
    shippingAmount,
    taxAmount,
    totalAmount: subtotalAmount - discountAmount + shippingAmount,
  };
}
