export type Permission = "intake" | "pickup" | "demurrage" | "packages" | "invoices" | "customers";

export const ALL_PERMISSIONS: Permission[] = ["intake", "pickup", "demurrage", "packages", "invoices", "customers"];

export function hasPermission(userPermissions: unknown, required: Permission): boolean {
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes("*") || userPermissions.includes(required);
}

export function isSuperAdmin(userPermissions: unknown): boolean {
  if (!Array.isArray(userPermissions)) return false;
  return userPermissions.includes("*");
}
