"use client";

import { useEffect, useRef, useState } from "react";

const sections = [
  {
    id: "papers",
    title: "Research Papers",
    items: [
      {
        id: "massively-multitask-world-models",
        title: "Learning Massively Multitask World Models for Continuous Control",
        meta: "09.2026",
        href: "https://arxiv.org/abs/2511.19584",
        summary:
          "Most attempts at general-purpose control still focus on a single task or learn offline from expert data, which limits both scale and data diversity. Inspired by the LLM recipe, Newt first pretrains one model on demonstrations from many tasks and environments, then continues with online RL across 200 tasks to learn useful behavior.",
        highlights: [
          "A language-conditioned world model trained jointly across 200 tasks with online RL, instead of narrow single-task objectives or offline RL alone.",
          "Architecture and training-pipeline changes that make large multitask training runs more efficient.",
          "A new benchmark spanning 200 tasks across multiple domains and embodiments.",
        ],
      },
      {
        id: "dreamerv3",
        title: "DreamerV3: Mastering Diverse Domains through World Models",
        meta: "09.2026",
        href: "https://arxiv.org/pdf/2301.04104",
        summary:
          "Many reinforcement-learning algorithms need task-specific hyperparameter tuning or expert data, then train on only one task or environment. DreamerV3 instead learns a world model and performs RL inside its own imagined trajectories, allowing it to work across very different domains with significantly fewer interactions with the real environment.",
        highlightsTitle: "What’s the innovation?",
        highlights: [
          "Breadth: the same algorithm works across a wide range of tasks and environments.",
          "Robust normalization, balancing, and transformation techniques reduce task-specific tuning. They compress difficult numerical scales, balance competing model objectives, and reshape unusual distributions into forms that are easier to learn from.",
          "Scaling: larger models perform better while requiring fewer interactions with the environment.",
        ],
        details: [
          {
            title: "Architecture",
            paragraphs: [
              "In Mario terms: the actor plays the game while images, actions, rewards, and other information are recorded. The world model learns from that experience, then the actor tries actions inside the learned world. The model predicts what happens and what reward follows, the critic judges those imagined outcomes, and the actor learns which choices to repeat or avoid before returning to the real game.",
              "Under the hood, DreamerV3 uses a CNN to encode images, a GRU-based recurrent state-space model (RSSM) to remember the past and predict future latent states, a CNN decoder and MLP heads to reconstruct observations and predict rewards and episode endings, and separate MLP actor and critic networks that learn from imagined trajectories.",
            ],
          },
          {
            title: "Techniques",
            paragraphs: [
              "Symlog and two-hot representations handle wildly different numerical scales. Return normalization stabilizes the actor. Balanced losses and free bits keep the latent state both informative and predictable. Uniform mixing prevents overconfident latent predictions, while a slowly updated critic and zero initialization stabilize value learning.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "books",
    title: "Books",
    items: [
      {
        id: "remains-of-the-day",
        title: "The Remains of the Day",
        meta: "current",
      },
      {
        id: "stoner",
        title: "Stoner",
        meta: "06.2026",
      },
      {
        id: "the-stranger",
        title: "The Stranger",
        meta: "05.2026",
      },
      {
        id: "when-breath-becomes-air",
        title: "When Breath Becomes Air",
        meta: "05.2026",
      },
      {
        id: "the-alchemist",
        title: "The Alchemist",
        meta: "05.2026",
      },
    ],
  },
];

export default function ReadingPanel() {
  const [openItem, setOpenItem] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef(null);
  const selectedItem = sections
    .flatMap((section) =>
      section.items.map((item) => ({ ...item, section: section.title })),
    )
    .find((item) => item.id === openItem);

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeItem();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openItem]);

  function openReadingItem(id) {
    setIsClosing(false);
    setOpenItem(id);
  }

  function closeItem() {
    if (isClosing) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpenItem(null);
      return;
    }

    setIsClosing(true);
  }

  function finishClosing(event) {
    if (!isClosing || event.target !== event.currentTarget) {
      return;
    }

    setOpenItem(null);
    setIsClosing(false);
  }

  return (
    <section className="content-section reading-panel" aria-labelledby="reading-title">
      <h2 id="reading-title">Reading</h2>

      {sections.map((section) => (
        <section
          className="reading-section"
          aria-labelledby={`${section.id}-title`}
          key={section.id}
        >
          <h3 id={`${section.id}-title`}>{section.title}</h3>
          <ul className="reading-list">
            {section.items.map((item) => {
              const isOpen = openItem === item.id;

              return (
                <li key={item.id}>
                  {item.summary ? (
                    <button
                      type="button"
                      className="reading-trigger"
                      aria-expanded={isOpen}
                      onClick={() => openReadingItem(item.id)}
                    >
                      <span className="reading-title">{item.title}</span>
                      <span className="reading-dots" aria-hidden="true" />
                      <span className="reading-meta">{item.meta}</span>
                    </button>
                  ) : (
                    <div className="reading-row">
                      <span className="reading-title">{item.title}</span>
                      <span className="reading-dots" aria-hidden="true" />
                      <span className="reading-meta">{item.meta}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {selectedItem && (
        <div
          className={`reading-modal-layer ${isClosing ? "is-closing" : ""}`}
          onMouseDown={closeItem}
        >
          <aside
            className="reading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
            onAnimationEnd={finishClosing}
          >
            <button
              ref={closeButtonRef}
              className="reading-modal-close"
              type="button"
              aria-label="Close reading note"
              onClick={closeItem}
            >
              ×
            </button>
            <p className="reading-modal-type">{selectedItem.section}</p>
            <h3 id="reading-modal-title">{selectedItem.title}</h3>
            <p className="reading-modal-meta">{selectedItem.meta}</p>
            <div className="reading-modal-note">
              <h4>Summary</h4>
              <p>{selectedItem.summary}</p>
              <h4>{selectedItem.highlightsTitle || "What’s new"}</h4>
              <ul>
                {selectedItem.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
              {selectedItem.details?.map((detail) => (
                <section className="reading-modal-detail" key={detail.title}>
                  <h4>{detail.title}</h4>
                  {detail.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </section>
              ))}
            </div>
            {selectedItem.href && (
              <a
                className="reading-modal-link"
                href={selectedItem.href}
                target="_blank"
                rel="noreferrer"
              >
                Read paper ↗
              </a>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
