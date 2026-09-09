import type { ReactNode } from "react";

export type IconName =
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
  | "bell"
  | "close"
  | "menu";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<string, ReactNode> = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.2 4.2" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m4 18 5-5 4 4 3-3 5 5" /></>,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    heart: <path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />,
    cart: <><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.3 8H6" /><circle cx="10" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></>,
    cartPlus: <><path d="M3 5h2.2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 8H6.2" /><path d="M13 9.5v4.2M10.9 11.6h4.2" /><circle cx="9.8" cy="20" r="1.1" /><circle cx="18" cy="20" r="1.1" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    check: <><path d="M12 2.5 20 6v6c0 5-3.4 8.2-8 9.5C7.4 20.2 4 17 4 12V6l8-3.5Z" /><path d="m8.5 12 2.2 2.2 4.8-5" /></>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5" /><path d="M4 19v2h16v-2" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /><circle cx="12" cy="17" r="1.5" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.7 2.5 4.1 5.5 4.1 9s-1.4 6.5-4.1 9c-2.7-2.5-4.1-5.5-4.1-9S9.3 5.5 12 3Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  };

  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function ArchzzWordmark() {
  return (
    <svg className="archzz-wordmark" viewBox="0 0 590 100" role="img" aria-label="ARCHZZ">
      <text x="0" y="88" textLength="380" lengthAdjust="spacingAndGlyphs" fontFamily="Arial, Helvetica, sans-serif" fontSize="112" fontWeight="700" fill="currentColor">ARCH</text>
      <g transform="translate(395 6) scale(.686 .745)">
        <path fill="currentColor" transform="translate(0 22) scale(.8)" d="M0 0H115V20L38 90H110V110H0V90L77 20H0Z" />
        <path fill="#8F1818" d="M108 46L122 38V94L108 102Z" />
        <path fill="currentColor" transform="translate(138 0)" d="M0 0H115V20L38 90H110V110H0V90L77 20H0Z" />
      </g>
    </svg>
  );
}

export function SearchClearIcon() {
  return <svg className="search-clear-icon" viewBox="0 0 1024 1024" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M512 0C229.272524 0 0 229.272524 0 512s229.272524 512 512 512 512-229.272524 512-512S794.727476 0 512 0z m241.359982 701.667784a36.571429 36.571429 0 1 1-51.71509 51.715091L512 563.715091 322.355108 753.359982a36.571429 36.571429 0 1 1-51.71509-51.71509L460.284909 512 270.640018 322.355108a36.571429 36.571429 0 0 1 51.71509-51.71509L512 460.284909l189.644892-189.644891a36.571429 36.571429 0 0 1 51.71509 51.71509L563.715091 512z" /></svg>;
}

export function GalleryArrowIcon({ direction }: { direction: "left" | "right" }) {
  const path = direction === "left"
    ? "M671.101853 18.085573L202.497843 468.177463a59.972441 59.972441 0 0 0 0 87.271419l468.60401 450.1772a66.114711 66.114711 0 0 0 90.939719 0 59.972441 59.972441 0 0 0 0-87.271419L338.822112 511.855827l423.13415-406.413527a59.972441 59.972441 0 0 0 0-87.356727 65.944092 65.944092 0 0 0-90.939718-0.08531z"
    : "M337.604923 56.083692l432.679385 415.586462a55.374769 55.374769 0 0 1 0 80.580923l-432.679385 415.665231a61.046154 61.046154 0 0 1-83.889231 0 55.374769 55.374769 0 0 1 0-80.580923L644.332308 512 253.636923 136.822154a55.374769 55.374769 0 0 1 0-80.659692 60.888615 60.888615 0 0 1 83.889231-0.07877z";
  return <svg className="gallery-arrow-icon" viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" aria-hidden="true"><path d={path} /></svg>;
}
