"use client";
export default function MatrixAutogradPanel({title="Autograd and tensors"}={}) {
 return <section className="article-section" aria-labelledby="autograd-and-tensors">
  <h3 id="autograd-and-tensors">{title}</h3>
      <p className="foundations-repo-link"><a href="https://github.com/benyebai/TensorGrad" target="_blank" rel="noreferrer">TensorGrad · View code on GitHub ↗</a></p>
  <p>The scalar engine worked! But a network processes whole arrays of numbers. I didn&apos;t want to create a separate Python object for every pixel and multiplication, so the next step was <a href="https://github.com/benyebai/TensorGrad" target="_blank" rel="noreferrer">TensorGrad</a>.</p>
  <p>A tensor is an array. Mine stored its values, a gradient array of the same shape, and a backward function. NumPy handled the array calculations; I wrote the rules for passing gradients back.</p>
  <p>The calculus was the same, but now each operation handled a whole matrix.</p>
  <p>That carries over to a full layer. Matrix multiplication uses each weight across multiple examples, so backward adds those contributions into its gradient. Broadcasting does the same with a shared bias. Reuse a value going forward, add its contributions going backward.</p>
  <details className="implementation-notes"><summary>How that becomes matrix operations</summary><div className="implementation-notes-body"><p>For <code>Y = X @ W</code>, let <code>G</code> be the gradient arriving at Y. The backward rules are <code>X.grad += G @ W.T</code> and <code>W.grad += X.T @ G</code>. The transposes arrange the rows and columns so the right contributions get added together.</p><p>If a bias is reused across a batch, its gradient must add the contributions from each example. I wrote <code>sum_to_shape</code> to reduce the gradient back to the original input shape.</p></div></details>
  <p>I checked the backward rules against small numerical changes to the inputs. Then I used TensorGrad to recover <code>y = 2x₁ − 3x₂ + 1</code> from 32 examples. The learned weights came close to 2, −3, and 1. Now I could start building actual networks.</p>
 </section>;
}
