import { useState, useEffect, useRef, useCallback } from "react";

const TICKER_ITEMS = [
  "G7 leaders convene emergency summit on AI governance frameworks",
  "TSMC announces $40B fab expansion in Arizona amid chip supply concerns",
  "NATO allies debate Article 5 triggers in cyberspace",
  "India-China border talks resume after 18-month hiatus",
  "OpenAI regulatory probe launched by EU competition authority",
  "Global markets rattled as Fed signals prolonged high-rate environment",
  "Undersea cable sabotage disrupts internet across Southeast Asia",
];

const INITIAL_STORIES = {
  featured: [
    { id: 1, cat: "Geopolitics", tag: "BREAKING", title: "US-China Semiconductor Restrictions Escalate Into Full Export Control War", summary: "Washington expands chip curbs to 40 new Chinese entities; Beijing retaliates with rare earth export limits.", source: "Financial Times", time: "2h ago" },
    { id: 2, cat: "IT", tag: "ANALYSIS", title: "Quantum Computing Hits a Critical Milestone — And Defence Agencies Are Watching", summary: "IBM's 1,000-qubit processor cracks a previously unsolvable logistics problem, raising encryption alarm bells.", source: "Wired", time: "4h ago" },
    { id: 3, cat: "World", tag: "DEVELOPING", title: "UN Security Council Deadlocks Over New Peacekeeping Mandate in Sub-Saharan Africa", summary: "Russia and China veto a Western-backed resolution as violence surges in three nations simultaneously.", source: "Reuters", time: "6h ago" },
  ],
  IT: [
    { id: 4, title: "Apple's AI Chip Division Poaches 60 Engineers From Intel's Dissolved Foundry Unit", source: "The Verge", time: "1h ago" },
    { id: 5, title: "EU's AI Act Compliance Deadline Triggers Mass Model Withdrawals From European Market", source: "Ars Technica", time: "3h ago" },
    { id: 6, title: "Starlink Gen 3 Satellites Promise 10 Gbps Throughput — Analysts Are Skeptical", source: "MIT Tech Review", time: "5h ago" },
    { id: 7, title: "Global Ransomware Attacks Up 42% Year-on-Year; Critical Infrastructure Most Targeted", source: "Cybersecurity Insider", time: "7h ago" },
  ],
  Geopolitics: [
    { id: 8, title: "India Formally Joins AUKUS as Associate Partner, Reshaping Indo-Pacific Balance", source: "The Economist", time: "2h ago" },
    { id: 9, title: "Turkish Elections Upend NATO Calculus as Opposition Gains Ground in Istanbul", source: "Foreign Policy", time: "4h ago" },
    { id: 10, title: "Gulf States Eye Dual-Track Diplomacy With Iran and Israel Simultaneously", source: "Al Jazeera", time: "6h ago" },
    { id: 11, title: "Wagner Group Splinter Factions Emerge as New Destabilising Force in Sahel", source: "BBC World", time: "8h ago" },
  ],
  World: [
    { id: 12, title: "Pacific Ocean Heatwave Declared Worst in Recorded History; Coral Bleaching Catastrophic", source: "Nature", time: "1h ago" },
    { id: 13, title: "Global Wheat Futures Surge 18% as Black Sea Grain Deal Collapses Again", source: "Bloomberg", time: "3h ago" },
    { id: 14, title: "WHO Declares Mpox Variant Clade Ib a Public Health Emergency of International Concern", source: "The Lancet", time: "5h ago" },
    { id: 15, title: "Chile's Lithium Nationalisation Sparks Investor Exodus; EV Supply Chain at Risk", source: "WSJ", time: "7h ago" },
  ],
};

const DETAILS = {
  1: "The escalation marks a dramatic new chapter in the US-China tech rivalry. Washington's Commerce Department added 40 Chinese semiconductor firms to its Entity List, effectively cutting them off from American chip-making tools. Hours later, Beijing announced strict export controls on gallium, germanium, and antimony — rare earth materials essential for manufacturing advanced chips. Industry analysts warn the tit-for-tat measures could disrupt global supply chains for electronics, automobiles, and defence systems. European chip firms, caught in the crossfire, are lobbying Brussels for emergency trade exemptions.",
  2: "IBM's Condor processor, boasting over 1,000 superconducting qubits, has solved a complex military logistics optimisation problem that would take classical supercomputers centuries. While the achievement is a scientific landmark, intelligence agencies are alarmed: current RSA and AES encryption standards could become vulnerable far sooner than predicted. The Pentagon has accelerated its post-quantum cryptography migration timeline, and NATO allies have called an emergency working group. Experts caution that fault-tolerant quantum computing remains years away, but the trajectory is now undeniable.",
  3: "The deadlock at the Security Council leaves over 12 million civilians without access to humanitarian aid corridors. The vetoed resolution, sponsored by France and the UK, sought to authorise a 15,000-strong peacekeeping force across Mali, Burkina Faso, and Niger. Russia argued the resolution was neocolonial in nature, while China cited sovereignty concerns. Meanwhile, armed groups continue to exploit the power vacuum, with UNHCR reporting a 60% surge in displaced populations this quarter alone. The African Union has proposed an alternative framework, but funding remains uncertain.",
  4: "Apple's aggressive hiring spree signals its determination to build custom AI silicon entirely in-house. The 60 engineers, many of whom were senior architects at Intel's now-shuttered IFS division, specialise in advanced packaging and chiplet design. Apple's AI chip division, codenamed 'Acadia', is reportedly developing a server-grade processor to power its on-device and cloud AI services. The move further isolates Intel, which has struggled to compete since losing its manufacturing edge. TSMC remains Apple's primary fabrication partner for these next-generation designs.",
  5: "As the EU's AI Act enters its enforcement phase, several major AI companies have chosen to withdraw models from the European market rather than comply with stringent transparency and risk-assessment requirements. Companies affected include mid-tier LLM providers and computer vision firms that cite prohibitive compliance costs. The European Commission maintains the regulations are necessary to protect citizens from algorithmic harms. Critics argue the rules will stifle innovation and push AI development to less regulated jurisdictions in Asia and the Middle East.",
  6: "SpaceX's third-generation Starlink constellation promises revolutionary bandwidth of up to 10 Gbps per terminal, leveraging inter-satellite laser links and advanced beamforming technology. However, independent analysts question whether the system can deliver these speeds at scale, citing orbital congestion and spectrum-sharing challenges. Competitors like Amazon's Project Kuiper and the EU's IRIS² programme are also racing to deploy next-gen broadband constellations. Rural and maritime connectivity markets stand to benefit the most if the technology delivers on its promises.",
  7: "A comprehensive report from cybersecurity firms reveals that ransomware attacks against critical infrastructure — including hospitals, power grids, and water treatment facilities — rose 42% compared to the previous year. State-affiliated hacking groups from Russia, North Korea, and Iran are identified as primary perpetrators. The average ransom demand has increased to $2.1 million, with healthcare and energy sectors paying the highest premiums. Governments are responding with new mandatory reporting laws, but experts argue that international cooperation remains inadequate to deter sophisticated threat actors.",
  8: "India's accession to AUKUS as an associate partner marks a historic shift in its foreign policy, moving away from decades of strategic non-alignment. Under the agreement, India gains access to advanced submarine technology, AI-driven defence systems, and quantum-encrypted communications. The move has been welcomed by Washington, London, and Canberra, but has drawn sharp criticism from Beijing, which views it as a further attempt at encirclement. Indian defence analysts argue the partnership is essential to counter China's rapidly expanding naval presence in the Indian Ocean.",
  9: "Turkey's municipal elections have delivered a seismic shock to President Erdogan's ruling AKP party, with opposition candidates sweeping key cities including Istanbul, Ankara, and Izmir. The results raise fundamental questions about NATO's eastern flank, as the opposition has signalled a more conciliatory approach toward EU membership and a firmer stance on democratic reforms. Western diplomats are cautiously optimistic, while analysts warn that Erdogan retains significant power through the presidency and could attempt constitutional manoeuvres to blunt the electoral setback.",
  10: "In a remarkable diplomatic pivot, Saudi Arabia, the UAE, and Bahrain are simultaneously engaging in normalisation talks with Israel while deepening energy and trade partnerships with Iran. The dual-track approach reflects the Gulf states' pragmatic calculation that regional stability requires engagement with all major powers. Washington has privately expressed concern that the Iran track could undermine its maximum-pressure sanctions strategy. Tehran, for its part, views the Gulf outreach as validation of its regional influence following the 2023 Saudi-Iran rapprochement brokered by China.",
  11: "Following the fragmentation of Russia's Wagner Group, at least three splinter factions have established independent operations across Mali, Burkina Faso, and Niger, each aligned with different local power brokers and foreign patrons. These groups retain Wagner's military capabilities but lack centralised command, making them unpredictable and dangerous. French intelligence reports indicate that one faction has begun offering mercenary services to mining companies in exchange for resource concessions. The Sahel's civilian population bears the brunt, with human rights organisations documenting a surge in extrajudicial killings.",
  12: "Marine scientists report that the Pacific Ocean is experiencing its most severe heatwave since records began in 1900, with sea surface temperatures exceeding the previous record by 1.2°C. The consequences are catastrophic: the Great Barrier Reef has suffered its worst bleaching event, with 78% of surveyed reefs affected. Fisheries across the Pacific Islands face collapse, threatening food security for millions. Climate models suggest the heatwave is amplified by a strong El Niño interacting with long-term ocean warming driven by greenhouse gas emissions.",
  13: "The collapse of the Black Sea Grain Initiative has sent shockwaves through global food markets, with wheat futures surging 18% in a single trading session. Russia withdrew from the deal citing unmet demands on fertiliser exports and banking access. Ukraine, one of the world's largest grain exporters, faces a logistical nightmare as its ports remain under blockade. African and Middle Eastern nations, which depend heavily on Ukrainian wheat, are scrambling to secure alternative supplies. The World Food Programme warns of potential famine conditions in East Africa by Q3.",
  14: "The World Health Organisation has declared the Clade Ib variant of mpox a Public Health Emergency of International Concern, citing its rapid spread across Central and East Africa and early cases detected in Europe and Asia. The variant demonstrates higher transmissibility and severity than previous strains. Vaccine supplies remain woefully inadequate in affected African nations, with the WHO calling for emergency donations from wealthy countries. Public health experts emphasise that early containment measures and equitable vaccine distribution are critical to preventing a global outbreak.",
  15: "Chile's decision to nationalise its lithium industry has triggered a sharp investor backlash, with foreign mining companies pulling an estimated $8 billion in planned investments. The government argues that state control is necessary to ensure environmental protections and equitable distribution of profits from the strategic mineral. However, the move has raised alarm in the EV supply chain, as Chile holds the world's largest lithium reserves. Automakers in Europe and the US are accelerating efforts to diversify supply sources, with Australia and Argentina emerging as key alternatives.",
};

const SOURCES = ["Reuters", "Financial Times", "Wired", "The Economist", "Foreign Policy", "Ars Technica", "Bloomberg", "BBC World", "MIT Tech Review", "Al Jazeera"];

function Ticker() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0, raf;
    const animate = () => {
      x -= 0.5;
      if (Math.abs(x) > el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background: "#1a1a1a", overflow: "hidden", whiteSpace: "nowrap", padding: "10px 0", borderBottom: "2px solid #333" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ background: "#8b0000", color: "#f5f0e8", fontSize: 13, fontWeight: 700, letterSpacing: 1.5, padding: "4px 16px", marginRight: 18, flexShrink: 0, fontFamily: "'Georgia', serif" }}>BULLETIN</span>
        <div style={{ overflow: "hidden", flex: 1 }}>
          <div ref={ref} style={{ display: "inline-flex", gap: 50, willChange: "transform" }}>
            {items.map((t, i) => (
              <span key={i} style={{ fontSize: 15, color: "#ddd", fontFamily: "'Georgia', serif", fontStyle: "italic" }}>{"\u2014 " + t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ArticleDetail({ story, onBack }) {
  const detail = DETAILS[story.id] || story.summary || "Full article content is being prepared by our editorial team.";
  return (
    <div style={{ padding: "30px 40px", maxWidth: 760, margin: "0 auto" }}>
      <button onClick={onBack} style={{ fontSize: 14, background: "none", border: "none", color: "#8b0000", cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 700, marginBottom: 20, padding: 0 }}>{"\u2190 Back to headlines"}</button>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
        {story.tag && <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: "#8b0000", textTransform: "uppercase", fontFamily: "'Georgia', serif" }}>{story.tag}</span>}
        <span style={{ fontSize: 12, letterSpacing: 1.5, color: "#888", textTransform: "uppercase" }}>{story.cat}</span>
      </div>
      <h1 style={{ margin: "0 0 16px", fontSize: 34, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.2, fontFamily: "'Playfair Display', 'Georgia', serif" }}>{story.title}</h1>
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 24 }}>
        <span style={{ fontSize: 14, color: "#8b0000", fontWeight: 700, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>{story.source}</span>
        <span style={{ fontSize: 13, color: "#999" }}>{story.time}</span>
      </div>
      {story.summary && <p style={{ margin: "0 0 20px", fontSize: 19, color: "#333", lineHeight: 1.6, fontWeight: 700, fontFamily: "'Georgia', serif", fontStyle: "italic", borderLeft: "4px solid #8b0000", paddingLeft: 18 }}>{story.summary}</p>}
      <div style={{ fontSize: 18, color: "#222", lineHeight: 1.85, fontFamily: "'Georgia', serif" }}>
        {detail.split(". ").reduce((acc, sentence, i, arr) => {
          if (i === 0) return [sentence + (arr.length > 1 ? ". " : "")];
          if (i % 3 === 0) acc.push(<br key={"br"+i}/>, <br key={"br2"+i}/>);
          acc.push(sentence + (i < arr.length - 1 ? ". " : ""));
          return acc;
        }, [])}
      </div>
    </div>
  );
}

function FeaturedMain({ story, onClick }) {
  return (
    <div onClick={() => onClick(story)} style={{ borderRight: "1px solid #ccc", paddingRight: 28, cursor: "pointer" }}>
      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, color: "#8b0000", fontFamily: "'Georgia', serif", textTransform: "uppercase" }}>{story.tag} — {story.cat}</span>
      <h2 style={{ margin: "10px 0 14px", fontSize: 28, fontWeight: 900, color: "#1a1a1a", lineHeight: 1.25, fontFamily: "'Playfair Display', 'Georgia', serif" }}>{story.title}</h2>
      <p style={{ margin: "0 0 14px", fontSize: 17, color: "#444", lineHeight: 1.7, fontFamily: "'Georgia', serif" }}>{story.summary}</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 14, color: "#8b0000", fontWeight: 700, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>{story.source}</span>
        <span style={{ fontSize: 13, color: "#999" }}>{story.time}</span>
      </div>
    </div>
  );
}

function FeaturedSide({ story, onClick }) {
  return (
    <div onClick={() => onClick(story)} style={{ borderBottom: "1px solid #ddd", paddingBottom: 18, marginBottom: 18, cursor: "pointer", display: "flex", gap: 16 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: "#8b0000", fontFamily: "'Georgia', serif", textTransform: "uppercase" }}>{story.tag}</span>
        <h3 style={{ margin: "6px 0 8px", fontSize: 20, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3, fontFamily: "'Playfair Display', 'Georgia', serif" }}>{story.title}</h3>
        <p style={{ margin: "0 0 8px", fontSize: 15, color: "#555", lineHeight: 1.6, fontFamily: "'Georgia', serif" }}>{story.summary}</p>
        <span style={{ fontSize: 13, color: "#8b0000", fontStyle: "italic", fontFamily: "'Georgia', serif" }}>{story.source} — {story.time}</span>
      </div>
    </div>
  );
}

function HeadlineItem({ story, onClick }) {
  return (
    <div onClick={() => onClick(story)} style={{ borderBottom: "1px solid #e0ddd5", padding: "14px 0", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}
      onMouseEnter={e => e.currentTarget.querySelector(".hl").style.color = "#8b0000"}
      onMouseLeave={e => e.currentTarget.querySelector(".hl").style.color = "#1a1a1a"}>
      <div style={{ flex: 1 }}>
        <p className="hl" style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.4, fontFamily: "'Playfair Display', 'Georgia', serif", transition: "color 0.15s" }}>{story.title}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 13, color: "#8b0000", fontWeight: 600, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>{story.source}</span>
          <span style={{ fontSize: 13, color: "#999" }}>{story.time}</span>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ title, stories, onClick }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ borderBottom: "3px double #1a1a1a", paddingBottom: 6, marginBottom: 6 }}>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", color: "#1a1a1a", fontFamily: "'Playfair Display', 'Georgia', serif" }}>{title}</h3>
      </div>
      {stories.map(s => <HeadlineItem key={s.id} story={s} onClick={onClick} />)}
    </div>
  );
}

export default function GlobalPulse() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [stories, setStories] = useState(INITIAL_STORIES);
  const [loading, setLoading] = useState(false);
  const [tickerKey, setTickerKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [nextRefreshIn, setNextRefreshIn] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const refreshIntervalRef = useRef(null);
  const countdownRef = useRef(null);
  const nextRefreshTimeRef = useRef(null);
  const filters = ["All", "IT", "Geopolitics", "World"];

  const scheduleNextRefresh = useCallback((refreshFn) => {
    if (refreshIntervalRef.current) clearTimeout(refreshIntervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    const delay = (15 + Math.random() * 15) * 60 * 1000;
    nextRefreshTimeRef.current = Date.now() + delay;
    refreshIntervalRef.current = setTimeout(() => { refreshFn(); }, delay);
    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((nextRefreshTimeRef.current - Date.now()) / 1000));
      const m = Math.floor(remaining / 60), s = remaining % 60;
      setNextRefreshIn(`${m}:${s.toString().padStart(2, "0")}`);
      if (remaining === 0) clearInterval(countdownRef.current);
    }, 1000);
  }, []);

  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a global news curator. Generate 3 realistic-sounding (but fictional) breaking news headlines each for IT/Technology, Geopolitics, and World Events. Today is ${new Date().toDateString()}. Respond ONLY with valid JSON, no markdown. Format:
{"IT":[{"title":"...","source":"...","time":"Xh ago"},...],"Geopolitics":[...],"World":[...]}
Sources: Reuters, Financial Times, Wired, The Economist, Bloomberg, Ars Technica, BBC World, Foreign Policy, MIT Tech Review, Al Jazeera, The Verge, WSJ, Nature.`,
          messages: [{ role: "user", content: "Generate fresh global news headlines for today." }]
        })
      });
      const data = await res.json();
      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      const toStories = (arr, cat, startId) => arr.map((s, i) => ({ id: startId + i, title: s.title, source: s.source, time: s.time, cat }));
      setStories(prev => ({
        ...prev,
        IT: toStories(parsed.IT || [], "IT", 100),
        Geopolitics: toStories(parsed.Geopolitics || [], "Geopolitics", 110),
        World: toStories(parsed.World || [], "World", 120),
      }));
      setTickerKey(k => k + 1);
      setLastRefreshed(new Date());
    } catch (e) { console.error(e); }
    setLoading(false);
    scheduleNextRefresh(handleRefresh);
  }, [scheduleNextRefresh]);

  useEffect(() => {
    scheduleNextRefresh(handleRefresh);
    return () => {
      if (refreshIntervalRef.current) clearTimeout(refreshIntervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const openArticle = (story) => { setSelectedArticle(story); window.scrollTo?.(0,0); };
  const visibleSections = activeFilter === "All" ? ["IT", "Geopolitics", "World"] : [activeFilter];
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div style={{ background: "#f5f0e8", minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif", color: "#1a1a1a" }}>

      {/* Masthead */}
      <div style={{ textAlign: "center", padding: "28px 40px 10px", borderBottom: "4px double #1a1a1a" }}>
        <div style={{ fontSize: 13, letterSpacing: 4, textTransform: "uppercase", color: "#888", marginBottom: 6 }}>{dateStr}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 6 }}>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }}></div>
          <h1 style={{ margin: 0, fontSize: 52, fontWeight: 900, letterSpacing: 6, color: "#1a1a1a", fontFamily: "'Playfair Display', 'Georgia', serif", textTransform: "uppercase" }}>Global Pulse</h1>
          <div style={{ flex: 1, height: 1, background: "#1a1a1a" }}></div>
        </div>
        <div style={{ fontSize: 15, fontStyle: "italic", color: "#666", letterSpacing: 1 }}>Intelligence Across Technology, Geopolitics & World Affairs</div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginTop: 12 }}>
          <button onClick={handleRefresh} disabled={loading}
            style={{ fontSize: 14, padding: "9px 22px", background: loading ? "#ddd" : "#8b0000", color: loading ? "#888" : "#f5f0e8", border: "none", borderRadius: 3, cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Georgia', serif", fontWeight: 700, letterSpacing: 1 }}>
            {loading ? "Refreshing\u2026" : "\u21BB  Refresh Edition"}
          </button>
          <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#888" }}>
            <span>Last: {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            {nextRefreshIn && <span>Next: {nextRefreshIn}</span>}
          </div>
        </div>
      </div>

      {/* Ticker */}
      <Ticker key={tickerKey} />

      {/* Article detail view */}
      {selectedArticle ? (
        <ArticleDetail story={selectedArticle} onBack={() => setSelectedArticle(null)} />
      ) : (
        <>
          {/* Nav */}
          <div style={{ borderBottom: "2px solid #ccc", padding: "0 40px", display: "flex", justifyContent: "center", background: "#f5f0e8" }}>
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ fontSize: 14, fontFamily: "'Georgia', serif", letterSpacing: 2, textTransform: "uppercase", padding: "14px 26px", background: "transparent", border: "none", color: activeFilter === f ? "#8b0000" : "#888", borderBottom: activeFilter === f ? "3px solid #8b0000" : "3px solid transparent", cursor: "pointer", fontWeight: activeFilter === f ? 700 : 400 }}>
                {f}
              </button>
            ))}
          </div>

          {/* Featured */}
          {activeFilter === "All" && (
            <div style={{ padding: "30px 40px", borderBottom: "2px solid #ccc" }}>
              <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#888", marginBottom: 16, fontWeight: 700 }}>Top Stories</div>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 28 }}>
                <FeaturedMain story={stories.featured[0]} onClick={openArticle} />
                <div>
                  {stories.featured.slice(1).map(s => <FeaturedSide key={s.id} story={s} onClick={openArticle} />)}
                </div>
              </div>
            </div>
          )}

          {/* Category sections */}
          <div style={{ padding: "30px 40px 10px", display: "grid", gridTemplateColumns: activeFilter === "All" ? "1fr 1fr 1fr" : "1fr", gap: activeFilter === "All" ? 32 : 0 }}>
            {visibleSections.map((cat, i) => (
              <div key={cat} style={{ borderRight: activeFilter === "All" && i < visibleSections.length - 1 ? "1px solid #ccc" : "none", paddingRight: activeFilter === "All" && i < visibleSections.length - 1 ? 28 : 0 }}>
                <CategorySection title={cat === "IT" ? "Technology & IT" : cat} stories={stories[cat]} onClick={openArticle} />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Sources */}
      <div style={{ borderTop: "2px solid #ccc", padding: "16px 40px", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 12, letterSpacing: 2, color: "#888", textTransform: "uppercase", fontWeight: 700 }}>Sources</span>
        {SOURCES.map((s, i) => (
          <span key={s} style={{ fontSize: 14, color: "#666", fontStyle: "italic" }}>{s}{i < SOURCES.length - 1 ? " \u00b7" : ""}</span>
        ))}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "4px double #1a1a1a", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: "#1a1a1a", letterSpacing: 3, textTransform: "uppercase", fontFamily: "'Playfair Display', 'Georgia', serif" }}>Global Pulse</span>
        <span style={{ fontSize: 14, fontStyle: "italic", color: "#888" }}>Curated intelligence, delivered</span>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Your email" style={{ fontSize: 14, padding: "9px 14px", background: "#fff", border: "1px solid #ccc", borderRadius: 3, color: "#333", width: 190, fontFamily: "'Georgia', serif" }} />
          <button style={{ fontSize: 14, padding: "9px 18px", background: "#8b0000", border: "none", color: "#f5f0e8", borderRadius: 3, cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 700 }}>Subscribe</button>
        </div>
      </div>
    </div>
  );
}
