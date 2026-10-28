const rewards = [
  ["Space Invaders", "+1 for each alien shot.", "An alien reaches or hits the cannon, or an enemy shot hits it."],
  ["Breakout", "+1 for each brick broken.", "The paddle misses the ball."],
  ["Asterix", "+1 for each treasure collected.", "The player touches an enemy."],
  ["Seaquest", "+1 for each enemy shot. Surfacing with six divers adds a bonus based on remaining oxygen.", "An enemy or bullet hits the submarine, oxygen runs out, or it surfaces without a diver."],
  ["Freeway", "+1 for reaching the top of the road.", "The environment timer expires. A car hit resets the chicken to the bottom; it doesn’t end the episode."],
];
const settings = [
  ["Latent size", "64"],
  ["CNN channels", "16 → 32 → 64, with 3 × 3 filters"],
  ["Transformer", "Width 128 · 2 blocks · 4 attention heads"],
  ["History context", "16 steps"],
  ["Reward / value distributions", "255 bins, symlog range −5 to 5"],
  ["World-model / real-return horizon", "3 steps"],
  ["Actor imagination horizon", "5 steps"],
  ["World-model batch", "32 replay contexts"],
  ["Imagination batch", "64 starting contexts"],
  ["Initial random experience", "4,000 environment actions"],
  ["Update frequency", "1 world, actor, and critic update per 8 policy steps"],
  ["Replay capacity", "200,000 transitions"],
  ["Reward-event sampling mixture", "25% event starts + 75% uniform starts, importance-corrected"],
  ["Optimizer", "Adam"],
  ["World-model learning rate", "0.0002"],
  ["Actor learning rate", "0.00004"],
  ["Critic learning rate", "0.0001"],
  ["Gradient norm clipping", "5 for each optimizer"],
  ["Discount γ / return mixing λ", "0.99 / 0.95"],
  ["Actor entropy coefficient", "0.001"],
  ["Policy probability mixing", "99% learned probabilities + 1% uniform"],
  ["Random-action exploration", "40% initially, falling to a 5% floor by 26,250 policy steps"],
  ["Target encoder / critic update", "1% / 2% toward the current network per update"],
  ["Generated-step loss weights", "Latent 1 · frame 1 · reward 2 · continuation 0.2"],
  ["Critic loss weights", "Real replay 1 · imagined 0.3"],
];
function NotesTable({label, headings, rows}) {
  return <div className="nano-notes-table-wrap"><table className="nano-notes-table" aria-label={label}>
    <thead><tr>{headings.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead>
    <tbody>{rows.map(([first,...rest])=><tr key={first}><th scope="row">{first}</th>{rest.map((cell,i)=><td key={i}>{cell}</td>)}</tr>)}</tbody>
  </table></div>;
}
export function GameRewardNotes() {
  return <details className="nano-rssm-notes" id="game-reward-notes"><summary>Game rewards</summary>
    <p>I used the rewards supplied by MinAtar, without custom shaping. There are no extra points for firing, moving, or surviving a step.</p>
    <NotesTable label="MinAtar game rewards and episode endings" headings={["Game","What earns reward","What ends the game"]} rows={rewards} />
    <p>Scores are sums of these rewards. The games have different scoring opportunities, so a score of 5 means something different in each game. Sampling reward events more often changes the training data mix; reward bins change how the model predicts a number. Neither adds rewards to the environment.</p>
    <p>Our rollout limits can also end a recorded episode before the environment itself ends. Freeway’s own timer is longer than our 1,000-action final evaluation limit.</p>
  </details>;
}
export function HyperparameterNotes() {
  return <details className="nano-rssm-notes" id="working-hyperparameters"><summary>Working-version hyperparameters</summary>
    <p>These are the settings for the full rebuilt recipe behind the five-game results. Each game uses the same settings and architecture, with separate weights trained from scratch.</p>
    <NotesTable label="Full NanoDreamer recipe hyperparameters" headings={["Setting","Value"]} rows={settings} />
    <p>The controlled comparisons change the named encoder, critic, or sampling choice. Their settings should not be confused with the full recipe above.</p>
  </details>;
}
export function EvaluationNotes() {
  return <details className="nano-rssm-notes" id="training-evaluation-notes"><summary>Training and evaluation details</summary>
    <p>A policy step means one action taken in the real environment. The 500k-step runs contain 500,000 policy actions, plus 4,000 initial random actions. Imagined transitions and gradient updates do not count toward that number. Each training episode allows up to 1,000 actions.</p>
    <NotesTable label="Evaluation protocols used in the article" headings={["Result","Evaluation"]} rows={[
      ["Longer-run learning curves", "100 games per checkpoint · 200-action limit · different evaluation seeds at each checkpoint"],
      ["Final five-game table", "500k training steps · 100 fresh games per game · 1,000-action limit"],
      ["Training-choice comparison charts", "Matched 150k training steps · 100 games · evaluation seed 920000 · 200-action limit"],
      ["Training-choice endpoint checks", "300 games · evaluation seed 940000 · 200-action limit; one run ended at 184,712 training steps"],
    ]} />
    <p>The agent samples its learned action probabilities during evaluation, without the additional training-time random-action exploration. Random baselines use the same game, evaluation seeds, and action limits as the corresponding agent check.</p>
    <p>The five-game results have one training seed per game. The additional comparisons include two seeds for some recipes and one for others. More evaluation games reduce uncertainty about a saved policy; they don’t establish reliability across training seeds. The 32-point clip is a selected episode, not the average.</p>
  </details>;
}
