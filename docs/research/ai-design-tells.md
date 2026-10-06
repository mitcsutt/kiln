# What makes a UI look AI-generated

Researched on 2026-10-06 from web search, page fetches, Hacker News, and GitHub metadata. Every finding below links to its source. Signal markers show how many independent sources back a claim: **multi** is three or more, **2** is two, **1** is one. Many sources are vendor blogs that sell a linter or a skill, so treat their taxonomies as opinion. Anthropic, The New Yorker, Adrian Krebs, Nielsen Norman Group and the convergence measurement are the stronger sources.

Five conclusions:

1. The first-order tells (Inter, indigo gradients, gradient text, three icon cards) are stale. A measurement of AI tools found they no longer produce them. They now converge on a warm ground, a brass or terracotta accent, a serif display face and tracked uppercase labels ([convergence study](https://ai-design-convergence.vercel.app/)).
2. Anthropic documents a persistent Claude house style: cream, serif display, italic accent words and a terracotta accent. It also says "don't use cream" instructions only move the model to another fixed palette ([Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)).
3. The tell is a default nobody chose, not a particular font or colour. Swapping the hue keeps the same structure and still reads as AI ([Generative Labs](https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same), [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).
4. Fonts on Anthropic's own "distinctive" list are the pool the model samples from. That includes Bricolage Grotesque, Newsreader, Fraunces and Space Grotesk.
5. What separates human work is specificity, a written reason for each choice, deliberate grid-breaking, mixed radii, imperfection and constraint. In the one measurement available, AI output had a 0px maximum radius and 0.78 to 0.92 grid adherence. The human median was 50px and 0.62 ([convergence study](https://ai-design-convergence.vercel.app/)).

## Why it happens

**Distributional convergence.** Anthropic says models "predict tokens based on statistical patterns", so output drifts to the most common design ([Anthropic, improving frontend design through skills](https://claude.com/blog/improving-frontend-design-through-skills)). Tailwind's demos used `bg-indigo-500`, and the model learned the median of every Tailwind tutorial on GitHub from 2019 to 2024 ([prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)).

**Measured.** Three AI tools from three companies sat closer to each other (distance 1.91 to 3.53) than two random award-winning sites (4.45). The study used 945 sites, one brief and three AI outputs, and its authors state those limits ([convergence study](https://ai-design-convergence.vercel.app/)).

**Toolchain defaults.** Tailwind, shadcn, Lucide and Framer Motion dominate the training data. shadcn was "explicitly designed to be copy-pasted by AI agents" ([signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design), [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)). Bento layouts became a default after v0, Lovable and Bolt trained on the template layer ([Sailop](https://sailop.com/blog/bento-grid-new-hero-ai-slop-2026)). HN commenters say shadcn with default styling "is like Bootstrap 10 years ago" ([HN 47178424](https://news.ycombinator.com/item?id=47178424)) and is "nearly immediately identifiable" ([HN 47984512](https://news.ycombinator.com/item?id=47984512)).

**Mood words map to typefaces.** Models pick a face from an adjective, not a decision ([genjutsu](https://genjutsu.athevon.dev/docs/tells)). Words like "modern", "clean" and "premium" steer every model to the same place ([convergence study](https://ai-design-convergence.vercel.app/)).

**Banning a tell moves the model to the next densest cluster.** This is the key finding, and it has four independent sources:

- Anthropic's prompting guide says generic negations shift Claude to a different fixed palette. It offers two fixes: give an explicit palette or spec, or have the model propose options before building ([Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)).
- Anthropic's own skill lists three convergent looks and says they are "defaults rather than choices" ([frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)).
- Tell a model to avoid purple and be distinctive and "it walks to the next densest cluster" ([CodeMySpec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)).
- Tim Schipper built a look in spring. Two months later Anthropic listed it as the machine median. "A site redesigned to avoid today's tells will be on the next version" ([Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).

Claude's look also resembles Anthropic's branding, and the frontend-design skill and Claude Design amplify it ([The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet)). A Medium author who made five decks with Claude found they converged on one house style by deck three to five ([Medium](https://medium.com/@nandini_92889/i-made-five-decks-with-claude-by-the-fifth-one-they-all-looked-like-the-same-deck-5dda862b7dff), 1 source).

## First-order tells

These are well known. The convergence study says AI tools mostly stopped producing them: "Nobody used Inter. Nobody made a purple gradient. Nobody shipped the rounded-card grid" ([source](https://ai-design-convergence.vercel.app/)). Humans and older tools still do.

| Tell                                   | What it looks like                                                                                                                 | Signal | Sources                                                                                                                                                                                                                                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Indigo or violet gradient              | Tailwind indigo-500 to purple, "the single loudest AI tell in 2026"                                                                | multi  | [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [925studios](https://www.925studios.co/blog/ai-slop-design-tells), [Krebs](https://adriankrebs.ch/blog/design-slop/)                                                                                   |
| Inter everywhere                       | Inter, Roboto, Open Sans, Lato, system fonts as the only family                                                                    | multi  | [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [Krebs](https://adriankrebs.ch/blog/design-slop/), [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/)                                                                       |
| Gradient text, three icon cards        | Gradient headline, three identical cards with an icon on top                                                                       | multi  | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [Krebs](https://adriankrebs.ch/blog/design-slop/)                                                                                                                                                                       |
| Fade-up on scroll, hover on every card | Every section fades up, every card has a hover transition, bounce easing                                                           | multi  | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md), [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                               |
| Coloured left-border cards             | One-sided accent border, "almost as reliable a sign of AI-generated design as em-dashes"                                           | multi  | [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), [pixelslop](https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md)                                                                                                      |
| Stock page order                       | Centered hero, pill badge, two CTAs, logo row, three cards, pricing CTA                                                            | multi  | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai)                                                                       |
| Badge chip above the H1                | Small pill or eyebrow directly over the headline                                                                                   | multi  | [Krebs](https://adriankrebs.ch/blog/design-slop/), [signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design)                                                                                                                                                                                 |
| Feature grids, steps, stat banners     | Icon-topped identical cards, numbered steps, stat rows                                                                             | multi  | [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)                                                                                                                                                                                                          |
| One radius and one soft shadow         | `rounded-2xl` on everything, `0 4px 6px rgba(0,0,0,.1)` under everything, nested cards                                             | multi  | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [Laith ban list](https://raw.githubusercontent.com/wiki/Laith0003/ux-skill/Anti-AI-slop-ban-list.md)                                       |
| Glass, glow, blobs                     | Backdrop blur with nothing behind it, coloured box-shadow glow, aurora gradients                                                   | multi  | [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it), [Joshua Snoddy](https://www.joshuasnoddy.com/blog/make-ai-built-site-not-look-ai/), [pixelslop](https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md)                  |
| shadcn and Tailwind defaults           | Zinc ramp, violet primary, stock radius, Lucide icons                                                                              | multi  | [Laith](https://uxskill.laithjunaidy.com/blog/shadcn-ui-looks-generic.html), [Sailop](https://sailop.com/blog/shadcn-ui-design-monoculture-2026), [Design Systems Collective](https://www.designsystemscollective.com/is-anyone-else-tired-of-every-tailwind-shadcn-app-looking-the-same-69c545e73114) |
| Lucide five, emoji icons               | Sparkles, Zap, Shield, Check, BarChart3; rocket and sparkle emoji as icons or headings                                             | multi  | [signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design), [Sailop](https://sailop.com/blog/shadcn-ui-design-monoculture-2026), [Deslopify](https://github.com/AntonioSpagnol/UI-Deslopify-Skill)                                                                                            |
| Generic imagery                        | Gradient blobs, Undraw or Storyset illustrations, fake avatars                                                                     | multi  | [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai), [Laith ban list](https://raw.githubusercontent.com/wiki/Laith0003/ux-skill/Anti-AI-slop-ban-list.md)                                                                                                                             |
| Generic copy                           | A headline that survives swapping the product name; "elevate", "seamless", "unleash"; round invented numbers and fake testimonials | multi  | [21st.dev](https://21st.dev/blog/website-not-look-ai-generated), [925studios](https://www.925studios.co/blog/ai-slop-design-tells), [genjutsu](https://genjutsu.athevon.dev/docs/tells), [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/)                                 |
| Permanent dark mode, neon accents      | Dark only, low-contrast grey text, cyan on dark                                                                                    | 2      | [pixelslop](https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md), [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)                                                                                                      |

Disagreements. Publishd says Lucide icons are fine ([source](https://publishd.app/blog/make-ai-built-site-not-look-ai)). A Reddit-mining study ranks bento, glass and aurora near the bottom of real complaints, and ranks shadcn and Tailwind defaults and AI purple at the top ([vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells), 1 source). The aurora ranking is flagged there as a keyword artifact.

## Second-order tells: the tasteful escapes

This is the most important section. These are the looks people reach for after banning the first-order list. Several sources say the escape is now the tell. The Reddit-mining study calls the cream, serif and sage "tasteful default" "just trading one default for another" ([source](https://github.com/JCarterJohnson/vibecoded-design-tells)). Even articles that teach "how to avoid AI look" recommend this look: warm off-black `#0d0b08`, burnt orange, Fraunces, serif plus mono, grain ([dev.to](https://dev.to/parweb/how-to-make-a-landing-page-that-doesnt-look-ai-generated-7-concrete-fixes-i83)).

| Tell                                  | What it looks like                                                                                                                                                                                                                                                          | Signal                    | Sources                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cream or warm paper plus terracotta   | Ground near `#F4F1EA`, rust accent near `#D97757`, serif display. `#D97757` is "Anthropic's own Claude-interaction accent, so on a user's brief it reads as a tell"                                                                                                         | multi                     | [Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), [claudeskills.org summary](https://www.claudeskills.org/docs/skills-cases/frontend-design), [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet), [Generative Labs](https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same), [convergence study](https://ai-design-convergence.vercel.app/), [genjutsu](https://genjutsu.athevon.dev/docs/tells) |
| Hue-swapped versions                  | "The mint-and-forest palette is the cream default spoken in green. The near-black-and-gold one is the same structure after dark: the field darkens, the accent turns gold, the roles never change"                                                                          | 1, citing Anthropic       | [Generative Labs](https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same)                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Near-black plus one acid accent       | Tinted near-black (`#0B0B0B`, `#111`) with acid green or vermilion. The author of one source found his own site matched                                                                                                                                                     | 2                         | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)                                                                                                                                                                                                                                                                                                      |
| Serif display plus italic accent word | A large serif headline with one italic or highlighted word. Anthropic's skill tells the model to avoid single-word emphasis in headlines                                                                                                                                    | multi                     | [Krebs](https://adriankrebs.ch/blog/design-slop/), [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet), [Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), [frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)                                                                                                                                       |
| Serif as an AI-brand signal           | Serif wordmarks used by AI companies to signal "real humans use it"                                                                                                                                                                                                         | 1                         | [Substack](https://keyavadgama.substack.com/p/the-serif-renaissance-in-ai-branding)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Tracked caps and mono eyebrows        | Letter-spaced uppercase label above headings, `A · B · C` meta strings, mono labels, `→` on every link                                                                                                                                                                      | multi                     | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet), [signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design)                                                                                                                                              |
| Mono beyond code                      | Monospace on labels, nav and captions. Suggesting mono as a fix is itself the cliché                                                                                                                                                                                        | multi                     | [genjutsu](https://genjutsu.athevon.dev/docs/tells), [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [pixelslop](https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md)                                                                                                                                                                                                                                                                                                                                                  |
| Numbered markers                      | `01 / 02 / 03` on content that is not a sequence                                                                                                                                                                                                                            | multi                     | [Krebs](https://adriankrebs.ch/blog/design-slop/), [genjutsu](https://genjutsu.athevon.dev/docs/tells), [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)                                                                                                                                                                                                                                                                                                                      |
| Hard-offset neo-brutalist shadows     | Thick black border, `4px 4px 0` shadow, cream ground, saturated yellow, coral or violet, press-down hover. OMORO calls it "already saturated in the startup and portfolio space". No source says outright "neo-brutalism is an AI tell", but it is a prompt-library default | multi (saturation claims) | [OMORO](https://www.omoro.io/styles/neo-brutalism), [NN/g](https://www.nngroup.com/articles/neobrutalism/), [Soft Neo-Brutalism prompt](https://spark.entire.vc/prompts/vb-soft-neo-brutalism-design), [design-agent.dev](https://design-agent.dev/blog/2026-08-26-neobrutalism-computable-aesthetic/), [webuiprompt](https://www.webuiprompt.com/design/neo-brutalism)                                                                                                                                                                                                    |
| Grain and noise overlay               | Anthropic's older skill text suggests "gradient meshes, noise textures ... and grain overlays". Blogs recommend a 3.5% grain overlay as the human move. No source names grain as a tell. **Inference**                                                                      | inference                 | [edxeth gist](https://gist.github.com/edxeth/c9669f46a04687375fd9150c4874286e), [dev.to](https://dev.to/parweb/how-to-make-a-landing-page-that-doesnt-look-ai-generated-7-concrete-fixes-i83)                                                                                                                                                                                                                                                                                                                                                                              |
| Editorial zero radius                 | Hairline rules on every row, zero radius, dense columns on non-editorial content ("broadsheet cosplay"). The measurement found 0px corners are the AI outlier                                                                                                               | 2, plus 1 measurement     | [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [claudeskills.org summary](https://www.claudeskills.org/docs/skills-cases/frontend-design), [convergence study](https://ai-design-convergence.vercel.app/)                                                                                                                                                                                                                                                                                                                                  |
| Fake specifics                        | Fake product screenshots built from styled divs, decorative sparklines, status dots, build numbers, "Est. 1987", weather strip, poetic section labels ("From the Field"), "Quietly Trusted By"                                                                              | 1                         | [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Ticker bars, word strips              | Scrolling text bars; a `TYPE / FORM / MOTION` strip under the hero                                                                                                                                                                                                          | 1 each                    | [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet), [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                                                                                                                                                                                                                                                                                                                                                                            |
| Claude dashboards                     | Multiple rounded rectangle outlines, sometimes a neon glow underneath                                                                                                                                                                                                       | 1                         | [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet)                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Staggered page-load reveal            | Promoted by Anthropic's cookbook prompt and by dev.to. **Inference** that it becomes a tell                                                                                                                                                                                 | inference                 | [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [dev.to](https://dev.to/parweb/how-to-make-a-landing-page-that-doesnt-look-ai-generated-7-concrete-fixes-i83)                                                                                                                                                                                                                                                                                                                                                         |

Anthropic's current skill groups the second wave into five clusters. Capital and Compute names the same five: warm editorial (cream and terracotta), dark signal (near-black and acid accent), broadsheet cosplay, SaaS card kit, and template chrome ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md)). The skill adds that "all traits are legitimate for some briefs, but they are defaults rather than choices". Tim Schipper's warning applies: "Do not chase the list. Anthropic's grew from three items to five in eleven weeks" ([source](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).

Pure `#000` and `#fff` read as "I didn't think about it" ([pixelslop](https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md), [designmd.me](https://designmd.me/blog/make-your-ai-built-website-look-less-like-ai)). The warm off-black fix is now itself a default.

## Fonts

Fonts named as AI or LLM defaults:

| Font                                                           | Evidence                                                                                                                              | Sources                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inter                                                          | Universal first-order tell                                                                                                            | [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [Krebs](https://adriankrebs.ch/blog/design-slop/), [925studios](https://www.925studios.co/blog/ai-slop-design-tells), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics) (to avoid)                          |
| Space Grotesk                                                  | Anthropic: "You still tend to converge on common choices (Space Grotesk)". Krebs lists it as a common LLM combination                 | [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [Krebs](https://adriankrebs.ch/blog/design-slop/), [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/) ("already overused even though libre")                                                        |
| Instrument Serif                                               | On Krebs's list. "Went from cool nod to default output of LLM-assisted and vibe-coded web work" (quote seen only in a search snippet) | [Krebs](https://adriankrebs.ch/blog/design-slop/), [UGA](https://agtechdata.uga.edu/ai-has-come-for-serif-fonts/) (snippet only), [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                                                                                                                                                         |
| Fraunces                                                       | 2 of 5 tools independently chose it in the convergence study. In Anthropic's default house style. "Display face by reflex"            | [convergence study](https://ai-design-convergence.vercel.app/), [Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), [genjutsu](https://genjutsu.athevon.dev/docs/tells), [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/) |
| Geist                                                          | On Krebs's list. "Increasingly its own fingerprint". Ships with Next.js and v0                                                        | [Krebs](https://adriankrebs.ch/blog/design-slop/), [Sailop](https://sailop.com/blog/how-to-make-ai-website-look-unique), [signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design)                                                                                                                                                                  |
| JetBrains Mono                                                 | "If programming-related, you get JetBrains Mono". Anthropic's own "Code" pick                                                         | [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)                                                                                                                                                                                         |
| Playfair Display                                               | Anthropic's own "Editorial" pick and in its default house style                                                                       | [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)                                                                                                                          |
| Poppins, Montserrat, Roboto, Open Sans, Lato                   | Classic defaults                                                                                                                      | [designmd.me](https://designmd.me/blog/make-your-ai-built-website-look-less-like-ai), [aitoolpick](https://aitoolpick.org/blog/ai-generated-website-checklist/), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)                                                                                          |
| Clash Display, Satoshi, Cabinet Grotesk, General Sans, Switzer | "AI starter pack ... a look, not a choice". Anthropic's "Startup" picks are the first three                                           | [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)                                                                                                                                                  |
| Sora, Plus Jakarta Sans                                        | "Already overused even though libre"                                                                                                  | [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/)                                                                                                                                                                                                                                                       |
| Söhne                                                          | One search-result summary lists it as overused (weak, 1 source). Another source recommends it as an escape                            | [UGA](https://agtechdata.uga.edu/ai-has-come-for-serif-fonts/) (snippet only), [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it) (contradicts)                                                                                                                                                                    |

DM Sans appears only as an Inter alternative in one checklist. No source calls it an AI default ([aitoolpick](https://aitoolpick.org/blog/ai-generated-website-checklist/)).

**Fonts in Anthropic's own "distinctive" lists.** The cookbook groups them by category ([cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [blog](https://claude.com/blog/improving-frontend-design-through-skills)):

- Code: JetBrains Mono, Fira Code, Space Grotesk.
- Editorial: Playfair Display, Crimson Pro, Fraunces.
- Startup: Clash Display, Satoshi, Cabinet Grotesk.
- Technical: IBM Plex, Source Sans 3.
- Distinctive: Bricolage Grotesque, Obviously, Newsreader.

Being on that list puts a font in the model's sampling pool. Bricolage Grotesque and Newsreader also appear in Hallmark's typography tables ([Hallmark](https://github.com/nutlope/hallmark/blob/HEAD/skills/hallmark/references/typography.md)). **Inference:** no source has flagged those two by name as tells, but their presence on these lists makes them likely candidates.

**Fonts not found named as AI defaults anywhere.** These have no negative evidence in the 2026 sources searched. Absence of evidence is not safety, because all three sit in LLM-oriented "use this instead" lists, which raises their odds of being sampled. **Inference:** the pool effect.

- Schibsted Grotesk: used as an escape font, and one commit says it "dodges the convergent AI font flag" ([commit](https://github.com/avrignaud/seattledogparkdata/commit/8074b76b4bed7810a5ecc536102d8dfa59b93ec5), [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/)). Fontduet pairs it with Newsreader ([Fontduet](https://fontduet.com/schibsted-grotesk-newsreader)).
- Martian Mono: offered as an escape from Geist Mono ([typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/), [Evil Martians](https://github.com/evilmartians/mono/)).
- Big Shoulders: offered as an escape from Clash Display, and on Hallmark's brutalist row ([typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/), [Hallmark](https://github.com/nutlope/hallmark/blob/HEAD/skills/hallmark/references/typography.md)).

## What reads as intentional

| Technique                                                 | Why                                                                                                                                                                    | Source                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write the reason for every choice and keep it in the repo | If you cannot give the reason in one sentence, it is a default                                                                                                         | [Tim Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                                                                                                                                                                                                                                     |
| Specific content that cannot be swapped                   | Real numbers, names, dates, product screenshots. "Cover the logo and read the headline"                                                                                | [21st.dev](https://21st.dev/blog/website-not-look-ai-generated), [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [Laith](https://raw.githubusercontent.com/wiki/Laith0003/ux-skill/Anti-AI-slop-ban-list.md)                                                                                                                                 |
| Derive colour from a real subject, with named hex roles   | One colour with a reason, neutrals derived from it. A soft subject can still collapse to cream and rust                                                                | [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [21st.dev](https://21st.dev/blog/website-not-look-ai-generated)                                                                                                                                                                                                                              |
| Break the grid on purpose                                 | Asymmetry earned by content. The expressive human sites in the measurement have low grid adherence                                                                     | [Sailop](https://sailop.com/blog/bento-grid-new-hero-ai-slop-2026), [convergence study](https://ai-design-convergence.vercel.app/), [Creative Boom](https://www.creativeboom.com/insight/louise-sloper-on-the-typography-trick-that-most-designers-get-backwards/)                                                                                                        |
| Mixed radii by role                                       | Pill for pills, nested radius equals outer minus padding. Human median max radius is 50px, AI is 0px                                                                   | [convergence study](https://ai-design-convergence.vercel.app/), [designmd.me](https://designmd.me/blog/make-your-ai-built-website-look-less-like-ai), [Setproduct](https://www.setproduct.com/blog/bento-grid-layout-design-guide)                                                                                                                                        |
| Less common or commissioned type                          | "Most brands still reach for the same 10-15 typefaces". Paid foundries are not OFL, so they cannot ship in an open package                                             | [typography-expert](https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/), [CID Creative](https://www.cidcreative.com/insights/handmade-typography-humanized-fonts-2026/), [Hallmark](https://github.com/nutlope/hallmark/blob/HEAD/skills/hallmark/references/typography.md)                                                               |
| Handmade, imperfect marks                                 | Uneven line weights, hand-lettering, texture. NN/g warns that paper-grain textures are already everywhere                                                              | [NN/g](https://www.nngroup.com/articles/handmade-designs/), [CID Creative](https://www.cidcreative.com/insights/embracing-imperfection-humanizing-design-ai-age/), [365i](https://www.365iwebdesign.co.uk/news/2026/01/23/website-imperfection-trust-advantage/)                                                                                                          |
| Real photos and real product UI                           | "One photo of your actual product, shop or team does more than six icons"                                                                                              | [dropthehassle](https://dropthehassle.com/guides/make-website-look-less-ai), [DesignRush](https://news.designrush.com/custom-web-design-still-wins-ai-saturated-2026)                                                                                                                                                                                                     |
| Constraint and one bold moment                            | "Spend your boldness in one place". Three fonts at most, one primary per view                                                                                          | [frontend-design SKILL.md](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md), [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai), [Developers Digest](https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it)                                                                                 |
| Vary rhythm                                               | Change section padding and container width, break the pattern every two or three sections                                                                              | [Anti-AI-UI](https://github.laiyagushi.com/Vanszs/Anti-AI-UI), [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai)                                                                                                                                                                                                                                       |
| Reference a concrete source, not adjectives               | A screenshot plus "this density, this rhythm", or "1970s ski lodge"                                                                                                    | [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)                                                                                                 |
| Get variance from outside the model                       | Have the model propose options, and pick from outside the pipeline                                                                                                     | [Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), [Medium](https://medium.com/@nandini_92889/i-made-five-decks-with-claude-by-the-fifth-one-they-all-looked-like-the-same-deck-5dda862b7dff), [Generative Labs](https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same) |
| Show sources and honest imperfection                      | Evidence-linked testimonials, uneven feature lists ("one that is genuinely better, one that is a workaround")                                                          | [publishd](https://publishd.app/blog/make-ai-built-site-not-look-ai), [21st.dev](https://21st.dev/blog/website-not-look-ai-generated)                                                                                                                                                                                                                                     |
| Type details agents omit                                  | Negative tracking above about 32px, five type sizes, line length under 80ch, size jumps of 3x or more. Very tight oversized display is itself a "heavy grotesque" tell | [designmd.me](https://designmd.me/blog/make-your-ai-built-website-look-less-like-ai), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [genjutsu](https://genjutsu.athevon.dev/docs/tells)                                                                                                                            |

Measured: AI output used 10 to 13 distinct type sizes against a human median of 8 ([convergence study](https://ai-design-convergence.vercel.app/), 1 source).

## What people actually do

Reddit evidence comes through aggregator snapshots and a Reddit-mining repo, not the original threads.

**Recurring workflows.** Marked [3+] where three or more places report them.

1. **[3+] Reference first.** Collect three to five real sites, have a vision model reverse them into a written spec, and use that as the constraint ([Robots on Payroll](https://robotsonpayroll.substack.com/p/how-to-avoid-that-vibe-coded-look), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [dev.to](https://dev.to/laurilllll/how-i-built-15-website-templates-with-an-ai-coding-agent-in-a-week-5f0h)).
2. **[3+] A persistent DESIGN.md or token file read on every task.** Without one, "each new page is generated from scratch and drifts back toward the defaults" ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [CodeMySpec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same), [HN 49117099](https://news.ycombinator.com/item?id=49117099)).
3. **[3+] Direction first, then a filter.** "A rule list removes defaults but cannot invent direction" ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/)). Anthropic's skill uses a plan, review, build, critique loop ([anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
4. **[3+] A critique-and-fix loop** instead of a cleverer first prompt ([superdesign](https://superdesign.dev/blog/fix-generic-ai-landing-page), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
5. **[3+] Banned lists of tells.** See below.
6. **[3+] Name a specific design system or reference.** "If you let it decide, it will always default to its training data" ([Reddit snapshot](https://reddit.sentinel-team.org/posts/1qccb1g/snapshots/2026-01-15T02%3A51%3A22.564978Z), [prg.sh](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website), [awesome-design-md](https://github.com/VoltAgent/awesome-design-md)).
7. **[2] Start from an image, then convert it.** The commenter sells a product, so treat it as biased ([HN 49117099](https://news.ycombinator.com/item?id=49117099)).
8. **[2] A human design process, iterated.** Commenters said the result "still looks vibe coded" ([HN 49901973](https://news.ycombinator.com/item?id=49901973)).
9. **[2] A different structure per brief** ([Hallmark](https://github.com/Nutlope/hallmark), [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
10. **[2] Deterministic scanners in CI.** Slop Cop scores DOM and computed style with Playwright and is deliberately not an LLM judge ([Slop Cop](https://slopcop.adriankrebs.ch), [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells)).
11. **[1] Design in another tool, then hand over** ([HN 49117099](https://news.ycombinator.com/item?id=49117099), [daily.dev](https://daily.dev/posts/how-to-use-claude-design-to-make-sites-10x-more-beautiful-sj0iaykzv)).
12. **[1] Set tokens once.** One radius, one shadow level, one body and heading family ([CodeMySpec](https://codemyspec.com/blog/vibe-coded-websites-look-the-same)).

**Banned lists in circulation.**

- Anthropic cookbook snippet quoted in HN: avoid "excessive centered layouts, purple gradients, uniform rounded corners, and Inter font" ([HN 46956964](https://news.ycombinator.com/item?id=46956964)).
- Krebs's 16-tell list. Of 1,590 Show HN sites, 22% were high risk (four or more patterns) and 32% medium ([Krebs](https://adriankrebs.ch/blog/design-slop/), [HN 47864393](https://news.ycombinator.com/item?id=47864393)).
- Reddit mining (46,971 on-topic posts): shadcn and Tailwind defaults, AI purple gradients, gradient hero text, neon glow and emoji icons rank highest ([vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells)).
- Anthropic's skill also bans single-word headline accents, all-caps labels, unnecessary labels above content, numbered markers on non-sequences, `'A · B · C'` meta strings and `→` on every link ([frontend-design SKILL.md](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
- Impeccable: no overused fonts, no gray text on coloured backgrounds, no nested cards, no bounce easing ([Impeccable](https://github.com/pbakaus/impeccable)).

**Notable GitHub repos.** Stars and last-push dates from `gh` on 2026-10-06. Stars are a hype signal, not quality evidence, and none of these was tested.

| Repo                                                                                              | Stars on 2026-10-06  | What it is                                                                                     |
| ------------------------------------------------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------- |
| [anthropics/skills](https://github.com/anthropics/skills/tree/main/skills/frontend-design)        | 179,792 (whole repo) | Official frontend-design skill with a plan and critique pass and a list of "AI tells" clusters |
| [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)                     | 119,680              | 73+ brand DESIGN.md files for dropping into a project root                                     |
| [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)                                   | 92,842               | Skill with three dials (variance, motion, density), pre-flight checks and a redesign audit     |
| [pbakaus/impeccable](https://github.com/pbakaus/impeccable)                                       | 77,063               | About 24 commands, PRODUCT.md and DESIGN.md, deterministic anti-pattern checks                 |
| [emilkowalski/skills](https://github.com/emilkowalski/skills)                                     | 43,673               | Motion and interaction craft skill                                                             |
| [Nutlope/hallmark](https://github.com/Nutlope/hallmark)                                           | 29,650               | Build, audit, redesign and study verbs; 21 themes; 57 slop gates                               |
| [jnsahaj/tweakcn](https://github.com/jnsahaj/tweakcn)                                             | 10,436               | Visual theme editor for shadcn/ui tokens                                                       |
| [miqdadbadjuber/anti-slop](https://github.com/miqdadbadjuber/anti-slop)                           | 4,535                | 38 rules in three tiers, "a filter, not a style guide"                                         |
| [bergside/awesome-design-skills](https://github.com/bergside/awesome-design-skills)               | 3,057                | 67 DESIGN.md and SKILL.md files                                                                |
| [kzhrknt/awesome-design-md-jp](https://github.com/kzhrknt/awesome-design-md-jp)                   | 985                  | CJK-aware DESIGN.md set                                                                        |
| [JCarterJohnson/vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells) | 508                  | Reddit-mined tell ranking, a skill and a scanner                                               |
| [senlindesign/taste-skill](https://github.com/senlindesign/taste-skill)                           | 380                  | Reverse-engineers a site into tokens                                                           |
| [funboy322/avoid-ai-design](https://github.com/funboy322/avoid-ai-design)                         | 92                   | Scanner and rewriter with 67 tells, including cream and terracotta                             |
| [febbhav/signs-of-ai-design](https://github.com/febbhav/signs-of-ai-design)                       | 24                   | Catalogue of tells                                                                             |
| [DonkeyKing01/tasteful-ui-skill](https://github.com/DonkeyKing01/tasteful-ui-skill)               | 17                   | References to executable design docs                                                           |

**Counter-opinions.**

- Sameness is fine. "The best design for a site with real utility is legibility." Replies say uniqueness is a costly signal and that sameness suggests low effort ([HN 48316416](https://news.ycombinator.com/item?id=48316416)).
- It predates the models. "The beige-serif-sparkle look predates the models," from a self-described working designer ([HN 49117099](https://news.ycombinator.com/item?id=49117099)). Krebs notes that everything looked like Bootstrap before AI ([Krebs](https://adriankrebs.ch/blog/design-slop/)).
- The problem is substance, not styling. A scanner "cannot tell you whether the thing in the hero is what a visitor came for" ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [HN 47864393](https://news.ycombinator.com/item?id=47864393)).
- Whack-a-mole. Replacing one default look with another resets the clock ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [frontend-design SKILL.md](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
- Process does not always help. A commenter said their taste "lines up with" the model's training, so the app "looks like ai anyway" ([HN 49901973](https://news.ycombinator.com/item?id=49901973)).
- Small edits redraw everything, "but slightly more beige" ([HN 46956964](https://news.ycombinator.com/item?id=46956964)).
- Templates are a starting point, not slop, per one template author ([dev.to](https://dev.to/laurilllll/how-i-built-15-website-templates-with-an-ai-coding-agent-in-a-week-5f0h)).
- No strong source rebuts the DESIGN.md approach. The objections are about sufficiency.

## Tools and services

Prices were checked on 2026-10-06. "Secondary" means the figure came from an aggregator or review page, not the vendor. UNVERIFIED means it was not confirmed. Slop-risk ratings are the researcher's judgement unless a source is cited. The vendor pages often returned truncated content, so many prices are secondary.

### Claude Design

- Launched 2026-04-17 by Anthropic Labs as a research preview, powered by Opus 4.7 ([Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs), [VentureBeat](https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma)).
- Included in Pro, Max, Team and Enterprise at no separate fee. Enterprise admins must enable it. Pro is $17/mo annual or $20/mo monthly, Max from $100/mo, Team $20/seat annual standard or $100/seat premium ([Claude pricing](https://claude.com/pricing), fetched 2026-10-06).
- It builds a design system from your codebase and design files, and later projects reuse it. Outputs include a share URL, PDF, PPTX, standalone HTML, Canva, and a handoff bundle for Claude Code ([Anthropic](https://www.anthropic.com/news/claude-design-anthropic-labs)).
- Limits (secondary): a separate weekly pool. PCWorld reportedly saw 80% of a Pro allowance burn in 25 minutes. A May 2026 article says limits were doubled, which is UNVERIFIED beyond a search snippet ([eesel](https://www.eesel.ai/blog/claude-design-review-2026), [Flowstep](https://flowstep.ai/blog/claude-design-review/), [pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/2814/claude-design-doubled-limits-2026)).
- Reception (secondary, UNVERIFIED in detail): Reddit called it "resounding meh" with near-identical outputs (serif headings, status dots, coloured accent bars). Defaults come from the built-in frontend-design skill, giving "Anthropic's house aesthetic". The HN thread was small ([PromptZone](https://www.promptzone.com/farrah_dubois/claude-design-hn-discussion-insights-1o5b.md), eesel, Flowstep). Other reviews: [DataCamp](https://www.datacamp.com/blog/claude-design), [Anima](https://animaapp.com/blog/ai-design-en/claude-design-review-features-pros-cons-and-best-alternatives/), [Design Systems Collective](https://www.designsystemscollective.com/claude-design-just-launched-a-designers-first-walkthrough-c79d7ce47b9b).
- No documented token-level export (CSS variables or DTCG JSON) was found. UNVERIFIED either way.

### AI UI generators

| Tool           | Price (2026-10-06)                                                                                            | Slop risk              | Link                                                                                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| v0             | Free ($0, 7 msgs/day); Plus $30/mo; Business $100/mo                                                          | High (shadcn defaults) | [pricing](https://v0.app/pricing)                                                                                |
| Lovable        | Pro $25/mo, 100 credits (secondary); Free 5 daily credits                                                     | High                   | [pricing](https://lovable.dev/pricing), [eesel](https://eesel.ai/blog/lovable-pricing)                           |
| Bolt           | Free; Pro $25/mo; Teams $30/member                                                                            | High                   | [pricing](https://bolt.new/pricing)                                                                              |
| Figma Make     | Included in paid Full seats; Professional Full $16/mo with 3,000 AI credits; Starter free with 500 credits/mo | Medium                 | [pricing](https://www.figma.com/pricing/)                                                                        |
| Google Stitch  | Free in Labs (limits differ by source, secondary); paid tier expected Q4 2026 (secondary, UNVERIFIED)         | Medium-high            | [Stitch](https://stitch.withgoogle.com/), [Banani](https://www.banani.co/blog/google-stitch-pricing-and-credits) |
| Magic Patterns | Hobby $20/mo, Pro $100/mo (secondary)                                                                         | Medium                 | [vp0](https://vp0.com/blogs/magic-patterns-pricing-plans-2026/)                                                  |
| Subframe       | Free tier; Pro $29/editor/mo (secondary, aggregator)                                                          | Medium                 | [aisotools](https://aisotools.com/pricing/subframe)                                                              |
| UX Pilot       | UNVERIFIED (page showed no prices)                                                                            | Medium-high            | [pricing](https://uxpilot.ai/pricing)                                                                            |

Galileo (now Stitch), Relume and Framer AI were not researched. The generators produce pages, not token sets, so they fit Kiln poorly. One 2026 comparison says first-draft output has converged across tools ([superdesign](https://superdesign.dev/blog/i-tested-8-ai-ui-generators)).

### Theme and token tools

| Tool             | Price                                    | Slop risk                                                                                           | Link                                                                                               |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| tweakcn          | Free editor; Pro $8/mo (secondary)       | Medium. The shadcn variable shape is not Kiln's role-based tokens, and AI themes tend to the median | [tweakcn](https://tweakcn.com/), [DesignRevision](https://designrevision.com/alternatives/tweakcn) |
| Leonardo (Adobe) | Free, open source                        | Low                                                                                                 | [leonardocolor.io](https://leonardocolor.io/)                                                      |
| Realtime Colors  | Free                                     | Low-medium                                                                                          | [realtimecolors.com](https://realtimecolors.com/)                                                  |
| Huemint          | Free                                     | Medium                                                                                              | [huemint.com](https://huemint.com/about/)                                                          |
| Coolors          | Pro $3/mo annual, $5 monthly (secondary) | Medium                                                                                              | [Toolradar](https://toolradar.com/tools/coolors/pricing)                                           |
| Tokens Studio    | Price UNVERIFIED                         | Low, but heavy for four CSS files                                                                   | [tokens.studio](https://tokens.studio)                                                             |

oklch.com, Radix Colors, Atmos and shadcn theme galleries were not fetched (UNVERIFIED).

### Type sources

**Licensing warning.** Fontshare is not uniformly OFL. Per search results, its "closed source" fonts fall under ITF's Free Font License. They cannot be redistributed or modified, and you must point users to fontshare.com. Only its "open source" subset is OFL. Bundling a closed-source Fontshare font in a published npm package likely breaches that. The licence text was not read directly, so verify per font ([ITF licensing](https://www.indiantypefoundry.com/licensing), [licenseorg](https://licenseorg.com/guide/fonts/fontshare), secondary).

| Source                                              | Price                                          | Slop risk                                                                                                                                    | Link                                                                                                                  |
| --------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Google Fonts, lesser-used families                  | Free, OFL                                      | Low if you avoid Inter, Roboto, Space Grotesk and Poppins. Family examples in the note come from background knowledge, not verified that day | [fonts.google.com](https://fonts.google.com)                                                                          |
| Fontshare, OFL subset only                          | Free                                           | Low, licence-gated                                                                                                                           | [licences](https://www.fontshare.com/licenses)                                                                        |
| Velvetyne, Collletttivo, Use & Modify, Open Foundry | Free, mostly OFL (UNVERIFIED, check each file) | Very low                                                                                                                                     | [Velvetyne](https://velvetyne.fr), [Collletttivo](https://www.collletttivo.it), [Use & Modify](https://usemodify.com) |
| Typewolf, Fonts In Use                              | Free to browse                                 | n/a, pairing references                                                                                                                      | [Typewolf](https://www.typewolf.com), [Fonts In Use](https://fontsinuse.com)                                          |
| Paid indie foundries                                | UNVERIFIED                                     | Not OFL, cannot ship in an open package                                                                                                      | none                                                                                                                  |

### Inspiration and human help

| Option                                                                         | Price                                                                              | Slop risk                                                    | Link                                                                                                    |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Mobbin                                                                         | About $10/mo in one source, $40/seat/mo annual in another. Conflicting, UNVERIFIED | Low                                                          | [PricingSaaS](https://pricingsaas.com/companies/mobbin)                                                 |
| Are.na                                                                         | Free to 200 blocks; Premium $7/mo or $70/yr                                        | Low                                                          | [Are.na](https://www.are.na/editorial/on-pricing)                                                       |
| Godly, Siteinspire, Land-book, Httpster, Hoverstat.es, Cosmos, Savee, Dribbble | Price UNVERIFIED                                                                   | Dribbble high (polished, unbuilt mockups); others low-medium | none                                                                                                    |
| Contra freelancer                                                              | About $50-150/hr, range $25-150+ (secondary)                                       | n/a                                                          | [Contra](https://contra.com/p/72voOMQM-freelance-designer-rates-explained-what-businesses-need-to-know) |
| Free critique communities                                                      | Free, quality varies                                                               | n/a                                                          | [Primary Tech](https://primarytech.com/?p=3943)                                                         |

Layers and Dribbble hire returned nothing relevant (UNVERIFIED).

### Is Claude Design better suited?

**Verdict: no, not as a replacement for Claude Code.** The task is editing a small set of token CSS files in an existing repo.

- Claude Code edits them directly, runs Storybook and axe, and sees contrast failures.
- Claude Design's documented output is prototypes and a handoff bundle, with no confirmed token export.
- Reviewers report a recognisable house aesthetic, which is the problem under study.
- It draws on a separate, tight weekly allowance (secondary reports).

It could help with visual exploration of a direction, with its design system seeded from the repo. It costs nothing extra on an existing Pro or Max plan, so a one-hour trial is cheap. The strongest anti-slop lever is human art direction, meaning references and font choice, not the tool.

**How it combines with Claude Code.** A person picks references and fonts by hand. Claude Design (optional) explores layouts against the existing design system. Claude Code then encodes the chosen direction as tokens and verifies it in Storybook with axe across themes. An HN commenter describes the same split: "bang out the aesthetic first in Claude Design and then serve it to Claude Code to follow" ([HN 49117099](https://news.ycombinator.com/item?id=49117099)).

### Best value for Kiln

1. Claude Code plus human-chosen references. No extra cost on a Claude plan ([pricing](https://claude.com/pricing)).
2. Lesser-used Google Fonts families, plus Velvetyne or Collletttivo files after a licence check. Free ([Google Fonts](https://fonts.google.com)).
3. Leonardo for contrast-driven colour scales. Free ([Leonardo](https://leonardocolor.io/)).
4. Reference gathering with Typewolf, Fonts In Use, the Are.na free tier and curated galleries. Free to $7/mo; gallery prices UNVERIFIED ([Are.na](https://www.are.na/editorial/on-pricing)).
5. A Claude Design trial for exploration only, included in Pro. As an alternative for this slot, a single paid Contra critique at roughly $50-150/hr ([pricing](https://claude.com/pricing), [Contra](https://contra.com/p/72voOMQM-freelance-designer-rates-explained-what-businesses-need-to-know)).

Dropped from the ranking: v0, Lovable and Bolt (page generators with high slop risk), and tweakcn (the shadcn variable model does not map to Kiln roles; usable as a free OKLCH playground).

## How Kiln applies this

The first Kiln themes matched the second-order tells above, so [ADR 0030](../adr/0030-theme-family-without-ai-tells.md) reworked two of them and added two. The fix this research supports is a specific real-world subject for each theme, applied consistently, with a one-line reason for every choice written next to the value in the stylesheet.

| Theme        | Old tell matched                                                            | New subject                                                          | Fonts                                                      | Colour source                                                                                                                  |
| ------------ | --------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `paper`      | Warm cream paper, graphite ink and a book serif                             | An office print: white sheets on grey recycled stock, blue-black ink | Golos Text and Atkinson Hyperlegible Mono, no serif        | Cool grey stock, near-white sheets, blue-black ink as the accent, non-photo blue for "you"                                     |
| `ledger`     | Mint canvas with forest green (the cream tell in another hue), mono figures | An accountant's columnar pad                                         | Archivo, with figures set condensed through its width axis | White sheet with green rules, banknote-green actions, accounting red, highlighter yellow                                       |
| `flightdeck` | New preset                                                                  | A glass-cockpit flight display                                       | B612 and B612 Mono, designed for Airbus cockpit displays   | The cockpit colour convention: cyan for what the pilot sets, a reverse-video box for selected, green, amber and red for status |
| `riso`       | New preset                                                                  | A two-drum risograph zine                                            | Shantell Sans, drawn from the artist's handwriting         | Fluorescent pink and blue spot inks on white stock, screen tints instead of borders                                            |

Golos Text was drawn by Paratype for a national public-services website, with a plain zero, true tabular figures and distinct I, l and 1. Its bundle has no italic, so italics are synthesised.

`monograph` and `fiesta` are kept unchanged as legacy presets. They still carry some of the tells (an ember accent and serif display, an apricot canvas with hard offsets), so `tells.test.ts` exempts them, and they are not the model for new themes. Their fonts, Newsreader and Bricolage Grotesque among them, moved out of the base stylesheet into the presets that use them.

What is enforced. `packages/ui/src/themes/tells.test.ts` runs against `paper`, `ledger`, `flightdeck` and `riso`, and every font stylesheet except the legacy ones:

- No banned font family (the list in DESIGN.md §2, which matches the test).
- No warm-cream light canvas: lightness above 0.85, chroma above 0.008 and hue 40 to 100.
- No ember, terracotta or indigo accent: chroma above 0.08 with hue 25 to 60 (ember), or hue above 262 up to 300 (indigo).

The rest of DESIGN.md §2 ("Second-order tells") is a review checklist: near-black plus one acid accent, mint with forest green, hard shadows on static surfaces, grain or halftone, monospace beyond code, and a serif display with an italic accent word. DESIGN.md also asks every new theme for a deliberate mix of radii and a one-line reason for each choice.

The banned list will go stale as model defaults move. Revisit it when this research is refreshed, and change the test and DESIGN.md together.

## Caveats

- Many sources are vendor or SEO blogs that sell a linter or skill (Sailop, Impeccable, DesignMD, Laith ux-skill, 21st.dev). Their taxonomies overlap and probably copy each other, so counting them as independent is generous. Independent signal comes from Anthropic, The New Yorker, Krebs, NN/g, the convergence study, Tim Schipper's first-person account and the Reddit-mining study.
- The convergence study has three measurable AI outputs, one brief and one industry. It is the only source for the radius, grid and type-scale numbers.
- Reddit evidence comes from aggregator snapshots and a Reddit-mining repo, so subreddit names are often unknown. The original threads were not opened. X, Bluesky and YouTube were not covered.
- Some quotes were seen only in search snippets and are unverified. The UGA article failed to fetch (SSL error), so its Instrument Serif and Söhne claims are snippet-only. The "reverse squint test" and the Claude Design Reddit reception are also unverified summaries.
- The Reddit-mining repo is `JCarterJohnson/vibecoded-design-tells` (508 stars). `HugoGarcez/vibecoded-design-tells` is a 0-star fork of it, so the research cites the original and the fork adds no independent signal.
- Several tool prices are secondary or UNVERIFIED, as flagged in the tables. Star counts reflect hype, not quality, and none of the listed repos was tested.
- Claims marked inference are the researcher's reading, not a source's statement: grain as a tell, staggered reveals as a tell, and the sampling-pool effect for Bricolage Grotesque, Newsreader, Schibsted Grotesk, Martian Mono and Big Shoulders.
- The note on "hue 0-180 and 290-360 free of AI defaults" from Sailop is out of date given the warm-orange convergence, so it is not used here.
- No source tests Kiln's themes. Everything here is pattern matching, not measurement.

## Sources

### Primary and measurement

1. <https://ai-design-convergence.vercel.app/>
2. <https://www.nngroup.com/articles/neobrutalism/>
3. <https://www.nngroup.com/articles/handmade-designs/>

### Anthropic

4. <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8>
5. <https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics>
6. <https://claude.com/blog/improving-frontend-design-through-skills>
7. <https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md>
8. <https://github.com/anthropics/skills/tree/main/skills/frontend-design>
9. <https://gist.github.com/edxeth/c9669f46a04687375fd9150c4874286e>
10. <https://www.claudeskills.org/docs/skills-cases/frontend-design>
11. <https://www.anthropic.com/news/claude-design-anthropic-labs>

### Press

12. <https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet>
13. <https://venturebeat.com/technology/anthropic-just-launched-claude-design-an-ai-tool-that-turns-prompts-into-prototypes-and-challenges-figma>
14. <https://agtechdata.uga.edu/ai-has-come-for-serif-fonts/>
15. <https://news.designrush.com/custom-web-design-still-wins-ai-saturated-2026>

### Community threads

16. <https://news.ycombinator.com/item?id=46956964>
17. <https://news.ycombinator.com/item?id=47864393>
18. <https://news.ycombinator.com/item?id=49117099>
19. <https://news.ycombinator.com/item?id=47178424>
20. <https://news.ycombinator.com/item?id=47984512>
21. <https://news.ycombinator.com/item?id=48316416>
22. <https://news.ycombinator.com/item?id=49901973>
23. <https://reddit.sentinel-team.org/posts/1qccb1g/snapshots/2026-01-15T02%3A51%3A22.564978Z>
24. <https://www.promptzone.com/farrah_dubois/claude-design-hn-discussion-insights-1o5b.md>

### GitHub

25. <https://github.com/VoltAgent/awesome-design-md>
26. <https://github.com/Leonxlnx/taste-skill>
27. <https://github.com/pbakaus/impeccable>
28. <https://github.com/emilkowalski/skills>
29. <https://github.com/Nutlope/hallmark>
30. <https://github.com/nutlope/hallmark/blob/HEAD/skills/hallmark/references/typography.md>
31. <https://github.com/jnsahaj/tweakcn>
32. <https://github.com/miqdadbadjuber/anti-slop>
33. <https://github.com/bergside/awesome-design-skills>
34. <https://github.com/kzhrknt/awesome-design-md-jp>
35. <https://github.com/JCarterJohnson/vibecoded-design-tells>
36. <https://github.com/HugoGarcez/vibecoded-design-tells> (a 0-star fork of 35, not cited in the text)
37. <https://github.com/senlindesign/taste-skill>
38. <https://github.com/funboy322/avoid-ai-design>
39. <https://github.com/febbhav/signs-of-ai-design>
40. <https://github.com/DonkeyKing01/tasteful-ui-skill>
41. <https://github.com/AntonioSpagnol/UI-Deslopify-Skill>
42. <https://github.com/avrignaud/seattledogparkdata/commit/8074b76b4bed7810a5ecc536102d8dfa59b93ec5>
43. <https://github.com/evilmartians/mono/>
44. <https://github.laiyagushi.com/Vanszs/Anti-AI-UI>
45. <https://raw.githubusercontent.com/wiki/Laith0003/ux-skill/Anti-AI-slop-ban-list.md>
46. <https://cdn.jsdelivr.net/npm/pixelslop@0.3.8/dist/skill/resources/ai-slop-patterns.md>

### Vendor and blog

47. <https://adriankrebs.ch/blog/design-slop/>
48. <https://slopcop.adriankrebs.ch>
49. <https://tim-schipper.nl/en/blog/ai-slop-ui-tells>
50. <https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same>
51. <https://genjutsu.athevon.dev/docs/tells>
52. <https://capitalandcompute.net/blog/fix-ai-slop-design/>
53. <https://codemyspec.com/blog/vibe-coded-websites-look-the-same>
54. <https://robotsonpayroll.substack.com/p/how-to-avoid-that-vibe-coded-look>
55. <https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website>
56. <https://dev.to/laurilllll/how-i-built-15-website-templates-with-an-ai-coding-agent-in-a-week-5f0h>
57. <https://dev.to/parweb/how-to-make-a-landing-page-that-doesnt-look-ai-generated-7-concrete-fixes-i83>
58. <https://superdesign.dev/blog/fix-generic-ai-landing-page>
59. <https://superdesign.dev/blog/i-tested-8-ai-ui-generators>
60. <https://daily.dev/posts/how-to-use-claude-design-to-make-sites-10x-more-beautiful-sj0iaykzv>
61. <https://www.925studios.co/blog/ai-slop-design-tells>
62. <https://www.developersdigest.tech/blog/ai-design-slop-and-how-to-spot-it>
63. <https://sailop.com/blog/bento-grid-new-hero-ai-slop-2026>
64. <https://sailop.com/blog/shadcn-ui-design-monoculture-2026>
65. <https://sailop.com/blog/how-to-make-ai-website-look-unique>
66. <https://www.setproduct.com/blog/bento-grid-layout-design-guide>
67. <https://uxskill.laithjunaidy.com/blog/shadcn-ui-looks-generic.html>
68. <https://www.designsystemscollective.com/is-anyone-else-tired-of-every-tailwind-shadcn-app-looking-the-same-69c545e73114>
69. <https://claudeskills.info/skills/curiositech/some_claude_skills/typography-expert/>
70. <https://fontduet.com/schibsted-grotesk-newsreader>
71. <https://keyavadgama.substack.com/p/the-serif-renaissance-in-ai-branding>
72. <https://www.omoro.io/styles/neo-brutalism>
73. <https://design-agent.dev/blog/2026-08-26-neobrutalism-computable-aesthetic/>
74. <https://spark.entire.vc/prompts/vb-soft-neo-brutalism-design>
75. <https://www.webuiprompt.com/design/neo-brutalism>
76. <https://dropthehassle.com/guides/make-website-look-less-ai>
77. <https://21st.dev/blog/website-not-look-ai-generated>
78. <https://publishd.app/blog/make-ai-built-site-not-look-ai>
79. <https://designmd.me/blog/make-your-ai-built-website-look-less-like-ai>
80. <https://www.joshuasnoddy.com/blog/make-ai-built-site-not-look-ai/>
81. <https://aitoolpick.org/blog/ai-generated-website-checklist/>
82. <https://medium.com/@nandini_92889/i-made-five-decks-with-claude-by-the-fifth-one-they-all-looked-like-the-same-deck-5dda862b7dff>
83. <https://www.cidcreative.com/insights/embracing-imperfection-humanizing-design-ai-age/>
84. <https://www.cidcreative.com/insights/handmade-typography-humanized-fonts-2026/>
85. <https://www.365iwebdesign.co.uk/news/2026/01/23/website-imperfection-trust-advantage/>
86. <https://www.creativeboom.com/insight/louise-sloper-on-the-typography-trick-that-most-designers-get-backwards/>
87. <https://www.eesel.ai/blog/claude-design-review-2026>
88. <https://flowstep.ai/blog/claude-design-review/>
89. <https://pasqualepillitteri.it/en/news/2814/claude-design-doubled-limits-2026>
90. <https://www.datacamp.com/blog/claude-design>
91. <https://animaapp.com/blog/ai-design-en/claude-design-review-features-pros-cons-and-best-alternatives/>
92. <https://www.designsystemscollective.com/claude-design-just-launched-a-designers-first-walkthrough-c79d7ce47b9b>
93. <https://designrevision.com/alternatives/tweakcn>
94. <https://www.banani.co/blog/google-stitch-pricing-and-credits>
95. <https://vp0.com/blogs/magic-patterns-pricing-plans-2026/>
96. <https://aisotools.com/pricing/subframe>
97. <https://licenseorg.com/guide/fonts/fontshare>
98. <https://contra.com/p/72voOMQM-freelance-designer-rates-explained-what-businesses-need-to-know>
99. <https://primarytech.com/?p=3943>
100.  <https://eesel.ai/blog/lovable-pricing>
101.  <https://toolradar.com/tools/coolors/pricing>
102.  <https://pricingsaas.com/companies/mobbin>

### Tool, font and pricing pages

103. <https://claude.com/pricing>
104. <https://v0.app/pricing>
105. <https://lovable.dev/pricing>
106. <https://bolt.new/pricing>
107. <https://www.figma.com/pricing/>
108. <https://stitch.withgoogle.com/>
109. <https://uxpilot.ai/pricing>
110. <https://tweakcn.com/>
111. <https://leonardocolor.io/>
112. <https://realtimecolors.com/>
113. <https://huemint.com/about/>
114. <https://tokens.studio>
115. <https://fonts.google.com>
116. <https://www.fontshare.com/licenses>
117. <https://www.indiantypefoundry.com/licensing>
118. <https://velvetyne.fr>
119. <https://www.collletttivo.it>
120. <https://usemodify.com>
121. <https://www.typewolf.com>
122. <https://fontsinuse.com>
123. <https://www.are.na/editorial/on-pricing>
