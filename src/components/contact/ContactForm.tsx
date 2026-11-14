"use client";

import { useState, type FormEvent } from "react";
import { ApiError, postContact } from "@/lib/api";

const TOPICS = ["General question", "Menu or ingredients", "Catering or large orders", "Feedback", "Other"];

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setFeedback("");
    try {
      await postContact({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        subject: String(data.get("topic") || ""),
        message: String(data.get("message") || ""),
        website: String(data.get("website") || ""),
      });
      form.reset();
      setState("sent");
      setFeedback("Thanks! Your message is on its way to the restaurant. We'll reply by email.");
    } catch (err) {
      setState("error");
      setFeedback(err instanceof ApiError ? err.friendlyMessage : "We couldn't send your message right now. Please try again or call us.");
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate={false}>
      <label className="form-field">
        Your name
        <input name="name" autoComplete="name" maxLength={100} required />
      </label>
      <label className="form-field">
        Email address
        <input name="email" type="email" autoComplete="email" maxLength={200} required />
      </label>
      <label className="form-field">
        Phone <span className="optional">(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </label>
      <label className="form-field">
        What can we help with?
        <select name="topic" defaultValue={TOPICS[0]}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="form-field">
        Your message
        <textarea name="message" rows={5} minLength={5} maxLength={3000} required />
      </label>
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-green" type="submit" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
      </button>
      <p className={`form-feedback${state === "error" ? " is-error" : ""}`} role="status" aria-live="polite">
        {feedback}
      </p>
    </form>
  );
}
