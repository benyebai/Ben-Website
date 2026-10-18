const tokenRows = [
  { token: "T", id: 51, tokenVector: "[ .2, -.4, .1, .7 ]", positionVector: "[ .0, .1, .3, -.2 ]", result: "[ .2, -.3, .4, .5 ]" },
  { token: "o", id: 54, tokenVector: "[ -.1, .6, .2, .3 ]", positionVector: "[ .2, -.1, .0, .1 ]", result: "[ .1, .5, .2, .4 ]" },
  { token: "space", id: 1, tokenVector: "[ .3, .0, -.2, .4 ]", positionVector: "[ -.1, .2, .1, .0 ]", result: "[ .2, .2, -.1, .4 ]" },
  { token: "b", id: 40, tokenVector: "[ .5, .1, .4, -.3 ]", positionVector: "[ .1, .0, -.2, .2 ]", result: "[ .6, .1, .2, -.1 ]" },
  { token: "e", id: 43, tokenVector: "[ .0, .4, -.1, .5 ]", positionVector: "[ -.2, .1, .2, .1 ]", result: "[ -.2, .5, .1, .6 ]" },
];

export default function TransformerPanel() {
  return (
    <section className="article-section" aria-labelledby="transformer-title">
      <h3 id="transformer-title">From one attention head to a transformer</h3>
      <p>A transformer starts with a sequence, but it cannot work directly with text. My model is character-level, so the sentence fragment <code>To be</code> first becomes five token IDs: <code>[51, 54, 1, 40, 43]</code>. Each ID selects one learned row from an embedding table.</p>
      <p>The token embedding says <em>what</em> the character is. A second learned embedding says <em>where</em> it appears. Adding them gives every character one starting vector containing both identity and position.</p>

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

      <p>Those starting vectors enter one causal attention head. The head makes three learned versions of every vector: a <strong>query</strong> describing what this position is looking for, a <strong>key</strong> describing what each earlier position offers, and a <strong>value</strong> containing the information that can be passed forward.</p>

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

      <p>For the final <code>e</code>, attention can look back at <code>T</code>, <code>o</code>, the space, and <code>b</code>. For the first <code>T</code>, every later position is masked. That single rule is what prevents the model from cheating during next-token training.</p>
      <p>One head produces one way of relating the sequence. Multi-head attention runs several independent heads in parallel, concatenates their outputs, and applies one final linear projection. The heads are not assigned jobs by hand; training lets them discover different useful relationships.</p>

      <div className="transformer-heads" aria-label="Four attention heads are concatenated and projected">
        <div><span>head 1</span><span>head 2</span><span>head 3</span><span>head 4</span></div>
        <span aria-hidden="true">↓ concatenate ↓</span>
        <strong>output projection</strong>
      </div>

      <p>A transformer block wraps that multi-head attention with LayerNorm and a residual connection, then does the same around a small feed-forward network. Attention moves information between positions; the feed-forward network transforms the information inside each position.</p>

      <div className="transformer-stack" aria-label="Complete character transformer pipeline">
        <span>token + position embeddings</span><span aria-hidden="true">↓</span>
        <span>LayerNorm → multi-head causal attention → residual</span><span aria-hidden="true">↓</span>
        <span>LayerNorm → feed-forward network → residual</span><span aria-hidden="true">↓ repeat the block</span>
        <span>final LayerNorm → vocabulary logits</span><span aria-hidden="true">↓</span>
        <span>one score for every possible next character</span>
      </div>

      <p>Stacking blocks lets later layers reason over representations that earlier layers already contextualized. The final linear layer turns each position back into one score per vocabulary character. Cross-entropy raises the score of the correct next character, backpropagation carries that correction through every block, and the embedding, attention, and feed-forward weights all learn together.</p>

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
