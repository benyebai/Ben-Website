"use client";
import { useRef } from "react";

export default function FirstDraftDisclosure({ children, title = "Inside the first draft", subtitle = "Architecture, losses, and imagined returns", endLabel = "End of the first-draft details" }) {
  const panel = useRef(null);
  async function close() {
    const details = panel.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      // Keep the expanded page height until the return scroll has finished.
      await new Promise(resolve => {
        let timer;
        const finish = () => {
          clearTimeout(timer);
          document.removeEventListener("scrollend", finish);
          resolve();
        };
        document.addEventListener("scrollend", finish, { once: true });
        timer = setTimeout(finish, 1400);
        details.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      details.scrollIntoView({ behavior: "instant", block: "start" });
    }
    details.open = false;
    details.querySelector("summary").focus({ preventScroll: true });
  }
  return <details ref={panel} className="nano-first-draft-details">
    <summary>
      <span className="nano-draft-summary-copy"><strong>{title}</strong><span>{subtitle}</span></span>
      <span className="nano-draft-summary-action" aria-hidden="true"><span className="nano-draft-open-label">Explore</span><span className="nano-draft-close-label">Close</span></span>
    </summary>
    <div className="nano-draft-body">
      {children}
      <div className="nano-draft-end"><span>{endLabel}</span><button type="button" onClick={close}>Close and return to the story</button></div>
    </div>
  </details>;
}
