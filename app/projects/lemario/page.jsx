import Home from "../../page";

const title = "LeMario: Super Mario Bros trained on a JEPA Model";
const description =
  "A from-scratch JEPA world model trained on Super Mario Bros. to study action-conditioned prediction and reward-free planning.";
const url = "https://www.benjamin-bai.com/projects/lemario";
const image = "https://www.benjamin-bai.com/project-assets/lemario/architecture.png";

export const metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: "Ben",
    type: "article",
    images: [
      {
        url: image,
        width: 2456,
        height: 1198,
        alt: "LeMario JEPA world model architecture",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  },
};

export default function LeMarioPage() {
  return <Home initialPanel="lemario" />;
}
