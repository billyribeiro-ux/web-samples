import { prisma, withDbFallback } from "@/lib/db";

const defaultNav = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export async function getBrandName() {
  return withDbFallback(async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "brand_name" },
    });
    if (!row) return "Business Platform";
    try {
      return JSON.parse(row.valueJson) as string;
    } catch {
      return "Business Platform";
    }
  }, "Business Platform");
}

export async function getMainNav() {
  return withDbFallback(async () => {
    const menu = await prisma.navigationMenu.findUnique({
      where: { key: "main" },
    });
    if (!menu) {
      return defaultNav;
    }
    try {
      return JSON.parse(menu.itemsJson) as { href: string; label: string }[];
    } catch {
      return defaultNav;
    }
  }, defaultNav);
}

export async function getFooterColumns() {
  return withDbFallback(async () => {
    const row = await prisma.siteSetting.findUnique({
      where: { key: "footer_columns" },
    });
    if (!row) return [];
    try {
      return JSON.parse(row.valueJson) as {
        title: string;
        links: { href: string; label: string }[];
      }[];
    } catch {
      return [];
    }
  }, []);
}
