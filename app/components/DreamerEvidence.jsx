import data from "./dreamerEvidenceData.json";

function OracleTable({ rows, label }) {
  return <div className="dreamer-evidence-scroll"><table className="dreamer-evidence-table" aria-label={label}>
    <thead><tr><th scope="col">Game</th><th scope="col">Start</th><th scope="col">Model transitions</th><th scope="col">Real transitions</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.game}><th scope="row">{row.game}</th><td>{row.start.toFixed(2)}</td><td className="dreamer-score-worse">{row.model.toFixed(2)}</td><td className="dreamer-score-better">{row.real.toFixed(2)}</td></tr>)}</tbody>
  </table></div>;
}

export default function DreamerEvidence({ kind }) {
  if (kind === "timing") return <figure className="dreamer-evidence">
    <div className="dreamer-evidence-heading"><small>Measured diagnostic · earlier offline model</small><strong>Reward timing deteriorated as the model rolled forward</strong></div>
    <div className="dreamer-timing-bars" aria-label="Correctly timed Space Invaders reward events at prediction offsets one, three, five and eight">
      {data.timing.map(row => <div key={row.horizon}><span>Step {row.horizon}</span><div className="dreamer-timing-track"><div style={{width:`${100*row.hits/row.events}%`}} /></div><strong>{row.hits} / {row.events}</strong></div>)}
    </div>
    <figcaption>Correctly timed reward events in the saved Space Invaders same-action rollout diagnostic. Bars show hits / actual events, not gameplay score. Valid event counts differ by offset; overlapping contexts and a reward threshold make this a diagnostic, not a controlled horizon ablation. <a href="/project-assets/nanodreamer/evidence/reward-timing.json">Raw measurements ↗</a></figcaption>
  </figure>;
  return <figure className="dreamer-evidence">
    <div className="dreamer-evidence-heading"><small>Ten-step transition-provider comparison</small><strong>Same learning procedure. Different source of experience.</strong></div>
    <div className="dreamer-oracle-branches"><span>Learned model<br /><small>predicted states and rewards</small></span><span>Cloned real game<br /><small>actual states and rewards</small></span></div>
    <OracleTable rows={data.oracle.filter(row => row.seed === 0)} label="Training seed 0: control before and after learning with model or real transitions" />
    <details className="dreamer-seed-details"><summary>Show the second training seed</summary><OracleTable rows={data.oracle.filter(row => row.seed === 1)} label="Training seed 1: replication of the transition-provider comparison" /></details>
    <figcaption>Mean episode return over five fresh environment seeds × 100 games per checkpoint, with a 200-action cap. Space Invaders sampled actions; Breakout acted greedily. The two arms within each comparison shared starting components, rollout starts and update settings. These are warm-start diagnostic runs, not fresh-start or matched-budget comparisons with the final agent. Raw evaluations: <a href="/project-assets/nanodreamer/evidence/space_invaders-oracle-seed0.json">SI seed 0</a> · <a href="/project-assets/nanodreamer/evidence/breakout-oracle-seed0.json">BR seed 0</a> · <a href="/project-assets/nanodreamer/evidence/space_invaders-oracle-seed1.json">SI seed 1</a> · <a href="/project-assets/nanodreamer/evidence/breakout-oracle-seed1.json">BR seed 1</a></figcaption>
  </figure>;
}
