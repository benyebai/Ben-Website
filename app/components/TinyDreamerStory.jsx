import DreamerArchitectureCompare from "./DreamerArchitectureCompare";
import CodeBlock from "./CodeBlock";
import { WorldModelMath, BehaviorMath } from "./DreamerMath";
import SpatialTokenSketch from "./SpatialTokenSketch";

const motionInput = `actor_input = concatenate([
    current_latent,
    current_latent - previous_latent,
])`;

export { default as DreamerGameplayGallery } from "./DreamerGameplayGallery";
import { gameResults as laterResults } from "./dreamerResults";
import DreamerEvidence from "./DreamerEvidence";

export default function TinyDreamerStory() {
  return (
    <>
      <section className="article-section" aria-labelledby="dreamer-build-title">
        <h3 id="dreamer-build-title">Our Very First Draft</h3>
        <p>After reading Dreamer, I understood three main parts. A <strong>world model</strong> predicts what happens after an action, an <strong>actor</strong> chooses the actions, and a <strong>critic</strong> estimates future rewards. I wanted to take inspiration from that idea and build something smaller, rather than copy the architecture exactly.</p>
        <p>Here was my first draft. I trained the pieces on recorded random games before adding the online loop.</p>
        <DreamerArchitectureCompare initialTab="first" />
        <p>MinAtar gives me a 10 × 10 grid with separate channels for the player, enemies, and shots. I recorded games in <strong>replay</strong>, saving each frame, action, reward, and episode ending.</p>
        <p>First, an <strong>MLP autoencoder</strong> compressed each frame into a latent and learned to reconstruct it. I froze that representation, then trained an <strong>action-conditioned transformer</strong> with three heads to predict the <strong>next latent</strong>, <strong>reward</strong>, and <strong>continuation</strong>, the probability that the episode keeps going.</p>
        <p>The <strong>actor</strong> chose actions inside that frozen world model. It could practise several steps into a predicted future, while the <strong>critic</strong> estimated what might happen after the rollout ended. Those imagined rewards and the critic&apos;s estimate trained the actor and critic.</p>
      </section>

      <section className="article-section" aria-labelledby="dreamer-fail-title">
        <h3 id="dreamer-fail-title">Then it barely fired</h3>
        <p>The first complete agent scored about <strong>0.03 in Space Invaders</strong> versus random&apos;s <strong>4.3</strong> over 30 evaluation games using greedy actions for the actor. It barely fired.</p>
        <p>I had an encoder, a model that predicted what came next, and an actor learning inside those predictions. But put them together and the agent could barely score. D:</p>
        <p>At this point I did not know which part had failed. Could the actor see how things were moving? Was it choosing bad actions, or was the model teaching it the wrong consequences? I started with motion, giving the actor the change in latent state as well as the current state:</p>
        <CodeBlock code={motionInput} language="python" />
        <p>That helped Breakout, but Space Invaders still would not fire. I tried a penalty that kept the actor closer to actions seen in replay. It fired sometimes again, but a global preference for firing does not teach it <em>when</em> to fire.</p>
        <div className="dreamer-failure-flow" aria-label="Action-prior regularization partly improved a weak policy"><span>Actor barely fires</span><span>Add action prior</span><span>Partial recovery</span></div>
        <h4>Was the actor being rewarded for the wrong thing?</h4>
        <p>Making it fire was only useful if the imagined shots had the right consequences. So I compared real and predicted rewards for the <em>same actions</em>. If a shot took several steps to hit an alien, could the model keep track of it until the reward arrived?</p>
        <p>Here is a simplified example of the problem. The real game gives a point on step four, but the model puts it on step two. These numbers are illustrative; the measurements below come from the actual experiment.</p>
        <div className="dreamer-example-label">Illustrative reward sequence · not measured data</div>
        <div className="dreamer-reward-compare" role="img" aria-label="Actual rewards over five steps: zero, zero, zero, one, zero. Predicted rewards: zero, one, zero, zero, zero."><div><strong>Actual rewards</strong><span>0</span><span>0</span><span>0</span><span className="is-reward">1</span><span>0</span></div><div><strong>Predicted rewards</strong><span>0</span><span className="is-mistimed">1</span><span>0</span><span>0</span><span>0</span></div></div>
        <DreamerEvidence kind="timing" />
        <p>The <strong>actor</strong> could favour actions leading to that misplaced reward. The <strong>critic</strong> could learn inflated expectations too: in one diagnostic, its average estimate was <strong>10.46</strong>, while empirical discounted returns averaged <strong>3.16</strong>.</p>
        <h4>What if it learned from its own mistakes?</h4>
        <p>The first prototype learned from a fixed random-play dataset. But the actor could visit situations that random play rarely reached. If the model got those situations wrong, training the actor inside it would not magically correct them.</p>
        <p>So I added the online loop. Let the actor play real games, save what actually happened, update the representation and world model, then practise in imagination again. Now a real mistake could become a training example.</p>
        <p>That sounded promising. But an early Space Invaders run went from <strong>5.84 to 3.70</strong> over three online cycles, against random’s <strong>4.01</strong>. Collecting its own experience gave the model a chance to improve; it did not guarantee that the updates would make the policy better.</p>
        <div className="dreamer-training-loop" aria-label="Online training loop: play games, save trajectories, update the encoder and world model, train the actor and critic in imagination, then repeat"><span style={{ "--step": 0 }}><small>01</small><strong>Play real games</strong></span><span style={{ "--step": 1 }}><small>02</small><strong>Save trajectories</strong></span><span style={{ "--step": 2 }}><small>03</small><strong>Update encoder + world model</strong></span><span style={{ "--step": 3 }}><small>04</small><strong>Practise in imagination</strong><em>actor + critic</em></span><p>repeat with the new policy ↻</p></div>

        <p><strong>The actor needed to learn delayed consequences, but imagination became unreliable before those consequences arrived.</strong> I trained the model to roll forward through its own predictions and compared those futures with real trajectories. Some errors improved, but imagined rewards could still mislead the actor. That made me question whether this small transformer architecture was enough.</p>
      </section>

      <section className="article-section" aria-labelledby="dreamer-model-probes-title">
        <h3 id="dreamer-model-probes-title">Was I asking too much of a tiny transformer?</h3>
        <p>Maybe the model simply did not have enough capacity. It had to follow moving objects, predict collisions, and remember a shot long enough to know whether it would hit. So I made the transformer wider and deeper and trained it longer.</p>
        <p>Some prediction metrics improved. The actual play did not improve consistently, and in one comparison the smaller Space Invaders model did better. A bigger predictor had not given me a better controller.</p>
        <p>I also went back to DreamerV3 and tried a small <strong>RSSM</strong>, its recurrent world model. Instead of rereading a window of recent frames, it carries a learned memory forward and predicts a distribution over latent states. Maybe that would handle the history and uncertainty my transformer was missing.</p>
        <p>That struggled too. When the RSSM could see the next real frame, it could use that observation to correct its state. During imagination, the frame was gone; it had to keep going from its own predictions. That was where I needed it to work.</p>
        <p>This did not prove RSSMs were unsuitable for a small agent. It showed that switching to one had not solved the failure in my implementation and training setup.</p>
        <h4>Was the representation losing the small things?</h4>
        <p>Then I tried spatial and sampled-prediction ideas inspired by DreamerV4. My original encoder squeezed the whole screen into one vector. What if that made small moving objects too easy to lose?</p>
        <p>I split the observation into four regions and encoded them separately. A spatial-token transformer kept those regions as separate tokens: each could attend to the other regions in its frame and to earlier frames, but not the future.</p>
        <SpatialTokenSketch />
        <p>In a separate probe, I replaced the one-shot next-latent prediction with a small denoising process. It started with a noisy guess and refined it over several steps using the history and action. These were small tests inspired by DreamerV4, not an implementation of the full system. Some immediate predictions improved; longer reward timing remained unreliable.</p>
        <p>I had tried more capacity, recurrent memory, spatial structure, and a different way to generate futures. None gave me a dependable control breakthrough. These were limited experiments, so they could not tell me which architecture was best. But they gave me a more direct question:</p>
        <p><strong>Could the same actor–critic learn if I replaced the model&apos;s imagined transitions with real ones?</strong></p>
      </section>

      <section className="article-section" aria-labelledby="dreamer-truthful-world-title">
        <h3 id="dreamer-truthful-world-title">What if the imagined world was always right?</h3>
        <p>By now I had changed several ways of predicting the future. But I still had not answered a simpler question: could this actor–critic learn if the futures it trained on were correct?</p>
        <p>I could test that without training another world model. MinAtar let me clone the real game state and try the actor’s actions from there.</p>
        <p>I kept the starting networks and learning procedure fixed and changed where the rollout came from. In one branch, actions went into the learned world model. In the other, they went into cloned states of the real game. Both branches trained the actor and critic from ten-step trajectories.</p>
        <DreamerEvidence kind="oracle" />
        <p>With real transitions, the actors improved. With model transitions, they got worse. Both training seeds showed the same direction in both games. Cloning game states let me repeat a situation; it was a diagnostic, not the ordinary Dreamer collection loop. The result implicated these model rollouts without proving every actor–critic choice was optimal.</p>
        <p>The actor–critic could learn! Supplying real consequences improved play in this test. That gave me a more useful direction than another architecture swap: find out why the learned world was giving the same update such different training signals.</p>
        <blockquote className="article-quote">Predicting a plausible future was not enough. The actor needed the consequences of its actions to be right.</blockquote>
        <p>Shortening the rollout was not a complete answer either. Some actions needed time to affect rewards. I was caught between two requirements: imagine far enough to see why an action matters, but not so far that the model loses track of what happens.</p>
        <h4>Was I even showing it the failures?</h4>
        <p>One later RSSM run exposed a concrete implementation bug. The failing Breakout actor produced six-step episodes, but the sampler required eight-step windows. It discarded the failures the model most needed to learn from. In one initial random dataset, 231 of 300 episodes were also shorter than eight steps.</p>
        <p>I had been asking the model to learn why the agent died, while throwing away some of the episodes where it died fastest. This one was an implementation mistake.</p>
        <p>I changed replay to include short episodes and terminal windows. The six-step collapse disappeared and terminal predictions improved. The agent was still weak, but at least this failure could now reach the model instead of disappearing in the sampler.</p>
      </section>

      <section className="article-section" aria-labelledby="dreamer-working-reference-title">
        <h3 id="dreamer-working-reference-title">Taking inspiration from a working implementation</h3>
        <p>I started searching for similar implementations to see what I might be missing. The most useful reference I found was a <a href="https://github.com/RajGhugare19/dreamerv2" target="_blank" rel="noreferrer">DreamerV2 implementation for MinAtar</a>. It used an RSSM rather than a transformer, but I took inspiration from its observation encoder and online training setup.</p>
        <p>Looking through it made me go back to the inputs. I had spent so much time changing the predictor. But if the encoder discarded something the actor needed, what exactly was a better predictor supposed to recover?</p>
        <p>For this final experiment I rebuilt the agent in PyTorch, using the earlier hand-built versions as the learning foundation. I kept transformer dynamics, borrowed the native spatial encoder design, and brought the accumulated training and replay fixes into one implementation.</p>
        <h4>What should those 64 numbers keep?</h4>
        <p>The reference used a small CNN directly on MinAtar&apos;s observation channels. That made sense to me: the game is a spatial grid, so nearby cells and local patterns matter. My original MLP flattened the whole observation before compressing it.</p>
        <p>I replaced that MLP with a small CNN. I also changed how it learned. Before, I trained the autoencoder to reconstruct frames, froze it, and handed its latents to the transformer. The encoder never heard whether those latents helped predict what an action would do.</p>
        <p>Now I trained the encoder, decoder, and transformer together. If the latent made a reward or a future frame hard to predict, that error could update the encoder too. It no longer only had to describe the current picture; it also had to help explain what would happen after an action. A slowly updated target encoder kept the prediction targets stable.</p>
        <WorldModelMath />
        <h4>Why make the actor guess the motion again?</h4>
        <p>Another choice in my first design felt awkward: the transformer processed a history of observations and actions, but the actor only saw the current latent and its difference from the previous one. Why make the actor infer movement from two frames when the transformer had already built a representation of that history?</p>
        <p>I changed the actor and critic to read the transformer&apos;s history features. The actor chose an action from those features; that action then conditioned the model&apos;s next-state, reward, and continuation predictions.</p>
        <p>Here is how those choices changed the architecture. Switch between the two versions to follow the same paths:</p>
        <DreamerArchitectureCompare initialTab="final" interactive />
        <h4>Let it practise, then go back to the real game</h4>
        <p>I kept imagination short and continued collecting real experience. The world model learned from replay, the critic learned from real and imagined return targets, and the actor learned exclusively through five-step imagined rollouts. I also fixed replay to keep short episodes and terminal transitions.</p>
        <BehaviorMath />
        <p>This is the setup I trained from scratch on Modal. At 200,000 policy steps, it scored <strong>12.99 in Space Invaders versus random&apos;s 4.07</strong>, and <strong>3.03 in Breakout versus 0.36</strong>, over 500 fresh evaluation games each, with a 200-action cap.</p>
        <p>Finally, an agent trained from scratch that could actually play. :D</p>
        <p>I changed several things together in this rebuild, so I cannot say the CNN, history features, or critic targets individually caused the improvement. What I can say is that this combined setup produced useful behavior, where the earlier versions had struggled.</p>
      </section>

      <section className="article-section" aria-labelledby="dreamer-ending-title">
        <h3 id="dreamer-ending-title">What it finally did</h3>
        <p>I continued Space Invaders and trained separate models for the other games. These are the 500,000-step checkpoints, tested on 100 fresh games each with a 1,000-action cap. Random play used the same test setup:</p>
        <aside className="dreamer-eval-note"><strong>How to read these results</strong><p>The earlier 200k evaluation used 500 episodes with a 200-action cap. The table below uses 100 episodes with a 1,000-action cap, so it is not a directly comparable learning curve. Each checkpoint represents one training seed per game; evaluation episodes are not independent training runs. Scores are mean raw episode returns. The gameplay clips are selected examples, not those means.</p></aside>
        <div className="dreamer-results" role="table" aria-label="Five-game evaluation at 500,000 training steps, 100 games with a 1,000-action cap"><div role="row"><span role="columnheader">Game</span><span role="columnheader">Random</span><span role="columnheader">NanoDreamer</span></div>{laterResults.map((result) => <div role="row" key={result.game}><strong role="cell">{result.game}</strong><span role="cell">{result.random}</span><strong role="cell">{result.agent}</strong></div>)}</div>
        <p>All five beat random play in this test. Space Invaders was the clearest success; Asterix was still weak in absolute score. Each game had one training seed, and its scores use that game&apos;s own reward scale, so I do not read this as a general ranking of the games or proof the recipe always works.</p>
        <details className="implementation-notes"><summary><span>Training setup and sources</span></summary><div className="implementation-notes-body"><p>The working agent uses a 64-value CNN latent, a width-128 transformer with two blocks and four attention heads, and a 16-step context. Model training includes three-step generated rollouts; actor training uses five-step imagination. After 4,000 initial random transitions, one complete learning update runs every eight policy steps.</p><p>The actor receives policy gradients only from imagination. The critic combines real replay and imagined targets. This is a Dreamer-inspired implementation, not a faithful reproduction or an isolated ablation of the final changes.</p><p><a href="https://github.com/RajGhugare19/dreamerv2" target="_blank" rel="noreferrer">MinAtar DreamerV2 reference</a> · <a href="https://github.com/benyebai/TinyDreamer/tree/main/pytorch_agent" target="_blank" rel="noreferrer">Working PyTorch code</a> · <a href="https://github.com/benyebai/TinyDreamer/blob/main/docs/MINATAR_NANO_LOG.md" target="_blank" rel="noreferrer">Detailed experiment log</a></p></div></details>
        <h4>What I learned</h4>
        <p>The hardest part was not getting each component to run. It was making sure the actor was learning from consequences that would actually happen. A model could reconstruct a convincing frame or improve its one-step loss while placing a reward at the wrong time. The actor would chase that mistake, and the critic could make it look even more convincing.</p>
        <p>The real-versus-imagined test changed how I debugged the project. I stopped asking only whether prediction metrics improved and started checking whether the <em>same actions</em> led to the same outcomes. I also learned how much small implementation details matter: dropping short episodes from replay or masking a terminal transition incorrectly can hide exactly the evidence the model needs.</p>
        <p>Looking back, I kept coming back to the architecture because it was the easiest part to point at. But the replay sampler, representation, reward predictions, and value targets all affected what the actor learned. Getting the boxes right was only the start. I also had to check what information and mistakes were passing between them.</p>
        <h4>Where I would take it next</h4>
        <p>I want to repeat the training across fresh seeds, understand why Breakout varied so much, and improve reward timing over longer imagined futures. I also want a matched comparison with an actor trained on real transitions at the same interaction budget. Those tests would tell me how reliable this small Dreamer really is.</p>
        <p>I started NanoDreamer because world models felt huge and mysterious. Building one from basic math through a playing agent made the ideas much more concrete for me. I hope this write-up gives you that same feeling: you can open each piece, see where it failed, and understand how the pieces finally learned to work together.</p>
      </section>

    </>
  );
}
