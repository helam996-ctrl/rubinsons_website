"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { trackGAEvent } from "@/lib/analytics/events";

interface SubLink {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href?: string;
  subLinks?: SubLink[];
}

export default function SiteHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle focus on search open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems: NavItem[] = [
    {
      name: "Our Story",
      subLinks: [
        { name: "Legacy & Heritage", href: "/stories?category=legacy" },
        { name: "Vision & Values", href: "/leadership#vision-values" },
        { name: "Board of Directors", href: "/leadership" },
        { name: "Group Purpose", href: "/stories?category=purpose" },
      ],
    },
    {
      name: "Businesses",
      subLinks: [
        { name: "Builders & Infrastructure", href: "/businesses/builders-infrastructure" },
        { name: "Contracting Services", href: "/businesses/contracting" },
        { name: "ICH Dien Academia", href: "/businesses/ich-dien-academia" },
        { name: "Healthcare Division", href: "/businesses/healthcare" },
        { name: "Digital Media & Marketing", href: "/businesses/digital-media-marketing" },
      ],
    },
    {
      name: "Media",
      subLinks: [
        { name: "Press Releases", href: "/stories?category=press-releases" },
        { name: "Stories & Articles", href: "/stories" },
        { name: "Events & CSR", href: "/stories?category=events" },
      ],
    },
    {
      name: "Social Impact",
      subLinks: [
        { name: "Rudra Vahini Foundation", href: "/stories?category=csr" },
        { name: "Kaarigari Artisans", href: "/stories?category=kaarigari" },
        { name: "Community & Sustainability", href: "/stories?category=sustainability" },
      ],
    },
    { name: "Investors", href: "/investors" },
    { name: "Contact", href: "/contact" },
  ];

  const businessesMegaMenu = [
    { name: "Builders & Infrastructure", href: "/businesses/builders-infrastructure", image: "/images/builders_infrastructure.jpg" },
    { name: "Contracting Services", href: "/businesses/contracting", image: "/images/contracting_services.jpg" },
    { name: "ICH Dien Academia", href: "/businesses/ich-dien-academia", image: "/images/ich_dien_academia.jpg" },
    { name: "Healthcare Division", href: "/businesses/healthcare", image: "/images/healthcare_division.jpg" },
    { name: "Digital Media & Marketing", href: "/businesses/digital-media-marketing", image: "/images/digital_media.jpg" },
  ];

  const searchIndex = [
    { title: "Builders & Infrastructure", category: "Sector", href: "/businesses" },
    { title: "Contracting Services", category: "Sector", href: "/businesses" },
    { title: "ICH Dien Academia", category: "Sector", href: "/businesses" },
    { title: "Healthcare & Shanti Medical Hall", category: "Sector", href: "/businesses" },
    { title: "Digital Media & Marketing", category: "Sector", href: "/businesses" },
    { title: "Dr. Rudra Bhanu - Managing Director", category: "Leadership", href: "/leadership" },
    { title: "Rudra Vahini Foundation (CSR)", category: "Social Impact", href: "/stories?category=csr" },
    { title: "Kaarigari Artisans Initiative", category: "Social Impact", href: "/stories?category=kaarigari" },
    { title: "Sustainability & Green Action", category: "Social Impact", href: "/stories?category=sustainability" },
    { title: "Investor Portal Dashboard", category: "Portal", href: "/login" },
    { title: "Corporate Inquiries & Contact", category: "Contact", href: "/contact" },
  ];

  const filteredSearchResults = searchQuery
    ? searchIndex.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleMobileDropdownToggle = (menuName: string) => {
    if (openMobileDropdown === menuName) {
      setOpenMobileDropdown(null);
    } else {
      setOpenMobileDropdown(menuName);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-45 transition-all duration-500 border-b font-sans ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-slate-200/80 shadow-md py-3.5"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">
          {/* Brand Identity */}
          <Link href="/" className="space-y-0.5 group">
            <span className="text-[10px] uppercase tracking-widest text-brand-bronze font-bold block transition-all group-hover:text-brand-bronze-dark">
              Rubinsons Group
            </span>
            <span className="text-xl font-serif font-medium text-brand-slate-900 leading-none block">
              Rubinsons Private Ltd
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => {
              if (item.subLinks) {
                // Render Dropdown item
                return (
                  <div key={item.name} className="relative group/menu py-2 cursor-pointer">
                    <button className="flex items-center gap-1 text-[11px] uppercase tracking-wider font-bold text-brand-slate-900/85 hover:text-brand-slate-900 transition-colors focus:outline-none">
                      {item.name}
                      <svg
                        className="w-2.5 h-2.5 text-slate-400 group-hover/menu:text-brand-bronze group-hover/menu:rotate-180 transition-transform duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m19 9-7 7-7-7" />
                      </svg>
                    </button>
                    {item.name === "Businesses" ? (
                      /* Visual mega menu with images for Businesses */
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-[820px] bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-md p-5 opacity-0 invisible translate-y-2 group-hover/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-y-0 transition-all duration-300 z-50 grid grid-cols-5 gap-4">
                        {businessesMegaMenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className="group/item block space-y-2 text-left"
                          >
                            <div className="aspect-[3/2] w-full overflow-hidden rounded bg-slate-100 border border-slate-200/40 relative">
                              <img
                                src={subItem.image}
                                alt={subItem.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-800 group-hover/item:text-brand-bronze transition-colors block leading-tight">
                                {subItem.name}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-medium">
                                Explore Division &rarr;
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      /* Standard glassmorphic dropdown */
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-60 bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-2xl rounded-md py-3 px-2 opacity-0 invisible translate-y-2 group-hover/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-y-0 transition-all duration-300 z-50">
                        {item.subLinks.map((subLink) => (
                          <Link
                            key={subLink.name}
                            href={subLink.href}
                            className="block px-3.5 py-2 text-xs text-slate-600 hover:text-brand-slate-900 hover:bg-slate-50 font-medium rounded transition-all duration-150"
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Render Direct Link item
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  onClick={() => {
                    if (item.href === "/investors") {
                      trackGAEvent("investor_cta_click", { location: "Header" });
                    }
                  }}
                  className={`text-[11px] uppercase tracking-wider font-bold transition-all relative py-2 ${
                    isActive
                      ? "text-brand-bronze-dark border-b-2 border-brand-bronze pb-1"
                      : "text-brand-slate-900/80 hover:text-brand-slate-900"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action Area (Search & Portal Link) */}
          <div className="hidden md:flex items-center gap-5">
            {/* Search Icon */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                trackGAEvent("search_opened", { location: "Header" });
              }}
              className="text-slate-500 hover:text-brand-slate-900 transition-colors p-1.5 rounded-full hover:bg-slate-100/60 cursor-pointer"
              title="Search Corporate Site"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>

            {/* Portal Button */}
            <Link
              href="/login"
              className="group/btn inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-extrabold text-brand-slate-900 border-2 border-brand-slate-900 px-4 py-2.5 rounded transition-all duration-300 hover:bg-brand-slate-900 hover:text-white"
            >
              Portal Sign In
              <span className="inline-block transform group-hover/btn:translate-x-0.5 transition-transform duration-200">
                &rarr;
              </span>
            </Link>
          </div>

          {/* Mobile Menu & Search Actions */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-brand-slate-900 hover:text-brand-bronze transition-colors cursor-pointer"
              aria-label="Search"
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-brand-slate-900 hover:text-brand-bronze-dark transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18 18 6M6 6l12 12" />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-4 duration-300">
            <nav className="flex flex-col gap-3.5">
              {navItems.map((item) => {
                if (item.subLinks) {
                  const isOpen = openMobileDropdown === item.name;
                  return (
                    <div key={item.name} className="border-b border-slate-100 pb-2">
                      <button
                        onClick={() => handleMobileDropdownToggle(item.name)}
                        className="flex justify-between items-center w-full text-xs uppercase tracking-wider font-bold text-brand-slate-900 py-1.5"
                      >
                        {item.name}
                        <svg
                          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-brand-bronze" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="pl-3.5 py-1.5 flex flex-col gap-2 mt-1 border-l border-slate-100 bg-slate-50/50 rounded">
                          {item.subLinks.map((subLink) => (
                            <Link
                              key={subLink.name}
                              href={subLink.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="text-[11px] text-slate-600 font-medium py-1 hover:text-brand-slate-900"
                            >
                              {subLink.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href || "#"}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (item.href === "/investors") {
                        trackGAEvent("investor_cta_click", { location: "Header" });
                      }
                    }}
                    className="text-xs uppercase tracking-wider font-bold text-brand-slate-900 border-b border-slate-100 pb-2.5 py-1"
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-xs uppercase tracking-wider font-bold text-brand-slate-900 border-2 border-brand-slate-900 py-2.5 rounded hover:bg-slate-50 transition-colors"
              >
                Portal Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Interactive Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-300">
          {/* Click outside backdrop container to close */}
          <div className="absolute inset-0 cursor-default" onClick={() => setIsSearchOpen(false)} />

          <div className="bg-white border border-slate-200/80 max-w-2xl w-full rounded-lg shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
            {/* Input Header */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-200/60 gap-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.2}
                  d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sectors, leaders, announcements, and portals..."
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded"
              >
                Esc
              </button>
            </div>

            {/* Results & Recommendations Content */}
            <div className="p-6 max-h-[350px] overflow-y-auto">
              {searchQuery ? (
                <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-brand-bronze font-bold mb-3">
                    Search Results ({filteredSearchResults.length})
                  </h4>
                  {filteredSearchResults.length > 0 ? (
                    <div className="space-y-1">
                      {filteredSearchResults.map((result, idx) => (
                        <Link
                          key={idx}
                          href={result.href}
                          onClick={() => {
                            setIsSearchOpen(false);
                            trackGAEvent("search_result_click", { query: searchQuery, title: result.title });
                          }}
                          className="flex items-center justify-between p-3 hover:bg-slate-50/80 rounded transition-all duration-150 border border-transparent hover:border-slate-100 group"
                        >
                          <span className="text-xs text-slate-700 font-medium group-hover:text-brand-slate-900">
                            {result.title}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider bg-brand-slate-900/5 text-brand-slate-900 border border-brand-slate-900/10 px-2 py-0.5 rounded font-bold">
                            {result.category}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center space-y-4">
                      <p className="text-xs text-slate-400 font-medium">
                        No results found for &ldquo;{searchQuery}&rdquo;.
                      </p>
                      <button
                        onClick={() => {
                          setIsSearchOpen(false);
                          // Trigger open chatbot event
                          window.dispatchEvent(
                            new CustomEvent("open-chatbot-with-query", {
                              detail: `Tell me about: ${searchQuery}`,
                            })
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-4.5 py-2 bg-brand-slate-900 hover:bg-brand-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
                      >
                        Ask AI Assistant
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2.5">
                      Recommended Searches
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {["Infrastructure", "CSR", "Bhanu", "Investor Portal", "Stories"].map((term) => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-200 text-xs text-slate-600 font-medium rounded-full cursor-pointer transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                      Quick Access
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-600">
                      <Link
                        href="/businesses"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2 hover:text-brand-slate-900 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                        Explore Our Sectors
                      </Link>
                      <Link
                        href="/leadership"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2 hover:text-brand-slate-900 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                        Board of Directors
                      </Link>
                      <Link
                        href="/investors"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2 hover:text-brand-slate-900 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                        Investor Relations
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setIsSearchOpen(false)}
                        className="p-2 hover:text-brand-slate-900 hover:bg-slate-50 rounded flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 bg-brand-bronze rounded-full" />
                        Corporate Contact
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
