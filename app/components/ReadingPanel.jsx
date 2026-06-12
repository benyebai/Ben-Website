import ListPanel from "./ListPanel";

const reading = [
  { href: "#", title: "The Remains of the Day", meta: "current" },
  { href: "#", title: "Stoner", meta: "06.2026" },
  { href: "#", title: "The Stranger", meta: "05.2026" },
  { href: "#", title: "When Breath Becomes Air", meta: "05.2026" },
  { href: "#", title: "The Alchemist", meta: "05.2026" },
];

export default function ReadingPanel() {
  return <ListPanel title="Reading" items={reading} />;
}
