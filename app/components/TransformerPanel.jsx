const tokenRows = [
  { token: "T", id: 51, tokenVector: "[ .2, -.4, .1, .7 ]", positionVector: "[ .0, .1, .3, -.2 ]", result: "[ .2, -.3, .4, .5 ]" },
  { token: "o", id: 54, tokenVector: "[ -.1, .6, .2, .3 ]", positionVector: "[ .2, -.1, .0, .1 ]", result: "[ .1, .5, .2, .4 ]" },
  { token: "space", id: 1, tokenVector: "[ .3, .0, -.2, .4 ]", positionVector: "[ -.1, .2, .1, .0 ]", result: "[ .2, .2, -.1, .4 ]" },
  { token: "b", id: 40, tokenVector: "[ .5, .1, .4, -.3 ]", positionVector: "[ .1, .0, -.2, .2 ]", result: "[ .6, .1, .2, -.1 ]" },
  { token: "e", id: 43, tokenVector: "[ .0, .4, -.1, .5 ]", positionVector: "[ -.2, .1, .2, .1 ]", result: "[ -.2, .5, .1, .6 ]" },
];

export default function TransformerPanel({ title = "From one attention head to a transformer" } = {}) {
  return (
    <section className="article-section" aria-labelledby="attention-and-transformers">
      <h3 id="attention-and-transformers">{title}</h3>
      <p className="foundations-repo-link"><a href="https://github.com/benyebai/TinyTransformer" target="_blank" rel="noreferrer">TinyTransformer · View code on GitHub ↗</a></p>
      <p>One frame wasn&apos;t enough to tell me where something was going. I needed a way to read a sequence. Before putting a transformer into the game model, I built a character-level one, <a href="https://github.com/benyebai/TinyTransformer" target="_blank" rel="noreferrer">TinyTransformer</a>. It was easier to check what was happening when the inputs were letters.</p>
      <p>First, <code>To be</code> becomes token IDs, <code>[51, 54, 1, 40, 43]</code>. Each ID selects a row from a learned embedding table. It&apos;s a lookup, not a little network converting the number 51 into a vector. I added a learned position vector so the model could also tell where each character appeared.</p>

      <figure className="transformer-walkthrough">
        <div className="transformer-walkthrough-title">A toy 4-dimensional embedding of “To be”</div>
        <div className="transformer-table" role="table" aria-label="Token and position embeddings added together">
          <div className="transformer-table-row transformer-table-heading" role="row">
            <span role="columnheader">token / id</span>
            <span role="columnheader">token embedding</span>
            <span role="columnheader">position embedding</span>
            <span role="columnheader">starting vector</span>
          </div>
          {tokenRows.map((row) => (
            <div className="transformer-table-row" role="row" key={`${row.token}-${row.id}`}>
              <span role="cell"><strong>{row.token}</strong> <small>{row.id}</small></span>
              <span role="cell">{row.tokenVector}</span>
              <span role="cell">{row.positionVector}</span>
              <span role="cell">{row.result}</span>
            </div>
          ))}
        </div>
        <figcaption>The values are small illustrative vectors. During training, the embedding tables learn values that make next-character prediction easier.</figcaption>
      </figure>

      <p>Then came attention. Each vector goes through three linear projections to make a <strong>query</strong>, <strong>key</strong>, and <strong>value</strong>. I compare a position&apos;s query with the available keys. Softmax turns those scores into weights, and I use them to mix the value vectors. That&apos;s how an earlier character can affect the current prediction.</p>

      <div className="transformer-flow" aria-label="One attention head scores query against keys, masks the future, applies softmax, and mixes values">
        <span>embedded sequence</span>
        <span aria-hidden="true">→</span>
        <span>Q, K, V projections</span>
        <span aria-hidden="true">→</span>
        <span>QKᵀ / √head size</span>
        <span aria-hidden="true">→</span>
        <span>causal mask + softmax</span>
        <span aria-hidden="true">→</span>
        <span>weighted mix of V</span>
      </div>

      <p>There was one obvious way to cheat. During training, the full sequence is right there. So I masked future positions before softmax. The final <code>e</code> can read itself and the earlier characters; the first <code>T</code> can only read itself. Each position has to predict the next character without seeing it.</p>
      <p>I ran several attention heads in parallel, joined their outputs, and projected them back to the model width. With width 64 and four heads, each head handles 16 features. Joining them gives 64 again. I didn&apos;t assign the heads jobs. Their weights learned from the prediction loss.</p>

      <div className="transformer-heads" aria-label="Four attention heads are concatenated and projected">
        <div><span>head 1</span><span>head 2</span><span>head 3</span><span>head 4</span></div>
        <span aria-hidden="true">↓ concatenate ↓</span>
        <strong>output projection</strong>
      </div>

      <p>A full block adds two more pieces. LayerNorm keeps each token&apos;s features normalized, and a residual connection adds the input back to the layer&apos;s output. After attention, a small feed-forward network transforms each position separately. I repeated that block to build the transformer.</p>

      <div className="transformer-stack" aria-label="Complete character transformer pipeline">
        <span>token + position embeddings</span><span aria-hidden="true">↓</span>
        <span>LayerNorm → multi-head causal attention → residual</span><span aria-hidden="true">↓</span>
        <span>LayerNorm → feed-forward network → residual</span><span aria-hidden="true">↓ repeat the block</span>
        <span>final LayerNorm → vocabulary logits</span><span aria-hidden="true">↓</span>
        <span>one score for every possible next character</span>
      </div>

      <p>At the end, a linear layer gives one score per possible next character. Cross-entropy compares those scores with the actual next character, and my autograd engine carries the error back through the whole thing. Embeddings, attention, and feed-forward layers all learn together. For NanoDreamer, I reused the causal sequence idea with game latents and actions, then predicted states, rewards, and continuation instead of letters.</p>

      <details className="implementation-notes tensor-implementation-notes">
        <summary><span>The part that finally made attention click for me</span></summary>
        <div className="implementation-notes-body">
          <p>Attention does not directly “understand” a sentence. It calculates learned similarity scores. <code>Q @ K.T</code> says how relevant each available position is to the current one, softmax turns those scores into mixing percentages, and multiplying by <code>V</code> produces the actual information passed forward.</p>
          <p>The model dimension does not disappear when it is split across heads. With a model size of 64 and four heads, each head produces 16 features. Concatenating the four results gives 64 features again, so the residual connection can add the block&apos;s input back to its output.</p>
          <p>The full transformer is therefore less mysterious than it first appears: learned lookup tables, matrix multiplications, a future mask, softmax, residual additions, and ordinary feed-forward layers—repeated while autograd keeps track of every gradient.</p>
        </div>
      </details>
    </section>
  );
}
