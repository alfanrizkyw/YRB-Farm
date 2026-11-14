"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from "@/components/icons";
import type { Lang } from "@/lib/i18n";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} style={{ opacity: n <= value ? 1 : 0.2 }} />
      ))}
    </span>
  );
}

export default function ReviewsCarousel({
  reviews,
  lang,
  labels,
  empty,
}: {
  reviews: Review[];
  lang: Lang;
  labels: { prev: string; next: string };
  empty: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ start: true, end: false, scrollable: false });

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth - 2;
    setState({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max, scrollable: max > 4 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const move = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>(".review-card");
    const gap = 18;
    const amount = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  if (!reviews.length) {
    return <p className="review-empty">{empty}</p>;
  }

  return (
    <div className="review-carousel">
      <div className="review-track" ref={trackRef}>
        {reviews.slice(0, 12).map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-top">
              <span className="review-avatar" aria-hidden="true">
                {review.name.trim().charAt(0).toUpperCase()}
              </span>
              <div>
                <strong>{review.name}</strong>
                <span>
                  {review.city} · {formatDate(review.createdAt, lang)}
                </span>
              </div>
            </div>
            <Stars value={review.rating} />
            <p>“{review.message}”</p>
          </article>
        ))}
      </div>

      {reviews.length > 1 && state.scrollable ? (
        <div className="review-arrows">
          <button type="button" onClick={() => move(-1)} disabled={state.start} aria-label={labels.prev}>
            <ChevronLeftIcon />
          </button>
          <button type="button" onClick={() => move(1)} disabled={state.end} aria-label={labels.next}>
            <ChevronRightIcon />
          </button>
        </div>
      ) : null}
    </div>
  );
}
