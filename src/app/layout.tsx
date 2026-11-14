import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Playfair_Display({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-serif", display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Green Hands African Restaurant | Glen Burnie, MD", template: "%s | Green Hands African Restaurant" },
  description: "Scratch-made West and East African food, served with a family-kitchen welcome in Glen Burnie, Maryland. Order online for pickup.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    siteName: "Green Hands African Restaurant",
    images: [{ url: "/images/image-1.jpg", width: 1600, height: 1200, alt: "Jollof rice with grilled fish and sides" }],
  },
};

export const viewport: Viewport = { themeColor: "#163f2d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
