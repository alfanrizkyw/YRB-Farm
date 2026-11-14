"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { Dict } from "@/lib/i18n";

export default function Faq({ items }: { items: Dict["faq"]["items"] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-list">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div className="faq-item" key={item.q} data-open={isOpen} data-reveal style={{ "--d": i } as CSSProperties}>
            <h3>
              <button
                type="button"
                className="faq-trigger"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="faq-no">{String(i + 1).padStart(2, "0")}</span>
                <span className="faq-q">{item.q}</span>
                <span className="faq-icon" aria-hidden="true">
                  <ChevronDownIcon />
                </span>
              </button>
            </h3>
            <div className="faq-panel" id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-trigger-${i}`}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
