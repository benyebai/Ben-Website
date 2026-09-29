"use client";

import { useEffect, useRef, useState } from "react";

const sections = [
  {
    id: "books",
    title: "Books",
    items: [
      {
        id: "remains-of-the-day",
        title: "The Remains of the Day",
        meta: "current",
        note: "Reading now. Notes to come once I have had a little more time with it.",
      },
      {
        id: "stoner",
        title: "Stoner",
        meta: "06.2026",
        note: "A quiet book about an ordinary life that never feels ordinary. I kept thinking about how dignity can live in persistence, even when almost nobody notices it.",
      },
      {
        id: "the-stranger",
        title: "The Stranger",
        meta: "05.2026",
        note: "Short, detached, and unsettling. What stayed with me was the friction between living honestly and performing the emotions that other people expect from us.",
      },
      {
        id: "when-breath-becomes-air",
        title: "When Breath Becomes Air",
        meta: "05.2026",
        note: "A moving reflection on ambition, mortality, and what makes work meaningful when time becomes scarce.",
      },
      {
        id: "the-alchemist",
        title: "The Alchemist",
        meta: "05.2026",
        note: "Simple and earnest. I liked its insistence that choosing a direction matters, even when the path only makes sense in hindsight.",
      },
    ],
  },
  {
    id: "papers",
    title: "Research Papers",
    items: [
      {
        id: "v-jepa",
        title: "V-JEPA",
        meta: "Meta AI · 2024",
        href: "https://arxiv.org/abs/2402.08446",
        note: "The idea I keep returning to is that a useful world model does not need to reconstruct every pixel. Predicting representations can force the model to preserve what matters while ignoring details that do not.",
      },
      {
        id: "i-jepa",
        title: "I-JEPA",
        meta: "Meta AI · 2023",
        href: "https://arxiv.org/abs/2301.08243",
        note: "A clean demonstration of learning semantic representations through prediction in latent space. It made the case for abstraction feel concrete rather than philosophical.",
      },
      {
        id: "dreamerv3",
        title: "DreamerV3",
        meta: "Hafner et al. · 2023",
        href: "https://arxiv.org/abs/2301.04104",
        note: "What interests me here is the generality: one set of choices working across very different environments. It is a useful reference point for what a practical learned world model can enable.",
      },
    ],
  },
];

export default function ReadingPanel() {
  const [openItem, setOpenItem] = useState(null);
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
    setOpenItem(id);
  }

  function closeItem() {
    setOpenItem(null);
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
                  <button
                    type="button"
                    className="reading-trigger"
                    aria-expanded={isOpen}
                    onClick={() => openReadingItem(item.id)}
                  >
                    <span className="reading-title">{item.title}</span>
                    <span className="reading-dots" aria-hidden="true" />
                    <span className="reading-meta">{item.meta}</span>
                    <span className="reading-toggle" aria-hidden="true">
                      ↗
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {selectedItem && (
        <div className="reading-modal-layer" onMouseDown={closeItem}>
          <aside
            className="reading-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reading-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
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
              <p>{selectedItem.note}</p>
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
