"use client";

import { useEffect, useState } from "react";

export default function CodeBlock({ code, language }) {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function highlightCode() {
      const { codeToHtml } = await import("shiki");
      const highlighted = await codeToHtml(code, {
        lang: language,
        theme: "github-light",
      });

      if (isMounted) {
        setHtml(highlighted);
      }
    }

    highlightCode();

    return () => {
      isMounted = false;
    };
  }, [code, language]);

  if (!html) {
    return (
      <pre className="code-block">
        <code>{code}</code>
      </pre>
    );
  }

  return (
    <div
      className="code-block code-block-highlighted"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
