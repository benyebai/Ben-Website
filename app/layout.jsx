import "katex/dist/katex.min.css";
import "./globals.css";

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
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=ranade@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
