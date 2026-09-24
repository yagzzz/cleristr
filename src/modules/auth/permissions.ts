export type UserRole =
  | "customer"
  | "owner"
  | "admin"
  | "order_manager"
  | "content_manager"
  | "marketing";

export type Permission =
  | "admin.access"
  | "products.read"
  | "products.update"
  | "orders.read"
  | "orders.update"
  | "customers.read"
  | "customers.export"
  | "payments.refund"
  | "shipping.update"
  | "support.update"
  | "content.update"
  | "marketing.update"
  | "analytics.read"
  | "settings.update"
  | "audit.read";

const allPermissions: Permission[] = [
  "admin.access",
  "products.read",
  "products.update",
  "orders.read",
  "orders.update",
  "customers.read",
  "customers.export",
  "payments.refund",
  "shipping.update",
  "support.update",
  "content.update",
  "marketing.update",
  "analytics.read",
  "settings.update",
  "audit.read",
];

const rolePermissions: Record<UserRole, ReadonlySet<Permission>> = {
  customer: new Set(),
  owner: new Set(allPermissions),
  admin: new Set(allPermissions),
  order_manager: new Set([
    "admin.access",
    "products.read",
    "orders.read",
    "orders.update",
    "customers.read",
    "shipping.update",
    "support.update",
    "analytics.read",
  ]),
  content_manager: new Set(["admin.access", "products.read", "products.update", "content.update"]),
  marketing: new Set([
    "admin.access",
    "products.read",
    "customers.read",
    "content.update",
    "marketing.update",
    "analytics.read",
  ]),
};

export function can(role: UserRole, permission: Permission) {
  return rolePermissions[role].has(permission);
}
