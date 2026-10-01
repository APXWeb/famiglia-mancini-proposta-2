---
name: Famiglia Mancini Trattoria
description: The facade of Rua Avanhandava, 81 at night, used as the interface.
colors:
  ink-0: "#0c0a09"
  ink-1: "#181412"
  ink-2: "#3b332d"
  ink-3: "#ab9f93"
  ink-4: "#f5f0e8"
  orange: "#ee7a1f"
  orange-deep: "#c95f12"
  orange-ink-muted: "#3a1d06"
  orange-ink-hint: "#4e2408"
  red: "#d7191f"
  red-ink: "#8a0d12"
  alert: "#ff8a73"
  bulb-amber: "#ffb43a"
  bulb-rose: "#ff6b9d"
  bulb-cobalt: "#4a72ff"
  bulb-emerald: "#34c27a"
  bulb-tangerine: "#ff7a2e"
  bulb-white: "#fff1d1"
typography:
  display:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.5rem, 0.9rem + 7.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  headline:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2.3rem, 1.4rem + 4.2vw, 4.75rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(1.85rem, 1.4rem + 2vw, 3.1rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 125"
  lede:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1.1rem + 0.37vw, 1.4375rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Archivo, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.97rem + 0.14vw, 1.0938rem)"
    fontWeight: 400
    lineHeight: 1.6
    fontVariation: "'wdth' 100"
  label:
    fontFamily: "Tenor Sans, Gill Sans, sans-serif"
    fontSize: "clamp(0.8125rem, 0.79rem + 0.1vw, 0.875rem)"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.28em"
  numeral:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontWeight: 700
    fontFeature: "'tnum' 1, 'lnum' 1"
    fontVariation: "'wdth' 112"
  script:
    fontFamily: "Yellowtail, cursive"
    fontSize: "1.35rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  hairline: "2px"
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
    backgroundColor: "{colors.orange}"
    textColor: "{colors.ink-0}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  button-primary-hover:
    backgroundColor: "{colors.ink-4}"
    textColor: "{colors.ink-0}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-4}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  button-ghost-hover:
    backgroundColor: "{colors.ink-4}"
    textColor: "{colors.ink-0}"
  button-ink:
    backgroundColor: "{colors.ink-0}"
    textColor: "{colors.ink-4}"
    rounded: "{rounded.pill}"
    padding: "0 1.6em"
    height: "3.25rem"
  field-on-orange:
    backgroundColor: "transparent"
    textColor: "{colors.ink-0}"
    rounded: "0"
    padding: "0.6rem 0"
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
---

# Design System: Famiglia Mancini Trattoria

## Overview

**Creative North Star: "The Lit Facade"**

The interface is the house's own sign system at night: the painted black awning is the ground, the round orange medallion is the one colour that is allowed to become a place, the awning's spaced capitals carry addresses and numbers, and strings of coloured glass bulbs are the only other colour on the page, always as light. Nothing is borrowed from the category default; there is no gold, no italic serif, no grid of dish cards.

Density is chaptered and generous. Each chapter is a full-width band of black separated by hairlines, and every chapter is addressed by something real from the house (a street number, a menu number, a price). Statements are short and set huge in extra-wide grotesk capitals; everything else is calm body text in the same family at normal width. Motion is a camera moving through the facade: headlines rise out of masks, scenes are scrubbed to scroll, and the medallion grows into a door.

Reduced motion is a different, composed layout rather than the motion build with choreography removed. The default stylesheet is the complete static page; choreography is layered on only when motion is allowed.

**Key Characteristics:**
- Five-step awning ramp is the entire neutral palette.
- Medallion orange owns whole regions; it is a place, not a highlight.
- Bulb colours exist only as emitted light (glow, halo, lit dot).
- Three voices: extra-wide display caps, tracked awning caps, one sign-painter script word.
- Hairline wires instead of boxes; circles echo the medallion.
- Exponential ease-out; scroll-scrubbed chapter scenes; static composition under reduced motion.

## Colors

A night palette: one warm black ramp, one sign orange that floods, and jewel bulb colours that only ever glow.

### Primary
- **Medallion Orange** (orange): the sign. Fills whole regions: the disc that grows into the door reveal, the reservation chapter flood, the menu page's closing band, the primary button, menu-index row fills on hover, selection highlight. In small amounts it marks the real numbers (menu nº, street nº 81, today's hours row, accent headline line).
- **Pressed Orange** (orange-deep): pressed and hover depth for orange surfaces.
- **On-Orange Muted** (orange-ink-muted): secondary text on orange (about 5.5:1). **On-Orange Hint** (orange-ink-hint): italic placeholder text on orange (about 4.7:1).

### Secondary
- **Mancini Red** (red): the wordmark red. Reserved for the brand marks themselves (logo rasters, display); no interface surface or text is red.
- **Red Ink** (red-ink): error marks on orange (invalid-field underline and the error dot), holding 3:1 on the medallion.
- **Alert Coral** (alert): errors and cancellations on black: the strike-through and the rotated "Cancelada" stamp on a ticket (8.1:1).

### Tertiary
- **The Bulbs** (bulb-amber, bulb-rose, bulb-cobalt, bulb-emerald, bulb-tangerine, bulb-white): light sources only. They appear as the WebGL festoon halos, the chapter-wire progress bulbs, the active-nav and active-category dot, the open-now status bulb (emerald), and the focus ring (amber).

### Neutral
- **Awning Black** (ink-0): the ground of every chapter, button text on orange, ticket body.
- **Raised Black** (ink-1): the rare raised panel and hover wash.
- **Hairline Wire** (ink-2): wires, unlit bulbs, scrollbar thumb, ticket perforation.
- **Dusk Grey** (ink-3): secondary text on black (7.6:1).
- **Awning Lettering** (ink-4): primary text and the light fill that rises in buttons.
- Hairlines are ink-4 mixed to 16% (soft) and 34% (strong) over black.

### Named Rules
**The Awning Ramp Rule.** The five ink steps are the only neutrals. No new greys, no cool tints, no gold.

**The Medallion Owns Rooms Rule.** Orange appears either as a whole region (a flood, a band, a door) or as a mark on a real number. It is never a decorative stripe, gradient wash, or card tint.

**The Light-Only Rule.** Bulb colours are emitted, never painted. If a bulb colour fills a surface larger than a bulb, it is wrong.

## Typography

**Display Font:** Archivo variable at 125% width (with Arial Narrow)
**Body Font:** Archivo variable at 100% width (with Segoe UI, system-ui)
**Label Font:** Tenor Sans (with Gill Sans)
**Script:** Yellowtail (with cursive)

**Character:** One grotesk family stretched wide for the painted sign and kept normal for reading; Tenor Sans supplies the awning's spaced capitals; Yellowtail is the sign-painter's one flourish.

### Hierarchy
- **Display** (800, 125% width, step-5, line-height 0.92, -0.02em, uppercase): hero and chapter statements. Lines sit in masks so they can rise.
- **Headline** (same voice, step-4): chapter titles in the middle of the page.
- **Title** (same voice, step-3 to step-2): dish names, menu categories, empty states, confirmation titles.
- **Lede** (400, step-1, 1.5, max about 38ch): one paragraph under a statement.
- **Body** (400, step-0, 1.6, measure 62ch): prose in Dusk Grey with Awning Lettering for emphasis.
- **Label / Awning** (Tenor Sans 400, step--1 or step--2, 0.28em tracking, uppercase): addresses, street numbers, nav, status, form labels, captions. Short metadata only.
- **Numeral** (Archivo 700, 112% width, tabular lining): prices, ticket dates, button labels (button labels add 0.06em tracking, uppercase).
- **Script** (Yellowtail 400): the word "Trattoria" beside the medallion in the bar, nowhere else.

### Named Rules
**The Three Voices Rule.** Statements speak in extra-wide caps, addresses in awning caps, and the script says one word. A new surface gets no fourth voice.

**The Address-Below Rule.** Awning caps sit below or beside a statement as street metadata; they never sit above a heading as a kicker.

## Layout

A 12-column grid inside a 1440px container with a fluid gutter (spacing.gutter). Chapters are full-bleed black bands with fluid vertical padding (spacing.chapter) on a 4px-based spacing scale. Common splits are 7/5 or 5/6 for title against text, and 1-5 against 7-12 for sticky intro beside a list. The fixed bar is 4.5rem tall and hides on scroll down; a sagging chapter wire hangs under it with one bulb per chapter (desktop only).

Responsive behaviour is set by literal media queries; the build uses 1200px (menu board to one column), 1080px (nav collapses to a circular-reveal drawer), 900px (grids stack, chapter wire hidden, pinned dish stage switches to stacked), with local adjustments at 760, 700, 560 and 480px. On the menu page the category list becomes a sticky horizontal rail under 900px.

## Elevation & Depth

Flat, layered by light rather than shadow. Depth comes from the black ground, photographs under graded black scrims, round clip masks, and glows around bulbs. Shadows are reserved for objects that physically sit on a surface.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 18px 40px -18px rgb(0 0 0 / 0.7)`): a ticket resting on the orange chapter.
- **Amber Glow** (`box-shadow: 0 0 0.6rem 0.1rem` amber at 60%): a lit bulb dot (active nav, active category).
- **Bulb Halo** (two-layer coloured glow): the current chapter-wire bulb.
- **Cut-out Drop** (`filter: drop-shadow(...)`): the medallion sign and mascot cut-outs only.

### Named Rules
**The Glow Is a Bulb Rule.** Bloom and glow are tied to a real light source in the scene, never applied as a generic filter.

## Shapes

Two corner values: an almost-square 2px for images, tickets and focus rings, and a full pill for every button and toggle. Circles carry the brand: the medallion disc, the door's circular clip mask, the reservation flood rising as a circle from the bottom edge, the drawer opening as a circle from its button, round stepper buttons and bulb dots. Structure is drawn with 1px hairlines and dotted leaders, not boxes.

### Named Rules
**The Wire Not Box Rule.** Group and divide with hairlines (rows, lists, FAQ, hours, inventories). A filled box is an exception that needs a reason.

## Components

### Buttons
Signs switching on.
- **Shape:** full pill (999px), minimum height 3.25rem (2.75rem in the bar).
- **Primary:** Medallion Orange with black numeral-voice caps.
- **Hover / Focus:** an Awning Lettering fill rises from below over 700ms on the exponential ease; the trailing arrow nudges 0.2em; press scales to 0.97. Focus also raises the fill and shows the amber ring.
- **Ghost:** transparent with a strong hairline inset ring, light text; the same light fill rises and the text turns black.
- **Ink:** black pill used on orange regions; the light fill rises on hover.

### Wire Link
A text link with a 1px underline drawn as a wire; on hover the wire retracts to the right and the text turns orange. Minimum height 2.75rem.

### Inputs / Fields
- **Style:** on the orange chapter, fields are a bare 1.5px black underline with no box and no radius, step-1 text, awning-caps labels.
- **Focus:** the underline thickens to 3px and a faint 7% black wash appears.
- **Error:** Red Ink underline at 3px with a Red Ink dot before a bold black message.
- **Search (menu page):** the same underline language on black, turning orange on focus.
- **Stepper:** round 3rem buttons ringed in black, large display numeral between them.

### Navigation
Awning caps in Dusk Grey; hover and current turn Awning Lettering and light a 5px amber bulb under the word. Below 1080px a pill "menu" toggle opens a full-screen black drawer through a growing circle, with display-voice links on hairlines.

### Chapter Wire
A sagging catenary under the bar with one small glass bulb per chapter: unlit in Hairline Wire, passed bulbs half-lit, the current one fully lit with a halo. It is the page's progress structure.

### Menu Board
Rows on hairlines: an orange awning-voice number, the dish name in semibold body, a dotted leader (2px dash, 6px period) that fills the space, and the price in the numeral voice. Hovering one line dims its neighbours to about 0.35 to 0.38 opacity.

### Ticket
A reservation request as a black ticket on the orange chapter: 2px corners, Lift shadow, dashed perforation, date in the numeral voice, amber state line. A cancelled ticket is never removed; its lines are struck through in Alert Coral and a rotated, outlined "Cancelada" stamp is set in the corner.

### Status
Awning caps with a small bulb: unlit Hairline Wire when closed, Emerald with glow when open, computed from the real hours.

### Motion
Exponential settle (`cubic-bezier(0.16, 1, 0.3, 1)`, GSAP expo.out) with durations of 160, 320, 700 and 1200ms. Headlines rise line by line out of masks. Each chapter has a scroll-scrubbed scene (medallion door, salão tilt, antepasti wipe, pinned dish stage, street drift, reservation flood). Under reduced motion the static layouts are the design (stacked facade, spread salão, still festoon frame), and global transitions drop to near zero.

## Do's and Don'ts

### Do:
- **Do** keep every neutral on the five-step awning ramp (ink-0 to ink-4).
- **Do** let Medallion Orange take a whole region when it appears, with black text and Red Ink errors inside it.
- **Do** give every chapter a real address, number or price from the house.
- **Do** use the rising light fill on every button and the retracting wire on text links.
- **Do** divide with 1px hairlines and price rows with dotted leaders.
- **Do** design the reduced-motion page as its own composed static layout first, then layer choreography on top.

### Don't:
- **Don't** paint any surface with a bulb colour; bulb colours are only light.
- **Don't** use Mancini Red for interface text, fills or buttons.
- **Don't** add a fourth type voice, or use the script for anything but "Trattoria".
- **Don't** put awning caps above a heading as a kicker.
- **Don't** use dark-and-gold, italic serifs, or dish-card grids.
- **Don't** delete a cancelled or past state silently; stamp it.
