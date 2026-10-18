"use client";

import { useState } from "react";

const stages = ["Matrix multiply", "Tensor gradients", "Broadcasting"];

function Matrix({ label, shape, rows, className = "" }) {
  return (
    <div className={`matrix-demo-matrix ${className}`}>
      <span className="matrix-demo-label">{label} <small>{shape}</small></span>
      <div className="matrix-demo-bracket">
        {rows.map((row, rowIndex) => (
          <div className={`matrix-demo-row matrix-demo-row-${rowIndex + 1}`} key={rowIndex}>
            {row.map((value, columnIndex) => <span key={columnIndex}>{value}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatrixDemo({ stage, broadcastDimension }) {
  if (stage === 0) {
    return (
      <div className="matrix-demo-multiply">
        <div className="matrix-demo-equation">
          <Matrix label="X" shape="2 × 2" rows={[[1, 2], [3, 4]]} className="matrix-demo-input" />
          <span className="matrix-demo-operator">@</span>
          <Matrix label="W" shape="2 × 2" rows={[[2, 3], [-1, 4]]} className="matrix-demo-weight" />
          <span className="matrix-demo-operator">=</span>
          <Matrix label="Y" shape="2 × 2" rows={[[0, 11], [2, 25]]} className="matrix-demo-output" />
        </div>
        <div className="matrix-demo-multiply-calculation" aria-hidden="true">
          <span>row 1 · column 1 → 0</span>
          <span>row 1 · column 2 → 11</span>
          <span>row 2 · column 1 → 2</span>
          <span>row 2 · column 2 → 25</span>
        </div>
      </div>
    );
  }

  if (stage === 1) {
    return (
      <div className="matrix-demo-backward">
        <div className="matrix-demo-equation matrix-demo-backward-forward">
          <Matrix label="X" shape="2 × 2" rows={[[1, 2], [3, 4]]} className="matrix-demo-back-xdata" />
          <span className="matrix-demo-operator">@</span>
          <Matrix label="W" shape="2 × 2" rows={[[2, 3], [-1, 4]]} className="matrix-demo-back-wdata" />
          <span className="matrix-demo-operator">=</span>
          <Matrix label="Y" shape="2 × 2" rows={[[0, 11], [2, 25]]} className="matrix-demo-back-ydata" />
        </div>
        <div className="matrix-demo-backward-route" aria-hidden="true">
          <svg viewBox="0 0 540 50" preserveAspectRatio="none">
            <defs>
              <marker id="matrix-gradient-arrow-muted" viewBox="0 0 6 6" refX="3" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 3 5 L 6 0" fill="none" stroke="#b9c0b8" /></marker>
              <marker id="matrix-gradient-arrow-active" viewBox="0 0 6 6" refX="3" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 3 5 L 6 0" fill="none" stroke="#64846c" /></marker>
            </defs>
            <path d="M 450 48 V 8 H 90 V 45" markerEnd="url(#matrix-gradient-arrow-muted)" />
            <path d="M 450 48 V 23 H 270 V 45" markerEnd="url(#matrix-gradient-arrow-muted)" />
            <path className="matrix-demo-flow-x" d="M 450 48 V 8 H 90 V 45" />
            <path className="matrix-demo-flow-w" d="M 450 48 V 23 H 270 V 45" />
          </svg>
        </div>
        <div className="matrix-demo-backward-grads">
          <div className="matrix-demo-gradient-branch matrix-demo-gradient-branch-x">
            <Matrix label="X.grad" shape="2 × 2" rows={[[5, 3], [5, 3]]} className="matrix-demo-back-xgrad" />
            <span className="matrix-demo-branch-rule">G @ W.T</span>
          </div>
          <div className="matrix-demo-gradient-branch matrix-demo-gradient-branch-w">
            <Matrix label="W.grad" shape="2 × 2" rows={[[4, 4], [6, 6]]} className="matrix-demo-back-wgrad" />
            <span className="matrix-demo-branch-rule">X.T @ G</span>
          </div>
          <div className="matrix-demo-gradient-branch matrix-demo-gradient-branch-y">
            <Matrix label="Y.grad = G" shape="2 × 2" rows={[[1, 1], [1, 1]]} className="matrix-demo-back-g" />
            <span className="matrix-demo-branch-rule">start here</span>
          </div>
        </div>
      </div>
    );
  }

  if (broadcastDimension === 2) {
    return (
      <div className="matrix-demo-broadcast">
        <Matrix label="b" shape="1 × 2" rows={[[10, 20]]} />
        <span className="matrix-demo-broadcast-arrow" aria-hidden="true">→</span>
        <Matrix label="repeat for each row" shape="2 × 2" rows={[[10, 20], [10, 20]]} className="matrix-demo-copied-rows" />
        <span className="matrix-demo-broadcast-arrow" aria-hidden="true">→</span>
        <Matrix label="X + b" shape="2 × 2" rows={[[11, 22], [13, 24]]} />
      </div>
    );
  }

  return (
    <div className="matrix-demo-broadcast matrix-demo-broadcast-3d">
      <Matrix label="b" shape="2 × 2" rows={[[10, 20], [30, 40]]} />
      <span className="matrix-demo-broadcast-arrow" aria-hidden="true">→</span>
      <div className="matrix-demo-3d-visual" role="img" aria-label="The 2 by 2 matrix b appears on two tilted planes, one behind the other along the batch axis">
        <span className="matrix-demo-3d-heading">same matrix on each slice</span>
        <div className="matrix-demo-3d-scene">
          <div className="matrix-demo-3d-stack">
            <div className="matrix-demo-3d-plane matrix-demo-3d-plane-back"><span>10</span><span>20</span><span>30</span><span>40</span></div>
            <div className="matrix-demo-3d-plane matrix-demo-3d-plane-front"><span>10</span><span>20</span><span>30</span><span>40</span></div>
          </div>
          <span className="matrix-demo-3d-axis">batch / z ↑</span>
        </div>
        <span className="matrix-demo-3d-shape">shape 2 × 2 × 2</span>
      </div>
    </div>
  );
}

export default function MatrixAutogradPanel() {
  const [stage, setStage] = useState(0);
  const [broadcastDimension, setBroadcastDimension] = useState(2);

  return (
    <section className="article-section" aria-labelledby="matrix-autograd-title">
      <h3 id="matrix-autograd-title">From one number to a whole tensor</h3>
      <p>The scalar engine worked, but neural networks do not process one number at a time. An image is an array of pixels, a layer contains a matrix of weights, and training usually processes many examples in one batch. So the next step was TensorGrad.</p>
      <p>Instead of storing one number, each <code>Tensor</code> stores a NumPy array, a gradient array of the same shape, its parents in the computation graph, and a local backward function. A whole matrix multiplication can now be represented by one node instead of creating a separate node for every number.</p>
      <p>The important part is that the calculus did not change. We still take the incoming gradient, multiply it by the local derivative, and accumulate the result into each parent. The difficult part was making sure every gradient returned with the correct shape.</p>
      <p>For matrix multiplication, <code>Y = XW</code>, the backward pass is <code>X.grad += Y.grad @ W.T</code> and <code>W.grad += X.T @ Y.grad</code>. The transposes line up the dimensions so that <code>X.grad</code> has the same shape as X and <code>W.grad</code> has the same shape as W.</p>

      <figure className="matrix-demo" aria-label="Matrix multiplication, tensor gradients, and broadcasting">
        <div className="matrix-demo-title">From matrices to tensors</div>
        {stage === 2 && <div className="matrix-demo-dimensions" aria-label="Broadcasting dimensions">
          <button type="button" className={broadcastDimension === 2 ? "is-current" : ""} aria-pressed={broadcastDimension === 2} onClick={() => setBroadcastDimension(2)}>2D: across rows</button>
          <button type="button" className={broadcastDimension === 3 ? "is-current" : ""} aria-pressed={broadcastDimension === 3} onClick={() => setBroadcastDimension(3)}>3D: across slices</button>
        </div>}
        <div className="matrix-demo-stage" key={`${stage}-${broadcastDimension}`}><MatrixDemo stage={stage} broadcastDimension={broadcastDimension} /></div>
        <div className="matrix-demo-tabs" aria-label="Choose a matrix operation">
          {stages.map((title, index) => (
            <button key={title} type="button" className={stage === index ? "is-current" : ""} aria-current={stage === index ? "step" : undefined} onClick={() => setStage(index)}>{title}</button>
          ))}
        </div>
        <figcaption aria-live="polite">
          {stage === 0 && <>Each value in Y comes from one row of X and one column of W. For example, the top right value is <code>1 × 3 + 2 × 4 = 11</code>. The animation traces all four row and column pairs.</>}
          {stage === 1 && <>Start at <code>Y.grad</code>: each output gets 1 because the loss is the sum of Y. Then follow the green path back. For <code>X.grad[0,0]</code>, add <code>1 × 2 + 1 × 3 = 5</code>. For <code>W.grad[0,0]</code>, add <code>1 × 1 + 3 × 1 = 4</code>. The same pattern fills the rest of each gradient matrix.</>}
          {stage === 2 && broadcastDimension === 2 && <>Start in 2D: <code>X</code> has two rows, and <code>b</code> has one. Broadcasting uses the same row of <code>b</code> for both rows of <code>X</code>. Backward adds the gradients from both rows back into that one row of <code>b.grad</code>.</>}
          {stage === 2 && broadcastDimension === 3 && <>Now add a batch dimension. <code>X</code> has two matrix slices, and the same <code>2 × 2</code> bias is used in each slice. Backward adds the gradients from both slices into the original <code>2 × 2</code> <code>b.grad</code>. Same idea, one more axis.</>}
        </figcaption>
      </figure>

      <p>Once this worked, the same engine could differentiate through elementwise arithmetic, reductions, reshaping, slicing, batched matrix multiplication, sigmoid, SiLU, softmax, and logsumexp.</p>
      <p>The biggest thing I learned was that tensor autograd is not a completely different version of backpropagation. The chain rule stays surprisingly small. Most of the difficulty comes from tracking what each axis means while tensors are broadcast, reduced, transposed, or batched.</p>
      <p>To make sure my backward functions were actually correct, I compared them against numerical gradients. I then used TensorGrad to recover the hidden equation <code>y = 2x₁ - 3x₂ + 1</code> from 32 examples using gradient descent. The final weights converged to approximately 2, -3, and a bias of 1.</p>

      <details className="implementation-notes tensor-implementation-notes">
        <summary><span>The implementation details that tripped me up</span></summary>
        <div className="implementation-notes-body">
          <h4>Broadcasting gradients</h4>
          <p>Consider adding one bias vector to every row of a matrix: the matrix has shape <code>(32, 3)</code>, the bias has shape <code>(3,)</code>, and the result has shape <code>(32, 3)</code>. NumPy reuses the same three bias values across all 32 rows. During backward, the result gradient is also <code>(32, 3)</code>, but the bias gradient must return to <code>(3,)</code>.</p>
          <p>That means adding together the gradient contribution from every row: <code>(32, 3) → sum across rows → (3,)</code>. I wrote <code>sum_to_shape</code> for this. It sums extra leading axes and any axis where the original input had size 1. If broadcasting reuses one value in multiple places, backward adds the gradient contributions from all those places.</p>

          <h4>Reductions go in the opposite direction</h4>
          <p>A sum removes dimensions during the forward pass. Backward has to restore them. For an input of shape <code>(2, 3, 4)</code>, <code>sum(axis=1)</code> gives <code>(2, 4)</code>. Backward restores the removed axis as <code>(2, 1, 4)</code>, then broadcasts the gradient back to <code>(2, 3, 4)</code>. Each output gradient is copied across the input values that contributed to its sum.</p>
          <p>Broadcasting expands values forward and sums gradients backward. A reduction sums values forward and expands gradients backward.</p>

          <h4>Vectors made matrix multiplication awkward</h4>
          <p>The usual matrix derivatives are <code>dX = G @ W.T</code> and <code>dW = X.T @ G</code>. But NumPy also supports vector–vector, matrix–vector, vector–matrix, and batched matrix multiplication. A one-dimensional vector has shape <code>(k,)</code>, so it has no row and column axes to transpose.</p>
          <p>NumPy effectively treats a vector on the left as a row <code>(1, k)</code> and a vector on the right as a column <code>(k, 1)</code>. TensorGrad temporarily restores those dimensions during backward, applies the matrix formulas, and then removes the temporary axes. For batched matrices, only the final two axes are matrix dimensions. I had to swap those two while preserving the batch dimensions.</p>

          <h4>Stable softmax and logsumexp</h4>
          <p>The direct expression <code>log(Σ exp(xᵢ))</code> can overflow when an input is large. The stable version subtracts the maximum first: <code>m + log(Σ exp(xᵢ - m))</code>, where <code>m = max(xᵢ)</code>. It gives the same answer without trying to calculate something like <code>exp(1000)</code>.</p>
          <p>The derivative of logsumexp is softmax: <code>∂ logsumexp(x) / ∂xᵢ = exp(xᵢ) / Σ exp(xⱼ)</code>. That was an interesting connection: a numerical stability operation and a probability distribution came from the same expression.</p>

          <h4>Checking the gradients numerically</h4>
          <p>A backward function can look correct and still have a subtle broadcasting or axis mistake. For every input element, I estimated the derivative with <code>(f(x + ε) - f(x - ε)) / (2ε)</code>, then compared it with TensorGrad&apos;s backward result.</p>
          <p>These checks covered broadcasting, reductions, slicing, nonlinearities, shape operations, and batched matrix multiplication. They were slow, but gave me much more confidence than checking only a few derivatives by hand.</p>
        </div>
      </details>
    </section>
  );
}
