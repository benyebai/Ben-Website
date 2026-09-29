export default function AboutPanel() {
  return (
    <section className="intro" aria-labelledby="intro-title">
      <h1 id="intro-title">Ben</h1>
      <p>I study Computer Science at the University of Waterloo.</p>

      <p>
        This is a place to share my thoughts to the world, whether that be my
        projects, experiences, readings, or just random thoughts.
      </p>

      <div className="work-list">
        <p>currently:</p>
        <ul>
          <li>Researching world models</li>
          <li>
            Reading <strong>The Remains of the Day</strong>
          </li>
        </ul>
      </div>

      <div className="work-list">
        <p>previously:</p>
        <ul>
          <li>
            Inference at <strong>TensorMesh</strong>
          </li>
          <li>
            Notebooks at <strong>Databricks</strong>
          </li>
          <li>
            AI-Gateway/Agents at <strong>Vercel</strong>
          </li>
          <li>
            Instagram at <strong>Meta</strong>
          </li>
          <li>
            AI onboarding workflows at <strong>Shopify</strong>
          </li>
        </ul>
      </div>

      <div className="work-list">
        <p>fun facts:</p>
        <ul>
          <li>
            Peaked <strong>Immortal 1</strong> in Valorant
          </li>
          <li>
            Love movies; my favorite is <strong>Good Will Hunting</strong>
          </li>
          <li>Trying to become a fine-dining cook in my free time</li>
          <li>Played national volleyball</li>
          <li>Used to teach skiing, swimming, and piano</li>
        </ul>
      </div>

      <nav className="about-links" aria-label="Contact links">
        <a href="https://github.com/benyebai" target="_blank" rel="noreferrer">
          github
        </a>
        <a href="https://x.com/benbye" target="_blank" rel="noreferrer">
          X
        </a>
        <a href="mailto:benjamin.bai@uwaterloo.ca">email</a>
      </nav>
    </section>
  );
}
