import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata = {
  title: "Ben",
  description:
    "A minimal personal website with centered text and a side navigation.",
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
