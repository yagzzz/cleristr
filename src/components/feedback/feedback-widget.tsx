"use client";

import { MessageCircle, Send, ThumbsDown, ThumbsUp, X } from "lucide-react";
import { useState } from "react";
import type { InterfaceCopy } from "@/i18n/locale";

type FeedbackType = "suggestion" | "bug" | "complaint" | "general";

export function FeedbackWidget({ copy }: { copy: Pick<InterfaceCopy, "feedback" | "feedbackTitle" | "feedbackIdea" | "feedbackIssue" | "feedbackNote" | "feedbackPlaceholder" | "feedbackSuccess" | "feedbackFailure" | "feedbackSending" | "send" | "close"> }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setStatus("");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type, message, pageUrl: window.location.pathname + window.location.search, company: "" }) });
      const result = await response.json() as { ok: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || copy.feedbackFailure);
      setMessage(""); setStatus(copy.feedbackSuccess);
    } catch (error) { setStatus(error instanceof Error ? error.message : copy.feedbackFailure); }
    finally { setPending(false); }
  }

  return <div className="feedback-widget">{open ? <form className="feedback-sheet" onSubmit={submit}><div className="flex items-start justify-between gap-3"><div><p className="eyebrow">CLERIS FEEDBACK</p><h2 className="mt-1 text-xl font-black">{copy.feedbackTitle}</h2></div><button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={copy.close}><X size={18} /></button></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={() => setType("suggestion")} aria-pressed={type === "suggestion"} className={`feedback-choice ${type === "suggestion" ? "feedback-choice-active" : ""}`}><ThumbsUp size={16} /> {copy.feedbackIdea}</button><button type="button" onClick={() => setType("bug")} aria-pressed={type === "bug"} className={`feedback-choice ${type === "bug" ? "feedback-choice-active" : ""}`}><ThumbsDown size={16} /> {copy.feedbackIssue}</button></div><label className="mt-4 block text-sm font-semibold">{copy.feedbackNote}<textarea value={message} onChange={(event) => setMessage(event.target.value)} required minLength={8} maxLength={2000} rows={4} className="feedback-textarea" placeholder={copy.feedbackPlaceholder} /></label><p role="status" aria-live="polite" className="mt-3 text-sm text-muted">{status}</p><button type="submit" disabled={pending} className="primary-button mt-4 w-full"><Send size={16} /> {pending ? copy.feedbackSending : copy.send}</button></form> : <button type="button" onClick={() => setOpen(true)} className="feedback-launch"><MessageCircle size={18} /> {copy.feedback}</button>}</div>;
}
