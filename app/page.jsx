"use client";

import { useEffect, useState } from "react";
import AboutPanel from "./components/AboutPanel";
import BeyondKvCachePanel from "./components/BeyondKvCachePanel";
import ProjectsPanel from "./components/ProjectsPanel";
import ReadingPanel from "./components/ReadingPanel";
import ThoughtArticlePanel from "./components/ThoughtArticlePanel";
import ThoughtsPanel from "./components/ThoughtsPanel";
import thoughts from "./content/thoughts";

const navItems = [
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "thoughts", label: "thoughts" },
  { id: "reading", label: "reading" },
];

const thoughtIds = thoughts.map((thought) => thought.id);
const panelIds = [
  ...navItems.map((item) => item.id),
  "beyond-kv-cache",
  ...thoughtIds,
];

export default function Home() {
  const [activePanel, setActivePanel] = useState("about");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionScope, setTransitionScope] = useState("content");
  const activeThought = thoughts.find((thought) => thought.id === activePanel);
  const isProjectWriteup = activePanel === "beyond-kv-cache";

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

  function showPanel(id, scope = "content") {
    if (id === activePanel || isTransitioning) {
      return;
    }

    window.history.pushState(null, "", getPathForPanel(id));
    setTransitionScope(scope);
    setIsTransitioning(true);

    window.setTimeout(() => {
      setActivePanel(id);

      window.requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 220);
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
              onOpenProject={() => showPanel("beyond-kv-cache", "shell")}
            />
          )}
          {activePanel === "beyond-kv-cache" && (
            <BeyondKvCachePanel onBack={() => showPanel("projects", "shell")} />
          )}
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

  if (thoughtIds.includes(panelId)) {
    return `/thoughts/${panelId}`;
  }

  return `/${panelId}`;
}

function getNavId(panelId) {
  if (panelId === "beyond-kv-cache") {
    return "projects";
  }

  if (thoughtIds.includes(panelId)) {
    return "thoughts";
  }

  return panelId;
}
