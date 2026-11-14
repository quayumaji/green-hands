import Link from "next/link";
import type { Restaurant } from "@/lib/types";
import { whatsappUrl } from "@/lib/format";

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  const instagram = (restaurant.instagram || "greenhandsresturant").replace(/^@/, "");
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link className="brand brand-light" href="/">
            <span className="brand-mark" aria-hidden="true">GH</span>
            <span className="brand-name">
              GREEN<span>HANDS</span>
              <small>AFRICAN RESTAURANT</small>
            </span>
          </Link>
          <p>{restaurant.tagline}</p>
        </div>
        <nav className="footer-links" aria-label="Footer navigation">
          <h2 className="footer-heading">Explore</h2>
          <Link href="/menu">Menu &amp; ordering</Link>
          <Link href="/about">Our story</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <h2 className="footer-heading" id="footer-contact-title">Come on in</h2>
          <address>{restaurant.address.formatted}</address>
          <a
            className="footer-whatsapp"
            href={whatsappUrl(restaurant.phone)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Message Green Hands on WhatsApp at ${restaurant.phone}`}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M20.1 11.8a8.1 8.1 0 0 1-11.9 7.1L3 20l1.2-4.9a8.1 8.1 0 1 1 15.9-3.3Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.6 8.1c.2-.5.4-.5.7-.5h.5c.2 0 .4.1.5.4l.8 1.8c.1.2.1.4 0 .5l-.6.7c-.2.2-.2.4-.1.6.4.8 1.2 1.5 2 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.2.1.4.3.4.5 0 .3-.2 1.1-.7 1.5-.5.5-1.2.7-1.8.6-.6-.1-1.4-.4-2.4-.9-1.2-.7-2.2-1.7-2.8-2.8-.5-.8-.8-1.7-.8-2.3 0-.6.3-1.3.7-1.8Z" fill="currentColor" />
            </svg>
            <span>WhatsApp</span>
            <span>{restaurant.phone}</span>
          </a>
          <a
            className="footer-social-link"
            href={`https://www.instagram.com/${encodeURIComponent(instagram)}/`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit Green Hands African Restaurant on Instagram, @${instagram}`}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
              <circle cx="17.6" cy="6.6" r="1" fill="currentColor" />
            </svg>
            <span>@{instagram}</span>
          </a>
          <p>
            {restaurant.hours.map((row) => (
              <span key={row.days} style={{ display: "block" }}>
                {row.days} · {row.hours}
              </span>
            ))}
          </p>
        </section>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Green Hands African Restaurant</span>
        <span>Made with care in {restaurant.address.city}, Maryland</span>
      </div>
    </footer>
  );
}
