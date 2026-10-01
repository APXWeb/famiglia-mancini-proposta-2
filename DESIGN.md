---
name: Famiglia Mancini Trattoria
description: The facade of Rua Avanhandava, 81 at night, used as the interface, in the house colours of the first proposal.
colors:
  ink-0: "#14100d"
  ink-1: "#1c1613"
  ink-2: "#3a2f27"
  ink-3: "#b8a992"
  ink-4: "#f3ead9"
  red: "#c8262b"
  gold: "#c9922f"
  gold-bright: "#e0ae52"
  alert: "#ff8a73"
  bulb-amber: "#ffb43a"
  bulb-rose: "#ff6b9d"
  bulb-cobalt: "#4a72ff"
  bulb-emerald: "#34c27a"
  bulb-tangerine: "#ff7a2e"
  bulb-white: "#fff1d1"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.5rem, 0.9rem + 7.4vw, 6rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.3rem, 1.4rem + 4.2vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  title:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.85rem, 1.4rem + 2vw, 3.1rem)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.012em"
  accent:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 600
    letterSpacing: "-0.012em"
  lede:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.1rem + 0.37vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.14vw, 1.0938rem)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.18em"
  button:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    letterSpacing: "0.01em"
  price:
    fontFamily: "Inter, Segoe UI, system-ui, sans-serif"
    fontWeight: 600
    fontFeature: "'tnum' 1, 'lnum' 1"
  numeral:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 700
    fontFeature: "'tnum' 1, 'lnum' 1"
  script:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "1.35rem"
    fontWeight: 600
    lineHeight: 1
rounded:
  hairline: "2px"
  field: "4px"
  pill: "999px"
spacing:
  3xs: "0.25rem"
  2xs: "0.5rem"
  xs: "0.75rem"
  s: "1rem"
  m: "1.5rem"
  l: "2rem"
  xl: "3rem"
  2xl: "4.5rem"
  3xl: "7rem"
  chapter: "clamp(5.5rem, 4rem + 8vw, 11rem)"
  gutter: "clamp(1rem, 0.5rem + 2.4vw, 2.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.ink-4}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-4}"
    textColor: "{colors.ink-0}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-4}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  button-ghost-hover:
    backgroundColor: "{colors.ink-4}"
    textColor: "{colors.ink-0}"
  button-ink:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.ink-4}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  button-ink-hover:
    backgroundColor: "{colors.ink-4}"
    textColor: "{colors.ink-0}"
  field-on-red:
    backgroundColor: "{colors.ink-1}"
    textColor: "{colors.ink-4}"
    rounded: "{rounded.field}"
    padding: "0.6rem 0.9rem"
    height: "3rem"
  ticket:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.ink-4}"
    rounded: "{rounded.hairline}"
    padding: "{spacing.m}"
  ticket-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.alert}"
    padding: "0.2rem 0.5rem"
  menu-price:
    textColor: "{colors.gold-bright}"
    typography: "{typography.price}"
---

# Design System: Famiglia Mancini Trattoria

## Overview

**Creative North Star: "The Lit Facade"**

The interface is the house's own sign system at night, dressed in the house colours the client approved in the first proposal: a warm black ground, cream lettering, Mancini red that is allowed to become a place, and gold that marks what matters inside a sentence. Strings of coloured glass bulbs are the only other colour on the page, and only ever as light. There is still no grid of dish cards; the menu is a numbered board on hairlines.

Density is chaptered and generous. Each chapter is a full-width band of warm black separated by hairlines, and every chapter is addressed by something real from the house (a street number, a menu number, a price). Statements are short and set large in Playfair Display, sentence case, with one word turned to gold italic; everything else is calm Inter. Motion is a camera moving through the facade: headlines rise out of masks, scenes are scrubbed to scroll, and the red disc grows into a door.

Reduced motion is a different, composed layout rather than the motion build with choreography removed. The default stylesheet is the complete static page; choreography is layered on only when motion is allowed.

**Key Characteristics:**
- Five-step warm ink ramp, black to cream, is the entire neutral palette.
- Mancini red owns whole regions with cream text; it is a place, not a highlight.
- Gold is the in-line highlight: the italic accent word, numbers, prices, active states, focus.
- Bulb colours exist only as emitted light (glow, halo, lit dot).
- Two families: Playfair Display for statements, Inter for reading, interface and tracked-caps addresses.
- Hairline wires instead of boxes; circles echo the medallion.
- Exponential ease-out; scroll-scrubbed chapter scenes; static composition under reduced motion.

## Colors

A warm night palette: one black-to-cream ramp, one house red that floods, one gold that marks, and jewel bulb colours that only ever glow.

### Primary
- **Mancini Red** (red): the house colour. Fills whole regions: the disc that grows into the door reveal, the reservation chapter flood, the menu page's closing band, the primary button, menu-index row fills on hover, the skip link. Text on red is always cream (4.8:1); selection on red regions inverts to black with cream.

### Secondary
- **Antique Gold** (gold): accents and active states on black: menu numbers (Nº 001), today's hours row, the current dish in the pinned index, the "esta casa" street number and its 3px rule, the FAQ chevron, hover colour for links and controls, text selection, search highlight (35% mix) (6.7:1).
- **Lamplight Gold** (gold-bright): the brighter gold for words and figures: the italic accent word in every heading, the hero's second line, prices, the ticket state line, lit nav and category dots, the focus ring, caret, field focus ring and field error marks (9.3:1).
- **Alert Coral** (alert): errors and cancellations on black: the strike-through and the rotated "Cancelada" stamp on a ticket.

### Tertiary
- **The Bulbs** (bulb-amber, bulb-rose, bulb-cobalt, bulb-emerald, bulb-tangerine, bulb-white): light sources only. They appear as the WebGL festoon halos, the chapter-wire progress bulbs, and the open-now status bulb (emerald).

### Neutral
- **Warm Black** (ink-0): the ground of every chapter, button text under the rising fill, the ink button on red, ticket body.
- **Soft Panel** (ink-1): reservation field fill, the menu's fillings panel, map hover wash.
- **Hairline Wire** (ink-2): wires, unlit bulbs, scrollbar thumb, ticket perforation.
- **Parchment Grey** (ink-3): secondary text on black (8.6:1) and placeholder text inside dark fields.
- **Cream** (ink-4): primary text, text on red, and the light fill that rises in buttons.
- Hairlines are cream at 14% (soft) and 30% (strong) over black; on red they are cream at 35%.

### Named Rules
**The Warm Ramp Rule.** The five ink steps are the only neutrals. No new greys, no cool tints.

**The Red Owns Rooms Rule.** Mancini red appears as a whole region (a flood, a band, a door, a button, a row fill) with cream text inside it. It is never a decorative stripe, gradient wash, card tint or text colour on black.

**The Gold Marks Rule.** Gold never fills a region. It marks: one italic word, a number, a price, an active or focused state. On red, the accent word and focus turn cream instead.

**The Light-Only Rule.** Bulb colours are emitted, never painted. If a bulb colour fills a surface larger than a bulb, it is wrong.

## Typography

**Display Font:** Playfair Display variable, roman and italic (with Georgia, serif)
**Body Font:** Inter variable (with Segoe UI, system-ui)
**Label Font:** Inter in tracked capitals

**Character:** A high-contrast serif that speaks the house's statements in sentence case, with its italic carrying the one word that matters in gold; Inter does all the reading and the interface, and tightens into spaced capitals for addresses like awning lettering.

### Hierarchy
- **Display** (700, step-5, line-height 1.04, -0.012em, sentence case): hero and chapter statements. Lines sit in masks so they can rise.
- **Headline** (same voice, step-4): mid-page chapter titles, the menu close, street numbers.
- **Title** (same voice, step-3 to step-2): dish names, menu categories and index rows, empty states, confirmation titles.
- **Accent** (Playfair italic 600, Lamplight Gold): the one `<em>` word per heading, and the hero's whole second line.
- **Lede** (Inter 400, step-1, 1.5, max about 38ch): one paragraph under a statement.
- **Body** (Inter 400, step-0, 1.65, measure 62ch): prose in Parchment Grey with Cream semibold for emphasis.
- **Label** (Inter 500, 0.75rem, 0.18em tracking, uppercase): addresses, street numbers, nav, status, form labels, captions. Short metadata only.
- **Button** (Inter 600, 0.9375rem, 0.01em, sentence case): every button label.
- **Price** (Inter 600, tabular lining, Lamplight Gold): prices on the board and in the antepasti list.
- **Numeral** (Playfair 700, tabular lining): street numbers, ticket dates, the party stepper value.
- **Script** (Playfair italic 600, 1.35rem): the word "Trattoria" beside the medallion in the bar, in Cream; nowhere else.

### Named Rules
**The One Gold Word Rule.** Each heading carries at most one accent: a single word or closing phrase in Playfair italic 600, Lamplight Gold (Cream on red chapters). Never two accents, never a whole heading.

**The Two Families Rule.** Playfair Display speaks statements, Inter does everything else. A new surface gets no third family.

**The Address-Below Rule.** Tracked caps sit below or beside a statement as street metadata; they never sit above a heading as a kicker.

## Layout

A 12-column grid inside a 1440px container with a fluid gutter (spacing.gutter). Chapters are full-bleed warm black bands with fluid vertical padding (spacing.chapter) on a 4px-based spacing scale. Common splits are 7/5 or 5/6 for title against text, and 1-5 against 7-12 for sticky intro beside a list. The fixed bar is 4.5rem tall and hides on scroll down; a sagging chapter wire hangs under it with one bulb per chapter (desktop only).

Responsive behaviour is set by literal media queries: 1200px (menu board to one column), 1080px (nav collapses to a circular-reveal drawer), 900px (grids stack, chapter wire hidden, pinned dish stage switches to stacked), with local adjustments at 760, 700, 560 and 480px. On the menu page the category list becomes a sticky horizontal rail under 900px.

## Elevation & Depth

Flat, layered by light rather than shadow. Depth comes from the warm black ground, photographs under graded black scrims, round clip masks, a faint gold floor of light under the hero bulbs, and glows around bulbs. Shadows are reserved for objects that physically sit on a surface.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 18px 40px -18px rgb(0 0 0 / 0.7)`): a ticket resting on the red chapter.
- **Gold Glow** (`box-shadow: 0 0 0.6rem 0.1rem` Lamplight Gold at 60%): a lit dot (active nav, active menu category).
- **Bulb Halo** (two-layer coloured glow): the current chapter-wire bulb and the open-now emerald bulb.
- **Cut-out Drop** (`filter: drop-shadow(...)`): the medallion sign and mascot cut-outs only.

### Named Rules
**The Glow Is a Bulb Rule.** Bloom and glow are tied to a real light source in the scene, never applied as a generic filter.

## Shapes

Three corner values: an almost-square 2px for images, tickets, the fillings panel and focus rings; 4px for the dark reservation fields; and a full pill for every button and toggle. Circles carry the brand: the red disc, the door's circular clip mask, the reservation flood rising as a circle from the bottom edge, the drawer opening as a circle from its button, round stepper buttons and bulb dots. Structure is drawn with 1px hairlines and dotted leaders, not boxes.

### Named Rules
**The Wire Not Box Rule.** Group and divide with hairlines (rows, lists, FAQ, hours, inventories). A filled box is an exception that needs a reason: the reservation fields and the fillings panel are the two.

## Components

### Buttons
Signs switching on.
- **Shape:** full pill (999px), minimum height 3.25rem (2.75rem in the bar).
- **Primary:** Mancini Red with Cream button-voice label, trailing arrow icon.
- **Hover / Focus:** a Cream fill rises from below over 700ms on the exponential ease and the label turns Warm Black; the arrow nudges 0.2em; press scales to 0.97. Focus also raises the fill and shows the Lamplight Gold ring.
- **Ghost:** transparent with a strong hairline inset ring and Cream text, on black; the same fill rises.
- **Ink:** Warm Black pill used inside red regions (reservation submit, menu close); the same Cream fill rises.
- **Disabled:** 45% opacity, no pointer.

### Wire Link
A text link with a 1px underline drawn as a wire; on hover the wire retracts to the right and the text turns Lamplight Gold. Minimum height 2.75rem.

### Inputs / Fields
- **Style:** on the red chapter, fields are dark filled boxes: Soft Panel fill, 1px cream hairline at 18%, 4px corners, Cream text, italic Parchment Grey placeholders, tracked-caps labels in Cream above. Select chevron and date icon are drawn in Lamplight Gold.
- **Focus:** border turns Lamplight Gold with a 1px gold ring.
- **Error:** the same gold border and ring, with a Lamplight Gold dot before a semibold Cream message.
- **Search (menu page):** a bare 1.5px hairline underline on black, turning Antique Gold on focus.
- **Stepper:** round 3rem buttons ringed in Cream (black fill, gold glyph on hover), numeral-voice value between them.

### Navigation
Tracked caps in Parchment Grey; hover and current turn Cream and light a 5px Lamplight Gold dot with the Gold Glow under the word. Below 1080px a pill "menu" toggle opens a full-screen black drawer through a growing circle, with display-voice links on hairlines turning Antique Gold on hover.

### Chapter Wire
A sagging catenary under the bar with one small glass bulb per chapter: unlit in Hairline Wire, passed bulbs half-lit, the current one fully lit with a halo. It is the page's progress structure.

### Menu Board
Rows on hairlines: an Antique Gold tabular number, the dish name in Inter semibold, a dotted leader (2px dash, 6px period) that fills the space, and the price in Lamplight Gold. Hovering one line dims its neighbours to about 0.35 to 0.38 opacity. On the home page, index rows fill with Mancini Red from the bottom on hover.

### Ticket
A reservation request as a Warm Black ticket on the red chapter: 2px corners, Lift shadow, dashed perforation, date in the numeral voice, Lamplight Gold state line. A cancelled ticket is never removed; its lines are struck through in Alert Coral and a rotated, outlined "Cancelada" stamp is set in the corner.

### Status
Tracked caps with a small bulb: unlit Hairline Wire when closed, Emerald with glow when open, computed from the real hours.

### Motion
Exponential settle (`cubic-bezier(0.16, 1, 0.3, 1)`, GSAP expo.out) with durations of 160, 320, 700 and 1200ms. Headlines rise line by line out of masks. Each chapter has a scroll-scrubbed scene (red door, salão tilt, antepasti wipe, pinned dish stage, street drift, reservation flood). Under reduced motion the static layouts are the design (stacked facade, spread salão, still festoon frame), and global transitions drop to near zero.

## Do's and Don'ts

### Do:
- **Do** keep every neutral on the five-step warm ramp (ink-0 to ink-4).
- **Do** let Mancini Red take a whole region when it appears, with Cream text, Cream focus and Cream accent words inside it.
- **Do** give each heading at most one gold italic accent word, in Playfair italic 600.
- **Do** set prices in Inter 600 tabular figures in Lamplight Gold.
- **Do** give every chapter a real address, number or price from the house.
- **Do** use the rising Cream fill on every button and the retracting wire on text links.
- **Do** divide with 1px hairlines and price rows with dotted leaders.
- **Do** design the reduced-motion page as its own composed static layout first, then layer choreography on top.

### Don't:
- **Don't** paint any surface with a bulb colour; bulb colours are only light.
- **Don't** fill a region with gold, or set red text on black.
- **Don't** add a third type family, set display headings in all caps, or use the script for anything but "Trattoria".
- **Don't** put tracked caps above a heading as a kicker.
- **Don't** build dish-card grids; the menu is a numbered board.
- **Don't** delete a cancelled or past state silently; stamp it.
