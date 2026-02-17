# CoAssure — Niche Market Strategy & Staged Product Plan

## The Problem We Solve

Safety on site has become administrative theatre. Workers fill out Take 5s automatically, copy previous answers, and treat forms as obstacles. Management gets documentation that provides a false sense of assurance but lacks genuine safety intelligence.

The gap: **there is no intelligent, contextual, conversational safety partner at the point of risk.**

Remote and lone workers are the most exposed. The technician in the van who hasn't spoken to anyone all day, who rushes through a checklist and starts a job without really switching their brain on — that person has zero support at the moment it matters most.

---

## What We Are Building

**CoAssure is a voice-first Safety Sounding Board for field workers.**

It is not a compliance tool. It is not a form filler. It is a conversational companion that ensures workers are mentally engaged with the hazards in front of them — before they touch the tools.

**The psychological hook:** When you speak your plan out loud, you find the holes in it. This is the "rubber ducking" effect applied to safety.

**The organisational hook:** The company defines the standards, procedures, and priorities. The AI translates those into natural conversation — not interrogation, not checklists.

---

## The Niche

### Target Market

**Field service fleets and remote/lone workers in trades and infrastructure:**

- HVAC technicians
- Electricians and plumbers on service calls
- Utility crews (water, gas, power)
- Elevator and escalator maintenance
- Rural surveyors and agronomists
- Telecommunications installers
- Sub-contractors working across multiple client sites

### Why This Niche

1. **High isolation, low supervision.** These workers operate alone or in small teams, far from a supervisor. Nobody is checking their thinking.
2. **High form fatigue.** They complete the same Take 5 or JSA every single day. The paperwork has become muscle memory, not risk assessment.
3. **High mobility.** They drive between sites constantly. The commute is dead time that could be used for mental preparation.
4. **High sub-contractor density.** Many of these workers are subbies moving between client sites, each with different safety requirements. They are the hardest cohort for clients to manage.
5. **Practical technology fit.** These workers already carry smartphones. They already use voice notes (WhatsApp, iMessage). The behaviour is natural.

### The Buyer

| Role | What They Care About | Our Pitch |
|---|---|---|
| **HSE Manager** | "Are my remote guys actually thinking, or just ticking boxes?" | "This app forces 60 seconds of real cognitive engagement before every job." |
| **Operations Director** | "I need assurance without more admin overhead." | "You get a live feed of what your teams are facing in the field — hazards, conditions, decisions — without adding a single form." |
| **Insurance / Risk Manager** | "How do we prove due diligence?" | "Every session is a timestamped, geo-tagged, weather-contextualised record of the worker actively assessing risk." |
| **Sub-contractor (Self)** | "I need to get through the client's paperwork fast." | "Talk for 30 seconds. Paste the summary into whatever form they gave you. Done." |

---

## The Core Experience

### The Three Touchpoints

CoAssure fits into the natural rhythm of a field worker's day:

**1. The Commute (Mental Rehearsal)**
The worker is driving to a job. They press the big mic button (or use hands-free).

> **Worker:** "Heading to 14 George Street. Replacing a switchboard. Client is ABC Electrical. Should be straightforward but it's been raining."

> **CoAssure:** "Got it. Rain means potential water ingress around the board. Have you got your insulation testing gear? And confirm — is the isolation already done, or are you doing it on arrival?"

The system already knows: the weather (pulled from BOM), the location, and the company's "Golden Rule" that all electrical work requires verified isolation.

**2. The Toolbox Talk (Connection to HQ)**
Before the worker starts, they get a 60-second voice briefing from their manager or safety team — like a voicemail, not a document.

> **Manager (recorded earlier):** "Hey team, heads up — we've had two near-misses with hydraulic hose failures this week. If you're on any hydraulic gear today, do a visual check of the hoses before you pressurise."

The worker listens and voice-confirms: "Heard." Compliance is recorded.

**3. The Reflection (Close-Out)**
Job done. On the drive home or before leaving site, the worker hits "Reflect."

> **Worker:** "Job went fine. One thing — the switchboard enclosure had some corrosion I wasn't expecting. Took a photo. Might need a follow-up."

This becomes a log entry, a maintenance flag, and a data point for the organisation.

---

## The Intelligence Engine

CoAssure does not ask generic questions. It pulls in as much context as possible to make every conversation relevant and useful.

### Data Sources

| Source | What It Provides | How It's Used |
|---|---|---|
| **GPS / Location** | Site address, proximity to known hazards | "You're near the rail corridor — reminder about exclusion zones." |
| **Weather API (BOM)** | Temperature, wind, rain, UV | "It's 38°C today. Are you taking regular water breaks?" |
| **Time of Day** | Fatigue patterns, shift timing | "It's Friday 3pm. Statistically the highest-risk window. Stay sharp." |
| **Organisation Standards** | Golden Rules, SOPs, SWMS templates, safety bulletins | "Your company requires atmospheric testing before confined space entry. Have you done that?" |
| **Project Context** | Current phase, active zones, known site conditions | "This site is in demolition phase — watch for falling debris and dust." |
| **Crowd-Sourced Hazard Reports** | Other workers' voice notes from the same location | "Two other workers reported loose gravel on the access road this morning." |
| **Industry Hazard Feeds** | Recent safety alerts, recalls, regulatory updates | "SafeWork issued an alert yesterday about defective harness buckles from Brand X." |

### How Standards Are Applied

The organisation uploads their documents — SOPs, SWMS templates, safety bulletins, incident reports, toolbox talk content. The system indexes and understands them.

When a worker speaks, the AI cross-references what they've said against the organisation's rules. It does not recite policy. It translates policy into natural prompts:

- **Policy says:** "All excavation work requires Dial Before You Dig confirmation."
- **AI says:** "You mentioned trenching — have you got the DBYD clearance for this address?"

The organisation controls what matters. The AI controls how it's asked.

---

## The Sub-Contractor Growth Engine

### The "Viral Loop"

Sub-contractors are simultaneously the hardest cohort to manage and the best channel for organic growth. CoAssure turns this problem into an advantage.

**The Free Version:**

Any worker — employee or subbie — can use CoAssure for free. They get:

- Voice-to-text pre-start recording
- Basic weather and location context
- The "Paste" button (copies a structured summary to clipboard)

**The Viral Hook:**

When a subbie uses CoAssure to complete a client's form (paste into Procore, HammerTech, iAuditor, or even a paper form), the output includes a footer:

> *This safety assessment was conducted using CoAssure. [View full context: weather conditions, location data, risk prompts, and worker responses →]*

The link goes to a branded, read-only page showing:

- Map view of the location at the time of assessment
- Weather snapshot (temperature, wind, rain)
- The full transcript of the safety conversation
- What standards were checked
- What prompts were given and how the worker responded

**What the client sees:**

The site manager reads the subbie's form. They see the CoAssure link. They click it. They see the depth of thinking that went into the assessment — far beyond what a ticked checkbox conveys.

**Their reaction:** "This subbie actually thought about the job. And what is this tool?"

**That is the sales funnel.**

### The "Reverse Entry" Point

This is the second entry point into organisations:

1. A subbie is filling out a client's existing digital form (any platform).
2. At the risk assessment section, instead of typing, they open CoAssure and talk through the plan.
3. CoAssure generates a structured summary with the branded footer.
4. They paste it into the client's form.

The client's safety team starts seeing CoAssure links across multiple sub-contractor submissions. They investigate. They become a paying customer — not because we sold to them, but because their own supply chain demonstrated the value.

---

## The "Guest Pass" for Sites

For sites that want to actively use CoAssure with visiting sub-contractors:

1. A QR code is displayed at the site office or gate.
2. The subbie scans it — no app install required (progressive web app / app clip).
3. The system knows the site context (project phase, active zones, current hazards).
4. The subbie talks through their plan.
5. The AI checks their intent against live site conditions.
6. A notification goes to the site supervisor: "Electrical team active in Zone B. Plan verified."

---

## Feature Set

### For Workers (The App)

| Feature | Description | Value |
|---|---|---|
| **One-Tap Pre-Start** | Press the mic. Talk through the job. Get one or two smart questions back. | Replaces pen-and-paper Take 5 with 30–60 seconds of actual thinking. |
| **The Challenge** | AI asks contextual follow-up questions based on what the worker said, cross-referenced with weather, location, and org standards. | Forces System 2 (deliberate) thinking instead of System 1 (autopilot). |
| **Toolbox Talk Receiver** | Listen to a voice briefing from HQ. Voice-confirm acknowledgement. | Remote workers finally get the morning briefing, even when they're 200km away. |
| **Reflect Button** | Post-job voice note. "Anything unexpected? Any near-misses? Anything to flag?" | Captures the gold that's usually lost on the drive home. |
| **Hazard Voice Note** | Spot something dangerous? Press, speak, snap a photo. GPS-tagged and transcribed. | Faster than typing. Goes straight to the right people. |
| **The Paste Button** | Copies a structured text summary to clipboard for use in any other app or form. | Works with whatever system the client uses. No integration required. |
| **Offline Mode** | Records audio locally when there's no signal. Processes and syncs when connectivity returns. | Works in basements, tunnels, rural areas, underground. |

### For Managers (The Dashboard)

| Feature | Description | Value |
|---|---|---|
| **Standards Library** | Upload Golden Rules, SOPs, SWMS templates, safety bulletins. The AI uses these to guide conversations. | Control what matters without micromanaging how it's asked. |
| **Toolbox Broadcast** | Record a voice note. Push it to the entire fleet or specific teams. Track who listened. | Replace the email nobody reads with a voice message everyone hears. |
| **Live Hazard Feed** | See what workers are reporting in real time — tagged by location, category, severity. | "80% of the team mentioned 'slippery access' this morning — send a crew." |
| **Engagement Metrics** | Track conversation depth, not just completion. Are workers giving real answers or one-word responses? | Move from counting forms to measuring thinking. |
| **Project Context Settings** | Set the current phase, active zones, and known hazards for each site. The AI incorporates this into every conversation. | Site-specific intelligence without site-specific forms. |
| **Sub-Contractor Visibility** | See when subbies use the Guest Pass or reference CoAssure in their submissions. | "I finally know what the subbies are planning before they start." |

### For Organisations (The Control Plane)

| Feature | Description | Value |
|---|---|---|
| **Rules Engine** | Define priorities that the AI weaves into every conversation. "This week, ask everyone about hydration." | Dynamic, responsive safety leadership. |
| **Hazard Heatmap** | Aggregated view of where hazards are being reported across all sites and projects. | Data-driven safety investment. Fix the things that keep coming up. |
| **Weekly Digest** | Auto-generated summary: top hazards, engagement trends, notable voice notes. | Boardroom-ready safety intelligence without manual reporting. |
| **Audit Trail** | Every conversation is timestamped, geo-tagged, weather-stamped, and stored. | Demonstrates "reasonably practicable" steps in any investigation. |
| **Integration Layer** | Push completed records to SharePoint, Procore, SAP, or email. Pull project data in. | Fits into existing systems. Doesn't replace them. |

---

## Staged Rollout Plan

### Stage 1 — "The Smart Voice Note" (Foundation)

**Focus:** Individual value. Make it the fastest, easiest way to record a pre-start assessment.

**What's built:**

- Mobile app (iOS/Android)
- One-tap voice recording with transcription
- Weather integration (BOM API) — automatic context
- Location tagging (GPS address resolution)
- The "Paste" button — copy structured summary to clipboard
- Basic AI summary — organises what the worker said into Hazards / Controls / Notes
- Offline recording with sync-on-connectivity
- The branded footer on all outputs ("Assessed using CoAssure — [View Context]")

**What's NOT built yet:** Org standards, dashboard, sub-contractor portal.

**Target users:** Individual tradies, sole traders, small crews. Free tier.

**Success metric:** Workers voluntarily use it because it's faster than typing.

---

### Stage 2 — "The Active Listener" (Intelligence)

**Focus:** The AI becomes a safety partner, not just a recorder.

**What's added:**

- **The Challenge:** AI asks 1–2 contextual follow-up questions based on task + weather + time of day
- **Toolbox Talk Broadcast:** Managers record and push voice briefings; workers listen and confirm
- **Hazard Voice Note:** Quick hazard report with photo, GPS, and transcription
- **Reflect Button:** Post-job voice note for close-out observations
- **Crowd-sourced hazard context:** "Others reported X at this location recently"
- **Industry hazard feeds:** Recent alerts and bulletins surfaced when relevant

**Target users:** Small-to-medium field service companies. Paid tier (team plans).

**Success metric:** Workers report the AI asked them something they hadn't considered.

---

### Stage 3 — "The Org Brain" (Enterprise Control)

**Focus:** Organisation-controlled standards and visibility.

**What's added:**

- **Standards Library:** Upload SOPs, Golden Rules, SWMS templates. AI cross-references during conversations.
- **Manager Dashboard:** Live hazard feed, engagement metrics, weekly digest
- **Project Context:** Set current phase, active zones, known hazards per site
- **Rules Engine:** "This week, prioritise X across all conversations"
- **Sub-contractor visibility:** See Guest Pass usage and CoAssure-linked form submissions
- **Integration Layer:** Push records to SharePoint / Procore / SAP / email

**Target users:** Mid-to-large organisations with distributed field teams. Enterprise pricing.

**Success metric:** Managers can see what their remote teams are facing in the field — in real time — without adding paperwork.

---

### Stage 4 — "The Ecosystem" (Network Effects)

**Focus:** The sub-contractor viral loop and cross-organisation intelligence.

**What's added:**

- **Guest Pass (QR):** Zero-install web interface for visiting sub-contractors
- **Site Notifications:** "Sparky team active in Zone B. Plan verified."
- **Cross-project hazard intelligence:** Anonymised trends across the platform ("Industry-wide: hand injuries are up 15% this quarter in electrical trades")
- **Predictive prompts:** "Similar jobs at similar sites have had issues with X. Worth checking."
- **Insurance integration:** Package safety data for EMR/premium discussions

**Target users:** Tier 1 contractors, project owners, insurers.

**Success metric:** Organisations adopt CoAssure not because they bought it, but because their sub-contractors brought it to the gate.

---

## Commercial Strategy

### Pricing Model

Avoid per-seat pricing. Field workforces have high turnover and variable headcount.

| Tier | Model | Includes |
|---|---|---|
| **Free** | Individual worker | Voice recording, transcription, weather/location context, paste button with branded footer |
| **Team** | Per active team / month | Everything in Free + AI challenge questions, toolbox broadcasts, hazard notes, reflect, crowd-sourced context |
| **Enterprise** | Per site or per project | Everything in Team + standards library, dashboard, rules engine, integrations, sub-contractor visibility, audit trail |

The free tier is not a limitation — it is the growth engine. Every free user who pastes a CoAssure summary into a client's form is a salesperson.

### The "Land and Expand" Motion

1. **Land:** Individual workers or small crews adopt the free app because it's faster than typing.
2. **Demonstrate:** Their submissions start showing up with CoAssure links in client systems.
3. **Intrigue:** Client safety teams click the links. See the depth of context. Ask "what is this?"
4. **Expand:** Client becomes an Enterprise customer. Rolls out across their own workforce and requires it for sub-contractors.

### The Sales Pitch (By Buyer)

**To the HSE Manager:**
> "Your remote workers are ticking boxes without looking. This app forces them to speak their plan out loud — and the AI challenges them on the things they missed. You get a real-time feed of what they're actually facing in the field."

**To the Operations Director:**
> "Your subbies are a black box. With the Guest Pass, you get a verified record of what every sub-contractor planned to do before they started — without buying them a license."

**To the CFO:**
> "Every session is a timestamped, weather-contextualised record of active risk assessment. That's the evidence your insurer wants to see when you're negotiating premiums."

**To the Worker:**
> "It's 30 seconds of talking instead of 10 minutes of writing. And if something ever goes wrong, you've got proof you did the right thing."

---

## Design Principles

1. **The "Dirty Glove" Test.** If the worker has to take off their gloves to use it, it has failed. Everything must be voice-controllable with minimal screen interaction.

2. **30 Seconds, Not 10 Minutes.** The pre-start conversation should take 30–60 seconds. Not longer. Respect the worker's time.

3. **Challenge, Don't Interrogate.** The AI asks 1–2 pointed questions. It does not run through a 20-item checklist verbally. Quality over quantity.

4. **Empower, Don't Surveil.** This is a tool that protects the worker. It is not a tracking device for management. The tone must always be: "I'm here to help you think" — never "I'm watching you."

5. **Fit In, Don't Replace.** CoAssure works alongside existing systems (Procore, HammerTech, iAuditor, paper forms). It makes the data going into those systems better. It does not demand that organisations rip and replace.

6. **Organisation Sets the Standard, AI Sets the Tone.** The company defines what matters (rules, priorities, hazards). The AI decides how to raise it naturally in conversation. Workers never feel like they're being read a policy document.

7. **Offline is Not an Edge Case.** Many field workers operate in basements, tunnels, rural areas, and underground. Offline must work seamlessly — record locally, process and sync later.

---

## Tone & Voice

The AI must sound like **an experienced, calm tradesperson** — not a corporate compliance officer.

- **Practical.** "Have you checked the hoses?" — not "Please ensure hydraulic line integrity per Section 4.2."
- **Direct.** "That's too windy for the EWP." — not "Weather conditions may present challenges."
- **Non-judgmental.** "Good catch on the corrosion — worth flagging that." — not "You should have identified this earlier."
- **Supportive.** "Sounds like a solid plan. One thing to double-check..." — not "Your assessment is incomplete."

---

## Regulatory Alignment (Australia)

| Requirement | How CoAssure Addresses It |
|---|---|
| **Site-Specific SWMS** (Safe Work Australia) | Every conversation captures the actual site conditions (weather, location, worker observations) — not a generic template. |
| **Worker Consultation** (WHS Act) | The conversational dialogue itself is the record of consultation. Timestamped and stored. |
| **Digital Work Systems Duty** (NSW 2025 Amendment) | The system reduces cognitive load (voice vs. typing). It does not track task speed or create unreasonable workload. Designed to support, not surveil. |
| **Psychosocial Risk** (WHS Regulations) | The tone is non-judgmental and supportive. No "gotcha" monitoring. Workers control their own recordings. |
| **Record Keeping** (WHS Regulations) | All records are structured, searchable, and stored for the required retention period (2–7 years). |
| **Evidentiary Value** (Evidence Act 1995) | Voice records are linked to authenticated users, timestamped, geo-tagged, and stored in a tamper-evident system. |

---

## Measuring Success

### Leading Indicators (What Matters)

| Metric | What It Tells You |
|---|---|
| **Conversation Depth** | Are workers giving real answers or one-word responses? Measured by word count, variety, and specificity. |
| **Hazard Identification Rate** | How many distinct hazards are workers identifying per session? Trending up = improving safety culture. |
| **Challenge Acceptance Rate** | When the AI asks a follow-up question, does the worker engage with it or dismiss it? |
| **Voluntary Usage** | Are workers using it because they have to, or because they want to? Free-tier adoption is the purest signal. |
| **Crowd-Source Contribution** | Are workers reporting hazards for others? This indicates a team safety mindset, not just individual compliance. |

### Lagging Indicators (What We're Trying to Move)

| Metric | Target Impact |
|---|---|
| **Incident Rate** | Reduction through better pre-task thinking |
| **Near-Miss Reporting** | 5–10x increase (voice notes remove the friction) |
| **Insurance Premiums (EMR)** | Reduction through demonstrated proactive risk management |
| **Administrative Time** | 30–60 minutes per worker per day returned to productive work |
| **Audit Preparation Time** | Up to 90% reduction (records are structured and searchable by default) |

---

## Summary

CoAssure is not a safety app. It is a **safety habit**.

It meets workers where they are — in the van, at the gate, on the job — and gives them 30 seconds of structured thinking before they start. The organisation sets the rules. The AI makes those rules feel like a conversation with an experienced colleague.

The free tier turns every sub-contractor into a distribution channel. The branded footer turns every form submission into a lead. The enterprise tier gives managers the visibility they've never had — not into forms completed, but into thinking demonstrated.

**Safety becomes embedded cognition. Not paperwork.**
