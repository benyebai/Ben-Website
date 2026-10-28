"use client";
import { useState } from "react";
import data from "./dreamerAblationData.json";
const variants = [
  ["full", "Full recipe"],
  ["imagined_critic", "Imagination-only critic"],
];
const games = [["space_invaders", "Space Invaders", 20], ["breakout", "Breakout", 6]];
export default function DreamerAblationComparison() {
  const [selected, setSelected] = useState(null);
  return <figure className="nano-ablation-comparison">
    <div className="nano-ablation-key"><span>150k policy steps</span><span><i className="nano-seed-dot" /> Seed 0 <i className="nano-seed-dot filled" /> Seed 1</span></div>
    <div className="nano-ablation-panels">{games.map(([game, title, maximum]) => <div key={game}>
      <h4>{title}</h4>
      <svg viewBox="0 0 310 157" role="img" aria-label={`${title}, mean game scores at 150,000 policy steps. Hollow dots are training seed zero, filled dots seed one.`}>
        {[0, maximum/2, maximum].map(tick => <g key={tick}><line x1={20+tick/maximum*264} x2={20+tick/maximum*264} y1="28" y2="127" stroke="#dedfd7" strokeDasharray="2 4" /><text x={20+tick/maximum*264} y="147" textAnchor="middle" fill="#777d70" fontSize="11">{tick}</text></g>)}
        {variants.map(([variant,label], index) => {
          const points = data.rows.filter(row => row.game===game && row.variant===variant);
          const y=43+index*65;
          return <g key={variant}><text x="2" y={y-19} fontSize="11" fill="#535a4c">{label}</text><line x1="20" x2="284" y1={y} y2={y} stroke="#e4e5de" />
            {points.map(row => <g key={row.seed} tabIndex={0} role="button" aria-label={`${title}, ${label}, seed ${row.seed}, score ${row.score.toFixed(2)}`} onMouseEnter={()=>setSelected({...row,title,label})} onMouseLeave={()=>setSelected(null)} onFocus={()=>setSelected({...row,title,label})} onBlur={()=>setSelected(null)} onClick={()=>setSelected({...row,title,label})} className="nano-ablation-point">
              <title>{`${label} · seed ${row.seed} · ${row.score.toFixed(2)} points`}</title>
              <circle cx={20+row.score/maximum*264} cy={y} r="12" fill="transparent" />
              <circle cx={20+row.score/maximum*264} cy={y} r="5" fill={row.seed===0?'#fafbf6':'#526e49'} stroke="#526e49" strokeWidth="1.8" />
            </g>)}
          </g>;
        })}
      </svg>
    </div>)}</div>
    <div className="nano-ablation-readout" aria-live="polite">{selected ? `${selected.title} · ${selected.label} · seed ${selected.seed} · ${selected.score.toFixed(2)} points` : 'Hover or tap a dot to see its score'}</div>
  </figure>;
}

function score(game, variant, seed) {
  return data.rows.find(row => row.game===game && row.variant===variant && row.seed===seed)?.score.toFixed(2) ?? "—";
}
function ComparisonTable({ columns, seed, label }) {
  return <figure className="nano-training-choice-table"><div className="dreamer-evidence-scroll"><table className="dreamer-evidence-table" aria-label={label}>
    <thead><tr><th scope="col">Game</th>{columns.map(([variant, title])=><th scope="col" key={variant}>{title}</th>)}</tr></thead>
    <tbody>{games.map(([game, title])=><tr key={game}><th scope="row">{title}</th>{columns.map(([variant])=><td key={variant}>{score(game,variant,seed)}</td>)}</tr>)}</tbody>
  </table></div></figure>;
}
export function EncoderComparison() {
  return <ComparisonTable seed={0} label="Encoder supervision comparison at 150k steps, training seed 0" columns={[["full","Joint encoder"],["no_joint_encoder","Reconstruction only"]]} />;
}
export function CombinedComparison() {
  return <ComparisonTable seed={1} label="Combined training changes at 150k steps, training seed 1" columns={[["full","Full recipe"],["imagined_critic","Imagined critic"],["imagined_critic_reconstruction_encoder","+ Reconstruction encoder"]]} />;
}
