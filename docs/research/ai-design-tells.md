# What makes an interface look AI-generated

This note summarises published research and commentary, gathered in October 2026, on why generated interfaces look alike and what makes a design read as intentional instead. It is the evidence behind the "Second-order tells" rules in [DESIGN.md](../DESIGN.md) §2 and the theme family in [ADR 0030](../adr/0030-theme-family-without-ai-tells.md).

Most of the evidence is qualitative: practitioner write-ups, vendor documentation and press. Only one source measures anything directly, and its sample is small. Read the findings as patterns that several independent sources agree on, not as measured facts.

## Findings

### 1. The first-order tells are well known, and models have mostly moved past them

The look most people associate with generated UI is the statistical median of the frameworks and tutorials models learned from: an indigo or violet gradient, Inter (or Roboto, Open Sans, Poppins) as the only family, gradient headline text, a grid of three identical cards with an icon on top, a pill badge over a centred hero, one soft shadow and one large radius on everything, and every section fading up on scroll ([Krebs](https://adriankrebs.ch/blog/design-slop/), [Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics)). Default component kits make it worse: unstyled shadcn/ui and Tailwind themes are now recognisable on sight.

A survey of 1,590 Show HN sites found 22% showed four or more of these patterns ([Krebs](https://adriankrebs.ch/blog/design-slop/)). But a direct comparison of current AI design tools found they no longer produce them: none used Inter, a purple gradient or the rounded card grid ([convergence study](https://ai-design-convergence.vercel.app/)). The first-order list is still worth banning, but it no longer describes what current tools make.

### 2. Banning a tell moves the model to the next most common look

The strongest finding, and the one most sources agree on. When a model is told to avoid the obvious defaults and "be distinctive", it doesn't invent a direction. It moves to the next densest cluster in its training data.

- Anthropic's own prompting guidance says generic negative instructions ("don't use cream") shift the model to a different fixed palette, and that the fix is to give it an explicit palette or have it propose options first ([Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)).
- Anthropic's frontend-design skill lists several convergent looks and calls them "defaults rather than choices" ([frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
- In the one measurement available, three AI tools from three companies, given the same brief, were closer to each other than two randomly chosen award-winning human sites. They converged on a warm ground, a brass or terracotta accent, a serif display face and tracked uppercase labels ([convergence study](https://ai-design-convergence.vercel.app/)).
- A designer who built a deliberately "non-AI" look found it listed as the model median two months later ([Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).

### 3. The second-order tells

These are the looks generated UI reaches for once the first-order list is banned. Several sources note that guides on "how to avoid the AI look" now recommend these same looks:

- **A cream or warm-paper canvas with a terracotta or ember accent and a serif display.** Anthropic documents this as the house style its models fall back on ([Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8), [The New Yorker](https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet)).
- **The same structure in another hue.** Mint with forest green, or near-black with gold, keeps the cream look's roles and only changes the colours ([Generative Labs](https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same)).
- **A near-black canvas with one acid or ember accent** ([Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/), [frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
- **A serif headline with one italic or coloured accent word** ([Krebs](https://adriankrebs.ch/blog/design-slop/), [frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design)).
- **Tracked uppercase eyebrows, monospace labels and `01 / 02 / 03` numbering** on content that is not code or a sequence ([Krebs](https://adriankrebs.ch/blog/design-slop/), [Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).
- **Hard-offset "neo-brutalist" shadows** with thick black borders and a saturated accent, a recognised style trend ([NN/g on neobrutalism](https://www.nngroup.com/articles/neobrutalism/)) that is now a stock option in prompt libraries.
- **Grain, noise or halftone overlays**, which older prompting advice recommended as texture. No source yet names grain as a tell; Kiln treats it as one because it is the standard advice for looking less generated.

None of these is wrong in itself. Each is a legitimate answer to some brief. The tell is that nobody chose it: the same look appears whatever the subject.

### 4. Fonts come from a short, shared pool

Models pick a typeface from a mood word ("modern", "premium", "editorial") rather than from the content, and the same words lead every model to the same faces. Beyond the first-order defaults, the faces that recur are the ones published as "distinctive" alternatives, including on Anthropic's own recommended list: Space Grotesk, Fraunces, Playfair Display, Instrument Serif, Bricolage Grotesque, Newsreader, Clash Display, Satoshi, Cabinet Grotesk, Geist, JetBrains Mono and IBM Plex ([Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [Krebs](https://adriankrebs.ch/blog/design-slop/), [convergence study](https://ai-design-convergence.vercel.app/)). A list of fonts to use instead becomes the next pool to sample from.

### 5. What reads as intentional

The techniques that sources credit with making work look designed rather than generated:

- **A concrete subject, not adjectives.** A real object, place, standard or reference image gives a direction that a rule list cannot ([Anthropic cookbook](https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics), [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/)).
- **A written reason for every choice.** If a colour, face or radius can't be explained in a sentence, it is probably a default ([Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells)).
- **Specific content.** Real names, numbers and product screens, and copy that would not survive swapping the product name.
- **Radii by role.** Human work mixes radii (pills for pills, square for fields); the measured AI output used one radius everywhere ([convergence study](https://ai-design-convergence.vercel.app/)).
- **Constraint.** Few type sizes, one accent, and boldness spent in one place. The measured AI output used 10 to 13 type sizes against a human median of 8 ([convergence study](https://ai-design-convergence.vercel.app/)).
- **Handmade or imperfect marks, used with care.** Uneven line weights and hand lettering read as human, though paper-grain textures are already everywhere ([NN/g on handmade designs](https://www.nngroup.com/articles/handmade-designs/)).
- **Choices from outside the model.** Have the model propose options and choose between them, or start from a human-chosen reference ([Anthropic prompting guide](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)).

### 6. Counterpoints

- Sameness is not always a problem. For a tool with real utility, legibility matters more than novelty.
- The look predates the models: before generated UI, sites converged on Bootstrap.
- Styling is not substance. No checklist can tell whether a screen shows what its users came for.
- Any list goes stale. Swapping one default look for another only resets the clock ([Schipper](https://tim-schipper.nl/en/blog/ai-slop-ui-tells), [Capital and Compute](https://capitalandcompute.net/blog/fix-ai-slop-design/)).

## Principles

What follows from the findings, as rules for designing a theme:

1. **Start from a subject.** Each theme takes its idea from a specific real object or standard, and every colour, face, radius and easing traces back to it.
2. **Write the reason down.** The reason for each value sits next to it in the stylesheet, so a reviewer can tell a choice from a default.
3. **Use rules as a filter, not a direction.** A banned list removes defaults but can't supply a look. The subject supplies the look; the list checks it.
4. **Check mechanically what can be checked.** Fonts, canvas colour and accent hue can be tested. Layout, copy and depth are left to review.
5. **Expect the list to move.** Revisit the banned list as model defaults change, and change its test and its documentation together.
6. **Keep legibility first.** Distinctiveness never overrides contrast, readable type or aligned figures where they matter.

## How Kiln applies them

Kiln's first themes each matched a second-order tell, so [ADR 0030](../adr/0030-theme-family-without-ai-tells.md) reworked two of them and added two:

| Theme        | Tell it matched (if reworked)                 | Subject                                      | Type                                      |
| ------------ | --------------------------------------------- | -------------------------------------------- | ----------------------------------------- |
| `paper`      | Warm cream paper, graphite ink, a book serif  | An office print: white sheets on grey stock  | Golos Text, Atkinson Hyperlegible Mono    |
| `ledger`     | Mint with forest green, monospace for figures | An accountant's columnar pad                 | Archivo, figures condensed by its width   |
| `flightdeck` | New                                           | A glass-cockpit display and its colour rules | B612 and B612 Mono                        |
| `riso`       | New                                           | A two-drum risograph zine                    | Shantell Sans, Atkinson Hyperlegible Mono |

`monograph` and `fiesta` ship unchanged for compatibility. They still carry some of the tells (an ember accent and serif display; an apricot canvas with hard offsets), so they are exempt from the checks and are not the model for new themes.

DESIGN.md §2 lists the second-order tells as rules. `packages/ui/src/themes/tells.test.ts` enforces the checkable part for every built-in theme except the two legacy ones: no banned font family, no warm-cream light canvas and no ember, terracotta or indigo accent. Every other rule is part of review.

## Limits of the evidence

- Many sources are blogs that sell a linter, a skill or a design service. Their lists overlap and likely copy each other, so they are weaker than their number suggests.
- The convergence study is the only measurement. It compares three AI outputs from one brief, and its authors state those limits.
- Anthropic's documentation describes its own models. Other models may converge elsewhere.
- None of this was tested against Kiln's themes. The checks catch known patterns; they don't prove a theme looks designed.

## Sources

The most authoritative of the sources consulted. Anthropic's material, the convergence study, Nielsen Norman Group and the press coverage are independent of any tool vendor; the practitioner write-ups are first-hand accounts.

- **Convergence study:** a measured comparison of AI design tool output against award-winning sites. <https://ai-design-convergence.vercel.app/>
- **Anthropic prompting guide:** Anthropic's prompting guidance, including frontend design and the default aesthetic. <https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8>
- **Anthropic cookbook:** Anthropic's cookbook recipe on prompting for frontend aesthetics. <https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics>
- **Anthropic blog:** Anthropic on improving frontend design through skills. <https://claude.com/blog/improving-frontend-design-through-skills>
- **frontend-design skill:** Anthropic's published frontend-design skill. <https://github.com/anthropics/skills/tree/main/skills/frontend-design>
- **The New Yorker:** on the AI design aesthetic spreading across the web. <https://www.newyorker.com/culture/infinite-scroll/the-ai-design-aesthetic-thats-taking-over-the-internet>
- **Krebs:** Adrian Krebs on design slop, with a survey of Show HN sites. <https://adriankrebs.ch/blog/design-slop/>
- **NN/g on neobrutalism:** Nielsen Norman Group. <https://www.nngroup.com/articles/neobrutalism/>
- **NN/g on handmade designs:** Nielsen Norman Group. <https://www.nngroup.com/articles/handmade-designs/>
- **Schipper:** Tim Schipper on AI UI tells, a first-hand account. <https://tim-schipper.nl/en/blog/ai-slop-ui-tells>
- **Generative Labs:** on why AI design tools look the same. <https://www.generativelabs.com/insights/why-ai-design-tools-look-the-same>
- **Capital and Compute:** on fixing AI-generated design. <https://capitalandcompute.net/blog/fix-ai-slop-design/>
