import Image from "next/image";
import { BlockMath, InlineMath } from "react-katex";
import architectureImage from "../../public/project-assets/lemario/architecture.png";
import cemPlanningImage from "../../public/project-assets/lemario/cem-planning.png";
import liveCemRollout from "../../public/project-assets/lemario/live-cem-rollout.gif";
import worldThreeEnd from "../../public/project-assets/lemario/world-3-1-end.png";
import worldThreeStart from "../../public/project-assets/lemario/world-3-1-start.png";
import CodeBlock from "./CodeBlock";

const leMarioCode1 = "frames:  [batch, 4, 3, 224, 224]\nactions: [batch, 4, 5, 6]  # Left, Right, Up, Down, A, B";

const leMarioCode2 = "horizontal position: MAE = 9.30 px, R² = 0.997\nvertical position:   MAE = 21.62 px, R² = 0.188";

const leMarioCode3 = "192-dimensional JEPA latent\n    → Linear(192, 128)\n    → GELU\n    → Linear(128, 2)\n    → predicted (x, y)";

export default function LeMarioPanel({ onBack }) {
  return (
    <article className="article-panel" aria-labelledby="lemario-title">
      <button className="back-link" type="button" onClick={onBack}>
        <span aria-hidden="true">‹</span>
        back to projects
      </button>
      <h2 id="lemario-title">LeMario: Super Mario Bros trained on a JEPA Model</h2>
      <div className="article-meta" aria-label="Article metadata">
        <span>Benjamin Bai</span>
        <span className="article-separator" aria-hidden="true">·</span>
        <span>July 2026</span>
        <span className="article-separator" aria-hidden="true">·</span>
        <a href="https://arxiv.org/abs/2603.19312" target="_blank" rel="noreferrer">
          LeWorldModel paper
        </a>
      </div>
      <section className="article-section" aria-labelledby="lemario-introduction">
        <p>I wanted to reproduce <a href="https://arxiv.org/abs/2603.19312" target="_blank" rel="noreferrer">LeWorldModel</a>, a small Joint-Embedding Predictive Architecture (JEPA) that learns world dynamics from pixels and actions. The original paper used it for reward-free planning in Push-T. But, since I loved video games, and at the same time wanted to learn more deeply about LeCun&apos;s JEPA architecture, I decided to write the whole architecture from scratch and train it on Super Mario Bros.</p>
        <p>The model passed every test I initially thought mattered. It generalized to held-out episodes, used the actions, and predicted five-step futures better than strong baselines. Raw reward-free planning could move Mario toward nearby image goals and finish within two and five pixels of the targets. :D</p>
        <p>For a moment, it looked like the model had learned to play. Then I moved the goal farther into the level... Mario could not reliably jump over the first major obstacle or navigate toward a single distant goal image. </p>
        <p>The model had learned to predict the game, but that did not mean it had learned how to make progress through it. D:</p>
        <p>This post is both a technical walkthrough and a postmortem, what I built, how I tested it, the mistakes I made, and the experiments that gradually exposed the real problem. (Most of the lessons seem obvious in hindsight :cry:)</p>
      </section>
      <section className="article-section" aria-labelledby="1-the-whole-architecture">
        <h3 id="1-the-whole-architecture">1. The whole architecture</h3>
        <p>Before introducing each equation separately, it helps to see the whole machine at once:</p>
        <figure className="article-image"><Image src={architectureImage} alt="Diagram of the LeMario JEPA architecture, including its vision encoder, action encoder, causal predictor, and SIGReg objective" placeholder="blur" sizes="(max-width: 720px) 100vw, 640px" /></figure>
        <p>Let’s start with the green path. Each training sample contains four Mario frames. The <strong>vision encoder</strong> compresses every frame into a 192-number representation called a <strong>latent</strong>:</p>
        <BlockMath math={"z_t = E_\\theta(x_t), \\qquad z_t \\in \\mathbb{R}^{192}"} />
        <p>You can think of a latent as the model’s private description of a screenshot. We never tell it which pixels contain Mario or assign a dimension to concepts such as position, enemies, or camera movement. The encoder must discover whichever features make the next state easier to predict.</p>
        <p>The red path contains the controller inputs. Each pair of observations is separated by five emulator frames, and every frame contains six possible button states:</p>
        <CodeBlock code={leMarioCode1} language="text" />
        <p>The <strong>action encoder</strong> compresses each <code>5 × 6</code> button sequence into another 192-number vector. The model already knows which input bit represents Right or A, what it must learn is how pressing that button changes the world.</p>
        <p>The frame and action paths meet inside the <strong>causal predictor</strong>. Its job is to answer:</p>
        <blockquote className="article-quote">Given what the previous frames looked like and which buttons were pressed, what should the next frame’s latent look like?</blockquote>
        <p>The predictor contains six transformer blocks. Their causal attention allows each frame to use earlier frames as context without looking ahead at the future it is supposed to predict.</p>
        <p>The actions enter these blocks through <strong>Adaptive LayerNorm Zero</strong>, or AdaLN-Zero. Rather than simply attaching the action vector to the frame vector, AdaLN-Zero turns each action into three kinds of controls:</p>
        <ul className="article-list"><li><strong>Shift:</strong> adds an action-dependent offset to the frame features.</li><li><strong>Scale:</strong> turns particular features up or down.</li><li><strong>Gate:</strong> controls how strongly the transformer updates the current state.</li></ul>
        <p>A useful intuition is that the frame latents describe what is currently happening, while the action embedding adjusts the predictor’s internal knobs according to what the player did.</p>
        <p>The “Zero” means those controls initially do nothing. Their weights begin at zero, so the predictor starts without random action effects and gradually learns which gates to open during training.</p>
        <p>Suppose the input contains <code>Right+B</code>, followed by a frame where Mario has moved horizontally. If the predictor ignores those buttons, its predicted latent will not match the real next latent. That error flows backward through AdaLN-Zero and the action encoder, teaching the model that this button pattern should alter its prediction.</p>
        <p>It never receives a rule saying “A makes Mario jump.” It repeatedly observes A being pressed, sees what changed afterward, and learns to use that relationship whenever it improves prediction.</p>
        <p>After the six transformer blocks, a small projection head produces three predicted future latents:</p>
        <BlockMath math={"\\hat z_1,\\hat z_2,\\hat z_3"} />
        <p>These are compared with the latents produced by the three real next frames:</p>
        <BlockMath math={"\\mathcal L_{\\text{pred}} = \\operatorname{MSE} \\left( [\\hat z_1,\\hat z_2,\\hat z_3], [z_1,z_2,z_3] \\right)"} />
        <p>There is one easy way for the model to cheat: the visual encoder could represent every frame with the same vector. Prediction would become perfect because Mario, a pipe, and a death screen would all look identical.</p>
        <p><strong>SIGReg</strong> prevents this collapse by encouraging the real frame latents to remain varied and informative. The final objective combines both requirements:</p>
        <BlockMath math={"\\mathcal L = \\mathcal L_{\\text{pred}} + 0.1\\mathcal L_{\\text{SIGReg}}"} />
        <p>Prediction loss teaches the model how the latent world changes. SIGReg makes sure there is still a meaningful world left to predict.</p>
        <p>That is the complete learning signal. There is no reward for moving right, no pixel decoder, and no label identifying Mario. TinyLeWM is only asked to build a non-collapsed representation in which recent frames and actions make the next state predictable.</p>
      </section>
      <section className="article-section" aria-labelledby="but-did-it-actually-learn">
        <h3 id="but-did-it-actually-learn">But did it Actually Learn?</h3>
        <p>I trained TinyLeWM on 737,134 frames from 280 episodes across 32 Mario levels. A lower loss was not enough to prove it had learned dynamics: nearby frames often look so similar that predicting “nothing changes” is a strong baseline.</p>
        <p>On held-out episodes, I compared TinyLeWM with that persistence baseline and with the real frame history paired with shuffled actions:</p>
        <div className="article-table-wrap"><table className="article-table"><thead><tr><th>Method</th><th>One-step error</th><th>Five-step error</th></tr></thead><tbody><tr><td>TinyLeWM</td><td><strong>0.013773</strong></td><td><strong>0.077717</strong></td></tr><tr><td>Predict no change</td><td>0.014472</td><td>0.142473</td></tr><tr><td>Shuffle the actions</td><td>0.016555</td><td>0.114648</td></tr></tbody></table></div>
        <p>Shuffling the actions raised one-step error by 20.2%. Across five recursive steps, TinyLeWM beat persistence by 45.5%, while shuffled actions were 47.5% worse. The farther it predicted, the more the buttons mattered.</p>
        <blockquote className="article-quote">TinyLeWM had learned short-horizon Mario dynamics conditioned on the player’s actions!</blockquote>
      </section>
      <section className="article-section" aria-labelledby="letting-it-touch-the-controller">
        <h3 id="letting-it-touch-the-controller">Letting it touch the controller</h3>
        <p>Now for the fun part. Once the model can imagine futures, we can search through those futures and let it choose what Mario should do.</p>
        <h3 id="searching-through-imagination">Searching through imagination</h3>
        <p>Now to turn the model that only predict a frame ahead given an action, into something that could predict multiple actions and steps into the future, I use the Cross-Entropy Method!</p>
        <p>Given a current image <InlineMath math={"x_t"} /> and goal image <InlineMath math={"x_g"} />, the encoder produces <InlineMath math={"z_t"} /> and <InlineMath math={"z_g"} />. CEM then:</p>
        <ol className="article-list"><li>Samples hundreds of action sequences.</li><li>Rolls each sequence forward through TinyLeWM.</li><li>Scores the predicted final latent against <InlineMath math={"z_g"} />.</li><li>Keeps the best candidates.</li><li>Resamples around them and repeats.</li></ol>
        <figure className="article-image"><Image src={cemPlanningImage} alt="Diagram showing Cross-Entropy Method planning through imagined LeMario futures" placeholder="blur" sizes="(max-width: 720px) 100vw, 640px" /></figure>
        <p>Offline, this worked beautifully. CEM found action sequences with predicted goal distances far below random candidates. I had a model that could imagine, an optimizer that could search its imagination, and a goal image that required no reward engineering. This was exactly the demo I wanted.</p>
      </section>
      <section className="article-section" aria-labelledby="then-mario-barely-moved">
        <h3 id="then-mario-barely-moved">Then Mario barely moved</h3>
        <figure className="article-image article-game-media"><Image src={liveCemRollout} alt="Animated rollout of raw JEPA and CEM barely moving Mario toward a nearby goal" unoptimized /></figure>
        <p>I began with a tiny goal. Mario started at <code>x=40</code>; the goal frame showed him at <code>x=72</code>.</p>
        <p>Raw JEPA+CEM ended at <code>x=44</code>.</p>
        <p>Some random outcomes received better latent scores even though Mario barely moved. CEM had not failed to optimize. It had found actions that looked good under the objective I gave it.</p>
        <p>At this point I did not know which part had failed. Maybe the predictor was wrong, maybe CEM was broken, or maybe the encoder had ignored Mario entirely. I needed to start with the simplest question, did those 192 numbers even contain Mario’s position?</p>
      </section>
      <section className="article-section" aria-labelledby="what-is-inside-192-numbers">
        <h3 id="what-is-inside-192-numbers">What is inside 192 numbers?</h3>
        <p>The latent is only 192 floating-point numbers. I needed a way to ask what information was inside without changing the encoder.</p>
      </section>
      <section className="article-section" aria-labelledby="did-it-forget-mario">
        <h3 id="did-it-forget-mario">Did it forget Mario?</h3>
        <p>I froze the JEPA and trained a small probe to recover Mario’s emulator coordinates from its latent. Because the encoder could not change, any position the probe recovered had to be information the JEPA had already learned. The probe’s architecture and training setup are in <a href="#the-position-probe">the appendix</a>.</p>
        <CodeBlock code={leMarioCode2} language="text" />
        <p>The probe worked! Mario’s horizontal position was almost perfectly recoverable. Vertical state was much weaker, but the encoder had clearly learned useful information about the player.</p>
      </section>
      <section className="article-section" aria-labelledby="the-probe-that-fixed-everything">
        <h3 id="the-probe-that-fixed-everything">The probe that “fixed” everything</h3>
        <p>I temporarily scored CEM’s imagined futures using horizontal position predicted by the probe. TinyLeWM still imagined the futures and CEM still chose the actions; the probe only changed how those futures were ranked.</p>
        <p>For a target at <code>x=72</code>, probe-scored CEM moved Mario from <code>x=40</code> to <code>x=71</code>. With local replanning, it later reached <code>x=176</code> for a goal at <code>x=177</code>.</p>
        <figure className="article-video article-game-media"><video src="/project-assets/lemario/live-mpc-finish-attempt.mp4" aria-label="Probe-scored MPC rollout moving Mario through local waypoints" autoPlay muted loop playsInline preload="auto" /></figure>
        <p>This was the first rollout that looked unambiguously good. The JEPA could imagine useful horizontal motion, and the probe could find it.</p>
        <p>At the time, this convinced me that latent planning should work in theory. If Mario’s position was already inside the representation and the learned dynamics could move it, maybe the first goal was simply too similar to the starting frame.</p>
      </section>
      <section className="article-section" aria-labelledby="try-a-goal-half-a-level-away">
        <h3 id="try-a-goal-half-a-level-away">Try a goal half a level away</h3>
        <p>The planner’s job was to find actions connecting two embeddings. If the starting frame and nearby goal already had similar embeddings, doing almost nothing could look like success. So I removed the supervised probe and tried raw latent planning again with reachable goal images roughly halfway through Worlds 1-1, 2-1, and 3-1.</p>
        <p>This time Mario moved much farther. Instead of going from <code>x=40</code> to <code>x=44</code>, the three runs reached roughly <code>x=290–307</code>. They still died around the first meaningful hazard, but raw latent planning was no longer doing nothing.</p>
        <div className="article-table-wrap article-media-comparison"><table className="article-table"><thead><tr><th>Start</th><th>Goal</th><th>Raw JEPA+CEM: first-obstacle failure</th></tr></thead><tbody><tr><td><Image className="article-pixel-frame" src={worldThreeStart} alt="Starting frame for the World 3-1 planning experiment" unoptimized /></td><td><Image className="article-pixel-frame" src={worldThreeEnd} alt="Goal frame for the World 3-1 planning experiment" unoptimized /></td><td><video src="/project-assets/lemario/far-goal-raw-jepa-cem.mp4" aria-label="Raw JEPA and CEM World 3-1 first-obstacle failure" autoPlay muted loop playsInline preload="auto" /></td></tr></tbody></table></div>
        <p>CEM had done exactly what I asked: search for actions that connected two embeddings. A more distant goal apparently created enough pressure in latent space to make Mario move.</p>
        <p>But Mario was still 1,442 world pixels from the goal, while the encoder assigned his final scene a latent distance of only <code>0.164</code>. CEM had predicted <code>0.153</code>, so the predictor was not wildly hallucinating. The encoder itself considered the wrong scene fairly close.</p>
        <p>Mario’s scrolling camera explains why. Two distant locations can both contain blue sky, brown ground, clouds, and Mario in a similar place on screen. They look alike without representing the same point in the level.</p>
        <p>The learned latent behaved like a description of the scene, not a global map of the world. The planner had found a path between embeddings which was not the same thing as making progress through the level.</p>
      </section>
      <section className="article-section" aria-labelledby="6b-fine-make-the-goals-smaller">
        <h3 id="6b-fine-make-the-goals-smaller">6B. Fine, make the goals smaller</h3>
        <p>So I then theorized that if we split it into smaller checkpoints than the , so I split the human run into intermediate image goals. This helped: raw latent planning reached <code>x=314</code>, the most probe-free progress in the project. The horizon really was part of the problem.</p>
        <p>But shorter goals did not fix the representation.</p>
        <p>In the 100-frame run, Mario reached the first target within two pixels. For the second, he overshot to <code>x=283</code>, corrected backward, and stopped at <code>x=239</code> five pixels from the reference.</p>
        <figure className="article-video article-game-media"><video src="/project-assets/lemario/raw-jepa-image-subgoals.mp4" aria-label="Raw JEPA image-subgoal rollout" autoPlay muted loop playsInline preload="auto" /></figure>
        <p>The latent threshold still rejected him. Mario had reached roughly the correct position, but on a different schedule: the timer, animation, enemies, and camera state no longer matched the reference image.</p>
        <p>That separated the controller from its metric. TinyLeWM could produce useful local motion, but full-scene latent distance could not reliably recognize success. When the next goal required a jump, the planner failed again—matching the probe’s weak vertical-position result.</p>
        <blockquote className="article-quote">Hierarchical goals helped with distance. They did not turn predictive similarity into controllable progress.</blockquote>
        <p>That version makes the experiment earn its place: it rules out “the goal is merely too far away” and exposes the deeper representation problem.</p>
        <p>So what actually broke?</p>
        <p>The experiments reduced what looked like unrelated failures to three deeper issues.</p>
        <h3 id="predictive-state-is-not-control-state">Predictive state is not control state</h3>
        <p>The encoder is rewarded for representing whatever helps predict future images. Camera position, enemy phase, animation, and timer state can all be useful.</p>
        <p>The controller needs something different: a state where distance corresponds to controllable progress. The horizontal probe proved that useful control information was present, but the default metric did not privilege it.</p>
        <h3 id="cem-searches-for-model-weaknesses">CEM searches for model weaknesses</h3>
        <p>Validation averages over ordinary held-out trajectories. CEM deliberately searches for unusually good scores. If the model has a shortcut, an overconfident region, or two task-distinct scenes that look similar, the optimizer will exploit it.</p>
        <p>A bad real plan with a good predicted score is not just optimizer failure. It is a precise demonstration of what the model believes.</p>
        <h3 id="mario-changed-the-assumptions-behind-push-t">Mario changed the assumptions behind Push-T</h3>
        <p>Push-T used nearby goals from expert trajectories, a fixed camera, smooth movement, and a scene whose visual similarity aligned with progress. Its model trained for ten epochs on 20,000 expert episodes.</p>
        <p>TinyLeWM trained for one epoch on 280 episodes spread across 32 levels. Nearby goals became half a level away. A fixed camera became a scrolling one. Smooth movement became momentum, jumping, pits, enemies, animation, and death.</p>
        <p>I copied the architecture while changing several conditions that made its planning rule work. Those details were not packaging around the method. They were part of the method’s success.</p>
      </section>
      <section className="article-section" aria-labelledby="where-i-landed">
        <h3 id="where-i-landed">Where I landed</h3>
        <p>TinyLeWM did not learn to play Super Mario Bros. It learned something narrower and still real: short-horizon, action-conditioned dynamics with a strong representation of horizontal position. With a supervised score, it enabled precise horizontal control. Without the probe, it could reach nearby image goals and correct an overshoot.</p>
        <p>It did not learn a global map, robust vertical dynamics, or a latent distance equivalent to progress through a level.</p>
        <p>If I started again, I would:</p>
        <ul className="article-list"><li>Test the planning geometry before scaling training. Does moving right actually make a nearby rightward goal closer?</li><li>Separate predictive state from controllable state, so the planner can ignore details it cannot affect.</li><li>Collect data around the real bottleneck. More horizontal running is unlikely to teach jumping.</li></ul>
        <p>By the end, the failures had separated prediction, representation, and control in a way the successful offline numbers never could. I began asking a more useful question:</p>
        <blockquote className="article-quote">When does a model of the future also become a useful map for decisions?</blockquote>
        <p>TinyLeWM showed that the answer is not “automatically.” Prediction can be correct, information can be present, and planning can still fail because the geometry connecting them is wrong.</p>
        <p>I began with pixels and buttons, watched 192 anonymous numbers turn into a predictive state, and discovered exactly where that state stopped being a map. That feels like a pretty good first research project.</p>
      </section>
      <section className="article-section" aria-labelledby="appendix">
        <h3 id="appendix">Appendix</h3>
        <h3 id="the-position-probe">The position probe</h3>
        <p>The probe did not fine-tune the JEPA. I froze the encoder, collected 60 World 1-1 trajectories, and split complete trajectories into training and validation sets. That produced 3,203 training latents and 859 held-out latents.</p>
        <p>The MLP was deliberately small:</p>
        <CodeBlock code={leMarioCode3} language="text" />
        <p>I normalized the coordinate targets and trained the probe for 1,500 AdamW steps. I also trained a single linear layer as a simpler comparison. Because neither probe could change the JEPA, their held-out accuracy measured how easily Mario’s position could already be read from the representation.</p>
        <h3 id="bugs-that-looked-like-research-results">Bugs that looked like research results</h3>
        <p>Two failures nearly changed the project’s conclusion for the wrong reasons.</p>
        <h3 id="the-exploding-five-step-rollout">The exploding five-step rollout</h3>
        <p>My first rollout evaluator reported a loss of <code>10.236848</code>, over 70 times worse than persistence. I assumed recursive prediction was unstable.</p>
        <p>The bug was an off-by-one in model semantics. Four input frames produced four outputs, but only the first three were trained. I began recursion from the fourth, untrained output. Starting from the final trained output changed loss to <code>0.077717</code>.</p>
        <h3 id="the-collapsed-validation-representation">The collapsed validation representation</h3>
        <p>Another evaluation reported a SIGReg loss of <code>95.8325</code>, suggesting the encoder had collapsed.</p>
        <p>The validation batches contained heavily overlapping neighboring windows. SIGReg expects batch diversity when judging the latent distribution; my loader repeatedly supplied nearly identical scenes. Randomizing windows across held-out episodes reduced the value to <code>3.906</code>.</p>
        <p>Both numbers were computed correctly from the tensors they received. The tensors answered the wrong question.</p>
        <p>The debugging rule I kept relearning was simple: when a result is surprising, try to break the measurement before explaining the model.</p>
      </section>
      <section className="article-section" aria-labelledby="references">
        <h3 id="references">References</h3>
        <ul className="article-list"><li>Lucas Maes, Quentin Le Lidec, Damien Scieur, Yann LeCun, and Randall Balestriero, <a href="https://arxiv.org/abs/2603.19312" target="_blank" rel="noreferrer">“LeWorldModel: Stable End-to-End Joint-Embedding Predictive Architecture from Pixels”</a>, 2026.</li><li><a href="https://le-wm.github.io/" target="_blank" rel="noreferrer">Official LeWorldModel project page</a></li><li><a href="https://github.com/lucas-maes/le-wm" target="_blank" rel="noreferrer">Official LeWorldModel implementation</a></li></ul>
      </section>
    </article>
  );
}
