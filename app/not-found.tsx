import TbhBadge from "@/components/ui/TbhBadge";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-page flex-col items-center gap-8 px-margin py-16 text-center">
      <TbhBadge label="404" className="aspect-square h-64 sm:h-80" />
      <p className="text-body text-text-muted">This page doesn&apos;t exist.</p>
      <Button href="/">Back home</Button>
    </div>
  );
}
