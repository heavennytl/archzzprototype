import type {
  BenefitAllocation,
  BenefitChoice,
  LegacyBenefits,
  UserMode,
} from "./types";

export const MODEL_PRICE = 1.99;
export const CART_LIMIT = 30;

export const defaultBenefitChoices: BenefitChoice[] = [
  "welcome",
  "invitation",
  "vipCredits",
  "downloadCredits",
  "planCredits",
];

export const legacyBenefitMeta = [
  { key: "welcome" as const, balanceKey: "welcomeDownloads" as const, label: "Welcome Coupon", expires: "Sep 10, 2026" },
  { key: "invitation" as const, balanceKey: "invitationDownloads" as const, label: "Invitation Coupon", expires: "Sep 30, 2026" },
  { key: "vipCredits" as const, balanceKey: "vipCredits" as const, label: "Legacy VIP Credits", expires: "Oct 07, 2026" },
  { key: "downloadCredits" as const, balanceKey: "downloadCredits" as const, label: "Legacy Download Credits", expires: "Dec 31, 2026" },
];

export function allocateBenefits(
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
  const fullCashAmount = cashModels * MODEL_PRICE;
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

export function allocationSources(
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

export function entitlementLabel(
  source: Exclude<BenefitAllocation["source"], "mixed">,
  user: UserMode,
  cashUnitPrice = MODEL_PRICE,
) {
  return source === "welcome"
    ? "Welcome Coupon"
    : source === "invitation"
      ? "Invitation Coupon"
      : source === "vipCredits"
        ? "Legacy VIP Credit"
        : source === "downloadCredits"
          ? "Legacy Download Credit"
          : source === "planCredits"
            ? `${user === "max" ? "Max" : "Pro"} credit`
            : `$${cashUnitPrice.toFixed(2)}`;
}

export function formatTransactionDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}
