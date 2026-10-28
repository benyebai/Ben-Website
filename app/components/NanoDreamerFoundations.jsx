import { BlockMath } from "react-katex";
import NanoDreamerContents from "./NanoDreamerContents";
import AutogradGraphs from "./AutogradGraphs";
import MatrixAutogradPanel from "./MatrixAutogradPanel";
import MiniNNPanel from "./MiniNNPanel";
import TransformerPanel from "./TransformerPanel";
const chapters = [
  ["algebra-and-gradients","Algebra and gradients"],
  ["autograd-and-tensors","Autograd and tensors"],
  ["neural-networks-and-optimizers","Networks and optimizers"],
  ["autoencoders","Autoencoders"],
  ["attention-and-transformers","Attention and transformers"],
  ["actor-and-critic","Actor and critic basics"],
];
export default function NanoDreamerFoundations({ onBackToStory }) {
  return <article className="article-panel" aria-labelledby="foundations-title">
    <a className="back-link" href="/projects/nanodreamer" onClick={onBackToStory}>‹ back to NanoDreamer</a>
    <h2 id="foundations-title">ML Foundations</h2>
    <div className="article-meta"><span>Benjamin Bai</span><span aria-hidden="true">·</span><span>October 2026</span><span aria-hidden="true">·</span>{["MiniGrad", "TensorGrad", "MiniNN", "TinyTransformer"].map(repo => <a key={repo} href={`https://github.com/benyebai/${repo}`} target="_blank" rel="noreferrer">{repo} ↗</a>)}</div>
    <p>Before I built <a href="https://github.com/benyebai/NanoDreamer" target="_blank" rel="noreferrer">NanoDreamer</a>, I wanted to understand the pieces well enough to write them myself. So I started with a few numbers and their gradients, then kept building until I could train networks. This is that side of the project, from the first calculation to the actor and critic.</p>
    <NanoDreamerContents items={chapters} />
    <section className="article-section" aria-labelledby="algebra-and-gradients">
      <h3 id="algebra-and-gradients">Algebra and gradients</h3>
      <p className="foundations-repo-link"><a href="https://github.com/benyebai/MiniGrad" target="_blank" rel="noreferrer">MiniGrad · View code on GitHub ↗</a></p>
      <p>I started with something I could work out on paper. Take two additions, <code>X + Y = Z</code> and <code>A + B = C</code>. Multiply their results to get <code>Z × C = W</code>. With X = 2, Y = 3, A = 4 and B = 1, the answer is 25.</p>
      <p>Now the useful question. If I change X a little, how much does W change? X changes Z by the same amount, and Z gets multiplied by C, which is 5. Nudging X by 0.1 raises W by 0.5. The derivative is 5. Click through the graph to trace that effect backward.</p>
      <AutogradGraphs />
      <p>My first autograd engine, <a href="https://github.com/benyebai/MiniGrad" target="_blank" rel="noreferrer">MiniGrad</a>, recorded those operations and worked backward through them automatically. If a value was used twice, I had to add both contributions. For a network, the final number is its loss, a measure of how wrong the prediction was. Backprop gives each weight a gradient. The optimizer uses it to change the weight.</p>
    </section>
    <MatrixAutogradPanel title="Autograd and tensors" />
    <MiniNNPanel title="Neural networks and optimizers" />
    <section className="article-section" aria-labelledby="autoencoders">
      <h3 id="autoencoders">Autoencoders</h3>
      <p>Now I could train a network. But could I squeeze a game frame into a small set of numbers and still recover the objects? That became my first autoencoder. The encoder compresses the screen, and the decoder tries to rebuild it. I trained both together.</p>
      <div className="nano-foundations-flow" aria-label="Frame passes through encoder, 64-number latent, and decoder to reconstructed frame"><span>Frame</span><span aria-hidden="true">→</span><span>Encoder</span><span aria-hidden="true">→</span><strong>64 numbers</strong><span aria-hidden="true">→</span><span>Decoder</span><span aria-hidden="true">→</span><span>Reconstruction</span></div>
      <p>The encoder was just Linear, Tanh, then Linear, ending in 64 numbers. Those numbers are the latent. The decoder went back the other way, with a sigmoid turning its outputs into probabilities that each cell was occupied.</p>
      <BlockMath math={String.raw`z=E(x),\qquad\hat x=\sigma(D(z))`} />
      <p>Here x is the frame, E encodes it, and D decodes the latent z. The sigmoid, σ, turns the output into probabilities. I used binary cross-entropy to compare them with the actual occupied or empty cells. If a cell contains a projectile and the decoder gives it a tiny probability, the loss penalizes that prediction.</p>
      <details className="implementation-notes"><summary>Why weight occupied cells?</summary><div className="implementation-notes-body"><p>Most cells are empty. Predicting almost nothing could look good on an average loss while missing the objects we care about. Weighting occupied cells more heavily makes those mistakes cost more. It encourages reconstruction of small objects, but does not guarantee the latent will be useful for predicting rewards.</p></div></details>
      <p>It could reconstruct a screen! But that didn&apos;t mean it understood what would happen next. For that, I needed actions and history.</p>
    </section>
    <TransformerPanel title="Attention and transformers" />
    <section className="article-section" aria-labelledby="actor-and-critic">
      <h3 id="actor-and-critic">Actor and critic basics</h3>
      <p>Finally, someone had to choose a move. The actor was another MLP. It read the state and produced a score for each action. Softmax turned those scores into probabilities, and I sampled a move. The critic was a second MLP, estimating how much future reward to expect from that state.</p>
      <div className="dreamer-behavior-flow" aria-label="Two MLPs read the state: actor predicts action probabilities, critic estimates future reward"><div><small>actor MLP</small><strong>State → action probabilities</strong><span>Which move should I try?</span></div><div><small>critic MLP</small><strong>State → estimated return</strong><span>How much reward should I expect?</span></div></div>
      <p>Here&apos;s the smallest example. The critic expects 1 point of future return. After the rollout, I calculate a target of 3. That action did 2 better than expected. I train the actor to make it more likely and the critic to move its estimate toward 3.</p>
      <BlockMath math={String.raw`A=G-V(s),\qquad\mathcal L_{\text{actor}}=-\log\pi(a\mid s)\,\operatorname{sg}(A)`} />
      <p>G is the return target, V(s) is the critic&apos;s guess, and A is the difference. The actor multiplies that feedback by the negative log probability of its chosen action. A positive advantage pushes the action&apos;s probability up; a negative one pushes it down. The sg means stop-gradient. I treat the feedback as fixed during the actor update.</p>
      <BlockMath math={String.raw`\mathcal L_{\text{critic}}=(V(s)-\operatorname{sg}(G))^2`} />
      <p>For the simple critic, I squared the difference between its guess and the target. One detail confused me early on. The target is a return, not just the next reward. It adds discounted rewards across the rollout and can use the critic to estimate what comes after. The final agent predicts a distribution over returns, but it&apos;s answering the same question.</p>
      <p>The actor update can use rewards from a real game or from our model. But if the model invents the wrong rewards, the actor learns the wrong game. Figuring that out became a large part of NanoDreamer, and it&apos;s where the <a href="/projects/nanodreamer#how-hard-could-it-be" onClick={event => onBackToStory?.(event, "#how-hard-could-it-be")}>main write-up</a> picks up.</p>
    </section>
    <section className="nano-foundations-link"><h3>Ready to put the pieces together?</h3><p>The main post follows the experiments that turned these building blocks into an agent.</p><a href="/projects/nanodreamer" onClick={onBackToStory}>Back to NanoDreamer →</a></section>
  </article>;
}
