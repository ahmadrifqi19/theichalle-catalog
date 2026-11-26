import type { Metadata, Viewport } from "next";
import "./tailwind.css";

export const viewport: Viewport = {
  themeColor: "#5C1A26",
};

export const metadata: Metadata = {
  title: "The Ichalle Collection | Timeless Women Wear",
  description: "Curated modern, modest, and timeless women wear crafted with luxurious fabrics and effortless silhouettes.",
  applicationName: "The Ichalle",
  manifest: "/manifest.webmanifest",
  keywords: ["The Ichalle", "Women Fashion", "Timeless Wear", "Modest Fashion", "Dresses", "Blouses"],
  authors: [{ name: "The Ichalle Collection" }],
  appleWebApp: {
    capable: true,
    title: "The Ichalle",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "The Ichalle Collection | Timeless Women Wear",
    description: "Curated modern, modest, and timeless women wear crafted with luxurious fabrics and effortless silhouettes.",
    type: "website",
    locale: "en_US",
    siteName: "The Ichalle Collection",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FAF6F0] text-[#2B2625] selection:bg-[#5C1A26] selection:text-[#FAF6F0]">
        {children}
      </body>
    </html>
  );
}