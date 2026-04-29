import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase-admin";
import { requireAdmin } from "@/lib/admin-guard";
import { getFreeStorageDays } from "@/lib/fees";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const supabase = getAdminClient();

  // Package counts by status
  const { data: packages } = await supabase
    .from("packages")
    .select("status, storage_days_used, demurrage_fee, created_at");

  const statusCounts: Record<string, number> = {};
  let totalPackages = 0;
  let demurrageCount = 0;
  let totalDemurrage = 0;

  const freeStorageDays = await getFreeStorageDays();
  for (const pkg of packages || []) {
    totalPackages++;
    statusCounts[pkg.status] = (statusCounts[pkg.status] || 0) + 1;
    if ((pkg.storage_days_used || 0) > freeStorageDays) {
      demurrageCount++;
      totalDemurrage += Number(pkg.demurrage_fee) || 0;
    }
  }

  // Last 7 days stats
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const newPackages = (packages || []).filter(
    (p) => new Date(p.created_at) >= sevenDaysAgo
  ).length;

  // Invoice stats — last 7 days
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, status, created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  let weekRevenue = 0;
  let pendingInvoiceCount = 0;
  let pendingInvoiceTotal = 0;

  for (const inv of invoices || []) {
    if (inv.status === "PAID") {
      weekRevenue += Number(inv.total);
    }
    if (inv.status === "PENDING") {
      pendingInvoiceCount++;
      pendingInvoiceTotal += Number(inv.total);
    }
  }

  // Storage distribution
  const { data: depodaPackages } = await supabase
    .from("packages")
    .select("shelf_location, storage_days_used")
    .eq("status", "DEPODA");

  const shelfUsage: Record<string, number> = {};
  for (const pkg of depodaPackages || []) {
    if (pkg.shelf_location) {
      const group = pkg.shelf_location.split("-")[0];
      shelfUsage[group] = (shelfUsage[group] || 0) + 1;
    }
  }

  // Recent activity — last 10 packages (created or updated)
  const { data: recentPackages } = await supabase
    .from("packages")
    .select("id, tracking_no, content, status, created_at, users!inner(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    totalPackages,
    statusCounts,
    demurrageCount,
    totalDemurrage,
    newPackages,
    weekRevenue,
    pendingInvoiceCount,
    pendingInvoiceTotal,
    shelfUsage,
    depodaCount: depodaPackages?.length || 0,
    recentPackages: recentPackages || [],
  });
}
