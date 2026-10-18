import AutogradGraphs from "./AutogradGraphs";
import MatrixAutogradPanel from "./MatrixAutogradPanel";
import MiniNNPanel from "./MiniNNPanel";
import TransformerPanel from "./TransformerPanel";
import TinyDreamerStory, { DreamerGameplayGallery } from "./TinyDreamerStory";

export default function NanoDreamerPanel({ onBack }) {
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
        <a href="https://github.com/benyebai/TinyDreamer" target="_blank" rel="noreferrer">GitHub</a>
      </div>

      <section className="article-section">
        <p>After <a href="/projects/lemario">LeMario</a>, I wanted to go beyond learning a game&apos;s representation. My CEM planner could search for actions that moved Mario toward goal images in latent space, but it never learned a policy or trained an agent to play for rewards. It chose actions by comparing latent representations.</p>
        <p>So I started reading Dreamer. Parts of it still felt big and mysterious, and I wanted to build my own version from scratch. Andrej Karpathy&apos;s nanoGPT was a huge inspiration, especially the concept of taking something huge, breaking it into small pieces, and understanding it from absolute first principles.</p>
        <p>And so one of the biggest questions remained. Could I train an agent to act inside a learned world model, actually play for rewards, and train locally on my own computer with my own neural network engine?</p>
        <p>And that became NanoDreamer. The repo goes from basic Python and math to code you can run to watch the agent train. After a lot of trial and error, and a lot of architectural changes, I got a roughly 750,000-parameter world model and actor–critic system that could play five MinAtar games, a simplified Atari benchmark.</p>
        <DreamerGameplayGallery />
        <p>Space Invaders was one of the best results, averaging 22.61 points after 500,000 training steps and playing better than me. The goal was to keep the agent small enough to train locally on an M5 Pro.</p>
        <p>I&apos;ll start with the interesting part, figuring out the architecture and the experiments it took to get this small agent working. If you&apos;re new to ML, I also wrote up the steps from basic algebra all the way to the agent. You can open the foundations below.</p>
        <nav className="dreamer-contents" aria-label="NanoDreamer table of contents"><span>In this write-up</span><a href="#dreamer-build-title">First draft</a><a href="#dreamer-fail-title">What broke</a><a href="#dreamer-model-probes-title">Other models</a><a href="#dreamer-truthful-world-title">Truthful world</a><a href="#dreamer-working-reference-title">Working version</a><a href="#dreamer-ending-title">Results &amp; lessons</a><a href="#foundations">The foundations</a></nav>
      </section>

      <TinyDreamerStory />

      <details className="dreamer-foundations" id="foundations">
        <summary><span><small>Want to start from the basics?</small><strong>Open the foundations</strong><em>Autograd → TensorGrad → MiniNN → Transformers → actor–critic</em></span><span className="dreamer-foundations-icon" aria-hidden="true">+</span></summary>
        <div className="dreamer-foundations-content">
          <nav className="dreamer-contents" aria-label="Foundations chapters"><span>Jump to a chapter</span><a href="#autograd-title">Autograd</a><a href="#matrix-autograd-title">TensorGrad</a><a href="#mininn-title">MiniNN</a><a href="#transformer-title">Transformers</a><a href="#actor-critic-title">Actor–critic</a></nav>
      <section className="article-section">
        <h3 id="autograd-title">The foundations: starting with autograd</h3>
        <p>We&apos;ll start with the basics. You&apos;ve probably heard terms like backpropagation, derivatives, and the chain rule. But how do they actually work together? I&apos;ll use a simple equation, turn it into a graph, and walk through it visually.</p>
        <p>Start with two additions: <code>X + Y = Z</code> and <code>A + B = C</code>. Then multiply their results: <code>Z × C = W</code>. We can draw all three operations as one graph and follow the gradients backward.</p>
        <AutogradGraphs />
        <details className="implementation-notes">
          <summary><span>if you&apos;re interested in some tricky implementation details I thought were interesting</span></summary>
          <div className="implementation-notes-body">
            <p>Honestly, writing addition and multiplication was the easy part. What took me a while was understanding why gradients use <code>+=</code> instead of <code>=</code>. If a value shows up in more than one path, each path sends something back, so you have to add those contributions together.</p>
            <p>I also kept picturing <code>backward()</code> going forward through a node&apos;s children. It actually starts at the final loss and works backward through everything that led to it. The topological order was the part that made this click for me: visit each node once, but don&apos;t run its local backward function until the gradient coming into it is complete.</p>
            <p>Then there were the little Python details I didn&apos;t think about at first. Regular numbers need to become <code>Value</code> objects, and expressions like <code>3 - x</code> and <code>3 / x</code> need reflected operations. When I moved from individual scalar values to an MLP, I also had to realize that <code>model(x)</code> could give me a list, so the XOR training loop needed <code>model(x)[0]</code>.</p>
            <p>The last thing was separating backprop from the actual update. <code>loss.backward()</code> calculates the gradients; the SGD loop changes the parameters. Those parameters live inside neurons, neurons inside layers, and layers inside the MLP. Gradients can flow automatically, but <code>parameters()</code> is still how the optimizer finds every weight it needs to update.</p>
          </div>
        </details>
      </section>
      <MatrixAutogradPanel />
      <MiniNNPanel />
      <TransformerPanel />
          <section className="article-section" aria-labelledby="actor-critic-title">
            <h3 id="actor-critic-title">How the actor and critic learn</h3>
            <p>The actor and critic are small networks with different jobs. The actor turns the current history state into probabilities for the available actions. The critic estimates how much future reward that state is worth. Both receive a state from the world model, but they learn from different targets.</p>
            <p>For the actor, I start at a real state from replay and imagine five actions. The world model predicts the next state, reward, and whether the game continues after each one. I add up those predicted rewards and use the critic to estimate what comes after the fifth step. If an imagined path turned out better than the critic expected, the actor increases the probability of its chosen actions; if it was worse, it decreases them. That is the policy-gradient step.</p>
            <div className="dreamer-behavior-flow" aria-label="Actor learning uses imagined returns; critic learning is anchored to real replay"><div><small>actor</small><strong>imagined five-step returns</strong><span>choose better actions</span></div><div><small>critic</small><strong>returns from real replay</strong><span>keep value estimates grounded</span></div></div>
            <p>The critic has to be more than a judge of the model&apos;s own guesses. I train it mainly against returns from real replay, with an additional smaller loss on imagined returns. That distinction mattered in this project: when the critic trusted imagined rewards too much, the actor learned to chase rewards that were not actually there.</p>
          </section>
        </div>
      </details>
    </article>
  );
}
