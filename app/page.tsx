import DemoLink from "@/components/DemoLink";
import LiveDemo from "@/components/LiveDemo";
import T from "@/components/T";

const STATS = [
  {
    n: "0",
    label: "PayPal payouts to Tunisia",
    detail: "No TND support, no local withdrawal — structurally locked out.",
  },
  {
    n: "55–80%",
    label: "of Tunisian e-commerce is cash-on-delivery",
    detail: "≈$215M market, growing 10–15% a year, because digital collection is broken.",
  },
  {
    n: "8.8B",
    label: "TND in diaspora remittances (2025)",
    detail: "Up ~6% year over year — money already wants to move home.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Forward the job",
    body: "Send Khlasni the contract, brief, or client thread. It reads the scope and the amount.",
  },
  {
    n: "02",
    title: "It invoices and chases",
    body: "The agent generates the invoice, sends the Gravv payment link, and follows up on your behalf — politely, then firmly.",
  },
  {
    n: "03",
    title: "Money lands, converted",
    body: "Payment settles into your multi-currency Gravv wallet and converts to TND at a real rate, no workaround required.",
  },
];

export default function Home() {
  return (
    <div className="flex-1">
      {/* Nav */}
      <header className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display text-xl tracking-tight">
            khlas<span className="text-chase">ni</span>
          </span>
          <DemoLink className="text-sm px-4 py-2 rounded-full bg-ivory text-ink font-medium hover:bg-white transition-colors">
            <T k="landing.openDemo" />
          </DemoLink>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="font-mono-tabular text-xs tracking-[0.2em] text-gold uppercase mb-4">
            Gravv · first North Africa use case
          </p>
          <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] tracking-tight">
            <T k="landing.heroTitle" />
          </h1>
          <p className="mt-5 text-muted text-lg leading-relaxed max-w-md">
            <T k="landing.heroSubtitle" />
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <DemoLink className="px-5 py-3 rounded-full bg-chase text-ink font-medium hover:brightness-110 transition">
              <T k="landing.tryDemo" />
            </DemoLink>
            <a
              href="#how"
              className="px-5 py-3 rounded-full border border-white/15 text-ivory hover:border-white/35 transition"
            >
              <T k="landing.howItWorks" />
            </a>
          </div>
        </div>

        <div className="flex justify-center md:justify-end">
          <LiveDemo />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-white/10 bg-ink-2">
        <div className="max-w-5xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-10">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl text-gold">{s.n}</p>
              <p className="mt-2 font-medium text-ivory leading-snug">
                {s.label}
              </p>
              <p className="mt-1.5 text-sm text-muted leading-relaxed">
                {s.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl">
          <T k="landing.howItWorks" />
        </h2>
        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t border-white/15 pt-4">
              <span className="font-mono-tabular text-sm text-chase">
                {s.n}
              </span>
              <h3 className="font-display text-xl mt-2">{s.title}</h3>
              <p className="mt-2 text-muted text-sm leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Positioning */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="rounded-lg border border-white/10 bg-ink-2 px-8 py-10 grid md:grid-cols-2 gap-8">
          <div>
            <p className="font-mono-tabular text-xs tracking-[0.2em] text-muted uppercase">
              Not a payments feature
            </p>
            <h3 className="font-display text-2xl mt-2 leading-snug">
              The agent <em className="italic">is</em> the collections
              department.
            </h3>
          </div>
          <p className="text-muted leading-relaxed self-center">
            Remove the payment rail and there&apos;s no product left. Khlasni
            doesn&apos;t just generate a link — it owns the follow-through:
            reading the job, invoicing it, and chasing the client until the
            money actually lands. That&apos;s the whole pitch.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span className="font-display text-ivory">
            khlas<span className="text-chase">ni</span>
          </span>
          <span>Built for freelancers getting paid from abroad.</span>
        </div>
      </footer>
    </div>
  );
}
