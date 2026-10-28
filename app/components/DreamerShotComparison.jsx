"use client";
import { Fragment, useState } from "react";
import initialData from "./dreamerShot.json";
import finalData from "./dreamerFinalShot.json";
const colors = ["#41beff", "#b99aff", "#ff9146", "#ffd25a", "#41ffb4", "#ff4ba0"];
function Frame({ cells, label }) {
  return <svg shapeRendering="crispEdges" viewBox="0 0 100 100" role="img" aria-label={label}><rect width="100" height="100" fill="#10141c" />{cells.flatMap((row,y)=>row.map((channels,x)=>{
    const active=channels.map((v,i)=>v?i:-1).filter(i=>i>=0);
    const c=active.at(-1);
    return c === undefined ? null : <rect key={`${x}-${y}`} x={x*10} y={y*10} width="10" height="10" fill={colors[c]} />;
  }))}</svg>;
}
export default function DreamerShotComparison({ final = false, compare = false, showRewards = true }) {
 const data = final ? finalData : initialData;
 const [hoveredFrame, setHoveredFrame] = useState(null);
 return <figure className="nano-shot-comparison">
  <div className="nano-shot-header"><strong>{compare ? "Same shot, two checkpoints" : "Following the same shot"}</strong><span>{compare ? "Hover predictions to see decoded frames" : "Real frames above · decoder confidence below"}</span></div>
  <div className="nano-shot-scroll"><div className="nano-shot-grid">
   <div className="nano-shot-rowlabel" />{data.actions.map((a,i)=><div className="nano-shot-step" key={i}><strong>t + {i+1}</strong></div>)}
   <div className="nano-shot-rowlabel"><strong>Real game</strong></div>{data.real.map((frame,i)=><div className={showRewards && data.realRewards[i]>0?"nano-shot-cell is-hit":"nano-shot-cell"} key={`real-${i}`}><Frame cells={frame} label={`Real game after step ${i+1}`} />{showRewards && <span className="nano-shot-reward"><b>{data.realRewards[i]>0?"+1":"0"}</b></span>}</div>)}
   {(compare ? [initialData, finalData] : [data]).map((predictionData, rowIndex) => <Fragment key={rowIndex}>   <div className="nano-shot-rowlabel"><strong>{compare ? (rowIndex === 0 ? "First draft" : "Working model") : "World model"}</strong></div>{predictionData.predicted.map((frame,i)=><div className={showRewards && predictionData.predictedRewards[i]>.5?"nano-shot-cell is-early":"nano-shot-cell"} key={`pred-${rowIndex}-${i}`} onPointerEnter={event=>{if(event.pointerType === "mouse") setHoveredFrame(`${rowIndex}-${i}`);}} onPointerLeave={()=>setHoveredFrame(null)} title="Hover to see the decoded frame">{hoveredFrame !== `${rowIndex}-${i}` ? <svg shapeRendering="crispEdges" viewBox="0 0 100 100" role="img" aria-label={`Decoder confidence after step ${i+1}`}><rect width="100" height="100" fill="#10141c" />{predictionData.predictedProbabilities[i].flatMap((row,y)=>row.map((channels,x)=><rect key={`${x}-${y}`} x={x*10} y={y*10} width="10" height="10" fill="#b9acf0" opacity={Math.max(...channels)} />))}</svg> : <Frame cells={frame} label={`Decoded imagined frame after step ${i+1}`} />}{showRewards && <span className="nano-shot-reward"><b>{predictionData.predictedRewards[i].toFixed(2)}</b></span>}</div>)}</Fragment>)}
  </div></div>
 </figure>;
}
