import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { Reveal } from "@/components/Reveal";
import { getRestaurant, withFallback } from "@/lib/api";
import { FALLBACK_RESTAURANT } from "@/data/fallback";
import { mapsSearchUrl } from "@/lib/format";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Contact & Location",
  description: "Find Green Hands African Restaurant in Glen Burnie, Maryland. View our hours, get in touch, and plan your visit.",
};

export default async function ContactPage() {
  const { data: r } = await withFallback(getRestaurant, FALLBACK_RESTAURANT, "restaurant");
  const mapQuery = `${r.name}, ${r.address.formatted}`;

  return (
    <>
      <section className="page-hero contact-hero" aria-labelledby="contact-page-title">
        <div className="container page-hero-inner">
          <p className="eyebrow hero-reveal">We&apos;d love to hear from you</p>
          <h1 className="hero-reveal" id="contact-page-title">
            Come on over<span>.</span>
          </h1>
          <p className="hero-reveal">Find us in Glen Burnie, give us a call, or send a note to our team.</p>
        </div>
        <span className="page-hero-mark" aria-hidden="true">✳</span>
      </section>

      <section className="contact-section section-pad" aria-label="Contact details and message form">
        <div className="container contact-grid">
          <Reveal as="section" className="contact-details" aria-labelledby="contact-details-title">
            <p className="eyebrow">Come say hello</p>
            <h2 id="contact-details-title">
              Find your way
              <br />
              <em>to good food.</em>
            </h2>
            <div className="contact-line">
              <span className="contact-icon" aria-hidden="true">⌖</span>
              <div>
                <b>Visit us</b>
                <address>
                  {r.address.line1}, {r.address.line2}
                  <br />
                  {r.address.city}, {r.address.state} {r.address.postalCode}
                </address>
                <a className="text-link" target="_blank" rel="noopener noreferrer" href={mapsSearchUrl(r.address.formatted)}>
                  Get directions ↗
                </a>
              </div>
            </div>
            <div className="contact-line">
              <span className="contact-icon" aria-hidden="true">☎</span>
              <div>
                <b>Call us</b>
                <p>
                  <a href={`tel:${r.phoneE164}`}>{r.phone}</a>
                </p>
              </div>
            </div>
            <div className="contact-line">
              <span className="contact-icon" aria-hidden="true">✉</span>
              <div>
                <b>Email us</b>
                <p>
                  <a href={`mailto:${r.email}`}>{r.email}</a>
                </p>
              </div>
            </div>
            <div className="contact-line">
              <span className="contact-icon" aria-hidden="true">◷</span>
              <div>
                <b>Opening hours</b>
                <p>
                  {r.hours.map((row) => (
                    <span key={row.days} style={{ display: "block" }}>
                      {row.days}: {row.hours}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          </Reveal>
          <Reveal as="section" className="contact-form-wrap" aria-labelledby="contact-form-title" index={1}>
            <p className="eyebrow">Questions, feedback, or just a hello</p>
            <h2 id="contact-form-title">Drop us a note.</h2>
            <p className="form-intro">We read every message and reply by email, usually within a day.</p>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <section className="map-section" aria-labelledby="map-title">
        <Reveal className="container map-heading">
          <div>
            <p className="eyebrow">Right here in Glen Burnie</p>
            <h2 id="map-title">Easy to find.</h2>
          </div>
          <p>
            {r.address.line1}, {r.address.line2}
            <br />
            {r.address.city}, {r.address.state} {r.address.postalCode}
          </p>
        </Reveal>
        <div className="container map-frame">
          <iframe
            title="Map showing Green Hands African Restaurant in Glen Burnie, Maryland"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
          />
        </div>
        <div className="container map-location-actions">
          <p>
            Map not loading?{" "}
            <a className="text-link" target="_blank" rel="noopener noreferrer" href={mapsSearchUrl(mapQuery)}>
              Open this location in Google Maps ↗
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
