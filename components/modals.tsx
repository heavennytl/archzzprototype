"use client";

import { useState, type ReactNode } from "react";

import { Icon } from "./brand";

export function Modal({ children, onClose }: { children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button>
        {children}
      </div>
    </div>
  );
}

export function Auth({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="auth-modal">
      <p className="kicker">SIGN IN</p>
      <h2>Sign in to continue.</h2>
      <button className="google-button" onClick={onContinue}>
        <img src="/google-g.svg" alt="" aria-hidden="true" />
        Continue with Google
      </button>
      <div className="or"><span />or<span /></div>
      <label>Email address<input type="email" placeholder="you@studio.com" /></label>
      <button className="primary-cta" onClick={onContinue}>Continue with email</button>
      <small>You’ll return here after sign-in.</small>
    </div>
  );
}

export function ImageSearch({ onSearch }: { onSearch: () => void }) {
  const [fileName, setFileName] = useState("");
  return (
    <div className="image-search-modal">
      <p className="kicker">IMAGE SEARCH</p>
      <h2>Search by image</h2>
      <label className="image-upload-box">
        <Icon name="image" size={28} />
        <b>{fileName || "Choose an image"}</b>
        <span>JPG, PNG or WebP</span>
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setFileName(event.target.files?.[0]?.name || "")} />
      </label>
      <button className="primary-cta" disabled={!fileName} onClick={onSearch}>Find similar models</button>
    </div>
  );
}

export function CancelRenewal({ onKeep, onConfirm }: { onKeep: () => void; onConfirm: () => void }) {
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

export function LicenseSummary({ onFullTerms }: { onFullTerms: () => void }) {
  return (
    <div className="license-modal">
      <p className="kicker">STANDARD LICENSE</p>
      <h2>Use models in your projects</h2>
      <ul className="license-allowed">
        <li><Icon name="check" size={17} /> Personal and commercial projects</li>
        <li><Icon name="check" size={17} /> Rendered images and videos</li>
      </ul>
      <div className="license-prohibited"><b>Not allowed</b><p>Redistributing, sharing or reselling the source model files.</p></div>
      <button className="text-button" type="button" onClick={onFullTerms}>View full license terms</button>
    </div>
  );
}

export function SubscriptionSuccess({ title, message, onClose, onAccount }: { title: string; message: string; onClose: () => void; onAccount: () => void }) {
  return (
    <div className="success-modal">
      <span className="success-icon"><Icon name="check" size={34} /></span>
      <h2>{title}</h2><p>{message}</p>
      <button className="primary-cta" onClick={onClose}>Continue browsing</button>
      <button className="text-button" onClick={onAccount}>View Plan &amp; Unlocks</button>
    </div>
  );
}

export function Success({ count, title, message, onClose, onDownload, onAssets }: { count: number; title: string; message: string; onClose: () => void; onDownload: () => void; onAssets: () => void }) {
  return (
    <div className="success-modal">
      <span className="success-icon"><Icon name="check" size={34} /></span>
      <h2>{title}</h2><p>{message}</p>
      <button className="primary-cta" onClick={count > 1 ? onAssets : onDownload}>
        {count > 1 ? <>View My Assets</> : <><Icon name="download" /> Download model</>}
      </button>
      <button className="text-button" onClick={count > 1 ? onClose : onAssets}>{count > 1 ? "Continue browsing" : "Go to My Assets"}</button>
    </div>
  );
}
