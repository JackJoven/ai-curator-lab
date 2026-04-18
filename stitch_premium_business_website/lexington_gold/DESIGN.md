# Design System Document: High-End Editorial

## 1. Overview & Creative North Star
**The Creative North Star: "The Modern Curator"**

This design system moves away from the rigid, boxed-in nature of standard SaaS templates and leans into the world of high-end editorial publishing. The goal is to present a personal portfolio and AI directory not as a database, but as a curated collection.

To achieve a "bespoke" feel, we break the grid with intentional asymmetry. Content should breathe; whitespace is not "empty," it is a structural element used to signal importance. We use overlapping elements—such as a title partially masking a high-resolution image—to create a sense of depth and custom composition that feels intentional, not automated.

---

## 2. Colors & Tonal Depth

The palette is rooted in professional authority, utilizing deep charcols and slate tones to provide a "weighted" foundation, contrasted by the warmth of muted gold.

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders for sectioning are strictly prohibited. 
Structural boundaries must be defined solely through background color shifts or subtle tonal transitions. For example, a `surface-container-low` section should sit directly against a `surface` background to create a soft edge. This mimics the way high-quality paper or matte materials interact in the real world.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine stationery.
*   **Base:** `surface` (#fcf9f8) for the main page body.
*   **Nesting:** Use `surface-container-lowest` (#ffffff) for primary content cards to make them "pop" against the off-white background.
*   **Depth:** Use `surface-container-high` (#eae7e7) for utility bars or secondary side-drawers to indicate they sit "deeper" or are "backgrounded."

### The "Glass & Gradient" Rule
To avoid a flat "Bootstrap" appearance, use semi-transparent `surface` colors with a `backdrop-blur` (12px–20px) for floating navigation bars or modal overlays. 
*   **Signature Texture:** For primary CTAs and hero section backgrounds, apply a subtle linear gradient from `primary` (#162839) to `primary_container` (#2c3e50) at a 135-degree angle. This adds a "soul" to the professional blue that a flat hex code cannot replicate.

---

## 3. Typography

The typographic system relies on the tension between the intellectual weight of Noto Serif and the functional precision of Inter.

*   **Display & Headlines (Noto Serif):** Used for large-scale storytelling. The high contrast of the serif letterforms conveys "The Curator" persona—authoritative and sophisticated.
*   **Title, Body, & Labels (Inter):** These are the workhorses. Inter’s neutral, geometric clarity ensures that even complex AI tool descriptions remain highly legible.
*   **Editorial Hierarchy:** Always pair a `display-lg` headline with a `label-md` "kicker" above it in `tertiary` (#342400) all-caps to create a high-fashion editorial look.

---

## 4. Elevation & Depth

We eschew traditional shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. The subtle delta in hex value creates a soft, natural lift.
*   **Ambient Shadows:** If a floating element (like a mobile menu or a featured tool card) requires a shadow, it must be "Ambient":
    *   **Blur:** 40px–60px.
    *   **Opacity:** 4%–6%.
    *   **Color:** Use a tinted shadow based on `on_surface` (#1c1b1b) rather than pure black to keep the light feeling natural.
*   **The Ghost Border:** If a border is required for accessibility on inputs, use `outline_variant` at **20% opacity**. Never use a 100% opaque border.

---

## 5. Components

### Cards & Lists
*   **The Forbiddance:** Divider lines between list items are forbidden. 
*   **The Alternative:** Use `1.5rem` to `2rem` of vertical whitespace between items, or a subtle `surface-container` background hover state to define boundaries. 
*   **Directory Cards:** Use `surface-container-lowest` with a `roundedness-md` (0.375rem). The sharp-but-not-harsh corners maintain the "business professional" aesthetic.

### Buttons
*   **Primary:** A gradient fill (Primary to Primary-Container) with `on_primary` text. No shadow.
*   **Secondary:** No fill. A "Ghost Border" (outline-variant at 20%) that transitions to 100% opacity on hover.
*   **Tertiary/Link:** `tertiary` (#342400) text with a 1px underline that is offset by 4px and fades in from the center on hover.

### Inputs & AI Search Fields
*   **Styling:** Inputs should use `surface_container_low`. 
*   **Focus State:** Instead of a heavy glow, a focus state should trigger a subtle shift to `surface_container_lowest` and a crisp 1px `tertiary_fixed_dim` (#e9c176) "Ghost Border."

### AI Tool Chips
*   **Style:** Small-caps `label-sm` text.
*   **Background:** Use `secondary_container` (#e2dfde) with a `full` roundedness for a pill shape that feels like a physical tag.

---

## 6. Do’s and Don'ts

### Do:
*   **Embrace Asymmetry:** Place an image off-center and let the text wrap with generous padding.
*   **Use Tonal Shifts:** Create sections by moving from `surface` to `surface-container-low` back to `surface`.
*   **Prioritize Typography:** Let the size and weight of Noto Serif do the heavy lifting for the visual hierarchy.

### Don’t:
*   **Don't use 1px Dividers:** They clutter the premium feel and make the site look like a spreadsheet.
*   **Don't use standard Drop Shadows:** If it looks like it's "floating" more than 2mm off the page, the shadow is too heavy.
*   **Don't crowd the content:** If you feel you need a border to separate two sections, you likely just need more whitespace.
*   **Don't use pure black:** Use `primary` (#162839) or `on_surface` (#1c1b1b) for text to maintain tonal warmth.