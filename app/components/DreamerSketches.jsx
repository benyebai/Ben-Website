function Box({ x, y, w, h, fill, stroke = "#242526", children }) {
  const green = stroke === "#2f984d" || stroke === "#32994d";
  const blue = stroke === "#2374bd";
  return <g><rect x={x} y={y} width={w} height={h} fill={green ? "#e8ede7" : blue ? "#e8edf0" : "#f0f0eb"} stroke={green ? "#6a9477" : blue ? "#68869c" : "#a5a69f"} strokeWidth="1.5" />{children}</g>;
}

function Arrow({ d, color = "#28292a", dashed = false }) {
  const accent = color === "#298a45";
  return <path d={d} fill="none" stroke={accent ? "#6a9477" : "#969a93"} strokeWidth="1.7" strokeLinejoin="round" strokeDasharray={dashed ? "5 5" : undefined} markerEnd={`url(#${accent ? "green-arrow" : "black-arrow"})`} />;
}

function Defs() {
  return <defs><marker id="black-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#969a93" strokeWidth="1.6" /></marker><marker id="green-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="#6a9477" strokeWidth="1.6" /></marker></defs>;
}

export function DreamerWholeSketch() {
  const pixels = [[1,1,"#f39150"],[2,1,"#f39150"],[3,1,"#f39150"],[4,1,"#f39150"],[5,1,"#f39150"],[6,1,"#f39150"],[2,2,"#f39150"],[6,2,"#f39150"],[4,5,"#f3d15e"],[4,6,"#f3d15e"],[3,8,"#5dafee"],[4,8,"#5dafee"],[5,8,"#5dafee"]];
  return <figure className="dreamer-sketch"><div className="dreamer-sketch-canvas"><svg viewBox="0 0 1080 660" role="img" aria-labelledby="dreamer-whole-title dreamer-whole-desc"><title id="dreamer-whole-title">How the TinyDreamer architecture fits together</title><desc id="dreamer-whole-desc">A game frame enters a CNN encoder and becomes a latent. A causal transformer reads latent and action history. Its state goes to actor and critic. The actor chooses an action for transition heads, which predict the next latent, reward, and continuation; imagined steps train the actor.</desc><Defs />
    <text x="33" y="38" className="dreamer-sketch-title">The whole machine</text>
    <text x="38" y="105" className="dreamer-sketch-label">real MinAtar frame</text><rect x="39" y="119" width="120" height="120" rx="3" fill="#141921" />{pixels.map(([cx,cy,color],i)=><rect key={i} x={40+cx*12} y={120+cy*12} width="12" height="12" fill={color} />)}<text x="49" y="266" className="dreamer-sketch-small">10 × 10 channels</text>
    <Arrow d="M 169 178 C 182 179 186 178 200 178" />
    <Box x={212} y={128} w={160} h={96} fill="#b7eec0" stroke="#2f984d"><text x="292" y="168" textAnchor="middle" className="dreamer-sketch-node">CNN encoder</text><text x="292" y="196" textAnchor="middle" className="dreamer-sketch-small">keeps tiny objects</text></Box>
    <Arrow d="M 382 178 C 395 178 402 178 414 178" color="#298a45" />
    <text x="435" y="119" className="dreamer-sketch-label">64-value latent</text>{[0,1,2,3,4].map((i)=><rect key={i} x={430+i*22} y={135} width="15" height="85" fill={i%2 ? "#dbe7e0" : "#e8ede7"} stroke="#6a9477" strokeWidth="1.5" />)}
    <Arrow d="M 481 227 L 481 246" color="#298a45" /><Box x={398} y={254} w={168} h={52} fill="#d7f6dc" stroke="#2f984d"><text x="482" y="284" textAnchor="middle" className="dreamer-sketch-small">decoder reconstructs</text></Box>
    <Arrow d="M 548 178 C 559 178 564 178 578 178" />
    <Box x={590} y={127} w={218} h={98} fill="#b4ddfb" stroke="#2374bd"><text x="699" y="168" textAnchor="middle" className="dreamer-sketch-node">causal transformer</text><text x="699" y="197" textAnchor="middle" className="dreamer-sketch-small">latent + past actions</text></Box>
    <Arrow d="M 817 178 C 828 178 834 178 845 178" />
    <Box x={857} y={130} w={180} h={92} fill="#d7eafa" stroke="#2374bd"><text x="947" y="169" textAnchor="middle" className="dreamer-sketch-node">history state</text><text x="947" y="197" textAnchor="middle" className="dreamer-sketch-small">what happened so far</text></Box>
    <Box x={58} y={363} w={186} h={86} fill="#eeeeeb"><text x="151" y="401" textAnchor="middle" className="dreamer-sketch-node">real replay</text><text x="151" y="428" textAnchor="middle" className="dreamer-sketch-small">frames · rewards · ends</text></Box>
    <Arrow d="M 153 350 L 153 312 Q 153 297 170 297 L 290 297 Q 306 297 306 279 L 306 240" dashed />
    <text x="191" y="286" className="dreamer-sketch-small">training targets</text>
    <Arrow d="M 947 234 L 947 298 Q 947 312 926 312 L 827 312" /><Arrow d="M 915 313 L 515 313" /><Arrow d="M 977 236 L 977 342" />
    <Box x={330} y={354} w={183} h={97} fill="#ffd1d1" stroke="#d83e3e"><text x="421" y="396" textAnchor="middle" className="dreamer-sketch-node">actor</text><text x="421" y="425" textAnchor="middle" className="dreamer-sketch-small">which action?</text></Box>
    <Box x={850} y={354} w={181} h={97} fill="#e4d9f5" stroke="#8560b1"><text x="941" y="396" textAnchor="middle" className="dreamer-sketch-node">critic</text><text x="941" y="425" textAnchor="middle" className="dreamer-sketch-small">how good later?</text></Box>
    <Arrow d="M 523 401 C 549 401 550 401 568 401" color="#d83e3e" />
    <text x="530" y="382" className="dreamer-sketch-small" fill="#bf3636">chosen action</text>
    <Box x={580} y={344} w={228} h={110} fill="#b8dcfa" stroke="#2374bd"><text x="694" y="389" textAnchor="middle" className="dreamer-sketch-node">transition heads</text><text x="694" y="419" textAnchor="middle" className="dreamer-sketch-small">use action + history</text></Box>
    <Arrow d="M 694 465 L 694 505" /><Box x={511} y={519} w={374} h={94} fill="#ffedb4" stroke="#e29a21"><text x="698" y="558" textAnchor="middle" className="dreamer-sketch-node">next latent · reward · continue</text><text x="698" y="588" textAnchor="middle" className="dreamer-sketch-small">repeat 5 imagined steps → actor learns</text></Box>
    <Arrow d="M 892 565 C 962 563 984 534 945 466" dashed />
    <text x="912" y="546" className="dreamer-sketch-small">bootstrap</text>
  </svg></div><figcaption>The encoder compresses the real observation. The transformer tracks history; the actor chooses actions and the transition heads predict their consequences. The critic estimates what comes after the short imagined rollout. Real replay trains the world model and critic.</figcaption></figure>;
}

export function DreamerRolloutSketch() {
  return <figure className="dreamer-sketch dreamer-sketch-rollout"><div className="dreamer-sketch-canvas"><svg viewBox="0 0 980 285" role="img" aria-labelledby="dreamer-rollout-title dreamer-rollout-desc"><title id="dreamer-rollout-title">Why a good one-step prediction can fail across a rollout</title><desc id="dreamer-rollout-desc">A real latent starts a sequence of action-conditioned predictions. Each predicted latent is reused as the next input. Errors grow across the sequence and a missed reward changes the actor's learning signal.</desc><Defs />
    <text x="25" y="38" className="dreamer-sketch-title">One step is not a whole game</text>
    <Box x={26} y={88} w={150} h={83} fill="#b8edc1" stroke="#32994d"><text x="101" y="124" textAnchor="middle" className="dreamer-sketch-node">real state</text><text x="101" y="150" textAnchor="middle" className="dreamer-sketch-small">known starting point</text></Box>
    <Arrow d="M 183 130 L 220 130" />
    <Box x={232} y={88} w={160} h={83} fill="#b8dcfa" stroke="#2374bd"><text x="312" y="124" textAnchor="middle" className="dreamer-sketch-node">model + action</text><text x="312" y="150" textAnchor="middle" className="dreamer-sketch-small">predict 1 step</text></Box>
    <Arrow d="M 402 130 L 435 130" />
    <Box x={447} y={88} w={133} h={83} fill="#d8edfb" stroke="#2374bd"><text x="513" y="124" textAnchor="middle" className="dreamer-sketch-node">predicted</text><text x="513" y="150" textAnchor="middle" className="dreamer-sketch-small">state 1</text></Box>
    <Arrow d="M 590 130 L 626 130" />
    <Box x={638} y={88} w={150} h={83} fill="#ffd4d4" stroke="#d83e3e"><text x="713" y="124" textAnchor="middle" className="dreamer-sketch-node">model again</text><text x="713" y="150" textAnchor="middle" className="dreamer-sketch-small">on its own guess</text></Box>
    <Arrow d="M 798 130 L 830 130" /><Box x={842} y={88} w={117} h={83} fill="#ffd4d4" stroke="#d83e3e"><text x="900" y="124" textAnchor="middle" className="dreamer-sketch-node">...</text><text x="900" y="150" textAnchor="middle" className="dreamer-sketch-small">errors grow</text></Box>
    <path d="M 512 183 L 512 205 L 900 205 L 900 183" fill="none" stroke="#68869c" strokeWidth="1.6" strokeDasharray="5 5" /><text x="705" y="245" textAnchor="middle" className="dreamer-sketch-small">the actor practices in this imagined world</text>
  </svg></div><figcaption>Each generated state becomes the input to the next prediction. This is why a convincing next frame could still lead the actor toward a reward that would not exist in the real game.</figcaption></figure>;
}
