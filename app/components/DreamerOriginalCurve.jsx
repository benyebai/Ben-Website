"use client";
import { useState } from "react";
import points from "./dreamerOriginalCurve.json";
const x = step => 32 + (step - 50000) / 200000 * 468;
const y = score => 118 - score / 6 * 94;
const path = key => points.map(p => `${x(p.step)},${y(p[key])}`).join(" ");
export default function DreamerOriginalCurve() {
 const [active, setActive] = useState(null);
 const point = active === null ? null : points[active];
 function selectNearest(event) {
  const bounds = event.currentTarget.getBoundingClientRect();
  const step = ((event.clientX - bounds.left) / bounds.width * 560 - 32) / 468 * 200000 + 50000;
  setActive(points.reduce((best,p,i) => Math.abs(p.step-step) < Math.abs(points[best].step-step) ? i : best, 0));
 }
 return <figure className="nano-original-curve" aria-label="Space Invaders from-scratch online training score curve">
  <div className="nano-original-header"><strong>Space Invaders</strong><div className="nano-original-legend"><span><i />Agent</span><span><i />Random</span></div></div>
  <svg viewBox="0 0 560 160" onPointerMove={selectNearest} onPointerDown={selectNearest} onPointerLeave={() => setActive(null)} role="group" aria-label="Hover, tap, or focus a checkpoint to inspect its mean reward">
   {[0,2,4,6].map(value => <g key={value}><line x1="32" x2="500" y1={y(value)} y2={y(value)} stroke="#e1e5db"/><text x="22" y={y(value)+4} textAnchor="end" fill="#858b80" fontSize="11">{value}</text></g>)}
   <text x="32" y="13" fill="#858b80" fontSize="11">mean score</text>
   {[50000,100000,150000,200000,250000].map(step => <text key={step} x={x(step)} y="138" textAnchor="middle" fill="#858b80" fontSize="11">{step/1000}k</text>)}
   <polyline points={path("random")} fill="none" stroke="#a5ab9e" strokeWidth="1.4" strokeDasharray="4 4"/>
   <polyline points={path("agent")} fill="none" stroke="#557650" strokeWidth="2"/>
   {point && <line x1={x(point.step)} x2={x(point.step)} y1="20" y2="118" stroke="#b9c6b5" strokeDasharray="3 4"/>}
   {points.map((p,i) => <g key={p.step} role="button" tabIndex={0} aria-label={`${p.step.toLocaleString("en-US")} policy steps. Agent ${p.agent.toFixed(2)}, random ${p.random.toFixed(2)}.`} onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)} onKeyDown={event=>{if(event.key === "Enter" || event.key === " "){event.preventDefault();setActive(i);}}}>
    <circle cx={x(p.step)} cy={y(p.random)} r="3" fill="#a5ab9e" opacity={active===i ? 1 : 0}/>
    <circle cx={x(p.step)} cy={y(p.agent)} r="4" fill="#557650" opacity={active===i ? 1 : 0}/>
    <rect x={x(p.step)-15} y="20" width="30" height="104" fill="transparent"/>
   </g>)}
   <text x="266" y="158" textAnchor="middle" fill="#929a87" fontSize="10">online policy steps</text>
  </svg>
  <div className="nano-original-readout" aria-live="polite">{point ? <><span>{point.step.toLocaleString("en-US")} policy steps</span><span>Agent <strong>{point.agent.toFixed(2)}</strong></span><span>Random <strong>{point.random.toFixed(2)}</strong></span></> : <span>Hover or tap a point to see its score</span>}</div>
 </figure>;
}
