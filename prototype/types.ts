export type Page =
  | "home"
  | "search"
  | "product"
  | "free"
  | "pricing"
  | "cart"
  | "assets"
  | "info";

export type UserMode = "guest" | "basic" | "pro" | "max";

export type AccountTab =
  | "My Assets"
  | "Plan & Unlocks"
  | "My Orders"
  | "Favorites"
  | "Account Settings"
  | "Notifications";

export type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

export type ModelType = "SketchUp" | "3ds Max";

export type InfoKey =
  | "about"
  | "license"
  | "dmca"
  | "service"
  | "terms"
  | "privacy"
  | "cookies";

export type Model = {
  id: number;
  title: string;
  type: ModelType;
  category: string;
  image: string;
  images?: string[];
  available: boolean;
  qualityChecked: boolean;
  free?: boolean;
  version?: string;
  renderer?: string;
  size: string;
};

export type TransactionStatus =
  | "Pending"
  | "Processing"
  | "Paid"
  | "Failed"
  | "Expired"
  | "Refund processing"
  | "Refunded";

export type OrderRecord = {
  id: string;
  orderId?: string;
  modelId: number;
  date: string;
  access: string;
  payment?: "PayPal" | "Antom" | "DANA" | "—";
  amount?: string;
  seeded?: boolean;
  status?: TransactionStatus;
};

export type BillingRecord = {
  id: string;
  title: string;
  date: string;
  amount: string;
  channel: "PayPal" | "Antom" | "DANA";
  status: TransactionStatus;
  kind: "Subscription" | "Legacy VIP" | "Legacy credits";
  seeded?: boolean;
};

export type LegacyBenefits = {
  welcomeDownloads: number;
  invitationDownloads: number;
  vipCredits: number;
  downloadCredits: number;
  vipActive: boolean;
};

export type BenefitChoice =
  | "welcome"
  | "invitation"
  | "vipCredits"
  | "downloadCredits"
  | "planCredits";

export type BenefitAllocation = {
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

export type InfoPageContent = {
  eyebrow: string;
  title: string;
  body: string[];
};
