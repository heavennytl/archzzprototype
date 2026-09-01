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
  modelId: number;
  date: string;
  access: string;
};

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
      "none" | "auth" | "checkout" | "cartCheckout" | "success"
    >("none");
  const [authIntent, setAuthIntent] = useState<
    "none" | "primary" | "favorite" | "cart" | "cartCheckout" | "plan"
  >("none");
  const [mobileNav, setMobileNav] = useState(false),
    [freeClaimed, setFreeClaimed] = useState(0),
    [toast, setToast] = useState("");
  const [searchType, setSearchType] = useState("All software"),
    [accountTab, setAccountTab] = useState<AccountTab>("My Assets");
  const [pendingPlan, setPendingPlan] = useState<"pro" | "max" | null>(null),
    [successCount, setSuccessCount] = useState(1);
  const [searchHistory, setSearchHistory] = useState([
    "Modern sofa",
    "Kitchen island",
    "Olive tree",
  ]);
  const [orders, setOrders] = useState<OrderRecord[]>([]),
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
  function searchFor(term: string, type = "All software") {
    setQuery(term);
    setSearchType(type);
    rememberSearch(term);
    navigate("search");
  }
  function openModel(model: Model) {
    setSelected(model);
    navigate("product");
  }
  function addOrders(ids: number[], access: string) {
    setOrders((items) => [
      ...ids.map((modelId, index) => ({
        id: `AZ-${Date.now()}-${modelId}`,
        modelId,
        date: `Aug ${String(26 - index).padStart(2, "0")}, 2026`,
        access,
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
    setCart((v) => (v.includes(id) ? v : [...v, id]));
    setToast("Added to cart");
    setTimeout(() => setToast(""), 1800);
  }
  function primaryAction(model: Model) {
    setSelected(model);
    setSuccessCount(1);
    if (!model.checked) return setToast("This item is unavailable");
    if (owned.includes(model.id)) return setModal("success");
    if (user === "guest") {
      setAuthIntent("primary");
      return setModal("auth");
    }
    if (model.free) {
      if (freeClaimed >= 3) return setToast("Today’s free limit reached");
      setOwned((v) => [...v, model.id]);
      setFreeClaimed((v) => v + 1);
      addOrders([model.id], "Free claim");
      return setModal("success");
    }
    if (user === "pro" || user === "max") {
      const balance = (user === "max" ? 124 : 18) - creditUsed;
      if (balance < 1) return setToast("No credits remaining");
      setOwned((v) => [...v, model.id]);
      setCreditUsed((v) => v + 1);
      addOrders([model.id], `1 ${user === "max" ? "Max" : "Pro"} credit`);
      return setModal("success");
    }
    setModal("checkout");
  }
  function authenticate() {
    setUser("basic");
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
      setOwned((v) => (v.includes(selected.id) ? v : [...v, selected.id]));
      setFreeClaimed((v) => v + 1);
      addOrders([selected.id], "Free claim");
      setModal("success");
    } else if (authIntent === "primary") setModal("checkout");
    else if (authIntent === "plan" && pendingPlan) {
      setUser(pendingPlan);
      setCreditUsed(0);
      setModal("none");
      setToast(`${pendingPlan === "max" ? "Max" : "Pro"} plan selected`);
      setPendingPlan(null);
    } else {
      setModal("none");
      setToast("Signed in successfully");
    }
    setAuthIntent("none");
  }
  function completePurchase(ids = [selected.id]) {
    const subscribed = user === "pro" || user === "max",
      balance = (user === "max" ? 124 : 18) - creditUsed;
    if (subscribed && ids.length > balance) {
      setModal("none");
      return setToast("Not enough credits for this order");
    }
    setOwned((v) => Array.from(new Set([...v, ...ids])));
    setCart((v) => v.filter((id) => !ids.includes(id)));
    if (subscribed) setCreditUsed((v) => v + ids.length);
    addOrders(
      ids,
      subscribed
        ? `1 ${user === "max" ? "Max" : "Pro"} credit`
        : "$1.99 buy once",
    );
    setSuccessCount(ids.length);
    setModal("success");
  }
  function choosePlan(mode: "pro" | "max") {
    if (user === "guest") {
      setPendingPlan(mode);
      setAuthIntent("plan");
      setModal("auth");
    } else {
      setUser(mode);
      setCreditUsed(0);
      setToast(`${mode === "max" ? "Max" : "Pro"} plan selected`);
    }
  }
  function openAccount(tab: AccountTab) {
    if (user === "guest") {
      setAuthIntent("none");
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
        />
      )}
      {page === "product" && (
        <ProductDetail
          model={selected}
          owned={owned.includes(selected.id)}
          allOwned={owned}
          favorites={favorites}
          user={user}
          creditBalance={(user === "max" ? 124 : 18) - creditUsed}
          favorite={favorites.includes(selected.id)}
          onFavorite={() => toggleFavorite(selected.id)}
          onFavoriteModel={toggleFavorite}
          onPrimary={() => primaryAction(selected)}
          onCart={() => addToCart(selected.id)}
          onCartModel={addToCart}
          onOpen={openModel}
          onPricing={() => navigate("pricing")}
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
          creditBalance={(user === "max" ? 124 : 18) - creditUsed}
          onRemove={(id) => setCart((v) => v.filter((x) => x !== id))}
          onOpen={openModel}
          onCheckout={() => {
            if (!cartModels.length) return;
            if (
              (user === "pro" || user === "max") &&
              cartModels.length > (user === "max" ? 124 : 18) - creditUsed
            )
              return setToast("Not enough credits for this order");
            if (user === "guest") {
              setAuthIntent("cartCheckout");
              setModal("auth");
            } else setModal("cartCheckout");
          }}
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
          orders={orders}
          onOpen={openModel}
          onBrowse={() => navigate("search")}
          onPricing={() => navigate("pricing")}
          onDemoDownload={() => setToast("File download is not connected")}
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
        <Modal onClose={() => setModal("none")}>
          {modal === "auth" && <Auth onContinue={authenticate} />}{" "}
          {modal === "checkout" && (
            <Checkout
              models={[selected]}
              user={user}
              onPay={() => completePurchase()}
            />
          )}{" "}
          {modal === "cartCheckout" && (
            <Checkout
              models={cartModels}
              user={user}
              onPay={() =>
                completePurchase(cartModels.map((model) => model.id))
              }
            />
          )}{" "}
          {modal === "success" && (
            <Success
              model={selected}
              count={successCount}
              onClose={() => setModal("none")}
              onAssets={() => {
                setModal("none");
                openAccount("My Assets");
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function ExtraCategories({
  onSearchFor,
}: {
  onSearchFor: (term: string, type?: string) => void;
}) {
  const [target, setTarget] = useState<Element | null>(null);
  useEffect(() => {
    setTarget(document.querySelector(".category-rail"));
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
          ARCHZZ
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
            disabled
            title="Image search is not available"
            aria-label="Image search unavailable"
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
        subtitle="A curated selection."
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
            Assets once claimed.
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
          <p>Only governed files receive the badge.</p>
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
          <b>Files before hype</b>
          <p>Real formats, versions and sizes—when verified.</p>
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
}) {
  const [renderer, setRenderer] = useState("All renderers"),
    [visibleCount, setVisibleCount] = useState(40);
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
      ? type === "All software"
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
      .filter((item) => type === "All software" || item.type === type)
      .filter(
        (item) => renderer === "All renderers" || item.renderer === renderer,
      ),
    visibleModels = filtered.slice(0, visibleCount);
  useEffect(() => setVisibleCount(40), [query, type, renderer]);
  const resetFilters = () => {
    onQuery("");
    onType("All software");
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
            disabled
            title="Image search is not available"
            aria-label="Image search unavailable"
          >
            <Icon name="image" size={19} />
          </button>
          <button className="search-button">Search</button>
        </form>
        <div className="filter-bar">
          <FilterSelect
            value={type}
            onChange={onType}
            options={["All software", "SketchUp", "3ds Max"]}
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
  favorite,
  onFavorite,
  onFavoriteModel,
  onPrimary,
  onCart,
  onCartModel,
  onOpen,
  onPricing,
}: {
  model: Model;
  owned: boolean;
  allOwned: number[];
  favorites: number[];
  user: UserMode;
  creditBalance: number;
  favorite: boolean;
  onFavorite: () => void;
  onFavoriteModel: (id: number) => void;
  onPrimary: () => void;
  onCart: () => void;
  onCartModel: (id: number) => void;
  onOpen: (m: Model) => void;
  onPricing: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [pdpAddedToCart, setPdpAddedToCart] = useState(false);
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
        ? "Claim this model"
        : subscribed
          ? "Use 1 credit"
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
  useEffect(() => setActiveImage(0), [model.id]);
  useEffect(() => setPdpAddedToCart(false), [model.id]);
  const handlePdpCart = () => {
    if (pdpAddedToCart) return;
    onCart();
    setPdpAddedToCart(true);
  };
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
              alt={`${model.title} · image ${activeImage + 1}`}
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
            <p>By ArchZZ Studio · SKU AZ-{String(model.id).padStart(6, "0")}</p>
          </div>
          <div className="decision-row">
            <div className="buy-once-price">
              <strong>{model.free ? "Free" : "$1.99"}</strong>
            </div>
            <div className="membership-decision">
              {subscribed ? (
                <>
                  <span>YOUR PLAN</span>
                  <strong>1 credit</strong>
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
            </div>
          </div>
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
                <b>In My Assets · Download again uses no additional credit</b>
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
                className={`cart-cta pdp-cart-icon-cta ${pdpAddedToCart ? "added" : ""}`}
                onClick={handlePdpCart}
                disabled={pdpAddedToCart}
                aria-label={pdpAddedToCart ? "Added to cart" : "Add to cart"}
                title={pdpAddedToCart ? "Added to cart" : "Add to cart"}
              >
                {pdpAddedToCart ? (
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
        subtitle="Similar quality-checked models."
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
            Mix 20 SketchUp and 20 3ds Max models; claimed files stay in My
            Assets.
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
        <p>Choose across both tabs · {claimed} claimed today</p>
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
                  disabled={claimed >= 3 || owned.includes(model.id)}
                  onClick={() => onClaim(model)}
                >
                  {owned.includes(model.id)
                    ? "In My Assets"
                    : claimed >= 3
                      ? "Daily limit reached"
                      : "Claim free"}
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
          button="Browse models"
          onClick={onBrowse}
        />
        <Plan
          name="Pro"
          price="$14.99"
          suffix="per month"
          description="For designers working on active projects."
          features={[
            "30 credits each month",
            "Roll over up to 60",
            "$0.99 extra credits",
            "Daily free models included",
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
            "Roll over up to 300",
            "$0.99 extra credits",
            "Daily free models included",
          ]}
          button={user === "max" ? "Current plan" : "Choose Max"}
          current={user === "max"}
          onClick={() => onChoose("max")}
        />
      </div>
      <section className="pricing-rules">
        <h2>Clear rules, before you subscribe.</h2>
        {[
          [
            "What happens to unlocked models?",
            "They remain in My Assets with permanent access.",
          ],
          [
            "Do unused credits roll over?",
            "Up to 60 on Pro and 300 on Max while subscribed.",
          ],
          [
            "Can I buy more?",
            "Subscribers can buy packs of 10 extra credits for $0.99 each.",
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

function CartPage({
  items,
  user,
  creditBalance,
  onRemove,
  onOpen,
  onCheckout,
}: {
  items: Model[];
  user: UserMode;
  creditBalance: number;
  onRemove: (id: number) => void;
  onOpen: (m: Model) => void;
  onCheckout: () => void;
}) {
  const cash = items.length * 1.99,
    subscribed = user === "pro" || user === "max",
    plan = user === "max" ? "Max" : "Pro";
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
          <h2>Your cart is ready for a project.</h2>
          <p>Add paid models to compare and purchase them together.</p>
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
            {subscribed ? (
              <div className="recommend-box">
                <span>MEMBER ACCESS</span>
                <b>
                  Use {items.length} {plan} credits
                </b>
                <p>{creditBalance} credits available.</p>
              </div>
            ) : (
              <div className="recommend-box">
                <span>BUY ONCE</span>
                <b>${cash.toFixed(2)}</b>
                <p>Permanent access to every purchased model.</p>
              </div>
            )}
            <div className="total">
              <span>{subscribed ? "Credits required" : "Amount due"}</span>
              <strong>
                {subscribed ? items.length : `$${cash.toFixed(2)}`}
              </strong>
            </div>
            <button className="primary-cta" onClick={onCheckout}>
              Review order
            </button>
            <small>No payment or file delivery is processed here</small>
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
  onOpen,
  onBrowse,
  onPricing,
  onDemoDownload,
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
  onOpen: (m: Model) => void;
  onBrowse: () => void;
  onPricing: () => void;
  onDemoDownload: () => void;
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
            onPricing={onPricing}
            onCancel={() =>
              onAccountNotice("Subscription cancellation is not available here")
            }
          />
        ) : tab === "My Orders" ? (
          orders.length ? (
            <OrderHistory orders={orders} models={catalog} onOpen={onOpen} />
          ) : (
            <AccountEmptyState
              icon="cart"
              title="No orders yet"
              text="Completed purchases and model unlocks will appear here with their access status."
              note="Your order history will stay with your account"
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
                    <Icon name="download" /> Download again
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
                ? "Use the heart on any model to keep a shortlist for your next project."
                : "Models you buy or claim will stay here, ready to access again."
            }
            note={
              tab === "Favorites"
                ? "Your shortlist is private"
                : "Purchases and claimed free models appear automatically"
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
  onPricing,
  onCancel,
}: {
  user: UserMode;
  creditUsed: number;
  freeClaimed: number;
  onPricing: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="plan-account">
      <section className="current-plan-card basic-plan-card">
        <div>
          <h2>Basic</h2>
          <button onClick={onPricing}>View Pro &amp; Max</button>
        </div>
        <p>Get lower per-model pricing with a Pro or Max subscription.</p>
      </section>
      <div className="free-credit-row">
        <span>TODAY’S FREE</span>
        <b>{3 - freeClaimed} of 3 remaining</b>
        <small>Refreshes daily at 00:00 UTC</small>
      </div>
    </div>
  );
}

function OrderHistory({
  orders,
  models,
  onOpen,
}: {
  orders: OrderRecord[];
  models: Model[];
  onOpen: (model: Model) => void;
}) {
  return (
    <div className="order-history">
      <div className="order-history-head">
        <span>
          {orders.length} completed {orders.length === 1 ? "record" : "records"}
        </span>
        <small>Purchases, credits and free claims</small>
      </div>
      {orders.map((order) => {
        const model = models.find((item) => item.id === order.modelId);
        if (!model) return null;
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
              <b>{order.id.split("-").slice(-2).join("-")}</b>
            </div>
            <div>
              <span>Date</span>
              <b>{order.date}</b>
            </div>
            <div>
              <span>Access</span>
              <b>{order.access}</b>
            </div>
            <strong className="order-status">Completed</strong>
          </article>
        );
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
  useEffect(
    () => setVisibleCount(paginated ? 20 : items.length),
    [paginated, items.length, items[0]?.id],
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
    primaryAction = purchasable || freeAction,
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
        <p>{model.category} · ArchZZ Studio</p>
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
  const marker = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = marker.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoad();
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, onLoad]);
  return (
    <div
      ref={marker}
      className={hasMore ? "auto-load-more" : "auto-load-more complete"}
      aria-live="polite"
    >
      <span>{hasMore ? "Load more" : "All results shown"}</span>
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
      <p className="kicker">CONTINUE YOUR TASK</p>
      <h2>Sign in to save, claim or purchase models.</h2>
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
      <small>We’ll return you to the same action after sign-in.</small>
    </div>
  );
}
function Checkout({
  models,
  user,
  onPay,
}: {
  models: Model[];
  user: UserMode;
  onPay: () => void;
}) {
  const subscribed = user === "pro" || user === "max",
    total = models.length * 1.99;
  return (
    <div className="checkout-modal">
      <p className="kicker">ORDER REVIEW</p>
      <h2>Review your model access</h2>
      {models.map((model) => (
        <div className="checkout-item" key={model.id}>
          <img src={model.image} alt="" />
          <span>
            <b>{model.title}</b>
            <small>{model.type} · Permanent access</small>
          </span>
          <strong>{subscribed ? "1 credit" : "$1.99"}</strong>
        </div>
      ))}
      {!subscribed && (
        <>
          <p className="payment-section-title">Select payment method</p>
          <label className="payment-option">
            <input type="radio" name="payment-channel" defaultChecked />
            <img
              className="payment-logo paypal-logo"
              src="/paypal-logo.png"
              alt="PayPal"
            />
            <b>PayPal</b>
          </label>
          <label className="payment-option">
            <input type="radio" name="payment-channel" />
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
        {subscribed
          ? `Confirm ${models.length} credit${models.length > 1 ? "s" : ""}`
          : "Confirm purchase"}
      </button>
    </div>
  );
}
function Success({
  model,
  count,
  onClose,
  onAssets,
}: {
  model: Model;
  count: number;
  onClose: () => void;
  onAssets: () => void;
}) {
  return (
    <div className="success-modal">
      <span className="success-icon">
        <Icon name="check" size={34} />
      </span>
      <h2>
        {count > 1
          ? `${count} models are now in My Assets.`
          : `${model.title} is now in My Assets.`}
      </h2>
      <p>
        No file download has started because file delivery is not connected.
      </p>
      <button className="primary-cta" onClick={onClose}>
        <Icon name="download" /> Download again
      </button>
      <button className="text-button" onClick={onAssets}>
        Go to My Assets
      </button>
    </div>
  );
}
