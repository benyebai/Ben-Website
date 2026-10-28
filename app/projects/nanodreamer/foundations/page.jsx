import Home from "../../../page";
const title = "ML Foundations";
const description = "Algebra, autograd, neural networks, autoencoders, transformers, and actor–critic basics, built from first principles.";
const url = "https://www.benjamin-bai.com/projects/nanodreamer/foundations";
export const metadata = { title, description, alternates: { canonical: url }, openGraph: { title, description, url, siteName: "Ben", type: "article" }, twitter: { card: "summary", title, description } };
export default function FoundationsPage() { return <Home initialPanel="nanodreamer-foundations" />; }
