"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { useState } from "react";

export type StoryCard = { id: string; eyebrow: string; title: string; description: string; imageUrl?: string | null; videoUrl?: string | null };

export function getSwipeDirection(offsetX: number, velocityX: number): "next" | "previous" | "stay" {
  if (offsetX <= -48 || velocityX <= -550) return "next";
  if (offsetX >= 48 || velocityX >= 550) return "previous";
  return "stay";
}

export function CardSwipe({ cards }: { cards: StoryCard[] }) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  if (!cards.length) return null;
  const active = cards[index];

  function move(direction: "next" | "previous") {
    setIndex((current) => direction === "next" ? Math.min(cards.length - 1, current + 1) : Math.max(0, current - 1));
  }
  function handleDragEnd(_: PointerEvent, info: PanInfo) {
    const direction = getSwipeDirection(info.offset.x, info.velocity.x);
    if (direction !== "stay") move(direction);
  }

  return <section id="product-stories" className="product-stories" aria-label="Ürün hikâyesi">
    <div className="mb-6 flex items-end justify-between lg:hidden"><div><p className="eyebrow">PRODUCT NOTES</p><h2 className="mt-2 text-3xl font-black tracking-tight">Detayı kaydır.</h2></div><span className="text-sm text-muted">{index + 1} / {cards.length}</span></div>
    <div className="lg:hidden">
      <motion.article key={active.id} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.15} onDragEnd={handleDragEnd} initial={reduceMotion ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: reduceMotion ? 0 : 0.24 }} className="story-card touch-pan-y">
        <StoryMedia card={active} priority />
        <div className="story-card-overlay"><p className="eyebrow text-white/70">{active.eyebrow}</p><h2 className="mt-2 text-4xl font-black tracking-tight">{active.title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{active.description}</p></div>
      </motion.article>
      <div className="mt-4 flex items-center justify-between gap-4"><div className="flex gap-2" role="tablist" aria-label="Ürün hikâyesi kartları">{cards.map((card, cardIndex) => <button type="button" key={card.id} role="tab" aria-selected={index === cardIndex} aria-label={`${card.title} kartını göster`} onClick={() => setIndex(cardIndex)} className={`story-dot ${index === cardIndex ? "story-dot-active" : ""}`} />)}</div><div className="flex gap-2"><button type="button" className="story-arrow" aria-label="Önceki kart" disabled={index === 0} onClick={() => move("previous")}><ArrowLeft size={16} /></button><button type="button" className="story-arrow" aria-label="Sonraki kart" disabled={index === cards.length - 1} onClick={() => move("next")}><ArrowRight size={16} /></button></div></div>
    </div>
    <div className="hidden gap-4 lg:grid lg:grid-cols-3">{cards.map((card, cardIndex) => <article key={card.id} className="story-card story-card-desktop"><StoryMedia card={card} priority={cardIndex === 0} /><div className="story-card-overlay"><p className="eyebrow text-white/70">{card.eyebrow}</p><h2 className="mt-2 text-4xl font-black tracking-tight">{card.title}</h2><p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{card.description}</p></div></article>)}</div>
  </section>;
}

function StoryMedia({ card, priority }: { card: StoryCard; priority: boolean }) {
  if (card.videoUrl) return <video className="h-full w-full object-cover" muted loop playsInline autoPlay preload="metadata"><source src={card.videoUrl} type="video/mp4" /></video>;
  if (card.imageUrl) return <Image src={card.imageUrl} alt="" fill priority={priority} sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />;
  return <div className="h-full w-full bg-stone" />;
}
