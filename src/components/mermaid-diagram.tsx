"use client";

import { useEffect, useId, useState } from "react";
import type mermaidApi from "mermaid";

type Props = {
  chart: string;
};

type Mermaid = typeof mermaidApi;

let mermaidPromise: Promise<Mermaid> | null = null;

function loadMermaid(): Promise<Mermaid> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default;
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "neutral",
        fontFamily: "inherit",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

export function MermaidDiagram({ chart }: Props) {
  const reactId = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const source = chart.trim();

    if (!source) {
      setSvg(null);
      setError(null);
      return;
    }

    setSvg(null);
    setError(null);

    void (async () => {
      try {
        const mermaid = await loadMermaid();
        const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, source);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null);
          setError(
            err instanceof Error ? err.message : "図の描画に失敗しました。",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  if (error) {
    return (
      <div className="mermaid-diagram is-error" role="alert">
        <p className="mermaid-diagram-error">Mermaid の描画エラー</p>
        <pre>
          <code>{chart}</code>
        </pre>
        <p className="md-hint">{error}</p>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="mermaid-diagram is-loading" aria-busy="true">
        図を描画中…
      </div>
    );
  }

  return (
    <div
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
