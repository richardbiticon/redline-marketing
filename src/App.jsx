import { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { motion, useInView } from "framer-motion";

// ============================================================
// ALL VOLLEYBALL — FULL MULTI-PAGE WEBSITE
// ============================================================

// --- ROUTING ---
const PAGES = {
  home: "/",
  about: "/about",
  services: "/services",
  servicePPC: "/services/ppc",
  serviceWeb: "/services/web-design",
  serviceSMS: "/services/sms-email",
  serviceReputation: "/services/reputation",
  serviceSEO: "/services/seo",
  serviceSocial: "/services/social-media",
  results: "/results",
  blog: "/blog",
  blogPost: "/blog/post",
  contact: "/contact",
};

// Map service URL slugs to PAGES keys for ServiceDetailPage
const SERVICE_SLUG_MAP = {
  "ppc": PAGES.servicePPC,
  "web-design": PAGES.serviceWeb,
  "sms-email": PAGES.serviceSMS,
  "reputation": PAGES.serviceReputation,
  "seo": PAGES.serviceSEO,
  "social-media": PAGES.serviceSocial,
};

// --- ICONS (reusable SVGs) ---
const Icons = {
  check: (
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  ),
  mail: (
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  ),
  phone: (
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  ),
  pin: (
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  ),
  chart: (
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  ),
  layers: (
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  ),
  bar: (
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  ),
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  arrowRight: <polyline points="9 6 15 12 9 18" />,
  arrowLeft: <polyline points="15 18 9 12 15 6" />,
  target: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </>
  ),
  users: (
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  ),
  shield: (
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
  ),
  search: (
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  ),
  car: (
    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </>
  ),
};

const Icon = ({ name, size = 24, color = "currentColor", style = {} }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill={color} style={style} xmlns="http://www.w3.org/2000/svg">
    {Icons[name]}
  </svg>
);

// --- SCROLL ANIMATION HOOK ---
// --- FRAMER MOTION SCROLL REVEAL ---
const revealVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay },
  }),
};

const Reveal = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px 0px" });
  return (
    <motion.div
      ref={ref}
      variants={revealVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
      style={style}
    >
      {children}
    </motion.div>
  );
};

// Kept for CountUp's internal IntersectionObserver usage
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// Count-up animated number. Parses leading digits from `value` (e.g. "$12M+", "200+", "5 Days", "100%")
// and animates from 0 to target when scrolled into view, preserving prefix/suffix.
const CountUp = ({ value, duration = 1800, style }) => {
  const match = String(value).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  const prefix = match ? match[1] : "";
  const target = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : "";
  const isInt = Number.isInteger(target);
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !match) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !startedRef.current) {
        startedRef.current = true;
        const start = performance.now();
        const tick = (now) => {
          const p = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setDisplay(target * eased);
          if (p < 1) requestAnimationFrame(tick);
          else setDisplay(target);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration, match]);
  if (!match) return <span style={style}>{value}</span>;
  const shown = isInt ? Math.floor(display) : display.toFixed(1);
  return <span ref={ref} style={style}>{prefix}{shown}{suffix}</span>;
};

// --- LOGO COMPONENT (All Volleyball AV mark) ---
const Logo = ({ size = 42 }) => (
  <img src="/logo.svg" width={size} height={size} alt="Logo" />
);

// --- STYLES ---
const C = {
  red: "#D41920",
  redDark: "#A8131A",
  redLight: "#FF2D35",
  black: "#0A0A0A",
  blackSoft: "#1A1A1A",
  blackMed: "#2A2A2A",
  white: "#FFFFFF",
  bgDark: "#0a0a0a",
  bgDark2: "#111111",
  bgCard: "#111111",
  bgCardAlt: "#1a1a1a",
  g100: "#F5F5F5",
  g200: "#E8E8E8",
  g300: "#CCCCCC",
  g400: "#999999",
  g500: "#666666",
  gold: "#FFB800",
};

// ============================================================
// SHARED COMPONENTS
// ============================================================

// --- ANNOUNCEMENT BAR ---
const AnnouncementBar = () => (
  <div className="announcement-bar" style={{ background: C.black, color: C.white, padding: "10px 160px", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14, position: "relative" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, zIndex: 1 }}>
      <span>🔑</span>
      <span>The difference between a good automotive business and a fully booked one is usually just the system behind the marketing.</span>
    </div>
    <span className="announcement-hide-mobile" style={{ fontWeight: 700, color: C.red, cursor: "pointer", letterSpacing: 0.5, zIndex: 1, whiteSpace: "nowrap" }}>See How We Build It →</span>
  </div>
);

// --- NAVBAR ---
const Navbar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navItems = [
    { label: "About Us", page: PAGES.about },
    { label: "Our Services", page: PAGES.services },
    { label: "Results", page: PAGES.results },
    { label: "Blog", page: PAGES.blog },
  ];

  return (
    <nav className="navbar-main" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 160px", background: C.black, position: "sticky", top: 0, zIndex: 1000, borderBottom: `1px solid ${C.blackMed}`, boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.3)" : "none", transition: "box-shadow 0.3s" }}>
      <div onClick={() => navigate(PAGES.home)} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <Logo size={72} />
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, lineHeight: 1.1, letterSpacing: 1, textTransform: "uppercase" }}>Red Line Marketing</div>
      </div>
      <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 36 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.page || (item.page !== PAGES.home && pathname.startsWith(item.page));
          return (
            <span key={item.page} className="nav-item" onClick={() => navigate(item.page)} style={{ cursor: "pointer", color: isActive ? C.red : C.white, fontWeight: 500, fontSize: 15, paddingBottom: 4 }}>
              {item.label}
            </span>
          );
        })}
      </div>
      <div onClick={() => navigate(PAGES.contact)} className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="mail" size={20} color={C.white} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.white }}>Contact Us</span>
      </div>
      {/* Mobile hamburger */}
      <div className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} style={{ display: "none", flexDirection: "column", gap: 5, cursor: "pointer", zIndex: 1001, padding: 8 }}>
        <span style={{ width: 26, height: 3, background: mobileOpen ? C.red : C.white, borderRadius: 2, transition: "all 0.3s", transform: mobileOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
        <span style={{ width: 26, height: 3, background: C.bgCard, borderRadius: 2, transition: "all 0.3s", opacity: mobileOpen ? 0 : 1 }} />
        <span style={{ width: 26, height: 3, background: mobileOpen ? C.red : C.white, borderRadius: 2, transition: "all 0.3s", transform: mobileOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
      </div>
      {/* Mobile menu panel */}
      {mobileOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: C.bgCard, zIndex: 999, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.page || (item.page !== PAGES.home && pathname.startsWith(item.page));
            return (
              <span key={item.page} onClick={() => { navigate(item.page); setMobileOpen(false); }} style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: isActive ? C.red : C.black, cursor: "pointer", textTransform: "uppercase", letterSpacing: 2 }}>
                {item.label}
              </span>
            );
          })}
          <div onClick={() => { navigate(PAGES.contact); setMobileOpen(false); }} style={{ marginTop: 12 }}>
            <RedButton>Contact Us</RedButton>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- CTA BAR ---
const CTABar = () => {
  const navigate = useNavigate();
  return (
  <>
  <div className="checkered-divider" />
  <section className="cta-bar-main" style={{ position: "relative", background: `linear-gradient(135deg, ${C.black} 60%, ${C.redDark} 100%)`, padding: "50px 160px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 30, overflow: "hidden" }}>
    <div className="racing-track-bg" />
    <div>
      <div style={{ fontFamily: "'Oswald', sans-serif", color: C.redLight, fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Ready to See What Your Business Looks Like With the Right System?</div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: C.white }}>Free Strategy Call. 30 Minutes. A Clear Plan.</div>
    </div>
    <div onClick={() => navigate(PAGES.contact)} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
      <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="mail" size={22} color={C.white} />
      </div>
      <div style={{ color: C.white, fontFamily: "'Oswald', sans-serif" }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Book Your</div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Discovery Call</div>
      </div>
    </div>
    <div className="speed-lane" style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} />
  </section>
  </>
  );
};

// --- FOOTER ---
const Footer = () => {
  const navigate = useNavigate();
  return (
  <footer className="footer-main" style={{ position: "relative", background: C.black, padding: "60px 160px 30px" }}>
    <div className="speed-lane" style={{ position: "absolute", left: 0, right: 0, top: 0 }} />
    <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 2fr 1.2fr", gap: 60, paddingBottom: 40, borderBottom: `1px solid ${C.blackMed}` }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <Logo size={36} />
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: 1 }}>Red Line Marketing</div>
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: C.g400, marginBottom: 20 }}>AI-powered marketing systems built for automotive businesses in the Philippines</p>
        <div style={{ display: "flex", gap: 12 }}>
          {["F", "IG"].map((s) => (
            <div key={s} style={{ width: 40, height: 40, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{s}</div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 20 }}>Links</div>
        <div className="footer-links-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 40px" }}>
          {["About Us", "PPC for Dealers", "SMS & Email", "Dealer Web Design", "Reputation Mgmt", "Results", "Blog", "Contact"].map((l) => (
            <span key={l} style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 20 }}>Contact Us</div>
        {[
          { icon: "phone", text: "+1 (818) 305-5441" },
          { icon: "pin", text: "Philippines" },
          { icon: "mail", text: "Contact@redlinemarketing.ph" },
        ].map((c) => (
          <div key={c.icon} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
            <Icon name={c.icon} size={18} color={C.red} />
            <span style={{ fontSize: 14, color: C.g300, lineHeight: 1.5 }}>{c.text}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="footer-bottom" style={{ display: "flex", justifyContent: "space-between", paddingTop: 24, fontSize: 13, color: C.g400 }}>
      <span>© 2026 Red Line Marketing. All Rights Reserved.</span>
      <div style={{ display: "flex", gap: 20 }}>
        <span style={{ cursor: "pointer" }}>Privacy Policy</span>
        <span style={{ cursor: "pointer" }}>Terms of Service</span>
      </div>
    </div>
  </footer>
  );
};

// --- FORM CARD (with save to localStorage) ---
const FORM_STORAGE_KEY = "avb_form_data";

const FormCard = ({ title = "Book Your Discovery Call", inline = false }) => {
  const [form, setForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FORM_STORAGE_KEY)) || {}; } catch { return {}; }
  });
  const update = (field, value) => {
    const next = { ...form, [field]: value };
    setForm(next);
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(next));
  };

  const handleSubmit = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    setForm({});
  };

  const wrapper = inline ? {} : {
    background: "linear-gradient(180deg, #141414 0%, #0e0e0e 100%)",
    borderRadius: 14,
    padding: "36px 32px",
    border: `1px solid ${C.blackMed}`,
    boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div className="dash-form" style={wrapper}>
      {!inline && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.red}, transparent)` }} />}
      <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, fontWeight: 700, textAlign: "center", marginBottom: 8, color: C.white, letterSpacing: 1, textTransform: "uppercase" }}>{title}</h3>
      <div style={{ width: 48, height: 2, background: C.red, margin: "0 auto 24px" }} />
      <div className="form-row" style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input placeholder="First Name" value={form.firstName || ""} onChange={(e) => update("firstName", e.target.value)} style={inputStyle} />
        <input placeholder="Last Name" value={form.lastName || ""} onChange={(e) => update("lastName", e.target.value)} style={inputStyle} />
      </div>
      {[["Company Email", "email"], ["Phone Number", "phone"], ["Dealership Website URL", "website"]].map(([label, key]) => (
        <input key={key} placeholder={label} value={form[key] || ""} onChange={(e) => update(key, e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
      ))}
      <select value={form.service || ""} onChange={(e) => update("service", e.target.value)} style={{ ...inputStyle, marginBottom: 16, color: form.service ? C.white : C.g400 }}>
        <option value="" style={{ background: C.bgCard, color: C.g400 }}>Service/s Interested In</option>
        {["PPC for Dealerships","Automotive SEO","Social Media Management","Reputation Management","Website Design","SMS & Email Retention"].map((o) => (
          <option key={o} value={o} style={{ background: C.bgCard, color: C.white }}>{o}</option>
        ))}
      </select>
      <button onClick={handleSubmit} className="dash-submit" style={{ width: "100%", padding: 16, background: `linear-gradient(180deg, ${C.red} 0%, ${C.redDark} 100%)`, color: C.white, border: `1px solid ${C.redLight}`, borderRadius: 8, fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", boxShadow: "0 8px 24px rgba(212,25,32,0.35)", transition: "all 0.25s" }}>SCHEDULE TODAY</button>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  border: `1px solid ${C.blackMed}`,
  borderRadius: 8,
  fontFamily: "'Barlow', sans-serif",
  fontSize: 14,
  color: C.white,
  outline: "none",
  background: "#0a0a0a",
  transition: "border-color 0.25s, box-shadow 0.25s",
};

// --- SECTION TITLE ---
const SectionTitle = ({ pre, main, accent, sub, light = false }) => (
  <div className="section-title" style={{ textAlign: "center", marginBottom: 50 }}>
    {pre && <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>{pre}</div>}
    <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>{main} {accent && <span style={{ color: C.red }}>{accent}</span>}</h2>
    {sub && <p style={{ marginTop: 16, fontSize: 17, color: "rgba(255,255,255,0.7)", maxWidth: 640, margin: "16px auto 0", lineHeight: 1.7 }}>{sub}</p>}
  </div>
);

// --- HOVER CARD WRAPPER (lift on hover) ---
const HoverCard = ({ children, style = {}, onClick, className }) => (
  <motion.div
    className={className}
    onClick={onClick}
    whileHover={{ y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    style={{ ...style }}
  >
    {children}
  </motion.div>
);

// --- RED BUTTON ---
const RedButton = ({ children, onClick, large = false }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    style={{ padding: large ? "18px 40px" : "14px 28px", background: C.red, color: C.white, border: "none", borderRadius: 8, fontFamily: "'Oswald', sans-serif", fontSize: large ? 18 : 16, fontWeight: 600, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8 }}
  >
    {children}
  </motion.button>
);

const OutlineButton = ({ children, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    style={{ padding: "14px 28px", background: "transparent", color: C.red, border: `2px solid ${C.red}`, borderRadius: 8, fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, letterSpacing: 1.5, cursor: "pointer", textTransform: "uppercase" }}
  >
    {children}
  </motion.button>
);

// --- STAT CARD ---
const StatCard = ({ number, label }) => (
  <div style={{ textAlign: "center", padding: "24px 16px" }}>
    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 52, fontWeight: 700, color: C.red, lineHeight: 1 }}><CountUp value={number} /></div>
    <div style={{ fontSize: 15, color: C.g300, marginTop: 8, fontWeight: 500 }}>{label}</div>
  </div>
);

// ============================================================
// NICHE SHOWCASE — Auto-Rotating Automotive Sub-Industries
// ============================================================
const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}?w=1200&auto=format&fit=crop&q=80`;

const nicheData = [
  {
    tag: "FRANCHISE DEALERS",
    title: "New Car Dealerships",
    desc: "Franchise dealers need a steady pipeline of qualified buyers. We build campaigns around model launches, incentive programs, and conquest strategies that pull shoppers away from competing brands and into your showroom.",
    stat: "40%",
    statLabel: "More Qualified Leads",
    image: UNSPLASH("1562519819-016930ada31c"),
    gradient: `linear-gradient(135deg, #0A0A0A 0%, #A8131A 100%)`,
  },
  {
    tag: "PRE-OWNED",
    title: "Used Car Dealers",
    desc: "Pre-owned inventory moves fast when the right buyer sees it. We target in-market shoppers by make, model, price range, and location so your lot turns faster and your margins stay healthy.",
    stat: "3.2x",
    statLabel: "Faster Lot Turn Rate",
    image: UNSPLASH("1503376780353-7e6692767b70"),
    gradient: `linear-gradient(135deg, #1A1A1A 0%, #D41920 100%)`,
  },
  {
    tag: "COLLISION",
    title: "Auto Body & Collision Repair",
    desc: "Insurance work keeps the lights on, but direct-to-consumer repairs build your brand. We drive local visibility and trust so you become the first call after every fender bender.",
    stat: "85%",
    statLabel: "Local Search Dominance",
    image: UNSPLASH("1625047509248-ec889cbff17f"),
    gradient: `linear-gradient(135deg, #2A2A2A 0%, #A8131A 100%)`,
  },
  {
    tag: "PARTS & ACCESSORIES",
    title: "Auto Parts & Accessories",
    desc: "Whether you sell online or in-store, we put your parts catalog in front of DIY mechanics, enthusiasts, and fleet buyers actively searching for what you stock.",
    stat: "280%",
    statLabel: "E-Commerce Revenue Growth",
    image: UNSPLASH("1486262715619-67b85e0b08d3"),
    gradient: `linear-gradient(135deg, #0A0A0A 0%, #FF2D35 100%)`,
  },
  {
    tag: "FLEET SALES",
    title: "Fleet & Commercial Vehicles",
    desc: "Selling to businesses means longer sales cycles and bigger deals. We generate qualified fleet inquiries from logistics companies, contractors, and municipal buyers through targeted B2B campaigns.",
    stat: "$2.4M",
    statLabel: "Avg Fleet Deal Pipeline",
    image: UNSPLASH("1586768035292-84283b7ad163"),
    gradient: `linear-gradient(135deg, #1A1A1A 0%, #A8131A 100%)`,
  },
  {
    tag: "POWERSPORTS",
    title: "Motorcycle & Powersports",
    desc: "Riders are passionate and brand-loyal. We tap into enthusiast communities with content-driven campaigns that build your reputation and fill your showroom with serious buyers.",
    stat: "5x",
    statLabel: "Social Engagement Rate",
    image: UNSPLASH("1558981806-ec527fa84c39"),
    gradient: `linear-gradient(135deg, #2A2A2A 0%, #D41920 100%)`,
  },
  {
    tag: "DETAILING",
    title: "Auto Detailing & Car Wash",
    desc: "Recurring revenue is the name of the game. We build local dominance with review generation, Google Maps optimization, and membership-focused campaigns that keep customers coming back monthly.",
    stat: "62%",
    statLabel: "Membership Conversion Rate",
    image: UNSPLASH("1607860108855-64acf2078ed9"),
    gradient: `linear-gradient(135deg, #0A0A0A 0%, #A8131A 100%)`,
  },
  {
    tag: "SERVICE CENTERS",
    title: "Tire & Service Centers",
    desc: "Seasonal demand swings make smart marketing critical. We run hyper-local campaigns timed to weather patterns, mileage milestones, and seasonal tire changeovers to keep your bays full year-round.",
    stat: "94%",
    statLabel: "Bay Utilization Rate",
    image: UNSPLASH("1632823471565-1ecdf5c6da77"),
    gradient: `linear-gradient(135deg, #1A1A1A 0%, #FF2D35 100%)`,
  },
];

const NicheShowcase = ({ navigate }) => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [imgErrors, setImgErrors] = useState({});
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    setTransitioning(true);
    setTimeout(() => {
      setActive(index);
      setTransitioning(false);
    }, 300);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      goTo((prev) => prev);
    }, 4500);
    return () => clearInterval(timerRef.current);
  }, [paused, goTo]);

  // Manual auto-advance using active state
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % nicheData.length);
        setTransitioning(false);
      }, 300);
    }, 4500);
    return () => clearInterval(interval);
  }, [paused]);

  const handleSelect = (i) => {
    setPaused(true);
    goTo(i);
    setTimeout(() => {
      setActive(i);
      setTransitioning(false);
    }, 300);
    // Resume auto-rotation after 8 seconds of inactivity
    setTimeout(() => setPaused(false), 8000);
  };

  const niche = nicheData[active];
  const progress = ((active + 1) / nicheData.length) * 100;

  return (
    <section className="section-pad" style={{ background: C.black, padding: "80px 160px 60px", position: "relative", overflow: "hidden" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background accent */}
      <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: C.red, clipPath: "polygon(60% 0, 100% 0, 100% 100%, 20% 100%)", opacity: 0.06 }} />

      {/* Section header */}
      <Reveal>
        <div style={{ marginBottom: 50 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Industries We Serve</div>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.1 }}>Marketing Built For<br /><span style={{ color: C.red }}>Every Corner of Automotive</span></h2>
        </div>
      </Reveal>

      {/* Main content area */}
      <div className="niche-content" style={{ display: "flex", gap: 50, alignItems: "stretch", position: "relative", zIndex: 1, minHeight: 360 }}>
        {/* Left: Visual card */}
        <div className="niche-visual" style={{
          flex: "0 0 420px",
          borderRadius: 16,
          background: niche.gradient,
          position: "relative",
          overflow: "hidden",
          minHeight: 360,
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "scale(0.96)" : "scale(1)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          {niche.image && !imgErrors[active] && (
            <img
              src={niche.image}
              alt={niche.title}
              onError={() => setImgErrors((e) => ({ ...e, [active]: true }))}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(180,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: "8%", textAlign: "center", padding: "0 24px" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 800, color: "#ffffff", lineHeight: 1, textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>{niche.stat}</div>
            <div style={{ fontSize: "clamp(0.75rem, 1.2vw, 1rem)", fontWeight: 400, color: "rgba(255,255,255,0.85)", marginTop: 8, letterSpacing: 0.5 }}>{niche.statLabel}</div>
          </div>
        </div>

        {/* Right: Copy */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? "translateX(20px)" : "translateX(0)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>{niche.tag}</div>
          <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 38, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>{niche.title}</h3>
          <p style={{ fontSize: 17, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", maxWidth: 520, marginBottom: 30 }}>{niche.desc}</p>
          <div>
            <RedButton onClick={() => navigate(PAGES.contact)}>Get A Free Strategy Call</RedButton>
          </div>
        </div>
      </div>

      {/* Tab selector */}
      <div className="niche-tabs" style={{ display: "flex", gap: 6, marginTop: 40, position: "relative", zIndex: 1 }}>
        {nicheData.map((n, i) => (
          <div
            key={i}
            onClick={() => handleSelect(i)}
            style={{
              flex: 1,
              cursor: "pointer",
              padding: "16px 8px 14px",
              borderTop: `3px solid ${i === active ? C.red : "rgba(255,255,255,0.1)"}`,
              transition: "all 0.3s",
            }}
          >
            <div style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: i === active ? C.white : "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              transition: "color 0.3s",
              lineHeight: 1.3,
            }}>
              {n.title.split(" ").slice(0, 2).join(" ")}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "rgba(255,255,255,0.06)", marginTop: 4, borderRadius: 1, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          background: C.red,
          width: `${progress}%`,
          transition: "width 0.5s ease",
          borderRadius: 1,
        }} />
      </div>
    </section>
  );
};


// ============================================================
// PAGE: HOME
// ============================================================
const HomePage = () => {
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="carbon-fiber" data-hero="true" ref={heroRef} onMouseMove={handleMouseMove} style={{ position: "relative", overflow: "hidden" }}>
        {/* === DASHBOARD GLOW ORBS === */}
        {/* Primary engine glow — bottom-left, large, warm deep red */}
        <div style={{ position: "absolute", bottom: "-30%", left: "-8%", width: 900, height: 900, background: "radial-gradient(circle, rgba(180,18,22,0.30) 0%, rgba(120,10,14,0.10) 40%, transparent 68%)", filter: "blur(40px)", zIndex: 0 }} />
        {/* Instrument cluster glow — center-bottom, crimson wash */}
        <div style={{ position: "absolute", bottom: "-15%", left: "35%", width: 700, height: 700, background: "radial-gradient(circle, rgba(140,12,18,0.22) 0%, rgba(90,8,12,0.06) 45%, transparent 70%)", filter: "blur(50px)", zIndex: 0 }} />
        {/* Ambient console glow — top-right, subtle ruby */}
        <div style={{ position: "absolute", top: "-20%", right: "-5%", width: 650, height: 650, background: "radial-gradient(circle, rgba(160,14,20,0.16) 0%, rgba(100,8,12,0.04) 50%, transparent 72%)", filter: "blur(60px)", zIndex: 0 }} />
        {/* Gauge backlight — mid-left, tight warm accent */}
        <div style={{ position: "absolute", top: "30%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(200,22,28,0.12) 0%, rgba(140,12,16,0.03) 50%, transparent 70%)", filter: "blur(35px)", zIndex: 0 }} />
        {/* Distant cabin glow — top-center, very soft */}
        <div style={{ position: "absolute", top: "-10%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 500, background: "radial-gradient(ellipse, rgba(100,8,12,0.10) 0%, rgba(50,4,6,0.03) 50%, transparent 75%)", filter: "blur(70px)", zIndex: 0 }} />
        {/* Tachometer edge — right-center, small focused */}
        <div style={{ position: "absolute", top: "50%", right: "12%", width: 300, height: 300, background: "radial-gradient(circle, rgba(220,30,35,0.10) 0%, transparent 65%)", filter: "blur(30px)", zIndex: 0 }} />

        {/* Bottom accent line — dashboard trim */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "55%", height: 3, background: `linear-gradient(90deg, rgba(180,18,22,0.8) 0%, ${C.red} 30%, rgba(180,18,22,0.3) 70%, transparent 100%)`, zIndex: 3 }} />
        
        {/* Grain */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0.035, zIndex: 2, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "128px 128px" }} />
        
        {/* Cursor ripple glow */}
        <div style={{ position: "absolute", left: mousePos.x - 300, top: mousePos.y - 300, width: 600, height: 600, background: "radial-gradient(circle, rgba(212,25,32,0.12) 0%, rgba(212,25,32,0.04) 35%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", zIndex: 2, transition: "left 0.15s ease-out, top 0.15s ease-out", willChange: "left, top" }} />

        {/* Inner container */}
        <div style={{ maxWidth: 1320, margin: "0 auto", padding: "90px 160px 100px", display: "flex", alignItems: "center", gap: 60, minHeight: 600, position: "relative", zIndex: 4 }}>
          {/* Left content */}
          <Reveal style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 80, fontWeight: 700, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "-1px" }}>
              <span style={{ color: C.white, display: "block" }}>Automotive</span>
              <span style={{ color: C.white, display: "block" }}>Marketing</span>
              <span style={{ color: C.red, display: "block", marginTop: 6 }}>That Moves.</span>
            </h2>
            <p style={{ marginTop: 28, fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.5)", maxWidth: 440 }}>Your business is solid. We make sure your marketing matches. AI-powered systems built for automotive in the Philippines.</p>
            <div className="trust-badges" style={{ marginTop: 28, display: "flex", gap: 24, alignItems: "center" }}>
              {["AI-Powered", "Full Ownership", "No Lock-ins"].map((tag) => (
                <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 5, height: 5, background: C.red, transform: "rotate(45deg)" }} />
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>{tag}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Right form */}
          <Reveal delay={0.2} style={{ flex: "0 0 440px", maxWidth: 440 }}>
            <div style={{ borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>
              <div style={{ height: 4, background: C.red }} />
              <div style={{ background: C.bgCard, padding: "32px 32px 36px" }}>
                <FormCard inline />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ WHAT MAKES AUTOMOTIVE MARKETING DIFFERENT ============ */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.bgCard }}>
        <Reveal>
          <div className="section-title" style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>What Makes This Work</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>Automotive Buyers Think <span style={{ color: C.red }}>Differently. Your Marketing Should Too.</span></h2>
            <p style={{ marginTop: 16, fontSize: 17, color: C.g300, maxWidth: 620, margin: "16px auto 0", lineHeight: 1.7 }}>Selling a car or a service appointment is nothing like selling clothes or food. The decision is bigger, the research goes deeper, and trust matters more than anything. When you understand these dynamics, your marketing becomes a magnet instead of a megaphone.</p>
          </div>
        </Reveal>

        {/* Insight cards */}
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            {
              icon: "M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z",
              title: "We Map the Full Buyer Journey and Build Your Presence at Every Step",
              desc: "Customers check Google, read reviews, browse social media, and compare options before they ever call. Most businesses only show up at one or two of those touchpoints. We make sure you're visible at all of them — so by the time they're ready to buy, you already feel familiar.",
            },
            {
              icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
              title: "We Turn Attention Into Appointments With a System That Converts 24/7",
              desc: "Traffic alone doesn't pay the bills. We build the full conversion system: dedicated landing pages, instant lead response, and automated follow-up sequences. You wake up to booked appointments instead of unread messages.",
            },
            {
              icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z",
              title: "We Build the Kind of Trust Online That You've Already Built In Person",
              desc: "People who know you trust you. The challenge is making strangers feel that same confidence online. We build that bridge with review systems, social proof, and a polished brand presence that matches what you actually deliver.",
            },
          ].map((insight, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ padding: 36, background: C.bgDark, borderRadius: 14, borderTop: `4px solid ${C.red}`, height: "100%" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                  <svg viewBox="0 0 24 24" width={20} height={20} fill={C.red} xmlns="http://www.w3.org/2000/svg"><path d={insight.icon} /></svg>
                </div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 10, lineHeight: 1.25 }}>{insight.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: C.g300 }}>{insight.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Small relatable note */}
        <Reveal delay={0.2}>
          <div style={{ marginTop: 40, padding: "28px 36px", background: C.black, borderRadius: 12, display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name="users" size={22} color={C.white} />
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(255,255,255,0.7)" }}>A lot of business owners have their assistant or a general VA handling marketing on the side. That's a smart way to start. But marketing that actually drives consistent revenue needs its own dedicated system, its own tools, and people who do this every single day. Think of it the same way you'd think about accounting or legal. You can do the basics yourself, but when money is on the line, you want a specialist. That's what we are for your marketing.</p>
          </div>
        </Reveal>
      </section>

      {/* NICHE SHOWCASE */}
      <NicheShowcase navigate={navigate} />

      {/* ============ THE SYSTEM WE BUILD FOR YOU ============ */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.black, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "35%", height: "100%", background: C.red, clipPath: "polygon(50% 0, 100% 0, 100% 100%, 10% 100%)", opacity: 0.06 }} />

        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>The System</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>A Marketing Engine That <span style={{ color: C.red }}>Runs While You Focus on Your Business</span></h2>
            <p style={{ marginTop: 16, fontSize: 17, color: "rgba(255,255,255,0.55)", maxWidth: 600, margin: "16px auto 0", lineHeight: 1.7 }}>Picture this: your ads are reaching the right people, every lead gets a reply in seconds, your dashboard shows you exactly what's working, and your customers keep coming back. That's not a dream. It's a system. And every piece connects to the next.</p>
          </div>
        </Reveal>

        {/* AI System Block */}
        <Reveal>
          <div className="flex-section" style={{ display: "flex", alignItems: "stretch", gap: 50, marginBottom: 60 }}>
            <div style={{ flex: "0 0 400px", borderRadius: 16, background: `linear-gradient(135deg, ${C.redDark} 0%, ${C.red} 100%)`, padding: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, border: "2px solid rgba(255,255,255,0.1)", borderRadius: "50%" }} />
              <div style={{ position: "absolute", bottom: -30, left: -30, width: 140, height: 140, border: "2px solid rgba(255,255,255,0.06)", borderRadius: "50%" }} />
              <svg viewBox="0 0 24 24" width={80} height={80} fill="rgba(255,255,255,0.15)" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.5-9.11 0-12.58 3.51-3.47 9.14-3.49 12.65-.06L21 3v7.12z" />
              </svg>
              <div style={{ marginTop: 24, fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>AI-Powered Engine</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>Acquisition + Conversion</div>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>You Wake Up to Booked Appointments. Not Unread Messages.</h3>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Here's what your mornings look like when the system is running: you check your phone and see 4 new leads came in overnight. Two of them already have appointments booked. One asked a question and got an instant reply that moved them forward. Your dashboard shows your cost per lead dropped 12% this week because the AI shifted budget toward the ad set that's performing best.</p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>That's not a best-case scenario. That's what happens when your Google Ads run on hourly bid optimization, your landing pages are built to convert, and every inquiry triggers an automated qualification and booking flow. The system does the heavy lifting. You focus on delivering great service to the customers who walk in.</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["Hourly bid optimization", "60-second lead response", "Live performance dashboard", "Full conversion tracking"].map((tag) => (
                  <span key={tag} style={{ background: "rgba(212,25,32,0.15)", color: C.redLight, padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* Background + Ownership Block */}
        <Reveal delay={0.15}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 50, flexDirection: "row-reverse" }}>
            <div style={{ flex: "0 0 400px", borderRadius: 16, background: `linear-gradient(135deg, ${C.black} 0%, ${C.blackMed} 100%)`, padding: 50, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ position: "absolute", top: -20, left: -20, width: 100, height: 100, border: "2px solid rgba(212,25,32,0.15)", borderRadius: "50%" }} />
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 44, fontWeight: 700, color: C.red }}>US</div>
                <svg viewBox="0 0 24 24" width={32} height={32} fill="rgba(255,255,255,0.3)" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 44, fontWeight: 700, color: C.white }}>PH</div>
              </div>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.5)", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Proven Systems. Brought Home.</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>Our Background + Your Ownership</div>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>The Same Systems That Scale US Companies. Now Built for Your Business Here.</h3>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 20 }}>Our team comes from managing full-scale campaigns for US automotive and service businesses. We built landing pages that converted at 8%. We set up CRMs that tracked every touchpoint from first click to closed deal. We reported to owners whose only question was: how many more customers did we get this month? That experience shapes everything we build. When we set up your campaign structure, your tracking, your follow-up sequences, it's not guesswork. It's a system we've already tested at scale.</p>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>We adapted all of it for how Filipino buyers actually behave. The platforms they use, the way they compare, the questions they ask, the trust signals that matter here. And everything we build belongs to you. Your Google Ads account, your Meta Business Manager, your analytics, your automations. All under your name. We're managers on your account, not owners. If you ever want to take over or move on, one click and it's fully yours.</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {["US campaign experience", "PH market adapted", "Full client ownership", "Zero lock-in contracts"].map((tag) => (
                  <span key={tag} style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", padding: "8px 18px", borderRadius: 8, fontSize: 14, fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ============ WHAT'S INCLUDED ============ */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.bgDark }}>
        <Reveal>
          <div className="section-title" style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Monthly Deliverables</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>Everything That's Included <span style={{ color: C.red }}>When You Work With Us</span></h2>
          </div>
        </Reveal>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            { icon: "chart", title: "AI-Optimized Ad Campaigns", desc: "Google Search, Display, and Meta ads running on automated bid strategies that shift budget hourly toward the keywords and audiences driving real inquiries. Every ad links to a conversion-optimized landing page with tracking on every action." },
            { icon: "layers", title: "Real-Time Performance Dashboard", desc: "Cost per lead, return on ad spend, lead volume by source, conversion rates, and budget pacing. All live. Updated the moment something changes. Open it on your phone at midnight if you want." },
            { icon: "shield", title: "Full Account Ownership", desc: "Google Ads, Meta Business Manager, Google Analytics, your domain, your tracking pixel, your CRM. All under your business email. We're added as managers. You can remove us with one click, anytime." },
            { icon: "bar", title: "Monthly Strategy Review", desc: "A 30-minute call where we walk through what campaigns ran, which hit target, which we paused, what we're testing next, and how your cost per customer is trending month over month." },
            { icon: "search", title: "Google Maps + Local Search Optimization", desc: "We optimize your Google Business Profile with the right categories, service areas, photos, review strategy, and weekly posts so you show up in the local 3-pack for high-intent searches like \"auto repair near me.\"" },
            { icon: "mail", title: "Automated Lead Capture + Follow-Up", desc: "Every lead from Facebook, your website, or your ads gets an instant automated reply that qualifies them and collects their info. If they go quiet, the system follows up 3 times over 7 days. All on autopilot." },
          ].map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <HoverCard style={{ padding: 32, borderRadius: 14, background: C.bgCard, height: "100%", position: "relative", overflow: "hidden", border: `1px solid ${C.blackMed}` }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: C.red, borderRadius: "4px 0 0 4px" }} />
                <div style={{ width: 48, height: 48, borderRadius: 10, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon name={item.icon} size={22} color={C.red} />
                </div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 10 }}>{item.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: C.g300 }}>{item.desc}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TRACK RECORD ============ */}
      <section className="section-pad" style={{ padding: "80px 160px" }}>
        <Reveal>
          <div className="section-title" style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Past Campaign Results</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>What Our Systems <span style={{ color: C.red }}>Have Delivered</span></h2>
            <p style={{ marginTop: 16, fontSize: 15, color: C.g400, maxWidth: 520, margin: "16px auto 0", lineHeight: 1.6 }}>Client names protected under NDA. Full campaign details and strategy breakdowns available during your strategy call.</p>
          </div>
        </Reveal>
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
          {[
            { type: "Multi-Location Auto Group", bg: C.red, situation: "Six locations running disconnected campaigns. Rising cost per lead. No unified tracking across branches.", action: "Consolidated ad accounts under one AI-optimized system with live inventory feeds. Rebuilt all six websites with unified brand architecture and centralized lead routing.", results: ["218% more monthly leads", "42% lower cost per lead", "7-figure revenue increase in year one"] },
            { type: "Independent Pre-Owned Dealer", bg: C.black, situation: "Online reputation at 3.2 stars. High-quality customers choosing competitors based on reviews alone.", action: "Deployed automated post-transaction review requests via SMS. Built a response management system for every review. Added dynamic review widgets across the website.", results: ["3.2 to 4.7 stars in 5 months", "340% increase in review volume", "28% more walk-in traffic"] },
            { type: "Used Vehicle Dealership", bg: C.blackSoft, situation: "100% dependent on paid ads with thinning margins. Zero organic search visibility.", action: "Built 200+ model-specific SEO landing pages. Optimized Google Business Profile. Launched ongoing content strategy targeting high-intent local keywords.", results: ["Page 1 for 85+ target keywords", "45% of leads from organic search", "Saved $380K/year in ad spend"] },
            { type: "Franchise Service Center", bg: C.redDark, situation: "Single-digit repeat customer rate. Most first-time buyers never returned for service or upgrades.", action: "Built automated retention system: service interval reminders, equity-based upgrade offers, post-purchase nurture sequences, and reactivation campaigns for dormant customers.", results: ["38% service retention improvement", "Repeat buyers: 8% to 22%", "$1.8M incremental revenue"] },
          ].map((cs, i) => (
            <Reveal key={cs.type} delay={i * 0.1}>
              <HoverCard style={{ borderRadius: 16, overflow: "hidden", background: C.bgCard, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                <div style={{ background: cs.bg, padding: "24px 32px" }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2 }}>Confidential Client</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, marginTop: 4 }}>{cs.type}</div>
                </div>
                <div style={{ padding: 32 }}>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Situation</div>
                    <p style={{ fontSize: 14, color: C.g300, lineHeight: 1.6 }}>{cs.situation}</p>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>What We Built</div>
                    <p style={{ fontSize: 14, color: C.g300, lineHeight: 1.6 }}>{cs.action}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Results</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {cs.results.map((r) => (
                        <span key={r} style={{ background: "rgba(212,25,32,0.08)", color: C.red, padding: "6px 14px", borderRadius: 6, fontSize: 13, fontWeight: 600 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ TRUST STATS ============ */}
      <section className="section-pad" style={{ padding: "60px 160px", background: C.black }}>
        <div className="grid-4 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { num: "$12M+", label: "Ad Spend Managed" },
            { num: "200+", label: "Campaigns Launched" },
            { num: "5 Days", label: "Average Time to Launch" },
            { num: "100%", label: "Client Ownership" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 52, fontWeight: 700, color: C.red, lineHeight: 1 }}><CountUp value={s.num} /></div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.bgCard, textAlign: "center" }}>
        <Reveal>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Let's Build Something</div>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 16 }}>Your Business Deserves Marketing<br /><span style={{ color: C.red }}>That Matches How Good You Actually Are.</span></h2>
          <p style={{ fontSize: 17, color: C.g300, maxWidth: 600, margin: "0 auto 30px", lineHeight: 1.7 }}>Book a free strategy call and we'll walk through your business together. We'll look at your Google presence, your social platforms, and your current setup. Then we'll show you exactly what a fully built system looks like for your specific business. 30 minutes. No cost. You leave with a clear picture of what's possible.</p>
          <RedButton large onClick={() => navigate(PAGES.contact)}>Book Your Free Strategy Call</RedButton>
        </Reveal>
      </section>
    </>
  );
};

// ============================================================
// PAGE: ABOUT
// ============================================================
const AboutPage = () => {
  const navigate = useNavigate();
  return (
  <>
    <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "40%", height: "100%", background: C.red, clipPath: "polygon(30% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.15 }} />
      <Reveal>
        <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>About All Volleyball</div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>We Built This Because <span style={{ color: C.redLight }}>We've Been on Your Side of the Table</span></h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", maxWidth: 600 }}>Our team spent years running marketing for companies in the US. We saw firsthand what works and what's just expensive noise. We brought those systems home to the Philippines and built them specifically for automotive businesses like yours.</p>
        </div>
      </Reveal>
    </section>

    {/* STORY */}
    <section className="section-pad" style={{ padding: "80px 160px" }}>
      <div className="flex-section" style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <Reveal style={{ flex: 1 }}>
          <div style={{ aspectRatio: "4/3", maxWidth: 520, borderRadius: 14, background: `linear-gradient(135deg, ${C.black} 0%, ${C.redDark} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, border: "2px solid rgba(255,255,255,0.06)", borderRadius: "50%" }} />
            <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 56, fontWeight: 700, color: C.red }}>US</div>
              <svg viewBox="0 0 24 24" width={36} height={36} fill="rgba(255,255,255,0.3)" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 56, fontWeight: 700, color: C.white }}>PH</div>
            </div>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 2 }}>Proven Systems. Brought Home.</div>
          </div>
        </Reveal>
        <Reveal delay={0.15} style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Our Story</div>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 42, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>We Took What Works <span style={{ color: C.red }}>and Rebuilt It for Here</span></h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300, marginBottom: 20 }}>We managed real ad budgets for US companies. Not trial projects or small experiments. Real campaigns where the numbers had to work or the client walked. That kind of pressure teaches you what actually drives results and what's just busywork.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300, marginBottom: 20 }}>We took those exact strategies, systems, and AI workflows and built a service for automotive businesses here in the Philippines. Same level of thinking. Same performance standards. But structured for how things actually work locally.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300 }}>And we do something most marketing providers refuse to do: we give you full ownership. Every system we build is yours. Every account is in your name. You can see everything we do. If you ever decide to move on, you keep all of it.</p>
        </Reveal>
      </div>
    </section>

    {/* VALUES */}
    <section className="section-pad" style={{ padding: "80px 160px", background: C.bgDark }}>
      <Reveal><SectionTitle pre="How We Think" main="The Principles" accent="Behind Everything We Do" /></Reveal>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, marginTop: 20 }}>
        {[
          { icon: "shield", title: "You Own Everything", desc: "Your ad accounts. Your data. Your automations. Your website. All in your name. If you leave, you take everything with you. We don't hold anything hostage." },
          { icon: "target", title: "Results Over Activity", desc: "We don't count meetings held or reports sent. We count leads generated, customers gained, and money earned. If the numbers don't move, we change the approach." },
          { icon: "car", title: "Automotive Only", desc: "We don't spread thin across different industries. Automotive is our entire focus. Every system, every template, every workflow is built for how your customers actually buy." },
        ].map((v, i) => (
          <Reveal key={v.title} delay={i * 0.12}>
            <HoverCard style={{ padding: 36, background: C.bgCard, borderRadius: 14, border: `1px solid ${C.blackMed}`, height: "100%" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(212,25,32,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <Icon name={v.icon} size={26} color={C.red} />
              </div>
              <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 12 }}>{v.title}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: C.g300 }}>{v.desc}</p>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </section>

    {/* STATS */}
    <section className="section-pad" style={{ padding: "60px 160px", background: C.black }}>
      <div className="grid-4 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
        {[
          { num: "$12M+", label: "US Ad Spend Managed" },
          { num: "200+", label: "Campaigns Launched" },
          { num: "0", label: "Lock-In Contracts" },
          { num: "100%", label: "Client Data Ownership" },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 52, fontWeight: 700, color: C.red, lineHeight: 1 }}><CountUp value={s.num} /></div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>

    {/* AI APPROACH */}
    <section className="section-pad" style={{ padding: "80px 160px" }}>
      <div className="flex-section" style={{ display: "flex", alignItems: "center", gap: 60 }}>
        <Reveal style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>How We Work</div>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 42, fontWeight: 700, color: C.white, lineHeight: 1.15, marginBottom: 20 }}>AI Systems <span style={{ color: C.red }}>You Can Actually Understand</span></h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300, marginBottom: 20 }}>A lot of people throw around the word "AI" to sound impressive. Most of the time it just means they copy-paste your request into some tool and charge extra for it. That's not us.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300, marginBottom: 20 }}>We build real AI-powered workflows that handle your campaign optimization, lead scoring, creative testing, and performance tracking. These systems run around the clock and get better over time.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.g300, marginBottom: 30 }}>The important part: you can see everything. Every automation, every trigger, every decision. Nothing is hidden. And if you ever want to run things yourself, it's all set up in a way you can take over.</p>
          <RedButton onClick={() => navigate(PAGES.contact)}>See It In Action</RedButton>
        </Reveal>
        <Reveal delay={0.15} style={{ flex: 1 }}>
          <div style={{ aspectRatio: "1/1", maxWidth: 480, borderRadius: 14, background: `linear-gradient(135deg, ${C.redDark} 0%, ${C.red} 100%)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, border: "2px solid rgba(255,255,255,0.08)", borderRadius: "50%" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, border: "2px solid rgba(255,255,255,0.05)", borderRadius: "50%" }} />
            <svg viewBox="0 0 24 24" width={100} height={100} fill="rgba(255,255,255,0.12)" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1-2.73 2.71-2.73 7.08 0 9.79s7.15 2.71 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.5-9.11 0-12.58 3.51-3.47 9.14-3.49 12.65-.06L21 3v7.12z" />
            </svg>
            <div style={{ marginTop: 24, fontFamily: "'Oswald', sans-serif", fontSize: 18, fontWeight: 700, color: C.white, textAlign: "center", textTransform: "uppercase", letterSpacing: 1 }}>Transparent AI Systems</div>
            <div style={{ marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>Built for you. Owned by you.</div>
          </div>
        </Reveal>
      </div>
    </section>
  </>
  );
};
// ============================================================
// PAGE: SERVICES
// ============================================================
const ServicesPage = () => {
  const navigate = useNavigate();
  const services = [
    { title: "PPC Advertising", desc: "Precision-targeted Google Ads and Facebook campaigns that drive high-intent car shoppers directly to your VDPs and lead forms.", icon: "chart", page: PAGES.servicePPC },
    { title: "Dealer Website Design", desc: "Conversion-optimized, mobile-first websites with VDP integration, trade-in tools, financing calculators, and real-time inventory feeds.", icon: "layers", page: PAGES.serviceWeb },
    { title: "SMS & Email Retention", desc: "Automated lifecycle campaigns for service reminders, lease renewals, trade-up opportunities, and post-purchase follow-up.", icon: "mail", page: PAGES.serviceSMS },
    { title: "Reputation Management", desc: "Review generation, monitoring, and response across Google, DealerRater, Yelp, and Facebook to build trust and win local search.", icon: "shield", page: PAGES.serviceReputation },
    { title: "Automotive SEO", desc: "Dominate organic search for 'dealers near me' and model-specific keywords with localized content, technical optimization, and authority building.", icon: "search", page: PAGES.serviceSEO },
    { title: "Social Media Marketing", desc: "Inventory showcases, video walkarounds, community engagement, and paid social campaigns that keep your lot top-of-mind.", icon: "users", page: PAGES.serviceSocial },
  ];

  return (
    <>
      <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "45%", height: "70%", background: C.red, clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.12 }} />
        <Reveal>
          <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Our Services</div>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>Full-Throttle <span style={{ color: C.redLight }}>Digital Marketing</span></h1>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", maxWidth: 550 }}>Every service we offer is purpose-built for the automotive industry. No generic playbooks — only dealer-proven strategies that move metal.</p>
          </div>
        </Reveal>
      </section>

      <section className="section-pad" style={{ padding: "80px 160px" }}>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <HoverCard onClick={() => navigate(s.page)} style={{ padding: 36, background: C.bgCard, borderRadius: 14, border: `1px solid ${C.blackMed}`, cursor: "pointer", height: "100%", position: "relative", overflow: "hidden" }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, background: C.black, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Icon name={s.icon} size={24} color={C.red} />
                </div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 26, fontWeight: 700, color: C.white, marginBottom: 14 }}>{s.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.7, color: C.g300, marginBottom: 20 }}>{s.desc}</p>
                <span style={{ color: C.red, fontWeight: 600, fontSize: 15 }}>Learn More →</span>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.bgDark }}>
        <Reveal><SectionTitle pre="How We Work" main="Our Proven" accent="4-Step Process" /></Reveal>
        <div className="grid-4 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginTop: 20 }}>
          {[
            { step: "01", title: "Discovery & Audit", desc: "We deep-dive into your dealership: market, competitors, current digital presence, CRM data, and growth targets." },
            { step: "02", title: "Custom Strategy", desc: "We build a tailored marketing plan with channel mix, budget allocation, creative direction, and KPI benchmarks." },
            { step: "03", title: "Launch & Optimize", desc: "Campaigns go live with continuous A/B testing, bid optimization, and creative iteration based on real-time data." },
            { step: "04", title: "Report & Scale", desc: "Monthly reporting with transparent ROI tracking. We double down on what's working and scale your results." },
          ].map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <HoverCard style={{ padding: 32, background: C.bgCard, borderRadius: 14, borderTop: `4px solid ${C.red}`, height: "100%" }}>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.red, opacity: 0.2, lineHeight: 1 }}>{s.step}</div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, marginTop: 12, marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.g300 }}>{s.desc}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

// ============================================================
// PAGE: SERVICE DETAIL (template)
// ============================================================
const serviceData = {
  [PAGES.servicePPC]: {
    title: "PPC Advertising",
    subtitle: "For Automotive Dealers",
    hero: "Every click is a potential car buyer. Our PPC campaigns are engineered to capture high-intent shoppers at the exact moment they're searching for their next vehicle.",
    features: [
      { title: "Google Search Ads", desc: "Model-specific, geo-targeted campaigns that put your inventory in front of buyers actively searching for vehicles in your area." },
      { title: "Facebook & Instagram Ads", desc: "Dynamic inventory ads that showcase your real-time stock to in-market audiences with hyper-precise targeting." },
      { title: "YouTube Pre-Roll", desc: "Video walkaround ads served to local car shoppers on YouTube, building brand awareness and driving lot traffic." },
      { title: "Retargeting Campaigns", desc: "Re-engage website visitors who viewed VDPs but didn't convert, bringing them back with compelling offers." },
      { title: "Performance Max Campaigns", desc: "AI-optimized Google campaigns that automatically allocate budget across Search, Display, YouTube, and Maps." },
      { title: "Conquest Campaigns", desc: "Target competitors' customers and shoppers researching rival brands with compelling switch-and-save messaging." },
    ],
    stats: [{ n: "3.2x", l: "Average ROAS" }, { n: "47%", l: "Lower CPL vs Industry" }, { n: "850+", l: "Monthly Leads per Dealer" }],
  },
  [PAGES.serviceWeb]: {
    title: "Dealer Website Design",
    subtitle: "Built To Sell Cars",
    hero: "Your website is your 24/7 showroom. We build conversion-optimized dealer websites that showcase inventory beautifully and turn browsers into buyers.",
    features: [
      { title: "Real-Time Inventory Integration", desc: "Automatic sync with your DMS so every vehicle on your lot is instantly listed with photos, pricing, and specs." },
      { title: "Mobile-First Responsive Design", desc: "Over 70% of car shoppers browse on mobile. Every site we build is designed mobile-first with lightning-fast load times." },
      { title: "Trade-In & Finance Tools", desc: "Integrated KBB trade-in valuation and payment calculators that keep shoppers engaged and generate pre-qualified leads." },
      { title: "VDP Optimization", desc: "Vehicle Detail Pages engineered for conversion with smart CTAs, photo galleries, comparison tools, and urgency triggers." },
      { title: "SEO-Ready Architecture", desc: "Clean code, structured data, optimized page speeds, and location-specific landing pages that rank in organic search." },
      { title: "Chat & Lead Capture", desc: "Integrated live chat, chatbot, and multi-step lead forms that capture buyer intent at every touchpoint." },
    ],
    stats: [{ n: "2.8s", l: "Average Load Time" }, { n: "340%", l: "More VDP Views" }, { n: "62%", l: "Higher Conversion Rate" }],
  },
  [PAGES.serviceSMS]: {
    title: "SMS & Email Retention",
    subtitle: "Keep Them Coming Back",
    hero: "The sale doesn't end when the car leaves the lot. Our retention marketing turns one-time buyers into lifetime customers — driving service revenue, repeat purchases, and referrals.",
    features: [
      { title: "Service Reminders", desc: "Automated service interval reminders via SMS and email that keep your bays full and your customers loyal." },
      { title: "Lease Maturity Campaigns", desc: "Target customers approaching lease-end with personalized upgrade offers and new inventory recommendations." },
      { title: "Equity Mining", desc: "Identify customers with positive equity and serve them compelling trade-up offers before they start shopping elsewhere." },
      { title: "Post-Purchase Nurture", desc: "Automated drip sequences that build loyalty from day one with thank-yous, tips, and exclusive service offers." },
      { title: "Referral Programs", desc: "Systematic referral campaigns that incentivize your happiest customers to bring in friends and family." },
      { title: "Win-Back Campaigns", desc: "Re-engage lost service customers and dormant buyers with compelling offers that bring them back to your dealership." },
    ],
    stats: [{ n: "38%", l: "Service Retention Lift" }, { n: "22%", l: "Repeat Purchase Rate" }, { n: "$420", l: "Avg Revenue per Contact" }],
  },
  [PAGES.serviceReputation]: {
    title: "Reputation Management",
    subtitle: "Reviews Sell Cars",
    hero: "88% of car buyers read online reviews before visiting a dealership. We help you generate, manage, and leverage reviews to build trust and close more deals.",
    features: [
      { title: "Review Generation", desc: "Automated post-sale and post-service review requests via SMS and email that consistently grow your review volume." },
      { title: "Multi-Platform Monitoring", desc: "Real-time monitoring across Google, DealerRater, Yelp, Facebook, and Cars.com with instant alert notifications." },
      { title: "Professional Response Management", desc: "Expert-crafted responses to both positive and negative reviews that protect your brand and show customers you care." },
      { title: "Sentiment Analysis", desc: "AI-powered analysis of review trends to identify operational issues and opportunities before they become problems." },
      { title: "Review Widget & Social Proof", desc: "Showcase your best reviews on your website and social channels with beautiful, conversion-boosting widgets." },
      { title: "Competitive Benchmarking", desc: "Track how your ratings and review volume compare to competing dealers in your market in real time." },
    ],
    stats: [{ n: "4.7★", l: "Average Client Rating" }, { n: "312%", l: "More Reviews in 6 Months" }, { n: "89%", l: "Positive Sentiment Rate" }],
  },
  [PAGES.serviceSEO]: {
    title: "Automotive SEO",
    subtitle: "Dominate Local Search",
    hero: "When car shoppers search 'dealers near me' or specific makes and models, your dealership needs to own page one. Our automotive SEO strategies make that happen.",
    features: [
      { title: "Local SEO & Google Business", desc: "Optimize your GBP, build local citations, and dominate the maps pack for high-value automotive searches in your market." },
      { title: "Model-Specific Content", desc: "Targeted landing pages for every make, model, and trim you sell — capturing long-tail search traffic that converts." },
      { title: "Technical SEO Optimization", desc: "Site speed, crawlability, structured data, and Core Web Vitals optimization to ensure Google loves your site." },
      { title: "Content Marketing", desc: "Blog posts, buying guides, comparison articles, and video content that build authority and attract organic traffic." },
      { title: "Link Building", desc: "Strategic partnerships, local sponsorships, and industry directory placements that build domain authority." },
      { title: "Monthly SEO Reporting", desc: "Transparent ranking reports, traffic analytics, and ROI tracking so you always know exactly where you stand." },
    ],
    stats: [{ n: "Page 1", l: "Rankings in 90 Days" }, { n: "280%", l: "Organic Traffic Growth" }, { n: "45%", l: "of Leads from SEO" }],
  },
  [PAGES.serviceSocial]: {
    title: "Social Media Marketing",
    subtitle: "Stay Top-Of-Mind",
    hero: "Car buyers spend hours scrolling social media. Our social strategy keeps your dealership in their feed — with inventory showcases, video content, and community engagement.",
    features: [
      { title: "Inventory Showcases", desc: "Eye-catching posts featuring your hottest vehicles with professional photos, pricing, and direct links to VDPs." },
      { title: "Video Walkarounds", desc: "Short-form video content showcasing new arrivals, feature highlights, and behind-the-scenes dealership culture." },
      { title: "Community Management", desc: "Active engagement with comments, messages, and local community conversations that build brand affinity." },
      { title: "Paid Social Campaigns", desc: "Targeted Facebook and Instagram advertising with dynamic inventory ads that reach in-market shoppers." },
      { title: "Event Promotion", desc: "Sales events, community gatherings, and seasonal promotions amplified across all social channels." },
      { title: "Analytics & Optimization", desc: "Detailed performance reporting with continuous content optimization based on engagement and conversion data." },
    ],
    stats: [{ n: "5x", l: "Engagement vs Industry" }, { n: "124K", l: "Avg Monthly Reach" }, { n: "35%", l: "Social-Attributed Leads" }],
  },
};

const ServiceDetailPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const page = SERVICE_SLUG_MAP[slug];
  const data = page ? serviceData[page] : null;
  if (!data) return null;
  return (
    <>
      <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "35%", height: "100%", background: C.red, clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.1 }} />
        <Reveal>
          <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
            <span onClick={() => navigate(PAGES.services)} style={{ fontFamily: "'Barlow', sans-serif", fontSize: 14, color: C.red, cursor: "pointer", fontWeight: 600, letterSpacing: 1 }}>← Back to Services</span>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: 3, marginTop: 20, marginBottom: 8 }}>{data.subtitle}</div>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>{data.title}</h1>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)", maxWidth: 580 }}>{data.hero}</p>
            <div style={{ marginTop: 30 }}><RedButton large onClick={() => navigate(PAGES.contact)}>Get Started Today</RedButton></div>
          </div>
        </Reveal>
      </section>

      {/* STATS */}
      <section className="section-pad" style={{ padding: "50px 160px", background: C.bgDark }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.stats.length}, 1fr)`, gap: 20 }}>
          {data.stats.map((s, i) => <Reveal key={s.l} delay={i * 0.1}><StatCard number={s.n} label={s.l} /></Reveal>)}
        </div>
      </section>

      {/* FEATURES */}
      <section className="section-pad" style={{ padding: "80px 160px" }}>
        <Reveal><SectionTitle pre="What's Included" main="Everything You Get" accent={`With ${data.title}`} /></Reveal>
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30, marginTop: 20 }}>
          {data.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <HoverCard style={{ padding: 32, borderRadius: 14, border: `1px solid ${C.blackMed}`, background: C.bgCard, height: "100%" }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon name="check" size={18} color={C.white} />
                </div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 20, fontWeight: 700, color: C.white, marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.g300 }}>{f.desc}</p>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad" style={{ padding: "80px 160px", background: C.black, textAlign: "center" }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 42, fontWeight: 700, color: C.white, marginBottom: 16 }}>Ready To Get Started?</h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", marginBottom: 30, maxWidth: 500, margin: "0 auto 30px" }}>Schedule a free discovery call and we'll show you exactly how {data.title.toLowerCase()} can accelerate your dealership's growth.</p>
          <RedButton large onClick={() => navigate(PAGES.contact)}>Book Your Discovery Call</RedButton>
        </Reveal>
      </section>
    </>
  );
};


// ============================================================
// PAGE: RESULTS
// ============================================================
const ResultsPage = () => {
  const navigate = useNavigate();
  const caseStudies = [
    { type: "Multi-Location Auto Group", bg: C.red, situation: "Leads were dropping across six locations. Cost per lead kept climbing. Each branch ran disconnected campaigns with no shared strategy.", action: "Consolidated all ad accounts, launched AI-optimized campaigns with inventory feeds, rebuilt all six websites under one unified system.", results: ["218% more monthly leads", "42% lower cost per lead", "7-figure revenue increase in year one"] },
    { type: "Independent Pre-Owned Dealer", bg: C.black, situation: "Online rating was 3.2 stars. Quality customers avoided the business based on reviews alone.", action: "Built automated review requests after every transaction, handled professional responses to every review, and added review highlights to the website.", results: ["3.2 to 4.7 stars in 5 months", "340% more reviews", "28% increase in walk-in traffic"] },
    { type: "Used Vehicle Dealership", bg: C.blackSoft, situation: "100% dependent on paid ads with shrinking margins. Zero presence in organic search.", action: "Full search optimization with model-specific pages, Google Business setup, and ongoing content that ranks for what real buyers search.", results: ["Page 1 for 85+ keywords", "45% of leads from free search traffic", "Saved $380K/year in ad spend"] },
    { type: "Franchise Service Center", bg: C.redDark, situation: "Most customers never came back for service or repeat purchases. Revenue from existing customers was almost zero.", action: "Deployed automated retention system with service reminders, targeted follow-ups, and personalized offers based on customer history.", results: ["38% better service retention", "Repeat buyers: 8% to 22%", "$1.8M incremental revenue"] },
  ];

  return (
    <>
      <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "40%", height: "70%", background: C.red, clipPath: "polygon(0 30%, 100% 0, 100% 100%, 0 100%)", opacity: 0.12 }} />
        <Reveal>
          <div style={{ maxWidth: 700, position: "relative", zIndex: 1 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Our Track Record</div>
            <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>Real Campaigns. <span style={{ color: C.redLight }}>Real Numbers.</span></h1>
            <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>These are results from real campaigns we've managed. Client names are protected, but the numbers speak for themselves. Full details available when we talk.</p>
          </div>
        </Reveal>
      </section>

      <section className="section-pad" style={{ padding: "50px 160px", background: C.bgDark }}>
        <div className="grid-4 stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[{ n: "$12M+", l: "Ad Spend Managed" }, { n: "200+", l: "Campaigns Launched" }, { n: "5 Days", l: "Average Launch Time" }, { n: "100%", l: "Client Ownership" }].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.1}><StatCard number={s.n} label={s.l} /></Reveal>
          ))}
        </div>
      </section>

      <section className="section-pad" style={{ padding: "80px 160px" }}>
        <Reveal>
          <div className="section-title" style={{ textAlign: "center", marginBottom: 50 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 4, marginBottom: 12 }}>Case Studies</div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15 }}>What Happened When <span style={{ color: C.red }}>We Stepped In</span></h2>
            <p style={{ marginTop: 16, fontSize: 15, color: C.g400, maxWidth: 480, margin: "16px auto 0", lineHeight: 1.6 }}>Client names protected under NDA. Full details available during your strategy call.</p>
          </div>
        </Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          {caseStudies.map((cs, i) => (
            <Reveal key={cs.type} delay={i * 0.1}>
              <HoverCard className="case-card" style={{ display: "flex", borderRadius: 16, overflow: "hidden", background: C.bgCard, boxShadow: "0 8px 30px rgba(0,0,0,0.06)" }}>
                <div className="case-card-sidebar" style={{ width: 280, background: cs.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, flexShrink: 0 }}>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Confidential Client</div>
                  <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 24, fontWeight: 700, color: C.white, textAlign: "center" }}>{cs.type}</div>
                </div>
                <div style={{ padding: 36, flex: 1 }}>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2 }}>Situation</span>
                    <p style={{ fontSize: 15, color: C.g300, marginTop: 6, lineHeight: 1.6 }}>{cs.situation}</p>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2 }}>What We Did</span>
                    <p style={{ fontSize: 15, color: C.g300, marginTop: 6, lineHeight: 1.6 }}>{cs.action}</p>
                  </div>
                  <div>
                    <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 2 }}>Results</span>
                    <div style={{ marginTop: 8, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {cs.results.map((r) => (
                        <span key={r} style={{ background: "rgba(212,25,32,0.08)", color: C.red, padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600 }}>{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </HoverCard>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
};

// ============================================================
// PAGE: CONTACT
// ============================================================
const ContactPage = () => {
  const navigate = useNavigate();
  return (
  <>
    <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "35%", height: "100%", background: C.red, clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.1 }} />
      <Reveal>
        <div style={{ maxWidth: 600, position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Let's Talk</div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>Stop Guessing. <span style={{ color: C.redLight }}>Start Seeing Results.</span></h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>Book a free strategy call. We'll look at your current setup, tell you what's working and what's not, and give you a clear plan. No cost, no contract, no pressure. Just a straight conversation about your business.</p>
        </div>
      </Reveal>
    </section>

    <section className="section-pad" style={{ padding: "80px 160px" }}>
      <div className="flex-section" style={{ display: "flex", gap: 60 }}>
        <Reveal style={{ flex: 1 }}>
          <FormCard title="Schedule Your Free Strategy Call" />
        </Reveal>
        <Reveal delay={0.15} style={{ flex: 1 }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 36, fontWeight: 700, color: C.white, marginBottom: 30 }}>Here's What <span style={{ color: C.red }}>You're Getting Into</span></h2>
          {[
            "A free, honest audit of your current marketing setup",
            "Full ownership of every account and system we build for you",
            "AI-powered campaigns you can see and understand",
            "No long-term contracts. We earn your trust every month.",
            "Systems built from real US experience, designed for PH automotive",
            "A team that only works with automotive businesses. That's it.",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                <Icon name="check" size={16} color={C.white} />
              </div>
              <span style={{ fontSize: 16, color: C.g300, lineHeight: 1.6 }}>{item}</span>
            </div>
          ))}

          <div style={{ marginTop: 40, padding: 28, background: C.bgDark, borderRadius: 12 }}>
            <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 16 }}>Contact Information</h3>
            {[
              { icon: "phone", text: "+1 (818) 305-5441" },
              { icon: "mail", text: "Contact@allvolleyball.com" },
              { icon: "pin", text: "Philippines" },
            ].map((c) => (
              <div key={c.icon} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Icon name={c.icon} size={20} color={C.red} />
                <span style={{ fontSize: 15, color: C.g300 }}>{c.text}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  </>
  );
};
// ============================================================
// PAGE: BLOG
// ============================================================
const blogPosts = [
  { id: 1, title: "7 PPC Mistakes That Are Costing Your Dealership Thousands", category: "PPC", date: "Mar 28, 2026", excerpt: "Most dealerships waste 30-40% of their ad budget on avoidable mistakes. Here are the seven most expensive ones and how to fix them.", readTime: "6 min" },
  { id: 2, title: "Why Your Dealer Website Isn't Converting (And How To Fix It)", category: "Web Design", date: "Mar 21, 2026", excerpt: "If your website conversion rate is below 3%, you're leaving money on the table. We break down the most common conversion killers.", readTime: "8 min" },
  { id: 3, title: "The Complete Guide To Automotive Email Marketing in 2026", category: "Retention", date: "Mar 14, 2026", excerpt: "Email marketing delivers the highest ROI of any digital channel for dealerships. Here's how to build sequences that actually drive revenue.", readTime: "12 min" },
  { id: 4, title: "How To Get 100+ Google Reviews in 90 Days", category: "Reputation", date: "Mar 7, 2026", excerpt: "A step-by-step playbook for building a review generation machine that runs on autopilot.", readTime: "7 min" },
  { id: 5, title: "Facebook Dynamic Inventory Ads: The Dealer's Secret Weapon", category: "Social Media", date: "Feb 28, 2026", excerpt: "Dynamic inventory ads automatically showcase your real-time stock to in-market shoppers. Here's how to set them up for maximum ROI.", readTime: "9 min" },
  { id: 6, title: "Local SEO for Dealerships: Ranking in the Maps Pack", category: "SEO", date: "Feb 21, 2026", excerpt: "The Google Maps 3-pack drives more dealer traffic than any other search feature. Here's exactly how to claim your spot.", readTime: "10 min" },
];

const BlogPage = () => {
  const navigate = useNavigate();
  return (
  <>
    <section className="section-pad" style={{ position: "relative", padding: "80px 160px", background: C.black, overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: "30%", height: "100%", background: C.red, clipPath: "polygon(50% 0, 100% 0, 100% 100%, 0 100%)", opacity: 0.1 }} />
      <Reveal>
        <div style={{ maxWidth: 600, position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 16, fontWeight: 600, color: C.red, textTransform: "uppercase", letterSpacing: 3, marginBottom: 14 }}>Our Blog</div>
          <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 60, fontWeight: 700, color: C.white, lineHeight: 1.1, marginBottom: 24 }}>Automotive Marketing <span style={{ color: C.redLight }}>Insights</span></h1>
          <p style={{ fontSize: 18, lineHeight: 1.8, color: "rgba(255,255,255,0.75)" }}>Strategies, tactics, and industry knowledge to help your dealership win online.</p>
        </div>
      </Reveal>
    </section>

    <section className="section-pad" style={{ padding: "80px 160px" }}>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 30 }}>
        {blogPosts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.08}>
            <HoverCard onClick={() => navigate(PAGES.blogPost)} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.blackMed}`, cursor: "pointer", background: C.bgCard, height: "100%", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 180, background: i % 2 === 0 ? `linear-gradient(135deg, ${C.black} 0%, ${C.redDark} 100%)` : `linear-gradient(135deg, ${C.red} 0%, ${C.redDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(255,255,255,0.15)", fontSize: 48 }}>{post.category}</span>
              </div>
              <div style={{ padding: 28, flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: C.red, fontWeight: 600 }}>{post.category}</span>
                  <span style={{ color: C.g400 }}>{post.date}</span>
                  <span style={{ color: C.g400 }}>{post.readTime} read</span>
                </div>
                <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 22, fontWeight: 700, color: C.white, marginBottom: 12, lineHeight: 1.3 }}>{post.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: C.g300, flex: 1 }}>{post.excerpt}</p>
                <span style={{ color: C.red, fontWeight: 600, fontSize: 14, marginTop: 16 }}>Read Article →</span>
              </div>
            </HoverCard>
          </Reveal>
        ))}
      </div>
    </section>
  </>
  );
};

// ============================================================
// PAGE: BLOG POST (sample)
// ============================================================
const BlogPostPage = () => {
  const navigate = useNavigate();
  return (
  <>
    <section style={{ padding: "60px 160px 0", maxWidth: 820, margin: "0 auto" }}>
      <span onClick={() => navigate(PAGES.blog)} style={{ fontSize: 14, color: C.red, cursor: "pointer", fontWeight: 600 }}>← Back to Blog</span>
      <div style={{ marginTop: 20 }}>
        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: C.red, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2 }}>PPC</span>
        <h1 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 48, fontWeight: 700, color: C.white, lineHeight: 1.15, marginTop: 8, marginBottom: 16 }}>7 PPC Mistakes That Are Costing Your Dealership Thousands</h1>
        <div style={{ display: "flex", gap: 16, fontSize: 14, color: C.g400, marginBottom: 30 }}>
          <span>Mar 28, 2026</span><span>·</span><span>6 min read</span><span>·</span><span>By All Volleyball</span>
        </div>
      </div>
    </section>
    <div style={{ height: 320, background: `linear-gradient(135deg, ${C.black} 0%, ${C.redDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 60px", borderRadius: 14, maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}>
      <Icon name="chart" size={80} color="rgba(255,255,255,0.12)" />
    </div>
    <article style={{ padding: "40px 60px 80px", maxWidth: 820, margin: "0 auto" }}>
      {[
        { heading: "1. Not Using Negative Keywords", body: "One of the most expensive mistakes dealerships make is failing to build comprehensive negative keyword lists. Without them, your ads show for irrelevant searches like 'car mechanic,' 'auto parts,' or 'car wash' — burning budget on clicks that will never convert to a vehicle sale. We recommend auditing your search terms report weekly and maintaining a negative keyword list of at least 200+ terms." },
        { heading: "2. Sending All Traffic to the Homepage", body: "Your homepage is not a landing page. When someone searches for '2026 Toyota Camry for sale,' they want to see Camrys — not your general dealership page. Every ad group should point to a relevant model-specific or category-specific landing page with inventory, pricing, and a clear call to action." },
        { heading: "3. Ignoring Mobile Bid Adjustments", body: "Over 70% of automotive searches happen on mobile devices, yet most dealerships treat mobile and desktop bids identically. Mobile users have different intent patterns — they're often closer to purchase and looking for directions, click-to-call, or quick inventory browsing. Optimize your mobile experience and bid accordingly." },
        { heading: "4. No Conversion Tracking Beyond Form Fills", body: "If you're only tracking form submissions, you're missing the majority of your conversions. Phone calls, chat interactions, driving direction requests, and VDP views are all valuable conversion actions that should be tracked and optimized for." },
        { heading: "5. Running the Same Ads Year-Round", body: "Seasonality matters enormously in automotive. Your messaging, offers, and budget allocation should shift based on model-year changeovers, holiday sales events, tax refund season, and local market conditions. Static campaigns leave performance on the table." },
      ].map((s) => (
        <div key={s.heading} style={{ marginBottom: 36 }}>
          <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 14 }}>{s.heading}</h2>
          <p style={{ fontSize: 16, lineHeight: 1.85, color: C.g300 }}>{s.body}</p>
        </div>
      ))}
      <div style={{ marginTop: 40, padding: 36, background: C.black, borderRadius: 14, textAlign: "center" }}>
        <h3 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 12 }}>Want a Free PPC Audit?</h3>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>We'll analyze your current campaigns and show you exactly where you're losing money.</p>
        <RedButton onClick={() => navigate(PAGES.contact)}>Get Your Free Audit</RedButton>
      </div>
    </article>
  </>
  );
};
// ============================================================
// MAIN APP
// ============================================================
// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

export default function App() {

  return (
    <div style={{ fontFamily: "'Barlow', sans-serif", color: C.white, background: C.bgDark, minHeight: "100vh", overflowX: "clip" }}>
      <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; margin: 0; padding: 0; overflow-x: clip; }
        body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        input, select, button { font-family: inherit; }
        img { max-width: 100%; }

        /* Dashboard-style form inputs */
        .dash-form input::placeholder { color: #666; }
        .dash-form input:focus,
        .dash-form select:focus {
          border-color: ${C.red} !important;
          box-shadow: 0 0 0 3px rgba(212,25,32,0.18), 0 0 18px rgba(212,25,32,0.35) !important;
        }
        .dash-form input:hover,
        .dash-form select:hover { border-color: #3a3a3a; }
        .dash-submit:hover { box-shadow: 0 12px 32px rgba(212,25,32,0.55); transform: scale(1.04); transition: all 0.3s ease; }

        /* Dashboard glow — sports car interior at night */
        .carbon-fiber {
          background-color: #050505;
          background-image:
            radial-gradient(ellipse 90% 80% at 20% 105%, rgba(140,12,18,0.35) 0%, rgba(80,6,10,0.12) 40%, transparent 70%),
            radial-gradient(ellipse 70% 60% at 85% 15%, rgba(120,10,15,0.18) 0%, rgba(60,4,8,0.05) 45%, transparent 75%),
            radial-gradient(ellipse 50% 50% at 50% 50%, rgba(20,8,10,0.6) 0%, transparent 80%),
            radial-gradient(circle at 50% 100%, rgba(180,20,25,0.08) 0%, transparent 50%);
        }

        /* ===== WIDE SCREEN: constrain content, backgrounds stay full-width ===== */
        @media (min-width: 1640px) {
          .section-pad,
          .navbar-main,
          .announcement-bar,
          .cta-bar-main,
          .footer-main {
            padding-left: calc(50vw - 660px) !important;
            padding-right: calc(50vw - 660px) !important;
          }
        }
        
        /* ===== TABLET: 1024px ===== */
        @media (max-width: 1024px) {
          /* Hero inner container: stack */
          section[data-hero="true"] > div:nth-child(5) {
            flex-direction: column !important;
            padding: 50px 30px 60px !important;
            gap: 40px !important;
            min-height: auto !important;
          }
          section[data-hero="true"] h2 { font-size: 56px !important; }
          section[data-hero="true"] > div:nth-child(5) > div:last-child { max-width: 100% !important; flex: 1 1 100% !important; }
          
          /* All flex containers with gap 50-80: stack */
          .flex-section, .flex-section-reverse { 
            flex-direction: column !important; 
            gap: 36px !important; 
          }
          .flex-section > div, .flex-section-reverse > div { 
            flex: 1 1 100% !important; 
            max-width: 100% !important; 
            min-width: 0 !important;
            width: 100% !important;
          }
          
          /* All grids: max 2 columns */
          .grid-3, .grid-4.stats-grid { grid-template-columns: 1fr 1fr !important; }
          .grid-2 { grid-template-columns: 1fr !important; }
          
          /* Navbar: hide desktop links */
          .nav-links-desktop { display: none !important; }
          .mobile-toggle { display: flex !important; }
          
          /* Footer */
          .footer-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
          
          /* CTA bar */
          .cta-bar-main { 
            flex-direction: column !important; 
            text-align: center !important; 
            gap: 24px !important; 
          }
          
          /* Niche showcase */
          .niche-content { flex-direction: column !important; gap: 30px !important; }
          .niche-content > div:first-child { 
            flex: 1 1 100% !important; 
            width: 100% !important; 
            min-height: 220px !important; 
          }
          .niche-tabs { flex-wrap: wrap !important; }
          .niche-tabs > div { flex: 0 0 calc(25% - 6px) !important; }
          
          /* Case study cards */
          .case-card { flex-direction: column !important; }
          .case-card-sidebar { width: 100% !important; }
          
          /* Section titles */
          .section-title h2 { font-size: 38px !important; }
        }
        
        /* ===== MOBILE: 768px ===== */
        @media (max-width: 768px) {
          section:not([data-hero="true"]), footer { padding-left: 24px !important; padding-right: 24px !important; }
          nav { padding-left: 20px !important; padding-right: 20px !important; }
          
          /* Hero */
          section[data-hero="true"] > div:nth-child(5) { padding: 36px 20px 44px !important; gap: 32px !important; }
          section[data-hero="true"] h2 { font-size: 44px !important; line-height: 0.95 !important; }
          
          /* All grids: single column */
          .grid-3 { grid-template-columns: 1fr !important; }
          .grid-4.stats-grid { grid-template-columns: 1fr 1fr !important; }
          
          /* Section titles */
          .section-title h2 { font-size: 32px !important; }
          
          /* Announcement bar */
          .announcement-bar { font-size: 11px !important; padding: 8px 14px !important; }
          .announcement-hide-mobile { display: none !important; }
          
          /* Trust badges */
          .trust-badges { flex-wrap: wrap !important; gap: 10px !important; }
          
          /* Form rows */
          .form-row { flex-direction: column !important; gap: 12px !important; }
          
          /* Footer bottom */
          .footer-bottom { flex-direction: column !important; gap: 8px !important; text-align: center !important; }
          .footer-links-grid { grid-template-columns: 1fr 1fr !important; gap: 10px 20px !important; }
          
          /* Niche tabs */
          .niche-tabs > div { flex: 0 0 calc(50% - 6px) !important; }
          
          /* Big stat block in opportunity section: stack */
          .stat-block { flex-direction: column !important; gap: 20px !important; padding: 30px 24px !important; }
          .stat-block > div:first-child { flex-shrink: 1 !important; }
        }
        
        /* ===== SMALL PHONE: 480px ===== */
        @media (max-width: 480px) {
          section[data-hero="true"] h2 { font-size: 36px !important; }
          section[data-hero="true"] > div:nth-child(5) { padding: 28px 16px 36px !important; }
          section:not([data-hero="true"]), footer { padding-left: 16px !important; padding-right: 16px !important; }
          .section-title h2 { font-size: 28px !important; }
          .grid-4.stats-grid { grid-template-columns: 1fr 1fr !important; }
          .niche-tabs > div { flex: 0 0 calc(50% - 4px) !important; }
          .cta-bar-main h2, .cta-bar-main div:first-child div:last-child { font-size: 24px !important; }
          .announcement-bar { display: none !important; }
        }
      `}</style>
      <ScrollToTop />
      <div style={{ position: "sticky", top: 0, zIndex: 1000 }}>
        <AnnouncementBar />
        <Navbar />
      </div>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/post" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <CTABar />
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
