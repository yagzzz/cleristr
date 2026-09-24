ALTER TABLE orders ADD COLUMN checkout_key TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS orders_checkout_key_unique ON orders(checkout_key);
