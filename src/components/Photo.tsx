import Image from "next/image";
import { imageSrc } from "@/lib/api";

type Ratio = "dish" | "landscape" | "portrait" | "hero" | "square";

interface PhotoProps {
  src: string;
  alt: string;
  /** Caption shown as a pill on the photo; omit for none. */
  label?: string;
  ratio?: Ratio;
  /**
   * "cover" fills the box and crops (hero, gallery tiles).
   * "contain" shows the whole dish, uncropped, over a blurred copy of itself so there are no bars.
   */
  fit?: "cover" | "contain";
  className?: string;
  /** Load eagerly and at high priority (hero only). */
  priority?: boolean;
  sizes?: string;
}

/**
 * A fixed-aspect photo slot. Renders next/image when a source exists, otherwise the
 * branded placeholder from the original design so layouts never jump.
 */
export function Photo({ src, alt, label, ratio = "dish", fit = "cover", className = "", priority = false, sizes = "(min-width: 1020px) 33vw, (min-width: 680px) 50vw, 100vw" }: PhotoProps) {
  const classes = ["photo-slot", `ratio-${ratio}`, fit === "contain" ? "photo-contain" : "", className].filter(Boolean).join(" ");
  const resolved = imageSrc(src);
  if (resolved) {
    return (
      <div className={classes}>
        {fit === "contain" ? <Image className="photo-bg" src={resolved} alt="" aria-hidden fill sizes="200px" priority={false} /> : null}
        <Image className={fit === "contain" ? "photo-fg" : undefined} src={resolved} alt={alt} fill sizes={sizes} priority={priority} />
        {label ? <span className="photo-caption">{label}</span> : null}
      </div>
    );
  }
  return (
    <div className={`${classes} photo-placeholder`} role="img" aria-label={`${alt} (photo coming soon)`}>
      <span className="camera-icon" aria-hidden="true" />
      {label ? <span className="photo-caption">{label}</span> : null}
    </div>
  );
}
