export default function ThoughtArticlePanel({ thought }) {
  return (
    <article className="content-section" aria-labelledby={`${thought.id}-title`}>
      <h2 id={`${thought.id}-title`}>{thought.title}</h2>
      {thought.updatedMeta && (
        <p className="section-subscript">
          <small>Last updated {thought.updatedMeta}</small>
        </p>
      )}
      <section>
        {thought.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </article>
  );
}
