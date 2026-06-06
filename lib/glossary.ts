// Central glossary config. Keys are stable internal IDs; `label` is the
// canonical surface form used in the tooltip header; `aliases` lets the
// matcher catch common variants. Add a term once here and it lights up
// everywhere automatically.

export interface GlossaryEntry {
  label: string;
  definition: string;
  aliases?: string[];
}

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // ── Stereoscope-specific vocabulary ──
  GROWTH_SCOUT: {
    label: "Growth Scout",
    definition:
      "Looks at a company's growth potential — revenue trajectory, market expansion, and whether the business can scale rapidly. Named after legendary growth investors like Philip Fisher and Peter Lynch.",
  },
  VALUE_GUARD: {
    label: "Value Guard",
    definition:
      "Scrutinises balance sheets, cash flow, and valuation ratios to assess whether a stock is trading below its intrinsic worth. Draws on the principles of Benjamin Graham and Warren Buffett.",
  },
  ARBITER: {
    label: "Arbiter",
    definition:
      "A neutral synthesis layer that identifies the single most important question dividing the growth and value perspectives. It frames the decision without issuing a buy, hold, or sell verdict.",
    aliases: ["the arbiter"],
  },
  ANALYST_VERDICT: {
    label: "Analyst verdict",
    definition:
      "A buy/hold/sell rating issued by a financial analyst. Stereoscope deliberately avoids these to prevent overconfidence and encourage the user's own reasoning.",
  },
  PRICE_TARGET: {
    label: "Price target",
    definition:
      "A specific predicted future price for a stock. These are often wrong and create false precision. Stereoscope frames probabilities, not price targets.",
  },
  PERSONALISED_ADVICE: {
    label: "Personalised financial advice",
    definition:
      "Tailored guidance based on an individual's financial situation, goals, and risk tolerance — requires a licensed financial advisor. This tool provides general educational analysis only.",
  },
  CONVICTION: {
    label: "Conviction",
    definition:
      "In investing, a high-confidence belief in a position based on thorough research — as opposed to speculation or following trends.",
  },
  HYPER_SCALING: {
    label: "Hyper-scaling engines",
    definition:
      "Analytical frameworks that assess whether a business model can grow revenue exponentially without proportional cost increases. Key signal for growth investors.",
    aliases: ["hyper-scaling"],
  },

  // ── Core valuation ratios ──
  PE_RATIO: {
    label: "P/E ratio",
    definition:
      "Price-to-Earnings ratio. Divides the stock price by annual earnings per share. A high P/E may signal growth expectations; a low P/E may signal undervaluation — or trouble.",
    aliases: ["P/E", "Fwd P/E", "PE ratio", "price-to-earnings"],
  },
  PEG_RATIO: {
    label: "PEG ratio",
    definition:
      "Price/Earnings-to-Growth. Divides the P/E ratio by the expected earnings growth rate. A PEG below 1 traditionally signals a stock may be cheap relative to its growth.",
    aliases: ["PEG"],
  },
  PRICE_TO_BOOK: {
    label: "P/B ratio",
    definition:
      "Price-to-Book ratio. Stock price divided by book value per share. Useful for asset-heavy businesses; less meaningful for software companies where book value misses intangibles.",
    aliases: ["P/B", "price-to-book"],
  },
  PRICE_TO_SALES: {
    label: "P/S ratio",
    definition:
      "Price-to-Sales ratio. Market cap divided by revenue. Used when a company isn't yet profitable; high P/S signals investors are paying a premium for future earnings.",
    aliases: ["P/S", "price-to-sales"],
  },
  EV_EBITDA: {
    label: "EV/EBITDA",
    definition:
      "Enterprise Value divided by EBITDA. A cleaner cross-company multiple than P/E because it strips out capital structure and tax effects.",
  },
  EV_SALES: {
    label: "EV/Sales",
    definition:
      "Enterprise Value divided by revenue. Often used for unprofitable growth companies where EV/EBITDA isn't meaningful yet.",
    aliases: ["EV / Sales", "EV/Revenue"],
  },
  EV_FCF: {
    label: "EV/FCF",
    definition:
      "Enterprise Value divided by Free Cash Flow. The cleanest \"cash multiple\" — what you'd pay in cash terms to own the whole business and capture its cash generation.",
  },
  EARNINGS_YIELD: {
    label: "Earnings yield",
    definition:
      "The inverse of P/E, expressed as a percentage. Compares directly to bond yields — a 5% earnings yield means each $100 invested would earn $5 if the company paid out everything.",
  },
  FCF_YIELD: {
    label: "FCF yield",
    definition:
      "Free Cash Flow divided by market cap, as a percentage. A direct cash return measure — how much actual cash the business throws off per dollar of market value.",
  },
  GRAHAM_MULTIPLIER: {
    label: "Graham Multiplier",
    definition:
      "P/E × P/B from Benjamin Graham's classic screen. Values above 22.5 traditionally flag a stock as potentially overvalued on combined earnings and book-value grounds.",
  },
  DCF: {
    label: "DCF",
    definition:
      "Discounted Cash Flow valuation. Projects a company's future cash flows and discounts them back to today's dollars using a required rate of return. The most theoretically pure intrinsic valuation method.",
    aliases: ["discounted cash flow"],
  },
  NCAV: {
    label: "NCAV",
    definition:
      "Net Current Asset Value. Current assets minus all liabilities, per share — what shareholders would theoretically recover in a fire-sale liquidation. Benjamin Graham's deep-value floor.",
    aliases: ["Net Current Asset Value"],
  },
  ENTERPRISE_VALUE: {
    label: "Enterprise value",
    definition:
      "Market cap plus debt minus cash. The total price you'd pay to own the entire business outright. Used in valuation multiples that ignore capital structure.",
    aliases: ["EV"],
  },
  MARKET_CAP: {
    label: "Market cap",
    definition:
      "Total stock-market value of a company — share price times shares outstanding. The headline measure of a company's equity worth.",
    aliases: ["market capitalisation"],
  },
  INTRINSIC_VALUE: {
    label: "Intrinsic value",
    definition:
      "What a business is genuinely worth based on the cash it will generate over its life, separate from what the market is paying for it today. The anchor concept of value investing.",
  },

  // ── Profitability and cash ──
  EPS: {
    label: "EPS",
    definition:
      "Earnings Per Share. The company's net profit divided by total shares outstanding. A rising EPS generally signals improving profitability.",
    aliases: ["earnings per share"],
  },
  DILUTED_EPS: {
    label: "Diluted EPS",
    definition:
      "Earnings per share computed using all shares that could exist if options, warrants, and convertibles were exercised. The more conservative — and usually more honest — per-share number.",
  },
  FCF: {
    label: "FCF",
    definition:
      "Free Cash Flow. The cash a company generates after paying for operations and capital expenditure. Often considered a cleaner measure of financial health than reported profit.",
    aliases: ["free cash flow"],
  },
  TRUE_OWNER_FCF: {
    label: "True Owner FCF",
    definition:
      "Operating cash flow minus stock-based compensation minus capital expenditure. A stricter Free Cash Flow that treats SBC as the real cost it is, not an add-back.",
  },
  OCF: {
    label: "OCF",
    definition:
      "Operating Cash Flow. Cash generated by the core business before capital spending. The top of every cash-flow analysis.",
    aliases: ["operating cash flow"],
  },
  EBITDA: {
    label: "EBITDA",
    definition:
      "Earnings Before Interest, Taxes, Depreciation, and Amortisation. A widely used profitability proxy that strips out financing and accounting choices. Critics note it ignores real costs like SBC.",
  },
  EBIT: {
    label: "EBIT",
    definition:
      "Earnings Before Interest and Taxes. Operating income — the profit from the core business before financing costs and taxes.",
  },
  NET_INCOME: {
    label: "Net income",
    definition:
      "The bottom-line profit on the income statement, after all expenses, interest, and taxes. The GAAP-defined \"earnings\" figure that flows into EPS.",
  },
  GROSS_MARGIN: {
    label: "Gross margin",
    definition:
      "Revenue minus the direct cost of goods sold, divided by revenue. Measures unit-level profitability — high gross margins are the first sign of pricing power.",
  },
  OPERATING_MARGIN: {
    label: "Operating margin",
    definition:
      "Operating income divided by revenue. Measures profitability after operating expenses but before financing — the cleanest read on operational efficiency.",
  },
  FCF_MARGIN: {
    label: "FCF margin",
    definition:
      "Free Cash Flow divided by revenue. How much cash actually drops to the bottom for each dollar of sales — a stricter quality-of-earnings test than operating margin.",
  },
  ROE: {
    label: "ROE",
    definition:
      "Return on Equity. Net income divided by shareholder equity. Measures how efficiently management turns shareholders' capital into profit. Buffett's classic quality screen.",
    aliases: ["return on equity"],
  },
  ROIC: {
    label: "ROIC",
    definition:
      "Return on Invested Capital. Operating profit divided by capital invested in the business. The clearest test of whether management is allocating capital productively.",
    aliases: ["return on invested capital"],
  },
  ROC: {
    label: "ROC",
    definition:
      "Return on Capital. Greenblatt's version: operating profit divided by net working capital plus net fixed assets. Used in his \"Magic Formula\" alongside earnings yield.",
    aliases: ["return on capital"],
  },
  ROA: {
    label: "ROA",
    definition:
      "Return on Assets. Net income divided by total assets. Useful for asset-heavy businesses; less meaningful for capital-light software companies.",
    aliases: ["return on assets"],
  },
  OWNER_EARNINGS: {
    label: "Owner earnings",
    definition:
      "Buffett's preferred profit measure: reported earnings plus depreciation minus the capital expenditure needed to maintain the business. Closer to the cash actually available to owners than GAAP net income.",
  },

  // ── Growth and SaaS metrics ──
  TAM: {
    label: "TAM",
    definition:
      "Total Addressable Market. The maximum revenue opportunity available if a company captured 100% of its target market. Used to assess long-term growth ceiling.",
    aliases: ["total addressable market"],
  },
  CAGR: {
    label: "CAGR",
    definition:
      "Compound Annual Growth Rate. The smoothed annual growth rate that would take a starting value to an ending value over a given period. The standard way to describe multi-year growth.",
    aliases: ["compound annual growth rate"],
  },
  RULE_OF_40: {
    label: "Rule of 40",
    definition:
      "A SaaS rule of thumb: revenue growth percentage plus free cash flow margin should sum to 40 or higher. Healthy software companies trade growth for margin in roughly that ratio.",
  },
  NDR: {
    label: "NDR",
    definition:
      "Net Dollar Retention. Revenue retained from existing customers a year later, including upsells and minus churn. Above 100% means the existing customer base grows revenue on its own.",
    aliases: ["net dollar retention", "net revenue retention", "NRR"],
  },
  GRR: {
    label: "GRR",
    definition:
      "Gross Revenue Retention. Revenue retained from existing customers excluding upsells. A pure churn measure — below 90% is a yellow flag for SaaS businesses.",
    aliases: ["gross revenue retention"],
  },
  ARR: {
    label: "ARR",
    definition:
      "Annual Recurring Revenue. For subscription businesses: the annualised value of all active contracts at a point in time. The cleanest top-line measure for SaaS.",
    aliases: ["annual recurring revenue"],
  },
  MRR: {
    label: "MRR",
    definition:
      "Monthly Recurring Revenue. The monthly equivalent of ARR. Used by smaller SaaS businesses and consumer subscriptions where contracts roll monthly.",
    aliases: ["monthly recurring revenue"],
  },
  CHURN: {
    label: "Churn",
    definition:
      "The rate at which customers cancel or stop paying. Low churn is the foundation of compounding subscription revenue; high churn turns growth into a treadmill.",
  },
  LTV: {
    label: "LTV",
    definition:
      "Customer Lifetime Value. The total revenue a customer is expected to generate before they churn. Pairs with CAC to test whether unit economics actually work.",
    aliases: ["lifetime value"],
  },
  CAC: {
    label: "CAC",
    definition:
      "Customer Acquisition Cost. Sales and marketing spend divided by new customers acquired. A high LTV/CAC ratio (3× or more) is the classic SaaS health signal.",
    aliases: ["customer acquisition cost"],
  },
  MAGIC_NUMBER: {
    label: "SaaS Magic Number",
    definition:
      "Net new annualised revenue divided by the prior period's sales-and-marketing spend. Above 1 means efficient growth; below 0.5 means the sales engine is burning cash for diminishing returns.",
  },
  RPO: {
    label: "RPO",
    definition:
      "Remaining Performance Obligations. Contracted but not-yet-recognised revenue sitting on the balance sheet. A leading indicator of future revenue — especially for enterprise SaaS.",
    aliases: ["remaining performance obligations"],
  },
  BACKLOG: {
    label: "Backlog",
    definition:
      "Total contracted future work or revenue not yet delivered. Common for hardware, defence, and services businesses; a forward visibility signal.",
  },
  BOOK_TO_BILL: {
    label: "Book-to-bill",
    definition:
      "Ratio of new orders booked to revenue billed in a period. Above 1 means demand is outrunning current revenue — a leading indicator of growth.",
    aliases: ["book-to-bill ratio"],
  },
  BOOKINGS: {
    label: "Bookings",
    definition:
      "Total dollar value of contracts signed in a period. Differs from revenue, which is recognised over the contract's life. Bookings lead revenue.",
  },
  COHORT: {
    label: "Cohort",
    definition:
      "A group of customers acquired in the same period, tracked through time. Cohort analysis shows whether newer customers behave better or worse than older ones — the cleanest read on product trajectory.",
  },

  // ── Accounting quality ──
  GAAP: {
    label: "GAAP",
    definition:
      "Generally Accepted Accounting Principles. The standardised US accounting rules companies must follow in their official filings. The strict baseline against which \"adjusted\" or \"non-GAAP\" numbers are compared.",
  },
  NON_GAAP: {
    label: "Non-GAAP",
    definition:
      "Adjusted earnings management presents alongside GAAP figures, typically excluding items like stock-based compensation, restructuring, or amortisation. Useful when honest, misleading when used to hide real costs.",
    aliases: ["non-GAAP", "Adjusted EPS", "adjusted earnings"],
  },
  IFRS: {
    label: "IFRS",
    definition:
      "International Financial Reporting Standards. The accounting framework used outside the US. Treats leases, R&D capitalisation, and intangibles differently from GAAP, which matters for cross-border comparisons.",
  },
  SBC: {
    label: "SBC",
    definition:
      "Stock-Based Compensation. Shares or options granted to employees as pay. Non-cash on the income statement but a real cost to existing shareholders through dilution.",
    aliases: ["stock-based compensation"],
  },
  DSO: {
    label: "DSO",
    definition:
      "Days Sales Outstanding. Average days it takes to collect cash from a sale. Rising DSO can signal aggressive revenue recognition or weakening customer credit quality.",
    aliases: ["days sales outstanding"],
  },
  QUALITY_OF_EARNINGS: {
    label: "Quality of earnings",
    definition:
      "How well reported profit converts to actual cash. Measured as operating cash flow divided by net income — below 1× over time is a warning that earnings may be accounting artefacts.",
  },
  RECONCILIATION: {
    label: "Reconciliation",
    definition:
      "The line-by-line bridge between GAAP and non-GAAP earnings. The reconciliation footnote reveals exactly what management is excluding to make adjusted numbers look better.",
  },
  CHANNEL_STUFFING: {
    label: "Channel stuffing",
    definition:
      "Pushing more product to distributors than they can sell, to inflate current-period revenue. A classic accounting shenanigan flagged by spiking inventory and DSO.",
  },
  CAPITALISED_SOFTWARE: {
    label: "Capitalised software",
    definition:
      "R&D spending that gets booked as a long-term asset rather than expensed immediately. Boosts current earnings but defers the cost — flagged when it exceeds 30% of total R&D.",
    aliases: ["software capitalisation"],
  },
  COGS: {
    label: "COGS",
    definition:
      "Cost of Goods Sold. The direct cost of producing what the company sold — materials, manufacturing, and direct labour. Subtracted from revenue to get gross profit.",
    aliases: ["cost of goods sold"],
  },
  SGA: {
    label: "SG&A",
    definition:
      "Selling, General, and Administrative expenses. The overhead category — sales staff, corporate functions, marketing, rent. Operating leverage shows up as SG&A growing slower than revenue.",
    aliases: ["selling general and administrative"],
  },
  RD_EXPENSE: {
    label: "R&D expense",
    definition:
      "Research and development spending. Most software companies expense it immediately; some capitalise portions of it. High R&D/revenue ratios can signal investment in future growth — or hide cost issues.",
    aliases: ["R&D"],
  },
  RESTRUCTURING_CHARGE: {
    label: "Restructuring charge",
    definition:
      "A one-time cost booked when a company reorganises, lays off staff, or closes operations. Frequent \"one-time\" charges over multiple years are a yellow flag for earnings quality.",
  },
  ONE_TIME_ITEMS: {
    label: "One-time items",
    definition:
      "Charges or gains that don't recur in normal operations. Honest when isolated; suspicious when management uses them every quarter to clean up adjusted earnings.",
    aliases: ["one-time charge", "one-time gain"],
  },
  GOODWILL: {
    label: "Goodwill",
    definition:
      "The premium paid above book value in an acquisition, parked on the balance sheet as an intangible asset. Doesn't depreciate but gets tested for impairment.",
  },
  GOODWILL_IMPAIRMENT: {
    label: "Goodwill impairment",
    definition:
      "A non-cash write-down acknowledging that an acquired business is worth less than it was on the books. Often a delayed admission that a deal didn't work out.",
  },

  // ── Balance sheet ──
  TANGIBLE_BOOK_VALUE: {
    label: "Tangible book value",
    definition:
      "Book value with intangibles and goodwill removed — what's left if you only count the hard, sellable assets. A more conservative floor for asset-heavy businesses.",
    aliases: ["tangible book"],
  },
  WORKING_CAPITAL: {
    label: "Working capital",
    definition:
      "Current assets minus current liabilities. The cash buffer the business runs day-to-day operations on. Negative working capital can be healthy (suppliers fund growth) or a warning, depending on context.",
  },
  NWC: {
    label: "NWC",
    definition:
      "Net Working Capital. The operating slice of working capital — current operating assets minus current operating liabilities, excluding cash and financial debt. Used in ROC calculations.",
    aliases: ["net working capital"],
  },
  ACCOUNTS_RECEIVABLE: {
    label: "Accounts receivable",
    definition:
      "Money customers owe but haven't paid yet. Rising receivables faster than revenue signal aggressive sales terms or trouble collecting.",
    aliases: ["receivables"],
  },
  DEFERRED_REVENUE: {
    label: "Deferred revenue",
    definition:
      "Cash already collected for services not yet delivered, parked as a liability. For SaaS businesses, growing deferred revenue is bullish — customers paid up front for what's coming.",
  },
  ACCRUED_LIABILITIES: {
    label: "Accrued liabilities",
    definition:
      "Expenses recognised on the income statement but not yet paid in cash. Common and benign in normal amounts; spikes can hide quality-of-earnings issues.",
  },
  NET_CASH: {
    label: "Net cash",
    definition:
      "Cash and short-term investments minus debt. A positive figure means the company could pay off all debt and still have cash left — financial fortress territory.",
  },
  NET_DEBT: {
    label: "Net debt",
    definition:
      "Total debt minus cash. The flip side of net cash; positive net debt means borrowings exceed available cash. Used in enterprise value calculations.",
  },
  WARRANT_LIABILITY: {
    label: "Warrant liability",
    definition:
      "Outstanding warrants that could convert to shares — a future dilution overhang on the balance sheet, marked to market every quarter. Common in SPAC-related capital structures.",
  },
  OFF_BALANCE_SHEET: {
    label: "Off-balance-sheet",
    definition:
      "Obligations that don't appear on the balance sheet — operating leases (pre-2019), purchase commitments, JV liabilities. Important when sizing real economic leverage.",
  },
  PREFERRED_STOCK: {
    label: "Preferred stock",
    definition:
      "A class of equity that ranks above common shares for dividends and liquidation but typically lacks voting rights. Treated as debt-like in enterprise value calculations.",
  },

  // ── Share metrics ──
  DILUTED_SHARES: {
    label: "Diluted shares",
    definition:
      "Total shares outstanding plus all shares that could exist from options, warrants, and convertibles. The honest denominator for per-share calculations.",
    aliases: ["diluted share count"],
  },
  FLOAT: {
    label: "Float",
    definition:
      "Shares actually available for public trading — total shares minus insider and locked-up holdings. Low float can cause volatile price moves on modest volume.",
  },
  SHORT_INTEREST: {
    label: "Short interest",
    definition:
      "The percentage of float sold short by investors betting on a price decline. High short interest can mean elevated risk perception — or a setup for a squeeze.",
  },
  BUYBACK: {
    label: "Buyback",
    definition:
      "When a company repurchases its own shares, reducing share count and boosting per-share metrics. Value-creating when shares are undervalued; destructive when funded by debt at a peak.",
    aliases: ["share buyback", "share repurchase"],
  },
  DIVIDEND: {
    label: "Dividend",
    definition:
      "Cash distribution to shareholders, typically quarterly. A signal of management's confidence in recurring cash flow — and a return component for income-oriented investors.",
  },
  DIVIDEND_YIELD: {
    label: "Dividend yield",
    definition:
      "Annual dividend divided by stock price, as a percentage. Compares directly to bond yields; very high yields often signal the market expects a cut.",
  },
  DILUTION: {
    label: "Dilution",
    definition:
      "Each existing shareholder's stake shrinks when the company issues new shares. A real cost — even when funded by SBC rather than cash.",
  },
  INSIDER_BUYING: {
    label: "Insider buying",
    definition:
      "Open-market purchases by company executives or directors. A bullish signal when concentrated and at-risk capital; less meaningful when it's mechanical RSU acquisitions.",
  },

  // ── Cost of capital ──
  WACC: {
    label: "WACC",
    definition:
      "Weighted Average Cost of Capital. The blended rate a company pays for its debt and equity financing. Used as the discount rate in DCF valuations.",
    aliases: ["weighted average cost of capital"],
  },
  COST_OF_EQUITY: {
    label: "Cost of equity",
    definition:
      "The return shareholders require to hold the stock, given its risk. Risk-free rate plus beta times the equity risk premium. Higher for riskier businesses.",
  },
  COST_OF_DEBT: {
    label: "Cost of debt",
    definition:
      "The after-tax interest rate a company pays on its borrowings. Lower than cost of equity because interest is tax-deductible.",
  },
  RISK_FREE_RATE: {
    label: "Risk-free rate",
    definition:
      "The return on the safest available asset — typically the 10-year US Treasury yield. The floor under every other required return.",
  },
  TREASURY_YIELD: {
    label: "Treasury yield",
    definition:
      "The interest rate paid by US government bonds. The 10-year yield is the benchmark used in most cost-of-capital calculations and as the practical risk-free rate.",
  },
  ERP: {
    label: "ERP",
    definition:
      "Equity Risk Premium. The extra return investors demand for holding stocks instead of risk-free Treasuries. Typically 4.5%–5.5% in current Damodaran estimates.",
    aliases: ["equity risk premium"],
  },
  BETA: {
    label: "Beta",
    definition:
      "A measure of how much a stock moves relative to the overall market. Beta of 1 moves with the index; 1.5 moves 50% more; 0.5 moves half as much.",
  },
  DISCOUNT_RATE: {
    label: "Discount rate",
    definition:
      "The interest rate used to bring future cash flows back to today's dollars in a DCF. Usually equal to WACC. Small changes in the discount rate massively change valuation.",
  },

  // ── Moat and quality ──
  MOAT: {
    label: "Moat",
    definition:
      "Buffett's metaphor for a durable competitive advantage that protects a business from competitors. The deeper and more durable, the longer high returns on capital can persist.",
    aliases: ["economic moat", "competitive moat"],
  },
  SWITCHING_COSTS: {
    label: "Switching costs",
    definition:
      "The hassle, money, or risk of moving to a competitor. High switching costs lock in customers and let businesses raise prices without losing them. A classic moat type.",
  },
  NETWORK_EFFECTS: {
    label: "Network effects",
    definition:
      "When a product gets more valuable as more people use it — like social platforms, payment networks, or marketplaces. Self-reinforcing and very hard to displace once established.",
  },
  COST_LEADERSHIP: {
    label: "Cost leadership",
    definition:
      "A structural cost advantage — usually from scale, geography, or process — that lets a business undercut rivals while still earning a return. Walmart and Costco are textbook examples.",
  },
  PRICING_POWER: {
    label: "Pricing power",
    definition:
      "The ability to raise prices without losing customers. The clearest revealed evidence of a moat — visible in expanding gross margins despite cost inflation.",
  },
  INTANGIBLE_ASSETS: {
    label: "Intangible assets",
    definition:
      "Non-physical assets like brands, patents, regulatory licences, or proprietary data. Often the source of the most durable competitive advantages.",
  },

  // ── Macro and cycle ──
  MACRO: {
    label: "Macro",
    definition:
      "Big-picture economic factors — interest rates, inflation, GDP growth, currency moves — that affect all stocks regardless of company-specific fundamentals.",
    aliases: ["macroeconomic"],
  },
  LIQUIDITY: {
    label: "Liquidity",
    definition:
      "How easily an asset can be converted to cash without affecting its price — and at the macro level, how much money is sloshing through the financial system. Tightening liquidity tends to compress asset prices broadly.",
  },
  REINVESTMENT_RUNWAY: {
    label: "Reinvestment runway",
    definition:
      "How long a business can keep redeploying earnings at high returns on capital. The longer the runway, the more powerful the compounding — Chuck Akre's three-legged stool framework.",
  },
  COMPOUNDING: {
    label: "Compounding",
    definition:
      "When returns themselves earn returns — the same dynamic that makes savings accounts grow exponentially. In equities, businesses that reinvest at high ROIC compound shareholder value the same way.",
  },
  OPERATING_LEVERAGE: {
    label: "Operating leverage",
    definition:
      "When revenue grows faster than fixed costs, so each incremental dollar of sales drops more profit. Measured as the gap between revenue growth and operating-income growth.",
  },
  CAPITAL_EXPENDITURE: {
    label: "Capital expenditure",
    definition:
      "Cash spent on long-lived assets — factories, equipment, data centres. Subtracted from operating cash flow to get free cash flow. The non-discretionary cost of staying in business.",
    aliases: ["capex", "CapEx"],
  },
  RUNWAY: {
    label: "Runway",
    definition:
      "How many months a cash-burning company can keep operating before running out of money. Cash divided by monthly burn rate. Under 18 months tends to force a dilutive raise.",
  },

  // ── Frameworks and behavioural ──
  FORENSIC_ACCOUNTING: {
    label: "Forensic accounting",
    definition:
      "Scrutinising financial statements for signs of manipulation, aggressive revenue recognition, or hidden liabilities — the kind of issues that often precede accounting scandals.",
  },
  MARGIN_OF_SAFETY: {
    label: "Margin of safety",
    definition:
      "Benjamin Graham's foundational concept: buy below intrinsic value by enough that even being wrong leaves room to break even. The cushion that protects against unknown errors.",
  },
  FOOTBALL_FIELD: {
    label: "Football field",
    definition:
      "An institutional valuation chart showing the range of values implied by different methods — DCF, comps, precedent transactions, asset floor. Where the ranges overlap is the consensus zone.",
  },
  SCUTTLEBUTT: {
    label: "Scuttlebutt",
    definition:
      "Philip Fisher's qualitative-research method: talk to customers, ex-employees, suppliers, and competitors to verify what a company says about itself. Pre-internet primary research.",
  },
  CANSLIM: {
    label: "CANSLIM",
    definition:
      "William O'Neil's growth-stock screen: Current earnings, Annual growth, New product/management, Supply/demand, Leader/laggard, Institutional sponsorship, Market direction.",
  },
  DHANDHO: {
    label: "Dhandho",
    definition:
      "Mohnish Pabrai's framework: \"Heads I win, tails I don't lose much.\" Concentrate on asymmetric bets with limited downside, even if the upside isn't certain.",
  },
  SPAWNER: {
    label: "Spawner",
    definition:
      "Pabrai's term for businesses that can incubate adjacent business units cheaply — Amazon launching AWS, Apple launching services. Optionality you don't pay for in the current price.",
  },
  INVERSION: {
    label: "Inversion",
    definition:
      "Charlie Munger's mental model: instead of asking how to succeed, ask what would cause failure and avoid it. The pre-mortem is the practical application.",
  },
  PRE_MORTEM: {
    label: "Pre-mortem",
    definition:
      "Imagining the investment has already failed and reasoning backward to identify the most likely cause. The discipline that forces you to confront downside scenarios specifically, not in the abstract.",
    aliases: ["premortem", "pre-mortem analysis"],
  },
  SECOND_LEVEL_THINKING: {
    label: "Second-level thinking",
    definition:
      "Howard Marks's framework: don't just ask whether the company is good, ask whether the market has already priced in everything you know. Edge comes from holding a different view, not the same one as the consensus.",
  },
  VARIANT_PERCEPTION: {
    label: "Variant perception",
    definition:
      "A view of a stock that differs meaningfully from the market consensus, supported by evidence the market is missing or underweighting. The source of excess returns.",
  },
  ASYMMETRIC_BET: {
    label: "Asymmetric bet",
    definition:
      "A position where the potential upside is larger than the potential downside — ideally several times larger. The structural shape of a good investment, regardless of probability.",
  },
  POSITION_SIZING: {
    label: "Position sizing",
    definition:
      "How much of a portfolio to allocate to a single idea. Conviction without sizing discipline is a recipe for ruin; sizing without conviction leaves returns on the table.",
  },

  // ── Stock classifications ──
  FAST_GROWER: {
    label: "Fast Grower",
    definition:
      "Peter Lynch's classification for companies growing earnings 20%+ annually. The riskiest, most rewarding category — high multiples, high expectations, narrow margin for execution error.",
  },
  STALWART: {
    label: "Stalwart",
    definition:
      "Lynch's term for large, established companies growing 10%–15%. Steady compounders you buy for defensive growth — Coca-Cola, Johnson & Johnson types.",
  },
  SLOW_GROWER: {
    label: "Slow Grower",
    definition:
      "Lynch's category for mature businesses growing in line with GDP. Usually held for dividends rather than capital appreciation. Utilities are the archetype.",
  },
  CYCLICAL: {
    label: "Cyclical",
    definition:
      "A business whose results swing dramatically with the economic cycle — autos, steel, semiconductors. Buy near the bottom of the cycle, not at peak earnings.",
  },
  TURNAROUND: {
    label: "Turnaround",
    definition:
      "A struggling business management is trying to fix. Lynch's highest-risk category — most don't work, but the ones that do can multiply.",
  },
  ASSET_PLAY: {
    label: "Asset Play",
    definition:
      "A stock trading below the value of its underlying assets — real estate, cash, equity stakes in other businesses. Lynch's deep-value category.",
  },

  // ── Catalysts and triggers ──
  CATALYST: {
    label: "Catalyst",
    definition:
      "An identifiable upcoming event — earnings, product launch, regulatory decision, capital allocation announcement — that could meaningfully move the stock either way.",
  },
  TRIGGER: {
    label: "Invalidation trigger",
    definition:
      "A specific, measurable threshold that, if crossed, would prove an investment thesis wrong. Set in advance to prevent rationalisation after the fact.",
    aliases: ["invalidation"],
  },
  THESIS: {
    label: "Thesis",
    definition:
      "The specific, falsifiable reason for owning a stock. A good thesis can be stated in a sentence and tested against future evidence; a bad thesis is vibes.",
  },
  BULL_CASE: {
    label: "Bull case",
    definition:
      "The plausibly optimistic scenario, with specific assumptions about growth, margins, and multiple. Not the maximum-possible price — the realistic upper end of a probability cone.",
  },
  BEAR_CASE: {
    label: "Bear case",
    definition:
      "The plausibly pessimistic scenario, with specific assumptions. Not the worst conceivable outcome — the realistic lower end of a probability cone.",
  },
  BASE_CASE: {
    label: "Base case",
    definition:
      "The central probability-weighted scenario, sitting between bull and bear cases. The number that anchors a fair-value estimate.",
  },

  // ── Filings and disclosure ──
  TEN_Q: {
    label: "10-Q",
    definition:
      "The unaudited quarterly financial report US public companies file with the SEC. Less comprehensive than the annual 10-K but timely — the primary source for current-quarter analysis.",
    aliases: ["10Q", "Form 10-Q"],
  },
  TEN_K: {
    label: "10-K",
    definition:
      "The audited annual report US public companies file with the SEC. Includes full financial statements, risk factors, management discussion, and business description. The most thorough single document on a company.",
    aliases: ["10K", "Form 10-K"],
  },
  EIGHT_K: {
    label: "8-K",
    definition:
      "An ad-hoc SEC filing for material events between regular reports — executive changes, acquisitions, earnings releases, debt issuances. Where investors find out important news in real time.",
    aliases: ["8K", "Form 8-K"],
  },
  SEC_EDGAR: {
    label: "SEC EDGAR",
    definition:
      "The Securities and Exchange Commission's free public database of all corporate filings. The authoritative source — every 10-Q, 10-K, and 8-K is searchable there.",
    aliases: ["EDGAR"],
  },
  FORWARD_GUIDANCE: {
    label: "Forward guidance",
    definition:
      "Management's stated expectations for future revenue, margins, or earnings. Often given quarterly. Beating or missing guidance is what drives most post-earnings moves.",
    aliases: ["guidance"],
  },
  CONSENSUS_ESTIMATE: {
    label: "Consensus estimate",
    definition:
      "The average forecast across Wall Street analysts covering a stock. Stocks tend to react to results relative to consensus, not absolute numbers.",
    aliases: ["consensus"],
  },
  BEAT_MISS: {
    label: "Beat / miss",
    definition:
      "Reporting results above (beat) or below (miss) consensus estimates. A small beat is the modal outcome; the magnitude and quality of the beat matter more than the binary.",
  },

  // ── Market terms ──
  FORWARD_MULTIPLE: {
    label: "Forward multiple",
    definition:
      "A valuation multiple using next twelve months' expected earnings or revenue, rather than trailing. Reflects what the market is pricing in for the future.",
  },
  MULTIPLE_EXPANSION: {
    label: "Multiple expansion",
    definition:
      "When a stock's P/E or EV/EBITDA rises without earnings growing — the market is willing to pay more for the same fundamentals. Often the largest component of long-term returns.",
  },
  MULTIPLE_COMPRESSION: {
    label: "Multiple compression",
    definition:
      "The opposite of expansion: the market pays less for the same earnings, usually because growth expectations fell or interest rates rose. The hidden risk in any growth stock.",
  },
  YIELD: {
    label: "Yield",
    definition:
      "The return on an investment expressed as a percentage of its current price. Used for bonds, dividends, earnings, and free cash flow — directly comparable across asset classes.",
  },
  SPREAD: {
    label: "Spread",
    definition:
      "The difference between two rates or prices — for example, the gap between a bond yield and the risk-free Treasury yield. A measure of relative risk pricing.",
  },
  TTM: {
    label: "TTM",
    definition:
      "Trailing Twelve Months. The most recent four quarters summed — used to express financial metrics over a complete year regardless of fiscal calendar.",
    aliases: ["trailing twelve months", "LTM", "last twelve months"],
  },
  YTD: {
    label: "YTD",
    definition:
      "Year-to-Date. Performance or financials accumulated from January 1 (or fiscal year start) to the current date.",
    aliases: ["year-to-date"],
  },
  VALUE_TRAP: {
    label: "Value trap",
    definition:
      "A stock that looks statistically cheap but stays cheap because the underlying business is structurally impaired. The hardest mistake for value investors to avoid.",
  },
  DEEP_VALUE: {
    label: "Deep value",
    definition:
      "Investing in stocks trading at large discounts to tangible book value or net cash — Benjamin Graham's territory. High statistical edge, often involving uncomfortable narratives.",
  },
  SPECULATIVE: {
    label: "Speculative",
    definition:
      "An investment where the outcome depends on a low-probability scenario playing out. Not inherently bad — but sized as such, and acknowledged as such.",
  },
};

// Build a regex-ready list, longest surface forms first so "Growth Scout"
// is matched before "Growth".
export function getMatcherEntries(): Array<{ key: string; surface: string }> {
  const out: Array<{ key: string; surface: string }> = [];
  for (const [key, entry] of Object.entries(GLOSSARY)) {
    out.push({ key, surface: entry.label });
    for (const a of entry.aliases ?? []) out.push({ key, surface: a });
  }
  out.sort((a, b) => b.surface.length - a.surface.length);
  return out;
}
