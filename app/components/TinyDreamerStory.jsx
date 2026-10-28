import { GameRewardNotes, HyperparameterNotes, EvaluationNotes } from "./DreamerRunNotes";
import DreamerRebuildSketch from "./DreamerRebuildSketch";
import DreamerOriginalCurve from "./DreamerOriginalCurve";
import DreamerPredictionProbe from "./DreamerPredictionProbe";
import DreamerLearningCurve from "./DreamerLearningCurve";
import DreamerAblationComparison, { EncoderComparison, CombinedComparison } from "./DreamerAblationComparison";
import { BlockMath } from "react-katex";
import FirstDraftDisclosure from "./FirstDraftDisclosure";
import DreamerShotComparison from "./DreamerShotComparison";
import DreamerArchitectureCompare from "./DreamerArchitectureCompare";
import FirstDraftDetails from "./FirstDraftDetails";
import WorkingDraftDetails from "./WorkingDraftDetails";

export { default as DreamerGameplayGallery } from "./DreamerGameplayGallery";
import { gameResults as laterResults } from "./dreamerResults";
import DreamerEvidence from "./DreamerEvidence";

export default function TinyDreamerStory() {
  return (
    <>
      <section className="article-section nano-story-section" aria-labelledby="how-hard-could-it-be">
        <h3 id="how-hard-could-it-be">How hard could it be?</h3>
        <p>I started by reading DreamerV3 and DreamerV4, trying to figure out what I actually needed to build. The idea seemed simple enough. A <strong>world model</strong> learns how the game works, an <strong>actor</strong> chooses actions inside its predictions, and a <strong>critic</strong> estimates the rewards beyond them. Here&apos;s what my first attempt looked like.</p>
        <DreamerArchitectureCompare initialTab="first" />
        <p>I started with an <strong>MLP autoencoder</strong> that compressed each frame into a 64-dimensional latent embedding. Once it could reconstruct the screen, I froze its weights.</p>
        <p>A <strong>small causal transformer</strong> read the latent embeddings alongside action and positional embeddings. Its three prediction heads estimated the next latent state, reward, and probability the game would continue. The <strong>actor and critic</strong> were MLPs that saw the current latent concatenated with its change from the previous frame.</p>
        <p>The actor then trained through <strong>5-step imagined rollouts</strong>, sampling an action and feeding each predicted latent back into the model. We combined the predicted rewards with the critic&apos;s estimate of future return to give the actor feedback on its actions.</p>
        <p>In my head, this all worked in theory. Now I just had to see whether it actually would.</p>
        <FirstDraftDisclosure>
          <FirstDraftDetails />
        </FirstDraftDisclosure>
      </section>

      <section className="article-section nano-story-section" aria-labelledby="uh-it-did-not-work">
        <h3 id="uh-it-did-not-work">Uh, it did not work</h3>
        <p>The first training run used roughly 20,000 steps. And it didn&apos;t even shoot.. a complete disaster. Across 30 games, it averaged only <strong>0.03 points</strong>. Even a random policy scored <strong>4.3</strong>.</p>
        <figure className="nano-failed-play">
          <img src="/project-assets/nanodreamer/early-space-invaders.gif" width="160" height="160" alt="The original Space Invaders actor moves right and left without firing, then loses with zero points." loading="lazy" />
        </figure>
        <p>My first doubt was whether the model was predicting the rewards the actor needed to learn from. I replayed the same actions in the real game and the model, then compared what actually happened with what it predicted.</p>
        <p>Here is an example I took from the experiment.</p>
        <DreamerShotComparison />
        <p>The model was quite off with its reward predictions. The model expected about 1.19 points on step four, but the actual shot earned one point on step five, when the model predicted almost nothing. It even predicted small negative rewards when nothing was earned. The actor was being given the wrong answer to learn from. D:</p>
        <p>Across more trajectories, reward timing quickly deteriorated beyond one step into the future.</p>
        <DreamerEvidence kind="timing" />
        <p>One step ahead, about 72% of the reward events were timed correctly. Eight steps ahead, that was only about 1%. The model could start from a real history, but its imagined future quickly became unreliable.</p>
        <p>Those unreliable imagined rewards could also distort the critic&apos;s predictions. In one diagnostic, its average estimate was <strong>10.46</strong>, while real discounted returns averaged only <strong>3.16</strong>. So the actor could be learning from both misplaced rewards and an overly optimistic critic.</p>
      </section>

      <section className="article-section nano-story-section" aria-labelledby="changing-how-the-model-learned">
        <h3 id="changing-how-the-model-learned">Changing how the model learned</h3>
        <p>The model could start from a real history, but struggled once it had to continue from its own predictions. I had two ideas for improving that experience: learn from the actor&apos;s actual gameplay and train on several predicted steps.</p>
        <p>First, the model had only seen random gameplay, so it might struggle in situations our actor reached. I added the actor&apos;s real gameplay to replay so the model could learn from those mistakes.</p>
        <div className="dreamer-training-loop" aria-label="Online training loop: play games, save trajectories, update the encoder and world model, train the actor and critic in imagination, then repeat"><span style={{ "--step": 0 }}><small>01</small><strong>Play real games</strong></span><span style={{ "--step": 1 }}><small>02</small><strong>Save trajectories</strong></span><span style={{ "--step": 2 }}><small>03</small><strong>Update encoder + world model</strong></span><span style={{ "--step": 3 }}><small>04</small><strong>Practise in imagination</strong><em>actor + critic</em></span><p>repeat with the new policy ↻</p></div>
        <p>Second, our earlier probe showed predictions falling apart further into the future. I tested whether training on several predicted steps, rather than one step from a real history, would help.</p>
        <p>The idea was simple: feed each predicted latent back into the model to predict the next step, then compare the predictions against the real latents using the recorded actions. In this experiment, I fine-tuned the model for 600 updates on five-step rollouts.</p>
        <BlockMath math={String.raw`\mathcal L_{\text{rollout}}^{\text{latent}}=\text{error at step 1}+\text{error at step 2}+\cdots+\text{error at step 5}`} />
        <p>In the separate five-step check, 600 rollout updates reduced latent prediction error by about <strong>18%</strong> and reward prediction error by about <strong>9%</strong>. Not bad! But better predictions didn&apos;t necessarily mean a better agent.</p>
        <p>I combined online replay and rollout training and tried Space Invaders again. The run reached around <strong>4 points</strong> in roughly <strong>50k steps</strong> and... plateaued from there. 🫩</p>
        <DreamerOriginalCurve />
        <p>Better than 0.03, but still close to random. I needed to check whether the model was really what held it back.</p>
      </section>

      <aside className="article-section nano-story-section nano-intermission" aria-labelledby="actor-critic-check">
        <span className="nano-intermission-label">Intermission</span>
        <h3 id="actor-critic-check">Was the world model actually the problem?</h3>
        <p>Before a bigger rebuild, I wanted to check one other possibility. Could the actor–critic learn even with real transitions? I gave two copies of the same intermediate agent identical updates, one using model predictions and the other real game transitions.</p>
        <DreamerEvidence kind="oracle" />
        <p>Phew, the actor–critic could improve with real transitions. The problem seemed to be what it was learning from.</p>
      </aside>

      <section className="article-section nano-story-section" aria-labelledby="taking-a-little-inspiration">
        <h3 id="taking-a-little-inspiration">Taking a little inspiration</h3>
        <p>The initial training changes hadn&apos;t been enough. I went back to older <a href="https://arxiv.org/abs/2010.02193" target="_blank" rel="noreferrer">DreamerV2 concepts</a> and used them alongside the diagnostics to rethink how the model represented the game and learned from experience.</p>
        <DreamerRebuildSketch />

      </section>

      <section className="article-section nano-story-section" aria-labelledby="did-it-fix-it">
        <h3 id="did-it-fix-it">Well, did it fix it?</h3>
        <p>The architecture looked more complete, but did it actually predict rewards better? I replayed identical actions through the early and rebuilt Space Invaders models to check. Using trajectories from 30 random-play games, both started with eight real frames and predicted eight steps.</p>
        <p>Across 1,314 rollout windows, here is how often each model put a real reward event on the right step.</p>
        <DreamerPredictionProbe />
        <ul>
          <li><strong>Better timing.</strong> Five steps ahead, correctly timed events increased from <strong>6 of 95 to 40 of 95</strong>.</li>
          <li><strong>Closer reward totals.</strong> Five-step cumulative reward error fell from <strong>0.313 to 0.125</strong>, about 60% lower.</li>
          <li><strong>Still some imaginary points.</strong> False alarms at step five increased from 6 to 27. The rebuilt model found more real rewards, but also predicted more that never happened.</li>
        </ul>
        <p>A big success! Now, you&apos;d expect the imagined frames to look better too, right? Here is the same shot through both models, with the real game on top and each model&apos;s decoded predictions below. Hover over a heatmap to see its decoded frame.</p>
        <DreamerShotComparison compare showRewards={false} />
        <p>Interestingly enough, the first draft actually matched these particular frames more closely, even though the rebuilt model predicted rewards better across the larger test. A cleaner-looking imagined screen wasn&apos;t the same as a more useful reward prediction.</p>

        <p className="nano-experiment-aside">If you&apos;re interested, I also did <a href="#additional-training-comparisons">a deeper dive into the model-training choices and their effects</a>.</p>
      </section>

      <section className="article-section nano-story-section" aria-labelledby="final-draft">
        <h3 id="final-draft">The final draft</h3>
        <p>Better predictions were only useful if the actor could learn from them. The rebuild also changed how the actor and critic used the model. These were already part of the checkpoint tested above; here&apos;s how they fit together.</p>
        <ul>
          <li><strong>Shared history.</strong> The actor and critic had only seen the current latent and a one-frame change. I gave them the transformer&apos;s summary of up to 16 frames and preceding actions, so both could use a longer history to choose actions and estimate future rewards.</li>
          <li><strong>An action MLP.</strong> Previously, the action went into the transformer. Now this MLP combines the history summary with the chosen action before predicting the next latent, reward, and continuation. The actor can choose from the history before the model predicts that action&apos;s consequences.</li>
          <li><strong>Real targets for the critic.</strong> I added real replay returns alongside imagined ones to help ground its optimistic estimates. It still guides the actor through return targets, shown by the dashed training path.</li>
        </ul>
        <DreamerArchitectureCompare initialTab="final" interactive />
        <FirstDraftDisclosure title="Inside the working version" subtitle="Architecture, losses, and imagined returns" endLabel="End of the working-version details">
          <WorkingDraftDetails />
        </FirstDraftDisclosure>
        <p>After 4,000 initial random transitions, the actor keeps collecting real gameplay. Every eight policy steps, I update the world model, actor, and critic. Exploration falls from 40% random actions to a 5% floor, so the agent can still try something outside its current preference and learn from the result.</p>
      </section>

      <section className="article-section nano-story-section" aria-labelledby="the-moment-of-truth">
        <h3 id="the-moment-of-truth">The moment we&apos;ve been waiting for</h3>
        <p id="working-online">The predictions were better. Now for the test that mattered—could an actor learning inside them play the real game? Here are the training runs for Space Invaders and Breakout.</p>
        <DreamerLearningCurve />
        <p>Finally, something was working. At 200k steps, Space Invaders scored nearly <strong>3× random</strong> and Breakout nearly <strong>7× random</strong>. But would the same recipe work across the rest of MinAtar?</p>
        <p>With the algorithm working, I trained it for <strong>500,000 policy steps on each MinAtar game</strong>, using separate weights but the same architecture and hyperparameters. Here are the resulting scores, averaged over 100 fresh games per agent.</p>
        <p className="nano-score-label">Average game score · higher is better</p>
        <div className="dreamer-results" role="table" aria-label="Five-game evaluation at 500,000 training steps, 100 games with a 1,000-action cap"><div role="row"><span role="columnheader">Game</span><span role="columnheader">Random</span><span role="columnheader">NanoDreamer</span></div>{laterResults.map((result) => <div role="row" key={result.game}><strong role="cell">{result.game}</strong><span role="cell">{result.random}</span><strong role="cell">{result.agent}</strong></div>)}</div>
        <p>And there it was. The same roughly 750k-parameter architecture, trained separately on each MinAtar game, beat the random baseline across the board. After the failed runs, misplaced rewards, and nights spent debugging, NanoDreamer was finally learning to play through imagination. :D</p>
        <div className="nano-final-gameplay" aria-label="NanoDreamer playing each MinAtar game">
          {[
            ["Space Invaders", "space-invaders-32-contrast.gif"],
            ["Breakout", "breakout-high-contrast.gif"],
            ["Asterix", "asterix-high-contrast.gif"],
            ["Seaquest", "seaquest-high-contrast.gif"],
            ["Freeway", "freeway-high-contrast-white-chicken.gif"],
          ].map(([game, clip]) => <figure key={game}><div><img src={`/project-assets/nanodreamer/${clip}`} alt={`NanoDreamer playing ${game}`} width="500" height="555" loading="lazy" /></div><figcaption>{game}</figcaption></figure>)}
        </div>
        <h3 id="takeaways-and-next-steps">Takeaways and next steps</h3>
        <p>NanoDreamer changed what I pay attention to when reading a paper. I started by looking at architecture diagrams. Now I&apos;m much more interested in the assumptions, training data, and experiments behind the results.</p>
        <p>It also taught me to be more careful about what an experiment actually tells me. Getting an agent to work and understanding why it works are different achievements. I&apos;m happy we reached the first, but there&apos;s still work to do on the second.</p>
        <p>For my next project, I want to spend less time recreating a complete system and more time investigating a specific question. What information does a latent representation lose? When does an imagined rollout become unreliable, and can the agent recognize that?</p>
        <p>But I&apos;m also tempted to just build more working algorithms and architectures through my favourite video games, like Smash Ultimate or Deadlock. We&apos;ll see where that takes me!</p>
        <p>And lastly, thank you for reading! I really appreciate you making it this far. I spent way too many sleepless nights debugging this thing and pulled an all-nighter to finish the write-up, so it means a lot if you enjoyed it!</p>
      </section>

      <section className="article-section nano-story-section" aria-labelledby="additional-notes">
        <h3 id="additional-notes">Additional notes</h3>
        <p className="nano-notes-caption">Extra experiments, hyperparameters, and my training and evaluation setup.</p>
        <GameRewardNotes />
        <HyperparameterNotes />
        <EvaluationNotes />
        <details id="additional-training-comparisons" className="nano-rssm-notes">
          <summary>Additional training comparisons</summary>
        <p>After the longer runs, I went back to check which training signals helped the policy. I compared versions with one signal removed, then followed up on the promising alternatives. The actor learned entirely in imagination throughout.</p>
        <p>All comparisons below use <strong>150k real policy steps</strong> and the same 100 evaluation games, with a 200-action limit. That keeps the training budget equal, including the run that later hit its time cap.</p>

        <h4>Did prediction errors need to train the encoder?</h4>
        <p>My original encoder learned to reconstruct frames. Reconstructing a projectile didn&apos;t necessarily make its next collision easy to predict, so the full rebuild also let prediction losses train the encoder.</p>
        <p>To test that choice, I trained another version where the CNN learned only reconstruction. The architecture stayed the same, and the encoder still learned online. It just stopped receiving gradients from the prediction losses.</p>
        <EncoderComparison />
        <p>In this first seed, reconstruction-only training scored higher in Space Invaders and almost the same in Breakout. So I couldn&apos;t credit joint encoder training for the improvement. A representation learned through reconstruction was still competitive in this setup.</p>

        <h4>Did the critic benefit from real rewards?</h4>
        <p>Remember the critic expecting more reward than the real game gave? In the full rebuild, I tried grounding it with real replay returns alongside imagined targets. That sounded useful, but the actor was practising inside the model. I wanted to check whether the mixed targets actually helped.</p>
        <p>I compared that critic with one trained entirely on imagined returns, then repeated both versions with a fresh training seed. Each dot below is a separately trained agent.</p>
        <DreamerAblationComparison />
        <p>In <strong>Space Invaders</strong>, imagination-only critic training improved the score in both seeds. In <strong>Breakout</strong>, it helped in the first seed but not the second. Giving the critic real targets wasn&apos;t a consistently better choice.</p>

        <h4>What if I combined the simpler choices?</h4>
        <p>That left a follow-up worth trying. What happened if the encoder learned only reconstruction and the critic learned only in imagination? I tested that combination in the second seed.</p>
        <CombinedComparison />
        <p>In Breakout, the combination reached <strong>5.08</strong>, while the other two versions stayed around <strong>1.4–1.5</strong>. In Space Invaders, it beat the full version but stayed behind the imagination-only critic with a jointly trained encoder.</p>
        <p>So the changes weren&apos;t simply additive. I had promising simpler alternatives, but no single recipe had established itself as the most reliable across games. The combined version had only one seed; these comparisons measured the effects of the training choices, not the mechanism behind them.</p>

        </details>
        <details id="dreamer-model-probes-title" className="nano-rssm-notes">
          <summary>The architecture detours</summary>
          <p>I tried more capacity because the predictor might not have been able to track objects and delayed rewards. Increasing transformer width from 64 to 128 and blocks from 2 to 3 grew the world model from roughly 109,000 to 613,000 parameters. Some reward metrics improved, but gameplay didn&apos;t improve consistently.</p>
          <p>I also tried a small RSSM for recurrent memory. Spatial-token experiments kept four regions separate instead of compressing a frame into one token, and a separate denoising experiment refined a noisy next-state guess over several steps. Those were attempts to preserve local detail and model more complicated futures, inspired by DreamerV4.</p>
          <p>These trials didn&apos;t isolate which architecture was best. They used different checkpoints and training conditions, and some runs were short. The detailed log preserves them, but they don&apos;t establish a single architectural cause for the early failures.</p>
        </details>
        <details id="rssm-notes" className="nano-rssm-notes">
          <summary>Inside the small RSSM trial</summary>
          <p>RSSM stands for recurrent state-space model. Our trial used a 64-number recurrent memory and 8 groups of 8 categorical choices. A GRU-like transition updated the memory from the previous stochastic state and action. A prior predicted the next stochastic state from memory, while a posterior could also use the real observation to correct that prediction.</p>
          <p>The decoder, reward head, and continuation head read the combined memory and stochastic state. Training used image reconstruction, reward and continuation losses, and balanced KL losses to bring the prior and posterior together. In imagination there was no new observation, so only the prior was available. This was a compact DreamerV3-inspired trial, not the original DreamerV3 model size.</p>
          <p>There was also a replay bug in one RSSM trial. Replay required eight-step windows and discarded shorter episodes, including the actor&apos;s six-step failures. In one random dataset, 231 of 300 episodes were too short. The rebuilt replay keeps short terminal windows and masks padding, so those failures remain training examples.</p>
          <p>After 2,000 updates on 1,000 random episodes, the Space Invaders prior missed all 73 one-step reward windows in the held-out probe, even though the observation-conditioned loss had improved. That was a failure of this implementation and training setup, not evidence that small RSSMs cannot work.</p>
        </details>
        <details id="references" className="nano-rssm-notes nano-references">
          <summary>References</summary>
        <ul>
          <li>MinAtar — the environments used to train and evaluate the agents.</li>
          <li><a href="https://arxiv.org/abs/2010.02193" target="_blank" rel="noreferrer">DreamerV2 — Mastering Atari with Discrete World Models</a></li>
          <li><a href="https://arxiv.org/abs/2301.04104" target="_blank" rel="noreferrer">DreamerV3 — Mastering Diverse Domains through World Models</a></li>
          <li><a href="https://arxiv.org/abs/2509.24527" target="_blank" rel="noreferrer">DreamerV4 — Training Agents Inside of Scalable World Models</a></li>
          <li>Raj Ghugare’s PyTorch DreamerV2 implementation — a reference for the CNN encoder and replay setup.</li>
        </ul>
        </details>
      </section>

    </>
  );
}
