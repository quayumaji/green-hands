"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";

const NAV = [
  ["/", "Home"],
  ["/menu", "Menu"],
  ["/about", "Our story"],
  ["/gallery", "Gallery"],
  ["/contact", "Contact"],
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const { count, openCart, hydrated } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => setNavOpen(false), [pathname]);

  useEffect(() => {
    if (!hydrated || count === 0) return;
    setBounce(true);
    const t = window.setTimeout(() => setBounce(false), 400);
    return () => window.clearTimeout(t);
  }, [count, hydrated]);

  const isCurrent = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand" href="/" aria-label="Green Hands African Restaurant home">
          <span className="brand-mark" aria-hidden="true">GH</span>
          <span className="brand-name">
            GREEN<span>HANDS</span>
            <small>AFRICAN RESTAURANT</small>
          </span>
        </Link>
        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={navOpen}
          aria-controls="primary-navigation"
          onClick={() => setNavOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
        <nav className={`main-nav${navOpen ? " nav-open" : ""}`} id="primary-navigation" aria-label="Main navigation">
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} aria-current={isCurrent(href) ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
        <button className="cart-trigger" type="button" onClick={openCart} aria-label={`Open shopping bag, ${count} item${count === 1 ? "" : "s"}`}>
          <span aria-hidden="true">Bag</span>
          <span className={`cart-count${bounce ? " count-bounce" : ""}`} aria-hidden="true">
            {hydrated ? count : 0}
          </span>
        </button>
      </div>
    </header>
  );
}
