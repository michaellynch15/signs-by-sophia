export const metadata = {
  title: "Privacy Policy — Signs by Sophia",
  description: "How Signs by Sophia collects and uses your information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-5 py-16" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <p className="font-script text-5xl mb-2" style={{ color: "#D4437A" }}>Privacy Policy</p>
        <p className="font-display text-xs font-bold uppercase tracking-widest mb-10" style={{ color: "#9A607A" }}>Last updated: June 2026</p>

        <div className="space-y-8 font-display text-sm leading-relaxed" style={{ color: "#3A2A1E" }}>

          <Section title="Who We Are">
            Signs by Sophia is a custom hand-painted banner business based in Norman, OK, operated by Sophia Lynch. You can reach us at{" "}
            <a href="https://instagram.com/signsby.sophia" className="font-semibold underline decoration-dotted" style={{ color: "#D4437A" }}>@signsby.sophia</a> on Instagram.
          </Section>

          <Section title="Information We Collect">
            When you place an order, we collect the information you provide in the order form: your name, email address, phone number, Instagram handle, and order details (occasion, banner text, size, event date, delivery preference, and any notes). We do not collect payment information — payments are processed directly through Venmo or Cash App.
          </Section>

          <Section title="How We Use Your Information">
            We use your information solely to fulfill your order: to create your banner, send your invoice, confirm your order details, and contact you with any questions. We do not sell, rent, or share your personal information with third parties for marketing purposes.
          </Section>

          <Section title="How We Store Your Information">
            Order information is stored securely in our order management system. We retain order records for business accounting purposes. You may request deletion of your personal information at any time by contacting us on Instagram.
          </Section>

          <Section title="Analytics">
            This site may use basic analytics to understand how visitors interact with our pages (such as which pages are viewed most). This data is aggregated and anonymous — it is not linked to your personal information.
          </Section>

          <Section title="Third-Party Services">
            We use the following third-party services to operate this site:
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Venmo and Cash App for payment processing</li>
              <li>Resend for transactional emails</li>
              <li>Vercel for website hosting</li>
            </ul>
            Each of these services has its own privacy policy governing how they handle data.
          </Section>

          <Section title="Your Rights">
            You have the right to access, correct, or request deletion of any personal information we hold about you. To make a request, contact us via Instagram DM at{" "}
            <a href="https://instagram.com/signsby.sophia" className="font-semibold underline decoration-dotted" style={{ color: "#D4437A" }}>@signsby.sophia</a>.
          </Section>

          <Section title="Changes to This Policy">
            We may update this policy from time to time. Any changes will be posted on this page with an updated date.
          </Section>

        </div>

        <div className="mt-12 pt-8 border-t" style={{ borderColor: "#F0D0E0" }}>
          <a href="/" className="font-display text-sm font-bold" style={{ color: "#D4437A" }}>← Back to signsbysophia.com</a>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-display font-bold text-base mb-2" style={{ color: "#6B3058" }}>{title}</p>
      <div style={{ color: "#4A3028" }}>{children}</div>
    </div>
  );
}
