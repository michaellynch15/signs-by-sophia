export default function Footer() {
  return (
    <footer
      className="py-12 px-5 text-center"
      style={{
        backgroundColor: "#FFF0F6",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect width='60' height='60' fill='%23FFF0F6'/%3E%3Crect width='60' height='18' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='60' height='18' y='42' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='18' height='60' fill='%23F5B8D4' opacity='0.28'/%3E%3Crect width='18' height='60' x='42' fill='%23F5B8D4' opacity='0.28'/%3E%3C/svg%3E")`,
        backgroundSize: "60px 60px",
        borderTop: "1px solid #F0D0E0",
      }}
    >
      <p className="font-script text-4xl mb-1" style={{ color: "#D4437A" }}>Signs by Sophia</p>
      <p className="font-display text-sm font-medium mb-4" style={{ color: "#6B3058" }}>
        Hand-painted banners for every celebration
      </p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <a
          href="https://instagram.com/signsby.sophia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-display text-sm font-semibold transition-colors"
          style={{ color: "#3D1830" }}
          onMouseOver={e => (e.currentTarget.style.color = "#D4437A")}
          onMouseOut={e => (e.currentTarget.style.color = "#3D1830")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
          Instagram
        </a>
        <a
          href="https://tiktok.com/@signsby.sophia25"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 font-display text-sm font-semibold transition-colors"
          style={{ color: "#3D1830" }}
          onMouseOver={e => (e.currentTarget.style.color = "#D4437A")}
          onMouseOut={e => (e.currentTarget.style.color = "#3D1830")}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
          </svg>
          TikTok
        </a>
      </div>

      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="font-display text-xs" style={{ color: "#6B3058" }}>Norman, OK</span>
        <span style={{ color: "#F0D0E0" }}>·</span>
        <span className="font-display text-xs" style={{ color: "#6B3058" }}>US Shipping Only</span>
      </div>

      {/* Pastel dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {["#F2A7C3", "#7ECBA3", "#C5A8D5", "#F4D06F", "#F4A88A"].map((c, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c, opacity: 0.8 }} />
        ))}
      </div>

      <p className="font-display text-xs" style={{ color: "#9A607A" }}>
        © {new Date().getFullYear()} Signs by Sophia · All rights reserved
      </p>
    </footer>
  );
}
