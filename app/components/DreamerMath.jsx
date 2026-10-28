import { BlockMath, InlineMath } from "react-katex";

export function WorldModelMath() {
  return (
    <aside className="dreamer-math" aria-label="World model training equations">
      <h5>What makes a predicted future useful?</h5>
      <p>The model has to get the state, picture, reward, and episode ending right. Each generated step gets this loss:</p>
      <BlockMath math={String.raw`\begin{aligned}\ell_k ={}& \underbrace{\operatorname{MSE}(\hat z_k,\operatorname{sg}(\bar E(x_k)))}_{\text{next latent}} + \underbrace{\operatorname{BCE}_{w}(D(\hat z_k),x_k)}_{\text{predicted frame}} \\ &+ 2\,\underbrace{\operatorname{CE}(q(r_k),p_\theta(r\mid h_{k-1},a_{k-1}))}_{\text{reward}} + 0.2\,\underbrace{\operatorname{BCE}(\hat c_k,c_k)}_{\text{continuation}}\end{aligned}`} />
      <p>Here <InlineMath math="x_k" /> is the real frame and <InlineMath math="\hat z_k" /> is the predicted latent. The target encoder <InlineMath math="\bar E" /> moves slowly; <InlineMath math="\operatorname{sg}" /> stops gradients through that target. The decoder <InlineMath math="D" /> checks what the predicted latent actually looks like. Weighted binary cross-entropy gives occupied and empty cells a balanced contribution per observation channel.</p>
      <BlockMath math={String.raw`\mathcal L_{\mathrm{world}} = \mathcal L_{\mathrm{reconstruction}} + \mathcal L_{\mathrm{one\text{-}step}} + \frac{1}{3}\sum_{k=1}^{3}\ell_k`} />
      <p>The three-step term feeds predictions back into the model. The one-step term also checks latent and decoded-frame predictions from real histories. These equations show the working version; the code additionally masks padding and weights sampled rollout examples.</p>
    </aside>
  );
}

export function BehaviorMath({ inline = false }) {
  const Container = inline ? "div" : "details";
  return (
    <Container className="implementation-notes dreamer-math-details">
      {!inline && <summary><span>The math behind imagined practice</span></summary>}
      <div className="implementation-notes-body dreamer-math">
        <h5>1. Count rewards beyond the last imagined frame</h5>
        <BlockMath math={String.raw`\begin{aligned}G_t^\lambda &= \hat r_t + \gamma\hat c_t\big[(1-\lambda)\bar V(h_{t+1})+\lambda G_{t+1}^\lambda\big] \\ G_H^\lambda &= \bar V(h_H),\qquad H=5\end{aligned}`} />
        <p>Work backward through five imagined actions. The predicted reward is <InlineMath math="\hat r_t" />; continuation probability <InlineMath math="\hat c_t" /> reduces future value when the episode may end. The target critic <InlineMath math="\bar V" /> estimates what comes after the rollout. The working defaults are <InlineMath math="\gamma=0.99" /> and <InlineMath math="\lambda=0.95" />. Lambda mixes the next critic estimate with the longer return.</p>
        <h5>2. Make better-than-expected actions more likely</h5>
        <BlockMath math={String.raw`\begin{aligned}A_t &= \operatorname{sg}\!\left(\frac{G_t^\lambda-V(h_t)}{\max(1,S)}\right) \\ \mathcal L_{\mathrm{actor}} &= -\mathbb E_t\!\left[w_t\left(A_t\log\pi(a_t\mid h_t)+10^{-3}\mathcal H(\pi(\cdot\mid h_t))\right)\right]\end{aligned}`} />
        <p>A positive advantage <InlineMath math="A_t" /> raises the probability of the sampled action; a negative one lowers it. <InlineMath math="S" /> is a running return scale. Entropy <InlineMath math="\mathcal H" /> encourages exploration, and <InlineMath math="w_t=\prod_{j<t}(\gamma\hat c_j)" /> discounts later imagined states. Gradients update the actor through its action log-probabilities; they do not pass through the world model.</p>
        <h5>3. Ground the critic in real experience</h5>
        <BlockMath math={String.raw`\begin{aligned}\mathcal L_{\text{critic}} ={}& \mathbb E_{\mathrm{replay}}\!\left[\omega\,\operatorname{CE}(q(G_{\mathrm{real}}^\lambda),p_V(\cdot\mid h))\right] \\ &+0.3\,\mathbb E_{\mathrm{imagined}}\!\left[w_t\operatorname{CE}(q(G_t^\lambda),p_V(\cdot\mid h_t))\right]\end{aligned}`} />
        <p>The critic predicts a distribution over value bins. Cross-entropy trains it against real replay returns, plus a smaller imagined-return loss. <InlineMath math="\omega" /> is the replay importance weight. Both reward and value targets use <InlineMath math="q" />, a two-hot target: apply <InlineMath math="\operatorname{symlog}(u)=\operatorname{sign}(u)\log(1+|u|)" />, then split the target between neighboring bins. All return targets are detached during actor and critic updates.</p>
      </div>
    </Container>
  );
}
