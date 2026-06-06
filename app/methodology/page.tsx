import Link from "next/link";
import { tokens as T } from "@/lib/tokens";

export const metadata = {
  title: "Methodology — Stereoscope",
  description:
    "How Stereoscope's three engines analyse a stock, the seven guru lenses each scout uses, and what the Arbiter is and isn't allowed to do.",
};

interface GuruEntry {
  name: string;
  era: string;
  framework: string;
  whatItChecks: string;
  whereYouSeeIt: string;
}

const growthGurus: GuruEntry[] = [
  {
    name: "Peter Lynch",
    era: "Fidelity Magellan, 1977–1990",
    framework:
      "Stock classification (fast grower / stalwart / slow grower / cyclical / turnaround / asset play) and the PEG ratio as a check on growth-vs-price.",
    whatItChecks:
      "Whether the company's growth profile is durable enough to justify its multiple, and whether the balance sheet (\"Lynch Cash Cushion\") buys time if growth stalls.",
    whereYouSeeIt:
      "Growth Scout lens 1. Surfaces in the Growth panel as a classification call and PEG observation.",
  },
  {
    name: "Philip Fisher",
    era: "Fisher & Co., 1931–2004",
    framework:
      "The fifteen-point \"Scuttlebutt\" qualitative checklist — R&D effectiveness, management integrity, depth of moat, customer feedback.",
    whatItChecks:
      "Whether the company has the qualitative ingredients to compound for decades, not just the next quarter.",
    whereYouSeeIt:
      "Growth Scout lens 2. Surfaces as R&D-effectiveness, management-quality, and scuttlebutt-runway commentary.",
  },
  {
    name: "William O'Neil",
    era: "Investor's Business Daily founder, CANSLIM method",
    framework:
      "CANSLIM — Current quarterly EPS, Annual earnings, New product/management, Supply/demand, Leader/laggard, Institutional sponsorship, Market direction.",
    whatItChecks:
      "Earnings acceleration and institutional accumulation patterns — momentum that has fundamental backing.",
    whereYouSeeIt:
      "Growth Scout lens 3. Surfaces as the C/A/I/S sub-scores in the Growth metrics.",
  },
  {
    name: "Bill Gurley",
    era: "Benchmark Capital partner, software unit-economics analyst",
    framework:
      "Modern software unit economics: LTV/CAC, SaaS Magic Number, NDR/GRR, self-funding tests.",
    whatItChecks:
      "Whether the growth engine is buying revenue at a sane price and whether the unit economics get better at scale, not worse.",
    whereYouSeeIt:
      "Growth Scout lens 4. Surfaces when the target is a software/subscription business.",
  },
  {
    name: "Chuck Akre",
    era: "Akre Capital Management, \"three-legged stool\" framework",
    framework:
      "Three legs: business quality, capital allocation, reinvestment runway. All three must hold.",
    whatItChecks:
      "Whether the company can keep redeploying earnings at a high return on capital — the compounding engine.",
    whereYouSeeIt:
      "Growth Scout lens 5. Surfaces as the three-leg score and the reinvestment-runway commentary.",
  },
  {
    name: "Stanley Druckenmiller (with Ray Dalio)",
    era: "Duquesne Capital / Bridgewater macro perspective",
    framework:
      "Macro regime overlay: liquidity conditions, debt cycle position, currency risk, position-sizing discipline relative to the cycle.",
    whatItChecks:
      "Whether the macro environment is a tailwind or a headwind for this specific business model right now.",
    whereYouSeeIt:
      "Growth Scout lens 6. Surfaces as the macro-regime sensitivity and position-sizing verdict.",
  },
  {
    name: "Howard Marks",
    era: "Oaktree Capital, \"second-level thinking\" school",
    framework:
      "Second-level thinking: what is the consensus narrative, what is the variant perception, what is already priced in.",
    whatItChecks:
      "Whether the bullish story is already discounted into the price, or whether there is a real gap between perception and reality.",
    whereYouSeeIt:
      "Growth Scout lens 7. Surfaces as the consensus-vs-variant framing and the option-runway audit.",
  },
];

const valueGurus: GuruEntry[] = [
  {
    name: "Warren Buffett",
    era: "Berkshire Hathaway, post-1960s \"quality at fair price\" era",
    framework:
      "Economic moat evaluation (switching costs, network effects, cost leadership, intangibles) plus durable ROIC/ROE.",
    whatItChecks:
      "Whether the business has a structural advantage that lets it earn high returns on capital for decades.",
    whereYouSeeIt:
      "Value Guard lens 1. Surfaces as the moat score, ROIC trend, and pricing-power commentary.",
  },
  {
    name: "Benjamin Graham",
    era: "Graham-Newman Corp., the original \"Intelligent Investor\"",
    framework:
      "Net Current Asset Value (NCAV), P/E × P/B Graham Multiplier (< 22.5), and a minimum margin of safety against intrinsic value.",
    whatItChecks:
      "What the company would be worth in liquidation and how far below intrinsic value the market price sits.",
    whereYouSeeIt:
      "Value Guard lens 2. Surfaces as the NCAV floor, the Graham Multiplier check, and a conservative-margin-of-safety verdict.",
  },
  {
    name: "Jim Chanos",
    era: "Kynikos Associates, short-seller specialising in accounting fraud",
    framework:
      "Forensic accounting: operating cash flow vs net income, dilution from stock-based compensation, days-sales-outstanding expansion, channel stuffing signals.",
    whatItChecks:
      "Whether the reported earnings are real cash earnings or accounting artefacts.",
    whereYouSeeIt:
      "Value Guard lens 3. Surfaces as the Quality of Earnings ratio and the dilution-tax breakdown.",
  },
  {
    name: "Joel Greenblatt",
    era: "Gotham Capital, the \"Magic Formula\" — earnings yield and ROC",
    framework:
      "Earnings Yield (Economic EBIT / Enterprise Value) and Return on Capital (Economic EBIT / Net Working Capital + Net Fixed Assets), benchmarked against the 10-year Treasury.",
    whatItChecks:
      "Whether the company is cheap relative to what it earns and good at deploying capital.",
    whereYouSeeIt:
      "Value Guard lens 4. Surfaces as the earnings-yield and ROC numbers in the Value metrics.",
  },
  {
    name: "Mohnish Pabrai",
    era: "Pabrai Investment Funds, the Dhandho framework",
    framework:
      "Dhandho risk architecture — \"heads I win, tails I don't lose much.\" Spawner framework for businesses that can incubate adjacent units.",
    whatItChecks:
      "The downside floor (net liquid cash per share) and the optionality on top of it.",
    whereYouSeeIt:
      "Value Guard lens 5. Surfaces as the Dhandho risk grade and the cash-per-share baseline.",
  },
  {
    name: "Charlie Munger",
    era: "Berkshire Hathaway vice chair, the \"inversion\" school",
    framework:
      "Pre-mortem: assume the investment failed and reason backward to identify the most likely structural causes.",
    whatItChecks:
      "What would have to go wrong — specifically — for the position to lose half its value over five years.",
    whereYouSeeIt:
      "The Inversion / Munger Pre-Mortem section. This is the only lens Stereoscope renders as a dedicated section rather than a guru row.",
  },
  {
    name: "Seth Klarman",
    era: "Baupost Group, \"Margin of Safety\" school",
    framework:
      "Capital preservation through complexity and liquidity: cash drag, reflexivity shock testing, self-funding runway, genuine-discount vs value-trap discrimination.",
    whatItChecks:
      "Whether a cheap stock is cheap because it's misunderstood or because it's actually impaired.",
    whereYouSeeIt:
      "Value Guard lens 7. Surfaces as the cash-drag analysis and the Klarman discount verdict.",
  },
  {
    name: "Howard Schilit",
    era: "Center for Financial Research and Analysis, accounting-shenanigans research",
    framework:
      "Detection of accounting shenanigans: capitalised software vs R&D ratio, AR factoring, restructuring-charge frequency, GAAP-to-Adjusted gap, depreciation schedule consistency.",
    whatItChecks:
      "Whether the financial statements are constructed honestly or whether the accounting itself is the red flag.",
    whereYouSeeIt:
      "Value Guard lens 8. Surfaces as the Schilit verdict in the Value panel.",
  },
];

function GuruCard({ g }: { g: GuruEntry }) {
  return (
    <div
      style={{
        border: `1px solid ${T.line}`,
        borderRadius: 10,
        padding: "14px 16px",
        background: T.card,
        boxShadow: T.shadow,
      }}
    >
      <div
        style={{
          fontFamily: "'Fraunces',serif",
          fontWeight: 500,
          fontSize: 16,
          color: T.ink,
        }}
      >
        {g.name}
      </div>
      <div
        style={{
          fontSize: 10.5,
          color: T.faint,
          fontFamily: "'IBM Plex Mono',monospace",
          letterSpacing: ".02em",
          marginTop: 2,
          marginBottom: 10,
        }}
      >
        {g.era}
      </div>
      <Field label="Framework" value={g.framework} />
      <Field label="What it checks" value={g.whatItChecks} />
      <Field label="Where you see it in Stereoscope" value={g.whereYouSeeIt} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div
        style={{
          fontSize: 9.5,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: T.faint,
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 12.5, color: T.soft, lineHeight: 1.55 }}>{value}</div>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 10,
        marginTop: 40,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontSize: 10.5,
          letterSpacing: ".14em",
          textTransform: "uppercase",
          color: T.faint,
        }}
      >
        {kicker}
      </span>
      <h2
        style={{
          fontFamily: "'Fraunces',serif",
          fontWeight: 500,
          fontSize: 22,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <>
      <header
        style={{
          borderBottom: `1px solid ${T.line}`,
          background: "rgba(248,247,243,.92)",
          backdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 20px",
            height: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Fraunces',serif",
              fontWeight: 600,
              fontSize: 20,
              letterSpacing: ".01em",
              textDecoration: "none",
              color: T.ink,
            }}
          >
            STEREO<span style={{ color: T.gold }}>SCOPE</span>
          </Link>
          <Link
            href="/"
            style={{ fontSize: 12, color: T.soft, textDecoration: "none" }}
          >
            ← Home
          </Link>
        </div>
      </header>

      <main
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "32px 20px 80px",
          color: T.ink,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: T.faint,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Methodology
        </div>
        <h1
          style={{
            fontFamily: "'Fraunces',serif",
            fontWeight: 500,
            fontSize: 34,
            letterSpacing: "-.01em",
            lineHeight: 1.15,
          }}
        >
          What&apos;s actually under the hood
        </h1>
        <p
          style={{
            fontSize: 14.5,
            color: T.soft,
            lineHeight: 1.65,
            marginTop: 14,
            maxWidth: 700,
          }}
        >
          Stereoscope runs three Gemini-powered engines on every ticker. Two of them analyse
          the company independently — blind to each other&apos;s output — and the third
          reconciles their findings without averaging them. This page documents what each
          engine does, which seven investor frameworks each scout reasons through, and what
          the model is and isn&apos;t allowed to do.
        </p>

        <SectionHeader kicker="The Architecture" title="Three engines, one report" />
        <div style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              border: `1px solid ${T.growthLine}`,
              borderRadius: 10,
              padding: "14px 16px",
              background: T.growthSoft,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.growth,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Engine 1 — The Growth Scout
            </div>
            <div style={{ fontSize: 13, color: T.soft, lineHeight: 1.6 }}>
              Forward-looking, secular-trend, hyper-scaling bias. Retrieves the most recent
              quarterly filing from SEC EDGAR or the company&apos;s IR page, then reasons
              through seven growth-focused frameworks. Produces a price band reflecting where
              the bull case lands.
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${T.valueLine}`,
              borderRadius: 10,
              padding: "14px 16px",
              background: T.valueSoft,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.value,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Engine 2 — The Value Guard
            </div>
            <div style={{ fontSize: 13, color: T.soft, lineHeight: 1.6 }}>
              Capital-preservation, forensic-accounting, margin-of-safety bias. Pulls the
              same filings independently of the Growth Scout, then reasons through seven
              value-focused frameworks plus the Munger pre-mortem. Produces a price band
              reflecting the downside-protected case.
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${T.goldLine}`,
              borderRadius: 10,
              padding: "14px 16px",
              background: T.goldSoft,
            }}
          >
            <div
              style={{
                fontSize: 10.5,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: T.gold,
                fontWeight: 600,
                marginBottom: 4,
              }}
            >
              Engine 3 — The Arbiter
            </div>
            <div style={{ fontSize: 13, color: T.soft, lineHeight: 1.6 }}>
              The reconciler. Reads both scouts&apos; structured findings and produces the
              factual ledger, the Crux question, the decisive data point, the &ldquo;what
              you&apos;re paying for&rdquo; conditional, three catalysts, and three
              invalidation triggers. The Arbiter is explicitly prohibited from issuing a
              verdict, averaging the two price bands, or introducing any new metric.
            </div>
          </div>
        </div>

        <SectionHeader kicker="The Disagreement Score" title="How we measure tension" />
        <p style={{ fontSize: 13.5, color: T.soft, lineHeight: 1.65, maxWidth: 700 }}>
          The chip near the Synthesis section turns &ldquo;how far apart did the two lenses
          land&rdquo; into a number from 0 to 100. It combines two signals: the distance
          between the band centres on the price axis, and how much the bands overlap. A score
          under 25 means the two engines landed in roughly the same place — interesting,
          because they got there by different routes. A score over 55 means they&apos;re
          arguing about whether this is the same stock. Most reports land in the 25–55
          middle, where the Crux question is the most useful output on the page.
        </p>

        <SectionHeader kicker="The Growth Scout Lenses" title="Seven gurus, growth side" />
        <p
          style={{
            fontSize: 13,
            color: T.soft,
            lineHeight: 1.6,
            marginBottom: 16,
            maxWidth: 700,
          }}
        >
          The Growth Scout is instructed to reason through these seven frameworks
          sequentially, then issue a per-guru sentiment (bullish / neutral / bearish) with a
          stated primary catalyst or risk. The model does not literally compute every metric
          each guru used — it reasons in the style of each framework, grounded in numbers it
          retrieves from the filing.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {growthGurus.map((g) => (
            <GuruCard key={g.name} g={g} />
          ))}
        </div>

        <SectionHeader kicker="The Value Guard Lenses" title="Seven gurus plus Munger, value side" />
        <p
          style={{
            fontSize: 13,
            color: T.soft,
            lineHeight: 1.6,
            marginBottom: 16,
            maxWidth: 700,
          }}
        >
          The Value Guard runs the same seven-lens structure, plus a dedicated Munger
          pre-mortem that the report surfaces as &ldquo;The Inversion.&rdquo; Same caveat
          applies: the model reasons in the style of each framework, it does not literally
          run a Piotroski F-Score or rebuild a full DCF.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {valueGurus.map((g) => (
            <GuruCard key={g.name} g={g} />
          ))}
        </div>

        <SectionHeader kicker="What it is, what it isn't" title="Honest limits" />
        <div
          style={{
            border: `1px solid ${T.line}`,
            borderRadius: 10,
            padding: "16px 18px",
            background: T.card,
            boxShadow: T.shadow,
            fontSize: 13,
            color: T.soft,
            lineHeight: 1.7,
          }}
        >
          <p style={{ marginTop: 0 }}>
            <b style={{ color: T.ink }}>Stereoscope reasons; it does not compute.</b> When
            the report says &ldquo;Greenblatt earnings yield,&rdquo; the model is reasoning
            in the style of Joel Greenblatt — using the actual formula as a guide — but the
            number is derived from line items the model retrieved from a filing, not from a
            Bloomberg terminal. Treat the numbers as analyst notes, not audited outputs.
          </p>
          <p>
            <b style={{ color: T.ink }}>Filings are the floor; the model is the ceiling.</b>{" "}
            Both scouts are instructed to retrieve the most recent 10-Q or equivalent and to
            flag any metric they cannot find rather than substitute it from memory. The
            report displays the filing period it&apos;s grounded in so you can judge
            staleness yourself.
          </p>
          <p>
            <b style={{ color: T.ink }}>The Arbiter cannot blend.</b> No averaged price
            target, no composite sentiment score, no &ldquo;final&rdquo; valuation. The two
            bands are kept as distinct endpoints of a range and the Crux question is what
            the user is asked to resolve. That is by design — the moment we average, we
            become a verdict tool.
          </p>
          <p style={{ marginBottom: 0 }}>
            <b style={{ color: T.ink }}>This is not financial advice.</b> Stereoscope is an
            educational decision-support tool. It does not know your tax situation, your
            risk tolerance, your time horizon, or what else you own. Conviction needs two
            eyes — the decision is yours.
          </p>
        </div>

        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: `1px solid ${T.line}`,
            fontSize: 11,
            color: T.faint,
          }}
        >
          Last reviewed for accuracy alongside Growth Scout v2.0 and Value Guard v3.0
          prompts. If you see a guru lens described here that doesn&apos;t show up in your
          report, the model may have skipped or merged it under the dilution rules — let us
          know.
        </div>
      </main>
    </>
  );
}
