import data from "./dreamerEvidenceData.json";

function OracleTable({ rows, label }) {
  const change = value => `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(2)}`;
  return <div className="dreamer-evidence-scroll"><table className="dreamer-evidence-table dreamer-oracle-table" aria-label={label}>
    <thead><tr><th scope="col">Game</th><th scope="col">Learn in model</th><th scope="col">Learn in game</th></tr></thead>
    <tbody>{rows.map(row => <tr key={row.game}><th scope="row">{row.game}</th><td className="dreamer-score-worse">{change(row.model - row.start)}</td><td className="dreamer-score-better">{change(row.real - row.start)}</td></tr>)}</tbody>
  </table></div>;
}

export default function DreamerEvidence({ kind }) {
  if (kind === "timing") return <figure className="dreamer-evidence dreamer-timing-minimal">
    <div className="dreamer-timing-bars" aria-label="Correctly timed Space Invaders reward events at prediction offsets one, three, five and eight">
      {data.timing.map(row => <div key={row.horizon}><span>Step {row.horizon}</span><div className="dreamer-timing-track"><div style={{width:`${100*row.hits/row.events}%`}} /></div><strong>{Math.round(100*row.hits/row.events)}% <span>{row.hits}/{row.events}</span></strong></div>)}
    </div>

  </figure>;
  return <figure className="dreamer-evidence dreamer-oracle-compact">
    <OracleTable rows={data.oracle.filter(row => row.seed === 0)} label="Change in mean game score after learning with model or real transitions, training seed 0" />


  </figure>;
}
