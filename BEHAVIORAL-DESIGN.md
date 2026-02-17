# CoAssure — Behavioral Design Framework

This document defines the psychological model behind CoAssure. Every design decision — from the tone of the AI to the length of the interaction — is grounded in how humans actually think about risk.

---

## The Core Problem: Why Forms Fail

### System 1 vs. System 2 Thinking

Behavioral science describes two modes of cognition:

- **System 1 (Fast):** Automatic, instinctive, effortless. Handles 90–95% of daily decisions. This is the brain on autopilot.
- **System 2 (Slow):** Deliberate, analytical, effortful. Activated when we encounter something novel, complex, or important. This is the brain actually thinking.

Safety forms are designed to engage System 2. In practice, they activate System 1.

When a worker fills out the same Take 5 form for the 200th time, the brain treats it as a familiar, repetitive task. System 1 takes over. The worker ticks boxes from memory, not from observation. They are completing a form, not assessing a hazard.

**This is not laziness. This is neurology.** The brain is designed to automate repetitive tasks. Expecting a static form to sustain active thinking is expecting the brain to work against its own architecture.

### The "Pencil-Whipping" Problem

The industry term for this is "pencil-whipping" — completing safety documentation without genuine engagement. Research and field experience show:

- Workers copy previous answers
- Workers complete forms before arriving on site
- Workers treat the form as an obstacle between them and the job
- The documentation says "All risks controlled" while the site has changed since yesterday

Management receives completed forms and interprets them as evidence of safety. But the forms are evidence of compliance, not cognition. The gap between the paperwork and the thinking is where injuries happen.

---

## How CoAssure Breaks the Autopilot

### Speech Disrupts System 1

When you write a familiar phrase, your hand can do it automatically. When you speak, something different happens.

Speaking requires:
- **Retrieval:** You have to recall what you actually know about the situation
- **Sequencing:** You have to organise your thoughts into a coherent narrative
- **Commitment:** You hear yourself say things out loud, which creates a stronger psychological commitment than ticking a box

This is the "rubber ducking" effect — a concept from software engineering where programmers explain their code to a rubber duck. The act of verbalising forces the brain to engage System 2.

**CoAssure exploits this.** By asking the worker to speak their plan, we force them out of autopilot and into active thinking. The form lets them tick "PPE checked." The conversation requires them to say "I've got my harness on, and the anchor point is the steel beam on the north side."

### The Conversational Challenge

The second disruption comes from the AI's response. When the AI asks an unexpected, specific question, it introduces novelty — the one thing that reliably activates System 2.

- A static form asks the same questions every day. The brain learns to ignore them.
- CoAssure asks a different question based on today's weather, today's location, today's task, and today's organisational priorities.

**Key design constraint:** The challenge must be brief (1–2 questions) and specific. If the AI asks 10 questions, it becomes a verbal checklist and the worker habituates to it. The power is in the surprise — the one question they hadn't thought of.

---

## The ABC Model Applied

The ABC model from behavioral psychology:
- **A — Antecedent:** The trigger before a behaviour
- **B — Behaviour:** The action taken
- **C — Consequence:** The result after the action

Traditional safety systems focus on **Consequence** — punishing bad behaviour after an incident (investigation, retraining, termination). This is reactive and fear-based.

CoAssure focuses on **Antecedent** — changing the trigger before the task begins.

| Stage | Traditional Approach | CoAssure Approach |
|---|---|---|
| **Before the task** | Static form (ignored) | Conversational prompt (engages thinking) |
| **During the task** | No support (worker is alone) | Toolbox talks, crowd-sourced hazard alerts |
| **After the task** | Incident investigation (if something went wrong) | Reflection prompt (captures learning regardless) |

By intervening at the antecedent stage, CoAssure reshapes the behaviour (active hazard scanning) before a consequence (an injury) ever occurs.

---

## Nudge Theory in Practice

Nudge Theory (Thaler & Sunstein) argues that subtle changes to the decision environment can guide people toward better choices without restricting their freedom.

CoAssure is a nudge architecture for safety:

### Nudge 1: The Default is Engagement

In a form-based system, the default is to tick "No" to every hazard and move on. The path of least resistance is disengagement.

In CoAssure, the default is a conversation. You press a button and talk. The path of least resistance is actually speaking about the job. The AI does the rest.

### Nudge 2: Timely Prompts

The AI delivers its challenge at the moment of highest receptivity — when the worker has just described their plan and is mentally in "planning mode." This is not a reminder at 8am that they dismiss. It's a question in the middle of their own thought process.

### Nudge 3: Social Proof

"Two other workers reported slippery conditions here this morning."

This leverages social proof — the psychological tendency to follow what others are doing. When a worker hears that their peers flagged a hazard, they are more likely to take it seriously than if a form asked them to "assess ground conditions."

### Nudge 4: Specificity Over Generality

"Have you checked the hoses?" is more effective than "Are all tools in safe condition?"

Generic prompts activate generic responses ("Yes"). Specific prompts activate specific thinking ("Actually, I should look at the coupling on the left hose — it was a bit stiff yesterday").

CoAssure's intelligence engine exists to make every prompt as specific as possible to the actual job, the actual conditions, and the actual worker.

---

## Overcoming Complacency

Complacency is the primary cause of industrial accidents. It develops when:
- A task has been performed safely many times before
- The environment appears unchanged from yesterday
- The worker is experienced and confident
- There is time pressure or routine fatigue

The brain's response to familiar, apparently safe environments is to lower its guard. Risk signals that would alarm a novice are filtered out by experience.

### How CoAssure Counters Complacency

**Variability:** The AI varies its prompts. The worker never knows exactly what question is coming. This prevents the habituation that kills paper checklists.

**External data injection:** Even if the worker feels the job is "same as yesterday," the AI knows that the weather changed, or another worker reported a hazard, or the organisation just issued a new alert. The conversation surface changes every day.

**The "one more thing" pattern:** CoAssure's challenge is designed to feel like a peer saying "Oh, one more thing..." — the kind of casual, conversational nudge that experienced tradespeople give each other naturally. It doesn't feel like an audit. It feels like a mate looking out for you.

---

## Tone Design

The emotional design of CoAssure is critical. Get the tone wrong and workers will reject it — not because it isn't useful, but because it feels wrong.

### What It Must NOT Feel Like

| Feeling | Example | Worker Reaction |
|---|---|---|
| Surveillance | "I see you have been at this location for 12 minutes." | "It's spying on me." → Resistance, rejection |
| Interrogation | "Why did you not mention fall protection?" | "It's trying to catch me out." → Defensiveness |
| Corporate script | "Please confirm compliance with Section 4.2.1 of the Safety Manual." | "This is just a talking form." → Disengagement |
| Condescension | "Remember, safety is everyone's responsibility!" | "Yeah, thanks for that." → Eye-roll, ignored |

### What It Must Feel Like

| Feeling | Example | Worker Reaction |
|---|---|---|
| A peer | "Good point on the isolation. One thing — have you checked the earth?" | "Fair enough, I'll check." → Engagement |
| Practical | "It's too windy for the EWP today." | "Useful to know." → Trust |
| Respectful | "Sounds like you've got it sorted. Just double-check the anchor." | "Alright." → Compliance without friction |
| Protective | "If something goes wrong, this recording proves you did the right checks." | "That's actually useful for me." → Self-interest alignment |

### Tone Rules for the AI

1. **Short sentences.** Never more than two sentences in a response during a pre-start conversation.
2. **Trade language.** "Check the earth" not "verify the earthing connection." "Got your P2?" not "ensure respiratory protection is available."
3. **No hedging.** "That's too windy" not "weather conditions may present some challenges."
4. **Acknowledge before challenging.** "Got it. One thing though..." not "You forgot to mention..."
5. **Never lecture.** If the worker has covered the hazard, say "Good" and move on. Don't repeat what they already said.
6. **End the conversation.** Don't keep asking questions after 1–2 challenges. Respect the worker's time.

---

## The Trust Model

For CoAssure to work, workers must trust it. Trust is built through three channels:

### 1. Competence Trust ("It actually knows things")

The AI must demonstrate genuine safety knowledge — not generic platitudes. When a worker says "I'm welding in a confined space," the AI must know that means atmospheric testing, ventilation, fire watch, and rescue plan. If the AI asks a dumb question, trust collapses immediately.

**How we build this:** Organisation-specific standards ingestion. Industry hazard databases. Weather and location context. The AI should know things the worker didn't expect it to know.

### 2. Benevolence Trust ("It's on my side")

The worker must believe CoAssure exists to protect them, not to police them.

**How we build this:**
- The CYA (Cover Your Arse) positioning: "If something goes wrong, this recording proves you did the checks."
- Worker-controlled data: they decide what to share, where to paste, what to flag
- No performance tracking, no task timing, no comparison between workers
- The AI celebrates good practice: "Good catch on the corrosion — worth flagging that"

### 3. Integrity Trust ("It won't be used against me")

The worker must believe that their voice recordings and transcripts won't be weaponised by management to punish them.

**How we build this:**
- Transparent data policy: recordings are processed for documentation, not for surveillance
- No individual performance dashboards for managers (only aggregate team data)
- Compliance with the NSW Digital Work Systems Amendment — no algorithmic management
- Option for workers to review and edit their transcript before submission

---

## Measuring Behavioral Change

The ultimate goal is not "more sessions completed." It is "workers who think differently about risk."

### What Good Looks Like

| Signal | What It Means |
|---|---|
| **Increasing hazard specificity** | Workers are naming specific hazards ("corroded bracket on the east wall") instead of generic ones ("all good"). They are observing, not reciting. |
| **Decreasing "lazy response" rate** | Fewer one-word answers. Fewer sessions that sound identical to yesterday's. The autopilot is disengaging. |
| **Voluntary usage** | Workers use CoAssure when they don't have to (e.g., free-tier users, or workers on days when no pre-start is required). They've internalised it as a thinking habit, not a compliance requirement. |
| **Peer influence** | Workers recommend CoAssure to colleagues. "You should try this — it actually asked me something I hadn't thought of." The behavior spreads without mandate. |
| **Reflection quality** | Post-job voice notes contain specific observations and near-miss reports, not just "job done." Workers are reflecting, not just closing out. |

### What Bad Looks Like

| Signal | What It Means |
|---|---|
| **Sessions under 10 seconds** | The worker is gaming it — pressing record, saying "all good," and moving on. The same problem as the paper form. |
| **Identical sessions day after day** | The worker has scripted their response. They are reciting, not thinking. |
| **Declining usage without mandate** | Workers stop using it when they're not forced to. It hasn't become a habit. |
| **Resistance or complaints about surveillance** | The tone or data practices have eroded trust. Urgent fix required. |

---

## The Long Game: From Tool to Habit

The ultimate success state for CoAssure is when the worker doesn't need the AI to prompt them — because the habit of verbalising their plan has become second nature.

The sequence:
1. **Dependence:** Worker relies on the AI to ask the right questions
2. **Competence:** Worker starts anticipating the AI's questions and addressing them proactively in their monologue
3. **Internalisation:** Worker's pre-start thinking becomes richer and more structured even without the app
4. **Culture:** The team norm shifts from "fill out the form" to "talk through the plan"

CoAssure succeeds when it makes itself less necessary — because the thinking it prompted has become the worker's own.
