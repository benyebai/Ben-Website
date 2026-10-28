"use client";
import { navigateNanoAnchor } from "./nanoAnchorNavigation";

import { useRef, useState } from "react";

function Architecture({ final, id, links = false }) {
  const arrow = `url(#${id})`;
  const box = (x,y,w,h,title,detail,changed=false) => {
    const kind = ["Encoder", "Decoder"].includes(title) ? "vision" : ["Actor", "Critic"].includes(title) ? "control" : ["Next latent", "Reward", "Continuation", "Action MLP"].includes(title) ? "prediction" : title === "Transformer" ? "trunk" : "neutral";
    const notes = {
      Actor: final ? "reads history features hₜ" : "reads zₜ; later [zₜ, Δzₜ]",
      Critic: final ? "distributional V(hₜ)" : "scalar V(actor input)",
      Encoder: final ? "CNN · 64-D latent · joint" : "MLP · frozen after pretraining",
      Decoder: final ? "CNN · weighted BCE" : "MLP · reconstruction loss",
      Transformer: final ? "2 blocks · width 128 · causal" : "causal · current action included",
      "Next latent": final ? "MSE + decoded-frame BCE" : "z′ = z + Δz",
      Reward: final ? "255 bins · cross-entropy" : "scalar · MSE",
      Continuation: "probability · binary CE",
      "Action MLP": "hₜ + aₜ",
      "Actor objective": "−log π(a | state) × advantage",
      "Return targets": "rewards + critic · λ-returns",
      "Critic objective": final ? "CE(real) + 0.3 × CE(imagined)" : "MSE(V, imagined return)",
      "Prediction loss": "combined learning signal",
    };
    const note = notes[title];
    const stacked = ["Transformer", "Latent history", "Frames"].includes(title);
    const node = <g className={`nano-node nano-kind-${kind}${changed ? " nano-node-changed" : ""}`}>
      {stacked && <><rect className="nano-stack-back" x={x-12} y={y+12} width={w} height={h}/><rect className="nano-stack-back" x={x-6} y={y+6} width={w} height={h}/></>}
      <rect className="nano-node-face" x={x} y={y} width={w} height={h}/>
      <text x={x+w/2} y={y+h/2+(note ? -4 : 6)} textAnchor="middle" className="nano-node-title">{title}</text>
      {note && <text x={x+w/2} y={y+h/2+17} textAnchor="middle" className="nano-node-detail">{note}</text>}
      {changed && <circle className="nano-change-dot" cx={x+w-9} cy={y+9} r="3"/>}
    </g>;
    const group = ["Encoder", "Decoder", "Frames"].includes(title) ? "encoder" : ["Transformer", "Latent history", "Next latent", "Reward", "Continuation", "Prediction loss", "Action MLP"].includes(title) ? "prediction" : "behavior";
    const anchor = `${final ? "working" : "first"}-${group}`;
    const jump = async element => {
      element.closest("dialog")?.close();
      await navigateNanoAnchor(`#${anchor}`);
    };
    return links ? <a href={`#${anchor}`} className="nano-component-link" aria-label={`Read about ${title}`} onClick={event => {
      event.preventDefault(); event.stopPropagation(); jump(event.currentTarget);
    }}>{node}</a> : node;
  };
  const line = (d, training=false) => <path d={d} className={training ? "nano-wire nano-wire-training" : "nano-wire"} markerEnd={arrow}/>;
  return <svg viewBox="0 0 1180 580" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>{final ? "Working NanoDreamer architecture" : "First NanoDreamer architecture"}</title>
    <desc id={`${id}-desc`}>Frames pass through an encoder and history into a causal transformer and transition heads. The actor supplies the chosen action. The critic estimates future returns. Separate training summaries show reconstruction, prediction and behavior objectives. Green dots identify changes in the working version.</desc>
    <defs><marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#7b8589" strokeWidth="1.4"/></marker></defs>
    <text x="30" y="35" className="nano-label">01 / REPRESENTATION &amp; PREDICTION</text>
    {box(195,105,190,64,"Decoder",final ? "joint CNN reconstruction" : "MLP reconstruction",final)}
    {line("M 285 250 V 169",true)}
    {box(440,110,160,72,"Actor","sample action aₜ",final)}
    {final ? line("M 745 225 V 200 H 520 V 182") : line("M 385 290 V 195 H 420 V 146 H 440")}
    {final ? line("M 600 146 H 850 V 225 H 860 V 260") : line("M 600 146 H 705 V 225")}

    {box(30,267,115,46,"Frames","real replay")}
    {box(205,250,160,80,"Encoder",final ? "CNN · learns jointly" : "MLP · then frozen",final)}
    {box(425,264,180,52,"Latent history",final ? "z + previous a + position" : "z + aligned a + position",final)}
    {box(655,225,180,130,"Transformer","causal history",final)}
    {final && box(845,260,105,60,"Action MLP","",true)}
    {box(965,193,170,54,"Next latent","",final)}
    {box(965,263,170,54,"Reward","",final)}
    {box(965,333,170,54,"Continuation","")}
    {box(945,85,190,64,"Prediction loss","")}
    {final ? <path d="M 950 290 H 965" className="nano-wire" markerEnd={arrow}/> : <path d="M 835 290 H 965" className="nano-wire" markerEnd={arrow}/>}
    <path d="M 955 220 V 360" className="nano-wire"/>
    {line("M 955 220 H 965")}
    {line("M 955 360 H 965")}
    <path d="M 1135 220 H 1150 M 1135 290 H 1150 M 1135 360 H 1150 M 1150 360 V 166 H 1040" className="nano-wire nano-wire-training"/>
    {line("M 1040 166 V 149",true)}
    {line("M 145 290 H 205")}{line("M 365 290 H 425")}{line("M 605 290 H 655")}{final && line("M 835 290 H 845")}
    {box(665,385,160,64,"Critic",final ? "V(history features)" : "V(actor input)",final)}
    {final ? line("M 745 355 V 385") : line("M 385 290 V 417 H 665")}
    <path d="M 30 475 H 1140" className="nano-divider"/>
    <text x="30" y="500" className="nano-label">02 / BEHAVIOR TRAINING</text>
    {box(30,520,280,54,"Actor objective","log probability × advantage")}
    {box(425,520,360,54,"Return targets","predicted rewards + critic bootstrap")}
    {box(900,520,240,54,"Critic objective",final ? "real replay + 0.3 × imagined" : "imagined return targets",final)}
    {line("M 745 449 V 505 H 605 V 520",true)}
    {line("M 425 547 H 310",true)}{line("M 785 547 H 900",true)}
  </svg>;
}

export default function DreamerArchitectureCompare({ initialTab = "first", interactive = false }) {
  const [version, setVersion] = useState(initialTab);
  const final = version === "final";
  const dialog = useRef(null);
  const trigger = useRef(null);
  const enlarge = () => { if (!dialog.current.open) dialog.current.showModal(); };
  const versionControls = interactive && <div className="dreamer-compare-tabs" role="group" aria-label="Architecture version">
    <button type="button" aria-pressed={!final} onClick={() => setVersion("first")}>First draft</button>
    <button type="button" aria-pressed={final} onClick={() => setVersion("final")}>Working version · changes highlighted</button>
  </div>;
  return <figure className="dreamer-compare nano-architecture">
    {versionControls}
    <div className="nano-diagram-preview" onClick={enlarge}>
      <Architecture final={final} links id={`nano-architecture-${initialTab}`}/>
      <span className="nano-navigation-hint">Click a component to explore</span>
      <button ref={trigger} type="button" className="nano-expand-label" aria-label="Enlarge architecture diagram" onClick={enlarge}>↗ Click to enlarge</button>
    </div>
    <dialog ref={dialog} className="nano-diagram-modal" aria-label="Expanded NanoDreamer architecture" onClose={() => trigger.current?.focus({ preventScroll: true })} onClick={event => { if (event.target === dialog.current) dialog.current.close(); }}>
      <div className="nano-modal-header"><strong>{final ? "Working NanoDreamer" : "First draft"}</strong><button type="button" autoFocus onClick={() => dialog.current.close()} aria-label="Close architecture diagram">Close ×</button></div>
      {versionControls}
      <div className="nano-modal-canvas"><Architecture final={final} links id={`nano-expanded-${initialTab}`}/></div>
      <p className="nano-modal-note">{final ? "Green dots mark changes from the first draft." : "Click a component to jump to its explanation."}</p>
    </dialog>
  </figure>;
}
