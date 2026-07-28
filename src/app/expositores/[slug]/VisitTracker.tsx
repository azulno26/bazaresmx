"use client";

import { useEffect } from "react";

export function VisitTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (!slug) return;
    
    // Check sessionStorage to avoid duplicating counts in the same session
    const storageKey = `visited_exp_${slug}`;
    const alreadyVisited = sessionStorage.getItem(storageKey);
    
    if (!alreadyVisited) {
      sessionStorage.setItem(storageKey, "true");
      
      // Call background API to register the visit
      fetch("/api/expositores/track-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.ok && typeof data.visits === "number") {
            const countEl = document.getElementById("exp-visitas-count");
            if (countEl) {
              countEl.textContent = `${data.visits} veces`;
            }
          }
        })
        .catch((err) => {
          console.error("Error registering visit:", err);
        });
    }
  }, [slug]);

  return null;
}
