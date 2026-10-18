"use client";

import { useState } from "react";

const steps = [
  { title: "Forward", text: "With X = 2, Y = 3, A = 4, and B = 1, the two additions make Z = 5 and C = 5. Multiplying them gives W = 25." },
  { title: "Seed", text: "Start at the answer with ∂W/∂W = 1." },
  { title: "Multiply", text: "For W = Z × C, we can see that ∂W/∂Z just means treating Z as the variable and C as the constant. Then we know it’s just C. And it’s the same for ∂W/∂C: treat C as the variable and Z as the constant, so it’s just Z." },
  { title: "Add", text: "We need to solve for how W changes with X, Y, A, and B. According to the chain rule, ∂W/∂X = (∂W/∂Z) × (∂Z/∂X). Whoa, now all we need is ∂Z/∂X. For Z = X + Y, treat X as the variable and Y as the constant, so the derivative is just 1. Multiply it by the gradient before us: 5 × 1 = 5. The same goes for Y, A, and B." },
];

function GraphNode({ x, y, name, value, gradient, active }) {
  return (
    <g className={`autograd-node${active ? " is-active" : ""}`}>
      <rect x={x - 43} y={y - 30} width="86" height="60" />
      <text x={x} y={y - 5} className="autograd-node-name" textAnchor="middle">{name}</text>
      <text x={x} y={y + 15} className="autograd-node-value" textAnchor="middle">{value}</text>
      {gradient && <g className="autograd-grad-badge"><rect x={x - 36} y={y + 38} width="72" height="22" /><text x={x} y={y + 53} textAnchor="middle">grad {gradient}</text></g>}
    </g>
  );
}

function Operation({ x, y, symbol, active }) {
  return <g className={`autograd-operation${active ? " is-active" : ""}`}><rect x={x - 21} y={y - 21} width="42" height="42" /><text x={x} y={y + 7} textAnchor="middle">{symbol}</text></g>;
}

function Path({ d, active }) {
  return (
    <g>
      <path d={d} className="autograd-path" />
      {active && (
        <>
          <path d={d} className="autograd-path-active" />
          {[0, 1].map((index) => (
            <circle key={index} r="3.5" className="autograd-flow-dot">
              <animateMotion dur="1.8s" begin={`${-index * 0.9}s`} repeatCount="indefinite" path={d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.14;0.86;1" dur="1.8s" begin={`${-index * 0.9}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </>
      )}
    </g>
  );
}

export default function AutogradGraphs() {
  const [step, setStep] = useState(0);
  return (
    <>
      <figure className="autograd-card">
        <div className="autograd-card-head"><span>Computation graph</span><strong>W = (X + Y) × (A + B)</strong></div>
        <svg viewBox="0 0 700 400" role="img" aria-label={`X plus Y equals Z, A plus B equals C, and Z times C equals W. ${steps[step].text}`}>
          <Path d="M128 40 H234 V69" active={step >= 3} />
          <Path d="M128 140 H234 V111" active={step >= 3} />
          <Path d="M255 90 H327" active={step >= 3} />
          <Path d="M128 230 H234 V259" active={step >= 3} />
          <Path d="M128 330 H234 V301" active={step >= 3} />
          <Path d="M255 280 H327" active={step >= 3} />
          <Path d="M413 90 H530 V164" active={step >= 2} />
          <Path d="M413 280 H530 V206" active={step >= 2} />
          <Path d="M551 185 H577" active={step >= 1} />
          <GraphNode x={85} y={40} name="X" value="2" gradient={step >= 3 ? "5" : null} active={step >= 3} />
          <GraphNode x={85} y={140} name="Y" value="3" gradient={step >= 3 ? "5" : null} active={step >= 3} />
          <GraphNode x={85} y={230} name="A" value="4" gradient={step >= 3 ? "5" : null} active={step >= 3} />
          <GraphNode x={85} y={330} name="B" value="1" gradient={step >= 3 ? "5" : null} active={step >= 3} />
          <Operation x={234} y={90} symbol="+" active={step >= 3} />
          <Operation x={234} y={280} symbol="+" active={step >= 3} />
          <GraphNode x={370} y={90} name="Z" value="5" gradient={step >= 2 ? "5" : null} active={step >= 2} />
          <GraphNode x={370} y={280} name="C" value="5" gradient={step >= 2 ? "5" : null} active={step >= 2} />
          <Operation x={530} y={185} symbol="×" active={step >= 2} />
          <GraphNode x={620} y={185} name="W" value="25" gradient={step >= 1 ? "1" : null} active={step >= 1} />
        </svg>
        <div className="autograd-controls">
          <div className="autograd-steps" aria-label="Choose a step">
            {steps.map(({ title }, index) => <button key={title} type="button" className={step === index ? "is-current" : ""} aria-current={step === index ? "step" : undefined} onClick={() => setStep(index)}>{title}</button>)}
          </div>
        </div>
        <figcaption aria-live="polite">
          <strong>{steps[step].title}.</strong> {steps[step].text}
          {step === 2 && (
            <div className="autograd-derivatives" aria-label="Local derivatives of multiplication">
              <div><span>Vary Z · hold C fixed</span><strong>∂W/∂Z = C = 5</strong></div>
              <div><span>Vary C · hold Z fixed</span><strong>∂W/∂C = Z = 5</strong></div>
            </div>
          )}
          {step === 3 && (
            <div className="autograd-derivatives" aria-label="Local derivatives of addition">
              <div><span>Z = X + Y</span><strong>∂Z/∂X = 1 · ∂Z/∂Y = 1</strong></div>
              <div><span>C = A + B</span><strong>∂C/∂A = 1 · ∂C/∂B = 1</strong></div>
            </div>
          )}
        </figcaption>
      </figure>
      <p>That is the basic idea behind backpropagation and how the chain rule comes into play. We just solve the derivative in our current local expression, then multiply it by the derivative passed back from the operation after it.</p>
    </>
  );
}
