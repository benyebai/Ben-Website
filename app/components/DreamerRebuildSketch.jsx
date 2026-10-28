function PixelStrip() {
  return <svg viewBox="0 0 144 30" aria-hidden="true">{Array.from({length:12},(_,i)=><rect key={i} x={2+i*11} y="8" width="9" height="14" fill={i%4===1?'#a8b39e':'#eef0e8'} stroke="#a5aa9f" strokeWidth=".7" />)}</svg>;
}
function SharedFilter() {
  return <svg viewBox="0 0 144 30" aria-hidden="true">{[2,76].map((x,i)=><g key={x}>{Array.from({length:25},(_,j)=><rect key={j} x={x+(j%5)*5} y={2+Math.floor(j/5)*5} width="5" height="5" fill={j===7||j===17?'#a8b39e':'#f6f7f2'} stroke="#c5cabc" strokeWidth=".5" />)}<rect className={`nano-filter-window nano-filter-window-${i}`} x={x+(i?10:0)} y="7" width="15" height="15" fill="#59784c18" stroke="#59784c" strokeWidth="1.5" /></g>)}<path d="M35 15H63m-4-3 4 3-4 3" fill="none" stroke="#8b9482" /></svg>;
}
function Rollout({full=false}) {
  const count=full?4:2;
  return <svg viewBox="0 0 144 30" aria-hidden="true">{Array.from({length:count},(_,i)=><g key={i}>{i>0&&<path d={`M${(i-1)*35+25} 15h8m-3-3 3 3-3 3`} fill="none" stroke="#8b9482" />}<rect x={i*35+2} y="5" width="22" height="20" fill={i?'#e4ecde':'#f1f3ec'} stroke={i?'#829873':'#a5aa9f'} /><text x={i*35+13} y="19" textAnchor="middle" fontSize="10" fill="#59674f">{i?`ẑ${i}`:'z'}</text></g>)}</svg>;
}
export default function DreamerRebuildSketch() {
  const steps = [
    {
      title: "Read the screen with shared filters.",
      description: "A projectile could appear in any column, so I replaced the MLP with a CNN. Instead of learning each position separately, it could reuse the same filters across the screen.",
      before: <PixelStrip />, beforeText: "Flatten → MLP", after: <SharedFilter />, afterText: "Shared 3 × 3 filters",
    },
    {
      title: "Practise the futures it would learn from.",
      description: "Our earlier diagnostics showed predictions drifting during imagination. I kept three-step generated rollouts so the predictor practised using its own outputs. I also sampled rare reward events more often, with importance weights correcting the sampling bias.",
      before: <Rollout />, beforeText: "Initially one predicted step", after: <Rollout full />, afterText: "Three steps checked against replay",
    },
  ];
  return <div className="nano-rebuild-explained">
    {steps.map((step,index)=><div className="nano-rebuild-explained-step" key={step.title}>
      <p id={index===1?'working-rewards':undefined}><strong>{step.title}</strong> {step.description}</p>
      <figure className="nano-rebuild-inline" aria-label={`${step.beforeText}, changing to ${step.afterText}. Schematic comparison.`}>
        <div>{step.before}<span>{step.beforeText}</span></div>
        <span className="nano-rebuild-arrow" aria-hidden="true">→</span>
        <div>{step.after}<span>{step.afterText}</span></div>
      </figure>
    </div>)}
  </div>;
}
