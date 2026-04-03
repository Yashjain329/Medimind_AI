# MediConnect — Design System Specification

> **Project:** MediConnect Mobile UI
> **Project ID:** `13047889116101592498`
> **Device:** Mobile
> **Color Mode:** Light
> **Color Variant:** Fidelity
> **Spacing Scale:** 3

---

## 1. Creative North Star — "The Digital Sanctuary"

In the high-stakes world of healthcare, we move beyond the "utilitarian" look of legacy medical software. We are creating a space that feels **authoritative yet breathing** — an editorial-inspired interface that treats clinical data with the same elegance as a high-end wellness publication.

We achieve this by breaking the traditional "boxed-in" grid. By utilizing **intentional asymmetry**, **tonal layering**, and **expansive whitespace**, we transform a standard healthcare tool into a premium cognitive experience. The layout should feel less like a form and more like a curated dashboard where the most critical patient data "floats" into the user's field of vision.

---

## 2. Color Palette

### 2.1 Brand / Override Colors

| Role      | Hex       | Preview |
|-----------|-----------|---------|
| Primary   | `#1976D2` | 🔵      |
| Secondary | `#4CAF50` | 🟢      |
| Tertiary  | `#FFC107` | 🟡      |
| Neutral   | `#F5F7F8` | ⬜      |

### 2.2 Core Semantic Colors

| Token                | Hex       | Usage |
|----------------------|-----------|-------|
| `primary`            | `#005dac` | Navigation, primary actions — "Anchor Blue" establishing trust |
| `primary-container`  | `#1976d2` | Gradient endpoints for CTAs, filled buttons |
| `secondary`          | `#006e1c` | "Healthy" / "Recovered" states — organic, not neon |
| `secondary-container`| `#91f78e` | Light background for success contexts |
| `tertiary`           | `#765800` | Pending / "attention required" states — sophisticated amber-gold |
| `tertiary-container` | `#956f00` | Stronger amber container |
| `error`              | `#ba1a1a` | Reserved for **life-critical failures only** |
| `error-container`    | `#ffdad6` | Error field backgrounds for peripheral recognition |

### 2.3 Surface Hierarchy

Treat the UI as a series of physical layers. Structure is defined through **light and depth, not lines**.

| Layer                       | Token                       | Hex       | Purpose |
|-----------------------------|-----------------------------|-----------|---------|
| **Base Layer**              | `surface`                   | `#f8fafb` | Page background |
| **Sectioning Layer**        | `surface-container-low`     | `#f2f4f5` | Large layout blocks |
| **Action Layer**            | `surface-container-lowest`  | `#ffffff` | Interactive cards — "pops" against grey |
| —                           | `surface-container`         | `#eceeef` | Mid-level containers |
| —                           | `surface-container-high`    | `#e6e8e9` | Low-priority content |
| —                           | `surface-container-highest` | `#e1e3e4` | Input field backgrounds |
| **Bright**                  | `surface-bright`            | `#f8fafb` | Main background (high clinical contrast) |
| **Dim**                     | `surface-dim`               | `#d8dadb` | Depth layering behind white cards |
| **Tint**                    | `surface-tint`              | `#005faf` | Tint overlay for elevated surfaces |
| **Variant**                 | `surface-variant`           | `#e1e3e4` | Metric tiles, distinguishing non-interactive cards |

### 2.4 On-Colors (Text & Icons)

| Token                       | Hex       | Usage |
|-----------------------------|-----------|-------|
| `on-primary`                | `#ffffff` | Text on primary backgrounds |
| `on-primary-container`      | `#fffdff` | Text on primary containers |
| `on-secondary`              | `#ffffff` | Text on secondary backgrounds |
| `on-secondary-container`    | `#00731e` | Text on secondary containers |
| `on-tertiary`               | `#ffffff` | Text on tertiary backgrounds |
| `on-tertiary-container`     | `#fffdff` | Text on tertiary containers |
| `on-background`             | `#191c1d` | Primary body text |
| `on-surface`                | `#191c1d` | Default text — **never use 100% black** |
| `on-surface-variant`        | `#414752` | Secondary/muted text |
| `on-error`                  | `#ffffff` | Text on error backgrounds |
| `on-error-container`        | `#93000a` | Text on error containers |

### 2.5 Fixed Colors

| Token                         | Hex       |
|-------------------------------|-----------|
| `primary-fixed`               | `#d4e3ff` |
| `primary-fixed-dim`           | `#a5c8ff` |
| `on-primary-fixed`            | `#001c3a` |
| `on-primary-fixed-variant`    | `#004786` |
| `secondary-fixed`             | `#94f990` |
| `secondary-fixed-dim`         | `#78dc77` |
| `on-secondary-fixed`          | `#002204` |
| `on-secondary-fixed-variant`  | `#005313` |
| `tertiary-fixed`              | `#ffdf9e` |
| `tertiary-fixed-dim`          | `#fabd00` |
| `on-tertiary-fixed`           | `#261a00` |
| `on-tertiary-fixed-variant`   | `#5b4300` |

### 2.6 Outline & Inverse

| Token                | Hex       | Usage |
|----------------------|-----------|-------|
| `outline`            | `#717783` | Standard outlines |
| `outline-variant`    | `#c1c6d4` | Ghost borders (use at **15% opacity**) |
| `inverse-primary`    | `#a5c8ff` | Primary on dark surfaces |
| `inverse-surface`    | `#2e3132` | Dark inverse surface |
| `inverse-on-surface` | `#eff1f2` | Text on inverse surfaces |

---

## 3. Typography

Dual-font strategy balancing high-end aesthetics with clinical legibility.

### 3.1 Font Families

| Role                  | Font        | Purpose |
|-----------------------|-------------|---------|
| **Display & Headlines** | **Manrope** | Geometric sans-serif — authoritative, modern voice |
| **Title & Body**        | **Inter**   | High x-height — ensures legibility for medical terminology |
| **Labels**              | **Inter**   | Consistent with body for UI controls |

### 3.2 Type Scale & Usage

| Scale         | Font    | Usage |
|---------------|---------|-------|
| `display-lg`  | Manrope | Summary numbers (e.g., Heart Rate: **72** bpm) — editorial weight |
| `display-md`  | Manrope | Metric tile values |
| `headline-*`  | Manrope | Section headings |
| `title-lg`    | Inter   | Key metrics in `on-primary-fixed-variant` color to stand out |
| `title-md`    | Inter   | Card titles |
| `body-lg`     | Inter   | Primary body content |
| `body-md`     | Inter   | Descriptive text, dosage instructions |
| `label-lg`    | Inter   | Button text, form labels |
| `label-md`    | Inter   | Units (e.g., mg/dL), metadata |

### 3.3 Clinical Emphasis Rule

> Data is never "just text." Use `title-lg` in `on-primary-fixed-variant` (`#004786`) for key metrics to ensure they stand out against `body-md` descriptive text.

---

## 4. Shape & Roundness

| Element              | Corner Radius |
|----------------------|---------------|
| **Default (cards, containers)** | `8px` |
| **Buttons (primary)** | `12px` (0.75rem) |
| **Input fields**      | `12px` |
| **Status chips**      | `9999px` (full pill) — differentiates from square-ish buttons |

---

## 5. Elevation & Depth

Depth is achieved through **Tonal Layering**, not heavy shadows.

### 5.1 Layering Principle

| Priority   | Token                       | Effect |
|------------|-----------------------------|----|
| Low        | `surface-container-high`    | Recedes visually |
| Medium     | `surface-container`         | Mid-ground |
| High       | `surface-container-lowest`  | "Pops" — pure white on top of `surface-dim` |

### 5.2 Ambient Shadows

When shadows are required (e.g., floating action button):

```css
box-shadow: 0 8px 32px rgba(25, 28, 29, 0.06);
/* Color: tinted on-surface at 6% opacity */
/* Blur: 32px–48px — mimics natural light */
```

### 5.3 Ghost Border (Accessibility Fallback)

If a border is functionally required:

```css
border: 1px solid rgba(193, 198, 212, 0.15);
/* outline-variant at 15% opacity — a suggestion, never a hard stop */
```

---

## 6. Glass & Gradient Effects

### Glassmorphism (Modals & Dropdowns)

```css
background: rgba(248, 250, 251, 0.72);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
```

### CTA Gradient

```css
background: linear-gradient(135deg, #005dac, #1976d2);
/* primary → primary-container */
/* Adds 3D quality that flat colors lack */
```

---

## 7. Component Specifications

### 7.1 Buttons

| Variant     | Style |
|-------------|-------|
| **Primary** | Gradient fill (`primary` → `primary-container`), `12px` radius, min-height `48px` |
| **Secondary** | Ghost (no fill), `surface-variant` background on hover |
| **Tertiary** | Text-only, `primary` color, low-priority utility actions |

### 7.2 Cards & Lists

- **No dividers.** Never use horizontal lines to separate list items.
- Use **vertical whitespace** (16–24px) or alternating `surface-container-low` / `surface-container-lowest` backgrounds.
- **Padding:** Minimum `24px` internal padding — "Generous Breathing Room."

### 7.3 Input Fields

| Property     | Value |
|--------------|-------|
| Background   | `surface-container-highest` (`#e1e3e4`) |
| Border       | None by default; `2px solid primary` on `:focus` |
| Radius       | `12px` |
| Error state  | Text in `error`, background shifts to `error-container` |

### 7.4 Metric Tile (Specialized)

| Property   | Value |
|------------|-------|
| Value      | `display-md` (Manrope) |
| Unit       | `label-md` (Inter) |
| Background | `surface-variant` |

---

## 8. Key Design Rules

### ✅ Do

- Use `surface-bright` for main backgrounds — maintain high clinical contrast
- Allow elements to overlap slightly (e.g., card bleeding over section breaks) for depth
- Use `9999px` roundness for status chips ("Active," "Pending")
- Define boundaries through **background color shifts**, not borders

### ❌ Don't

- Use 100% black text — use `on-surface` (`#191c1d`) to reduce eye strain
- Use "Alert Red" for everything — reserve `error` for life-critical failures; use `tertiary` (amber) for other warnings
- Cram content — use horizontal scroll for secondary data tiles instead of vertical "wall of text"
- Use 1px solid borders to section content — structure through tonal layering only

---

## 9. Screens Overview

| # | Screen ID | Dimensions |
|---|-----------|------------|
| 1 | `b6a738e102c542c19dd0f9b4feb36102` | 390 × 884 |
| 2 | `053d6e80474f4fc0bc96cc2894ced7bd` | 390 × 1028 |
| 3 | `0d6755d299fc4a9c88fc6813dbfe60c7` | 390 × 1449 |
| 4 | `7b491a57f2b94f91bbf406fefd2e54ac` | 390 × 1345 |
| 5 | `b177f02ac23a41d991252daa68f2c5a8` | 390 × 1657 |
| 6 | `ebccdd824bfd457abc2360bc2a1beb44` | 390 × 2851 |
| 7 | `5810e5cce741415d81317c1d88df31b6` | 390 × 1866 |
| 8 | `a0b367ba19bd41308bb274d00eb45a8c` | 390 × 2931 |
| 9 | `8c2d2d5c8f1e473cb1167ff18c62d1be` | 390 × 897 |
