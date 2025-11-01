# Gradient Tester

Interactive tool for testing color palettes and gradients.

**Location:** `/gradient-tester/index.html`

---

## Core Features

### Color Management
- Add/remove colors (1+ colors supported)
- Visual color picker
- Hex code input with validation
- Real-time preview updates

### Gradient Controls
- **Types:** Linear, Radial, Conic
- **Angle:** 0-360° rotation
- **Auto-calculation:** Evenly distributed color stops

### Built-in Presets
| Preset | Colors |
|--------|--------|
| Current Brand | #1B3CFF → #3BA6FF → #8B5CF6 |
| Recommended | #1B3A6B → #FF7A59 → #6B5DD3 |
| Warm | #FF6B6B → #FFA07A → #FFD700 |
| Cool | #4A90E2 → #50C9CE → #6C5CE7 |
| Monochrome | #1a1a1a → #6c757d → #dee2e6 |

### Profile System
- **Save:** Store colors + gradient settings
- **Load:** Restore saved combinations
- **Delete:** Remove unwanted profiles
- **Storage:** Browser localStorage
- **Display:** Color dots + metadata

### Export Options
- CSS variables (copy-ready)
- Hex codes (comma-separated)
- Auto-save to localStorage

---

## Preview Modes

### Components View
Tests colors on:
- Hero sections
- Buttons (6 variants)
- Cards (3 styles)
- Typography (H1-H3, body, links)
- Navigation bars
- Badges/tags
- Alerts (info/success/warning)
- Forms
- Progress bars
- Spinners

### Full Page View
Complete landing page mockup with all elements in context.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Add new color |
| `Ctrl/Cmd + S` | Focus profile name input |
| `Enter` | Save profile (in name input) |
| `Ctrl/Cmd + C` | Copy CSS (in CSS output) |

---

## Technical Specs

### Generated CSS
```css
:root {
  --color-1: #1B3CFF;
  --color-2: #3BA6FF;
  --color-3: #8B5CF6;
  --gradient: linear-gradient(90deg, ...);
}
```

### Browser Support
- Chrome/Edge ✅
- Firefox ✅
- Safari ✅
- Mobile responsive ✅

### Data Storage
- **Current state:** Auto-saved to localStorage
- **Profiles:** Separate localStorage key
- **Format:** JSON

---

## Use Cases

1. **Brand comparison** - Load Current vs Recommended
2. **A/B testing** - Save variations, compare screenshots
3. **Accessibility testing** - Check contrast across components
4. **Client presentations** - Quick profile switching
5. **Iterative design** - Save checkpoints while experimenting
