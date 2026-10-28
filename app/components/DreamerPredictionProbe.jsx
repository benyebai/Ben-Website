import { Fragment } from "react";
import data from "./dreamerPredictionProbe.json";
export default function DreamerPredictionProbe() {
 return <figure className="dreamer-evidence dreamer-timing-minimal nano-prediction-probe" aria-label="Matched Space Invaders reward timing diagnostic">
 <div className="nano-probe-legend"><span><i style={{background:"#858b95"}} />First draft</span><span><i style={{background:"#789780"}} />Working agent</span></div>
 <div className="dreamer-timing-bars">
 {data.final.metrics.map((metric,index)=><Fragment key={metric.step}>
   {[[data.early.metrics[index],"First draft","#858b95"],[metric,"Working agent","#789780"]].map(([m,label,color],row)=><div key={label} aria-label={`${label}, step ${m.step}: ${m.hits} of ${m.events} reward events timed correctly, ${m.falsePositives} false alarms`}>
     <span>{row===0?`Step ${m.step}`:""}</span>
     <div className="dreamer-timing-track"><div style={{width:`${100*m.eventRecall}%`,background:color}} /></div>
     <strong>{Math.round(100*m.eventRecall)}% <span>{m.hits}/{m.events}</span></strong>
   </div>)}
 </Fragment>)}
 </div>

 </figure>;
}
