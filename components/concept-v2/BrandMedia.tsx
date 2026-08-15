import {
  ASPECT_CSS,
  focalToObjectPosition,
  focalToPreserveAspectRatio,
  type AspectRatio,
  type FocalPoint,
  type MediaScene,
} from "@/lib/concept-v2/media";
import { BrandVideo } from "./BrandVideo";
import styles from "./BrandMedia.module.css";

/**
 * Creative artwork for every marketing piece, drawn as SVG.
 *
 * Real photography would be the right answer in production; for a concept we
 * want zero image weight and no stock-photo placeholders, so each scene is a
 * composed vector still. Gradients live in <MediaDefs />, rendered once per
 * page, so repeated scenes cost almost nothing.
 */

export function MediaDefs() {
  return (
    <svg className={styles.defs} aria-hidden="true" focusable="false">
      <defs>
        {/* Nura Living — cream, taupe, muted rose, olive */}
        <linearGradient id="mk-nura-wall" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#f2e9dd" />
          <stop offset="55%" stopColor="#dfd0bd" />
          <stop offset="100%" stopColor="#c3ae98" />
        </linearGradient>
        <linearGradient id="mk-nura-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b9a48c" />
          <stop offset="100%" stopColor="#8e7963" />
        </linearGradient>
        <linearGradient id="mk-nura-sofa" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#eee3d4" />
          <stop offset="100%" stopColor="#cdb9a2" />
        </linearGradient>
        <linearGradient id="mk-nura-still-bg" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#e6dac9" />
          <stop offset="100%" stopColor="#a9927d" />
        </linearGradient>
        <radialGradient id="mk-nura-light" cx="0.28" cy="0.12" r="0.85">
          <stop offset="0%" stopColor="#fff8ec" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fff8ec" stopOpacity="0" />
        </radialGradient>

        {/* Falak Logistics — navy, orange, steel */}
        <linearGradient id="mk-falak-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1626" />
          <stop offset="42%" stopColor="#20344f" />
          <stop offset="72%" stopColor="#a4523a" />
          <stop offset="100%" stopColor="#f2872f" />
        </linearGradient>
        <linearGradient id="mk-falak-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070f1c" />
          <stop offset="55%" stopColor="#16304f" />
          <stop offset="100%" stopColor="#3c5c7f" />
        </linearGradient>
        <linearGradient id="mk-falak-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#20364f" />
          <stop offset="100%" stopColor="#0a1626" />
        </linearGradient>
        <radialGradient id="mk-falak-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffb367" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffb367" stopOpacity="0" />
        </radialGradient>

        {/* Meezan Advisory — deep teal, charcoal, cream */}
        <linearGradient id="mk-meezan-bg" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#125352" />
          <stop offset="60%" stopColor="#0e3a3a" />
          <stop offset="100%" stopColor="#191d21" />
        </linearGradient>
        <linearGradient id="mk-meezan-glass" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8e2d6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#e8e2d6" stopOpacity="0.06" />
        </linearGradient>

        {/* Dar Sidra — olive, burgundy, warm cream */}
        <linearGradient id="mk-sidra-wall" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#5d6a4c" />
          <stop offset="100%" stopColor="#333c28" />
        </linearGradient>
        <linearGradient id="mk-sidra-light" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4e6cb" />
          <stop offset="100%" stopColor="#c2a878" />
        </linearGradient>
        <linearGradient id="mk-sidra-table-bg" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0%" stopColor="#6b303c" />
          <stop offset="100%" stopColor="#33191f" />
        </linearGradient>
        <linearGradient id="mk-sidra-cloth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eae0ce" />
          <stop offset="100%" stopColor="#c8b79b" />
        </linearGradient>
        <radialGradient id="mk-warm-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffe2b0" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffe2b0" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Scenes
 * ------------------------------------------------------------------ */

function NuraRoom() {
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-nura-wall)" />
      <rect width="400" height="400" fill="url(#mk-nura-light)" />
      {/* window light falling across the wall */}
      <path d="M0 0 L150 0 L86 400 L0 400 Z" fill="#fffaf0" opacity="0.16" />
      <path d="M162 0 L196 0 L132 400 L98 400 Z" fill="#fffaf0" opacity="0.1" />
      {/* floor */}
      <rect y="296" width="400" height="104" fill="url(#mk-nura-floor)" />
      <ellipse cx="180" cy="330" rx="180" ry="26" fill="#efe6da" opacity="0.3" />
      {/* plant */}
      <g opacity="0.92">
        <path
          d="M336 250c-14-26-10-56 6-74-4 24 4 44 14 58Z"
          fill="#6f7357"
        />
        <path d="M336 252c-24-10-40-34-40-58 14 20 32 30 46 40Z" fill="#5d6247" />
        <path d="M340 252c22-14 34-38 32-62-10 22-26 34-40 44Z" fill="#7d8163" />
        <path d="M326 250h28l-5 46h-18Z" fill="#b09578" />
      </g>
      {/* sofa */}
      <g>
        <ellipse cx="176" cy="322" rx="130" ry="14" fill="#6b5946" opacity="0.35" />
        <rect x="54" y="238" width="244" height="52" rx="20" fill="url(#mk-nura-sofa)" />
        <rect x="66" y="272" width="222" height="46" rx="16" fill="#e3d6c4" />
        <rect x="52" y="262" width="34" height="58" rx="16" fill="#d9c9b4" />
        <rect x="268" y="262" width="34" height="58" rx="16" fill="#d9c9b4" />
        <rect x="104" y="248" width="60" height="40" rx="12" fill="#c08c82" opacity="0.85" />
        <rect x="190" y="250" width="52" height="38" rx="12" fill="#b6a58c" opacity="0.8" />
        <rect x="86" y="316" width="10" height="16" rx="3" fill="#7c6750" />
        <rect x="272" y="316" width="10" height="16" rx="3" fill="#7c6750" />
      </g>
    </>
  );
}

function NuraStill() {
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-nura-still-bg)" />
      <rect width="400" height="400" fill="url(#mk-nura-light)" opacity="0.7" />
      <rect y="286" width="400" height="114" fill="#a08a72" />
      <rect y="286" width="400" height="6" fill="#efe6da" opacity="0.5" />
      {/* shadows */}
      <ellipse cx="150" cy="292" rx="96" ry="12" fill="#6d5c48" opacity="0.4" />
      <ellipse cx="272" cy="292" rx="60" ry="10" fill="#6d5c48" opacity="0.35" />
      {/* tall vessel */}
      <path
        d="M118 292c-20 0-30-18-30-44 0-30 16-44 16-62 0-8-4-10-4-16 0-7 7-12 16-12s16 5 16 12c0 6-4 8-4 16 0 18 16 32 16 62 0 26-10 44-30 44Z"
        fill="#efe6da"
      />
      <path
        d="M132 292c14-6 20-22 20-44 0-30-16-44-16-62 0-8 4-10 4-16 0-4-2-7-6-9 6 1 10 5 10 9 0 6-4 8-4 16 0 18 16 32 16 62 0 26-10 44-30 44Z"
        fill="#cbb49a"
      />
      {/* bowl */}
      <path d="M176 250h72c0 26-16 42-36 42s-36-16-36-42Z" fill="#c08c82" />
      <ellipse cx="212" cy="250" rx="36" ry="8" fill="#d9a49a" />
      {/* small cup */}
      <path d="M266 258h44v18c0 10-10 16-22 16s-22-6-22-16Z" fill="#e6dac9" />
      <ellipse cx="288" cy="258" rx="22" ry="6" fill="#f4ece0" />
      <path d="M310 264c10 0 14 6 14 12s-6 10-14 10" stroke="#e6dac9" strokeWidth="6" fill="none" />
    </>
  );
}

function FalakPort() {
  const containers = [
    { x: 30, y: 232, c: "#c8562a" },
    { x: 76, y: 232, c: "#2c4a70" },
    { x: 122, y: 232, c: "#8a9099" },
    { x: 168, y: 232, c: "#c8562a" },
    { x: 214, y: 232, c: "#2c4a70" },
    { x: 260, y: 232, c: "#6b7580" },
    { x: 306, y: 232, c: "#c8562a" },
    { x: 352, y: 232, c: "#2c4a70" },
    { x: 53, y: 258, c: "#2c4a70" },
    { x: 99, y: 258, c: "#c8562a" },
    { x: 145, y: 258, c: "#6b7580" },
    { x: 191, y: 258, c: "#c8562a" },
    { x: 237, y: 258, c: "#2c4a70" },
    { x: 283, y: 258, c: "#c8562a" },
    { x: 329, y: 258, c: "#8a9099" },
    { x: 122, y: 284, c: "#c8562a" },
    { x: 168, y: 284, c: "#2c4a70" },
    { x: 214, y: 284, c: "#6b7580" },
    { x: 260, y: 284, c: "#c8562a" },
  ];
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-falak-sky)" />
      <circle cx="286" cy="214" r="120" fill="url(#mk-falak-sun)" />
      {/* crane gantries */}
      <g fill="#0a1421" opacity="0.9">
        {[40, 150, 262].map((x) => (
          <g key={x}>
            <rect x={x} y="96" width="7" height="140" />
            <rect x={x + 62} y="96" width="7" height="140" />
            <rect x={x - 16} y="88" width="104" height="9" />
            <path d={`M${x - 16} 88 L${x - 54} 62 L${x - 46} 56 L${x - 8} 84 Z`} />
            <rect x={x + 30} y="56" width="6" height="34" />
          </g>
        ))}
      </g>
      {/* quay */}
      <rect y="300" width="400" height="14" fill="#0d1a2b" />
      {/* containers */}
      {containers.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={b.y} width="42" height="24" rx="1.5" fill={b.c} />
          <rect x={b.x} y={b.y} width="42" height="24" rx="1.5" fill="#000" opacity="0.16" />
          <rect x={b.x + 3} y={b.y + 3} width="36" height="18" fill="#fff" opacity="0.05" />
        </g>
      ))}
      {/* water */}
      <rect y="314" width="400" height="86" fill="url(#mk-falak-water)" />
      <g fill="#f2872f" opacity="0.45">
        <rect x="250" y="322" width="76" height="3" rx="1.5" />
        <rect x="236" y="336" width="104" height="3" rx="1.5" />
        <rect x="258" y="350" width="62" height="2.5" rx="1.25" />
        <rect x="228" y="366" width="120" height="2.5" rx="1.25" />
      </g>
    </>
  );
}

function FalakShip() {
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-falak-night)" />
      <circle cx="320" cy="250" r="130" fill="url(#mk-falak-sun)" opacity="0.35" />
      {/* far skyline */}
      <g fill="#0a1626" opacity="0.75">
        <rect x="0" y="214" width="30" height="36" />
        <rect x="34" y="200" width="18" height="50" />
        <rect x="58" y="222" width="40" height="28" />
        <rect x="330" y="206" width="22" height="44" />
        <rect x="358" y="220" width="42" height="30" />
      </g>
      {/* deck containers */}
      <g>
        {[
          { x: 96, y: 196 },
          { x: 136, y: 196 },
          { x: 176, y: 196 },
          { x: 216, y: 196 },
          { x: 116, y: 172 },
          { x: 156, y: 172 },
          { x: 196, y: 172 },
          { x: 136, y: 148 },
          { x: 176, y: 148 },
        ].map((b, i) => (
          <g key={i}>
            <rect
              x={b.x}
              y={b.y}
              width="36"
              height="22"
              fill={i % 3 === 0 ? "#c8562a" : i % 3 === 1 ? "#2c4a70" : "#7b848f"}
            />
            <rect x={b.x} y={b.y} width="36" height="22" fill="#000" opacity="0.22" />
          </g>
        ))}
        <rect x="76" y="218" width="200" height="14" fill="#1b3552" />
        {/* hull */}
        <path d="M64 232h236l-22 46H86Z" fill="#101f33" />
        <path d="M64 232h236l-5 10H69Z" fill="#c8562a" opacity="0.6" />
        {/* bridge */}
        <rect x="248" y="180" width="34" height="38" fill="#16283f" />
        <g fill="#ffcf8f" opacity="0.8">
          <rect x="253" y="188" width="6" height="4" />
          <rect x="263" y="188" width="6" height="4" />
          <rect x="253" y="198" width="6" height="4" />
          <rect x="273" y="198" width="6" height="4" />
        </g>
      </g>
      {/* water */}
      <rect y="278" width="400" height="122" fill="url(#mk-falak-water)" />
      <g fill="#8fb4d8" opacity="0.3">
        <rect x="70" y="288" width="220" height="3" rx="1.5" />
        <rect x="96" y="304" width="170" height="2.5" rx="1.25" />
        <rect x="60" y="322" width="240" height="2.5" rx="1.25" />
        <rect x="110" y="342" width="140" height="2" rx="1" />
      </g>
    </>
  );
}

function MeezanOffice() {
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-meezan-bg)" />
      {/* window bay */}
      <g>
        <rect x="40" y="40" width="320" height="230" fill="url(#mk-meezan-glass)" />
        {[40, 148, 256, 356].map((x) => (
          <rect key={x} x={x} y="34" width="5" height="242" fill="#0b2727" />
        ))}
        <rect x="40" y="150" width="320" height="4" fill="#0b2727" opacity="0.8" />
        {/* city beyond */}
        <g fill="#0b2b2b" opacity="0.55">
          <rect x="62" y="180" width="26" height="90" />
          <rect x="96" y="156" width="18" height="114" />
          <rect x="124" y="196" width="30" height="74" />
          <rect x="170" y="168" width="22" height="102" />
          <rect x="200" y="188" width="34" height="82" />
          <rect x="246" y="160" width="20" height="110" />
          <rect x="274" y="192" width="30" height="78" />
          <rect x="312" y="174" width="24" height="96" />
        </g>
      </g>
      <ellipse cx="120" cy="120" rx="150" ry="110" fill="#e8e2d6" opacity="0.07" />
      {/* table */}
      <rect y="286" width="400" height="114" fill="#191d21" />
      <rect y="286" width="400" height="8" fill="#2b3238" />
      <ellipse cx="200" cy="300" rx="150" ry="12" fill="#e8e2d6" opacity="0.05" />
      {/* objects */}
      <g>
        <rect x="70" y="246" width="96" height="42" rx="3" fill="#e8e2d6" opacity="0.9" />
        <rect x="80" y="256" width="60" height="3" fill="#0e3a3a" opacity="0.5" />
        <rect x="80" y="264" width="76" height="3" fill="#0e3a3a" opacity="0.35" />
        <rect x="80" y="272" width="44" height="3" fill="#0e3a3a" opacity="0.35" />
        <path d="M244 288v-24c0-8 6-14 14-14s14 6 14 14v24Z" fill="#0b2727" />
        <ellipse cx="258" cy="264" rx="14" ry="4" fill="#8fb3ac" opacity="0.6" />
      </g>
    </>
  );
}

function SidraColonnade() {
  const arches = [26, 122, 218, 314];
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-sidra-wall)" />
      {/* lit courtyard beyond the arches */}
      {arches.map((x) => (
        <g key={x}>
          <path
            d={`M${x} 300 L${x} 150 A34 34 0 0 1 ${x + 68} 150 L${x + 68} 300 Z`}
            fill="url(#mk-sidra-light)"
          />
          {/* palm silhouettes inside the opening */}
          <g fill="#3e4a32" opacity="0.55">
            <rect x={x + 30} y="216" width="6" height="84" />
            <path
              d={`M${x + 33} 216c-16-6-26-20-28-34 12 8 22 16 28 24Z`}
            />
            <path d={`M${x + 33} 216c16-6 26-20 28-34-12 8-22 16-28 24Z`} />
            <path d={`M${x + 33} 212c-4-16 0-32 8-42-2 16-4 30-4 42Z`} />
          </g>
          <path
            d={`M${x} 300 L${x} 150 A34 34 0 0 1 ${x + 68} 150 L${x + 68} 300 Z`}
            fill="#2a3220"
            opacity="0.18"
          />
        </g>
      ))}
      {/* columns / piers */}
      <g fill="#4a5539">
        {[0, 96, 192, 288, 384].map((x) => (
          <rect key={x} x={x - 6} y="120" width="32" height="180" />
        ))}
      </g>
      <rect y="112" width="400" height="18" fill="#3e4a32" />
      <rect y="112" width="400" height="4" fill="#c2a878" opacity="0.45" />
      {/* floor with light pools */}
      <rect y="300" width="400" height="100" fill="#2e3623" />
      {arches.map((x) => (
        <path
          key={x}
          d={`M${x + 4} 300 h60 l26 100 h-112 Z`}
          fill="#c2a878"
          opacity="0.2"
        />
      ))}
      <rect y="300" width="400" height="3" fill="#c2a878" opacity="0.3" />
    </>
  );
}

function SidraTable() {
  return (
    <>
      <rect width="400" height="400" fill="url(#mk-sidra-table-bg)" />
      <circle cx="200" cy="70" r="120" fill="url(#mk-warm-glow)" opacity="0.55" />
      {/* pendant lamps */}
      <g>
        {[120, 200, 280].map((x, i) => (
          <g key={x}>
            <rect x={x - 1} y="0" width="2" height={44 + i * 14} fill="#c2a878" opacity="0.6" />
            <path
              d={`M${x - 18} ${72 + i * 14} q18 -26 36 0 Z`}
              fill="#c2a878"
            />
            <circle cx={x} cy={78 + i * 14} r="16" fill="url(#mk-warm-glow)" />
          </g>
        ))}
      </g>
      {/* table */}
      <path d="M-20 280 L420 280 L400 400 L0 400 Z" fill="url(#mk-sidra-cloth)" />
      <path d="M-20 280 L420 280 L418 292 L-18 292 Z" fill="#f4ece0" opacity="0.7" />
      {/* settings */}
      <g>
        {[70, 165, 260, 350].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy={324 + i * 2} rx="34" ry="12" fill="#f2ead9" />
            <ellipse cx={x} cy={322 + i * 2} rx="22" ry="7" fill="#e0d2b8" />
            <ellipse cx={x} cy={322 + i * 2} rx="10" ry="3.5" fill="#5c2733" opacity="0.5" />
          </g>
        ))}
        {[110, 205, 300].map((x) => (
          <g key={x}>
            <path d={`M${x - 7} 290 h14 l-3 22 h-8 Z`} fill="#efe6da" opacity="0.65" />
            <rect x={x - 1.5} y="310" width="3" height="10" fill="#efe6da" opacity="0.5" />
            <ellipse cx={x} cy={321} rx="8" ry="3" fill="#efe6da" opacity="0.5" />
          </g>
        ))}
      </g>
      {/* centrepiece */}
      <g>
        <path d="M186 268h28l-4 26h-20Z" fill="#5c2733" />
        <circle cx="200" cy="262" r="12" fill="#3e4a32" />
        <circle cx="190" cy="256" r="8" fill="#4a5539" />
        <circle cx="210" cy="256" r="7" fill="#4a5539" />
      </g>
    </>
  );
}

const SCENES: Record<MediaScene, () => React.JSX.Element> = {
  "nura-room": NuraRoom,
  "nura-still": NuraStill,
  "falak-port": FalakPort,
  "falak-ship": FalakShip,
  "meezan-office": MeezanOffice,
  "sidra-colonnade": SidraColonnade,
  "sidra-table": SidraTable,
};

export interface BrandMediaProps {
  /** "image" (default) or "video". */
  type?: "image" | "video";
  /** Real asset path. When absent, the generated scene stands in. */
  src?: string;
  srcSet?: string;
  /** Video poster, and the whole frame under reduced motion. */
  poster?: string;
  /** Generated placeholder. Temporary — every scene is due for replacement. */
  scene?: MediaScene;
  alt: string;
  aspect?: AspectRatio;
  /** Anchors the crop. Omit for centre, which is the historical behaviour. */
  focal?: FocalPoint;
  overline?: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Renders one creative at one aspect ratio.
 *
 * Three cases, in order: a real video, a real image, or the generated scene
 * that stands in until a real asset is supplied. Framing is driven by the
 * asset's focal point in every case, so a 16:9 crop of a portrait subject no
 * longer silently takes the middle of the frame.
 */
export function BrandMedia({
  type = "image",
  src,
  srcSet,
  poster,
  scene,
  alt,
  aspect = "16:9",
  focal,
  overline,
  className,
  children,
}: BrandMediaProps) {
  const wrapper = [styles.media, className].filter(Boolean).join(" ");
  const frame = { aspectRatio: ASPECT_CSS[aspect] };

  if (type === "video" && src) {
    return (
      <div className={wrapper} style={frame} role="img" aria-label={alt}>
        <BrandVideo src={src} poster={poster} focal={focal} />
        <span className={styles.vignette} aria-hidden="true" />
        {overline ? <span className={styles.overline}>{overline}</span> : null}
        {children}
      </div>
    );
  }

  // A video with no source yet still shows its poster, if one exists.
  const imageSrc = src ?? (type === "video" ? poster : undefined);

  if (imageSrc) {
    return (
      <div className={wrapper} style={frame}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={styles.canvas}
          src={imageSrc}
          srcSet={srcSet}
          alt={alt}
          loading="lazy"
          decoding="async"
          style={{ objectFit: "cover", objectPosition: focalToObjectPosition(focal) }}
        />
        <span className={styles.vignette} aria-hidden="true" />
        {overline ? <span className={styles.overline}>{overline}</span> : null}
        {children}
      </div>
    );
  }

  const Scene = scene ? SCENES[scene] : null;
  return (
    <div className={wrapper} style={frame} role="img" aria-label={alt}>
      {Scene && (
        <svg
          className={styles.canvas}
          viewBox="0 0 400 400"
          preserveAspectRatio={focalToPreserveAspectRatio(focal)}
          aria-hidden="true"
          focusable="false"
        >
          <Scene />
        </svg>
      )}
      <span className={styles.vignette} aria-hidden="true" />
      {overline ? <span className={styles.overline}>{overline}</span> : null}
      {children}
    </div>
  );
}
