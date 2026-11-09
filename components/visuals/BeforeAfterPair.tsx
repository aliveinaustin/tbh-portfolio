// components/visuals/BeforeAfterPair.tsx
import Image from "next/image";
import { ArrowRight } from "lucide-react";

type BeforeAfterPairProps = { before: string; after: string };

/** Two mobile screenshots with a small arrow between them, decorative — the
 * decision text next to it carries the actual meaning. */
export default function BeforeAfterPair({ before, after }: BeforeAfterPairProps) {
  return (
    <div aria-hidden="true" className="flex items-center justify-center gap-3 sm:gap-5">
      <Shot src={before} label="Before" />
      <ArrowRight size={18} className="shrink-0 text-text-faint" />
      <Shot src={after} label="After" />
    </div>
  );
}

function Shot({ src, label }: { src: string; label: string }) {
  return (
    <figure className="flex w-28 flex-col items-center gap-2 sm:w-32">
      <div className="relative aspect-390/844 w-full overflow-hidden rounded-xl border border-border bg-bg shadow-xl">
        <Image src={src} alt="" fill sizes="130px" className="object-cover object-top" />
      </div>
      <figcaption className="text-label text-text-faint">{label}</figcaption>
    </figure>
  );
}
