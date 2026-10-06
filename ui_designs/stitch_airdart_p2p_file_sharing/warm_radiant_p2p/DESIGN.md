---
name: Warm Radiant P2P
colors:
  surface: '#fff8f1'
  surface-dim: '#e2d9c9'
  surface-bright: '#fff8f1'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e2'
  surface-container: '#f7eddc'
  surface-container-high: '#f1e7d6'
  surface-container-highest: '#ebe1d1'
  on-surface: '#1f1b11'
  on-surface-variant: '#554242'
  inverse-surface: '#353025'
  inverse-on-surface: '#f9f0df'
  outline: '#887271'
  outline-variant: '#dac1bf'
  surface-tint: '#994345'
  primary: '#994345'
  on-primary: '#ffffff'
  primary-container: '#ff9494'
  on-primary-container: '#782a2d'
  inverse-primary: '#ffb3b2'
  secondary: '#785656'
  on-secondary: '#ffffff'
  secondary-container: '#fdcfcf'
  on-secondary-container: '#795657'
  tertiary: '#6e5a58'
  on-tertiary: '#ffffff'
  tertiary-container: '#c5acab'
  on-tertiary-container: '#52403f'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ffb3b2'
  on-primary-fixed: '#400108'
  on-primary-fixed-variant: '#7b2c2f'
  secondary-fixed: '#ffdad9'
  secondary-fixed-dim: '#e8bcbc'
  on-secondary-fixed: '#2d1415'
  on-secondary-fixed-variant: '#5e3e3f'
  tertiary-fixed: '#f8dcda'
  tertiary-fixed-dim: '#dbc0bf'
  on-tertiary-fixed: '#261817'
  on-tertiary-fixed-variant: '#554241'
  background: '#fff8f1'
  on-background: '#1f1b11'
  surface-variant: '#ebe1d1'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 44px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-xxl: 3.5rem
---

## Brand & Style

This design system embodies a friendly, soft-tactile, and calm aesthetic designed for effortless peer-to-peer file and clipboard sharing. Moving away from sterile, cold utility tools, the interface feels like an inviting digital living room: warm, approachable, tactile, and immediately trustworthy. The primary audience ranges from non-technical everyday users moving photos between devices to engineers sharing logs across machines on the same local network. 

The visual style blends soft minimalism with warm tactile elements: generous whitespace, organic pill shapes, warm-tinted diffused drop shadows, and subtle micro-interactions that communicate connection state, transfer velocity, and local network presence without cognitive friction.

## Colors

The palette relies entirely on warm, comforting light tones that alleviate the tension often associated with network configuration and file transfer. 

- **Primary Accent (`#FF9494`)**: Used for active states, key interactive pills, pulsing radar pings, progress indicators, and prominent actions.
- **Soft Secondary (`#FFD1D1`)**: Used for subtle container fills, active indicator halos, transfer progress tracks, and secondary button states.
- **Light Tint (`#FFE3E1`)**: Used for nested card backgrounds, dropzones, hover states, and input field backgrounds.
- **Neutral Canvas (`#FFF5E4`)**: The global page background, radiating warmth while maintaining high legibility.
- **Text Primary (`#3B2A2A`)**: Deep warm chestnut tone providing high-contrast readability without the harshness of pure black.
- **Text Secondary (`#7A6363`)**: Muted cocoa hue for auxiliary metadata, file sizes, timestamps, and network statuses.

## Typography

The type system is powered exclusively by Plus Jakarta Sans to establish a welcoming, modern, and readable voice across all interfaces. The rounded geometry harmonizes directly with the generous corner radiuses and pill containers throughout the product.

All headings use tighter letter-spacing for cohesive presence, while body text stays at a comfortable 16px baseline for legibility during rapid file inspection. Labels and badges use medium to bold weights with slight positive letter spacing to maintain visual authority even at small sizes (11px–13px).

## Layout & Spacing

The layout is centered around an intentional fluid-responsive container model with a maximum reading/interaction width of 1120px for desktop, reflowing into an adaptive centered radar/deck layout on smaller viewports.

- **Breakpoints**: Mobile (< 640px), Tablet (640px – 1024px), Desktop (> 1024px).
- **Mobile**: Dynamic single-column stack. Radar peers render as an interactive carousel or circular radar node field, with bottom-sheet drawers for transfer queues and clipboard entries. Outer canvas margin is pinned to `1.25rem`.
- **Tablet**: 8-column layout. The peer radar and dropzone sit side-by-side or stacked with persistent bottom utility drawers.
- **Desktop**: 12-column layout with 20px gutters. Peer discovery nodes occupy the left or central hub, while the file dropzone and clipboard monitor occupy balanced responsive panels.

## Elevation & Depth

Visual hierarchy is communicated through soft, warm ambient shadows and tinted surface tiers rather than harsh contrast or dark drop shadows. Surfaces elevate by combining semi-translucent fills with tinted diffuse blurs.

- **Base Canvas**: Surface tier 0 (`#FFF5E4`), completely flat.
- **Surface Level 1 (Cards, Dropzones)**: Background `#FFFFFF` or `rgba(255, 255, 255, 0.72)` with a 1px border of `rgba(255, 148, 148, 0.2)` and ambient shadow `0 6px 20px -4px rgba(122, 99, 99, 0.08)`.
- **Surface Level 2 (Floating Pills, Active Peer Nodes, Modals)**: Background `#FFFFFF` with warm shadow `0 12px 32px -6px rgba(255, 148, 148, 0.22)`, accompanied by a crisp edge highlight `rgba(255, 255, 255, 0.8)`.
- **Radar & Signal Depth**: Rings and pulsing peer identifiers use concentric radial ripples with expanding opacities (`rgba(255, 148, 148, 0.35)` down to `0%`).

## Shapes

The design system employs a distinctly soft, inviting shape hierarchy:
- **Panels, Cards, and Dropzones**: 16px to 24px (`rounded-lg` to `rounded-xl`), creating friendly modular enclosures that avoid sharp clinical corners.
- **Interactive Buttons & Badges**: Fully rounded pills (`border-radius: 9999px`) to emphasize touchability and playful ergonomics.
- **Peer Device Avatars**: Pure circles (`50%`), surrounded by breathing beacon rings that expand outward during peer discovery and active WebRTC synchronization.

## Components

### Buttons & Pills
- **Primary Pill**: Background `#FF9494`, text `#FFFFFF`, fully rounded (pill). Subtle warm shadow `0 4px 14px rgba(255, 148, 148, 0.38)`. On hover, elevates with a slight scale (1.02) and background tint `#ff8585`.
- **Secondary Pill**: Background `#FFE3E1`, text `#3B2A2A`, fully rounded. Hover shifts to `#FFD1D1`.
- **Ghost / Outlined Pill**: Border 1.5px solid `#FFD1D1`, background transparent, text `#7A6363`. Hover background `#FFE3E1` with text `#3B2A2A`.

### Peer Discovery Nodes (Radar Avatars)
- Circular hubs (64px to 88px) centered around peer device types (phone, laptop, desktop).
- Encased in a floating white card with a device icon (1.75px stroke, `#3B2A2A`) and device name pill underneath.
- Active pairing state shows a soft breathing halo in `#FF9494`.

### Dropzone & File Staging Area
- Large rounded surface (24px corner radius) with a dashed border (2px stroke, `#FF9494` at 50% opacity, spaced 8px).
- Internal background `#FFFFFF` tinted with `#FFE3E1` at 30%.
- Includes an animated soft bounce icon state when files hover over the browser window.

### Cards & Transfer Queue
- Container cards use 20px border radius, white background, and a soft 1px border of `#FFE3E1`.
- Transfer progress items display a thumbnail or file type icon, file name in `label-lg`, size and transfer rate in `body-sm` (`#7A6363`), and a rounded progress track (8px height, `#FFE3E1` background, `#FF9494` fill).

### Text Input & Clipboard Sync Area
- Inset field with 16px radius, background `#FFE3E1` (25% opacity), border 1.5px solid transparent.
- Focus state activates a solid border of `#FF9494` with a diffuse halo `0 0 0 4px rgba(255, 148, 148, 0.18)`.
- Quick-share clipboard cards feature a one-tap "Send Clipboard" pill with clean, outlined copy/paste iconography.

### Toggles, Checkboxes & Radio Indicators
- Custom rounded switches and selection dots using `#FFE3E1` track and `#FF9494` active fills. No sharp square checkboxes.