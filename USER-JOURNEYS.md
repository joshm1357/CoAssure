# CoAssure — User Journeys & Scenarios

This document walks through the detailed experience for every entry point and user type in the CoAssure system. Each scenario shows exactly what happens, what the system knows, and what output is generated.

---

## Journey 1: The Lone Worker Pre-Start (The Core Experience)

### Who
Dave, an HVAC technician. Works alone. Drives a van between 3–5 jobs per day. His company requires a Take 5 before every job. He's been copying yesterday's answers for months.

### The Situation
Dave is driving to a commercial building to service an air handling unit on the roof. It's a 35°C day. He's the only tech on this job.

### What Happens

**7:45 AM — In the Van**

Dave opens CoAssure. One big button: **"Talk Through the Job."**

He taps it (or says the wake phrase on hands-free).

> **Dave:** "Heading to the Westfield on Park Road. Servicing the AHU on the roof. Just me today. Should take a couple hours."

**What the system already knows (before Dave speaks):**
- GPS: Heading toward Park Road, Westfield shopping centre
- Weather: 35°C, UV index extreme, low wind
- Time: Morning shift, Friday (high fatigue risk)
- Org standards: Dave's company requires Working at Heights controls for any roof access, heat stress protocols above 33°C
- Crowd-source: Another tech reported "roof access ladder missing a rung" at this site two weeks ago

> **CoAssure:** "Hot one today — 35 degrees. Your company's heat stress protocol kicks in above 33. Are you packing enough water and planning shade breaks? Also, someone flagged a dodgy rung on the roof access ladder at Westfield a couple of weeks back. Worth checking before you climb."

> **Dave:** "Yeah, got the esky full. I'll check the ladder. Cheers."

**The Output:**

CoAssure generates a structured pre-start record:

```
PRE-START ASSESSMENT — 17 Feb 2026, 07:47 AM
Worker: Dave Mitchell | Site: Westfield, Park Road
Task: AHU service — rooftop
Weather: 35°C, UV Extreme, Wind 8km/h

HAZARDS IDENTIFIED:
• Heat stress (35°C exceeds company threshold of 33°C)
• Working at heights (rooftop access)
• Reported defect: roof access ladder (flagged 3 Feb 2026)

CONTROLS CONFIRMED:
• Hydration supplies on site (confirmed by worker)
• Ladder inspection to be conducted on arrival (confirmed by worker)
• Lone worker — check-in schedule applies

SESSION DURATION: 38 seconds

---
This assessment was conducted using CoAssure.
View full context → [link]
```

Dave can **paste** this into his company's system, text it to his supervisor, or just leave it in CoAssure's log.

**Total time: 38 seconds.** His old Take 5 form took 8 minutes of ticking boxes he wasn't reading.

---

## Journey 2: The Sub-Contractor Filling a Client's Form

### Who
Maria, an electrician running a small sub-contracting business. She works on different client sites every week. Each client has their own safety forms — some in Procore, some in HammerTech, some on paper.

### The Situation
Maria arrives at a construction site run by a Tier 1 builder. She's been given a paper SWMS to fill out and a digital Take 5 in the builder's app. She hates the paperwork — it slows her down and the forms never quite match what she's actually doing.

### What Happens

**6:15 AM — At the Site Gate**

Maria opens CoAssure (free version on her phone). Taps **"Talk Through the Job."**

> **Maria:** "Right, I'm at the Henderson Road project. Running cable from the switchroom in the basement up to Level 3. Through the riser. Need to do some drilling through the fire-rated walls. Working with my apprentice Jake."

**What the system knows:**
- GPS: Henderson Road construction site
- Weather: 18°C, overcast, chance of rain later
- Time: Early morning, start of shift
- Free-tier context: General electrical safety, fire-rated penetration standards, working with apprentices

> **CoAssure:** "Drilling through fire-rated walls — you'll need to make sure those penetrations get re-sealed to rating. Have you got the right collars or compound for that? And with Jake on the job, keep an eye on his PPE around the drill — dust and fragments."

> **Maria:** "Yeah, got the fire collars. Jake knows the drill — pardon the pun. He's got his goggles and we've both got P2 masks."

> **CoAssure:** "Nice one. One more thing — rain's expected later today. If the riser is open to weather at any point, watch for water tracking down onto your cable run. Good to go."

**The Output — The "Paste":**

Maria hits the **Paste** button. CoAssure copies a structured block of text to her clipboard:

```
SAFETY ASSESSMENT — 17 Feb 2026, 06:17 AM
Site: Henderson Road Project
Task: Cable installation — basement switchroom to Level 3 via riser
Workers: Maria Chen + apprentice (Jake)
Weather: 18°C, overcast, rain forecast PM

Hazards: Fire-rated wall penetrations, dust/fragments from drilling,
potential water ingress in riser (rain forecast)
Controls: Fire collars on site, P2 masks and goggles confirmed for
both workers, monitoring riser for weather exposure

This safety plan was developed using CoAssure.
View full assessment context → coassure.com/s/xK9mP2
```

**Maria pastes this into two places:**
1. The "Risk Assessment" free-text field in the builder's digital Take 5
2. The "Additional Notes" section on the paper SWMS

**What the client sees:**

Later that morning, the Site Safety Advisor reviews the day's Take 5 submissions. Most are one-line entries: "All good." "No issues." "Same as yesterday."

Then they see Maria's. It's specific. It names the actual hazards. It mentions fire-rated penetrations and weather risks. And there's a link.

They click the CoAssure link. They see:
- A map showing Maria's GPS location at the time
- The weather snapshot (18°C, rain forecast)
- The full transcript — Maria actually talking through her plan
- The AI prompts that challenged her thinking
- The fact that this took 42 seconds, not 10 minutes of box-ticking

**The reaction:** "Why can't all the subbies do this?"

**That is the entry point into the organisation.** The Site Safety Advisor forwards the link to their HSE Manager. The HSE Manager calls us.

---

## Journey 3: The Toolbox Talk Broadcast

### Who
Steve, an Operations Manager for a utilities company. He has 40 field workers spread across a regional area. Most of them never come into the office. He emails a weekly safety update that nobody reads.

### The Situation
On Monday morning, Steve learns that a competitor had a serious incident over the weekend — a worker was injured by a pressurised fitting failure. Steve needs to get the word out to his team immediately.

### What Happens

**Monday 6:00 AM — Steve at Home**

Steve opens CoAssure's manager dashboard on his laptop. He hits **"Record Toolbox Talk."**

> **Steve (recording):** "Morning team. Heads up — there was a serious incident at another company over the weekend. A pressurised fitting on a water main let go and a bloke copped it in the face. If you're working on anything pressurised today, double-check your fittings are rated and depressurise before you disconnect anything. Don't rush it. Talk to me if you're unsure."

He hits **Send to: All Field Teams.**

**Monday 6:30 AM — Workers Arriving at Various Sites**

Each worker's phone buzzes with a CoAssure notification: **"New Toolbox Talk from Steve — 45 seconds."**

Workers listen on their drive or when they arrive. Each one voice-confirms:

> "Heard."

Or they can respond with a comment:

> "Yeah, we had a dodgy fitting on the Elm Street job last week too. I flagged it but not sure it got replaced."

**The Dashboard — Monday 8:00 AM:**

Steve checks the dashboard:
- 38 of 40 workers have listened and confirmed
- 2 workers haven't opened it yet (system sends a reminder at 8:30)
- 3 workers left voice comments — one of them flagged a potentially related issue on Elm Street

Steve now has:
1. **Proof** that 95% of his workforce received the safety alert within 2 hours
2. **Intelligence** — the Elm Street flag might be a pattern
3. **A record** that satisfies the WHS consultation requirement

**Compare this to the old way:** Steve sends an email on Monday. By Friday, 12 people have opened it. He has no idea if anyone actually read it. No record of consultation.

---

## Journey 4: The Guest Pass (Site QR Code)

### Who
A large construction project with 15 different sub-contractor companies on site at any given time. The principal contractor struggles to ensure subbies have done proper pre-starts before work begins.

### The Situation
An excavation crew from a small earthworks company arrives for their first day on site. They don't have CoAssure. They don't have the principal contractor's safety app. They have a paper SWMS and a pen.

### What Happens

**5:45 AM — Site Office / Gate**

A laminated sign at the gate reads:

> **Before you start work, scan to check in with the Site Safety Co-Pilot.**
> [QR Code]

The excavator operator, Tony, scans it with his phone camera. It opens a web page — no app install, no login, no account creation.

> **CoAssure (web):** "Welcome to the Riverside Development. What trade and what's your plan for today?"

> **Tony:** "Excavation. We're digging the footings on Block C. Got the 20-tonne excavator."

**What the system knows (loaded by the principal contractor):**
- Project is in "Excavation Phase"
- Block C has underground services marked (water main runs east-west, 1.2m deep)
- There's a pedestrian walkway 8 metres from Block C
- Yesterday's rain has made ground conditions soft

> **CoAssure:** "Block C — heads up, there's a water main running east-west about 1.2 metres down. Is that marked on the ground? Also, the rain yesterday means the ground might be soft near the edges. And there's a pedestrian walkway about 8 metres from where you're digging — have you got your spotter sorted for when you're swinging the bucket that way?"

> **Tony:** "Yeah, the services are marked. I'll check the edges before we get too close. Didn't know about the walkway being that close though — I'll set up some barriers."

> **CoAssure:** "Good call on the barriers. One last thing — do you have a current excavation permit for Block C?"

> **Tony:** "Uh... I think the foreman's got it. I'll check."

**The Notification:**

The Site Supervisor gets a push notification:

```
SUB-CONTRACTOR CHECK-IN — 05:48 AM
Trade: Excavation | Zone: Block C
Operator: Tony (Guest)
Plan: Footing excavation, 20T excavator

DISCUSSED:
✓ Underground services — aware, markings confirmed
✓ Soft ground conditions — will inspect edges
✓ Pedestrian proximity — barriers to be erected
⚠ Excavation permit — not confirmed by operator, referred to foreman

ACTION: Verify excavation permit before work commences.
```

**The value:**

Tony didn't download an app. He didn't fill out a form. He had a 90-second conversation. But the site supervisor now knows:
- What Tony plans to do
- What he knows about the site conditions
- What he might have missed (the permit)
- Where he'll be working

And there's a record.

---

## Journey 5: The Reflection / Close-Out

### Who
Sarah, a telecommunications technician. She just finished a job running fibre through a ceiling cavity in a commercial building.

### The Situation
The job went mostly fine, but Sarah noticed something concerning while she was up in the ceiling. Under the old system, she might mention it to someone back at the depot — or more likely, she'd forget about it by the time she got there.

### What Happens

**2:30 PM — Back at the Van**

Sarah hits the **"Reflect"** button.

> **CoAssure:** "Job done? How'd it go — anything worth noting?"

> **Sarah:** "Yeah, job's done. Fibre's in. One thing though — there's asbestos-looking material on some of the old pipes up in the ceiling. It wasn't on the asbestos register for the building. Might be nothing, might be something. Took a photo."

> **CoAssure:** "That's a good pickup. I'll flag that as a potential asbestos hazard with the photo attached. Was there any labelling on the material, or was it unlabelled?"

> **Sarah:** "No labels. Just old lagging on the pipes. Grey, fibrous stuff."

> **CoAssure:** "Noted. I'll include that description. This will go to your safety team for follow-up. Don't go back into that ceiling space until it's been assessed."

**The Output:**

A hazard report is generated and sent to Sarah's safety team:

```
HAZARD REPORT — 17 Feb 2026, 14:32 PM
Reporter: Sarah Kim | Site: 42 Victoria Ave, Level 2 ceiling cavity
Category: Potential Asbestos (Unconfirmed)

OBSERVATION:
Grey, fibrous lagging material on old pipes in ceiling cavity.
Not listed on building's asbestos register. Unlabelled.
Photo attached.

RECOMMENDED ACTION:
Restrict access to ceiling cavity until material is assessed
by a licensed asbestos assessor.

Worker has been advised not to re-enter the space.
```

**What would have happened without CoAssure:**

Sarah drives to the next job. Forgets about the pipes. Mentions it casually to a colleague next week. Maybe it gets reported, maybe it doesn't. The next tech goes into that ceiling cavity without knowing.

With CoAssure, the hazard is documented, photographed, geo-tagged, and in the safety team's inbox within 60 seconds of Sarah noticing it.

---

## Journey 6: The "Reverse Entry" — Form-First, Voice-Assisted

### Who
A plumbing sub-contractor filling out a client's digital SWMS in their safety management platform (e.g., HammerTech, SafetyCulture iAuditor).

### The Situation
The form has 30 fields. Most are dropdowns and checkboxes. But there's a free-text "Risk Assessment" section that most workers either leave blank or write "see attached SWMS."

### What Happens

The worker opens the client's form. Scrolls to the "Risk Assessment" section.

Instead of typing, they open CoAssure and tap **"Talk Through the Job."**

They speak for 30 seconds about the actual task, the actual conditions, the actual risks.

CoAssure generates a structured summary. The worker taps **Paste** and drops it into the free-text field.

**What the client's form now contains:**

Instead of: *"See SWMS"* or *"All risks controlled"*

It now reads:

> Task: Hot water system replacement, ground floor plant room. Hazards identified: Scalding risk during disconnect (system still warm), manual handling (unit is 80kg), confined working space in plant room, trip hazards from old copper pipe offcuts. Controls: Waiting 30 min for system to cool before disconnect, two-person lift for new unit, cleared workspace before starting, collected offcuts in bucket.
>
> *Developed using CoAssure — [View full assessment context →]*

**The branded footer** is always present on free-tier outputs. It's not intrusive — it sits at the bottom like a "Sent from iPhone" signature. But it does two things:

1. **Advertises CoAssure** to whoever reads the form (the client's safety team)
2. **Links to a richer context page** showing weather, GPS, transcript, and AI prompts — proving this wasn't just words typed in a box, but an actual thinking process

---

## Journey 7: The Manager Reviewing the Week

### Who
Karen, HSE Director for a mid-size facilities maintenance company. 60 field workers across 3 states.

### The Situation
Friday afternoon. Karen needs to prepare for the Monday safety meeting with the executive team.

### What Happens

Karen opens the CoAssure dashboard. Instead of manually reading 300 Take 5 forms, she sees:

**This Week's Summary (Auto-Generated):**

```
WEEKLY SAFETY DIGEST — 10-17 Feb 2026

SESSIONS: 287 pre-starts completed (96% of scheduled shifts)

TOP HAZARDS DISCUSSED:
1. Heat stress (mentioned in 64% of sessions — temp exceeded 33°C
   on 4 of 5 days)
2. Working at heights (31% of sessions)
3. Manual handling (28% of sessions)

NOTABLE OBSERVATIONS:
• 3 workers independently reported "poor lighting in car park"
  at the Westfield contract — potential systemic issue
• Asbestos concern flagged at 42 Victoria Ave (under investigation)
• Apprentice engagement: new workers averaging 45-second sessions
  vs. experienced workers at 32 seconds (positive — they're being
  more thorough)

TOOLBOX TALK:
• Monday alert on pressurised fittings: 95% acknowledgement within
  4 hours
• 4 worker comments received — Elm Street fitting flagged for
  inspection

ENGAGEMENT:
• Average conversation depth: 3.2 distinct hazards per session
  (up from 2.1 last month)
• "Lazy response" rate: 4% (down from 18% in first month)
• Voluntary usage (non-required sessions): 12%

TRENDS:
• Friday afternoon sessions show lower engagement — consider
  a targeted reminder
• Manual handling mentions are increasing — potential training
  opportunity
```

Karen copies this into her Monday meeting deck. It took her 2 minutes instead of 2 hours. And the data is richer than anything she's ever had from paper forms.

---

## The Pattern Across All Journeys

Every journey follows the same principles:

1. **Speak, don't type.** The worker talks naturally. The system handles the structure.
2. **Context is automatic.** Weather, location, time, org standards, and crowd-sourced hazards are pulled in without the worker having to look them up.
3. **The challenge is brief.** 1–2 pointed questions. Not an interrogation.
4. **The output fits existing workflows.** Paste into any form, any system, any platform. Or just leave it in CoAssure.
5. **The branded footer creates awareness.** Every output is a quiet advertisement — and a link to richer evidence.
6. **The worker is in control.** They decide what to say, how much to share, and where to paste it. CoAssure empowers; it doesn't mandate.
