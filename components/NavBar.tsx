"use client";

import { useEffect, useState } from "react";

const links = [
  { label: "Shop", href: "#products" },
  { label: "Gallery", href: "#gallery" },
  { label: "How It Works", href: "#how-it-works" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-cream/95 backdrop-blur-sm shadow-sm"
          : "bg-transparent"
      }`}
      style={{ backgroundColor: scrolled ? "rgba(255,248,240,0.95)" : "transparent" }}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-5 py-3">
        {/* Logo */}
        <a
          href="#"
          className="font-script text-3xl"
          style={{ color: "#D4437A" }}
        >
          Signs by Sophia
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-display font-semibold text-sm text-[#3D1830] hover:text-[#D4437A] transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/linktree"
              className="bg-[#D4437A] text-white font-display font-bold text-sm px-5 py-2.5 rounded-full hover:bg-[#A8305C] transition-colors"
            >
              Order Now
            </a>
          </li>
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-[#3D1830] transition-transform duration-200 ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#3D1830] transition-opacity duration-200 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#3D1830] transition-transform duration-200 ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-64" : "max-h-0"
        }`}
        style={{ backgroundColor: "rgba(255,248,240,0.98)" }}
      >
        <ul className="flex flex-col px-5 pb-5 gap-4">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="font-display font-semibold text-base text-[#3D1830]"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/linktree"
              className="block text-center bg-[#D4437A] text-white font-display font-bold text-base px-5 py-3 rounded-full"
              onClick={() => setMenuOpen(false)}
            >
              Order Now
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
