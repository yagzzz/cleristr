PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer',
  status TEXT NOT NULL DEFAULT 'active',
  email_verified_at TEXT,
  last_login_at TEXT,
  totp_enabled INTEGER NOT NULL DEFAULT 0,
  totp_secret_encrypted TEXT,
  marketing_email_opt_in INTEGER NOT NULL DEFAULT 0,
  marketing_sms_opt_in INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS account_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS account_tokens_user_idx ON account_tokens(user_id);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Adresim',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  tax_office TEXT,
  tax_number TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  country_code TEXT NOT NULL DEFAULT 'TR',
  is_default_shipping INTEGER NOT NULL DEFAULT 0,
  is_default_billing INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS addresses_user_idx ON addresses(user_id);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY,
  actor_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  summary TEXT NOT NULL,
  before_json TEXT,
  after_json TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_actor_idx ON admin_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS audit_entity_idx ON admin_audit_logs(entity_type, entity_id);

CREATE TABLE IF NOT EXISTS rate_limits (
  id TEXT PRIMARY KEY,
  key_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  window_started_at TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  blocked_until TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE(key_hash, action)
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  title TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  size_bytes INTEGER NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS media_type_idx ON media_assets(type);

CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  banner_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  no_index INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories(parent_id);

CREATE TABLE IF NOT EXISTS collections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  short_description TEXT,
  description TEXT,
  details_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  product_type TEXT NOT NULL DEFAULT 'physical',
  target_group TEXT,
  brand_id TEXT REFERENCES brands(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  collection_id TEXT REFERENCES collections(id) ON DELETE SET NULL,
  price_amount INTEGER,
  compare_at_amount INTEGER,
  sale_starts_at TEXT,
  sale_ends_at TEXT,
  tax_rate_bps INTEGER NOT NULL DEFAULT 2000,
  tax_included INTEGER NOT NULL DEFAULT 1,
  track_inventory INTEGER NOT NULL DEFAULT 1,
  allow_preorder INTEGER NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  weight_grams INTEGER,
  shipping_json TEXT,
  main_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  published_at TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  no_index INTEGER NOT NULL DEFAULT 0,
  og_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  is_featured INTEGER NOT NULL DEFAULT 0,
  is_bestseller INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS products_status_idx ON products(status);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category_id);

CREATE TABLE IF NOT EXISTS product_media (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'image',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  UNIQUE(product_id, media_id)
);
CREATE INDEX IF NOT EXISTS product_media_product_idx ON product_media(product_id);

CREATE TABLE IF NOT EXISTS product_attributes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  input_type TEXT NOT NULL DEFAULT 'select',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attribute_values (
  id TEXT PRIMARY KEY,
  attribute_id TEXT NOT NULL REFERENCES product_attributes(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  slug TEXT NOT NULL,
  color_hex TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(attribute_id, slug)
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  barcode TEXT UNIQUE,
  price_amount INTEGER,
  compare_at_amount INTEGER,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 5,
  image_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS variants_product_idx ON product_variants(product_id);

CREATE TABLE IF NOT EXISTS variant_attribute_values (
  id TEXT PRIMARY KEY,
  variant_id TEXT NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  attribute_value_id TEXT NOT NULL REFERENCES attribute_values(id) ON DELETE CASCADE,
  UNIQUE(variant_id, attribute_value_id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity_delta INTEGER NOT NULL,
  reference_type TEXT,
  reference_id TEXT,
  note TEXT,
  actor_user_id TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inventory_variant_idx ON inventory_movements(variant_id);
CREATE INDEX IF NOT EXISTS inventory_reference_idx ON inventory_movements(reference_type, reference_id);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tags (
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  UNIQUE(product_id, tag_id)
);

CREATE TABLE IF NOT EXISTS carts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  guest_token_hash TEXT UNIQUE,
  currency TEXT NOT NULL DEFAULT 'TRY',
  expires_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS carts_user_idx ON carts(user_id);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(cart_id, product_id, variant_id)
);
CREATE INDEX IF NOT EXISTS cart_items_cart_idx ON cart_items(cart_id);

CREATE TABLE IF NOT EXISTS wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  guest_token_hash TEXT UNIQUE,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  wishlist_id TEXT NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(wishlist_id, product_id, variant_id)
);

CREATE TABLE IF NOT EXISTS shipping_methods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  base_price_amount INTEGER NOT NULL DEFAULT 0,
  free_threshold_amount INTEGER,
  estimated_min_days INTEGER,
  estimated_max_days INTEGER,
  tracking_url_template TEXT,
  regional_rules_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  kind TEXT NOT NULL,
  value INTEGER NOT NULL,
  scope TEXT NOT NULL DEFAULT 'cart',
  minimum_cart_amount INTEGER,
  maximum_discount_amount INTEGER,
  usage_limit INTEGER,
  usage_per_customer INTEGER NOT NULL DEFAULT 1,
  first_order_only INTEGER NOT NULL DEFAULT 0,
  automatic INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  conditions_json TEXT,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS coupons_active_window_idx ON coupons(is_active, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS coupon_products (
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(coupon_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupon_categories (
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  UNIQUE(coupon_id, category_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  subtotal_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  shipping_amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  total_amount INTEGER NOT NULL,
  coupon_code TEXT,
  coupon_id TEXT REFERENCES coupons(id) ON DELETE SET NULL,
  shipping_method_id TEXT REFERENCES shipping_methods(id) ON DELETE SET NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  order_status TEXT NOT NULL DEFAULT 'payment_pending',
  shipping_status TEXT NOT NULL DEFAULT 'not_ready',
  shipping_address_json TEXT NOT NULL,
  billing_address_json TEXT NOT NULL,
  customer_note TEXT,
  admin_note TEXT,
  quote_hash TEXT NOT NULL,
  quote_expires_at TEXT NOT NULL,
  inventory_reserved_until TEXT,
  paid_at TEXT,
  cancelled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(order_status);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT NOT NULL,
  image_url TEXT,
  quantity INTEGER NOT NULL,
  unit_price_amount INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  tax_amount INTEGER NOT NULL DEFAULT 0,
  line_total_amount INTEGER NOT NULL,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id TEXT PRIMARY KEY,
  coupon_id TEXT NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  discount_amount INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(coupon_id, order_id)
);
CREATE INDEX IF NOT EXISTS coupon_redemption_user_idx ON coupon_redemptions(coupon_id, user_id);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'paytr',
  provider_order_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_amount INTEGER NOT NULL,
  captured_amount INTEGER,
  currency TEXT NOT NULL DEFAULT 'TRY',
  payment_type TEXT,
  test_mode INTEGER NOT NULL DEFAULT 0,
  provider_reference TEXT,
  failure_code TEXT,
  failure_message TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(provider, provider_order_id)
);
CREATE INDEX IF NOT EXISTS payments_order_idx ON payments(order_id);

CREATE TABLE IF NOT EXISTS payment_callbacks (
  id TEXT PRIMARY KEY,
  payment_id TEXT REFERENCES payments(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_order_id TEXT NOT NULL,
  callback_hash TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER,
  payload_json TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(provider, provider_order_id, callback_hash)
);
CREATE INDEX IF NOT EXISTS payment_callbacks_order_idx ON payment_callbacks(provider_order_id);

CREATE TABLE IF NOT EXISTS refunds (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  requested_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotency_key TEXT NOT NULL UNIQUE,
  provider_reference TEXT,
  provider_response_json TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS refunds_order_idx ON refunds(order_id);

CREATE TABLE IF NOT EXISTS shipments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_method_id TEXT REFERENCES shipping_methods(id) ON DELETE SET NULL,
  tracking_number TEXT,
  tracking_url TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  shipped_at TEXT,
  delivered_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS shipments_order_idx ON shipments(order_id);
CREATE INDEX IF NOT EXISTS shipments_tracking_idx ON shipments(tracking_number);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  order_item_id TEXT REFERENCES order_items(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified_purchase INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS reviews_product_idx ON reviews(product_id, status);

CREATE TABLE IF NOT EXISTS review_votes (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  voter_hash TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(review_id, user_id),
  UNIQUE(review_id, voter_hash)
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  order_item_id TEXT REFERENCES order_items(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  subject TEXT NOT NULL,
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS support_tickets_user_idx ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS support_tickets_status_idx ON support_tickets(status);

CREATE TABLE IF NOT EXISTS support_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  author_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_type TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS support_messages_ticket_idx ON support_messages(ticket_id);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  page_url TEXT,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS feedback_status_idx ON feedback(status);

CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  template TEXT NOT NULL DEFAULT 'default',
  published_at TEXT,
  seo_title TEXT,
  seo_description TEXT,
  canonical_url TEXT,
  no_index INTEGER NOT NULL DEFAULT 0,
  og_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS pages_status_idx ON pages(status);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES menu_items(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'self',
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS menu_items_menu_idx ON menu_items(menu_id, sort_order);
CREATE INDEX IF NOT EXISTS menu_items_parent_idx ON menu_items(parent_id);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  placement TEXT NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_label TEXT,
  cta_href TEXT,
  desktop_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  mobile_media_id TEXT REFERENCES media_assets(id) ON DELETE SET NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  audience_json TEXT,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS banners_placement_idx ON banners(placement, is_active, sort_order);

CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  href TEXT,
  audience TEXT NOT NULL DEFAULT 'all',
  dismissible INTEGER NOT NULL DEFAULT 1,
  is_active INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS announcements_active_idx ON announcements(type, is_active, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS homepage_sections (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  is_active INTEGER NOT NULL DEFAULT 0,
  hide_when_empty INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  config_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS homepage_sections_order_idx ON homepage_sections(is_active, sort_order);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  is_public INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  updated_by_user_id TEXT REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS site_settings_public_idx ON site_settings(is_public);

CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  destination TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  last_seen_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS contacts_user_idx ON contacts(user_id);

CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  granted INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  granted_at TEXT,
  withdrawn_at TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS consents_contact_purpose_idx ON consents(contact_id, purpose);
CREATE INDEX IF NOT EXISTS consents_user_purpose_idx ON consents(user_id, purpose);

CREATE TABLE IF NOT EXISTS marketing_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_tags (
  contact_id TEXT NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES marketing_tags(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  UNIQUE(contact_id, tag_id)
);

CREATE TABLE IF NOT EXISTS segments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL DEFAULT 'dynamic',
  rules_json TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  last_calculated_at TEXT,
  estimated_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS segments_active_idx ON segments(is_active);

CREATE TABLE IF NOT EXISTS marketing_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  payload_json TEXT,
  idempotency_key TEXT UNIQUE,
  occurred_at TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS marketing_events_name_time_idx ON marketing_events(event_name, occurred_at);
CREATE INDEX IF NOT EXISTS marketing_events_contact_idx ON marketing_events(contact_id);

CREATE TABLE IF NOT EXISTS automation_flows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  trigger_event TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  definition_json TEXT NOT NULL,
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS automation_flows_status_trigger_idx ON automation_flows(status, trigger_event);

CREATE TABLE IF NOT EXISTS automation_nodes (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  type TEXT NOT NULL,
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  config_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(flow_id, node_key)
);
CREATE INDEX IF NOT EXISTS automation_nodes_flow_idx ON automation_nodes(flow_id);

CREATE TABLE IF NOT EXISTS automation_edges (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
  source_node_key TEXT NOT NULL,
  target_node_key TEXT NOT NULL,
  source_handle TEXT,
  label TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(flow_id, source_node_key, target_node_key, source_handle)
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id TEXT PRIMARY KEY,
  flow_id TEXT NOT NULL REFERENCES automation_flows(id) ON DELETE CASCADE,
  flow_version INTEGER NOT NULL,
  event_id TEXT REFERENCES marketing_events(id) ON DELETE SET NULL,
  contact_id TEXT REFERENCES contacts(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'running',
  current_node_key TEXT,
  context_json TEXT NOT NULL,
  next_run_at TEXT,
  last_error TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS automation_runs_due_idx ON automation_runs(status, next_run_at);
CREATE INDEX IF NOT EXISTS automation_runs_contact_idx ON automation_runs(contact_id);

CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  subject TEXT,
  preheader TEXT,
  content_json TEXT NOT NULL,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS message_templates_channel_idx ON message_templates(channel, status);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  template_id TEXT REFERENCES message_templates(id) ON DELETE SET NULL,
  segment_id TEXT REFERENCES segments(id) ON DELETE SET NULL,
  scheduled_at TEXT,
  sent_at TEXT,
  ab_test_json TEXT,
  stats_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS campaigns_status_schedule_idx ON campaigns(status, scheduled_at);

CREATE TABLE IF NOT EXISTS popups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content_json TEXT NOT NULL,
  targeting_json TEXT NOT NULL,
  frequency_count INTEGER NOT NULL DEFAULT 1,
  frequency_window_days INTEGER NOT NULL DEFAULT 7,
  starts_at TEXT,
  ends_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS popups_active_window_idx ON popups(status, starts_at, ends_at);

CREATE TABLE IF NOT EXISTS popup_impressions (
  id TEXT PRIMARY KEY,
  popup_id TEXT NOT NULL REFERENCES popups(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  visitor_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS popup_impressions_cap_idx ON popup_impressions(popup_id, visitor_hash, created_at);

CREATE TABLE IF NOT EXISTS background_jobs (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  idempotency_key TEXT UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  run_at TEXT NOT NULL,
  locked_at TEXT,
  locked_by TEXT,
  last_error TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS background_jobs_due_idx ON background_jobs(status, run_at);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  anonymous_id TEXT,
  session_id TEXT,
  entity_type TEXT,
  entity_id TEXT,
  value_amount INTEGER,
  currency TEXT,
  properties_json TEXT,
  occurred_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS analytics_event_name_time_idx ON analytics_events(event_name, occurred_at);
CREATE INDEX IF NOT EXISTS analytics_entity_idx ON analytics_events(entity_type, entity_id);
