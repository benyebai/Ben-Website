import Image from "next/image";
import encoderTitle from "../../images/encoder-title.png";

export default function ProjectsPanel({ onOpenProject }) {
  return (
    <section className="content-section" aria-labelledby="projects-title">
      <h2 id="projects-title">Projects</h2>
      <article className="project-card">
        <button className="project-copy" type="button" onClick={onOpenProject}>
          <h3>Beyond KV Cache</h3>
          <p>Implementing encoder caching for multimodal inference</p>
        </button>
        <div className="project-image">
          <Image
            src={encoderTitle}
            alt="Diagram titled Beyond KV Cache showing encoder cache reuse for multimodal inference"
            placeholder="blur"
            sizes="(max-width: 720px) 100vw, 560px"
          />
        </div>
      </article>
    </section>
  );
}
