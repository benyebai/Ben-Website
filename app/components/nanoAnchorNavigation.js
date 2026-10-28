const legacyAnchors = {"dreamer-build-title": "how-hard-could-it-be", "dreamer-fail-title": "uh-it-did-not-work", "dreamer-training-title": "changing-how-the-model-learned", "dreamer-truthful-world-title": "actor-critic-check", "dreamer-working-reference-title": "taking-a-little-inspiration", "dreamer-predictions-title": "did-it-fix-it", "dreamer-recipe-title": "final-draft", "dreamer-ending-title": "the-moment-of-truth", "architecture-notes-title": "additional-notes", "algebra-title": "algebra-and-gradients", "matrix-autograd-title": "autograd-and-tensors", "mininn-title": "neural-networks-and-optimizers", "autoencoders-title": "autoencoders", "transformer-title": "attention-and-transformers", "actor-critic-title": "actor-and-critic"};
let navigation = 0;
const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
export async function navigateNanoAnchor(hash, { history = "push", smooth = true } = {}) {
  let id;
  try { id = decodeURIComponent(hash.replace(/^#/, "")); } catch { return false; }
  id = legacyAnchors[id] || id;
  const target = document.getElementById(id);
  if (!target) return false;
  const current = ++navigation;
  const panels = [];
  for (let element = target; element; element = element.parentElement) {
    if (element.tagName === "DETAILS") { panels.push(element); element.open = true; }
  }
  if (history !== "none") {
    const url = `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`;
    if (history === "replace" || window.location.hash === `#${id}`) window.history.replaceState(window.history.state, "", url);
    else window.history.pushState(window.history.state, "", url);
  }
  await nextFrame(); await nextFrame();
  await Promise.all(panels.flatMap(panel => panel.getAnimations({ subtree: true })
    .filter(animation => Number.isFinite(animation.effect?.getComputedTiming().endTime))
    .map(animation => animation.finished.catch(() => {}))));
  if (current !== navigation || !target.isConnected) return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const destination = target.tagName === "DETAILS" ? target.querySelector("summary") : target;
  destination.scrollIntoView({ behavior: smooth && !reduced ? "smooth" : "instant", block: "start" });
  return true;
}
