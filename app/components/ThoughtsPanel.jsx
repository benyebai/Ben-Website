import ListPanel from "./ListPanel";
import thoughts from "../content/thoughts";

export default function ThoughtsPanel({ onOpenThought }) {
  return (
    <ListPanel
      title="Thoughts"
      subtitle="No AI. These are my own thoughts, whether unfinished, rough, or polished. I also like revisit topics and update them!"
      items={thoughts}
      onSelectItem={onOpenThought}
    />
  );
}
