const moduleCode = `from tensorgrad import Tensor

from mininn.parameter import Parameter


class Module:
    def __call__(self, inputs: Tensor) -> Tensor:
        raise NotImplementedError("Must implement __call__ function")

    def parameters(self) -> list[Parameter]:
        return []

    def zero_grad(self) -> None:
        for parameter in self.parameters():
            parameter.grad[...] = 0.0`;

const codeTokens = /("(?:[^"\\]|\\.)*"|\b(?:from|import|class|def|for|in|return|raise)\b|\b(?:Tensor|Parameter|Module|NotImplementedError|list|None)\b|\b(?:__call__|parameters|zero_grad)\b|\b\d+(?:\.\d+)?\b)/g;

function highlightCode(source) {
  return source.split(codeTokens).map((part, index) => {
    if (part.startsWith('"')) return <span className="code-string" key={index}>{part}</span>;
    if (/^(from|import|class|def|for|in|return|raise)$/.test(part)) return <span className="code-keyword" key={index}>{part}</span>;
    if (/^(Tensor|Parameter|Module|NotImplementedError|list|None)$/.test(part)) return <span className="code-type" key={index}>{part}</span>;
    if (/^(__call__|parameters|zero_grad)$/.test(part)) return <span className="code-function" key={index}>{part}</span>;
    if (/^\d/.test(part)) return <span className="code-number" key={index}>{part}</span>;
    return part;
  });
}

export default function MiniNNPanel() {
  return (
    <section className="article-section" aria-labelledby="mininn-title">
      <h3 id="mininn-title">From tensors to a neural-network framework</h3>
      <p>TensorGrad could calculate gradients, but it did not yet provide a convenient way to build and train models. MiniNN added the abstractions that turn an autodiff engine into a small machine-learning framework.</p>
      <p>A <code>Parameter</code> is a Tensor marked as trainable. A <code>Module</code> owns parameters and performs a computation. Linear layers, activation functions, and entire models all follow the same interface, so they can be composed with <code>Sequential</code>.</p>

      <figure className="mininn-code-card">
        <div className="mininn-code-title">The Module base class</div>
        <pre><code>{highlightCode(moduleCode)}</code></pre>
        <figcaption>Every layer uses the same three entry points.</figcaption>
      </figure>

      <p>This small class is what made the rest of MiniNN click for me. <code>__call__()</code> says how a module transforms its input. <code>parameters()</code> tells the optimizer which tensors it can train. <code>zero_grad()</code> clears their old gradients before the next backward pass.</p>
      <p>The building blocks are modules too: <code>Linear</code> owns weights and a bias, while <code>SiLU</code> has no parameters and just transforms its input. <code>Sequential</code> is a module that calls other modules in order and gathers their parameters. That means a whole model can be used just like one layer.</p>

      <div className="mininn-stack" aria-label="TensorGrad provides tensors, MiniNN adds parameters and modules, which compose into a Linear, SiLU, Linear, Softmax model">
        <span>TensorGrad</span><span aria-hidden="true">↓</span>
        <span>Parameter</span><span aria-hidden="true">↓</span>
        <span>Module</span><span aria-hidden="true">↓</span>
        <span>Linear → SiLU → Linear → Softmax</span>
      </div>

      <p>The optimizer receives references to the model&apos;s parameters. Backpropagation writes gradients into those parameters, and the optimizer uses the gradients to update their values. Because everything references the same objects, the model automatically uses the updated weights on its next forward pass.</p>
      <p>I tested MiniNN by training a small MNIST classifier: <code>784 inputs → 128 hidden features → 10 digit probabilities</code>. The network contained 101,770 trainable parameters and reached <strong>95.56% test accuracy after 30 epochs</strong>.</p>
      <p>What interested me most was how a few abstractions separated responsibilities cleanly. TensorGrad handled calculus. Modules organized computations. Parameters identified trainable state. The optimizer handled learning. None of these pieces knew much about the others, but together they formed a complete training system.</p>

      <details className="implementation-notes tensor-implementation-notes">
        <summary><span>The technical details I found interesting</span></summary>
        <div className="implementation-notes-body">
          <h4>How the initial parameter values are chosen</h4>
          <p>Neural-network weights cannot all begin at zero. If every neuron starts identically, it receives the same gradient and continues learning the same thing. The weights therefore begin with different random values. Their scale also matters: values that are too large can cause activations and gradients to explode, while values that are too small can make them disappear.</p>
          <p>MiniNN used Xavier initialization: <code>limit = √(6 / (input features + output features))</code>. Weights were sampled uniformly between <code>-limit</code> and <code>limit</code>, while biases started at zero. This helps keep the scale of values reasonably stable as they move through the network.</p>

          <h4>What the optimizer actually does</h4>
          <p>Backpropagation does not update the model. It only calculates gradients. SGD performs the update: <code>parameter = parameter - learning rate × gradient</code>. The gradient points toward increasing loss, so subtracting it moves the parameter in the opposite direction.</p>
          <p>MiniNN used SGD for the MNIST experiment. It also implements Adam, which tracks a moving average of gradients (<code>m</code>) and squared gradients (<code>v</code>). The first estimates direction; the second tracks recent gradient scale. Adam uses both to adapt each parameter&apos;s update. The MNIST model did not need Adam, but I implemented and tested it separately.</p>

          <h4>Why references matter</h4>
          <p>The model and optimizer hold references to the same <code>Parameter</code> objects. <code>loss.backward()</code> writes <code>parameter.grad</code>; <code>optimizer.step()</code> reads it and updates <code>parameter.data</code>. No weights are copied back into the model. Updating the optimizer&apos;s parameter changes the model&apos;s parameter because they are the same object.</p>
        </div>
      </details>
    </section>
  );
}
