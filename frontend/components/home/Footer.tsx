"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Globe, IndianRupee, ExternalLink } from "lucide-react";
import { FaFacebook, FaGithub, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { APP_NAME } from "@/lib/constants";
import {
  FOOTER_CATEGORY_TABS,
  FOOTER_DESTINATIONS,
  FOOTER_NAV_SECTIONS,
  FOOTER_LEGAL_LINKS,
  type FooterCategory,
} from "@/lib/footer-data";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary rounded";

export default function Footer() {
  const [activeCategory, setActiveCategory] = useState<FooterCategory>("popular");
  const panelId = useId();

  const destinations = FOOTER_DESTINATIONS[activeCategory];
  const activeTabLabel = FOOTER_CATEGORY_TABS.find((tab) => tab.key === activeCategory)?.label ?? "";

  return (
    <footer aria-label={`${APP_NAME} footer`} className="mt-16 border-t border-border bg-black/[0.03] dark:bg-white/[0.03]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <h2 className="mb-4 text-xl font-semibold">Inspiration for future getaways</h2>

        <div
          role="tablist"
          aria-label="Destination categories"
          className="no-scrollbar mb-6 flex items-center gap-6 overflow-x-auto border-b border-border"
        >
          {FOOTER_CATEGORY_TABS.map((tab) => {
            const selected = tab.key === activeCategory;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`footer-tab-${tab.key}`}
                aria-selected={selected}
                aria-controls={panelId}
                onClick={() => setActiveCategory(tab.key)}
                className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm transition-colors ${focusRing} ${
                  selected ? "border-foreground font-semibold text-foreground" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          id={panelId}
          role="tabpanel"
          aria-labelledby={`footer-tab-${activeCategory}`}
          aria-label={`${activeTabLabel} destinations`}
          className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {destinations.map((d) => (
            <Link key={`${activeCategory}-${d.city}`} href={d.query} className={`block ${focusRing}`}>
              <p className="text-sm font-semibold">{d.city}</p>
              <p className="text-sm text-muted">{d.label}</p>
            </Link>
          ))}
        </div>

        <nav aria-label="Footer" className="mt-12 grid grid-cols-1 gap-8 border-t border-border pt-10 sm:grid-cols-3">
          {FOOTER_NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-3 text-sm text-muted">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className={`transition-colors hover:text-foreground hover:underline ${focusRing}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {APP_NAME.charAt(0)}
            </span>
            <span>
              © {new Date().getFullYear()} {APP_NAME}
            </span>
            {FOOTER_LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className={`hover:text-foreground hover:underline ${focusRing}`}>
                {link.label}
              </Link>
            ))}
            <a
              href="https://github.com/dhanubansal777/Scaler-Airbnb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub (opens in a new tab)"
              className={`flex items-center gap-1 hover:text-foreground hover:underline ${focusRing}`}
            >
              <FaGithub size={14} />
              GitHub
              <ExternalLink size={11} />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5 font-semibold text-foreground">
              <Globe size={15} />
              English (IN)
            </span>
            <span className="flex items-center gap-1 font-semibold text-foreground">
              <IndianRupee size={14} />
              INR
            </span>
            <span className="flex items-center gap-4 text-foreground">
              <FaFacebook size={15} />
              <FaXTwitter size={15} />
              <FaInstagram size={15} />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
