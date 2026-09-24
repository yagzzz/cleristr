"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Announcement = { id: string; message: string; href: string | null; dismissible: boolean };

function safeHref(href: string | null) {
  return href && (/^\//.test(href) || /^https:\/\//.test(href)) ? href : null;
}

export function AnnouncementRibbon({ announcement }: { announcement: Announcement }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setVisible(window.localStorage.getItem(`cleris_announcement_${announcement.id}`) !== "dismissed"));
    return () => window.cancelAnimationFrame(frame);
  }, [announcement.id]);
  if (!visible) return null;
  const href = safeHref(announcement.href);
  const content = <span className="announcement-message">{announcement.message}</span>;
  return <div className="announcement-ribbon"><div className="site-container flex min-h-10 items-center justify-center gap-3 px-10 text-center text-xs font-bold tracking-wide">{href ? <Link href={href}>{content}</Link> : content}{announcement.dismissible ? <button type="button" onClick={() => { window.localStorage.setItem(`cleris_announcement_${announcement.id}`, "dismissed"); setVisible(false); }} aria-label="Duyuruyu kapat" className="absolute right-3 grid h-9 w-9 place-items-center rounded-[10px] text-white/80 hover:bg-white/10"><X size={16} /></button> : null}</div></div>;
}
