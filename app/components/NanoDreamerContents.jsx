"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { navigateNanoAnchor } from "./nanoAnchorNavigation";
const sections = [
  ["nanodreamer-title", "Introduction"],
  ["how-hard-could-it-be", "How hard could it be?"],
  ["uh-it-did-not-work", "Uh, it did not work"],
  ["changing-how-the-model-learned", "Changing how the model learned"],
  ["actor-critic-check", "Actor–critic check", true],
  ["taking-a-little-inspiration", "Taking a little inspiration"],
  ["did-it-fix-it", "Well, did it fix it?"],
  ["final-draft", "The final draft"],
  ["the-moment-of-truth", "The moment we’ve been waiting for"],
  ["takeaways-and-next-steps", "Takeaways and next steps"],
  ["additional-notes", "Additional notes"],
  ["foundations", "Build it from scratch"],
];
export default function NanoDreamerContents({ items = sections } = {}) {
  const [active, setActive] = useState(items[0][0]);
  const [marker, setMarker] = useState({ top: 0, height: 22 });
  const list = useRef(null);
  const links = useRef({});
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let next = items[0][0];
      const threshold = Math.min(180, window.innerHeight * .25);
      for (const [id] of items) {
        const element = document.getElementById(id);
        if (element?.getClientRects().length && element.getBoundingClientRect().top <= threshold) next = id;
      }
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) next = items.at(-1)[0];
      setActive(next);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("toggle", schedule, true);
    const observer = new ResizeObserver(schedule);
    const article = list.current?.closest("article");
    if (article) observer.observe(article);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("toggle", schedule, true);
      observer.disconnect();
    };
  }, []);
  useLayoutEffect(() => {
    const measure = () => {
      const link = links.current[active];
      if (link && list.current) setMarker({ top: link.offsetTop, height: link.offsetHeight });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active]);
  useEffect(() => {
    const article = list.current?.closest("article");
    const followHash = () => { if (window.location.hash) navigateNanoAnchor(window.location.hash, {history:"replace", smooth:false}); };
    const followLink = event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest?.("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      let id;
      try { id = decodeURIComponent(url.hash.slice(1)); } catch { return; }
      if (!document.getElementById(id)) return;
      event.preventDefault();
      navigateNanoAnchor(url.hash);
    };
    article?.addEventListener("click", followLink);
    window.addEventListener("hashchange", followHash);
    window.addEventListener("popstate", followHash);
    const frame = requestAnimationFrame(followHash);
    return () => {
      cancelAnimationFrame(frame);
      article?.removeEventListener("click", followLink);
      window.removeEventListener("hashchange", followHash);
      window.removeEventListener("popstate", followHash);
    };
  }, []);
  function navigate(event, id) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigateNanoAnchor(`#${id}`);
  }
  return <nav className="nano-side-contents" aria-label="On this page">
    <div className="nano-contents-links" ref={list}>
      <span className="nano-contents-marker" aria-hidden="true" style={{ transform: `translateY(${marker.top}px)`, height: marker.height }} />
      {items.map(([id, label, nested]) => <a key={id} ref={element=>{links.current[id]=element;}} href={`#${id}`} className={nested ? "is-nested" : undefined} aria-current={active===id ? "location" : undefined} onClick={event=>navigate(event,id)}>{label}</a>)}
    </div>
  </nav>;
}
