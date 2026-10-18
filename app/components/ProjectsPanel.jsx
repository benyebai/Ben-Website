import ListPanel from "./ListPanel";

const projects = [
  {
    id: "nanodreamer",
    title: "NanoDreamer",
    meta: "10.2026",
    description:
      "A small Dreamer-inspired MinAtar agent that learns a world model and trains its policy through imagined rollouts.",
  },
  {
    id: "lemario",
    title: "LeMario",
    meta: "07.2026",
    description:
      "A from-scratch JEPA world model trained on Super Mario Bros. to study action-conditioned prediction and reward-free planning.",
  },
  {
    id: "beyond-kv-cache",
    title: "Beyond KV Cache",
    meta: "05.2026",
    description:
      "An encoder cache for multimodal inference that reuses visual features across requests and extends LMCache beyond KV states.",
  },
];

export default function ProjectsPanel({ onOpenBeyondKvCache, onOpenLeMario, onOpenNanoDreamer }) {
  function openProject(project) {
    if (project.id === "nanodreamer") {
      onOpenNanoDreamer();
      return;
    }
    if (project.id === "lemario") {
      onOpenLeMario();
      return;
    }

    onOpenBeyondKvCache();
  }

  return (
    <ListPanel
      title="Projects"
      items={projects}
      onSelectItem={openProject}
      className="projects-panel"
    />
  );
}
