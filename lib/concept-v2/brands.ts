/**
 * Demo customer ecosystem.
 *
 * Every fictional brand shown anywhere in the /concept-v2 concept is defined
 * here once. Sections and post components read from this file — they never
 * declare their own brand identity, palette or handle.
 */

export type BrandId = "nura" | "falak" | "meezan" | "sidra";

export interface BrandPalette {
  /** Dominant brand colour. */
  primary: string;
  /** Supporting colour, used for secondary surfaces. */
  secondary: string;
  /** Small-area highlight. */
  accent: string;
  /** Darkest value — text on light brand surfaces. */
  ink: string;
  /** Lightest value — brand paper. */
  paper: string;
}

export interface Brand {
  id: BrandId;
  name: string;
  /** Arabic name, where the brand uses one. */
  nameAr?: string;
  category: string;
  /** Short descriptor used under logos in brand pickers. */
  shortCategory: string;
  feel: string;
  palette: BrandPalette;
  /** Social handle, without the @. */
  handle: string;
  website: string;
  /** Which mark BrandMark renders. */
  mark: "arch" | "wing" | "scales" | "canopy";
}

export const BRANDS: Record<BrandId, Brand> = {
  nura: {
    id: "nura",
    name: "Nura Living",
    category: "Premium interiors & home lifestyle",
    shortCategory: "Interiors",
    feel: "Quiet premium interiors",
    palette: {
      primary: "#a9927d", // warm taupe
      secondary: "#6f7357", // olive
      accent: "#c08c82", // muted rose
      ink: "#33291f",
      paper: "#efe6da", // cream
    },
    handle: "nuraliving",
    website: "nuraliving.com",
    mark: "arch",
  },
  falak: {
    id: "falak",
    name: "Falak Logistics",
    nameAr: "فلك للخدمات اللوجستية",
    category: "B2B logistics & regional distribution",
    shortCategory: "Logistics",
    feel: "Modern logistics and infrastructure",
    palette: {
      primary: "#12233d", // dark navy
      secondary: "#f26722", // orange
      accent: "#5b7ba6",
      ink: "#0a1526",
      paper: "#ffffff",
    },
    handle: "falaklogistics",
    website: "falaklogistics.com",
    mark: "wing",
  },
  meezan: {
    id: "meezan",
    name: "Meezan Advisory",
    category: "Professional consulting & advisory",
    shortCategory: "Consulting",
    feel: "Credible, intelligent, executive",
    palette: {
      primary: "#0e4b4a", // deep teal
      secondary: "#22262a", // charcoal
      accent: "#8fb3ac",
      ink: "#0b1c1c",
      paper: "#e8e2d6", // cream
    },
    handle: "meezanadvisory",
    website: "meezanadvisory.com",
    mark: "scales",
  },
  sidra: {
    id: "sidra",
    name: "Dar Sidra",
    nameAr: "دار سِدرة",
    category: "Hospitality — rooms, dining and hosting",
    shortCategory: "Hospitality",
    feel: "Arabic-first hospitality, architectural and warm",
    palette: {
      primary: "#3e4a32", // deep olive
      secondary: "#5c2733", // burgundy
      accent: "#c2a878",
      ink: "#25291d",
      paper: "#eae0ce", // warm cream
    },
    handle: "darsidra",
    website: "darsidra.com",
    mark: "canopy",
  },
};

export const BRAND_LIST: Brand[] = [
  BRANDS.nura,
  BRANDS.falak,
  BRANDS.meezan,
  BRANDS.sidra,
];

export function getBrand(id: BrandId): Brand {
  return BRANDS[id];
}

/** People who appear as executive voices. Kept beside their brand. */
export interface Executive {
  name: string;
  nameAr?: string;
  role: string;
  brandId: BrandId;
  /** Initials used by the generated avatar. */
  initials: string;
  /**
   * The executive's portrait. One asset per person, referenced everywhere
   * that executive appears, so their identity stays consistent across the
   * hero, the fan-out and the brand demo.
   *
   * Until a portrait is supplied, the generated silhouette stands in.
   */
  portrait?: {
    src: string;
    /** Defaults to the executive's name when omitted. */
    alt?: string;
  };
}

export const EXECUTIVES: Record<string, Executive> = {
  ahmed: {
    name: "Ahmed Al Farsi",
    nameAr: "أحمد الفارسي",
    role: "Chief Executive Officer, Falak Logistics",
    brandId: "falak",
    initials: "AF",
  },
  layla: {
    name: "Layla Haddad",
    role: "Founder, Nura Living",
    brandId: "nura",
    initials: "LH",
  },
  huda: {
    name: "Huda Nasser",
    role: "Managing Partner, Meezan Advisory",
    brandId: "meezan",
    initials: "HN",
  },
};
