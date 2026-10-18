import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";

const ranade = localFont({
  src: "./fonts/Ranade-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "block",
  preload: true,
  variable: "--font-ranade",
});

export const metadata = {
  metadataBase: new URL("https://www.benjamin-bai.com"),
  title: "Ben Bai",
  description:
    "Computer Science at Waterloo, exploring world models, building AI systems, and sharing notes on projects, research papers, books, and life.",
  openGraph: {
    title: "Ben Bai",
    description:
      "Computer Science at Waterloo, exploring world models, building AI systems, and sharing notes on projects, research papers, books, and life.",
    siteName: "Ben Bai",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Ben Bai",
    description:
      "Computer Science at Waterloo, exploring world models, building AI systems, and sharing notes on projects, research papers, books, and life.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={ranade.variable}>{children}</body>
    </html>
  );
}
