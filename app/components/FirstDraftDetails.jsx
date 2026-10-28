import { BlockMath } from "react-katex";

export default function FirstDraftDetails() {
  return <div className="nano-first-details">
    <section id="first-encoder">
      <h4>First, describe the game in 64 numbers</h4>
      <p>A small MLP autoencoder compressed each game frame into 64 numbers, then tried to reconstruct it.</p>
      <p>Most cells were empty. A model could therefore get many cells right by predicting an almost empty screen. I used <strong>weighted binary cross-entropy</strong> to make missing an occupied cell more costly.</p>
      <p className="nano-math-instruction">Open any equation to see what the symbols mean.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="How to read the reconstruction loss"><BlockMath math={String.raw`\mathcal L_{\text{reconstruction}}=-\operatorname{mean}_i\left[w_i x_i\log\hat x_i+(1-x_i)\log(1-\hat x_i)\right]`} /></summary>
        <div><p>Each xᵢ is the real occupancy of one cell in one channel, either zero or one. Its prediction x̂ᵢ is a probability. A hat means predicted, wᵢ gives occupied cells more weight based on their rarity in that channel, and mean averages the errors across the batch. If a cell is occupied, its loss is −wᵢ log x̂ᵢ. Predicting 0.9 gives about 0.105wᵢ loss, while predicting 0.1 gives about 2.303wᵢ. Confident mistakes get larger penalties. The other term handles empty cells.</p></div>
      </details>
      <p>I then froze the autoencoder. The transformer had to work with whatever those 64 numbers preserved.</p>
    </section>
    <section id="first-prediction">
      <h4>Then, predict what an action does</h4>
      <p>The transformer read eight steps of latent and action history. It had two causal blocks, with width 64 and four attention heads.</p>
      <p>Three heads read the output. The next-latent head predicted a change to the current latent. The reward head predicted a number, and the continuation head predicted the probability that the episode kept going.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="How to read the prediction losses"><BlockMath math={String.raw`\hat z_{t+1}=z_t+\Delta z_t,\quad \mathcal L_{\text{next latent}}=\operatorname{MSE}(\hat z_{t+1},E(x_{t+1}))`} /><BlockMath math={String.raw`\mathcal L_{\text{reward}}=\operatorname{MSE}(\hat r_t,r_t),\qquad \mathcal L_{\text{continuation}}=\operatorname{BCE}(\hat c_t,c_t)`} /></summary>
        <div><p>zₜ is the current 64-number latent and Δzₜ is the predicted change. E is the frozen encoder, so E(xₜ₊₁) is the encoding of the real next frame. MSE means mean squared error. Subtract each predicted value from its target, square the difference, then average across latent values and sampled transitions.</p><p>rₜ is the real reward and r̂ₜ is its prediction. MSE averages squared errors, so predicting 0.2 for a reward of 1 gives (0.2 − 1)² = 0.64. cₜ is one if the episode continues and zero if it ends. BCE means binary cross-entropy. It penalizes confident incorrect continuation probabilities, just as reconstruction BCE penalizes incorrect occupancy probabilities.</p></div>
      </details>
      <p>The predicted-frame loss decoded the predicted latent and compared it with the real next frame. Cells that changed received more weight, so a small moving object was harder to ignore. I combined the four losses like this.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="Why these loss weights?"><BlockMath math={String.raw`\mathcal L_{\text{world}}=\mathcal L_{\text{next latent}}+2\mathcal L_{\text{reward}}+0.2\mathcal L_{\text{continuation}}+0.5\mathcal L_{\text{predicted frame}}`} /></summary>
        <div><p>The coefficients are manual balancing weights. Relative to next-latent loss, 2 increases the reward contribution, while 0.2 and 0.5 reduce the continuation and predicted-frame contributions. These were prototype settings, not values derived from Dreamer or established as optimal by a controlled comparison. The losses have different scales, so 2 does not mean reward is exactly twice as important.</p></div>
      </details>
    </section>
    <section id="first-behavior">
      <h4>Now, let the actor practise</h4>
      <p>I started with real history from replay. The actor chose an action, the frozen model predicted the next latent, reward, and continuation, and the actor chose again. I repeated this for five imagined actions.</p>
      <p>The critic estimated rewards beyond the five-step window. Assuming the episode continues, a simple return adds predicted rewards to that final estimate.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="How to read the imagined return"><BlockMath math={String.raw`G_0=\hat r_0+\gamma\hat r_1+\gamma^2\hat r_2+\gamma^3\hat r_3+\gamma^4\hat r_4+\gamma^5V(s_5)`} /></summary>
        <div><p>G₀ is the return target at the starting state. Each r̂ is a reward predicted by the world model. γ discounts rewards further into the future. V(s₅) is the critic’s estimate of rewards beyond the fifth imagined action, which keeps the rollout ending from being treated as the game ending. This simplified equation assumes the episode continues throughout.</p></div>
      </details>
      <p>The actual script used lambda returns, mixing the next critic estimate with the longer return. I used γ = 0.99 and λ = 0.95. Here s is the actor–critic input state.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="How to read the lambda return"><BlockMath math={String.raw`G_t^\lambda=\hat r_t+\gamma\hat c_t\left[(1-\lambda)V(s_{t+1})+\lambda G_{t+1}^\lambda\right],\qquad G_5^\lambda=V(s_5)`} /></summary>
        <div><p>Gₜ with the λ superscript is the return target at decision t. The next predicted reward is added to a mixture of the next critic estimate and the longer return. λ controls that mixture, γ discounts the future, and ĉₜ is the continuation probability. Work backward from G₅ = V(s₅). A continuation probability of zero removes future rewards after an ending.</p></div>
      </details>
      <p>Each decision got its own return target. I subtracted what the critic had expected to get the advantage. A positive advantage made the sampled action more likely, while a negative one made it less likely.</p>
      <details className="nano-expandable-equation">
        <summary aria-label="How to read the actor and critic losses"><BlockMath math={String.raw`A_t=\operatorname{sg}(G_t^\lambda-V(s_t)),\qquad \mathcal L_{\text{actor}}=-\mathbb E_t[\log\pi(a_t\mid s_t)A_t]`} /><BlockMath math={String.raw`\mathcal L_{\text{critic}}=\mathbb E_t[(V(s_t)-\operatorname{sg}(G_t^\lambda))^2]`} /></summary>
        <div><p>Aₜ is the advantage, the return minus what the critic expected. π(aₜ | sₜ) is the probability of the action the actor sampled in that state. Multiplying its negative log-probability by a positive advantage encourages that action, while a negative advantage discourages it. 𝔼 means average over sampled decisions. sg means stop-gradient, so the advantage is a fixed learning signal during this update.</p><p>V(sₜ) is the critic’s estimate and Gₜ with the λ superscript is the return target. Their squared difference measures the prediction error. 𝔼 averages it over sampled decisions. sg means stop-gradient, so the critic learns toward a fixed target rather than changing both sides of the comparison.</p></div>
      </details>
      <p>These are the core losses. An entropy bonus encouraged exploration. The targets were detached, and actor gradients flowed through action probabilities, not through the world model.</p>
      <p>But fitting imagined returns does not make them right. I later checked the critic against discounted returns from real gameplay.</p>
    </section>
  </div>;
}
