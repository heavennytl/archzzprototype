"use client";

import { useEffect, useState } from "react";

type UserState = "guest" | "no-credit" | "credits" | "unlocked";
type View = "product" | "orders" | "assets";
type Modal =
  | "none"
  | "auth"
  | "auth-success"
  | "redeem"
  | "package"
  | "checkout"
  | "payment"
  | "success"
  | "download-blocked";

const productImage =
  "https://d2r9epyceweg5n.cloudfront.net/stores/002/234/113/products/c5369a37-4c38-438f-8a0a-0e7ac85674c41-dd219a9f5164bb09eb16712374590853-1024-1024.jpeg";
const alternateImages = [
  productImage,
  "https://cdn.shopify.com/s/files/1/0871/2798/2406/files/172261ce-9339-41d3-8c79-9002afbf330b.jpg?v=1774273106",
  "https://amazingarchitecture.com/storage/files/4049/architecture-firm/kvadrat%20architects/lake-house/lake-house-shchuchinsk-kvadrat-architects-6.jpg",
];

const packageOptions = [
  { id: "basic", name: "Native File", meta: "3ds Max 2016 · 32.86 MB", price: "$0.40", old: "$3.00" },
  { id: "creator", name: "Creator Pack", meta: "MAX · FBX · OBJ · Textures", price: "$0.80", old: "$6.00", recommended: true },
  { id: "universal", name: "Universal Pack", meta: "All formats · Materials · Support", price: "$1.20", old: "$8.00" },
];

export default function Home() {
  const [userState, setUserState] = useState<UserState>("guest");
  const [view, setView] = useState<View>("product");
  const [modal, setModal] = useState<Modal>("none");
  const [imageIndex, setImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const [emailStep, setEmailStep] = useState<"email" | "code">("email");
  const [selectedPackage, setSelectedPackage] = useState("creator");
  const [payment, setPayment] = useState("antom");
  const [downloadBlocked, setDownloadBlocked] = useState(false);
  const [seconds, setSeconds] = useState(15 * 60);

  useEffect(() => {
    if (view !== "orders" || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [view, seconds]);

  const packageItem = packageOptions.find((item) => item.id === selectedPackage)!;
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const isUnlocked = userState === "unlocked";

  function startPurchase() {
    if (userState === "guest") setModal("auth");
    else if (userState === "credits") setModal("redeem");
    else if (userState === "unlocked") finishDownload();
    else setModal("package");
  }

  function finishDownload() {
    setModal(downloadBlocked ? "download-blocked" : "success");
  }

  function changeView(next: View) {
    setView(next);
    setModal("none");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetPrototype() {
    setView("product");
    setModal("none");
    setUserState("guest");
    setEmailStep("email");
    setSelectedPackage("creator");
    setSeconds(15 * 60);
  }

  return (
    <main>
      <header className="site-header">
        <button className="brand" onClick={() => changeView("product")}>ARCHZZ</button>
        <nav aria-label="Primary navigation">
          <button onClick={() => changeView("product")}>SketchUp Models</button>
          <button onClick={() => changeView("product")}>3ds Max Models</button>
          <button onClick={() => changeView("product")}>AI Image Studio</button>
        </nav>
        <div className="header-actions">
          <button className="round-button" aria-label="Search">⌕</button>
          {userState === "guest" ? (
            <button className="account-button" onClick={() => setModal("auth")}>Log in</button>
          ) : (
            <button className="account-button" onClick={() => changeView("assets")}>Mia</button>
          )}
          <button className="round-button" onClick={() => changeView("orders")} aria-label="Orders">▣</button>
        </div>
      </header>

      {view === "product" && (
        <>
          <div className="search-row">
            <span>All assets</span>
            <input aria-label="Search assets" placeholder="Search 3D models" />
            <button aria-label="Submit search">Search</button>
          </div>

          <div className="crumbs">Home / Decorations / Sculpture</div>
          <section className="product-shell">
            <div className="gallery">
              <div className="thumbnail-list">
                {alternateImages.map((image, index) => (
                  <button className={`thumb ${imageIndex === index ? "active" : ""}`} onClick={() => setImageIndex(index)} key={image}>
                    <img src={image} alt={`Product view ${index + 1}`} />
                  </button>
                ))}
              </div>
              <div className="main-image">
                <img src={alternateImages[imageIndex]} alt="Modern abstract sculpture in a styled interior" />
                <button className="gallery-arrow left" onClick={() => setImageIndex((imageIndex + 2) % 3)} aria-label="Previous image">‹</button>
                <button className="gallery-arrow right" onClick={() => setImageIndex((imageIndex + 1) % 3)} aria-label="Next image">›</button>
                <span className="image-count">{imageIndex + 1} / {alternateImages.length}</span>
              </div>
            </div>

            <div className="product-info">
              <div className="eyebrow">3DS MAX MODEL</div>
              <h1>Modern Wave Sculpture &amp; Display Set</h1>
              <div className="trust-line">
                <a href="#author">by Studio Forma</a>
                <span className="rating">★ 4.8 <small>(126)</small></span>
                <span>1,842 downloads</span>
              </div>

              {!isUnlocked && (
                <>
                  <div className="price-row">
                    <span className="sale-price">$0.80</span>
                    <span className="old-price">$6.00</span>
                    <span className="discount">87% OFF</span>
                  </div>
                  <p className="license-summary">Commercial license included · Secure checkout</p>
                </>
              )}
              {isUnlocked && <div className="owned-badge">✓ Owned · Available in My Assets</div>}

              <div className="quick-facts">
                <div><span>Software</span><strong>3ds Max 2016+</strong></div>
                <div><span>Formats</span><strong>MAX · FBX · OBJ</strong></div>
                <div><span>File size</span><strong>32.86 MB</strong></div>
                <div><span>Render</span><strong>V-Ray 5</strong></div>
              </div>

              {!isUnlocked && (
                <div className="credit-note">
                  <div className="credit-icon">C</div>
                  <div>
                    <strong>Unlock permanently with 1 Credit</strong>
                    <p>Re-download anytime from My Assets. No extra charge.</p>
                  </div>
                  {userState !== "guest" && <span className="balance">Balance: {userState === "credits" ? 3 : 0}</span>}
                </div>
              )}

              {!isUnlocked && <div className="cta-price"><span>You pay today</span><strong>$0.80</strong></div>}
              <div className="cta-row">
                <button className="primary" onClick={startPurchase}>{isUnlocked ? "DOWNLOAD AGAIN" : "GET IT NOW"}</button>
                <button className={`favorite ${liked ? "selected" : ""}`} onClick={() => setLiked(!liked)} aria-label="Save model">{liked ? "♥" : "♡"}</button>
              </div>
              <p className="safe-copy">Instant access · Files stay in My Assets · 14-day support</p>
            </div>
          </section>

          <section className="details-grid">
            <article>
              <p className="section-kicker">WHAT’S INCLUDED</p>
              <h2>Everything you need to start rendering</h2>
              <ul className="included-list">
                <li><span>Native scene</span><strong>3ds Max 2016</strong></li>
                <li><span>Exchange files</span><strong>FBX · OBJ</strong></li>
                <li><span>Supporting files</span><strong>Textures · Materials · Previews</strong></li>
              </ul>
            </article>
            <article id="license">
              <p className="section-kicker">COMMERCIAL LICENSE</p>
              <h2>Clear usage rights</h2>
              <p>Use in client projects, visualizations and marketing renders. Redistribution or resale of source files is prohibited.</p>
              <a href="#license">View full license →</a>
            </article>
          </section>
        </>
      )}

      {view === "orders" && (
        <section className="account-page">
          <AccountNav active="orders" onNavigate={changeView} />
          <div className="account-content">
            <div className="page-heading"><div><p className="section-kicker">MY ACCOUNT</p><h1>Orders</h1></div><p>Resume interrupted payments without losing your item.</p></div>
            <div className="order-card pending">
              <img src={productImage} alt="Modern Wave Sculpture" />
              <div className="order-main"><span className="status-pill">Pending payment</span><h3>Modern Wave Sculpture &amp; Display Set</h3><p>Order #AZ-260819-0482 · Creator Pack</p></div>
              <div className="order-total"><span>Expires in</span><strong className="timer">{seconds > 0 ? time : "Expired"}</strong><b>$0.80</b></div>
              <div className="order-actions"><button className="primary small" disabled={seconds === 0} onClick={() => setModal("payment")}>Pay now</button><button className="secondary">View details</button></div>
            </div>
            <div className="order-card failed">
              <img src={alternateImages[1]} alt="Abstract art model" />
              <div className="order-main"><span className="status-pill">Payment failed</span><h3>Abstract Gallery Objects Vol. 02</h3><p>Your bank declined this payment. Try PayPal or another card.</p></div>
              <div className="order-total"><span>Aug 18, 2026</span><b>$1.20</b></div>
              <div className="order-actions"><button className="secondary strong" onClick={() => setModal("payment")}>Retry payment</button></div>
            </div>
            <div className="order-card expired">
              <img src={alternateImages[2]} alt="Metal sculpture model" />
              <div className="order-main"><span className="status-pill">Expired</span><h3>Metal Sculpture Collection</h3><p>This payment window has ended. Create a new order to continue.</p></div>
              <div className="order-total"><span>Aug 17, 2026</span><b>$0.60</b></div>
              <div className="order-actions"><button className="secondary strong" onClick={() => changeView("product")}>Buy again</button></div>
            </div>
          </div>
        </section>
      )}

      {view === "assets" && (
        <section className="account-page">
          <AccountNav active="assets" onNavigate={changeView} />
          <div className="account-content">
            <div className="page-heading"><div><p className="section-kicker">MY ACCOUNT</p><h1>My Assets</h1></div><p>Purchased and Credit-unlocked models remain available here.</p></div>
            <div className="asset-grid">
              <article className="asset-card">
                <img src={productImage} alt="Modern Wave Sculpture" />
                <div><span className="owned-tag">Permanently unlocked</span><h3>Modern Wave Sculpture &amp; Display Set</h3><p>MAX · FBX · OBJ · 32.86 MB</p><button onClick={finishDownload}>Download again</button></div>
              </article>
              <article className="asset-card">
                <img src={alternateImages[2]} alt="Metal sculpture set" />
                <div><span className="owned-tag">Purchased</span><h3>Metal Sculpture Collection</h3><p>MAX · FBX · Textures · 48.12 MB</p><button>Download again</button></div>
              </article>
            </div>
          </div>
        </section>
      )}

      <aside className="prototype-panel" aria-label="Prototype controls">
        <div><span className="prototype-dot" />Prototype controls</div>
        <label>User state
          <select value={userState} onChange={(event) => { setUserState(event.target.value as UserState); setView("product"); setModal("none"); }}>
            <option value="guest">Guest</option>
            <option value="no-credit">Member · 0 Credits</option>
            <option value="credits">Member · 3 Credits</option>
            <option value="unlocked">Already unlocked</option>
          </select>
        </label>
        <label className="check-label"><input type="checkbox" checked={downloadBlocked} onChange={(event) => setDownloadBlocked(event.target.checked)} /> Block auto-download</label>
        <button onClick={resetPrototype}>Reset flow</button>
      </aside>

      {modal !== "none" && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal("none"); }}>
        {modal === "auth" && (
          <Dialog onClose={() => setModal("none")} className="auth-dialog">
            {emailStep === "email" ? <>
              <p className="modal-kicker">CONTINUE YOUR DOWNLOAD</p>
              <h2>Sign in or create an account</h2>
              <p className="modal-intro">We’ll bring you straight back to this model after verification.</p>
              <button className="google-button">G&nbsp;&nbsp; Continue with Google</button>
              <div className="or"><span />or<span /></div>
              <label className="field-label">Email address<input defaultValue="demo@archzz.com" type="email" /></label>
              <button className="primary full" onClick={() => setEmailStep("code")}>Continue</button>
              <small className="terms">By continuing, you agree to the Terms of Use and Privacy Policy.</small>
            </> : <>
              <button className="back-link" onClick={() => setEmailStep("email")}>← Back</button>
              <p className="modal-kicker">EMAIL VERIFICATION</p>
              <h2>Enter the 6-digit code</h2>
              <p className="modal-intro">A code was sent to demo@archzz.com. This prototype accepts any code.</p>
              <div className="code-boxes">{[1,2,3,4,5,6].map((item) => <input key={item} maxLength={1} defaultValue={String(item)} aria-label={`Code digit ${item}`} />)}</div>
              <button className="primary full" onClick={() => { setUserState("no-credit"); setModal("auth-success"); setEmailStep("email"); }}>Verify &amp; continue</button>
              <button className="resend">Resend code</button>
            </>}
          </Dialog>
        )}

        {modal === "auth-success" && (
          <Dialog onClose={() => setModal("none")} compact>
            <div className="success-mark">✓</div>
            <p className="modal-kicker centered">ACCOUNT READY</p>
            <h2>Welcome to ARCHZZ</h2>
            <p className="modal-intro centered">You’re signed in. Continue exactly where you left off—no extra onboarding pop-ups.</p>
            <button className="primary full" onClick={() => setModal("package")}>Continue to this model</button>
            <button className="secondary full" onClick={() => setModal("none")}>Stay on product page</button>
          </Dialog>
        )}

        {modal === "redeem" && (
          <Dialog onClose={() => setModal("none")}>
            <p className="modal-kicker">CREDIT REDEMPTION</p>
            <h2>Unlock permanently &amp; download</h2>
            <div className="mini-product"><img src={productImage} alt="Model" /><div><strong>Modern Wave Sculpture</strong><span>Creator Pack · MAX, FBX, OBJ</span></div></div>
            <div className="credit-ledger"><div><span>Your balance</span><strong>3 Credits</strong></div><div><span>This unlock</span><strong>−1 Credit</strong></div><div className="remaining"><span>Balance after unlock</span><strong>2 Credits</strong></div></div>
            <div className="info-callout"><strong>One Credit, permanent access</strong><p>This model is added to My Assets. Download it again anytime without spending another Credit.</p></div>
            <button className="primary full" onClick={() => { setUserState("unlocked"); finishDownload(); }}>Redeem 1 Credit &amp; Download</button>
            <button className="secondary full" onClick={() => setModal("none")}>Cancel</button>
          </Dialog>
        )}

        {modal === "package" && (
          <Dialog onClose={() => setModal("none")} wide>
            <p className="modal-kicker">CHOOSE A DOWNLOAD PACKAGE</p>
            <h2>Pick the files that fit your workflow</h2>
            <p className="modal-intro">Creator Pack is recommended for the best balance of compatibility and value.</p>
            <div className="package-grid">
              {packageOptions.map((item) => <button key={item.id} onClick={() => setSelectedPackage(item.id)} className={`package-option ${selectedPackage === item.id ? "selected" : ""}`}>
                {item.recommended && <span className="recommend-tag">Recommended</span>}
                <span className="radio-dot" />
                <strong>{item.name}</strong><small>{item.meta}</small>
                <div><b>{item.price}</b><s>{item.old}</s></div>
              </button>)}
            </div>
            <button className="primary full" onClick={() => setModal("checkout")}>Continue with {packageItem.name} · {packageItem.price}</button>
            <button className="secondary full" onClick={() => setModal("none")}>Cancel</button>
          </Dialog>
        )}

        {modal === "checkout" && (
          <Dialog onClose={() => setModal("none")} wide>
            <div className="checkout-head"><div><p className="modal-kicker">ORDER CONFIRMATION</p><h2>Review your order</h2></div><span className="secure-badge">Secure checkout</span></div>
            <div className="checkout-layout">
              <div>
                <div className="mini-product checkout-product"><img src={productImage} alt="Model" /><div><strong>Modern Wave Sculpture</strong><span>{packageItem.name} · Commercial license</span></div><b>{packageItem.price}</b></div>
                <div className="checkout-upsell">
                  <div><span className="optional-label">OPTIONAL · NOT SELECTED</span><strong>Save more with Credits</strong><p>20 Credits · Unlock 20 models permanently</p></div>
                  <button>View option</button>
                </div>
                <button className="skip-link">Skip offers and continue with this order</button>
              </div>
              <div className="summary-card">
                <h3>Order summary</h3>
                <div><span>Original price</span><s>{packageItem.old}</s></div>
                <div><span>Launch discount</span><em>−{selectedPackage === "basic" ? "$2.60" : selectedPackage === "creator" ? "$5.20" : "$6.80"}</em></div>
                <div className="summary-total"><span>Total due</span><strong>{packageItem.price}</strong></div>
                <button className="primary full" onClick={() => setModal("payment")}>Choose payment method</button>
                <small>Offers are never added without your confirmation.</small>
              </div>
            </div>
          </Dialog>
        )}

        {modal === "payment" && (
          <Dialog onClose={() => setModal("none")} wide>
            <p className="modal-kicker">PAYMENT</p>
            <h2>Choose how you want to pay</h2>
            <p className="modal-intro">Available methods are shown for your country and currency.</p>
            <div className="payment-list">
              <PaymentOption id="antom" selected={payment} onSelect={setPayment} title="Credit or debit card" subtitle="Visa · Mastercard · Amex" badge="Antom" note="Securely processed by Antom" />
              <PaymentOption id="paypal" selected={payment} onSelect={setPayment} title="PayPal" subtitle="Fast checkout with your PayPal account" badge="PayPal" />
              <PaymentOption id="wallet" selected={payment} onSelect={setPayment} title="Local wallets" subtitle="DANA · GCash · Touch ’n Go" badge="Wallets" />
            </div>
            <div className="payment-bottom"><div><span>Total due</span><strong>{packageItem.price}</strong></div><button className="primary" onClick={() => { setModal("none"); setView("orders"); setSeconds(15 * 60); }}>Create order &amp; continue</button></div>
            <div className="demo-actions"><span>Prototype shortcuts:</span><button onClick={() => { setUserState("unlocked"); finishDownload(); }}>Simulate success</button><button onClick={() => { setModal("none"); setView("orders"); }}>Simulate failure / pending</button></div>
          </Dialog>
        )}

        {modal === "success" && (
          <Dialog onClose={() => setModal("none")} compact>
            <div className="success-mark">✓</div>
            <p className="modal-kicker centered">DOWNLOAD STARTED</p>
            <h2>Your model is ready</h2>
            <p className="modal-intro centered">Creator Pack is downloading now. This model has been saved permanently to My Assets.</p>
            <div className="download-file"><span>ZIP</span><div><strong>modern-wave-creator-pack.zip</strong><small>32.86 MB · MAX, FBX, OBJ</small></div><b>Downloading…</b></div>
            <button className="primary full" onClick={() => changeView("assets")}>Go to My Assets</button>
            <button className="secondary full" onClick={() => { setModal("none"); setView("product"); }}>Continue browsing</button>
          </Dialog>
        )}

        {modal === "download-blocked" && (
          <Dialog onClose={() => setModal("none")} compact>
            <div className="warning-mark">!</div>
            <p className="modal-kicker centered">BROWSER ACTION NEEDED</p>
            <h2>Download didn’t start</h2>
            <p className="modal-intro centered">Your purchase is complete and the model is safely stored in My Assets. Use the button below to download manually.</p>
            <button className="primary full" onClick={() => setModal("success")}>Download now</button>
            <button className="secondary full" onClick={() => changeView("assets")}>Go to My Assets</button>
          </Dialog>
        )}
      </div>}
    </main>
  );
}

function Dialog({ children, onClose, wide = false, compact = false, className = "" }: { children: React.ReactNode; onClose: () => void; wide?: boolean; compact?: boolean; className?: string }) {
  return <section role="dialog" aria-modal="true" className={`dialog ${wide ? "wide" : ""} ${compact ? "compact" : ""} ${className}`}>
    <button className="close-button" onClick={onClose} aria-label="Close">×</button>
    {children}
  </section>;
}

function PaymentOption({ id, selected, onSelect, title, subtitle, badge, note }: { id: string; selected: string; onSelect: (id: string) => void; title: string; subtitle: string; badge: string; note?: string }) {
  return <button className={`payment-option ${selected === id ? "selected" : ""}`} onClick={() => onSelect(id)}>
    <span className="radio-dot" />
    <span className="payment-copy"><strong>{title}</strong><small>{subtitle}</small>{note && <em>{note}</em>}</span>
    <span className={`payment-badge ${id}`}>{badge}</span>
  </button>;
}

function AccountNav({ active, onNavigate }: { active: "orders" | "assets"; onNavigate: (view: View) => void }) {
  return <aside className="account-nav">
    <p>My account</p>
    <button className={active === "assets" ? "active" : ""} onClick={() => onNavigate("assets")}><span>□</span> My Assets</button>
    <button><span>C</span> Credits &amp; benefits</button>
    <button className={active === "orders" ? "active" : ""} onClick={() => onNavigate("orders")}><span>▣</span> Orders</button>
    <button><span>♡</span> Collections</button>
    <button><span>○</span> Notifications</button>
  </aside>;
}
