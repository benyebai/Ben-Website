import data from "./dreamerLearningCurve.json";
export default function DreamerLearningCurve() {
  return <figure className="nano-learning-curves" aria-label="Checkpoint evaluations of the final agent from 50,000 to 200,000 online policy steps">
    {data.series.map(series=>{
      const x=step=>35+(step-50000)/150000*235;
      const y=value=>155-value/series.limit*125;
      const ticks=series.limit===15?[0,5,10,15]:[0,1,2,3,4];
      const path=key=>series.points.map((point,i)=>`${i?"L":"M"}${x(point.step)},${y(point[key])}`).join(" ");
      const last=series.points.at(-1);
      return <div key={series.game}><h5>{series.game}</h5><svg viewBox="0 0 335 195" role="img" aria-label={`${series.game}. ${series.points.map(p=>`${p.step} steps, agent ${p.agent}, random ${p.random}`).join(". ")}`}>
        {ticks.map(tick=><g key={tick}><line x1="35" x2="270" y1={y(tick)} y2={y(tick)} stroke="#e1e5db"/><text x="25" y={y(tick)+3} textAnchor="end" fill="#929a87" fontSize="10">{tick}</text></g>)}
        <text x="35" y="15" fill="#858e7b" fontSize="10">mean score</text>
        <path d={path("random")} fill="none" stroke="#a5ab9e" strokeWidth="1.4" strokeDasharray="4 4"/>
        <path d={path("agent")} fill="none" stroke="#557650" strokeWidth="2"/>
        {series.points.map(point=><g key={point.step}><circle cx={x(point.step)} cy={y(point.agent)} r="3" fill="#557650"><title>{`${point.step.toLocaleString()} steps · agent ${point.agent} · random ${point.random}`}</title></circle><text x={x(point.step)} y="176" textAnchor="middle" fontSize="10" fill="#858e7b">{point.step/1000}k</text></g>)}
        <text x="280" y={y(last.agent)+3} fontSize="11" fill="#557650">{last.agent.toFixed(2)}</text><text x="280" y={y(last.random)+3} fontSize="10" fill="#929a87">{last.random.toFixed(2)}</text>
        <text x="151" y="193" textAnchor="middle" fontSize="10" fill="#929a87">online policy steps</text>
      </svg></div>;
    })}
    <div className="nano-learning-key"><span><i/>Agent</span><span><i/>Random</span></div>
  </figure>;
}
