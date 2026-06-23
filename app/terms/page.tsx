export const metadata = {
  title: "Terms of Service — Signs by Sophia",
  description: "Terms and conditions for ordering from Signs by Sophia.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-5 py-16" style={{ background: "linear-gradient(160deg, #FFF8F0 0%, #FDEEE0 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <p className="font-script text-5xl mb-2" style={{ color: "#D4437A" }}>Terms of Service</p>
        <p className="font-display text-xs font-bold uppercase tracking-widest mb-10" style={{ color: "#9A607A" }}>Last updated: June 2026</p>

        <div className="space-y-8 font-display text-sm leading-relaxed" style={{ color: "#3A2A1E" }}>

          <Section title="Overview">
            These terms apply to all orders placed through signsbysophia.com or via direct message on Instagram. By placing an order, you agree to these terms.
          </Section>

          <Section title="Orders & Payment">
            <ul className="list-disc pl-5 space-y-1">
              <li>All orders require payment in full before work begins.</li>
              <li>Payment is accepted via Venmo (@Sophia-Lynch-25) or Cash App ($SignsbySophia).</li>
              <li>Your spot is not reserved until payment is received.</li>
              <li>A rush fee of $15 applies to orders needed in less than 2 weeks.</li>
            </ul>
          </Section>

          <Section title="Turnaround Time">
            <ul className="list-disc pl-5 space-y-1">
              <li>Standard turnaround is 2 weeks minimum from the date payment is received.</li>
              <li>A digital mockup will be sent 1–2 weeks before your event date for approval.</li>
              <li>We are not responsible for delays caused by late payment or late responses to mockup approvals.</li>
            </ul>
          </Section>

          <Section title="Refunds & Cancellations">
            <ul className="list-disc pl-5 space-y-1">
              <li>All sales are final. We do not offer refunds once work has begun.</li>
              <li>If you need to cancel before work begins, please contact us as soon as possible — we will do our best to accommodate.</li>
              <li>We are not responsible for dissatisfaction due to inaccurate information provided at the time of ordering (incorrect spelling, dates, colors, etc.).</li>
            </ul>
          </Section>

          <Section title="Shipping">
            <ul className="list-disc pl-5 space-y-1">
              <li>Shipping is available anywhere in the US for a flat fee of $10.</li>
              <li>We are not responsible for damage or loss that occurs during shipping.</li>
              <li>Local pickup is available in Norman, OK at no additional cost.</li>
            </ul>
          </Section>

          <Section title="Custom Work">
            All banners are handmade and hand-painted — slight variations in lettering and color are natural and part of the handmade character of the product. These are not considered defects.
          </Section>

          <Section title="Contact">
            For questions about your order, reach us via Instagram DM at{" "}
            <a href="https://instagram.com/signsby.sophia" className="font-semibold underline decoration-dotted" style={{ color: "#D4437A" }}>@signsby.sophia</a>{" "}
            or by text at <a href="tel:4052431461" className="font-semibold" style={{ color: "#D4437A" }}>405-243-1461</a>.
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
