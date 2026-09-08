"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Page =
  | "home"
  | "search"
  | "product"
  | "free"
  | "pricing"
  | "cart"
  | "assets"
  | "info";
type UserMode = "guest" | "basic" | "pro" | "max";
type AccountTab =
  | "My Assets"
  | "Plan & Unlocks"
  | "My Orders"
  | "Favorites"
  | "Account Settings";
type ModelType = "SketchUp" | "3ds Max";
type InfoKey =
  "about" | "license" | "dmca" | "service" | "terms" | "privacy" | "cookies";
type Model = {
  id: number;
  title: string;
  type: ModelType;
  category: string;
  image: string;
  images?: string[];
  checked: boolean;
  free?: boolean;
  version?: string;
  renderer?: string;
  size: string;
};
type OrderRecord = {
  id: string;
  orderId?: string;
  modelId: number;
  date: string;
  access: string;
  seeded?: boolean;
  status?:
    | "Pending"
    | "Processing"
    | "Paid"
    | "Failed"
    | "Expired"
    | "Refund processing"
    | "Refunded";
};
type BillingRecord = {
  id: string;
  title: string;
  date: string;
  amount: string;
  status:
    | "Pending"
    | "Processing"
    | "Paid"
    | "Failed"
    | "Expired"
    | "Refund processing"
    | "Refunded";
  kind: "Subscription" | "Legacy VIP" | "Legacy credits";
  seeded?: boolean;
};
type LegacyBenefits = {
  welcomeDownloads: number;
  invitationDownloads: number;
  vipCredits: number;
  downloadCredits: number;
  vipActive: boolean;
};
type BenefitChoice =
  | "welcome"
  | "invitation"
  | "vipCredits"
  | "downloadCredits"
  | "planCredits";
const defaultBenefitChoices: BenefitChoice[] = [
  "welcome",
  "invitation",
  "vipCredits",
  "downloadCredits",
  "planCredits",
];
const legacyBenefitMeta = [
  { key: "welcome" as const, balanceKey: "welcomeDownloads" as const, label: "Welcome credit", expires: "Sep 10, 2026" },
  { key: "invitation" as const, balanceKey: "invitationDownloads" as const, label: "Invitation credit", expires: "Sep 30, 2026" },
  { key: "vipCredits" as const, balanceKey: "vipCredits" as const, label: "Legacy VIP credits", expires: "Oct 07, 2026" },
  { key: "downloadCredits" as const, balanceKey: "downloadCredits" as const, label: "Download Credits", expires: "Dec 31, 2026" },
];
type BenefitAllocation = {
  welcome: number;
  invitation: number;
  vipCredits: number;
  downloadCredits: number;
  planCredits: number;
  cashModels: number;
  cashAmount: number;
  vipDiscount: number;
  source:
    | "welcome"
    | "invitation"
    | "vipCredits"
    | "downloadCredits"
    | "planCredits"
    | "cash"
    | "mixed";
};

function allocateBenefits(
  count: number,
  user: UserMode,
  benefits: LegacyBenefits,
  planBalance: number,
  hasLegacyBenefits = false,
  choices: BenefitChoice[] = defaultBenefitChoices,
): BenefitAllocation {
  let remaining = count;
  const take = (available: number) => {
    const used = Math.min(remaining, Math.max(0, available));
    remaining -= used;
    return used;
  };
  const welcome = choices.includes("welcome") && hasLegacyBenefits ? take(benefits.welcomeDownloads) : 0;
  const invitation = choices.includes("invitation") && hasLegacyBenefits ? take(benefits.invitationDownloads) : 0;
  const vipCredits = choices.includes("vipCredits") && hasLegacyBenefits ? take(benefits.vipCredits) : 0;
  const downloadCredits = choices.includes("downloadCredits") && hasLegacyBenefits ? take(benefits.downloadCredits) : 0;
  const planCredits = choices.includes("planCredits") && (user === "pro" || user === "max")
    ? take(planBalance)
    : 0;
  const cashModels = remaining;
  const fullCashAmount = cashModels * 1.99;
  const vipDiscount =
    hasLegacyBenefits && benefits.vipActive ? fullCashAmount * 0.15 : 0;
  const activeSources = [
    welcome && "welcome",
    invitation && "invitation",
    vipCredits && "vipCredits",
    downloadCredits && "downloadCredits",
    planCredits && "planCredits",
    cashModels && "cash",
  ].filter(Boolean) as BenefitAllocation["source"][];
  return {
    welcome,
    invitation,
    vipCredits,
    downloadCredits,
    planCredits,
    cashModels,
    cashAmount: fullCashAmount - vipDiscount,
    vipDiscount,
    source: activeSources.length > 1 ? "mixed" : activeSources[0] || "cash",
  };
}

function allocationSources(
  allocation: BenefitAllocation,
): Array<Exclude<BenefitAllocation["source"], "mixed">> {
  return [
    ...Array(allocation.welcome).fill("welcome"),
    ...Array(allocation.invitation).fill("invitation"),
    ...Array(allocation.vipCredits).fill("vipCredits"),
    ...Array(allocation.downloadCredits).fill("downloadCredits"),
    ...Array(allocation.planCredits).fill("planCredits"),
    ...Array(allocation.cashModels).fill("cash"),
  ] as Array<Exclude<BenefitAllocation["source"], "mixed">>;
}

function entitlementLabel(
  source: Exclude<BenefitAllocation["source"], "mixed">,
  user: UserMode,
  cashUnitPrice = 1.99,
) {
  return source === "welcome"
    ? "Welcome download"
    : source === "invitation"
      ? "Invitation reward"
      : source === "vipCredits"
        ? "Legacy VIP credit"
        : source === "downloadCredits"
          ? "Legacy Download Credit"
          : source === "planCredits"
            ? `${user === "max" ? "Max" : "Pro"} credit`
            : `$${cashUnitPrice.toFixed(2)}`;
}

function formatTransactionDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

const models: Model[] = [
  {
    id: 1,
    title: "Lunaro Modular Sofa",
    type: "3ds Max",
    category: "Sofas",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2021",
    renderer: "Corona",
    size: "286 MB",
  },
  {
    id: 2,
    title: "Noma Lounge Chair",
    type: "SketchUp",
    category: "Chairs",
    image:
      "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2020",
    size: "42 MB",
  },
  {
    id: 3,
    title: "Aster Pendant Light",
    type: "3ds Max",
    category: "Lighting",
    image:
      "https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2022",
    renderer: "V-Ray",
    size: "68 MB",
  },
  {
    id: 4,
    title: "Olive Tree No. 08",
    type: "3ds Max",
    category: "Plants",
    image:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2020",
    renderer: "Corona",
    size: "214 MB",
  },
  {
    id: 5,
    title: "Courtyard House 27",
    type: "SketchUp",
    category: "Architecture",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2021",
    size: "119 MB",
  },
  {
    id: 6,
    title: "Solace Dining Collection",
    type: "3ds Max",
    category: "Dining",
    image:
      "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    free: true,
    version: "2021",
    renderer: "Corona",
    size: "175 MB",
  },
  {
    id: 7,
    title: "Kanso Platform Bed",
    type: "SketchUp",
    category: "Beds",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    free: true,
    version: "2019",
    size: "34 MB",
  },
  {
    id: 8,
    title: "Milo Travertine Table",
    type: "3ds Max",
    category: "Tables",
    image:
      "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=1200&q=88",
    checked: false,
    version: "2020",
    renderer: "V-Ray",
    size: "96 MB",
  },
  {
    id: 9,
    title: "Minimal Kitchen System",
    type: "SketchUp",
    category: "Kitchens",
    image:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    free: true,
    version: "2021",
    size: "71 MB",
  },
  {
    id: 10,
    title: "Atelier Workspace Set",
    type: "3ds Max",
    category: "Office",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2022",
    renderer: "Corona",
    size: "302 MB",
  },
  {
    id: 11,
    title: "Mediterranean Arch Set",
    type: "SketchUp",
    category: "Architecture",
    image:
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    version: "2020",
    size: "88 MB",
  },
  {
    id: 12,
    title: "Botanical Planter Series",
    type: "3ds Max",
    category: "Plants",
    image:
      "https://images.unsplash.com/photo-1493552152660-f915ab47ae9d?auto=format&fit=crop&w=1200&q=88",
    checked: true,
    free: true,
    version: "2021",
    renderer: "Corona",
    size: "127 MB",
  },
];

const collections = [
  { title: "Warm Minimalism", count: 184, image: models[0].image },
  { title: "Architectural Essentials", count: 96, image: models[4].image },
  { title: "Quiet Workspaces", count: 132, image: models[9].image },
  { title: "Natural Living", count: 208, image: models[3].image },
];

const qualityCheckedModels = models.filter((model) => model.checked);
const todayFreeModels: Model[] = Array.from({ length: 40 }, (_, index) => {
  const type: ModelType = index < 20 ? "SketchUp" : "3ds Max",
    matching = qualityCheckedModels.filter((model) => model.type === type),
    source = matching[index % matching.length];
  return {
    ...source,
    id: 100 + index,
    free: true,
    title: `${source.title} ${String(index + 1).padStart(2, "0")}`,
  };
});
const catalog = [...models, ...todayFreeModels];

const infoPages: Record<
  InfoKey,
  { eyebrow: string; title: string; body: string[] }
> = {
  about: {
    eyebrow: "COMPANY INFO",
    title: "About ARCHZZ",
    body: [
      "ARCHZZ provides production-ready 3D assets for architecture, interiors and landscape design, with clear compatibility and file details.",
    ],
  },
  license: {
    eyebrow: "COPYRIGHT & LICENSING",
    title: "Asset License Agreement",
    body: [
      "Use purchased assets in personal and commercial projects, but do not redistribute or resell the source files.",
    ],
  },
  dmca: {
    eyebrow: "COPYRIGHT & LICENSING",
    title: "DMCA Policy",
    body: [
      "Rights holders can ask Customer Service to review an asset by providing the protected work, affected asset and contact details.",
    ],
  },
  service: {
    eyebrow: "HELP",
    title: "Customer Service",
    body: [
      "Get help with accounts, purchases, subscriptions and files; include the model name and software version when reporting an issue.",
    ],
  },
  terms: {
    eyebrow: "LEGAL",
    title: "Terms of Use",
    body: [
      "Use ARCHZZ and its assets in accordance with applicable law and the license attached to each model.",
    ],
  },
  privacy: {
    eyebrow: "LEGAL",
    title: "Privacy Policy",
    body: [
      "ARCHZZ uses account and service information to operate, support and protect the marketplace.",
    ],
  },
  cookies: {
    eyebrow: "LEGAL",
    title: "Cookies",
    body: [
      "Cookies maintain sign-in, remember essential preferences and help us understand service performance.",
    ],
  },
};

function Icon({
  name,
  size = 20,
}: {
  name:
    | "search"
    | "image"
    | "star"
    | "heart"
    | "cartPlus"
    | "cart"
    | "user"
    | "check"
    | "download"
    | "arrow"
    | "grid"
    | "filter"
    | "globe"
    | "close"
    | "menu";
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.2 4.2" />
      </>
    ),
    image: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="m4 18 5-5 4 4 3-3 5 5" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    heart: (
      <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    cart: (
      <>
        <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.3 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </>
    ),
    cartPlus: (
      <>
        <path d="M3 5h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 8H6.2" />
        <path d="M13 9.5v4.2M10.9 11.6h4.2" />
        <circle cx="9.8" cy="20" r="1.1" />
        <circle cx="18" cy="20" r="1.1" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
    check: (
      <>
        <path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5C7.4 20.2 4 17 4 12V6l8-3.5Z" />
        <path d="m8.5 12 2.2 2.2 4.8-5" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m0 0 5-5m-5 5-5-5" />
        <path d="M4 19v2h16v-2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    filter: (
      <>
        <path d="M4 7h16M7 12h10m-7 5h4" />
        <circle cx="8" cy="7" r="1.5" />
        <circle cx="15" cy="12" r="1.5" />
        <circle cx="12" cy="17" r="1.5" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.7 2.5 4.1 5.5 4.1 9s-1.4 6.5-4.1 9c-2.7-2.5-4.1-5.5-4.1-9S9.3 5.5 12 3Z" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}

function ArchzzWordmark() {
  return (
    <svg
      className="archzz-wordmark"
      viewBox="0 0 590 100"
      role="img"
      aria-label="ARCHZZ"
    >
      <text
        x="0"
        y="88"
        textLength="380"
        lengthAdjust="spacingAndGlyphs"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="112"
        fontWeight="700"
        fill="currentColor"
      >
        ARCH
      </text>
      <g transform="translate(395 6) scale(.686 .745)">
        <path
          fill="currentColor"
          transform="translate(0 22) scale(.8)"
          d="M0 0H115V20L38 90H110V110H0V90L77 20H0Z"
        />
        <path fill="#8F1818" d="M108 46L122 38V94L108 102Z" />
        <path
          fill="currentColor"
          transform="translate(138 0)"
          d="M0 0H115V20L38 90H110V110H0V90L77 20H0Z"
        />
      </g>
    </svg>
  );
}

function SearchClearIcon() {
  return (
    <svg
      className="search-clear-icon"
      viewBox="0 0 1024 1024"
      width="16"
      height="16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M512 0C229.272524 0 0 229.272524 0 512s229.272524 512 512 512 512-229.272524 512-512S794.727476 0 512 0z m241.359982 701.667784a36.571429 36.571429 0 1 1-51.71509 51.715091L512 563.715091 322.355108 753.359982a36.571429 36.571429 0 1 1-51.71509-51.71509L460.284909 512 270.640018 322.355108a36.571429 36.571429 0 0 1 51.71509-51.71509L512 460.284909l189.644892-189.644891a36.571429 36.571429 0 0 1 51.71509 51.71509L563.715091 512z" />
    </svg>
  );
}

function GalleryArrowIcon({ direction }: { direction: "left" | "right" }) {
  const path = direction === "left"
    ? "M671.101853 18.085573L202.497843 468.177463a59.972441 59.972441 0 0 0 0 87.271419l468.60401 450.1772a66.114711 66.114711 0 0 0 90.939719 0 59.972441 59.972441 0 0 0 0-87.271419L338.822112 511.855827l423.13415-406.413527a59.972441 59.972441 0 0 0 0-87.356727 65.944092 65.944092 0 0 0-90.939718-0.08531z"
    : "M337.604923 56.083692l432.679385 415.586462a55.374769 55.374769 0 0 1 0 80.580923l-432.679385 415.665231a61.046154 61.046154 0 0 1-83.889231 0 55.374769 55.374769 0 0 1 0-80.580923L644.332308 512 253.636923 136.822154a55.374769 55.374769 0 0 1 0-80.659692 60.888615 60.888615 0 0 1 83.889231-0.07877z";
  return <svg className="gallery-arrow-icon" viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" aria-hidden="true"><path d={path}/></svg>;
}

export default function Prototype() {
  const [page, setPage] = useState<Page>("home"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(models[0]);
  const [favorites, setFavorites] = useState<number[]>([3]),
    [cart, setCart] = useState<number[]>([]),
    [owned, setOwned] = useState<number[]>([]);
  const [user, setUser] = useState<UserMode>("guest"),
    [modal, setModal] = useState<
      | "none"
      | "auth"
      | "checkout"
      | "cartCheckout"
      | "subscriptionCheckout"
      | "subscriptionSuccess"
      | "imageSearch"
      | "cancelRenewal"
      | "license"
      | "success"
    >("none");
  const [authIntent, setAuthIntent] = useState<
    | "none"
    | "primary"
    | "favorite"
    | "cart"
    | "cartCheckout"
    | "plan"
    | "account"
  >("none");
  const [mobileNav, setMobileNav] = useState(false),
    [freeClaimed, setFreeClaimed] = useState(0),
    [toast, setToast] = useState("");
  const [searchType, setSearchType] = useState("All formats"),
    [accountTab, setAccountTab] = useState<AccountTab>("My Assets");
  const [legacyBenefits, setLegacyBenefits] = useState<LegacyBenefits>({
    welcomeDownloads: 3,
    invitationDownloads: 2,
    vipCredits: 8,
    downloadCredits: 12,
    vipActive: true,
  });
  const [hasLegacyBenefits, setHasLegacyBenefits] = useState(false);
  const [benefitChoices, setBenefitChoices] = useState<BenefitChoice[]>([
    ...defaultBenefitChoices,
  ]);
  const [showHistoricalRecords, setShowHistoricalRecords] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [resumingOrderId, setResumingOrderId] = useState<string | null>(null);
  const [pendingAccountTab, setPendingAccountTab] =
    useState<AccountTab>("My Assets");
  const [pendingPlan, setPendingPlan] = useState<"pro" | "max" | null>(null),
    [subscriptionResume, setSubscriptionResume] = useState<
      "none" | "pdp" | "cart"
    >("none"),
    [successCount, setSuccessCount] = useState(1);
  const [successNotice, setSuccessNotice] = useState({
    title: "Model unlocked",
    message: "Ready to download from My Assets.",
  });
  const [searchHistory, setSearchHistory] = useState([
    "Modern sofa",
    "Kitchen island",
    "Olive tree",
  ]);
  const [orders, setOrders] = useState<OrderRecord[]>([
      {
        id: "AZ-REFUND-2408",
        modelId: 2,
        date: "Aug 18, 2026",
        access: "$1.99 refunded · License and download access revoked",
        status: "Refunded",
        seeded: true,
      },
      {
        id: "AZ-REFUNDING-2410",
        modelId: 1,
        date: "Aug 20, 2026",
        access: "Access remains until refund completes",
        status: "Refund processing",
        seeded: true,
      },
      {
        id: "AZ-PENDING-2412",
        modelId: 3,
        date: "Aug 22, 2026",
        access: "Payment required · 11:42 remaining",
        status: "Pending",
        seeded: true,
      },
      {
        id: "AZ-FAILED-2414",
        modelId: 4,
        date: "Aug 24, 2026",
        access: "Payment failed · no access granted",
        status: "Failed",
        seeded: true,
      },
      {
        id: "AZ-PROCESSING-2415",
        modelId: 5,
        date: "Aug 25, 2026",
        access: "Payment received · granting access",
        status: "Processing",
        seeded: true,
      },
      {
        id: "AZ-EXPIRED-2416",
        modelId: 6,
        date: "Aug 26, 2026",
        access: "Payment window expired · no access granted",
        status: "Expired",
        seeded: true,
      },
      {
        id: "AZ-CREDIT-REFUND-2417",
        modelId: 7,
        date: "Aug 27, 2026",
        access: "1 Pro credit returned · License and access revoked",
        status: "Refunded",
        seeded: true,
      },
    ]),
    [billingRecords, setBillingRecords] = useState<BillingRecord[]>([
      {
        id: "BILL-VIP-0726",
        title: "Legacy VIP monthly",
        date: "Jul 26, 2026",
        amount: "$5.00",
        status: "Paid",
        kind: "Legacy VIP",
        seeded: true,
      },
      {
        id: "BILL-CREDIT-0612",
        title: "Download Credits ×45",
        date: "Jun 12, 2026",
        amount: "$10.00",
        status: "Paid",
        kind: "Legacy credits",
        seeded: true,
      },
      {
        id: "BILL-SUB-PENDING-0828",
        title: "Pro monthly subscription",
        date: "Aug 28, 2026",
        amount: "$14.99",
        status: "Pending",
        kind: "Subscription",
        seeded: true,
      },
      {
        id: "BILL-SUB-PROCESSING-0829",
        title: "Max monthly subscription",
        date: "Aug 29, 2026",
        amount: "$49.99",
        status: "Processing",
        kind: "Subscription",
        seeded: true,
      },
      {
        id: "BILL-SUB-FAILED-0830",
        title: "Pro monthly subscription",
        date: "Aug 30, 2026",
        amount: "$14.99",
        status: "Failed",
        kind: "Subscription",
        seeded: true,
      },
      {
        id: "BILL-SUB-EXPIRED-0831",
        title: "Max monthly subscription",
        date: "Aug 31, 2026",
        amount: "$49.99",
        status: "Expired",
        kind: "Subscription",
        seeded: true,
      },
      {
        id: "BILL-LEGACY-REFUNDING-0901",
        title: "Legacy Download Credits",
        date: "Sep 01, 2026",
        amount: "$10.00",
        status: "Refund processing",
        kind: "Legacy credits",
        seeded: true,
      },
      {
        id: "BILL-LEGACY-REFUNDED-0902",
        title: "Legacy VIP monthly",
        date: "Sep 02, 2026",
        amount: "$5.00",
        status: "Refunded",
        kind: "Legacy VIP",
        seeded: true,
      },
    ]),
    [creditUsed, setCreditUsed] = useState(0),
    [infoKey, setInfoKey] = useState<InfoKey>("about");
  function navigate(next: Page) {
    setPage(next);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function rememberSearch(term: string) {
    setSearchHistory((items) =>
      [
        term,
        ...items.filter((item) => item.toLowerCase() !== term.toLowerCase()),
      ].slice(0, 5),
    );
  }
  function search(event?: FormEvent) {
    event?.preventDefault();
    const term = query.trim() || "modern sofa";
    setQuery(term);
    rememberSearch(term);
    navigate("search");
  }
  function searchFor(term: string, type = "All formats") {
    setQuery(term);
    setSearchType(type);
    rememberSearch(term);
    navigate("search");
  }
  function openModel(model: Model) {
    setSelected(model);
    navigate("product");
  }
  function addOrders(ids: number[], access: string | string[]) {
    const date = formatTransactionDate();
    const orderId = `AZ-${Date.now()}`;
    setOrders((items) => [
      ...ids.map((modelId, index) => ({
        id: `${orderId}-ITEM-${index + 1}`,
        orderId,
        modelId,
        date,
        access: Array.isArray(access) ? access[index] : access,
        status: "Paid" as const,
      })),
      ...items,
    ]);
  }
  function openInfo(key: InfoKey) {
    setInfoKey(key);
    navigate("info");
  }
  function toggleFavorite(id: number) {
    if (user === "guest") {
      setSelected(catalog.find((item) => item.id === id) || selected);
      setAuthIntent("favorite");
      return setModal("auth");
    }
    setFavorites((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  }
  function addToCart(id: number) {
    const model = catalog.find((item) => item.id === id);
    if (!model?.checked || model.free || owned.includes(id))
      return setToast(
        model && !model.checked
          ? "This item is unavailable"
          : "This model is already available to you",
      );
    if (user === "guest") {
      setSelected(model);
      setAuthIntent("cart");
      return setModal("auth");
    }
    if (!cart.includes(id) && cart.length >= 30) {
      setToast("Cart limit reached · Maximum 30 models per order");
      return setTimeout(() => setToast(""), 2200);
    }
    setCart((v) => (v.includes(id) ? v : [...v, id]));
    setToast("Added to cart");
    setTimeout(() => setToast(""), 1800);
  }
  function primaryAction(model: Model) {
    setSelected(model);
    setSuccessCount(1);
    if (!model.checked) return setToast("This item is unavailable");
    if (owned.includes(model.id)) {
      setModal("none");
      setToast("Download started");
      return setTimeout(() => setToast(""), 1800);
    }
    if (user === "guest") {
      setAuthIntent("primary");
      return setModal("auth");
    }
    if (model.free) {
      if (freeClaimed >= 3) return setToast("Today’s free limit reached");
      setOwned((v) => [...v, model.id]);
      setFreeClaimed((v) => v + 1);
      addOrders([model.id], "Free download");
      setModal("none");
      setToast("Download started · Saved to My Assets");
      return setTimeout(() => setToast(""), 1800);
    }
    setModal("checkout");
  }
  function authenticate() {
    setUser("basic");
    setHasLegacyBenefits(false);
    setShowHistoricalRecords(false);
    setOwned([]);
    if (authIntent === "favorite") {
      setFavorites((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setModal("none");
      setToast("Saved to Favorites");
    } else if (authIntent === "cart") {
      setCart((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setModal("none");
      setToast("Added to cart");
    } else if (authIntent === "cartCheckout") setModal("cartCheckout");
    else if (authIntent === "primary" && selected.free) {
      if (freeClaimed >= 3) {
        setModal("none");
        setToast("Today’s free limit reached");
      } else {
        setOwned((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
        setFreeClaimed((v) => v + 1);
        addOrders([selected.id], "Free download");
        setModal("none");
        setToast("Download started · Saved to My Assets");
      }
    } else if (authIntent === "primary") setModal("checkout");
    else if (authIntent === "plan" && pendingPlan)
      setModal("subscriptionCheckout");
    else if (authIntent === "account") {
      setAccountTab(pendingAccountTab);
      setModal("none");
      navigate("assets");
    } else {
      setModal("none");
      setToast("Signed in successfully");
    }
    setAuthIntent("none");
  }
  function completePurchase(ids = [selected.id]) {
    const subscribed = user === "pro" || user === "max",
      balance = subscribed ? (user === "max" ? 150 : 30) - creditUsed : 0,
      allocation = allocateBenefits(
        ids.length,
        user,
        legacyBenefits,
        balance,
        hasLegacyBenefits,
        benefitChoices,
      );
    setOwned((v) => Array.from(new Set([...v, ...ids])));
    setCart((v) => v.filter((id) => !ids.includes(id)));
    setLegacyBenefits((current) => ({
      ...current,
      welcomeDownloads: current.welcomeDownloads - allocation.welcome,
      invitationDownloads:
        current.invitationDownloads - allocation.invitation,
      vipCredits: current.vipCredits - allocation.vipCredits,
      downloadCredits: current.downloadCredits - allocation.downloadCredits,
    }));
    if (allocation.planCredits)
      setCreditUsed((v) => v + allocation.planCredits);
    const cashUnitPrice = allocation.cashModels
      ? allocation.cashAmount / allocation.cashModels
      : 1.99;
    const access = allocationSources(allocation).map((source) =>
      entitlementLabel(source, user, cashUnitPrice),
    );
    if (resumingOrderId && ids.length === 1) {
      setOrders((items) =>
        items.map((order) =>
          order.id === resumingOrderId
            ? {
                ...order,
                date: formatTransactionDate(),
                access: access[0],
                status: "Paid",
              }
            : order,
        ),
      );
      setResumingOrderId(null);
    } else {
      addOrders(ids, access);
    }
    setSuccessCount(ids.length);
    setSuccessNotice({
      title: allocation.cashAmount > 0 ? "Purchase complete" : ids.length > 1 ? "Models unlocked" : "Model unlocked",
      message: ids.length > 1
        ? `${ids.length} models were added to My Assets.`
        : `${catalog.find((model) => model.id === ids[0])?.title || "Your model"} is ready in My Assets.`,
    });
    setModal("success");
  }
  function choosePlan(
    mode: "pro" | "max",
    resume: "none" | "pdp" | "cart" = "none",
  ) {
    if (user === mode) return;
    if (user === "max" && mode === "pro") {
      setToast("Cancel Max first; Pro can be selected after the current cycle ends.");
      return;
    }
    setSubscriptionResume(resume);
    setPendingPlan(mode);
    if (user === "guest") {
      setAuthIntent("plan");
      setModal("auth");
    } else {
      setModal("subscriptionCheckout");
    }
  }
  function completeSubscription() {
    if (!pendingPlan) return;
    const upgrading = user === "pro" && pendingPlan === "max";
    const resumeIds =
      subscriptionResume === "pdp"
        ? [selected.id]
        : subscriptionResume === "cart"
          ? cartModels.map((model) => model.id)
          : [];
    const planTotal = pendingPlan === "max" ? 150 : 30;
    const resumeAllocation = allocateBenefits(
      resumeIds.length,
      pendingPlan,
      legacyBenefits,
      upgrading ? planTotal - creditUsed : planTotal,
      hasLegacyBenefits,
      benefitChoices,
    );
    setUser(pendingPlan);
    setCreditUsed(
      (used) => (upgrading ? used : 0) + resumeAllocation.planCredits,
    );
    setAutoRenew(true);
    setBillingRecords((records) => [
      {
        id: `BILL-${Date.now()}`,
        title: upgrading
          ? "Pro to Max upgrade"
          : `${pendingPlan === "max" ? "Max" : "Pro"} monthly subscription`,
        date: formatTransactionDate(),
        amount: upgrading
          ? "$35.00"
          : pendingPlan === "max"
            ? "$49.99"
            : "$14.99",
        status: "Paid",
        kind: "Subscription",
      },
      ...records,
    ]);
    const activatedPlan = pendingPlan === "max" ? "Max" : "Pro";
    if (resumeIds.length) {
      setLegacyBenefits((current) => ({
        ...current,
        welcomeDownloads:
          current.welcomeDownloads - resumeAllocation.welcome,
        invitationDownloads:
          current.invitationDownloads - resumeAllocation.invitation,
        vipCredits: current.vipCredits - resumeAllocation.vipCredits,
        downloadCredits:
          current.downloadCredits - resumeAllocation.downloadCredits,
      }));
      setOwned((items) => Array.from(new Set([...items, ...resumeIds])));
      setCart((items) => items.filter((id) => !resumeIds.includes(id)));
      addOrders(
        resumeIds,
        allocationSources(resumeAllocation).map((source) => {
          const cashUnitPrice = resumeAllocation.cashModels
            ? resumeAllocation.cashAmount / resumeAllocation.cashModels
            : 1.99;
          return entitlementLabel(source, pendingPlan, cashUnitPrice);
        }),
      );
      setSuccessCount(resumeIds.length);
      setSuccessNotice({
        title: upgrading ? "Max upgrade complete" : `${activatedPlan} is active`,
        message: `${resumeIds.length} model${resumeIds.length > 1 ? "s" : ""} unlocked and added to My Assets.`,
      });
      setPendingPlan(null);
      setSubscriptionResume("none");
      setModal("success");
    } else {
      setSuccessNotice({
        title: upgrading ? "Max upgrade complete" : `${activatedPlan} is active`,
        message: `${planTotal} monthly credits are ready. Next renewal: Oct 07, 2026.`,
      });
      setModal("subscriptionSuccess");
    }
  }
  function openAccount(tab: AccountTab) {
    if (user === "guest") {
      setPendingAccountTab(tab);
      setAuthIntent("account");
      setModal("auth");
      return;
    }
    setAccountTab(tab);
    navigate("assets");
  }
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".header");
    const searchSurface = document.querySelector<HTMLElement>(
      page === "home"
        ? ".hero-search"
        : page === "search"
          ? ".workbench-input"
          : ".scroll-search-disabled",
    );
    if (!header || (page !== "home" && page !== "search") || !searchSurface) {
      header?.classList.remove("show-scroll-search");
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) =>
        header.classList.toggle("show-scroll-search", !entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(searchSurface);
    return () => {
      observer.disconnect();
      header.classList.remove("show-scroll-search");
    };
  }, [page]);
  const cartModels = models.filter((model) => cart.includes(model.id));
  return (
    <div className="app-shell">
      <Header
        page={page}
        query={query}
        searchType={searchType}
        cartCount={cart.length}
        user={user}
        mobileNav={mobileNav}
        onMobileNav={setMobileNav}
        onQuery={setQuery}
        onSearch={search}
        onSearchFor={searchFor}
        onNavigate={navigate}
        onAccount={() => openAccount("My Assets")}
        onFavorites={() => openAccount("Favorites")}
      />
      {(page === "home" || page === "search" || page === "product") && (
        <form
          className={`header-scroll-search${page === "product" ? " product-always" : ""}`}
          onSubmit={search}
        >
          <Icon name="search" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <SearchClearIcon />
            </button>
          )}
          <button>Search</button>
        </form>
      )}
      {page === "home" && (
        <Home
          onSearch={search}
          onSearchFor={searchFor}
          query={query}
          searchHistory={searchHistory}
          onQuery={setQuery}
          onNavigate={navigate}
          onOpen={openModel}
          favorites={favorites}
          owned={owned}
          onFavorite={toggleFavorite}
          onCart={addToCart}
          onImageSearch={() => setModal("imageSearch")}
        />
      )}
      {page === "home" && <ExtraCategories onSearchFor={searchFor} />}
      {page === "search" && (
        <SearchResults
          query={query}
          onQuery={setQuery}
          onSearch={search}
          type={searchType}
          onType={setSearchType}
          onOpen={openModel}
          favorites={favorites}
          owned={owned}
          onFavorite={toggleFavorite}
          onCart={addToCart}
          onImageSearch={() => setModal("imageSearch")}
        />
      )}
      {page === "product" && (
        <ProductDetail
          model={selected}
          owned={owned.includes(selected.id)}
          allOwned={owned}
          favorites={favorites}
          user={user}
          creditBalance={(user === "max" ? 150 : 30) - creditUsed}
          hasLegacyBenefits={hasLegacyBenefits}
          favorite={favorites.includes(selected.id)}
          inCart={cart.includes(selected.id)}
          onFavorite={() => toggleFavorite(selected.id)}
          onFavoriteModel={toggleFavorite}
          onPrimary={() => primaryAction(selected)}
          onCart={() => addToCart(selected.id)}
          onCartModel={addToCart}
          onOpen={openModel}
          onPricing={() => navigate("pricing")}
          onLicense={() => setModal("license")}
        />
      )}
      {page === "free" && (
        <FreePage
          claimed={freeClaimed}
          owned={owned}
          onOpen={openModel}
          onClaim={primaryAction}
        />
      )}
      {page === "pricing" && (
        <Pricing
          user={user}
          onChoose={choosePlan}
          onBrowse={() => searchFor("All models")}
        />
      )}
      {page === "cart" && (
        <CartPage
          items={cartModels}
          user={user}
          creditBalance={(user === "max" ? 150 : 30) - creditUsed}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          benefitChoices={benefitChoices}
          onBenefitChoices={setBenefitChoices}
          onRemove={(id) => setCart((v) => v.filter((x) => x !== id))}
          onOpen={openModel}
          onCheckout={() => {
            if (!cartModels.length) return;
            if (user === "guest") {
              setAuthIntent("cartCheckout");
              setModal("auth");
            } else setModal("cartCheckout");
          }}
          onChoosePlan={(plan) => choosePlan(plan, "cart")}
          onPricing={() => navigate("pricing")}
        />
      )}
      {page === "assets" && (
        <Assets
          tab={accountTab}
          onTab={setAccountTab}
          owned={catalog.filter((m) => owned.includes(m.id))}
          favorites={models.filter((m) => favorites.includes(m.id))}
          user={user}
          freeClaimed={freeClaimed}
          creditUsed={creditUsed}
          orders={showHistoricalRecords ? orders : orders.filter((order) => !order.seeded)}
          billingRecords={showHistoricalRecords ? billingRecords : billingRecords.filter((record) => !record.seeded)}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          autoRenew={autoRenew}
          onOpen={openModel}
          onBrowse={() => navigate("search")}
          onPricing={() => navigate("pricing")}
          onDemoDownload={() => setToast("Download started")}
          onOrderAction={(order) => {
            const orderModel = catalog.find((model) => model.id === order.modelId);
            if (!orderModel) return;
            setSelected(orderModel);
            setResumingOrderId(order.id);
            setModal("checkout");
          }}
          onBillingAction={(record) => {
            setPendingPlan(
              record.title.toLowerCase().includes("max") ? "max" : "pro",
            );
            setSubscriptionResume("none");
            setModal("subscriptionCheckout");
          }}
          onToggleRenew={() => {
            if (autoRenew) {
              setModal("cancelRenewal");
            } else {
              setAutoRenew(true);
              setToast("Auto-renewal restored.");
            }
          }}
          onAccountNotice={(message) => {
            setToast(message);
            setTimeout(() => setToast(""), 1800);
          }}
        />
      )}
      {page === "info" && <InfoPage page={infoPages[infoKey]} />}
      <Footer onInfo={openInfo} />
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      {modal !== "none" && (
        <Modal onClose={() => {
          setModal("none");
          setResumingOrderId(null);
        }}>
          {modal === "auth" && <Auth onContinue={authenticate} />}{" "}
          {modal === "checkout" && (
            <Checkout
              models={[selected]}
              user={user}
              planBalance={(user === "max" ? 150 : 30) - creditUsed}
              legacyBenefits={legacyBenefits}
              hasLegacyBenefits={hasLegacyBenefits}
              benefitChoices={benefitChoices}
              onBenefitChoices={setBenefitChoices}
              onPay={() => completePurchase()}
              onUpgrade={() => choosePlan("max", "pdp")}
              onChoosePlan={(plan) => choosePlan(plan, "pdp")}
              onPricing={() => {
                setModal("none");
                navigate("pricing");
              }}
            />
          )}{" "}
          {modal === "cartCheckout" && (
            <Checkout
              models={cartModels}
              user={user}
              planBalance={(user === "max" ? 150 : 30) - creditUsed}
              legacyBenefits={legacyBenefits}
              hasLegacyBenefits={hasLegacyBenefits}
              benefitChoices={benefitChoices}
              onBenefitChoices={setBenefitChoices}
              onPay={() =>
                completePurchase(cartModels.map((model) => model.id))
              }
              onUpgrade={() => choosePlan("max", "cart")}
              onChoosePlan={(plan) => choosePlan(plan, "cart")}
              onPricing={() => {
                setModal("none");
                navigate("pricing");
              }}
            />
          )}{" "}
          {modal === "subscriptionCheckout" && pendingPlan && (
            <SubscriptionCheckout
              plan={pendingPlan}
              upgrading={user === "pro" && pendingPlan === "max"}
              usedCredits={creditUsed}
              unlockCount={
                subscriptionResume === "pdp"
                  ? 1
                  : subscriptionResume === "cart"
                    ? cartModels.length
                    : 0
              }
              legacyBenefits={legacyBenefits}
              hasLegacyBenefits={hasLegacyBenefits}
              benefitChoices={benefitChoices}
              onBenefitChoices={setBenefitChoices}
              onBack={subscriptionResume !== "none" ? () => {
                setModal(subscriptionResume === "cart" ? "none" : "checkout");
                setPendingPlan(null);
                setSubscriptionResume("none");
              } : undefined}
              backLabel={subscriptionResume === "cart" ? "Back to cart" : "Back to one-time purchase"}
              onPay={completeSubscription}
            />
          )}{" "}
          {modal === "imageSearch" && (
            <ImageSearch
              onSearch={() => {
                setModal("none");
                searchFor("Image search");
              }}
            />
          )}{" "}
          {modal === "cancelRenewal" && (
            <CancelRenewal
              onKeep={() => setModal("none")}
              onConfirm={() => {
                setAutoRenew(false);
                setModal("none");
                setToast("Auto-renewal cancelled. Access remains active through Oct 07, 2026.");
              }}
            />
          )}{" "}
          {modal === "subscriptionSuccess" && pendingPlan && (
            <SubscriptionSuccess
              title={successNotice.title}
              message={successNotice.message}
              onClose={() => {
                setModal(
                  subscriptionResume === "pdp"
                    ? "checkout"
                    : subscriptionResume === "cart"
                      ? "cartCheckout"
                      : "none",
                );
                setPendingPlan(null);
                setSubscriptionResume("none");
              }}
              onAccount={() => {
                setModal("none");
                setPendingPlan(null);
                setSubscriptionResume("none");
                openAccount("Plan & Unlocks");
              }}
            />
          )}{" "}
          {modal === "license" && (
            <LicenseSummary
              onFullTerms={() => {
                setModal("none");
                openInfo("license");
              }}
            />
          )}{" "}
          {modal === "success" && (
            <Success
              count={successCount}
              title={successNotice.title}
              message={successNotice.message}
              onClose={() => setModal("none")}
              onDownload={() => {
                setModal("none");
                setToast("Download started");
                setTimeout(() => setToast(""), 1800);
              }}
              onAssets={() => {
                setModal("none");
                openAccount("My Assets");
              }}
            />
          )}
        </Modal>
      )}
      <PrototypeStateControl
        user={user}
        hasLegacyBenefits={hasLegacyBenefits}
        onChange={(state) => {
          setOrders((items) => items.filter((order) => order.seeded));
          setBillingRecords((items) => items.filter((record) => record.seeded));
          setResumingOrderId(null);
          setFavorites([]);
          setCart([]);
          setFreeClaimed(0);
          setBenefitChoices([...defaultBenefitChoices]);
          setLegacyBenefits({
            welcomeDownloads: 3,
            invitationDownloads: 2,
            vipCredits: 8,
            downloadCredits: 12,
            vipActive: true,
          });
          if (state === "guest") {
            setUser("guest");
            setHasLegacyBenefits(false);
            setShowHistoricalRecords(false);
            setCreditUsed(0);
            setOwned([]);
          } else if (state === "new") {
            setUser("basic");
            setHasLegacyBenefits(false);
            setShowHistoricalRecords(false);
            setCreditUsed(0);
            setOwned([]);
          } else if (state === "legacy") {
            setUser("basic");
            setHasLegacyBenefits(true);
            setShowHistoricalRecords(true);
            setCreditUsed(0);
            setOwned([1]);
          } else if (state === "pro") {
            setUser("pro");
            setHasLegacyBenefits(false);
            setShowHistoricalRecords(true);
            setCreditUsed(30);
            setOwned([1]);
          } else {
            setUser("max");
            setHasLegacyBenefits(false);
            setShowHistoricalRecords(true);
            setCreditUsed(148);
            setOwned([1]);
          }
          setAutoRenew(true);
          setModal("none");
        }}
      />
    </div>
  );
}

function PrototypeStateControl({
  user,
  hasLegacyBenefits,
  onChange,
}: {
  user: UserMode;
  hasLegacyBenefits: boolean;
  onChange: (state: "guest" | "new" | "legacy" | "pro" | "max") => void;
}) {
  const value =
    user === "guest"
      ? "guest"
      : hasLegacyBenefits
        ? "legacy"
        : user === "basic"
          ? "new"
          : user;
  return (
    <aside className="demo-control" aria-label="Prototype state">
      <span><i /> Prototype state</span>
      <select value={value} onChange={(event) => onChange(event.target.value as "guest" | "new" | "legacy" | "pro" | "max")}>
        <option value="guest">Guest</option>
        <option value="new">New registered user</option>
        <option value="legacy">Legacy user</option>
        <option value="pro">Pro · 0/30 remaining</option>
        <option value="max">Max · 2/150 remaining</option>
      </select>
    </aside>
  );
}

function ExtraCategories({
  onSearchFor,
}: {
  onSearchFor: (term: string, type?: string) => void;
}) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setTarget(document.querySelector(".category-rail")),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!target) return null;
  const items = [
    { n: "Tables", image: models[7].image },
    { n: "Decor", image: models[5].image },
  ];
  return createPortal(
    <>
      {items.map((item) => (
        <button key={item.n} onClick={() => onSearchFor(item.n)}>
          <img src={item.image} alt="" />
          <span>{item.n}</span>
        </button>
      ))}
    </>,
    target,
  );
}

function Header({
  page,
  query,
  searchType,
  cartCount,
  user,
  mobileNav,
  onMobileNav,
  onQuery,
  onSearch,
  onSearchFor,
  onNavigate,
  onAccount,
  onFavorites,
}: {
  page: Page;
  query: string;
  searchType: string;
  cartCount: number;
  user: UserMode;
  mobileNav: boolean;
  onMobileNav: (v: boolean) => void;
  onQuery: (v: string) => void;
  onSearch: (e?: FormEvent) => void;
  onSearchFor: (term: string, type?: string) => void;
  onNavigate: (p: Page) => void;
  onAccount: () => void;
  onFavorites: () => void;
}) {
  const nav = [
    {
      label: "Home",
      active: page === "home",
      action: () => onNavigate("home"),
    },
    {
      label: "SketchUp Models",
      active: page === "search" && searchType === "SketchUp",
      action: () => onSearchFor("SketchUp models", "SketchUp"),
    },
    {
      label: "3ds Max Models",
      active: page === "search" && searchType === "3ds Max",
      action: () => onSearchFor("3ds Max models", "3ds Max"),
    },
    {
      label: "Today’s Free",
      active: page === "free",
      action: () => onNavigate("free"),
    },
    {
      label: "Pricing",
      active: page === "pricing",
      action: () => onNavigate("pricing"),
    },
  ];
  const accountLabel =
    user === "guest"
      ? "Sign in"
      : user === "pro"
        ? "Pro account"
        : user === "max"
          ? "Max account"
          : "My account";
  return (
    <>
      <header
        className={`header${page === "search" || page === "home" ? " search-listing-header" : ""}`}
      >
        <button className="logo" onClick={() => onNavigate("home")}>
          <ArchzzWordmark />
        </button>
        <nav className={mobileNav ? "nav open" : "nav"}>
          {nav.map((item) => (
            <button
              key={item.label}
              className={item.active ? "active" : ""}
              aria-current={item.active ? "page" : undefined}
              onClick={item.action}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <form className="nav-search" onSubmit={onSearch}>
            <Icon name="search" size={17} />
            <input
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Search models"
              aria-label="Search models"
            />
            <button type="submit">Search</button>
          </form>
          <button
            className="icon-button search-trigger"
            onClick={() => onNavigate("search")}
          >
            <Icon name="search" />
            <span>Search</span>
          </button>
          <button
            className="icon-button hide-mobile"
            onClick={onFavorites}
            aria-label="Favorites"
          >
            <Icon name="heart" />
          </button>
          <button
            className="icon-button language-trigger"
            aria-label="Language"
            title="Language"
          >
            <Icon name="globe" />
          </button>
          <button
            className="icon-button count-wrap"
            onClick={() => onNavigate("cart")}
            aria-label="Cart"
          >
            <Icon name="cart" />
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
          <button className="account-button" onClick={onAccount}>
            <Icon name="user" />
            <span>{accountLabel}</span>
          </button>
          <button
            className="mobile-menu"
            onClick={() => onMobileNav(!mobileNav)}
          >
            <Icon name={mobileNav ? "close" : "menu"} />
          </button>
        </div>
      </header>
    </>
  );
}

function Home({
  query,
  searchHistory,
  onQuery,
  onSearch,
  onSearchFor,
  onNavigate,
  onOpen,
  favorites,
  owned,
  onFavorite,
  onCart,
  onImageSearch,
}: {
  query: string;
  searchHistory: string[];
  onQuery: (v: string) => void;
  onSearch: (e?: FormEvent) => void;
  onSearchFor: (term: string, type?: string) => void;
  onNavigate: (p: Page) => void;
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => void;
  onImageSearch: () => void;
}) {
  return (
    <main>
      <section className="home-intro">
        <div className="home-title-row">
          <div>
            <p className="kicker">ARCHITECTURE · INTERIORS · LANDSCAPE</p>
            <h1>
              Production-ready 3D models.
              <br />
              Found in seconds.
            </h1>
          </div>
          <p>
            Search a million-plus professional assets, inspect the files you’ll
            receive, and unlock exactly what you need.
          </p>
        </div>
        <form className="hero-search" onSubmit={onSearch}>
          <div className="search-mode">Models</div>
          <Icon name="search" size={23} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Try “modular sofa corona”"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <SearchClearIcon />
            </button>
          )}
          <button
            type="button"
            className="image-search"
            title="Search by image"
            aria-label="Search by image"
            onClick={onImageSearch}
          >
            <Icon name="image" />
          </button>
          <button className="search-button">Search</button>
        </form>
        <div className="search-suggestions">
          <div className="quick-row">
            <span>Popular</span>
            {["Sofa", "Kitchen", "Olive tree", "Hotel lobby", "Villa"].map(
              (term) => (
                <button key={term} onClick={() => onSearchFor(term)}>
                  {term}
                </button>
              ),
            )}
          </div>
          <div className="quick-row history-row">
            <span>Recent</span>
            {searchHistory.map((term) => (
              <button key={term} onClick={() => onSearchFor(term)}>
                {term}
              </button>
            ))}
          </div>
        </div>
        <div className="category-rail">
          {[
            { n: "Furniture", image: models[0].image },
            { n: "Lighting", image: models[2].image },
            { n: "Plants", image: models[3].image },
            { n: "Kitchens", image: models[8].image },
            { n: "Interior scenes", image: models[5].image },
            { n: "Architecture", image: models[4].image },
            { n: "Office", image: models[9].image },
            { n: "Landscape", image: models[11].image },
          ].map((item) => (
            <button key={item.n} onClick={() => onSearchFor(item.n)}>
              <img src={item.image} alt="" />
              <span>{item.n}</span>
            </button>
          ))}
        </div>
      </section>
      <ModelSection
        eyebrow=""
        title="Popular models"
        subtitle=""
        items={catalog.filter((model) => model.checked).slice(0, 15)}
        onOpen={onOpen}
        favorites={favorites}
        owned={owned}
        onFavorite={onFavorite}
        onCart={onCart}
        onAll={() => onSearchFor("Popular")}
      />
      <section className="free-strip">
        <div>
          <span className="kicker light">TODAY’S FREE</span>
          <h2>
            40 quality-checked models.
            <br />
            Choose any 3 today.
          </h2>
          <p>
            20 SketchUp and 20 3ds Max assets refresh daily and stay in My
            Assets after download.
          </p>
          <button onClick={() => onNavigate("free")}>
            Explore today’s selection <Icon name="arrow" />
          </button>
        </div>
        <div className="free-collage">
          {models
            .filter((item) => item.free)
            .map((item) => (
              <img key={item.id} src={item.image} alt="" />
            ))}
        </div>
      </section>
      <section className="trust-section">
        <div>
          <Icon name="check" size={28} />
          <b>Quality checked</b>
          <p>Verified files and specifications.</p>
        </div>
        <div>
          <span className="trust-symbol">01</span>
          <b>One model, one clear price</b>
          <p>$1.99 buy once, or unlock with a plan.</p>
        </div>
        <div>
          <span className="trust-symbol">∞</span>
          <b>Keep what you unlock</b>
          <p>Permanent access from My Assets.</p>
        </div>
        <div>
          <Icon name="download" size={28} />
          <b>Clear file details</b>
          <p>Formats, versions and file sizes shown.</p>
        </div>
      </section>
    </main>
  );
}

function SearchResults({
  query,
  onQuery,
  onSearch,
  type,
  onType,
  onOpen,
  favorites,
  owned,
  onFavorite,
  onCart,
  onImageSearch,
}: {
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e?: FormEvent) => void;
  type: string;
  onType: (v: string) => void;
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => void;
  onImageSearch: () => void;
}) {
  const [category, setCategory] = useState("All categories"),
    [keyword, setKeyword] = useState("All keywords"),
    [renderer, setRenderer] = useState("All renderers"),
    [visibleCount, setVisibleCount] = useState(40);
  const keywordOptions = [
      "All keywords",
      "Modern",
      "Minimalist",
      "Wabi-Sabi",
      "Natural",
      "Industrial",
      "Vintage",
    ],
    categoryOptions = [
      "All categories",
      ...Array.from(new Set(catalog.map((item) => item.category))).sort(),
    ];
  const channelQueries = ["sketchup models", "3ds max models"],
    broadDemoQueries = [
      "all models",
      "newest",
      "popular",
      ...channelQueries,
      ...collections.map((item) => item.title.toLowerCase()),
    ];
  const normalized = query.trim().toLowerCase(),
    channelEntry = channelQueries.includes(normalized),
    displayTitle = channelEntry
      ? type === "All formats"
        ? "All models"
        : `${type} models`
      : query || "All models",
    tokens = normalized
      .split(/\s+/)
      .filter(
        (token) => token.length > 2 && !["models", "model"].includes(token),
      );
  const matchesQuery = (item: Model) =>
    !normalized ||
    broadDemoQueries.includes(normalized) ||
    tokens.some((token) =>
      `${item.title} ${item.category} ${item.type} ${item.renderer || ""}`
        .toLowerCase()
        .includes(token),
    );
  const filtered = catalog
      .filter((item) => item.checked)
      .filter(matchesQuery)
      .filter((item) => type === "All formats" || item.type === type)
      .filter(
        (item) => category === "All categories" || item.category === category,
      )
      .filter(
        (item) =>
          keyword === "All keywords" ||
          `${item.title} ${item.category}`
            .toLowerCase()
            .includes(keyword.toLowerCase()),
      )
      .filter(
        (item) => renderer === "All renderers" || item.renderer === renderer,
      ),
    visibleModels = filtered.slice(0, visibleCount);
  useEffect(
    () => {
      const frame = requestAnimationFrame(() => setVisibleCount(40));
      return () => cancelAnimationFrame(frame);
    },
    [query, type, category, keyword, renderer],
  );
  const resetFilters = () => {
    onQuery("");
    onType("All formats");
    setCategory("All categories");
    setKeyword("All keywords");
    setRenderer("All renderers");
  };
  return (
    <main className="search-page">
      <div className="search-workbench">
        <form className="workbench-input" onSubmit={onSearch}>
          <Icon name="search" size={21} />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search models"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onQuery("")}
              aria-label="Clear search"
              title="Clear search"
            >
              <SearchClearIcon />
            </button>
          )}
          <button
            type="button"
            className="workbench-image-search"
            title="Search by image"
            aria-label="Search by image"
            onClick={onImageSearch}
          >
            <Icon name="image" size={19} />
          </button>
          <button className="search-button">Search</button>
        </form>
        <div className="filter-bar">
          <FilterSelect
            value={type}
            onChange={onType}
            options={["All formats", "SketchUp", "3ds Max"]}
          />
          <FilterSelect
            value={category}
            onChange={setCategory}
            options={categoryOptions}
          />
          <FilterSelect
            value={keyword}
            onChange={setKeyword}
            options={keywordOptions}
          />
          <FilterSelect
            value={renderer}
            onChange={setRenderer}
            options={["All renderers", "Corona", "V-Ray"]}
          />
        </div>
      </div>
      <section className="results">
        <div className="results-head">
          <div>
            <p className="kicker">CATALOG RESULTS</p>
            <h1>{displayTitle}</h1>
            <span>{filtered.length} matching models</span>
          </div>
        </div>
        {filtered.length ? (
          <>
            <div className="result-grid">
              {visibleModels.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  onOpen={onOpen}
                  favorite={favorites.includes(model.id)}
                  owned={owned.includes(model.id)}
                  onFavorite={onFavorite}
                  onCart={onCart}
                />
              ))}
            </div>
            <AutoLoadMore
              hasMore={visibleCount < filtered.length}
              onLoad={() =>
                setVisibleCount((count) =>
                  Math.min(count + 20, filtered.length),
                )
              }
            />
          </>
        ) : (
          <div className="empty-state">
            <Icon name="search" size={38} />
            <h2>No matching models.</h2>
            <p>Try a broader term or clear the filters.</p>
            <button className="primary-cta" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ProductDetail({
  model,
  owned,
  allOwned,
  favorites,
  user,
  creditBalance,
  hasLegacyBenefits,
  favorite,
  inCart,
  onFavorite,
  onFavoriteModel,
  onPrimary,
  onCart,
  onCartModel,
  onOpen,
  onPricing,
  onLicense,
}: {
  model: Model;
  owned: boolean;
  allOwned: number[];
  favorites: number[];
  user: UserMode;
  creditBalance: number;
  hasLegacyBenefits: boolean;
  favorite: boolean;
  inCart: boolean;
  onFavorite: () => void;
  onFavoriteModel: (id: number) => void;
  onPrimary: () => void;
  onCart: () => void;
  onCartModel: (id: number) => void;
  onOpen: (m: Model) => void;
  onPricing: () => void;
  onLicense: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const subscribed = user === "pro" || user === "max",
    available = model.checked;
  const sameCategory = catalog.filter(
      (item) =>
        item.checked &&
        item.id !== model.id &&
        item.category === model.category,
    ),
    sameSoftware = catalog.filter(
      (item) =>
        item.checked &&
        item.id !== model.id &&
        item.type === model.type &&
        !sameCategory.some((relatedModel) => relatedModel.id === item.id),
    );
  const related = [...sameCategory, ...sameSoftware];
  const primaryLabel = !available
    ? "Temporarily unavailable"
    : owned
      ? "Download again"
      : model.free
        ? "Free download"
        : subscribed && creditBalance > 0
          ? "Use 1 credit"
          : user === "pro"
            ? "Get this model"
            : "Buy now · $1.99";
  const stats = {
    polygons: (128000 + model.id * 17420).toLocaleString(),
    textures: String(8 + model.id * 3),
    components: String(4 + model.id * 2),
    scenes: String(1 + (model.id % 4)),
    uploaded: `2023-${String((model.id % 9) + 1).padStart(2, "0")}-${String(((model.id * 3) % 27) + 1).padStart(2, "0")}`,
  };
  const sampleGallery = [
    model.image,
    ...models
      .filter((item) => item.id !== model.id)
      .slice((model.id - 1) % 4, ((model.id - 1) % 4) + 3)
      .map((item) => item.image),
  ];
  const galleryImages = model.images?.length
    ? model.images
    : Array.from(new Set(sampleGallery)).slice(0, 4);
  const showPrevious = () =>
      setActiveImage(
        (index) => (index - 1 + galleryImages.length) % galleryImages.length,
      ),
    showNext = () =>
      setActiveImage((index) => (index + 1) % galleryImages.length);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setActiveImage(0));
    return () => cancelAnimationFrame(frame);
  }, [model.id]);
  return (
    <main className="pdp-page">
      <div className="breadcrumbs">
        <span>Home</span><i>/</i><span>{model.type} Models</span><i>/</i><span>{model.category}</span><i>/</i><b>{model.title}</b>
      </div>
      <div className="pdp-main">
        <div className="pdp-gallery">
          <div className="thumbnail-list">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                className={activeImage === index ? "active" : ""}
                onClick={() => setActiveImage(index)}
                aria-label={`Show image ${index + 1}`}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
          <div className="main-image">
            <img
              src={galleryImages[activeImage]}
              alt={`${model.title} · view ${activeImage + 1}`}
            />
            {galleryImages.length > 1 && (
              <>
                <button
                  className="gallery-arrow gallery-previous"
                  onClick={showPrevious}
                  aria-label="Previous image"
                >
                  <GalleryArrowIcon direction="left" />
                </button>
                <button
                  className="gallery-arrow gallery-next"
                  onClick={showNext}
                  aria-label="Next image"
                >
                  <GalleryArrowIcon direction="right" />
                </button>
              </>
            )}
            <button
              className={favorite ? "pdp-image-save saved" : "pdp-image-save"}
              onClick={onFavorite}
              aria-label={
                favorite ? "Remove from favorites" : "Save to favorites"
              }
              title={favorite ? "Saved" : "Save to favorites"}
            >
              <Icon name="heart" size={20} />
            </button>
          </div>
        </div>
        <aside className="buy-panel">
          <div className="product-heading">
            <div>
              <span className="software-label">
                {model.type}
                {model.version ? ` ${model.version}` : ""}
              </span>
              {model.renderer && (
                <span className="software-label">{model.renderer}</span>
              )}
              {available && (
                <span
                  className="quality-label"
                  title="Quality checked"
                  aria-label="Quality checked"
                >
                  <Icon name="check" size={15} />
                </span>
              )}
              {!available && (
                <span className="unavailable-label">Unavailable</span>
              )}
            </div>
            <h1>{model.title}</h1>
          </div>
          <div className={`decision-row ${model.free ? "free-only" : ""}`}>
            <div className="buy-once-price">
              <div className="access-license-row">
                <span className={model.free ? "access-label free" : "access-label paid"}>
                  {model.free ? "FREE" : "PAID"}
                </span>
                <button type="button" className="license-link" onClick={onLicense}>
                  Standard License <span aria-hidden="true">ⓘ</span>
                </button>
              </div>
              <strong>{model.free ? "Free" : "$1.99"}</strong>
            </div>
            {!model.free && <div className="membership-decision">
              {subscribed ? (
                <>
                  <span>YOUR PLAN</span>
                  <strong>{creditBalance > 0 ? "1 credit" : "No credits left"}</strong>
                  <small>
                    {creditBalance} {user === "max" ? "Max" : "Pro"} credits
                    left
                  </small>
                </>
              ) : (
                <>
                  <b>
                    Pro <em>≈ $0.50 / model</em>
                  </b>
                  <b>
                    Max <em>≈ $0.33 / model</em>
                  </b>
                  <button className="membership-link" onClick={onPricing}>
                    Subscribe
                  </button>
                </>
              )}
            </div>}
          </div>
          {hasLegacyBenefits && !model.free && (
            <div className="pdp-legacy-note">
              <b>Legacy benefits available</b>
              <span>Choose at checkout · expiry dates shown</span>
            </div>
          )}
          <section className="asset-details">
            <h2>Asset details</h2>
            <div className="compatibility-row">
              <span>Compatibility</span>
              <strong>
                {model.type}
                {model.version ? ` ${model.version} or newer` : ""}
              </strong>
            </div>
            <div className="asset-grid">
              <Spec label="File size" value={model.size} />
              <Spec label="Upload date" value={stats.uploaded} />
              <Spec label="Commercial use" value="Allowed" />
              <Spec label="Redistribution & resale" value="Not allowed" />
              <Spec label="Polygons" value={stats.polygons} />
              <Spec label="Textures" value={stats.textures} />
              <Spec label="Components" value={stats.components} />
              <Spec label="Scenes" value={stats.scenes} />
            </div>
          </section>
          {owned && (
            <div className="owned-notice">
              <Icon name="check" />
              <span>
                <b>In My Assets · No credit needed</b>
              </span>
            </div>
          )}
          <div className="pdp-actions">
            <button
              className={`primary-cta ${model.free || owned ? "download-primary" : ""}`}
              onClick={onPrimary}
              disabled={!available}
            >
              {primaryLabel}
            </button>
            {available && !model.free && !owned && (
              <button
                className={`cart-cta pdp-cart-icon-cta ${inCart ? "added" : ""}`}
                onClick={onCart}
                disabled={inCart}
                aria-label={inCart ? "Added to cart" : "Add to cart"}
                title={inCart ? "Added to cart" : "Add to cart"}
              >
                {inCart ? (
                  <span className="added-check" aria-hidden="true" />
                ) : (
                  <img src="/cart-card.svg" alt="" aria-hidden="true" />
                )}
              </button>
            )}
          </div>
        </aside>
      </div>
      <ModelSection
        eyebrow=""
        title="Related models"
        subtitle="Similar models."
        items={related}
        onOpen={onOpen}
        favorites={favorites}
        owned={allOwned}
        onFavorite={onFavoriteModel}
        onCart={onCartModel}
      />
    </main>
  );
}

function FreePage({
  claimed,
  owned,
  onOpen,
  onClaim,
}: {
  claimed: number;
  owned: number[];
  onOpen: (m: Model) => void;
  onClaim: (m: Model) => void;
}) {
  const [tab, setTab] = useState<ModelType>("SketchUp");
  return (
    <main className="free-page">
      <section className="free-hero">
        <div>
          <p className="kicker light">TODAY’S FREE · REFRESHES 00:00 UTC</p>
          <h1>Choose any 3 models today.</h1>
          <p>
            Choose from 20 SketchUp and 20 3ds Max models. Downloaded models stay
            in My Assets.
          </p>
        </div>
        <div className="free-counter">
          <span>TODAY’S ALLOWANCE</span>
          <strong>
            {3 - claimed}
            <small>/ 3 left</small>
          </strong>
          <div>
            <i style={{ width: `${(claimed / 3) * 100}%` }} />
          </div>
        </div>
      </section>
      <div className="free-tabs">
        <button
          className={tab === "SketchUp" ? "active" : ""}
          onClick={() => setTab("SketchUp")}
        >
          SketchUp <span>20</span>
        </button>
        <button
          className={tab === "3ds Max" ? "active" : ""}
          onClick={() => setTab("3ds Max")}
        >
          3ds Max <span>20</span>
        </button>
        <p>Choose across both tabs · {claimed} downloaded today</p>
      </div>
      <div className="free-grid">
        {todayFreeModels
          .filter((item) => item.type === tab)
          .map((model) => (
            <div className="free-card" key={model.id}>
              <button className="free-image" onClick={() => onOpen(model)}>
                <img src={model.image} alt={model.title} />
                <span>{model.type}</span>
              </button>
              <div>
                <button onClick={() => onOpen(model)}>{model.title}</button>
                <small>
                  {model.category} · {model.size}
                </small>
                <button
                  className="claim-button"
                  disabled={claimed >= 3 && !owned.includes(model.id)}
                  onClick={() => onClaim(model)}
                >
                  {owned.includes(model.id)
                    ? "Download again"
                    : claimed >= 3
                      ? "Daily limit reached"
                      : "Free download"}
                </button>
              </div>
            </div>
          ))}
      </div>
    </main>
  );
}

function Pricing({
  user,
  onChoose,
  onBrowse,
}: {
  user: UserMode;
  onChoose: (m: "pro" | "max") => void;
  onBrowse: () => void;
}) {
  return (
    <main className="pricing-page">
      <section className="pricing-intro">
        <div>
          <h1>Choose how you access models.</h1>
          <p className="pricing-intro-subtitle">
            Buy once or subscribe—everything you unlock stays yours.
          </p>
        </div>
      </section>
      <div className="price-cards">
        <Plan
          name="Buy once"
          price="$1.99"
          suffix="per model"
          description="For occasional, specific model needs."
          features={[
            "No subscription",
            "Permanent access",
            "Standard commercial license",
          ]}
          button="For comparison"
          current
          onClick={onBrowse}
        />
        <Plan
          name="Pro"
          price="$14.99"
          suffix="per month"
          description="For designers working on active projects."
          features={[
            "30 credits each month",
            "Credits reset each billing month",
            "Unused credits do not roll over",
          ]}
          button={user === "pro" ? "Current plan" : "Choose Pro"}
          current={user === "pro"}
          featured
          onClick={() => onChoose("pro")}
        />
        <Plan
          name="Max"
          price="$49.99"
          suffix="per month"
          description="For high-volume studios and visualizers."
          features={[
            "150 credits each month",
            "Credits reset each billing month",
            "Unused credits do not roll over",
          ]}
          button={user === "max" ? "Current plan" : "Choose Max"}
          current={user === "max"}
          onClick={() => onChoose("max")}
        />
      </div>
      <section className="pricing-rules">
        <h2>Subscription rules</h2>
        {[
          [
            "What happens to unlocked models?",
            "They remain in My Assets with permanent access.",
          ],
          [
            "Do unused credits roll over?",
            "No. Unused credits expire at the end of each billing month.",
          ],
          [
            "Can I cancel?",
            "Your plan remains active until the paid period ends.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

function SubscriptionOffer({
  onChoose,
  onLearnMore,
}: {
  onChoose: (plan: "pro" | "max") => void;
  onLearnMore: () => void;
}) {
  return (
    <div className="subscription-offer">
      <div className="subscription-offer-head">
        <span>SAVE WITH A PLAN</span>
        <button type="button" onClick={onLearnMore}>Learn more</button>
      </div>
      <button type="button" className="subscription-offer-row" onClick={() => onChoose("pro")}>
        <span><b>Pro</b><small>$14.99 / month</small></span>
        <strong>≈ $0.50 / model</strong>
      </button>
      <button type="button" className="subscription-offer-row" onClick={() => onChoose("max")}>
        <span><b>Max</b><small>$49.99 / month</small></span>
        <strong>≈ $0.33 / model</strong>
      </button>
    </div>
  );
}

function BenefitPicker({
  user,
  planBalance,
  legacyBenefits,
  hasLegacyBenefits,
  allocation,
  value,
  onChange,
}: {
  user: UserMode;
  planBalance: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  allocation: BenefitAllocation;
  value: BenefitChoice[];
  onChange: (choices: BenefitChoice[]) => void;
}) {
  const toggle = (choice: BenefitChoice) =>
    onChange(
      value.includes(choice)
        ? value.filter((item) => item !== choice)
        : [...value, choice],
    );
  return (
    <div className="benefit-picker">
      <div className="benefit-picker-head">
        <b>Use benefits</b>
        {hasLegacyBenefits && <span>Applied by expiry date</span>}
      </div>
      {hasLegacyBenefits && legacyBenefitMeta.map((item) => {
        const balance = legacyBenefits[item.balanceKey];
        const used = allocation[item.key];
        if (balance <= 0) return null;
        return (
          <label key={item.key} className={value.includes(item.key) ? "selected" : ""}>
            <input
              type="checkbox"
              checked={value.includes(item.key)}
              onChange={() => toggle(item.key)}
            />
            <span><b>{item.label}</b><small>Expires {item.expires}</small></span>
            <strong>{used ? `${used} used · ` : ""}{Math.max(0, balance - used)} left</strong>
          </label>
        );
      })}
      {(user === "pro" || user === "max") && planBalance > 0 && (
        <label className={value.includes("planCredits") ? "selected" : ""}>
          <input
            type="checkbox"
            checked={value.includes("planCredits")}
            onChange={() => toggle("planCredits")}
          />
          <span><b>{user === "max" ? "Max" : "Pro"} credits</b><small>Cycle ends Oct 07, 2026</small></span>
          <strong>{allocation.planCredits ? `${allocation.planCredits} used · ` : ""}{Math.max(0, planBalance - allocation.planCredits)} left</strong>
        </label>
      )}
      <div className="benefit-cash-row">
        <span><b>Cash fallback</b><small>For models not covered above</small></span>
        <strong>{allocation.cashModels ? `${allocation.cashModels} × $1.99` : "$1.99 / model"}</strong>
      </div>
    </div>
  );
}

function CartPage({
  items,
  user,
  creditBalance,
  legacyBenefits,
  hasLegacyBenefits,
  benefitChoices,
  onBenefitChoices,
  onRemove,
  onOpen,
  onCheckout,
  onChoosePlan,
  onPricing,
}: {
  items: Model[];
  user: UserMode;
  creditBalance: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  benefitChoices: BenefitChoice[];
  onBenefitChoices: (choices: BenefitChoice[]) => void;
  onRemove: (id: number) => void;
  onOpen: (m: Model) => void;
  onCheckout: () => void;
  onChoosePlan: (plan: "pro" | "max") => void;
  onPricing: () => void;
}) {
  const cash = items.length * 1.99,
    allocation = allocateBenefits(
      items.length,
      user,
      legacyBenefits,
      creditBalance,
      hasLegacyBenefits,
      benefitChoices,
    ),
    legacyUsed =
      allocation.welcome +
      allocation.invitation +
      allocation.vipCredits +
      allocation.downloadCredits;
  return (
    <main className="cart-page">
      <div className="cart-title">
        <h1>
          Cart <span>{items.length}</span>
        </h1>
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <Icon name="cart" size={38} />
          <h2>Your cart is empty.</h2>
          <p>Add paid models to buy them together.</p>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {items.map((item) => (
              <article key={item.id}>
                <button onClick={() => onOpen(item)}>
                  <img src={item.image} alt="" />
                </button>
                <div>
                  <span>{item.type}</span>
                  <button onClick={() => onOpen(item)}>{item.title}</button>
                  <small>
                    {item.category} · {item.size} · Standard License
                  </small>
                </div>
                <strong>$1.99</strong>
                <button className="remove" onClick={() => onRemove(item.id)}>
                  <Icon name="close" />
                </button>
              </article>
            ))}
          </section>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div>
              <span>{items.length} models</span>
              <b>${cash.toFixed(2)}</b>
            </div>
            {(hasLegacyBenefits || user === "pro" || user === "max") && (
              <BenefitPicker
                user={user}
                planBalance={creditBalance}
                legacyBenefits={legacyBenefits}
                hasLegacyBenefits={hasLegacyBenefits}
                allocation={allocation}
                value={benefitChoices}
                onChange={onBenefitChoices}
              />
            )}
            {user === "pro" && allocation.cashModels > 0 && (
              <div className="recommend-box upgrade-recommendation">
                <span>RECOMMENDED</span>
                <b>Upgrade to Max</b>
                <p>$35 today · {Math.max(0, 120 + creditBalance)} credits available</p>
                <button type="button" onClick={() => onChoosePlan("max")}>
                  Choose Max
                </button>
              </div>
            )}
            {user === "basic" && allocation.cashModels > 0 && (
              <SubscriptionOffer
                onChoose={onChoosePlan}
                onLearnMore={onPricing}
              />
            )}
            {allocation.cashModels > 0 && allocation.vipDiscount > 0 && (
              <div className="cart-discount-line">
                <span>Legacy VIP discount</span>
                <b>−${allocation.vipDiscount.toFixed(2)}</b>
              </div>
            )}
            {!legacyUsed && !allocation.planCredits && user !== "pro" && (
              <div className="recommend-box">
                <span>BUY ONCE</span>
                <b>${cash.toFixed(2)}</b>
                <p>Permanent access.</p>
              </div>
            )}
            <div className="total">
              <span>Amount due</span>
              <strong>${allocation.cashAmount.toFixed(2)}</strong>
            </div>
            <button className="primary-cta" onClick={onCheckout}>
              Review order
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

function Assets({
  tab,
  onTab,
  owned,
  favorites,
  user,
  freeClaimed,
  creditUsed,
  orders,
  billingRecords,
  legacyBenefits,
  hasLegacyBenefits,
  autoRenew,
  onOpen,
  onBrowse,
  onPricing,
  onToggleRenew,
  onDemoDownload,
  onOrderAction,
  onBillingAction,
  onAccountNotice,
}: {
  tab: AccountTab;
  onTab: (tab: AccountTab) => void;
  owned: Model[];
  favorites: Model[];
  user: UserMode;
  freeClaimed: number;
  creditUsed: number;
  orders: OrderRecord[];
  billingRecords: BillingRecord[];
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  autoRenew: boolean;
  onOpen: (m: Model) => void;
  onBrowse: () => void;
  onPricing: () => void;
  onToggleRenew: () => void;
  onDemoDownload: () => void;
  onOrderAction: (order: OrderRecord) => void;
  onBillingAction: (record: BillingRecord) => void;
  onAccountNotice: (message: string) => void;
}) {
  const items = tab === "Favorites" ? favorites : owned;
  return (
    <main className="account-page">
      <aside>
        <p>ACCOUNT</p>
        {(
          [
            "My Assets",
            "Plan & Unlocks",
            "My Orders",
            "Favorites",
            "Account Settings",
          ] as AccountTab[]
        ).map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => onTab(item)}
          >
            {item}
          </button>
        ))}
      </aside>
      <section>
        <div className="account-head">
          <div>
            <h1>{tab}</h1>
          </div>
          <button className="outline-button" onClick={onBrowse}>
            Browse models
          </button>
        </div>
        {tab === "Plan & Unlocks" ? (
          <PlanUnlocks
            user={user}
            creditUsed={creditUsed}
            freeClaimed={freeClaimed}
            legacyBenefits={legacyBenefits}
            hasLegacyBenefits={hasLegacyBenefits}
            autoRenew={autoRenew}
            onPricing={onPricing}
            onToggleRenew={onToggleRenew}
          />
        ) : tab === "My Orders" ? (
          orders.length || billingRecords.length ? (
            <OrderHistory
              orders={orders}
              billingRecords={
                hasLegacyBenefits
                  ? billingRecords
                  : billingRecords.filter((record) => record.kind === "Subscription")
              }
              models={catalog}
              onOpen={onOpen}
              onAction={onOrderAction}
              onBillingAction={onBillingAction}
            />
          ) : (
            <AccountEmptyState
              icon="cart"
              title="No orders yet"
              text="Purchases and model unlocks appear here."
              note="Access status is shown per model"
              onBrowse={onBrowse}
            />
          )
        ) : tab === "Account Settings" ? (
          <AccountSettings
            onEdit={() =>
              onAccountNotice("Nickname editing is not available here")
            }
          />
        ) : items.length ? (
          <div className={`asset-grid account-cards-grid ${tab === "Favorites" ? "favorites-grid" : ""}`}>
            {items.map((item) => (
              <article key={item.id}>
                <button onClick={() => onOpen(item)}>
                  <img src={item.image} alt="" />
                  <span className="asset-type-tag">{item.type}</span>
                </button>
                <b>{item.title}</b>
                {tab === "My Assets" ? (
                  <button className="download-button" onClick={onDemoDownload}>
                  <Icon name="download" /> Download
                  </button>
                ) : (
                  <button
                    className="download-button"
                    onClick={() => onOpen(item)}
                  >
                    View model
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <AccountEmptyState
            icon={tab === "Favorites" ? "heart" : "download"}
            title={
              tab === "Favorites"
                ? "Save models for later"
                : "Your model library starts here"
            }
            text={
              tab === "Favorites"
                ? "Select the heart to save a model."
                : "Purchased and free models appear here."
            }
            note={
              tab === "Favorites"
                ? "Your shortlist is private"
                : "Available anytime"
            }
            onBrowse={onBrowse}
          />
        )}
      </section>
    </main>
  );
}

function PlanUnlocks({
  user,
  creditUsed,
  freeClaimed,
  legacyBenefits,
  hasLegacyBenefits,
  autoRenew,
  onPricing,
  onToggleRenew,
}: {
  user: UserMode;
  creditUsed: number;
  freeClaimed: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  autoRenew: boolean;
  onPricing: () => void;
  onToggleRenew: () => void;
}) {
  const subscribed = user === "pro" || user === "max";
  const planName = user === "max" ? "Max" : user === "pro" ? "Pro" : "Basic";
  const planCredits = subscribed ? (user === "max" ? 150 : 30) - creditUsed : 0;
  const planTotal = user === "max" ? 150 : 30;
  const usedPercent = subscribed
    ? Math.min(100, Math.round((creditUsed / planTotal) * 100))
    : 0;
  return (
    <div className="plan-account">
      <section className="current-plan-card basic-plan-card">
        <div>
          <h2>{planName}</h2>
          <button onClick={onPricing}>
            {subscribed ? "Manage plan" : "View Pro & Max"}
          </button>
        </div>
        <p>
          {subscribed
            ? `${planCredits} plan credits remaining this month.`
            : "Subscribe for lower per-model pricing."}
        </p>
        {subscribed && (
          <>
            <div className="plan-progress" aria-label={`${planCredits} of ${planTotal} credits remaining`}>
              <div>
                <span>USED {creditUsed}</span>
                <span>REMAINING {planCredits}</span>
              </div>
              <i><b style={{ width: `${usedPercent}%` }} /></i>
              <small>
                {autoRenew
                  ? `Sep 07–Oct 07 · Next charge ${user === "max" ? "$49.99" : "$14.99"}`
                  : "Sep 07–Oct 07 · Ends Oct 07, 2026"}
              </small>
            </div>
            <div className="plan-renewal-row">
              <span>{autoRenew ? "Auto-renewal is on" : "Cancels Oct 07, 2026"}</span>
              <button className="cancel-plan" onClick={onToggleRenew}>
                {autoRenew ? "Cancel renewal" : "Restore renewal"}
              </button>
            </div>
          </>
        )}
      </section>
      <div className="free-credit-row">
        <span>TODAY’S FREE</span>
        <b>{3 - freeClaimed} of 3 remaining</b>
        <small>Refreshes daily at 00:00 UTC</small>
      </div>
      {hasLegacyBenefits && <section className="legacy-benefits">
        <div className="legacy-heading">
          <h3>Legacy benefits</h3>
          <strong>Legacy user</strong>
        </div>
        <div className="legacy-grid">
          <div>
            <span>Welcome credit</span>
            <b>{legacyBenefits.welcomeDownloads} remaining</b>
            <small>Expires Sep 10, 2026</small>
          </div>
          <div>
            <span>Invitation credit</span>
            <b>{legacyBenefits.invitationDownloads} remaining</b>
            <small>Expires Sep 30, 2026</small>
          </div>
          <div>
            <span>Legacy VIP credits</span>
            <b>{legacyBenefits.vipCredits} remaining</b>
            <small>Expires Oct 07, 2026</small>
          </div>
          <div>
            <span>Download Credits</span>
            <b>{legacyBenefits.downloadCredits} remaining</b>
            <small>Expires Dec 31, 2026</small>
          </div>
        </div>
      </section>}
    </div>
  );
}

function OrderHistory({
  orders,
  billingRecords,
  models,
  onOpen,
  onAction,
  onBillingAction,
}: {
  orders: OrderRecord[];
  billingRecords: BillingRecord[];
  models: Model[];
  onOpen: (model: Model) => void;
  onAction: (order: OrderRecord) => void;
  onBillingAction: (record: BillingRecord) => void;
}) {
  const [view, setView] = useState<"models" | "billing">("models");
  return (
    <div className="order-history">
      <div className="history-tabs">
        <button
          className={view === "models" ? "active" : ""}
          onClick={() => setView("models")}
        >
          Model access
        </button>
        <button
          className={view === "billing" ? "active" : ""}
          onClick={() => setView("billing")}
        >
          Billing
        </button>
      </div>
      <div className="order-history-head">
        <span>
          {view === "models" ? orders.length : billingRecords.length}{" "}
          {(view === "models" ? orders.length : billingRecords.length) === 1
            ? "record"
            : "records"}
        </span>
        <small>
          {view === "models"
            ? "Purchases, credits and free downloads"
            : "Subscriptions and legacy paid benefits"}
        </small>
      </div>
      {view === "models" && orders.map((order) => {
        const model = models.find((item) => item.id === order.modelId);
        if (!model) return null;
        const parentOrderId = order.orderId || order.id;
        const siblingItems = orders.filter(
          (item) => (item.orderId || item.id) === parentOrderId,
        );
        const itemPosition = siblingItems.findIndex((item) => item.id === order.id) + 1;
        return (
          <article key={order.id}>
            <button className="order-model" onClick={() => onOpen(model)}>
              <img src={model.image} alt="" />
              <span>
                <small>
                  {model.type.charAt(0).toUpperCase() +
                    model.type.slice(1).toLowerCase()}
                  {model.renderer ? ` · ${model.renderer}` : ""}
                </small>
                <b>{model.title}</b>
              </span>
            </button>
            <div>
              <span>Order</span>
              <b>{parentOrderId.replace("AZ-", "")}</b>
              {siblingItems.length > 1 && (
                <small>Item {itemPosition} of {siblingItems.length}</small>
              )}
            </div>
            <div>
              <span>Date</span>
              <b>{order.date}</b>
            </div>
            <div>
              <span>Access</span>
              <b>{order.access}</b>
            </div>
            <div className="order-state">
              <strong
                className={`order-status ${String(order.status || "Paid").toLowerCase().replace(" ", "-")}`}
              >
                {order.status || "Paid"}
              </strong>
              {order.status === "Pending" && (
                <button className="order-action" onClick={() => onAction(order)}>Continue payment</button>
              )}
              {order.status === "Processing" && <small className="order-wait">Checking payment status…</small>}
            </div>
          </article>
        );
      })}
      {view === "billing" &&
        billingRecords.map((record) => (
          <article className="billing-record" key={record.id}>
            <div className="billing-name">
              <small>{record.kind}</small>
              <b>{record.title}</b>
            </div>
            <div>
              <span>Reference</span>
              <b>{record.id.replace("BILL-", "")}</b>
            </div>
            <div>
              <span>Date</span>
              <b>{record.date}</b>
            </div>
            <div>
              <span>Amount</span>
              <b>{record.amount}</b>
            </div>
            <strong
              className={`order-status ${record.status.toLowerCase().replace(" ", "-")}`}
            >
              {record.status}
            </strong>
            {record.status === "Pending" && record.kind === "Subscription" && (
              <button
                className="order-action"
                onClick={() => onBillingAction(record)}
              >
                Continue payment
              </button>
            )}
          </article>
        ))}
    </div>
  );
}

function AccountSettings({ onEdit }: { onEdit: () => void }) {
  return (
    <div className="account-settings">
      <section>
        <div className="settings-grid">
          <div>
            <span>Nickname</span>
            <b>ArchZZ Designer</b>
            <button onClick={onEdit}>EDIT</button>
          </div>
          <div>
            <span>Email address</span>
            <b>designer@archzz.com</b>
            <small>
              <Icon name="check" size={13} /> Verified
            </small>
          </div>
        </div>
      </section>
    </div>
  );
}

function AccountEmptyState({
  icon,
  title,
  text,
  note,
  onBrowse,
}: {
  icon: "cart" | "heart" | "download";
  title: string;
  text: string;
  note: string;
  onBrowse: () => void;
}) {
  return (
    <div className="account-empty">
      <div className="account-empty-icon">
        <Icon name={icon} size={28} />
      </div>
      <div className="account-empty-copy">
        <span className="account-empty-visual" aria-hidden="true" />
        <h2>{title}</h2>
        <p>{text}</p>
        <button className="primary-cta" onClick={onBrowse}>
          Browse models
        </button>
      </div>
      <p className="account-empty-note">
        <Icon name="check" size={17} />
        {note}
      </p>
    </div>
  );
}

function ModelSection({
  eyebrow,
  title,
  subtitle,
  items,
  onOpen,
  favorites,
  owned,
  onFavorite,
  onCart,
  onAll,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Model[];
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => void;
  onAll?: () => void;
}) {
  const paginated = title === "Related models",
    [visibleCount, setVisibleCount] = useState(paginated ? 20 : items.length),
    visibleItems = paginated ? items.slice(0, visibleCount) : items;
  const firstItemId = items[0]?.id;
  useEffect(
    () => {
      const frame = requestAnimationFrame(() =>
        setVisibleCount(paginated ? 20 : items.length),
      );
      return () => cancelAnimationFrame(frame);
    },
    [paginated, items.length, firstItemId],
  );
  return (
    <section className="model-section">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        action={onAll}
      />
      <div className="home-model-grid">
        {visibleItems.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            onOpen={onOpen}
            favorite={favorites.includes(model.id)}
            owned={owned.includes(model.id)}
            onFavorite={onFavorite}
            onCart={onCart}
          />
        ))}
      </div>
      {paginated && (
        <AutoLoadMore
          hasMore={visibleCount < items.length}
          onLoad={() =>
            setVisibleCount((count) => Math.min(count + 20, items.length))
          }
        />
      )}
    </section>
  );
}
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: () => void;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="kicker">{eyebrow}</p>}
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {action && (
        <button onClick={action}>
          View all <Icon name="arrow" />
        </button>
      )}
    </div>
  );
}
function ModelCard({
  model,
  onOpen,
  favorite,
  owned,
  onFavorite,
  onCart,
}: {
  model: Model;
  onOpen: (m: Model) => void;
  favorite: boolean;
  owned: boolean;
  onFavorite: (id: number) => void;
  onCart: (id: number) => void;
}) {
  const [addedToCart, setAddedToCart] = useState(false);
  const unavailable = !model.checked,
    purchasable = !owned && !model.free && !unavailable,
    freeAction = !owned && model.free && !unavailable,
    saves = 180 + model.id * 39 + (favorite ? 1 : 0);
  return (
    <article className={unavailable ? "model-card unavailable" : "model-card"}>
      <div className="model-image">
        <button onClick={() => onOpen(model)}>
          <img
            src={model.image}
            alt={model.title}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 780px) 50vw, (max-width: 1100px) 33vw, 20vw"
          />
        </button>
        <div className="model-tags">
          <span>{model.type}</span>
          {model.renderer && <span>{model.renderer}</span>}
          {model.checked && (
            <span
              className="quality-tag"
              title="Quality checked"
              aria-label="Quality checked"
            >
              <Icon name="check" size={13} />
            </span>
          )}
          {unavailable && <span>Unavailable</span>}
        </div>
        <button
          className={favorite ? "image-favorite-button active" : "image-favorite-button"}
          onClick={() => onFavorite(model.id)}
          aria-label={
            favorite
              ? `Remove from favorites · ${saves} saves`
              : `Save to favorites · ${saves} saves`
          }
          title={favorite ? "Saved" : "Save to favorites"}
        >
          <Icon name="heart" size={14} />
        </button>
      </div>
      <div className="model-copy">
        <button className="model-title" onClick={() => onOpen(model)}>
          {model.title}
        </button>
        <p>{model.category}</p>
        <div className="model-bottom">
          <strong>
            {unavailable
              ? "Unavailable"
              : owned
                ? "Owned"
                : model.free
                  ? "FREE"
                  : "$1.99"}
          </strong>
          <div className="card-actions">
            <button
              className={
                owned
                  ? "owned-card-action download-icon-action"
                  : addedToCart
                    ? "purchase-card-action cart-icon-action added"
                  : purchasable
                    ? "purchase-card-action cart-icon-action"
                    : freeAction
                      ? "purchase-card-action download-icon-action"
                    : ""
              }
              onClick={() => {
                if (purchasable) {
                  if (!addedToCart) onCart(model.id);
                  setAddedToCart(true);
                } else onOpen(model);
              }}
              disabled={addedToCart}
              aria-label={
                owned
                  ? "Download again"
                  : unavailable
                    ? "View unavailable item"
                    : model.free
                      ? "View free model"
                  : addedToCart
                    ? "Added to cart"
                    : "Add to cart"
              }
            >
              {owned || freeAction ? (
                <img src="/download-card.svg" alt="" aria-hidden="true" />
              ) : addedToCart ? (
                <span className="added-check" aria-hidden="true" />
              ) : purchasable ? (
                <img src="/cart-card.svg" alt="" aria-hidden="true" />
              ) : (
                <Icon
                  name={
                    model.free
                      ? "download"
                      : unavailable
                        ? "arrow"
                        : "cartPlus"
                  }
                  size={18}
                />
              )}
              {owned && <span>Again</span>}
              {purchasable && <span>{addedToCart ? "Added" : "Add"}</span>}
              {freeAction && <span>Free</span>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
function AutoLoadMore({
  hasMore,
  onLoad,
}: {
  hasMore: boolean;
  onLoad: () => void;
}) {
  return (
    <div className={hasMore ? "auto-load-more" : "auto-load-more complete"}>
      {hasMore ? (
        <button type="button" onClick={onLoad}>
          Load more
        </button>
      ) : (
        <span>All results shown</span>
      )}
    </div>
  );
}
function FilterSelect({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: string[];
  onChange?: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false),
    root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className={open ? "filter-select open" : "filter-select"} ref={root}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{value}</span>
        <i aria-hidden="true" />
      </button>
      {open && (
        <div className="filter-select-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              role="option"
              aria-selected={value === option}
              className={value === option ? "selected" : ""}
              onClick={() => {
                onChange?.(option);
                setOpen(false);
              }}
            >
              <span>{option}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}
function Plan({
  name,
  price,
  suffix,
  description,
  features,
  button,
  featured,
  current,
  onClick,
}: {
  name: string;
  price: string;
  suffix: string;
  description: string;
  features: string[];
  button: string;
  featured?: boolean;
  current?: boolean;
  onClick: () => void;
}) {
  return (
    <article className={featured ? "price-card featured" : "price-card"}>
      {featured && <span className="recommended">MOST PRACTICAL</span>}
      <h2>{name}</h2>
      <p>{description}</p>
      <div className="plan-price">
        <strong>
          <span className="price-symbol">{price.slice(0, 1)}</span>
          {price.slice(1)}
        </strong>
        <span>{suffix}</span>
      </div>
      <div className="plan-value-note">
        <span>
          {name === "Buy once"
            ? "1 model per purchase"
            : name === "Pro"
              ? "30 model credits included"
              : "150 model credits included"}
        </span>
        <strong>
          {name === "Buy once"
            ? "$1.99 per model"
            : name === "Pro"
              ? "≈ $0.50 per model*"
              : "≈ $0.33 per model*"}
        </strong>
      </div>
      <button onClick={onClick} disabled={current}>
        {button}
      </button>
      <ul>
        {features.map((item) => (
          <li key={item}>
            <Icon name="check" size={16} />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
function Footer({ onInfo }: { onInfo: (page: InfoKey) => void }) {
  return (
    <footer className="archzz-footer">
      <div className="footer-main">
        <div>
          <b>Company info</b>
          <button onClick={() => onInfo("about")}>About ARCHZZ</button>
          <a
            className="ai-studio-link"
            href="https://ai.archzz.com/"
            target="_blank"
            rel="noreferrer"
          >
            ARCHZZ AI Studio <Icon name="arrow" size={14} />
          </a>
        </div>
        <div>
          <b>Copyright &amp; Licensing</b>
          <button onClick={() => onInfo("license")}>
            Asset License Agreement
          </button>
          <button onClick={() => onInfo("dmca")}>DMCA Policy</button>
        </div>
        <div>
          <b>Help</b>
          <button onClick={() => onInfo("service")}>Customer Service</button>
        </div>
        <div>
          <b>Pay securely via</b>
          <div
            className="payment-methods"
            aria-label="Visa, Mastercard, Dana, GCash, Touch 'n Go and PayPal"
          >
            <span>VISA</span>
            <span className="mastercard">●●</span>
            <span>DANA</span>
            <span>GCash</span>
            <span>TNG</span>
            <span>PayPal</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <small>© 2026 Archzz Pte. Ltd.</small>
        <nav aria-label="Legal">
          <button onClick={() => onInfo("terms")}>Terms of Use</button>
          <button onClick={() => onInfo("privacy")}>Privacy Policy</button>
          <button onClick={() => onInfo("cookies")}>Cookies</button>
        </nav>
      </div>
    </footer>
  );
}
function InfoPage({
  page,
}: {
  page: { eyebrow: string; title: string; body: string[] };
}) {
  return (
    <main className="info-page">
      <p className="kicker">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <div>
        {page.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
}
function Auth({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="auth-modal">
      <p className="kicker">SIGN IN</p>
      <h2>Sign in to continue.</h2>
      <button className="google-button" onClick={onContinue}>
        <img src="/google-g.svg" alt="" aria-hidden="true" />
        Continue with Google
      </button>
      <div className="or">
        <span />
        or
        <span />
      </div>
      <label>
        Email address
        <input type="email" placeholder="you@studio.com" />
      </label>
      <button className="primary-cta" onClick={onContinue}>
        Continue with email
      </button>
      <small>You’ll return here after sign-in.</small>
    </div>
  );
}

function ImageSearch({ onSearch }: { onSearch: () => void }) {
  const [fileName, setFileName] = useState("");
  return (
    <div className="image-search-modal">
      <p className="kicker">IMAGE SEARCH</p>
      <h2>Search by image</h2>
      <label className="image-upload-box">
        <Icon name="image" size={28} />
        <b>{fileName || "Choose an image"}</b>
        <span>JPG, PNG or WebP</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setFileName(event.target.files?.[0]?.name || "")}
        />
      </label>
      <button className="primary-cta" disabled={!fileName} onClick={onSearch}>
        Find similar models
      </button>
    </div>
  );
}

function CancelRenewal({
  onKeep,
  onConfirm,
}: {
  onKeep: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="confirm-modal">
      <p className="kicker">PLAN RENEWAL</p>
      <h2>Cancel auto-renewal?</h2>
      <p>Your plan and remaining credits stay active through Oct 07, 2026.</p>
      <button className="primary-cta" onClick={onKeep}>Keep auto-renewal</button>
      <button className="text-button danger-text" onClick={onConfirm}>Cancel renewal</button>
    </div>
  );
}

function LicenseSummary({ onFullTerms }: { onFullTerms: () => void }) {
  return (
    <div className="license-modal">
      <p className="kicker">STANDARD LICENSE</p>
      <h2>Use models in your projects</h2>
      <ul className="license-allowed">
        <li><Icon name="check" size={17} /> Personal and commercial projects</li>
        <li><Icon name="check" size={17} /> Rendered images and videos</li>
      </ul>
      <div className="license-prohibited">
        <b>Not allowed</b>
        <p>Redistributing, sharing or reselling the source model files.</p>
      </div>
      <button className="text-button" type="button" onClick={onFullTerms}>
        View full license terms
      </button>
    </div>
  );
}

function Checkout({
  models,
  user,
  planBalance,
  legacyBenefits,
  hasLegacyBenefits,
  benefitChoices,
  onBenefitChoices,
  onPay,
  onUpgrade,
  onChoosePlan,
  onPricing,
}: {
  models: Model[];
  user: UserMode;
  planBalance: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  benefitChoices: BenefitChoice[];
  onBenefitChoices: (choices: BenefitChoice[]) => void;
  onPay: () => void;
  onUpgrade: () => void;
  onChoosePlan: (plan: "pro" | "max") => void;
  onPricing: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"PayPal" | "Antom">("PayPal");
  const allocation = allocateBenefits(
      models.length,
      user,
      legacyBenefits,
      planBalance,
      hasLegacyBenefits,
      benefitChoices,
    ),
    sources = allocationSources(allocation),
    cashUnitPrice = allocation.cashModels
      ? allocation.cashAmount / allocation.cashModels
      : 1.99;
  return (
    <div className="checkout-modal">
      <p className="kicker">ORDER REVIEW</p>
      <h2>Review order</h2>
      {models.map((model, index) => (
        <div className="checkout-item" key={model.id}>
          <img src={model.image} alt="" />
          <span>
            <b>{model.title}</b>
            <small>{model.type} · Permanent access</small>
          </span>
          <strong>
            {sources[index] === "cash" ? `$${cashUnitPrice.toFixed(2)}` : "Covered"}
          </strong>
        </div>
      ))}
      {(hasLegacyBenefits || user === "pro" || user === "max") && (
        <BenefitPicker
          user={user}
          planBalance={planBalance}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          allocation={allocation}
          value={benefitChoices}
          onChange={onBenefitChoices}
        />
      )}
      {allocation.cashModels > 0 && allocation.vipDiscount > 0 ? (
        <div className="checkout-lines">
          <span><b>Subtotal</b><strong>${(models.length * 1.99).toFixed(2)}</strong></span>
          <span><b>Legacy VIP discount</b><strong>−${allocation.vipDiscount.toFixed(2)}</strong></span>
        </div>
      ) : null}
      <div className="checkout-total">
        <span>Due today</span>
        <strong>${allocation.cashAmount.toFixed(2)}</strong>
      </div>
      {user === "pro" && allocation.cashModels > 0 && (
        <div className="checkout-upgrade-option">
          <span>RECOMMENDED</span>
          <b>Upgrade to Max</b>
          <small>$35 today · {Math.max(0, 120 + planBalance)} credits available</small>
          <button type="button" onClick={onUpgrade}>Choose Max</button>
        </div>
      )}
      {user === "basic" && allocation.cashModels > 0 && (
        <SubscriptionOffer onChoose={onChoosePlan} onLearnMore={onPricing} />
      )}
      {allocation.cashAmount > 0 && (
        <>
          <p className="payment-section-title">Select payment method</p>
          <label className="payment-option">
            <input
              type="radio"
              name="payment-channel"
              checked={paymentMethod === "PayPal"}
              onChange={() => setPaymentMethod("PayPal")}
            />
            <img
              className="payment-logo paypal-logo"
              src="/paypal-logo.png"
              alt="PayPal"
            />
            <b>PayPal</b>
          </label>
          <label className="payment-option">
            <input
              type="radio"
              name="payment-channel"
              checked={paymentMethod === "Antom"}
              onChange={() => setPaymentMethod("Antom")}
            />
            <img
              className="payment-logo antom-logo"
              src="/antom-logo.png"
              alt="Antom"
            />
            <b>Antom</b>
          </label>
        </>
      )}
      <button className="primary-cta" onClick={onPay}>
        {allocation.cashAmount > 0
          ? `Continue to ${paymentMethod}`
          : "Confirm access"}
      </button>
      <p className="legal-note">
        By continuing, you agree to the Terms, Refund Policy and Standard License.
        Final amount is shown by your payment provider.
      </p>
    </div>
  );
}

function SubscriptionCheckout({
  plan,
  upgrading,
  usedCredits,
  unlockCount,
  legacyBenefits,
  hasLegacyBenefits,
  benefitChoices,
  onBenefitChoices,
  onBack,
  backLabel = "Back to one-time purchase",
  onPay,
}: {
  plan: "pro" | "max";
  upgrading: boolean;
  usedCredits: number;
  unlockCount: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  benefitChoices: BenefitChoice[];
  onBenefitChoices: (choices: BenefitChoice[]) => void;
  onBack?: () => void;
  backLabel?: string;
  onPay: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"PayPal" | "Antom" | "DANA">("PayPal");
  const planName = plan === "max" ? "Max" : "Pro";
  const price = upgrading ? 35 : plan === "max" ? 49.99 : 14.99;
  const renewalPrice = plan === "max" ? 49.99 : 14.99;
  const credits = plan === "max" ? 150 : 30;
  const planBalance = upgrading ? Math.max(0, credits - usedCredits) : credits;
  const orderAllocation = allocateBenefits(
    unlockCount,
    plan,
    legacyBenefits,
    planBalance,
    hasLegacyBenefits,
    benefitChoices,
  );
  const dueToday = price + orderAllocation.cashAmount;
  return (
    <div className="checkout-modal subscription-checkout">
      {onBack && (
        <button type="button" className="checkout-back" onClick={onBack}>
          <span aria-hidden="true">←</span> {backLabel}
        </button>
      )}
      <p className="kicker">SUBSCRIPTION CHECKOUT</p>
      <h2>{upgrading ? "Upgrade to Max" : `Start ${planName}`}</h2>
      <div className="subscription-summary">
        <span>{planName} plan</span>
        <b>
          {upgrading
            ? `${Math.max(0, credits - usedCredits)} credits available`
            : `${credits} credits / month`}
        </b>
        <small>
          {unlockCount > 0
            ? `${unlockCount} model${unlockCount > 1 ? "s" : ""} unlocked after payment.`
            : upgrading
            ? "Used Pro credits carry over."
            : "Unlocked models stay in My Assets."}
        </small>
      </div>
      {unlockCount > 0 && (
        <BenefitPicker
          user={plan}
          planBalance={planBalance}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          allocation={orderAllocation}
          value={benefitChoices}
          onChange={onBenefitChoices}
        />
      )}
      {orderAllocation.cashAmount > 0 && (
        <div className="checkout-lines">
          <span><b>{planName} plan</b><strong>${price.toFixed(2)}</strong></span>
          <span><b>Models not covered by credits</b><strong>${orderAllocation.cashAmount.toFixed(2)}</strong></span>
        </div>
      )}
      <div className="checkout-total">
        <span>Due today</span>
        <strong>${dueToday.toFixed(2)}</strong>
      </div>
      <p className="payment-section-title">Subscription payment method</p>
      <label className="payment-option">
        <input
          type="radio"
          name="subscription-payment"
          checked={paymentMethod === "PayPal"}
          onChange={() => setPaymentMethod("PayPal")}
        />
        <img className="payment-logo paypal-logo" src="/paypal-logo.png" alt="PayPal" />
        <b>PayPal</b>
      </label>
      <label className="payment-option">
        <input
          type="radio"
          name="subscription-payment"
          checked={paymentMethod === "Antom"}
          onChange={() => setPaymentMethod("Antom")}
        />
        <img className="payment-logo antom-logo" src="/antom-logo.png" alt="Antom" />
        <b>Antom</b>
      </label>
      <label className="payment-option">
        <input
          type="radio"
          name="subscription-payment"
          checked={paymentMethod === "DANA"}
          onChange={() => setPaymentMethod("DANA")}
        />
        <span className="dana-wordmark">DANA</span>
        <b>DANA</b>
        <small>Processed by Antom</small>
      </label>
      <div className="renewal-note">
        Renews monthly at ${renewalPrice.toFixed(2)} · Cancel anytime
      </div>
      <button className="primary-cta" onClick={onPay}>
        Continue to {paymentMethod}
      </button>
      <p className="legal-note">
        By continuing, you agree to recurring billing and the Terms.
        Final amount is shown by your payment provider.
      </p>
    </div>
  );
}

function SubscriptionSuccess({
  title,
  message,
  onClose,
  onAccount,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onAccount: () => void;
}) {
  return (
    <div className="success-modal">
      <span className="success-icon"><Icon name="check" size={34} /></span>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="primary-cta" onClick={onClose}>Continue browsing</button>
      <button className="text-button" onClick={onAccount}>View Plan &amp; Unlocks</button>
    </div>
  );
}
function Success({
  count,
  title,
  message,
  onClose,
  onDownload,
  onAssets,
}: {
  count: number;
  title: string;
  message: string;
  onClose: () => void;
  onDownload: () => void;
  onAssets: () => void;
}) {
  return (
    <div className="success-modal">
      <span className="success-icon">
        <Icon name="check" size={34} />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      <button className="primary-cta" onClick={count > 1 ? onAssets : onDownload}>
        {count > 1 ? (
          <>View My Assets</>
        ) : (
          <><Icon name="download" /> Download model</>
        )}
      </button>
      <button className="text-button" onClick={count > 1 ? onClose : onAssets}>
        {count > 1 ? "Continue browsing" : "Go to My Assets"}
      </button>
    </div>
  );
}
