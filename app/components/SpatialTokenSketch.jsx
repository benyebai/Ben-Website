const regions = ["A", "B", "C", "D"];

function Frame({ split }) {
  return <div className={`spatial-frame${split ? " is-split" : ""}`} aria-hidden="true">
    {regions.map((region, index) => <span key={region} style={{ "--region": index }}>{split ? region : ""}</span>)}
  </div>;
}

export default function SpatialTokenSketch() {
  return <figure className="spatial-token-sketch" aria-label="Before, each frame becomes one token. In the spatial version, each frame is split into four regions and becomes four tokens.">
    <div className="spatial-token-row">
      <div className="spatial-token-source"><small>before</small><Frame /></div>
      <span className="spatial-token-arrow" aria-hidden="true">→</span>
      <div className="spatial-token-sequence">{[1, 2, 3].map(frame => <div className="spatial-token-frame" key={frame}><small>frame {frame}</small><span className="spatial-whole-token">{frame}</span></div>)}</div>
    </div>
    <div className="spatial-token-row">
      <div className="spatial-token-source"><small>spatial</small><Frame split /></div>
      <span className="spatial-token-arrow" aria-hidden="true">→</span>
      <div className="spatial-token-sequence">{[1, 2, 3].map(frame => <div className="spatial-token-frame" key={frame}><small>frame {frame}</small><div className="spatial-region-tokens">{regions.map((region, index) => <span key={region} style={{ "--region": index }}>{frame}{region}</span>)}</div></div>)}</div>
    </div>
  </figure>;
}
