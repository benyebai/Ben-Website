import NanoDreamerContents from "./NanoDreamerContents";
import TinyDreamerStory, { DreamerGameplayGallery } from "./TinyDreamerStory";

export default function NanoDreamerPanel({ onBack, onOpenFoundations }) {
  return (
    <article className="article-panel" aria-labelledby="nanodreamer-title">
      <button className="back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        back to projects
      </button>
      <h2 id="nanodreamer-title">NanoDreamer: Learning to Act Through Imagination</h2>
      <div className="article-meta" aria-label="Article metadata">
        <span>Benjamin Bai</span>
        <span className="article-separator" aria-hidden="true">·</span>
        <span>October 2026</span>
        <span className="article-separator" aria-hidden="true">·</span>
        <a href="https://github.com/benyebai/NanoDreamer" target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <NanoDreamerContents />
      <section className="article-section">
        <p>Recently, I&apos;ve been getting into world models and embodied intelligence, and because I love video games, obviously Dreamer caught my attention. However, I had one problem. I have no GPU.</p>
        <p>So what do I do instead? Build my own tiny Dreamer, small enough to train on my MacBook. And because I wanted to understand every piece, I started from the bottom with my own autograd engine, tensor library, neural network layers, optimizers, and transformer.</p>
        <p>After a lot of debugging, that became <strong>NanoDreamer!</strong> A 750k-parameter world model and actor–critic that learns to play all 5 MinAtar games, with the actor trained entirely through imagination and a model small enough to run and train on my M5! It trains from scratch on its own gameplay, without expert demonstrations or game-specific strategies, using the same architecture and training setup with separate weights for each game.</p>
        <p>Here&apos;s NanoDreamer playing all 5 games after 500k steps per game (around 3 hours on an M5 Pro).</p>
        <DreamerGameplayGallery />
        <p>In this write-up I&apos;ll show you the bugs, experiments, and architectural changes it took to get Dreamer working at a fraction of the cost. If you&apos;re new to ML, I also wrote a <a href="/projects/nanodreamer/foundations" onClick={onOpenFoundations}>separate guide to the foundations</a>, with my own implementation and learnings!</p>

      </section>

      <TinyDreamerStory />

      <section className="nano-foundations-link" id="foundations">
        <h3>Want to build it from scratch?</h3>
        <p>Follow the foundations, from algebra and gradients to the networks behind the agent.</p>
        <a href="/projects/nanodreamer/foundations" onClick={onOpenFoundations}>Read the foundations →</a>
      </section>
    </article>
  );
}
