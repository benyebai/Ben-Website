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

export default function MiniNNPanel({ title = "From tensors to a neural-network framework" } = {}) {
  return (
    <section className="article-section" aria-labelledby="neural-networks-and-optimizers">
      <h3 id="neural-networks-and-optimizers">{title}</h3>
      <p className="foundations-repo-link"><a href="https://github.com/benyebai/MiniNN" target="_blank" rel="noreferrer">MiniNN · View code on GitHub ↗</a></p>
      <p>TensorGrad could tell me how to change a weight. Now I needed a way to organize a whole network without manually tracking every weight myself. So I built <a href="https://github.com/benyebai/MiniNN" target="_blank" rel="noreferrer">MiniNN</a>.</p>
      <p>The basic layer was <code>y = xW + b</code>. W and b are trainable tensors, which I called <code>Parameter</code>s. I wrapped the calculation in a <code>Module</code> so a layer knew how to run itself and return the parameters it owned.</p>

      <figure className="mininn-code-card">
        <div className="mininn-code-title">The Module base class</div>
        <pre><code>{highlightCode(moduleCode)}</code></pre>
        <figcaption>Every layer uses the same three entry points.</figcaption>
      </figure>

      <p>That&apos;s most of the base class! <code>__call__()</code> runs the calculation, <code>parameters()</code> finds the trainable tensors, and <code>zero_grad()</code> clears their previous gradients. I needed that last step because backward adds contributions. Forget to clear them and the next update includes the last batch too.</p>
      <p>I could then stack <code>Linear → activation → Linear</code> with <code>Sequential</code>. The activation matters. Without a nonlinearity between them, two linear layers still describe one linear transformation. Adding Tanh or SiLU lets the network learn more interesting functions.</p>

      <div className="mininn-stack" aria-label="TensorGrad provides tensors, MiniNN adds parameters and modules, which compose into a Linear, SiLU, Linear, Softmax model">
        <span>TensorGrad</span><span aria-hidden="true">↓</span>
        <span>Parameter</span><span aria-hidden="true">↓</span>
        <span>Module</span><span aria-hidden="true">↓</span>
        <span>Linear → SiLU → Linear → Softmax</span>
      </div>

      <p>The training loop finally came together. Predict, calculate a loss, clear the gradients, run backward, then update the weights. For basic gradient descent, the update is just <code>weight -= learning_rate × gradient</code>. Backprop calculates the direction of increasing loss, so we take a small step the other way.</p>
      <p>I tested MiniNN by training a small MNIST classifier: <code>784 inputs → 128 hidden features → 10 digit probabilities</code>. The network contained 101,770 trainable parameters and reached <strong>95.56% test accuracy after 30 epochs</strong>.</p>
      <p>Seeing that MNIST result was reassuring. These weren&apos;t just classes that looked like a framework anymore. The gradients and updates were actually training a network. I also built Adam, which tracks recent gradients and their scale to adapt each weight&apos;s update. The MNIST check above used SGD.</p>

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
