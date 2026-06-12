export default function AboutPanel() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h1 id="intro-title">Ben</h1>
      <p>I study Computer Science at the University of Waterloo.</p>

      <div className="current-work">
        <p>currently:</p>
        <ul>
          <li>
            Working on inference at <strong>TensorMesh</strong>
          </li>
          <li>Researching a bit on world models, mainly V-JEPA</li>
          <li>
            Reading <strong>The Remains of the Day</strong>
          </li>
        </ul>
      </div>

      <p>
        Previously worked on Notebooks at <strong>Databricks</strong>,
        AI-Gateway/Agents at <strong>Vercel</strong>, Instagram at{" "}
        <strong>Meta</strong>, and AI onboarding workflows at{" "}
        <strong>Shopify</strong>.
      </p>
      <p>
        This is a place to share my thoughts to the world, whether that be my
        projects, experiences, readings, or just random thoughts.
      </p>
    </section>
  );
}
