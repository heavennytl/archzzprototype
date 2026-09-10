"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArchzzWordmark, GalleryArrowIcon, Icon, SearchClearIcon } from "../components/brand";
import { Auth, CancelRenewal, FreeUnlockConfirm, ImageSearch, LicenseSummary, Modal, SubscriptionSuccess, Success } from "../components/modals";

import {
  CART_LIMIT,
  LEGACY_VIP_MODEL_PRICE,
  MODEL_PRICE,
  allocateBenefits,
  allocationSources,
  defaultBenefitChoices,
  entitlementLabel,
  formatTransactionDate,
  legacyBenefitMeta,
} from "../prototype/commerce";
import {
  catalog,
  collections,
  infoPages,
  models,
  todayFreeModels,
} from "../prototype/data";
import {
  initialBillingRecords,
  initialLegacyBenefits,
  initialNotifications,
  initialOrders,
  initialSearchHistory,
} from "../prototype/fixtures";
import type {
  AccountTab,
  BenefitAllocation,
  BenefitChoice,
  BillingRecord,
  InfoKey,
  LegacyBenefits,
  Model,
  ModelType,
  NotificationRecord,
  OrderRecord,
  Page,
  UserMode,
} from "../prototype/types";

function withPlanCredits(choices: BenefitChoice[]) {
  return choices.includes("planCredits")
    ? choices
    : [...choices, "planCredits" as const];
}

export default function Prototype() {
  const [page, setPage] = useState<Page>("home"),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(models[0]);
  const [favorites, setFavorites] = useState<number[]>([3]),
    [cart, setCart] = useState<number[]>([]),
    [cartSelection, setCartSelection] = useState<number[]>([]),
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
      | "freeUnlock"
      | "license"
      | "notification"
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
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchType, setSearchType] = useState("All formats"),
    [accountTab, setAccountTab] = useState<AccountTab>("My Assets");
  const [legacyBenefits, setLegacyBenefits] = useState<LegacyBenefits>({
    ...initialLegacyBenefits,
  });
  const [hasLegacyBenefits, setHasLegacyBenefits] = useState(false);
  const [benefitChoices, setBenefitChoices] = useState<BenefitChoice[]>([
    ...defaultBenefitChoices,
  ]);
  const [showHistoricalRecords, setShowHistoricalRecords] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [resumingOrderId, setResumingOrderId] = useState<string | null>(null);
  const [resumingBillingId, setResumingBillingId] = useState<string | null>(null);
  const [pendingFreeUnlockId, setPendingFreeUnlockId] = useState<number | null>(null);
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
    ...initialSearchHistory,
  ]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([...initialOrders]),
    [billingRecords, setBillingRecords] = useState<BillingRecord[]>([...initialBillingRecords]),
    [creditUsed, setCreditUsed] = useState(0),
    [infoKey, setInfoKey] = useState<InfoKey>("about");
  function showToast(message: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(message);
    toastTimerRef.current = setTimeout(() => {
      setToast("");
      toastTimerRef.current = null;
    }, 3000);
  }
  useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );
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
    if (key === "license") {
      window.open("https://www.archzz.com/asset_license_agreement.html", "_blank", "noopener,noreferrer");
      return;
    }
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
  function addToCart(id: number, confirmedFreeUnlock = false): boolean {
    const model = catalog.find((item) => item.id === id);
    if (!model?.available || owned.includes(id)) {
      showToast(
        model && !model.available
          ? "This item is unavailable"
          : "This model is already in My Assets.",
      );
      return false;
    }
    if (user === "guest") {
      setSelected(model);
      setAuthIntent("cart");
      setModal("auth");
      return false;
    }
    if (model.free && freeClaimed >= 3 && !confirmedFreeUnlock) {
      setPendingFreeUnlockId(id);
      setModal("freeUnlock");
      return false;
    }
    if (!cart.includes(id) && cart.length >= CART_LIMIT) {
      showToast(`Your cart can hold up to ${CART_LIMIT} models.`);
      return false;
    }
    setCart((v) => (v.includes(id) ? v : [...v, id]));
    setCartSelection((v) => (v.includes(id) ? v : [...v, id]));
    showToast("Added to cart");
    return true;
  }
  function primaryAction(model: Model) {
    setSelected(model);
    setSuccessCount(1);
    if (!model.available) return showToast("This item is unavailable");
    if (owned.includes(model.id)) {
      setModal("none");
      showToast("Download started");
      return;
    }
    if (user === "guest") {
      setAuthIntent("primary");
      return setModal("auth");
    }
    if (model.free && freeClaimed < 3) {
      setOwned((v) => [...v, model.id]);
      setFreeClaimed((v) => v + 1);
      addOrders([model.id], "Free download");
      setModal("none");
      showToast("Download started. This model is now in My Assets.");
      return;
    }
    setModal("checkout");
  }
  function authenticate() {
    setUser("basic");
    setHasLegacyBenefits(false);
    setShowHistoricalRecords(false);
    setOwned([]);
    setNotifications([]);
    if (authIntent === "favorite") {
      setFavorites((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setModal("none");
      showToast("Saved to Favorites");
    } else if (authIntent === "cart") {
      setCart((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setCartSelection((v) =>
        v.includes(selected.id) ? v : [...v, selected.id],
      );
      setModal("none");
      showToast("Added to cart");
    } else if (authIntent === "cartCheckout") setModal("cartCheckout");
    else if (
      authIntent === "primary" &&
      selected.free &&
      freeClaimed < 3
    ) {
      setOwned((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setFreeClaimed((v) => v + 1);
      addOrders([selected.id], "Free download");
      setModal("none");
      showToast("Download started. This model is now in My Assets.");
    } else if (authIntent === "primary" && selected.free) {
      setModal("none");
      showToast("Today’s free downloads are used.");
    } else if (authIntent === "primary") setModal("checkout");
    else if (authIntent === "plan" && pendingPlan)
      setModal("subscriptionCheckout");
    else if (authIntent === "account") {
      setAccountTab(pendingAccountTab);
      setModal("none");
      navigate("assets");
    } else {
      setModal("none");
      setToast("");
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
    setCartSelection((v) => v.filter((id) => !ids.includes(id)));
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
      : MODEL_PRICE;
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
      showToast("You can choose Pro after your current Max plan ends.");
      return;
    }
    setBenefitChoices((choices) => withPlanCredits(choices));
    setSubscriptionResume(resume);
    setPendingPlan(mode);
    if (user === "guest") {
      setAuthIntent("plan");
      setModal("auth");
    } else {
      setModal("subscriptionCheckout");
    }
  }
  function completeSubscription(channel: BillingRecord["channel"] = "PayPal") {
    if (!pendingPlan) return;
    const upgrading = user === "pro" && pendingPlan === "max";
    const resumeIds =
      subscriptionResume === "pdp"
        ? [selected.id]
        : subscriptionResume === "cart"
          ? selectedCartModels.map((model) => model.id)
          : [];
    const planTotal = pendingPlan === "max" ? 150 : 30;
    const subscriptionBenefitChoices =
      subscriptionResume === "cart"
        ? withPlanCredits(benefitChoices)
        : benefitChoices;
    const resumeAllocation = allocateBenefits(
      resumeIds.length,
      pendingPlan,
      legacyBenefits,
      upgrading ? planTotal - creditUsed : planTotal,
      hasLegacyBenefits,
      subscriptionBenefitChoices,
    );
    setUser(pendingPlan);
    setCreditUsed(
      (used) => (upgrading ? used : 0) + resumeAllocation.planCredits,
    );
    setAutoRenew(true);
    setBillingRecords((records) => {
      const paidBillingRecord: BillingRecord = {
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
        channel,
      };
      return resumingBillingId
        ? records.map((record) =>
            record.id === resumingBillingId
              ? { ...paidBillingRecord, id: record.id }
              : record,
          )
        : [paidBillingRecord, ...records];
    });
    setResumingBillingId(null);
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
      setCartSelection((items) =>
        items.filter((id) => !resumeIds.includes(id)),
      );
      addOrders(
        resumeIds,
        allocationSources(resumeAllocation).map((source) => {
          const cashUnitPrice = resumeAllocation.cashModels
            ? resumeAllocation.cashAmount / resumeAllocation.cashModels
            : MODEL_PRICE;
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
  const selectedCartModels = cartModels.filter((model) =>
    cartSelection.includes(model.id),
  );
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
        onAccountTab={openAccount}
        onFavorites={() => openAccount("Favorites")}
        onSignOut={() => {
          setUser("guest");
          setHasLegacyBenefits(false);
          setShowHistoricalRecords(false);
          setCreditUsed(0);
          setOwned([]);
          setFavorites([]);
          setCart([]);
          setCartSelection([]);
          setNotifications([]);
          setSelectedNotification(null);
          setFreeClaimed(0);
          setBenefitChoices([...defaultBenefitChoices]);
          setModal("none");
          setAccountTab("My Assets");
          navigate("home");
          showToast("Signed out");
        }}
        notificationCount={notifications.filter((item) => item.unread).length}
        onNotifications={() => openAccount("Notifications")}
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
          freeClaimed={freeClaimed}
          onSearch={search}
          onSearchFor={searchFor}
          query={query}
          searchHistory={searchHistory}
          onQuery={setQuery}
          onNavigate={navigate}
          onOpen={openModel}
          favorites={favorites}
          owned={owned}
          cart={cart}
          onFavorite={toggleFavorite}
          onCart={addToCart}
          onImageSearch={() => setModal("imageSearch")}
          vipPricing={hasLegacyBenefits && legacyBenefits.vipActive}
        />
      )}
      {page === "home" && <ExtraCategories onSearchFor={searchFor} />}
      {page === "search" && (
        <SearchResults
          freeClaimed={freeClaimed}
          query={query}
          onQuery={setQuery}
          onSearch={search}
          type={searchType}
          onType={setSearchType}
          onOpen={openModel}
          favorites={favorites}
          owned={owned}
          cart={cart}
          onFavorite={toggleFavorite}
          onCart={addToCart}
          onImageSearch={() => setModal("imageSearch")}
          vipPricing={hasLegacyBenefits && legacyBenefits.vipActive}
        />
      )}
      {page === "product" && (
        <ProductDetail
          model={selected}
          owned={owned.includes(selected.id)}
          allOwned={owned}
          cart={cart}
          favorites={favorites}
          user={user}
          creditBalance={(user === "max" ? 150 : 30) - creditUsed}
          freeClaimed={freeClaimed}
          hasLegacyBenefits={hasLegacyBenefits}
          vipPricing={hasLegacyBenefits && legacyBenefits.vipActive}
          favorite={favorites.includes(selected.id)}
          inCart={cart.includes(selected.id)}
          onFavorite={() => toggleFavorite(selected.id)}
          onFavoriteModel={toggleFavorite}
          onPrimary={() => primaryAction(selected)}
          onCart={() => addToCart(selected.id)}
          onCartModel={addToCart}
          onUnlockModel={primaryAction}
          onOpen={openModel}
          onPricing={() => navigate("pricing")}
          onUpgrade={() => choosePlan("max", "pdp")}
          onLicense={() => setModal("license")}
        />
      )}
      {page === "free" && (
        <FreePage
          user={user}
          claimed={freeClaimed}
          owned={owned}
          onOpen={openModel}
          onClaim={primaryAction}
          vipPricing={hasLegacyBenefits && legacyBenefits.vipActive}
        />
      )}
      {page === "pricing" && (
        <Pricing
          user={user}
          vipPricing={hasLegacyBenefits && legacyBenefits.vipActive}
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
          selectedIds={cartSelection}
          onSelection={setCartSelection}
          onRemove={(id) => {
            setCart((v) => v.filter((x) => x !== id));
            setCartSelection((v) => v.filter((x) => x !== id));
          }}
          onOpen={openModel}
          onCheckout={(ids, cashAmount) => {
            if (!ids.length) return;
            if (user === "guest") {
              setAuthIntent("cartCheckout");
              setModal("auth");
            } else if (cashAmount > 0) setModal("cartCheckout");
            else completePurchase(ids);
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
          notifications={notifications}
          onOpen={openModel}
          onBrowse={() => navigate("search")}
          onPricing={() => navigate("pricing")}
          onDemoDownload={() => showToast("Download started")}
          onOrderAction={(order) => {
            const orderModel = catalog.find((model) => model.id === order.modelId);
            if (!orderModel) return;
            setSelected(orderModel);
            setResumingOrderId(order.id);
            setModal("checkout");
          }}
          onBillingAction={(record) => {
            const plan = record.title.toLowerCase().includes("max") ? "max" : "pro";
            if (user === "max" || (user === "pro" && plan === "pro")) {
              showToast("This pending subscription is no longer payable.");
              return;
            }
            setPendingPlan(plan);
            setResumingBillingId(record.id);
            setSubscriptionResume("none");
            setModal("subscriptionCheckout");
          }}
          onToggleRenew={() => {
            if (autoRenew) {
              setModal("cancelRenewal");
            } else {
              setAutoRenew(true);
              showToast("Auto-renewal resumed.");
            }
          }}
          onAccountNotice={showToast}
          onReadAllNotifications={() =>
            setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
          }
          onNotificationAction={(notification) => {
            setNotifications((items) =>
              items.map((item) => item.id === notification.id ? { ...item, unread: false } : item),
            );
            setSelectedNotification(notification);
            setModal("notification");
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
          setPendingFreeUnlockId(null);
          setResumingOrderId(null);
          setResumingBillingId(null);
        }}>
          {modal === "auth" && <Auth onContinue={authenticate} />}{" "}
          {modal === "notification" && selectedNotification && (
            <NotificationDetail notification={selectedNotification} />
          )}{" "}
          {modal === "freeUnlock" && pendingFreeUnlockId !== null && (
            <FreeUnlockConfirm
              onCancel={() => {
                setPendingFreeUnlockId(null);
                setModal("none");
              }}
              onConfirm={() => {
                const added = addToCart(pendingFreeUnlockId, true);
                if (added) {
                  setPendingFreeUnlockId(null);
                  setModal("none");
                }
              }}
            />
          )}{" "}
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
              models={selectedCartModels}
              user={user}
              planBalance={(user === "max" ? 150 : 30) - creditUsed}
              legacyBenefits={legacyBenefits}
              hasLegacyBenefits={hasLegacyBenefits}
              benefitChoices={benefitChoices}
              onBenefitChoices={setBenefitChoices}
              onPay={() =>
                completePurchase(selectedCartModels.map((model) => model.id))
              }
              onUpgrade={() => choosePlan("max", "cart")}
              onChoosePlan={(plan) => choosePlan(plan, "cart")}
              onPricing={() => {
                setModal("none");
                navigate("pricing");
              }}
              paymentOnly
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
                    ? selectedCartModels.length
                    : 0
              }
              legacyBenefits={legacyBenefits}
              hasLegacyBenefits={hasLegacyBenefits}
              benefitChoices={
                subscriptionResume === "cart"
                  ? withPlanCredits(benefitChoices)
                  : benefitChoices
              }
              onBenefitChoices={setBenefitChoices}
              allowBenefitSelection={subscriptionResume !== "cart"}
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
                showToast("Auto-renewal cancelled. Access remains active through Oct 07, 2026.");
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
                showToast("Download started");
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
          setResumingBillingId(null);
          setPendingFreeUnlockId(null);
          setFavorites([]);
          setCart([]);
          setCartSelection([]);
          setFreeClaimed(0);
          setBenefitChoices([...defaultBenefitChoices]);
          setNotifications([]);
          setSelectedNotification(null);
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
            setNotifications(initialNotifications.map((item) => ({ ...item })));
          } else {
            setUser("max");
            setHasLegacyBenefits(false);
            setShowHistoricalRecords(true);
            setCreditUsed(148);
            setOwned([1]);
            setNotifications(
              initialNotifications.map((item) => ({
                ...item,
                message: item.message.replace("Pro", "Max").replace("30 credits", "150 credits"),
              })),
            );
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
    { n: "Decorations", image: models[5].image },
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
  onAccountTab,
  onFavorites,
  onSignOut,
  notificationCount,
  onNotifications,
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
  onAccountTab: (tab: AccountTab) => void;
  onFavorites: () => void;
  onSignOut: () => void;
  notificationCount: number;
  onNotifications: () => void;
}) {
  const modelCategories = [
    "Furniture", "Residential Interior", "Commercial Interior",
    "Built-in Components", "Decorations", "Lighting", "Home Accessories",
    "Landscape", "Plants", "Curtains & Fabrics", "Architecture",
    "Characters", "Vehicles", "Exhibitions", "Displays", "Stages",
    "3D Materials", "Advertising Signage",
  ];
  const nav = [
    {
      label: "Home",
      active: page === "home",
      action: () => onNavigate("home"),
    },
    {
      label: "SketchUp Models",
      active: page === "search" && searchType === ".skp",
      action: () => onSearchFor("SketchUp models", ".skp"),
    },
    {
      label: "3ds Max Models",
      active: page === "search" && searchType === ".max",
      action: () => onSearchFor("3ds Max models", ".max"),
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
      : "ArchZZ Designer";
  return (
    <>
      <header
        className={`header${page === "search" || page === "home" ? " search-listing-header" : ""}`}
      >
        <button className="logo" onClick={() => onNavigate("home")}>
          <ArchzzWordmark />
        </button>
        <nav className={mobileNav ? "nav open" : "nav"}>
          {nav.map((item) => {
            const modelType = item.label === "SketchUp Models"
              ? ".skp"
              : item.label === "3ds Max Models"
                ? ".max"
                : null;
            return modelType ? (
              <div className="nav-dropdown" key={item.label}>
                <button
                  className={item.active ? "active" : ""}
                  aria-current={item.active ? "page" : undefined}
                  onClick={item.action}
                >
                  {item.label} <span aria-hidden="true">⌄</span>
                </button>
                <div className="nav-dropdown-menu">
                  {modelCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => onSearchFor(category, modelType)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                key={item.label}
                className={item.active ? "active" : ""}
                aria-current={item.active ? "page" : undefined}
                onClick={item.action}
              >
                {item.label}
              </button>
            );
          })}
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
          {user !== "guest" && (
            <button
              className="icon-button count-wrap"
              onClick={onNotifications}
              aria-label="Notifications"
              title="Notifications"
            >
              <Icon name="bell" />
              {notificationCount > 0 && <b>{notificationCount}</b>}
            </button>
          )}
          <button
            className="icon-button count-wrap"
            onClick={() => onNavigate("cart")}
            aria-label="Cart"
          >
            <Icon name="cart" />
            {cartCount > 0 && <b>{cartCount}</b>}
          </button>
          {user === "guest" ? (
            <button className="account-button" onClick={onAccount}>
              <Icon name="user" />
              <span>{accountLabel}</span>
            </button>
          ) : <div className="account-dropdown">
            <button className="account-button" onClick={onAccount}>
              <Icon name="user" />
              <span>{accountLabel}</span>
              <span aria-hidden="true">⌄</span>
            </button>
            <div className="account-dropdown-menu">
              {(["My Assets", "Plan & Unlocks", "My Orders", "Favorites", "Account Settings"] as AccountTab[]).map((tab) => (
                <button key={tab} onClick={() => onAccountTab(tab)}>{tab}</button>
              ))}
              <button className="account-sign-out" onClick={onSignOut}>Sign out</button>
            </div>
          </div>}
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
  freeClaimed,
  query,
  searchHistory,
  onQuery,
  onSearch,
  onSearchFor,
  onNavigate,
  onOpen,
  favorites,
  owned,
  cart,
  onFavorite,
  onCart,
  onImageSearch,
  vipPricing,
}: {
  freeClaimed: number;
  query: string;
  searchHistory: string[];
  onQuery: (v: string) => void;
  onSearch: (e?: FormEvent) => void;
  onSearchFor: (term: string, type?: string) => void;
  onNavigate: (p: Page) => void;
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  cart: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => boolean;
  onImageSearch: () => void;
  vipPricing: boolean;
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
            Search over a million professional models, check compatibility and
            details, and get exactly what you need.
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
            { n: "Residential Interior", image: models[5].image },
            { n: "Architecture", image: models[4].image },
            { n: "Commercial Interior", image: models[9].image },
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
        freeClaimed={freeClaimed}
        eyebrow=""
        title="Popular models"
        subtitle=""
        items={catalog.filter((model) => model.available).slice(0, 15)}
        onOpen={onOpen}
        favorites={favorites}
        owned={owned}
        cart={cart}
        onFavorite={onFavorite}
        onCart={onCart}
        onAll={() => onSearchFor("Popular")}
        vipPricing={vipPricing}
      />
      <section className="free-strip">
        <div>
          <span className="kicker light">TODAY’S FREE</span>
          <h2>
            Quality-checked free models.
            <br />
            Choose any 3 today.
          </h2>
          <p>
            Browse the full SketchUp and 3ds Max free collection in a new order
            each day. Your downloads stay in My Assets.
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
          <b>Flexible ways to access models</b>
          <p>Buy once or use a plan credit.</p>
        </div>
        <div>
          <span className="trust-symbol">∞</span>
          <b>Keep access to unlocked models</b>
          <p>Unlocked models stay in My Assets.</p>
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
  freeClaimed,
  query,
  onQuery,
  onSearch,
  type,
  onType,
  onOpen,
  favorites,
  owned,
  cart,
  onFavorite,
  onCart,
  onImageSearch,
  vipPricing,
}: {
  freeClaimed: number;
  query: string;
  onQuery: (v: string) => void;
  onSearch: (e?: FormEvent) => void;
  type: string;
  onType: (v: string) => void;
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  cart: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => boolean;
  onImageSearch: () => void;
  vipPricing: boolean;
}) {
  const [category, setCategory] = useState("All categories"),
    [keyword, setKeyword] = useState("All styles"),
    [renderer, setRenderer] = useState("All renderers"),
    [visibleCount, setVisibleCount] = useState(40);
  const keywordOptions = [
      "All styles",
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
        : type === ".skp"
          ? "SketchUp models"
          : "3ds Max models"
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
      .filter((item) => item.available)
      .filter(matchesQuery)
      .filter(
        (item) =>
          type === "All formats" ||
          (type === ".skp" && item.type === "SketchUp") ||
          (type === ".max" && item.type === "3ds Max"),
      )
      .filter(
        (item) => category === "All categories" || item.category === category,
      )
      .filter(
        (item) =>
          keyword === "All styles" ||
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
    setKeyword("All styles");
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
            options={["All formats", ".skp", ".max"]}
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
            <p className="kicker">SEARCH RESULTS</p>
            <h1>{displayTitle}</h1>
          </div>
        </div>
        {filtered.length ? (
          <>
            <div className="result-grid">
              {visibleModels.map((model) => (
                <ModelCard
                  freeClaimed={freeClaimed}
                  key={model.id}
                  model={model}
                  onOpen={onOpen}
                  favorite={favorites.includes(model.id)}
                  owned={owned.includes(model.id)}
                  inCart={cart.includes(model.id)}
                  onFavorite={onFavorite}
                  onCart={onCart}
                  vipPricing={vipPricing}
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
  cart,
  favorites,
  user,
  creditBalance,
  freeClaimed,
  hasLegacyBenefits,
  vipPricing,
  favorite,
  inCart,
  onFavorite,
  onFavoriteModel,
  onPrimary,
  onCart,
  onCartModel,
  onUnlockModel,
  onOpen,
  onPricing,
  onUpgrade,
  onLicense,
}: {
  model: Model;
  owned: boolean;
  allOwned: number[];
  cart: number[];
  favorites: number[];
  user: UserMode;
  creditBalance: number;
  freeClaimed: number;
  hasLegacyBenefits: boolean;
  vipPricing: boolean;
  favorite: boolean;
  inCart: boolean;
  onFavorite: () => void;
  onFavoriteModel: (id: number) => void;
  onPrimary: () => void;
  onCart: () => void;
  onCartModel: (id: number) => boolean;
  onUnlockModel: (model: Model) => void;
  onOpen: (m: Model) => void;
  onPricing: () => void;
  onUpgrade: () => void;
  onLicense: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const subscribed = user === "pro" || user === "max",
    available = model.available;
  const cashPrice = vipPricing ? LEGACY_VIP_MODEL_PRICE : MODEL_PRICE;
  const freeAvailable = model.free && freeClaimed < 3;
  const showProCreditsExhausted =
    available &&
    user === "pro" &&
    creditBalance <= 0 &&
    !owned &&
    !freeAvailable;
  const sameCategory = catalog.filter(
      (item) =>
        item.available &&
        item.id !== model.id &&
        !allOwned.includes(item.id) &&
        item.category === model.category,
    ),
    sameSoftware = catalog.filter(
      (item) =>
        item.available &&
        item.id !== model.id &&
        !allOwned.includes(item.id) &&
        item.type === model.type &&
        !sameCategory.some((relatedModel) => relatedModel.id === item.id),
    );
  const related = [...sameCategory, ...sameSoftware];
  const primaryLabel = !available
    ? "Temporarily unavailable"
    : owned
      ? "Download again"
      : freeAvailable
        ? "Free download"
        : model.free && (!subscribed || creditBalance <= 0)
          ? `Unlock · $${cashPrice.toFixed(2)}`
        : subscribed && creditBalance > 0
          ? "Use 1 credit"
          : user === "pro"
            ? "Get this model"
            : `Buy now · $${cashPrice.toFixed(2)}`;
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
                {model.version ? ` ${model.version}+` : ""}
              </span>
              {model.renderer && (
                <span className="software-label">{model.renderer}</span>
              )}
              {model.qualityChecked && (
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
          <div className={`decision-row ${freeAvailable ? "free-only" : ""}`}>
            <div className="buy-once-price">
              <div className="access-license-row">
                <span className={model.free ? "access-label free" : "access-label paid"}>
                  {model.free ? "FREE" : "PAID"}
                </span>
                <button type="button" className="license-link" onClick={onLicense}>
                  Standard License <span aria-hidden="true">ⓘ</span>
                </button>
              </div>
              <strong>{model.free ? "Free" : <CashPrice vip={vipPricing} />}</strong>
              {model.free && !freeAvailable && !owned && (
                <small className="free-limit-note">
                  Today’s free downloads are used · unlock with a credit or ${cashPrice.toFixed(2)}
                </small>
              )}
            </div>
            {!freeAvailable && <div className="membership-decision">
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
                    Subscribe <Icon name="arrow" size={16} />
                  </button>
                </>
              )}
            </div>}
          </div>
          {hasLegacyBenefits && !freeAvailable && (
            <div className="pdp-legacy-note">
              <b>Legacy benefits available</b>
              <span>Choose at checkout · expiry dates shown</span>
            </div>
          )}
          <section className="asset-details">
            <h2>Asset details</h2>
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
          {showProCreditsExhausted ? (
            <div className="pdp-credit-exhausted">
              <p>Your Pro credits are used up.</p>
              <button className="primary-cta" onClick={onUpgrade}>
                Upgrade to Max
              </button>
              <button className="buy-once-cta" onClick={onPrimary}>
                Unlock · ${cashPrice.toFixed(2)}
              </button>
            </div>
          ) : (
            <div className="pdp-actions">
              <button
                className={`primary-cta ${freeAvailable || owned ? "download-primary" : ""}`}
                onClick={onPrimary}
                disabled={!available}
              >
                {primaryLabel}
              </button>
              {available && !freeAvailable && !owned && (
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
          )}
        </aside>
      </div>
      <ModelSection
        freeClaimed={freeClaimed}
        eyebrow=""
        title="Related models"
        subtitle=""
        items={related}
        onOpen={onOpen}
        favorites={favorites}
        owned={allOwned}
        cart={cart}
        onFavorite={onFavoriteModel}
        onCart={onCartModel}
        onFreeUnlock={onUnlockModel}
        vipPricing={vipPricing}
      />
    </main>
  );
}

function FreePage({
  user,
  claimed,
  owned,
  onOpen,
  onClaim,
  vipPricing,
}: {
  user: UserMode;
  claimed: number;
  owned: number[];
  onOpen: (m: Model) => void;
  onClaim: (m: Model) => void;
  vipPricing: boolean;
}) {
  const [tab, setTab] = useState<ModelType>("SketchUp");
  const [ownershipFilter, setOwnershipFilter] = useState<
    "all" | "owned" | "notOwned"
  >("all");
  const [visibleCount, setVisibleCount] = useState(40);
  const utcDay = new Date().toISOString().slice(0, 10);
  const dailyOrder = (id: number) => {
    const value = `${utcDay}:${tab}:${id}`;
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const filteredModels = todayFreeModels
    .filter((item) => item.type === tab)
    .filter((item) =>
      ownershipFilter === "owned"
        ? owned.includes(item.id)
        : ownershipFilter === "notOwned"
          ? !owned.includes(item.id)
          : true,
    )
    .sort((a, b) => dailyOrder(a.id) - dailyOrder(b.id));
  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisibleCount(40));
    return () => cancelAnimationFrame(frame);
  }, [tab, ownershipFilter]);
  return (
    <main className="free-page">
      <section className="free-hero">
        <div>
          <p className="kicker light">TODAY’S FREE · REFRESHES AT 00:00 UTC</p>
          <h1>Choose any 3 models today.</h1>
          <p>
            {claimed >= 3
              ? `Your 3 free downloads are used. Unlock more with plan credits or $${(vipPricing ? LEGACY_VIP_MODEL_PRICE : MODEL_PRICE).toFixed(2)} each.`
              : "Choose from the full SketchUp and 3ds Max collection. Downloaded models stay in My Assets."}
          </p>
        </div>
        <div className="free-counter">
          <span>TODAY’S DOWNLOADS</span>
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
          SketchUp
        </button>
        <button
          className={tab === "3ds Max" ? "active" : ""}
          onClick={() => setTab("3ds Max")}
        >
          3ds Max
        </button>
        <p>{claimed} of 3 downloads used today across both tabs</p>
      </div>
      {user !== "guest" && (
        <div
          className="free-ownership-filter"
          aria-label="Filter free models by ownership"
        >
          {(["all", "owned", "notOwned"] as const).map((value) => (
            <button
              key={value}
              className={ownershipFilter === value ? "active" : ""}
              onClick={() => setOwnershipFilter(value)}
            >
              {value === "all"
                ? "All"
                : value === "owned"
                  ? "Owned"
                  : "Not owned"}
            </button>
          ))}
        </div>
      )}
      {filteredModels.length ? <div className="free-grid">
        {filteredModels
          .slice(0, visibleCount)
          .map((model) => (
            <div className="free-card" key={model.id}>
              <button className="free-image" onClick={() => onOpen(model)}>
                <img src={model.image} alt={model.title} />
              </button>
              <div>
                <button onClick={() => onOpen(model)}>{model.title}</button>
                <div className="card-software-tags">
                  <span>{model.type}</span>
                  {model.renderer && <span>{model.renderer}</span>}
                  {model.qualityChecked && <span className="quality-tag"><Icon name="check" size={12} /></span>}
                </div>
                <div className="free-card-access">
                  <strong className="free-card-price">
                    {owned.includes(model.id)
                      ? "Owned"
                      : "Free"}
                  </strong>
                  <button
                    className="claim-button"
                    onClick={() => onClaim(model)}
                  >
                    {owned.includes(model.id)
                      ? "Download again"
                      : claimed >= 3
                        ? "Unlock"
                        : "Free download"}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div> : (
        <div className="free-empty-state">
          <Icon name="download" size={30} />
          <h2>{ownershipFilter === "owned" ? "No owned free models yet" : "No models found"}</h2>
          <p>{ownershipFilter === "owned" ? "Models you unlock from Today’s Free will appear here." : "Try another filter or software tab."}</p>
          <button type="button" className="primary-cta" onClick={() => setOwnershipFilter("all")}>View all free models</button>
        </div>
      )}
      {filteredModels.length > 0 && <AutoLoadMore
        hasMore={visibleCount < filteredModels.length}
        onLoad={() =>
          setVisibleCount((count) =>
            Math.min(count + 20, filteredModels.length),
          )
        }
      />}
    </main>
  );
}

function Pricing({
  user,
  vipPricing,
  onChoose,
  onBrowse,
}: {
  user: UserMode;
  vipPricing: boolean;
  onChoose: (m: "pro" | "max") => void;
  onBrowse: () => void;
}) {
  return (
    <main className="pricing-page">
      <section className="pricing-intro">
        <div>
          <h1>Choose how you access models.</h1>
          <p className="pricing-intro-subtitle">
            Buy once or subscribe. Every model you unlock stays in My Assets.
          </p>
        </div>
      </section>
      <div className="price-cards">
        <Plan
          name="Buy once"
          price={vipPricing ? "$1.69" : "$1.99"}
          originalPrice={vipPricing ? "$1.99" : undefined}
          badge={vipPricing ? "VIP" : undefined}
          suffix="per model"
          description="For occasional, specific model needs."
          features={[
            "No subscription",
            "Permanent access",
            "Standard commercial license",
          ]}
          button="Browse models"
          onClick={onBrowse}
        />
        <Plan
          name="Pro"
          price="$14.99"
          suffix="per month"
          description="For regular model downloads."
          features={[
            "30 credits each month",
            "Credits reset monthly and don’t roll over",
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
          description="For frequent, high-volume model downloads."
          features={[
            "150 credits each month",
            "Credits reset monthly and don’t roll over",
          ]}
          button={user === "max" ? "Current plan" : "Choose Max"}
          current={user === "max"}
          onClick={() => onChoose("max")}
        />
      </div>
      <section className="pricing-rules">
        <h2>Subscription FAQ</h2>
        {[
          [
            "How do credits work?",
            "One credit unlocks one paid model. Pro includes 30 credits per month; Max includes 150.",
          ],
          [
            "Do I keep unlocked models?",
            "Yes. Every unlocked model stays in My Assets with permanent access.",
          ],
          [
            "Do unused credits roll over?",
            "No. Credits reset on your monthly billing date and unused credits expire.",
          ],
          [
            "When will my plan renew?",
            "Your next renewal date is shown in Plan & Unlocks.",
          ],
          [
            "Can I upgrade or cancel?",
            "You can upgrade from Pro to Max. Cancelling stops renewal; access continues through the paid period.",
          ],
          [
            "Are subscriptions refundable?",
            "No. Subscription payments are non-refundable.",
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
  compact = false,
}: {
  onChoose: (plan: "pro" | "max") => void;
  onLearnMore: () => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (compact) {
    return (
      <div className="subscription-offer subscription-offer-compact">
        <button
          type="button"
          className="subscription-offer-compact-trigger"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          <span><b>Need more models?</b><small>Plans start at $14.99/month</small></span>
          <strong>{expanded ? "Hide plans" : "Compare plans"}</strong>
        </button>
        {expanded && (
          <>
            <div className="subscription-offer-grid">
              <button type="button" className="subscription-offer-row" onClick={() => onChoose("pro")}>
                <span><b>Pro</b><small>$14.99 / month</small></span>
                <strong>≈ $0.50 / model</strong>
              </button>
              <button type="button" className="subscription-offer-row" onClick={() => onChoose("max")}>
                <span><b>Max</b><small>$49.99 / month</small></span>
                <strong>≈ $0.33 / model</strong>
              </button>
            </div>
            <button type="button" className="subscription-offer-learn" onClick={onLearnMore}>View plan details</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="subscription-offer">
      <div className="subscription-offer-head">
        <span>PLAN OPTIONS</span>
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
  compact = false,
}: {
  user: UserMode;
  planBalance: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  allocation: BenefitAllocation;
  value: BenefitChoice[];
  onChange: (choices: BenefitChoice[]) => void;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const toggle = (choice: BenefitChoice) =>
    onChange(
      value.includes(choice)
        ? value.filter((item) => item !== choice)
        : [...value, choice],
    );
  const availableCount = legacyBenefitMeta.filter(
    (item) => hasLegacyBenefits && legacyBenefits[item.balanceKey] > 0,
  ).length + ((user === "pro" || user === "max") && planBalance > 0 ? 1 : 0);
  const appliedBenefits = [
    ...legacyBenefitMeta
      .filter((item) => allocation[item.key] > 0)
      .map((item) => ({ label: item.label, count: allocation[item.key] })),
    ...(allocation.planCredits > 0
      ? [{ label: `${user === "max" ? "Max" : "Pro"} credits`, count: allocation.planCredits }]
      : []),
  ];
  const appliedSummary = appliedBenefits.length
    ? `${appliedBenefits[0].label} applied${appliedBenefits.length > 1 ? ` · +${appliedBenefits.length - 1} more` : ""}`
    : "Not applied";
  const availabilitySummary =
    allocation.planCredits > 0 && appliedBenefits.length === 1
      ? `${Math.max(0, planBalance - allocation.planCredits)} credits left`
      : `${availableCount} benefit ${availableCount === 1 ? "type" : "types"} available`;

  return (
    <div className={`benefit-picker${compact ? " compact" : ""}`}>
      <div className="benefit-picker-head">
        <b>Benefits</b>
        {compact ? (
          <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
            {expanded ? "Done" : "Change"}
          </button>
        ) : null}
      </div>
      {compact && !expanded && (
        <button type="button" className="benefit-summary" onClick={() => setExpanded(true)}>
          <span><b>{appliedSummary}</b><small>{availabilitySummary}</small></span>
          <strong>{allocation.cashModels ? `$${allocation.cashAmount.toFixed(2)} due` : "Covered"}</strong>
        </button>
      )}
      {(!compact || expanded) && hasLegacyBenefits && legacyBenefitMeta.map((item) => {
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
            <strong>{used ? `${used} applied · ` : ""}{Math.max(0, balance - used)} left</strong>
          </label>
        );
      })}
      {(!compact || expanded) && (user === "pro" || user === "max") && planBalance > 0 && (
        <label className={value.includes("planCredits") ? "selected" : ""}>
          <input
            type="checkbox"
            checked={value.includes("planCredits")}
            onChange={() => toggle("planCredits")}
          />
          <span><b>{user === "max" ? "Max" : "Pro"} credits</b><small>Cycle ends Oct 07, 2026</small></span>
          <strong>{allocation.planCredits ? `${allocation.planCredits} applied · ` : ""}{Math.max(0, planBalance - allocation.planCredits)} left</strong>
        </label>
      )}
      {(!compact || expanded) && <div className="benefit-cash-row">
        <span><b>Pay for the rest</b></span>
        <strong className="benefit-cash-price">
          {allocation.cashModels ? `${allocation.cashModels} × ` : ""}
          <CashPrice vip={hasLegacyBenefits && legacyBenefits.vipActive} />
          {!allocation.cashModels && " / model"}
        </strong>
      </div>}
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
  selectedIds,
  onSelection,
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
  selectedIds: number[];
  onSelection: (ids: number[]) => void;
  onRemove: (id: number) => void;
  onOpen: (m: Model) => void;
  onCheckout: (ids: number[], cashAmount: number) => void;
  onChoosePlan: (plan: "pro" | "max") => void;
  onPricing: () => void;
}) {
  const [cartView, setCartView] = useState<"all" | "selected">("all");
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const visibleItems = cartView === "selected" ? selectedItems : items;
  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const cash = selectedItems.length * MODEL_PRICE,
    vipPricing = hasLegacyBenefits && legacyBenefits.vipActive,
    allocation = allocateBenefits(
      selectedItems.length,
      user,
      legacyBenefits,
      creditBalance,
      hasLegacyBenefits,
      benefitChoices,
    ),
    allocationWithPlanCredits = allocateBenefits(
      selectedItems.length,
      user,
      legacyBenefits,
      creditBalance,
      hasLegacyBenefits,
      benefitChoices.includes("planCredits")
        ? benefitChoices
        : [...benefitChoices, "planCredits"],
    ),
    recommendMax =
      user === "pro" &&
      allocation.cashModels > 0 &&
      allocationWithPlanCredits.cashModels > 0,
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
            <div className="cart-selection-tools">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(event) =>
                    onSelection(event.target.checked ? items.map((item) => item.id) : [])
                  }
                />
                Select all
              </label>
              <div className="cart-view-tabs">
                <button
                  type="button"
                  className={cartView === "all" ? "active" : ""}
                  onClick={() => setCartView("all")}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  className={cartView === "selected" ? "active" : ""}
                  onClick={() => setCartView("selected")}
                >
                  Selected ({selectedItems.length})
                </button>
              </div>
            </div>
            {visibleItems.map((item) => (
              <article key={item.id} className={selectedIds.includes(item.id) ? "selected" : "unselected"}>
                <label className="cart-item-select" aria-label={`Select ${item.title}`}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onSelection(
                      selectedIds.includes(item.id)
                        ? selectedIds.filter((id) => id !== item.id)
                        : [...selectedIds, item.id],
                    )}
                  />
                </label>
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
                <strong><CashPrice vip={vipPricing} /></strong>
                <button className="remove" onClick={() => onRemove(item.id)}>
                  <Icon name="close" />
                </button>
              </article>
            ))}
          </section>
          <aside className="order-summary">
            <h2>Order summary</h2>
            <div>
              <span>{selectedItems.length} models</span>
              <b><CashPrice vip={vipPricing} count={selectedItems.length} /></b>
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
            {recommendMax && (
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
              <span>Due today</span>
              <strong>${allocation.cashAmount.toFixed(2)}</strong>
            </div>
            <button
              className="primary-cta"
              disabled={!selectedItems.length}
              onClick={() => onCheckout(selectedItems.map((item) => item.id), allocation.cashAmount)}
            >
              {allocation.cashAmount > 0 ? "Continue to payment" : "Confirm access"}
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
  notifications,
  onOpen,
  onBrowse,
  onPricing,
  onToggleRenew,
  onDemoDownload,
  onOrderAction,
  onBillingAction,
  onAccountNotice,
  onReadAllNotifications,
  onNotificationAction,
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
  notifications: NotificationRecord[];
  onOpen: (m: Model) => void;
  onBrowse: () => void;
  onPricing: () => void;
  onToggleRenew: () => void;
  onDemoDownload: () => void;
  onOrderAction: (order: OrderRecord) => void;
  onBillingAction: (record: BillingRecord) => void;
  onAccountNotice: (message: string) => void;
  onReadAllNotifications: () => void;
  onNotificationAction: (notification: NotificationRecord) => void;
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
            "Notifications",
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
          {tab === "Notifications" ? (
            <button
              className="notification-read-all"
              onClick={onReadAllNotifications}
              disabled={!notifications.some((item) => item.unread)}
            >
              Mark all as read
            </button>
          ) : (
            <button className="outline-button" onClick={onBrowse}>
              Browse models
            </button>
          )}
        </div>
        {tab === "Notifications" ? (
          <NotificationsPanel notifications={notifications} onOpen={onNotificationAction} />
        ) : tab === "Plan & Unlocks" ? (
          <PlanUnlocks
            user={user}
            creditUsed={creditUsed}
            freeClaimed={freeClaimed}
            legacyBenefits={legacyBenefits}
            hasLegacyBenefits={hasLegacyBenefits}
            autoRenew={autoRenew}
            renewalRetrying={user === "pro" && creditUsed >= 30}
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
              user={user}
              onOpen={onOpen}
              onAction={onOrderAction}
              onBillingAction={onBillingAction}
            />
          ) : (
            <AccountEmptyState
              icon="cart"
              title="No orders yet"
              text="Your paid and free model access will appear here."
              note=""
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
                </button>
                <b>{item.title}</b>
                <div className="card-software-tags account-card-tags">
                  <span>{item.type}</span>
                  {item.renderer && <span>{item.renderer}</span>}
                  {item.qualityChecked && <span className="quality-tag"><Icon name="check" size={12} /></span>}
                </div>
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
                : "No models yet"
            }
            text={
              tab === "Favorites"
                ? "Use the heart icon to save models for later."
                : "Models you buy or download will appear here."
            }
            note={
              tab === "Favorites"
                ? ""
                : ""
            }
            onBrowse={onBrowse}
          />
        )}
      </section>
    </main>
  );
}

function NotificationsPanel({
  notifications,
  onOpen,
}: {
  notifications: NotificationRecord[];
  onOpen: (notification: NotificationRecord) => void;
}) {
  return (
    <div className="notification-list">
      {!notifications.length && (
        <div className="notification-empty">
          <Icon name="bell" size={26} />
          <h2>No notifications yet</h2>
          <p>Account and payment updates will appear here.</p>
        </div>
      )}
      {notifications.map((notification) => (
        <article key={notification.id} className={notification.unread ? "unread" : ""}>
          <div className="notification-symbol"><Icon name="bell" size={21} /></div>
          <div className="notification-copy">
            <div>
              <h2>{notification.title}</h2>
              {notification.unread && <i aria-label="Unread" />}
            </div>
            <p>{notification.message}</p>
            <time>{notification.time}</time>
          </div>
          <button className="notification-view" onClick={() => onOpen(notification)}>View</button>
        </article>
      ))}
    </div>
  );
}

function NotificationDetail({ notification }: { notification: NotificationRecord }) {
  return (
    <section className="notification-detail">
      <h2>{notification.title}</h2>
      <p className="notification-meta">ARCHZZ · {notification.time}</p>
      <div><p>{notification.message}</p></div>
    </section>
  );
}

function PlanUnlocks({
  user,
  creditUsed,
  freeClaimed,
  legacyBenefits,
  hasLegacyBenefits,
  autoRenew,
  renewalRetrying,
  onPricing,
  onToggleRenew,
}: {
  user: UserMode;
  creditUsed: number;
  freeClaimed: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  autoRenew: boolean;
  renewalRetrying: boolean;
  onPricing: () => void;
  onToggleRenew: () => void;
}) {
  const subscribed = user === "pro" || user === "max";
  const planName = user === "max" ? "Max" : user === "pro" ? "Pro" : "No active plan";
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
            ? renewalRetrying
              ? "Payment is being retried. Plan credits are temporarily unavailable."
              : `${planCredits} credits remaining this billing period.`
            : "Choose Pro or Max to get monthly credits."}
        </p>
        {subscribed && (
          <>
            {renewalRetrying && (
              <div className="plan-payment-alert" role="status">
                <b>Payment retrying</b>
                <span>PayPal will retry automatically. Check your payment method if needed.</span>
              </div>
            )}
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
              <span>{autoRenew ? "Auto-renewal is on" : "Access ends Oct 07, 2026"}</span>
              <button className="cancel-plan" onClick={onToggleRenew}>
                {autoRenew ? "Cancel renewal" : "Resume auto-renewal"}
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
        </div>
        <div className="legacy-grid">
          <div>
            <span>Welcome Coupon</span>
            <b>{legacyBenefits.welcomeDownloads} remaining</b>
            <small>Expires Sep 10, 2026</small>
          </div>
          <div>
            <span>Invitation Coupon</span>
            <b>{legacyBenefits.invitationDownloads} remaining</b>
            <small>Expires Sep 30, 2026</small>
          </div>
          <div>
            <span>Legacy VIP Credits</span>
            <b>{legacyBenefits.vipCredits} remaining</b>
            <small>Expires Oct 07, 2026</small>
          </div>
          <div>
            <span>Legacy Download Credits</span>
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
  user,
  onOpen,
  onAction,
  onBillingAction,
}: {
  orders: OrderRecord[];
  billingRecords: BillingRecord[];
  models: Model[];
  user: UserMode;
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
          {view === "models" ? "models" : "transactions"}
        </span>
        <small>
          {view === "models"
            ? "Paid and free model access"
            : "Subscription and legacy benefit payments"}
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
        billingRecords.map((record) => {
          const pendingPlan = record.title.toLowerCase().includes("max")
            ? "max"
            : "pro";
          const canContinueSubscription =
            record.status === "Pending" &&
            record.kind === "Subscription" &&
            (user === "basic" || (user === "pro" && pendingPlan === "max"));
          return <article className="billing-record" key={record.id}>
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
              <span>Payment</span>
              <b>{record.channel}</b>
            </div>
            <div>
              <span>Amount</span>
              <b>{record.amount}</b>
            </div>
            <div className="order-state">
              <strong
                className={`order-status ${record.status.toLowerCase().replace(" ", "-")}`}
              >
                {record.status}
              </strong>
              {canContinueSubscription && (
                <button
                  className="order-action"
                  onClick={() => onBillingAction(record)}
                >
                  Continue payment
                </button>
              )}
            </div>
          </article>;
        })}
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
            <button onClick={onEdit}>Edit</button>
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
      {note && (
        <p className="account-empty-note">
          <Icon name="check" size={17} />
          {note}
        </p>
      )}
    </div>
  );
}

function ModelSection({
  freeClaimed,
  eyebrow,
  title,
  subtitle,
  items,
  onOpen,
  favorites,
  owned,
  cart,
  onFavorite,
  onCart,
  onFreeUnlock,
  onAll,
  vipPricing,
}: {
  freeClaimed: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  items: Model[];
  onOpen: (m: Model) => void;
  favorites: number[];
  owned: number[];
  cart: number[];
  onFavorite: (id: number) => void;
  onCart: (id: number) => boolean;
  onFreeUnlock?: (model: Model) => void;
  onAll?: () => void;
  vipPricing: boolean;
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
            freeClaimed={freeClaimed}
            key={model.id}
            model={model}
            onOpen={onOpen}
            favorite={favorites.includes(model.id)}
            owned={owned.includes(model.id)}
            inCart={cart.includes(model.id)}
            onFavorite={onFavorite}
            onCart={onCart}
            onFreeUnlock={onFreeUnlock}
            vipPricing={vipPricing}
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

function CashPrice({ vip, count = 1 }: { vip: boolean; count?: number }) {
  const originalPrice = MODEL_PRICE * count;
  const finalPrice = LEGACY_VIP_MODEL_PRICE * count;
  if (!vip) return <>${originalPrice.toFixed(2)}</>;
  return (
    <span className="vip-price">
      <del>${originalPrice.toFixed(2)}</del>
      <b>${finalPrice.toFixed(2)}</b>
      <em>VIP</em>
    </span>
  );
}

function ModelCard({
  freeClaimed,
  model,
  onOpen,
  favorite,
  owned,
  inCart,
  onFavorite,
  onCart,
  onFreeUnlock,
  vipPricing,
}: {
  freeClaimed: number;
  model: Model;
  onOpen: (m: Model) => void;
  favorite: boolean;
  owned: boolean;
  inCart: boolean;
  onFavorite: (id: number) => void;
  onCart: (id: number) => boolean;
  onFreeUnlock?: (model: Model) => void;
  vipPricing: boolean;
}) {
  const unavailable = !model.available,
    freeAvailable = model.free && freeClaimed < 3,
    freeLocked = model.free && !freeAvailable,
    purchasable = !owned && !freeAvailable && !unavailable,
    freeAction = !owned && freeAvailable && !unavailable,
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
        <div className="card-software-tags">
          <span>{model.type}</span>
          {model.renderer && <span>{model.renderer}</span>}
          {model.qualityChecked && (
            <span className="quality-tag" title="Quality checked" aria-label="Quality checked">
              <Icon name="check" size={13} />
            </span>
          )}
          {unavailable && <span>Unavailable</span>}
        </div>
        <div className="model-bottom">
          <strong>
            {unavailable
              ? "Unavailable"
              : owned
                ? "Owned"
                : model.free
                  ? "FREE"
                  : <CashPrice vip={vipPricing} />}
          </strong>
          <div className="card-actions">
            <button
              className={
                owned
                  ? "owned-card-action download-icon-action"
                  : inCart
                    ? "purchase-card-action cart-icon-action added"
                    : freeLocked
                      ? "purchase-card-action free-unlock-action"
                    : purchasable
                    ? "purchase-card-action cart-icon-action"
                  : freeAction
                      ? onFreeUnlock
                        ? "purchase-card-action free-unlock-action"
                        : "purchase-card-action download-icon-action"
                      : ""
              }
              onClick={() => {
                if (purchasable) {
                  if (!inCart) onCart(model.id);
                } else if (freeAction && onFreeUnlock) {
                  onFreeUnlock(model);
                } else onOpen(model);
              }}
              disabled={inCart}
              aria-label={
                owned
                  ? "Download again"
                  : unavailable
                    ? "View unavailable item"
                    : freeAvailable
                      ? "View free model"
                  : inCart
                    ? "Added to cart"
                    : model.free
                      ? "Unlock this free model"
                      : "Add to cart"
              }
            >
              {owned || (freeAction && !onFreeUnlock) ? (
                <img src="/download-card.svg" alt="" aria-hidden="true" />
              ) : inCart ? (
                <span className="added-check" aria-hidden="true" />
              ) : freeLocked ? (
                <span>Unlock</span>
              ) : freeAction && onFreeUnlock ? (
                <span>Unlock</span>
              ) : purchasable ? (
                <img src="/cart-card.svg" alt="" aria-hidden="true" />
              ) : (
                <Icon
                  name={
                    freeAvailable
                      ? "download"
                      : unavailable
                        ? "arrow"
                        : "cartPlus"
                  }
                  size={18}
                />
              )}
              {owned && <span>Again</span>}
              {purchasable && !freeLocked && (
                <span>
                  {inCart ? "Added" : model.free ? "Unlock" : "Add"}
                </span>
              )}
              {freeAction && !onFreeUnlock && <span>Free</span>}
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
  if (!hasMore) return null;
  return (
    <div className="auto-load-more">
      <button type="button" onClick={onLoad}>
        Load more
      </button>
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
  originalPrice,
  badge,
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
  originalPrice?: string;
  badge?: string;
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
      {featured && <span className="recommended">RECOMMENDED</span>}
      <h2>{name}</h2>
      <p>{description}</p>
      <div className="plan-price">
        <div className={originalPrice ? "plan-price-vip" : undefined}>
          {originalPrice && <del>{originalPrice}</del>}
          <strong>
            <span className="price-symbol">{price.slice(0, 1)}</span>
            {price.slice(1)}
          </strong>
          {badge && <em>{badge}</em>}
        </div>
        <span>{suffix}</span>
      </div>
      <div className="plan-value-note">
        <span>
          {name === "Buy once"
            ? "Pay per model"
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
          <b>Company Info</b>
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
  paymentOnly = false,
}: {
  models: Model[];
  user: UserMode;
  planBalance: number;
  legacyBenefits: LegacyBenefits;
  hasLegacyBenefits: boolean;
  benefitChoices: BenefitChoice[];
  onBenefitChoices: (choices: BenefitChoice[]) => void;
  onPay: (channel: "PayPal" | "Antom" | "DANA") => void;
  onUpgrade: () => void;
  onChoosePlan: (plan: "pro" | "max") => void;
  onPricing: () => void;
  paymentOnly?: boolean;
}) {
  const [paymentMethod, setPaymentMethod] = useState<"PayPal" | "Antom" | "DANA">("PayPal");
  const allocation = allocateBenefits(
      models.length,
      user,
      legacyBenefits,
      planBalance,
      hasLegacyBenefits,
      benefitChoices,
    ),
    allocationWithPlanCredits = allocateBenefits(
      models.length,
      user,
      legacyBenefits,
      planBalance,
      hasLegacyBenefits,
      benefitChoices.includes("planCredits")
        ? benefitChoices
        : [...benefitChoices, "planCredits"],
    ),
    recommendMax =
      user === "pro" &&
      allocation.cashModels > 0 &&
      allocationWithPlanCredits.cashModels > 0,
    sources = allocationSources(allocation);
  return (
    <div className="checkout-modal">
      <h2>{paymentOnly ? "Choose payment method" : "Review order"}</h2>
      {!paymentOnly && models.map((model, index) => (
          <div className="checkout-item" key={model.id}>
            <img src={model.image} alt="" />
            <span>
              <b>{model.title}</b>
              <small>{model.type} · Permanent access</small>
            </span>
            <strong>{sources[index] === "cash" ? <CashPrice vip={allocation.vipDiscount > 0} /> : "Covered"}</strong>
          </div>
      ))}
      {!paymentOnly && (hasLegacyBenefits || user === "pro" || user === "max") && (
        <BenefitPicker
          user={user}
          planBalance={planBalance}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          allocation={allocation}
          value={benefitChoices}
          onChange={onBenefitChoices}
          compact
        />
      )}
      {!paymentOnly && allocation.cashModels > 0 && allocation.vipDiscount > 0 ? (
        <div className="checkout-lines">
          <span><b>Subtotal</b><strong>${(models.length * MODEL_PRICE).toFixed(2)}</strong></span>
          <span><b>Legacy VIP discount</b><strong>−${allocation.vipDiscount.toFixed(2)}</strong></span>
        </div>
      ) : null}
      {!paymentOnly && recommendMax && (
        <div className="checkout-upgrade-option">
          <span>RECOMMENDED</span>
          <b>Upgrade to Max</b>
          <small>$35 today · {Math.max(0, 120 + planBalance)} credits available</small>
          <button type="button" onClick={onUpgrade}>Choose Max</button>
        </div>
      )}
      {!paymentOnly && user === "basic" && allocation.cashModels > 0 && (
        <SubscriptionOffer compact onChoose={onChoosePlan} onLearnMore={onPricing} />
      )}
      {allocation.cashAmount > 0 && (
        <>
          {!paymentOnly && <p className="payment-section-title">Choose payment method</p>}
          <div className="payment-options-grid one-time-payment-grid">
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
          <label className="payment-option">
            <input
              type="radio"
              name="payment-channel"
              checked={paymentMethod === "DANA"}
              onChange={() => setPaymentMethod("DANA")}
            />
            <span className="dana-wordmark">DANA</span>
            <b>DANA</b>
          </label>
          </div>
        </>
      )}
      <div className="checkout-sticky-actions">
        <div className="checkout-total">
          <span>Due today</span>
          <strong>${allocation.cashAmount.toFixed(2)}</strong>
        </div>
        <button className="primary-cta" onClick={() => onPay(paymentMethod)}>
          {allocation.cashAmount > 0
            ? `Continue to ${paymentMethod}`
            : "Unlock model"}
        </button>
        <p className="legal-note">
          {allocation.cashAmount > 0
            ? "By continuing, you agree to the Terms and License."
            : "By unlocking, you agree to the Terms and License."}
        </p>
      </div>
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
  allowBenefitSelection = true,
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
  allowBenefitSelection?: boolean;
  onBack?: () => void;
  backLabel?: string;
  onPay: (channel: "PayPal" | "Antom" | "DANA") => void;
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
            ? allowBenefitSelection
              ? `${unlockCount} model${unlockCount > 1 ? "s" : ""} unlocked after payment.`
              : `${unlockCount} model${unlockCount === 1 ? "" : "s"} · ${orderAllocation.planCredits} credit${orderAllocation.planCredits === 1 ? "" : "s"} used · ${Math.max(0, planBalance - orderAllocation.planCredits)} remaining.`
            : upgrading
            ? "Credits already used this billing period count toward your Max allowance."
            : `${credits} credits available after payment.`}
        </small>
      </div>
      {unlockCount > 0 && allowBenefitSelection && (
        <BenefitPicker
          user={plan}
          planBalance={planBalance}
          legacyBenefits={legacyBenefits}
          hasLegacyBenefits={hasLegacyBenefits}
          allocation={orderAllocation}
          value={benefitChoices}
          onChange={onBenefitChoices}
          compact
        />
      )}
      {orderAllocation.cashAmount > 0 && (
        <div className="checkout-lines">
          <span><b>{planName} plan</b><strong>${price.toFixed(2)}</strong></span>
          <span><b>Models not covered by credits</b><strong>${orderAllocation.cashAmount.toFixed(2)}</strong></span>
        </div>
      )}
      <p className="payment-section-title">Subscription payment method</p>
      <div className="payment-options-grid subscription-payment-grid">
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
      </div>
      <div className="renewal-note">
        Renews monthly at ${renewalPrice.toFixed(2)} until cancelled.
      </div>
      <div className="checkout-sticky-actions">
        <div className="checkout-total">
          <span>Due today</span>
          <strong>${dueToday.toFixed(2)}</strong>
        </div>
        <button className="primary-cta" onClick={() => onPay(paymentMethod)}>
          Continue to {paymentMethod}
        </button>
        <p className="legal-note">By continuing, you agree to recurring billing and the Terms.</p>
      </div>
    </div>
  );
}
