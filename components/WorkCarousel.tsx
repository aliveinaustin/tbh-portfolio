// components/WorkCarousel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import CaseStudyCard from "@/components/CaseStudyCard";
import type { CaseStudy } from "@/lib/case-studies";

type WorkCarouselProps = {
  studies: CaseStudy[];
};

export default function WorkCarousel({ studies }: WorkCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "keepSnaps",
    loop: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Syncs local state from the Embla instance as soon as it's ready — Embla's
    // documented init pattern, which the stricter set-state-in-effect rule flags.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div>
      {/*
        Embla's own viewport is exactly one slide wide (w-content), so its scroll math
        has zero slack — the last slide can always reach flush-left with no shortfall.
        The visual peek comes from overflow-visible here letting the next slide spill
        out to the right, clipped only by bleed-right's own overflow-hidden at the
        true viewport edge.
      */}
      <div className="bleed-right overflow-hidden">
        <div ref={emblaRef} className="w-content overflow-visible">
          <div className="flex gap-6">
            {studies.map((study, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={study.slug}
                  className={cn(
                    "w-content shrink-0 transition-opacity duration-300 ease-out",
                    isSelected ? "opacity-100" : "opacity-40"
                  )}
                  onClickCapture={(event) => {
                    if (!isSelected) {
                      event.preventDefault();
                      event.stopPropagation();
                      emblaApi?.scrollTo(index);
                    }
                  }}
                >
                  <CaseStudyCard study={study} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Controls realign to the normal page container */}
      <div className="max-w-page mx-auto px-margin">
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-2" role="tablist" aria-label="Select case study">
            {studies.map((study, index) => (
              <button
                key={study.slug}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={study.title}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  "h-1.5 w-6 rounded-full transition-colors",
                  index === selectedIndex ? "bg-accent" : "bg-border hover:bg-text-faint"
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous case study"
              disabled={!canScrollPrev}
              onClick={() => emblaApi?.scrollPrev()}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-text transition hover:bg-surface-high disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next case study"
              disabled={!canScrollNext}
              onClick={() => emblaApi?.scrollNext()}
              className="inline-flex size-10 items-center justify-center rounded-full border border-border text-text transition hover:bg-surface-high disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
