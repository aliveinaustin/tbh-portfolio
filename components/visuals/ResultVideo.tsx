// components/visuals/ResultVideo.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

const POSTER = "/work/gearzn/video/gearzn-tour-poster.webp";

/**
 * The silent, looping site-tour clip in the Result panel. No `autoPlay`
 * attribute — playback is driven entirely through refs (visibility +
 * user pause + reduced motion) so a reduced-motion visitor never sees even
 * a flash of motion before the effect below can stop it; without it, the
 * video simply sits on its poster frame until something starts it.
 */
export default function ResultVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const userPaused = useRef(false);
  const [paused, setPaused] = useState(false);

  const sync = () => {
    const video = videoRef.current;
    if (!video) return;
    if (visible.current && !userPaused.current) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reduced motion: never autoplay — the poster plus an explicit play
    // button is the whole experience unless the visitor asks for motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      userPaused.current = true;
      setPaused(true);
    }

    // Same gating as ScreenDeck/FailureTrace: only play while at least 60%
    // in view, pause the instant it isn't.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0.6 }
    );
    io.observe(video);

    return () => io.disconnect();
  }, []);

  const toggle = () => {
    userPaused.current = !userPaused.current;
    setPaused(userPaused.current);
    sync();
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
        poster={POSTER}
        aria-label="Silent screen recording of the GearZN store: browsing, cart, checkout and order tracking"
        className="w-full rounded-xl border border-border bg-bg"
      >
        <source src="/work/gearzn/video/gearzn-tour.webm" type="video/webm" />
        <source src="/work/gearzn/video/gearzn-tour.mp4" type="video/mp4" />
      </video>

      {/* left, not right: the recording's own UI (a product carousel card)
          sits in the right portion of the frame at this crop; the left
          side stays open background for the whole loop. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={paused ? "Play video" : "Pause video"}
        className="absolute bottom-3 left-3 inline-flex size-7 items-center justify-center rounded-full border border-border bg-bg/80 text-text-muted hover:text-text"
      >
        {paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}
      </button>
    </div>
  );
}
