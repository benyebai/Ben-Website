import Home from "../../page";

const title = "NanoDreamer: Learning to Act Through Imagination";
const description =
  "A small Dreamer-inspired MinAtar agent that learns a world model and trains its policy through imagined rollouts.";
const url = "https://www.benjamin-bai.com/projects/nanodreamer";

export const metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { title, description, url, siteName: "Ben", type: "article" },
  twitter: { card: "summary", title, description },
};

export default function NanoDreamerPage() {
  return <Home initialPanel="nanodreamer" />;
}
