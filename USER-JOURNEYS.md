# CoAssure — User Journeys & Scenarios

This document walks through the detailed experience for every entry point and user type in the CoAssure system. Each scenario shows exactly what happens, what the system knows, and what output is generated.

---

## Journey 1: The Pre-Start Talk-Through (Small Crew on a Changing Site)

### Who
Dave and Jake, a two-person plumbing crew. They work for a mid-size mechanical services company. They're sent to different sites every day — commercial buildings, construction projects, client premises. Each site has different conditions, different hazards, different forms.

### The Situation
Monday morning. They've been sent to a shopping centre to replace a hot water unit in the plant room. They've done similar jobs dozens of times, but never at this particular site.

### What Happens

**6:45 AM — In the Van**

Dave opens CoAssure. One big button: **"Talk Through the Job."**

> **Dave:** "Heading to Westfield on Park Road. Replacing the HWU in the plant room. Me and Jake. Should be a few hours. Unit's about 80 kilos."

**What the system already knows (before Dave speaks):**
- GPS: Heading toward Park Road, Westfield shopping centre
- Weather: 36°C, UV extreme, no wind
- Time: Monday morning start of shift
- Org standards: Dave's company requires two-person lift or mechanical assist above 25kg, hot work permits for any soldering/brazing, confined space assessment for plant rooms below a certain size
- Crowd-source: A tech from another company reported "poor ventilation in plant room" at this Westfield three weeks ago
- Industry feed: SafeWork issued a burns advisory last week for hot water system disconnections

> **CoAssure:** "36 degrees today — it'll be hot in that plant room. Someone flagged poor ventilation there a few weeks back, so keep an eye on that. The unit's 80kg — you'll need the trolley or a mechanical assist, yeah? And SafeWork put out a burns advisory last week for HWU disconnects — make sure the system's cooled before you crack the fittings."

> **Dave:** "Yeah, good point on the cooling. We'll isolate and let it sit. Jake, you hear that about the ventilation?"

> **Jake:** "Yep. I'll prop the door and we'll take breaks if it's stifling."

**The Output:**

```
PRE-START ASSESSMENT — 17 Feb 2026, 06:47 AM
Workers: Dave Mitchell, Jake Torres
Site: Westfield, Park Road | Plant Room
Task: Hot water unit replacement (80kg unit)
Weather: 36°C, UV Extreme

HAZARDS IDENTIFIED:
• Heat stress — 36°C ambient, enclosed plant room with reported
  poor ventilation
• Manual handling — 80kg unit requires mechanical assist or
  two-person lift with trolley
• Burns/scalds — hot water system disconnect (SafeWork advisory
  active)
• Confined space assessment — plant room ventilation to be
  monitored

CONTROLS CONFIRMED:
• System to be isolated and cooled before disconnect
• Mechanical assist / trolley for unit handling
• Plant room door propped for ventilation, regular breaks planned
• Two workers on site — buddy system active

SESSION DURATION: 42 seconds
```

**Total time: 42 seconds.** Their old Take 5 form took 8 minutes of ticking the same boxes as last time.

---

## Journey 2: The Facilitated Toolbox Talk (Supervisor-Led with AI Assist)

### Who
A six-person concrete crew on a commercial construction site. The foreman, Mick, runs the morning pre-start briefing every day. Half the crew zones out because the talks follow the same pattern: Mick reads from a sheet, asks "any questions?", everyone says no, they sign and go.

### The Situation
Today they're pouring a slab on the exposed upper level. It's going to be 38°C. The pump truck is arriving at 9am. Two of the crew are relatively new — started three weeks ago.

### What Happens

**6:30 AM — Smoko Area**

Mick opens CoAssure and taps **"Toolbox Talk."** He selects "Supervisor-led" mode. The phone sits on the table, recording.

> **Mick:** "Right, morning everyone. Big pour today — Level 3 slab. Pump truck's coming at 9. Let's talk through the hazards. What are we looking at?"

> **Worker 1 (experienced):** "Concrete burns, as always. Gloves and boots. And the pump line — make sure we've got a clear path for the hose."

> **Worker 2 (experienced):** "Edge protection. We're on Level 3, it's open on the north side."

Pause. The two new workers say nothing.

> **CoAssure:** "Good picks. A couple more things to consider — it's forecast for 38 today and you're on an exposed slab with no shade. What's the plan for heat stress? And for the newer crew members — have you worked with a concrete pump before?"

> **New Worker 1:** "Uh, yeah once. But I wasn't on the hose."

> **Mick:** "Right, you're not going near the hose today then. Stay on the vibrator and screeding. And yeah, we need a shade break schedule — every 45 minutes, rotate off the slab."

> **CoAssure:** "One more — the pump truck's coming through the gate at 9. Is there a spotter arranged for the truck reversing into position?"

> **Mick:** "Good point. Davo, you're on spotter duty until the pump's set up."

**What the AI knew and used:**
- Weather: 38°C forecast — triggered heat stress prompts
- Org standards: Company policy requires shade breaks above 35°C and spotters for vehicle movements on site
- Project context: Level 3 is flagged as "open edge — north side" in the project settings
- Crew profile: Two workers marked as "< 1 month on site" — triggered the experience-check prompt
- Industry data: Concrete pump incidents are disproportionately common with inexperienced workers

**The Output:**

CoAssure generates a structured toolbox talk record:

```
TOOLBOX TALK RECORD — 17 Feb 2026, 06:32 AM
Site: Henderson Road Commercial — Level 3
Led by: Mick Harris (Foreman)
Attendees: [6 names captured via voice or manual entry]
Duration: 4 minutes 20 seconds

TOPIC: Level 3 Slab Pour

HAZARDS DISCUSSED:
• Concrete burns — PPE confirmed (gloves, boots)
• Pump hose path — clear access to be maintained
• Edge protection — north side open edge noted
• Heat stress — 38°C forecast, exposed slab, no shade
• Pump truck reversing — vehicle movement on site
• Inexperienced crew — two workers new to concrete pumping

CONTROLS AGREED:
• Full PPE for concrete contact
• Pump hose route to be cleared before truck arrives
• Edge protection verified on north side
• 45-minute shade break rotation
• Dave assigned as spotter for pump truck arrival (9am)
• New workers assigned to vibrator/screed — not pump hose

ACTIONS:
• Mick to verify edge protection north side before pour (by 8am)
• Dave on spotter duty from 8:45am

DISCUSSION NOTES:
[Full transcript available — link]
```

**What's different from the old way:**
- The new workers were drawn into the conversation — they didn't just stand there silently
- The AI caught heat stress and the vehicle movement — things Mick had covered a hundred times but skipped today because he was focused on the pour
- The documentation captures what was actually discussed, not just what was on the printed sheet
- The transcript satisfies WHS Section 48 consultation requirements — workers expressed views, contributed to decisions, in their own words

---

## Journey 3: The Form Assistant (Scan, Talk, Fill)

### Who
Maria, an electrician running a small sub-contracting business. She works on different client sites every week. Each client has different safety forms — some in Procore, some in HammerTech, some on paper.

### The Situation
Maria arrives at a construction site run by a Tier 1 builder. She's been given a paper JSA to fill out before she starts work. It's a two-page form with 30+ fields. She's standing at the site office, pen in hand, staring at a form she's never seen before.

### What Happens

**6:20 AM — Site Office**

Instead of struggling through the form field by field, Maria opens CoAssure and photographs the paper JSA with her phone camera.

CoAssure reads the form (OCR), identifies it as a JSA template, and maps the fields.

> **CoAssure:** "Got it — this is a Job Safety Analysis. Let me walk you through it. First up: what's the job today?"

> **Maria:** "Running cable from the switchroom in the basement up to Level 3. Through the riser. Need to do some drilling through the fire-rated walls. Working with my apprentice Jake."

> **CoAssure:** "Drilling through fire-rated walls — you'll need to re-seal those penetrations to rating. Have you got the right collars or compound? And with Jake on the drill, make sure he's got goggles and a P2 for the dust."

> **Maria:** "Yeah, got the fire collars. Jake knows the drill — he's got his PPE sorted."

> **CoAssure:** "Good. This form asks about site-specific hazards. Rain's expected later today — if the riser is open to weather at any point, water could track down onto your cable run. And the basement switchroom — is there adequate lighting, or do you need to bring your own?"

> **Maria:** "Good call on the rain. I'll check the riser opening. Lighting's usually fine down there but I'll pack the work light just in case."

> **CoAssure:** "Last section — emergency procedures. Do you know where the first aid kit and emergency assembly point are for this site?"

> **Maria:** "They told us at induction. Assembly point's the car park on George Street."

**The Output:**

CoAssure generates a completed JSA — populated with Maria's actual responses, the weather data, the location, and the AI-challenged hazard identification. It outputs as:

1. **A filled PDF** matching the layout of the client's original paper form — Maria can print it or hand it to the site office
2. **A text summary** she can paste into the client's digital system if they have one
3. **Both include the branded footer:**

> *This safety assessment was completed using CoAssure. [View full context: weather conditions, location data, risk prompts, and worker responses →]*

**What the client sees when they click the link:**
- Map showing Maria's GPS location at the site
- Weather snapshot: 22°C, rain forecast for afternoon
- The full transcript — Maria actually thinking through the job
- The AI prompts: fire-rated penetrations, rain exposure, lighting, emergency procedures
- The fact that this took 2 minutes of talking, not 15 minutes of writing — and the content is richer than anything they usually see

**The client's reaction:** Most JSAs they receive say "See SWMS" or "All risks controlled." Maria's names specific hazards, specific controls, and shows evidence of actual thinking. The CoAssure link is forwarded to the HSE Manager.

---

## Journey 4: The QR Scan-and-Review (Sub-Contractor Reviewing Their Own Safety Doc)

### Who
Tony, an excavation operator from a small earthworks company. His boss gave him a printed SWMS for today's job — a generic template that gets used on most excavation work. Tony's supposed to "review it and sign it" before he starts.

### The Situation
Tony's sitting in his excavator cab, staring at a 6-page SWMS. It's the same document he's signed a hundred times. He's about to just sign the back page and start the machine. But the site today is different — it's next to a school, the ground was saturated by last night's rain, and there are underground services he hasn't checked.

### What Happens

**7:00 AM — In the Cab**

Tony opens CoAssure and photographs the first page of the SWMS.

> **CoAssure:** "This is a Safe Work Method Statement for excavation work. Let me check it against today's conditions. Talk me through what you're actually doing and where."

> **Tony:** "Digging footings for the new retaining wall. Block C, along the boundary fence. 20-tonne excavator."

> **CoAssure:** "Alright. The SWMS mentions underground services — have you confirmed the Dial Before You Dig for this address? The markings should be on the ground."

> **Tony:** "Yeah, they're marked. Gas and water run along the road, not through Block C."

> **CoAssure:** "Good. One thing the SWMS doesn't mention — it rained heavily last night and the ground's likely soft. That affects your trench stability and the ground pressure under the excavator. Are you planning to bench the trench or use shoring?"

> **Tony:** "Wasn't planning to, but yeah... it is pretty wet. I'll bench it out wider to be safe."

> **CoAssure:** "Smart. Also — this site is next to a school. The SWMS has a generic 'public protection' section but doesn't mention the school specifically. Is there a fence or barrier between your dig area and the school boundary? And what time do kids start arriving?"

> **Tony:** "There's a temporary fence but it's only waist height. Kids start at 8:30. I should probably wait until they're inside before I start swinging the bucket near that side."

> **CoAssure:** "Good call. I'd flag that fence height with the site supervisor too. The SWMS rates public protection as 'Low risk' — based on what you're describing, that probably needs updating."

**What happened here:**

Tony was about to sign a generic SWMS without reading it. CoAssure took that same document and tested it against reality:
- The underground services check was in the SWMS — CoAssure verified it was done
- The ground conditions were NOT in the SWMS — CoAssure caught the gap
- The school proximity was glossed over with generic language — CoAssure made it specific
- Tony went from "sign and start" to genuinely reviewing his safety plan in under 3 minutes

**The Output:**

A SWMS review record showing:
- Which sections of the SWMS were verified against site conditions
- Which gaps were identified (ground conditions, school proximity, fence height)
- What additional controls the worker committed to (benching, timing around school hours)
- A recommendation to update the SWMS risk rating for public protection

This is precisely the "site-specific review" that regulators require. A generic SWMS is not legally compliant unless it's been reviewed and adapted for the specific site — and CoAssure just facilitated that review through a 3-minute conversation.

---

## Journey 5: Easy Reporting — Near-Miss

### Who
Sarah, a telecommunications technician. She's installing fibre at a commercial building.

### The Situation
Sarah nearly fell through an unmarked ceiling void while running cable through the roof space. She caught herself on a beam. No injury — but it could have been serious. Under the old system, she'd shake it off and maybe mention it to someone at the depot. Maybe.

### What Happens

**11:15 AM — Back on Solid Ground**

Sarah's heart is still racing. She opens CoAssure and taps **"Report."**

A simple choice appears: **Near-Miss | Hazard | Good Catch | Observation**

She taps **Near-Miss.**

> **CoAssure:** "What happened?"

> **Sarah:** "Nearly went through the ceiling. There's an unmarked void in the roof space — no covers, no marking, nothing. I was walking along the joists and my foot went into thin air. Grabbed the beam and pulled myself back."

> **CoAssure:** "That's serious. Are you hurt at all — any strain from catching yourself?"

> **Sarah:** "Nah, just shaken up. My shoulder's a bit sore from grabbing the beam but it's fine."

> **CoAssure:** "Worth keeping an eye on that shoulder. Can you take a photo of the void so we can flag it properly?"

> **Sarah:** (takes photo)

> **CoAssure:** "Got it. Was there any signage or barriers around the roof access indicating voids?"

> **Sarah:** "Nothing. No signs at the access hatch, nothing in the roof space. If I hadn't been stepping carefully I'd have gone straight through."

> **CoAssure:** "Noted. I'm going to flag this as high severity because of the fall potential. This will go to your safety team and the building manager. The void area should be barricaded or covered before anyone else goes up there. Anything else?"

> **Sarah:** "Just that whoever does the next job here needs to know. Maybe put it on the site notes."

**The Output:**

```
NEAR-MISS REPORT — 17 Feb 2026, 11:17 AM
Reporter: Sarah Kim
Site: 42 Victoria Ave, Level 2 roof space
Category: Fall Through — Unmarked Void (Severity: HIGH)

WHAT HAPPENED:
Worker stepped into unmarked ceiling void while running fibre
cable in roof space. Caught beam, prevented fall through ceiling.
No fall, no injury. Minor shoulder strain from self-arrest.

CONTRIBUTING FACTORS:
- Unmarked/uncovered ceiling void
- No signage at roof access point warning of voids
- No barriers or covers in roof space

IMMEDIATE ACTIONS TAKEN:
- Worker exited roof space
- Photo of void captured and attached
- Area verbally flagged to on-site staff

RECOMMENDED ACTIONS:
- Cover or barricade void immediately
- Install warning signage at roof access hatch
- Update building hazard register
- Notify building manager

SITE NOTE ADDED:
"Unmarked ceiling void in Level 2 roof space near riser.
Fall risk. Void uncovered as of 17 Feb 2026."
[Photo attached]
```

**Routed to:** Sarah's safety team (automatic), building management (if contact is in system), and added to the site's hazard history so the next worker sent to 42 Victoria Ave gets warned.

**What would have happened without CoAssure:** Sarah drives to the next job. Tells a colleague at the depot. Maybe files a report next week. Maybe doesn't. The next tech goes into that roof space blind.

**With CoAssure:** The report exists within 2 minutes of the event. It's detailed, structured, GPS-tagged, photo-documented, and in the right people's inboxes before Sarah has finished her lunch break.

---

## Journey 6: Easy Reporting — Good Catch, Hazard, Observation

### The Good Catch

> **Worker:** (taps Report → Good Catch) "Found a frayed sling on the crane before we started the lift. Swapped it out. Could've snapped under load."

> **CoAssure:** "Good pickup. Was this during your pre-use inspection, or did you spot it by chance?"

> **Worker:** "Pre-use check. The fraying was on the underside, easy to miss."

Output: Good catch report with photo, flagged for equipment inspection team. Positive data point for the worker and the crew.

### The Hazard

> **Worker:** (taps Report → Hazard) "The access road to Block B is washed out from last night's rain. Deep ruts. Nearly bottomed out the ute."

> **CoAssure:** "How bad are the ruts? Passable for all vehicles or just utes?"

> **Worker:** "A truck would struggle. And there's no other way in."

Output: Hazard report with GPS pin. Routed to site supervisor. Added to crowd-sourced data — the next worker heading to Block B gets warned.

### The Observation

> **Worker:** (taps Report → Observation) "The new apprentice on the other crew keeps taking his hard hat off when he's in the shade. Not sure if anyone's told him."

> **CoAssure:** "Worth flagging. Do you want to raise it directly, or should it go as an anonymous observation to the site supervisor?"

> **Worker:** "Anonymous. Don't want to dob the kid in — he just needs a reminder."

Output: Anonymous observation. Routed to site supervisor as a "PPE compliance — reminder needed" note. No name attached to the reporter.

**The key design point across all of these:** The friction is so low — tap, talk, done — that workers will actually use it. The 5-minute typing barrier that kills near-miss reporting is gone. Voice makes it 75–90% faster than manual entry.

---

## Journey 7: The Facilitated Toolbox Talk (AI-Run, No Supervisor)

### Who
A three-person electrical crew sent to a regional water treatment plant for a switchboard upgrade. There's no supervisor on this job — just the lead electrician and two others. The client requires a documented pre-start briefing, but the crew usually just signs the sheet and gets going.

### What Happens

**7:15 AM — At the Plant Gate**

The lead electrician, Sam, opens CoAssure and taps **"Toolbox Talk"** → **"AI Facilitated."**

> **CoAssure:** "Morning. Three of you on the job today — what's the main task?"

> **Sam:** "Switchboard upgrade at the treatment plant. We're replacing the main board in the MCC room."

> **CoAssure:** "MCC room — that's usually a confined space with limited ventilation. Is it in this case?"

> **Sam:** "It's a room, not a tank. But yeah, it's small. No windows."

> **CoAssure:** "Right. What about isolation — is the board already de-energised, or are you doing the isolation?"

> **Sam:** "We're doing it. LOTO procedure. I've got the locks."

> **CoAssure:** "Good. Who else is on the team? I want to make sure everyone's across the plan."

> **Worker 2 (Chris):** "I'm running the new cables from the board to the distribution panels."

> **CoAssure:** "Are any of those cable runs near water or damp areas? Treatment plants can have moisture issues."

> **Chris:** "Actually yeah, the cable tray runs above the filter room. It does get damp in there."

> **CoAssure:** "Worth noting. Make sure your cable terminations are rated for damp environments, and check for standing water before you start pulling cable. What about you?" (directed at Worker 3)

> **Worker 3 (Priya):** "I'm assisting Sam on the board swap and doing the testing."

> **CoAssure:** "Testing — are you using your own test equipment? When was it last calibrated?"

> **Priya:** "Last month. I've got the cal sticker."

> **CoAssure:** "Perfect. Last thing — it's a treatment plant, so there might be chemical hazards. Do you know what's being treated here and whether there are any hazardous atmosphere risks near the MCC room?"

> **Sam:** "Good question. I'll check with the plant operator before we start."

> **CoAssure:** "Great. Summary: main risks are electrical isolation, confined working space, damp cable routes, and potential chemical atmosphere. Controls are LOTO, ventilation monitoring, damp-rated terminations, and checking with the plant operator on chemical risks. Anything else before you start?"

> **Sam:** "Nah, that covers it. Let's go."

**The Output:**

A complete toolbox talk record showing all three workers participated, the specific hazards discussed, controls agreed, and the action item (check with plant operator). The transcript shows genuine consultation — not a signature on a pre-printed sheet.

**Why this matters:** This crew would never have had this conversation without CoAssure. They would have signed a generic pre-start and started work. The AI caught the damp cable route, the chemical atmosphere risk, and the calibration check — three things the crew would have dealt with reactively instead of proactively.

---

## Journey 8: The Manager Reviewing the Week

### Who
Karen, HSE Director for a mid-size mechanical services company. 60 field workers across three states, working on dozens of different client sites. Her "system" is a mix of SafetyCulture for inspections, a shared drive full of PDFs, and a spreadsheet she maintains manually.

### The Situation
Friday afternoon. Karen needs to prepare for the Monday executive safety meeting. Under the old system, this means 2 hours of reading through SafetyCulture reports, chasing supervisors for missing paperwork, and manually compiling a summary.

### What Happens

**Friday 3:00 PM — Karen's Desk**

Karen opens the CoAssure dashboard. Instead of manually reading hundreds of forms, she sees:

**This Week's Digest (Auto-Generated):**

```
WEEKLY SAFETY DIGEST — 10-17 Feb 2026

ENGAGEMENT SUMMARY:
• 287 pre-start sessions completed (96% of scheduled shifts)
• 14 facilitated toolbox talks recorded (vs. 8 documented last week)
• 23 reports filed: 9 near-misses, 7 hazards, 4 good catches,
  3 observations

TOP HAZARDS DISCUSSED THIS WEEK:
1. Heat stress (mentioned in 64% of sessions — temp exceeded
   33°C on 4 of 5 days)
2. Working at heights (31%)
3. Manual handling (28%)
4. Vehicle/pedestrian interaction (15%)

═══════════════════════════════════════════════════════
DISCOVERIES — THINGS YOU WOULDN'T HAVE FOUND OTHERWISE
═══════════════════════════════════════════════════════

⚠ EMERGING PATTERN: "Poor lighting" mentioned by 6 workers
across 3 different sessions at the Westfield Park Road contract.
No formal hazard report filed — this surfaced only from
conversation analysis. RECOMMENDATION: Site inspection of
lighting in plant rooms and back-of-house areas.

⚠ SWMS GAP: 4 excavation jobs this week used the same generic
SWMS. CoAssure's review conversations identified site-specific
risks (soft ground, school proximity, overhead services) that
were NOT in the SWMS. RECOMMENDATION: Update excavation SWMS
template to include weather-dependent ground condition assessment.

⚠ TRAINING SIGNAL: Apprentices (< 6 months experience) mention
manual handling controls in only 30% of sessions, vs. 78% for
experienced workers. This is consistent across all sites.
RECOMMENDATION: Targeted manual handling refresher for
apprentice cohort.

⚠ NEAR-MISS CLUSTER: 3 vehicle/pedestrian near-misses this
week — all involving reversing vehicles, all at different sites.
Common factor: no spotter arranged. RECOMMENDATION: Company-wide
reminder on vehicle spotter requirements.

NOTABLE REPORTS:
• NEAR-MISS (HIGH): Fall through unmarked ceiling void at
  42 Victoria Ave — Sarah Kim. Void uncovered, no signage.
  Building manager notified. [View full report]
• GOOD CATCH: Frayed crane sling identified during pre-use
  inspection — prevented potential load drop. [View report]
• HAZARD: Access road to Block B washed out — flagged by
  3 workers independently.

TOOLBOX TALK QUALITY:
• Average talk duration: 4.2 minutes (up from 2.8 minutes
  last month — discussions are getting richer)
• Average workers contributing per talk: 3.4 of 5.1 attendees
  (up from 1.2 — previously only the supervisor spoke)
• AI prompts that generated new discussion: 68% of talks
  (the AI raised something the supervisor hadn't covered)

ENGAGEMENT TRENDS:
• Conversation depth: Average 3.2 specific hazards per session
  (up from 2.1 in first month)
• "Lazy response" rate: 4% (down from 18% in first month)
• Voluntary reporting (not required by schedule): 12 sessions
  — workers choosing to use CoAssure on their own

SUB-CONTRACTOR ACTIVITY:
• 14 CoAssure-linked submissions received from sub-contractors
  on our sites this week
• 3 sub-contractors used CoAssure to fill out our JSA forms
  (free tier — branded footer)
• Notable: Excavation sub at Henderson Road used CoAssure to
  review their SWMS against site conditions — identified fence
  height issue near school boundary that we hadn't flagged
```

**What Karen does with this:**

1. **The lighting issue at Westfield** — she calls the site supervisor. He didn't know about it because nobody filed a formal report. The workers just mentioned it in passing during their pre-starts. Without CoAssure's conversation analysis, this would have stayed invisible until someone tripped in the dark.

2. **The SWMS gap** — she updates the excavation template that afternoon. Next week, every excavation pre-start will include a ground condition assessment prompt.

3. **The apprentice training signal** — she schedules a targeted manual handling session for the next apprentice training day. Not because of an incident, but because the data showed a gap before it became one.

4. **The reversing vehicle cluster** — she records a toolbox talk voice note about spotter requirements and pushes it to all supervisors for Monday's briefings.

5. **The sub-contractor SWMS review** — she calls the excavation sub's boss to thank them for flagging the fence issue. And she asks about CoAssure.

**Total time for Karen: 15 minutes.** The old way took 2+ hours and produced a fraction of the insight.

**What's genuinely new here — outcomes that didn't exist before:**
- The lighting pattern was invisible in the old system. No form captured it. No report mentioned it. It only existed in casual voice conversations — and CoAssure's analysis surfaced it.
- The SWMS gap was systemic. The same generic document was being used on four different sites. Without CoAssure comparing the SWMS content to what workers actually described on site, nobody would have known the template was inadequate.
- The apprentice training signal came from aggregate conversation data, not from an incident or a complaint. It's a proactive intervention based on a pattern in how people talk about risk.
- The sub-contractor visibility — Karen can see what subbies were thinking before they started work, without mandating a platform or buying licenses.

---

## The Pattern Across All Journeys

Every journey follows the same principles:

1. **Speak, don't type.** The worker talks naturally. The system handles the structure.
2. **Context is automatic.** Weather, location, time, org standards, and crowd-sourced hazards are pulled in without the worker looking them up.
3. **The challenge is brief and specific.** 1–2 pointed questions per interaction. Not an interrogation.
4. **Any form, any system.** Scan it, photograph it, or select it. CoAssure helps fill out whatever the worker has been given — and outputs in whatever format is needed.
5. **The branded footer creates awareness.** Every free-tier output quietly demonstrates value to the next buyer.
6. **Discussion, not broadcast.** Toolbox talks are facilitated conversations where workers contribute — not lectures where they listen and sign.
7. **Reporting is effortless.** Tap, talk, snap, done. The friction that kills near-miss reporting is gone.
8. **The worker is in control.** They decide what to say, how much to share, and where to send it. CoAssure empowers; it doesn't mandate.
9. **Managers get discoveries, not summaries.** The dashboard surfaces patterns, gaps, and signals that no form-based system could reveal — because the underlying data is richer.
