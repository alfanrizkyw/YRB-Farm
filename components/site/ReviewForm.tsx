"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { StarIcon } from "@/components/icons";
import type { Dict } from "@/lib/i18n";

type Props = {
  t: Dict["reviews"];
};

export default function ReviewForm({ t }: Props) {
  const [rating, setRating] = useState(5);
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          city: data.get("city"),
          message: data.get("message"),
          website: data.get("website"),
          rating,
        }),
      });

      if (!res.ok) throw new Error("failed");
      form.reset();
      setRating(5);
      setState("ok");
      setMessage(t.success);
    } catch {
      setState("error");
      setMessage(t.error);
    }
  }

  return (
    <form className="review-form" onSubmit={onSubmit} noValidate>
      <h3>{t.formTitle}</h3>
      <p className="form-note">{t.moderation}</p>

      <div className="form-row">
        <div className="field">
          <label htmlFor="rv-name">{t.name}</label>
          <input id="rv-name" name="name" required minLength={2} maxLength={60} autoComplete="name" placeholder={t.namePlaceholder} />
        </div>
        <div className="field">
          <label htmlFor="rv-city">{t.city}</label>
          <input id="rv-city" name="city" required maxLength={60} autoComplete="address-level2" placeholder={t.cityPlaceholder} />
        </div>
      </div>

      <div className="field">
        <label id="rv-rating-label">{t.rating}</label>
        <div className="rating-pick" role="group" aria-labelledby="rv-rating-label">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              data-on={n <= rating}
              aria-label={`${n}`}
              aria-pressed={n === rating}
              onClick={() => setRating(n)}
            >
              <StarIcon />
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="rv-message">{t.message}</label>
        <textarea id="rv-message" name="message" required minLength={10} maxLength={800} placeholder={t.messagePlaceholder} />
      </div>

      <div className="hp" aria-hidden="true">
        <label htmlFor="rv-website">Website</label>
        <input id="rv-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <button className="btn" type="submit" disabled={state === "sending"}>
        {state === "sending" ? t.sending : t.submit}
      </button>

      <p className="form-msg" data-error={state === "error"} aria-live="polite">
        {message}
      </p>
    </form>
  );
}
