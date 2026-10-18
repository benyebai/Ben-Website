"use client";

import { useState } from "react";
import { gameResults } from "./dreamerResults";

// Contrast copies use lavender in place of the original gold palette entry.
const blue = "#41beff";
const lavender = "#b99aff";
const orange = "#ff9146";
const yellow = "#ffd25a";
const green = "#41ffb4";
const pink = "#ff4ba0";

const gameGuides = {
  "Space Invaders": {
    goal: "Move your cannon along the bottom, shoot the descending aliens, and dodge their shots. A hit from an alien or enemy shot ends the game.",
    legend: [
      { colors: [blue], label: "Your cannon", detail: "along the bottom row" },
      { colors: [orange, yellow], label: "Aliens", detail: "color indicates their movement direction" },
      { colors: [green], label: "Your shots", detail: "travel upward" },
      { colors: [pink], label: "Enemy shots", detail: "travel downward" },
    ],
    reward: "+1 for each alien shot. Moving, firing, and surviving a step do not give extra points.",
  },
  Breakout: {
    goal: "Move the paddle left or right to keep the ball in play and break the bricks above. Missing the ball ends the game.",
    legend: [
      { colors: [blue], label: "Your paddle", detail: "along the bottom row" },
      { colors: [lavender], label: "Ball", detail: "keep it bouncing" },
      { colors: [orange], label: "Ball trail", detail: "its previous position shows movement" },
      { colors: [yellow], label: "Bricks", detail: "clear them to score" },
    ],
    reward: "+1 for each brick broken. Bouncing the ball off the paddle does not itself give a reward.",
  },
  Asterix: {
    goal: "Move in four directions to collect treasure while avoiding enemies crossing the screen. Touching an enemy ends the game.",
    legend: [
      { colors: [blue], label: "Your player", detail: "starts near the center" },
      { colors: [lavender], label: "Enemies", detail: "avoid contact" },
      { colors: [yellow], label: "Treasure", detail: "move onto it to collect it" },
      { colors: [orange], label: "Movement trails", detail: "show which way objects are moving" },
    ],
    reward: "+1 for each treasure collected. There is no extra reward for movement or survival.",
  },
  Seaquest: {
    goal: "Pilot the two-cell submarine, shoot enemies, collect divers, and surface to refill oxygen. Bring at least one diver when surfacing; collisions or running out of oxygen end the game.",
    legend: [
      { colors: [blue, lavender], label: "Your submarine", detail: "blue front, lavender rear" },
      { colors: [pink, blue], label: "Enemy fish / submarines", detail: "avoid both" },
      { colors: [orange, green], label: "Your shots / enemy shots", detail: "orange friendly, green hostile" },
      { colors: [yellow], label: "Divers and movement trails", detail: "collect divers, follow their motion" },
      { colors: [lavender, orange], label: "Bottom status bars", detail: "lavender oxygen, orange divers" },
    ],
    reward: "+1 for each enemy shot. Surfacing with six divers adds +1 for each remaining cell in the oxygen bar. Picking up a diver alone gives no immediate reward.",
  },
  Freeway: {
    goal: "Move the chicken up and down through traffic to reach the top. A collision sends it back to the bottom; a successful crossing starts another attempt.",
    legend: [
      { colors: [blue], label: "Your chicken", detail: "moves vertically in the center column" },
      { colors: [lavender], label: "Cars", detail: "travel horizontally through the lanes" },
      { colors: [orange, yellow, green, pink, blue], label: "Car trails", detail: "position shows direction; color encodes speed" },
    ],
    reward: "+1 each time the chicken reaches the top. A collision resets its position without an added negative reward.",
  },
};

export default function DreamerGameplayGallery() {
  const [selected, setSelected] = useState(0);
  const result = gameResults[selected];
  const guide = gameGuides[result.game];
  return <div className="dreamer-gameplay-player">
    <div role="group" aria-label="Choose a gameplay recording" className="dreamer-game-buttons">
      {gameResults.map((game, index) => <button key={game.game} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)}>{game.game}</button>)}
    </div>
    <div className="dreamer-featured-game">
      <div className="dreamer-demo-layout">
        <figure className="dreamer-demo-recording">
          <div className="dreamer-game-crop">
            <img key={result.clip} src={`/project-assets/nanodreamer/${result.clip.replace(".gif", "-contrast.gif")}`} alt={`NanoDreamer playing ${result.game}`} width="500" height="555" />
          </div>
          <figcaption aria-live="polite">NanoDreamer playing {result.game}.</figcaption>
        </figure>
        <div className={`dreamer-game-guide${result.game === "Seaquest" ? " dreamer-guide-compact" : ""}`} aria-label={`${result.game}: objective and color legend`}>
          <div className="dreamer-guide-section">
            <span className="dreamer-guide-heading">How to play</span>
            <p className="dreamer-game-objective">{guide.goal}</p>
          </div>
          <div className="dreamer-guide-section">
            <span className="dreamer-guide-heading">On screen</span>
            <ul className="dreamer-game-legend" aria-label={`${result.game} color legend`}>
              {guide.legend.map(item => <li key={item.label}>
                <span className="dreamer-legend-swatches" aria-hidden="true">{item.colors.map((color, index) => <i key={index} style={{ backgroundColor: color }} />)}</span>
                <span><strong>{item.label}</strong><small>{item.detail}</small></span>
              </li>)}
            </ul>
          </div>
          {guide.note && <p className="dreamer-legend-note">{guide.note}</p>}
        </div>
      </div>
      <div className="dreamer-game-reward" aria-label={`${result.game} training reward`}>
        <div><strong>Training reward</strong></div>
        <p>{guide.reward}</p>
      </div>
    </div>
  </div>;
}
