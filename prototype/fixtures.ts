import type { BillingRecord, LegacyBenefits, NotificationRecord, OrderRecord } from "./types";

export const initialLegacyBenefits: LegacyBenefits = {
  welcomeDownloads: 3,
  invitationDownloads: 2,
  vipCredits: 8,
  downloadCredits: 12,
  vipActive: true,
};

export const initialSearchHistory = [
  "Modern sofa",
  "Kitchen island",
  "Olive tree",
];

export const initialNotifications: NotificationRecord[] = [
  {
    id: "renewal-failed",
    title: "Renewal payment failed",
    message: "PayPal will retry automatically. Please check your payment method.",
    time: "Just now",
    unread: true,
  },
  {
    id: "renewal-restored",
    title: "Subscription renewed",
    message: "Your Pro plan is active and 30 credits are ready.",
    time: "2 days ago",
    unread: true,
  },
  {
    id: "renewal-expired",
    title: "Subscription expired",
    message: "Payment failed after two retries. Subscribe again to continue with Pro.",
    time: "Aug 18",
    unread: false,
  },
];

export const initialOrders: OrderRecord[] = [
  { id: "AZ-REFUND-2408", modelId: 2, date: "Aug 18, 2026", access: "Access revoked", status: "Refunded", seeded: true },
  { id: "AZ-REFUNDING-2410", modelId: 1, date: "Aug 20, 2026", access: "Access remains until refund completes", status: "Refund processing", seeded: true },
  { id: "AZ-PENDING-2412", modelId: 3, date: "Aug 22, 2026", access: "Payment due · 11:42 left", status: "Pending", seeded: true },
  { id: "AZ-FAILED-2414", modelId: 4, date: "Aug 24, 2026", access: "Not granted", status: "Failed", seeded: true },
  { id: "AZ-PROCESSING-2415", modelId: 5, date: "Aug 25, 2026", access: "Granting access", status: "Processing", seeded: true },
  { id: "AZ-EXPIRED-2416", modelId: 6, date: "Aug 26, 2026", access: "Not granted", status: "Expired", seeded: true },
  { id: "AZ-CREDIT-REFUND-2417", modelId: 7, date: "Aug 27, 2026", access: "Access revoked · Credit not returned", status: "Refunded", seeded: true },
];

export const initialBillingRecords: BillingRecord[] = [
  { id: "BILL-VIP-0726", title: "Legacy VIP monthly", date: "Jul 26, 2026", amount: "$5.00", status: "Paid", kind: "Legacy VIP", seeded: true },
  { id: "BILL-CREDIT-0612", title: "Download Credits ×45", date: "Jun 12, 2026", amount: "$10.00", status: "Paid", kind: "Legacy credits", seeded: true },
  { id: "BILL-SUB-PENDING-0828", title: "Pro monthly subscription", date: "Aug 28, 2026", amount: "$14.99", status: "Pending", kind: "Subscription", seeded: true },
  { id: "BILL-SUB-PROCESSING-0829", title: "Max monthly subscription", date: "Aug 29, 2026", amount: "$49.99", status: "Processing", kind: "Subscription", seeded: true },
  { id: "BILL-SUB-FAILED-0830", title: "Pro monthly subscription", date: "Aug 30, 2026", amount: "$14.99", status: "Failed", kind: "Subscription", seeded: true },
  { id: "BILL-SUB-EXPIRED-0831", title: "Max monthly subscription", date: "Aug 31, 2026", amount: "$49.99", status: "Expired", kind: "Subscription", seeded: true },
  { id: "BILL-LEGACY-REFUNDING-0901", title: "Legacy Download Credits", date: "Sep 01, 2026", amount: "$10.00", status: "Refund processing", kind: "Legacy credits", seeded: true },
  { id: "BILL-LEGACY-REFUNDED-0902", title: "Legacy VIP monthly", date: "Sep 02, 2026", amount: "$5.00", status: "Refunded", kind: "Legacy VIP", seeded: true },
];
