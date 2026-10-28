"use client";

import { useEffect, useState } from "react";
import AboutPanel from "./components/AboutPanel";
import BeyondKvCachePanel from "./components/BeyondKvCachePanel";
import ProjectsPanel from "./components/ProjectsPanel";
import ReadingPanel from "./components/ReadingPanel";
import ThoughtArticlePanel from "./components/ThoughtArticlePanel";
import ThoughtsPanel from "./components/ThoughtsPanel";
import LeMarioPanel from "./components/LeMarioPanel";
import NanoDreamerPanel from "./components/NanoDreamerPanel";
import NanoDreamerFoundations from "./components/NanoDreamerFoundations";
import thoughts from "./content/thoughts";

const navItems = [
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "reading", label: "reading" },
  { id: "thoughts", label: "thoughts" },
];

const thoughtIds = thoughts.map((thought) => thought.id);
const panelIds = [
  ...navItems.map((item) => item.id),
  "beyond-kv-cache",
  "lemario",
  "nanodreamer",
  "nanodreamer-foundations",
  ...thoughtIds,
];

export default function Home({ initialPanel = "about" }) {
  const [activePanel, setActivePanel] = useState(initialPanel);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionScope, setTransitionScope] = useState("content");
  const activeThought = thoughts.find((thought) => thought.id === activePanel);
  const isProjectWriteup = ["beyond-kv-cache", "lemario", "nanodreamer", "nanodreamer-foundations"].includes(activePanel);

  useEffect(() => {
    const initialPanel = getPanelFromPath(window.location.pathname);

    if (panelIds.includes(initialPanel)) {
      setActivePanel(initialPanel);
    }

    function handlePopState() {
      const nextPanel = getPanelFromPath(window.location.pathname);

      if (panelIds.includes(nextPanel)) {
        setTransitionScope("content");
        setIsTransitioning(true);

        window.setTimeout(() => {
          setActivePanel(nextPanel);

          window.requestAnimationFrame(() => {
            setIsTransitioning(false);
          });
        }, 220);
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  function showPanel(id, scope = "content", anchor = "") {
    if (id === activePanel || isTransitioning) {
      return;
    }

    window.history.pushState(null, "", getPathForPanel(id) + anchor);
    setTransitionScope(scope);
    setIsTransitioning(true);

    const articleChange = ["nanodreamer", "nanodreamer-foundations"].includes(id) && ["nanodreamer", "nanodreamer-foundations"].includes(activePanel);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      setActivePanel(id);
      window.requestAnimationFrame(() => {
        if (articleChange) {
          const target = anchor ? document.getElementById(anchor.slice(1)) : null;
          if (target) target.scrollIntoView({ behavior: "instant", block: "start" });
          else window.scrollTo({ top: 0, behavior: "instant" });
          const heading = document.querySelector(".article-panel h2");
          if (heading && !anchor) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
        }
        window.requestAnimationFrame(() => setIsTransitioning(false));
      });
    }, reducedMotion ? 0 : 220);
  }

  function followArticle(event, id, anchor = "") {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showPanel(id, "content", anchor);
  }

  return (
    <div
      className={`site-shell ${isProjectWriteup ? "writeup-shell" : ""} ${
        isTransitioning && transitionScope === "shell" ? "is-switching" : ""
      }`}
    >
      {!isProjectWriteup && (
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={getNavId(activePanel) === item.id ? "active" : undefined}
              aria-current={getNavId(activePanel) === item.id ? "page" : undefined}
              onClick={() => showPanel(item.id, "content")}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      <main className="page">
        <div
          className={`content-panel ${
            isTransitioning && transitionScope === "content" ? "is-switching" : ""
          }`}
        >
          {activePanel === "about" && <AboutPanel />}
          {activePanel === "projects" && (
            <ProjectsPanel
              onOpenBeyondKvCache={() => showPanel("beyond-kv-cache", "shell")}
              onOpenLeMario={() => showPanel("lemario", "shell")}
              onOpenNanoDreamer={() => showPanel("nanodreamer", "shell")}
            />
          )}
          {activePanel === "beyond-kv-cache" && (
            <BeyondKvCachePanel onBack={() => showPanel("projects", "shell")} />
          )}
          {activePanel === "lemario" && (
            <LeMarioPanel onBack={() => showPanel("projects", "shell")} />
          )}
          {activePanel === "nanodreamer" && (
            <NanoDreamerPanel onBack={() => showPanel("projects", "shell")} onOpenFoundations={event => followArticle(event, "nanodreamer-foundations")} />
          )}
          {activePanel === "nanodreamer-foundations" && <NanoDreamerFoundations onBackToStory={(event, anchor) => followArticle(event, "nanodreamer", anchor)} />}
          {activePanel === "thoughts" && (
            <ThoughtsPanel
              onOpenThought={(thought) => showPanel(thought.id, "content")}
            />
          )}
          {activeThought && (
            <ThoughtArticlePanel thought={activeThought} />
          )}
          {activePanel === "reading" && <ReadingPanel />}
        </div>
      </main>
    </div>
  );
}

function getPanelFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  if (normalizedPath === "/") {
    return "about";
  }

  if (normalizedPath === "/projects") {
    return "projects";
  }

  if (normalizedPath === "/projects/beyond-kv-cache") {
    return "beyond-kv-cache";
  }

  if (normalizedPath === "/projects/nanodreamer/foundations") {
    return "nanodreamer-foundations";
  }

  if (normalizedPath === "/projects/nanodreamer") {
    return "nanodreamer";
  }

  if (
    normalizedPath === "/projects/lemario" ||
    normalizedPath === "/projects/tiny-lewm"
  ) {
    return "lemario";
  }

  if (normalizedPath === "/thoughts") {
    return "thoughts";
  }

  if (normalizedPath.startsWith("/thoughts/")) {
    return normalizedPath.replace("/thoughts/", "");
  }

  if (normalizedPath === "/reading") {
    return "reading";
  }

  return "about";
}

function getPathForPanel(panelId) {
  if (panelId === "about") {
    return "/";
  }

  if (panelId === "beyond-kv-cache") {
    return "/projects/beyond-kv-cache";
  }

  if (panelId === "lemario") {
    return "/projects/lemario";
  }

  if (panelId === "nanodreamer-foundations") {
    return "/projects/nanodreamer/foundations";
  }

  if (panelId === "nanodreamer") {
    return "/projects/nanodreamer";
  }

  if (thoughtIds.includes(panelId)) {
    return `/thoughts/${panelId}`;
  }

  return `/${panelId}`;
}

function getNavId(panelId) {
  if (["beyond-kv-cache", "lemario", "nanodreamer", "nanodreamer-foundations"].includes(panelId)) {
    return "projects";
  }

  if (thoughtIds.includes(panelId)) {
    return "thoughts";
  }

  return panelId;
}
