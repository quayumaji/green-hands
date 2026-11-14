import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuCard } from "@/components/menu/MenuCard";
import { ApiError, getMenuItem } from "@/lib/api";
import { FALLBACK_MENU } from "@/data/fallback";
import type { MenuCategory, MenuItem } from "@/lib/types";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

async function load(slug: string): Promise<{ item: MenuItem; category: MenuCategory | null; live: boolean } | null> {
  try {
    const { item, category } = await getMenuItem(slug);
    return { item, category, live: true };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    for (const c of FALLBACK_MENU.categories) {
      const item = c.items.find((i) => i.slug === slug);
      if (item) return { item, category: c, live: false };
    }
    return null;
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) return { title: "Dish not found" };
  return {
    title: data.item.name,
    description: data.item.description,
    openGraph: data.item.imageUrl ? { images: [{ url: data.item.imageUrl, alt: data.item.imageAlt || data.item.name }] } : undefined,
  };
}

export default async function MenuItemPage({ params }: Params) {
  const { slug } = await params;
  const data = await load(slug);
  if (!data) notFound();
  const { item, category, live } = data;

  return (
    <>
      <section className="page-hero page-hero-compact" aria-labelledby="item-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">{category ? category.name : "From the menu"}</p>
          <h1 className="hero-reveal" id="item-title">
            {item.name}
          </h1>
          <Link className="text-link hero-reveal" href={category ? `/menu#${category.slug}` : "/menu"} style={{ color: "white" }}>
            ← Back to the menu
          </Link>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>
      <section className="section-pad" aria-label={`${item.name} details`}>
        <div className="container" style={{ maxWidth: 560 }}>
          {!live ? (
            <p className="notice" role="status">
              Online ordering is paused for a moment. You can still browse the menu.
            </p>
          ) : null}
          <MenuCard item={item} orderingEnabled={live} linkTitle={false} />
        </div>
      </section>
    </>
  );
}
