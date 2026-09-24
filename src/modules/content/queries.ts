import { and, asc, eq, isNull, lte, or, gte } from "drizzle-orm";
import { db } from "@/db/client";
import { announcements, homepageSections, menuItems, menus, siteSettings } from "@/db/schema";

export async function getHomepageSections() {
  return db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.isActive, true))
    .orderBy(asc(homepageSections.sortOrder));
}

export async function getMenu(location: "header" | "footer" | "mobile" | "account") {
  return db
    .select({ id: menuItems.id, label: menuItems.label, href: menuItems.href, target: menuItems.target })
    .from(menuItems)
    .innerJoin(menus, eq(menuItems.menuId, menus.id))
    .where(and(eq(menus.location, location), eq(menus.isActive, true), eq(menuItems.isActive, true)))
    .orderBy(asc(menuItems.sortOrder));
}

export async function getActiveTopAnnouncement(now = new Date().toISOString()) {
  const rows = await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.type, "top_bar"),
        eq(announcements.isActive, true),
        or(isNull(announcements.startsAt), lte(announcements.startsAt, now)),
        or(isNull(announcements.endsAt), gte(announcements.endsAt, now)),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getPublicSetting<T>(key: string, fallback: T): Promise<T> {
  const rows = await db
    .select({ value: siteSettings.valueJson })
    .from(siteSettings)
    .where(and(eq(siteSettings.key, key), eq(siteSettings.isPublic, true)))
    .limit(1);
  return (rows[0]?.value as T | undefined) ?? fallback;
}
