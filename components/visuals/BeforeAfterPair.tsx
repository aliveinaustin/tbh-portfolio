// components/visuals/BeforeAfterPair.tsx
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Zoomable from "@/components/visuals/Zoomable";

type BeforeAfterPairProps = {
  before: string;
  beforeAlt: string;
  after: string;
  afterAlt: string;
};

// Logical (CSS) viewport size every mobile decision screenshot was captured
// at — enough for Zoomable to size the enlarged version's aspect ratio
// correctly; the actual files are a higher-DPR capture of the same ratio.
const WIDTH = 390;
const HEIGHT = 844;

/** Two mobile screenshots with a small arrow between them. Each opens a
 * larger version on click/tap — at this thumbnail size the UI inside is too
 * small to read, so the decision text next to it carries the meaning until
 * someone taps in. */
export default function BeforeAfterPair({ before, beforeAlt, after, afterAlt }: BeforeAfterPairProps) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <Shot src={before} alt={beforeAlt} label="Before" />
      <ArrowRight size={18} aria-hidden="true" className="shrink-0 text-text-faint" />
      <Shot src={after} alt={afterAlt} label="After" />
    </div>
  );
}

function Shot({ src, alt, label }: { src: string; alt: string; label: string }) {
  return (
    <figure className="flex w-28 flex-col items-center gap-2 sm:w-32">
      <Zoomable src={src} alt={alt} width={WIDTH} height={HEIGHT}>
        <div className="relative aspect-390/844 w-full overflow-hidden rounded-xl border border-border bg-bg shadow-xl">
          <Image src={src} alt="" fill sizes="130px" className="object-cover object-top" />
        </div>
      </Zoomable>
      <figcaption className="text-label text-text-faint">{label}</figcaption>
    </figure>
  );
}
