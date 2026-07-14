import Image from "next/image";
import encoderTitle from "../../images/encoder-title.png";

export default function ProjectsPanel({ onOpenBeyondKvCache, onOpenLeMario }) {
  return (
    <section className="content-section" aria-labelledby="projects-title">
      <h2 id="projects-title">Projects</h2>
      <div className="project-grid">
      <article className="project-card">
        <button className="project-copy" type="button" onClick={onOpenBeyondKvCache}>
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
      <article className="project-card">
        <button className="project-copy" type="button" onClick={onOpenLeMario}>
          <h3>LeMario</h3>
          <p>Training Super Mario Bros. on a JEPA world model</p>
        </button>
        <div className="project-image project-image-tiny" aria-hidden="true">
          <div className="tiny-project-preview">
            <span className="tiny-preview-label">LeMario</span>
            <div className="tiny-preview-world">
              <span className="tiny-preview-cloud" />
              <span className="tiny-preview-mario" />
              <span className="tiny-preview-goal" />
              <span className="tiny-preview-ground" />
            </div>
            <span className="tiny-preview-caption">pixels → latent state → imagined future</span>
          </div>
        </div>
      </article>
      </div>
    </section>
  );
}
