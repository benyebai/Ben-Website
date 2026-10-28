import { BlockMath } from "react-katex";
function Equation({label,math,children}) {
  return <details className="nano-expandable-equation"><summary aria-label={label}><BlockMath math={math}/></summary><div>{children}</div></details>;
}
export default function WorkingDraftDetails() {
  return <div className="nano-first-details">
    <section id="working-encoder">
      <h4>First, describe the game in 64 numbers</h4>
      <p>The CNN encoder compresses each frame into 64 numbers. Shared 3 × 3 filters look for local patterns across the grid. The decoder reconstructs the observation channels using weighted binary cross-entropy.</p>
      <p>Unlike the first draft, prediction losses also update the encoder. A slowly moving target encoder provides the real latent targets, so the predictor isn&apos;t chasing every encoder update immediately.</p>
      <p className="nano-math-instruction">Open any equation to see what the symbols mean.</p>
      <Equation label="How the target encoder updates" math={String.raw`\bar\theta_E\leftarrow0.99\bar\theta_E+0.01\theta_E`}>
        <p>θᴇ denotes the trainable encoder&apos;s weights. The bar marks the target encoder. Each update keeps 99% of its old weights and takes 1% of the current encoder&apos;s weights. Gradients do not update this target network.</p>
      </Equation>
      <p>Reconstruction checks what the latent preserves visually. Prediction losses give it feedback about the consequences the world model needs to learn.</p>
    </section>
    <section id="working-prediction">
      <h4>Then, predict what an action does</h4>
      <p>The transformer reads up to 16 frames and preceding actions. It has two causal blocks, width 128 and four attention heads. A small MLP combines its summary hₜ with the current action before the three prediction heads.</p>
      <p>The heads predict the next latent, a reward distribution over 255 bins, and continuation probability. Each generated step checks all three, plus the frame decoded from the predicted latent.</p>
      <Equation label="How to read the generated-step prediction loss" math={String.raw`\begin{aligned}\ell_k={}&\mathcal L_{\text{next latent}}+\mathcal L_{\text{predicted frame}}\\&+2\mathcal L_{\text{reward}}+0.2\mathcal L_{\text{continuation}}\end{aligned}`}>
        <p>Next-latent loss is mean squared error against the target encoder&apos;s output. Predicted-frame loss is weighted binary cross-entropy. Reward loss is cross-entropy against a two-hot target, which splits a symlog-transformed reward between neighboring bins. Continuation uses binary cross-entropy. The coefficients balance contributions with different numerical scales.</p>
      </Equation>
      <p>Three generated steps feed predictions back into the model. A quarter of sampling draws come from reward events, with importance weights correcting that mixture. Padding is excluded from losses.</p>
      <Equation label="How the world-model losses combine" math={String.raw`\begin{aligned}\mathcal L_{\text{world}}={}&\mathcal L_{\text{reconstruction}}+\mathcal L_{\text{one-step}}\\&+\frac13\sum_{k=1}^{3}\ell_k\end{aligned}`}>
        <p>Reconstruction checks real frames. The one-step term checks latent and decoded-frame predictions from real histories. The averaged three-step term checks futures generated through the model&apos;s own outputs. Target latents are detached.</p>
      </Equation>
    </section>
    <section id="working-behavior">
      <h4>Now, let the actor practise</h4>
      <p>The actor and critic read the transformer&apos;s history summary. Starting from replay, the actor chooses five imagined actions. The model predicts their rewards and continuation probabilities, and the target critic estimates what comes afterward.</p>
      <Equation label="How to read the working lambda return" math={String.raw`\begin{aligned}G_t^\lambda&=\hat r_t+\gamma\hat c_t[(1-\lambda)\bar V(h_{t+1})+\lambda G_{t+1}^\lambda]\\G_5^\lambda&=\bar V(h_5)\end{aligned}`}>
        <p>G is the return target. Each step adds predicted reward r̂ to discounted future value. γ = 0.99 discounts the future; λ = 0.95 mixes the next critic estimate with the longer return. Continuation ĉ removes future value when the model expects an ending. Work backward from the final target-critic estimate V̄.</p>
      </Equation>
      <p>Actions with returns above the critic&apos;s expectation become more likely. A running return scale keeps the advantage comparable as rewards change, and a small entropy bonus encourages exploration.</p>
      <Equation label="How to read the working actor objective" math={String.raw`\begin{aligned}A_t&=\operatorname{sg}\!\left(\frac{G_t^\lambda-V(h_t)}{\max(1,S)}\right)\\\mathcal L_{\text{actor}}&=-\mathbb E_t[w_t(A_t\log\pi(a_t\mid h_t)+0.001\mathcal H)]\end{aligned}`}>
        <p>A is the scaled advantage and S is the running return range. π is the sampled action&apos;s probability, ℋ is policy entropy, and w discounts later states using predicted continuation. sg stops gradients through the learning target. Actor gradients pass through action probabilities, not through the world model.</p>
      </Equation>
      <p>This recipe trains the critic on three-step real replay returns, bootstrapped with a target critic, plus a smaller imagined-return loss. The actor still learns entirely in imagination.</p>
      <Equation label="How to read the working critic objective" math={String.raw`\mathcal L_{\text{critic}}=\mathcal L_{\text{real replay}}+0.3\mathcal L_{\text{imagined}}`}>
        <p>Both terms use cross-entropy to fit a distribution over value bins to detached two-hot return targets. Real examples receive replay importance weights; imagined examples receive continuation weights. The target critic moves 2% toward the current critic per update.</p>
      </Equation>
    </section>
  </div>;
}
