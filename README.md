[//]: # (Project title updated from copied templates)
# Large Number Card

![GitHub Release](https://img.shields.io/github/v/release/gaco79/large-display-card?style=for-the-badge)
![Downloads](https://img.shields.io/github/downloads/gaco79/large-display-card/total?style=for-the-badge)
![GitHub commit activity](https://img.shields.io/github/commit-activity/m/gaco79/large-display-card?style=for-the-badge)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/gaco79/large-display-card/cd.yml?style=for-the-badge)
[![BuyMeACoffee](https://img.shields.io/badge/-buy_me_a%C2%A0coffee-gray?logo=buy-me-a-coffee&style=for-the-badge)](https://www.buymeacoffee.com/gaco79)

<p align="center">A Home Assistant card to display a single number prominently.</p>


## Installation

### HACS (recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=gaco79&repository=large-display-card&category=plugin)

### Manual install (Not recommended)

1. Download and copy `large-display-card.js` from the [latest release](https://github.com/gaco79/large-display-card/releases/latest) into your `config/www` directory.
2. Add the resource reference inside your `configuration.yaml`

```yaml
lovelace:
  mode: yaml
  resources:
    - url: /local/large-display-card.js
      type: module
```

## Configuration

In Home Assistant click `Edit Dashboard`, then `Add Card` and scroll down to find "Custom: Large Number Card". All options except language can be configured by the graphical editor.

#### Sample Configuration

```YAML
type: custom:large-display-card
entity_id: sensor.temperature
card:
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
title:
  display: true
  text: "Living Room"
  size: 18
number:
  size: 96
  font: "Rubik Microbe"
subtitle:
  display: true
  attribute: friendly_name
  size: 14
unit_of_measurement:
  display: true
```

#### Card Background Configuration

The card supports flexible background styling.

**`card.background`** - Accepts any valid CSS background value and supports Home Assistant templating:

```YAML
# Solid color background
type: custom:large-display-card
card:
  background: "#ff5722"

# Gradient background  
type: custom:large-display-card
card:
  background: "linear-gradient(45deg, #2196F3, #21CBF3)"

# Template-based background (changes based on entity state)
type: custom:large-display-card
card:
  background: >
    {% if states('sensor.temperature') | float > 25 %}
      linear-gradient(45deg, #f44336, #ff9800)
    {% else %}
      linear-gradient(45deg, #2196F3, #03DAC6)
    {% endif %}
```

#### Font Configuration

The card supports custom fonts for both the number and unit of measurement. Fonts are loaded dynamically only when needed.

**Available Predefined Fonts (from `src/const.ts`):**

The card ships with a small font registry and will dynamically load Google Fonts when required. The registry in `src/const.ts` contains the following entries (use these exact names in `font`):

- `Home Assistant` — Default system/Home Assistant font (no external import required)
- `Rubik` — Google Font: Rubik (multiple weights)
- `Rubik Beastly` — Google Font: Rubik Beastly
- `Rubik Bubbles` — Google Font: Rubik Bubbles
- `Rubik Doodle Shadow` — Google Font: Rubik Doodle Shadow
- `Rubik Dirt` — Google Font: Rubik Dirt
- `Rubik Glitch` — Google Font: Rubik Glitch
- `Rubik Iso` — Google Font: Rubik Iso
- `Rubik Microbe` — Google Font: Rubik Microbe
- `Rubik Moonrocks` — Google Font: Rubik Moonrocks
- `Rubik Pixels` — Google Font: Rubik Pixels
- `Rubik Puddles` — Google Font: Rubik Puddles
- `Rubik Scribble` — Google Font: Rubik Scribble
- `Rubik Spray Paint` — Google Font: Rubik Spray Paint
- `Rubik Vinyl` — Google Font: Rubik Vinyl
- `Rubik Wet Paint` — Google Font: Rubik Wet Paint

If you use a font from this registry, the card will automatically import the Google Fonts CSS URL when the card is rendered. For fonts not listed here, ensure the font is loaded elsewhere in your Home Assistant resources.

**Usage Examples:**

```YAML
# Use a Google Font for the number only
type: custom:large-display-card
entity_id: sensor.temperature
number:
  size: 64
  font: "Rubik Microbe"
  color: "#FFFFFF"
unit_of_measurement:
  display: true
  font: "Home Assistant"
```

```YAML
# Use the same custom font for both number and unit
type: custom:large-display-card
entity_id: sensor.power
number:
  size: 48
  font: "Monofett"
unit_of_measurement:
  display: true
  font: "Monofett"
  size: 16
```

**Custom Fonts:**
You can also specify any system font or custom font name. For Google Fonts not in the predefined list, ensure they are loaded elsewhere in your Home Assistant setup.

#### Animation Configuration

The card supports animated transitions when the displayed value changes. Configure the `animation` key to specify the type of transition:

**Available Animation Types:**
- `none` or not specified - No animation (default, instant value change)
- `fade` - Fade out old value, fade in new value
- `slide-horizontal` - Slide out horizontally to the left, slide in new value from the right
- `slide-vertical` - Slide up old value, slide down new value
- `stretch` - Stretch value horizontally and then return with new value
- `zoom` - Zoom blur effect (zoom out old value with blur, zoom in new value)

**Usage Examples:**

```YAML
# Fade animation
type: custom:large-display-card
entity_id: sensor.temperature
animation: fade
number:
  size: 64
```

```YAML
# Horizontal slide animation
type: custom:large-display-card
entity_id: sensor.power
animation: slide-horizontal
```

```YAML
# No animation (default behavior)
type: custom:large-display-card
entity_id: sensor.humidity
# animation not specified or set to null
```

**Notes:**
- Animations only trigger when the **displayed** value changes (after rounding/formatting)
- If the entity state changes but the displayed value remains the same, no animation occurs
- Each animation completes in 0.3 seconds (300ms)

#### Title and Subtitle Configuration

The card supports displaying additional text above (title) and below (subtitle) the main value. Both can be configured to display static text, entity attributes, or Home Assistant templates.

**Configuration Options:**

Title and subtitle support the same configuration structure with the following properties:
- `display` - Boolean to show/hide the title or subtitle (default: `false`)
- `text` - Static text or Home Assistant template to display
- `attribute` - Entity attribute name to display (used when `text` is not provided)
- `size` - Font size in pixels (default: `'16'`)
- `color` - CSS color (default: `'#FFFFFF'`)
- `font_weight` - Font weight (default: `'normal'`)
- `font` - Font family (default: `'Home Assistant'`)

**Priority:** If both `text` and `attribute` are configured, `text` takes precedence.

**Usage Examples:**

```YAML
# Static title and subtitle
type: custom:large-display-card
entity_id: sensor.temperature
title:
  display: true
  text: "Living Room"
  size: 18
  color: "#4CAF50"
subtitle:
  display: true
  text: "Current Temperature"
  size: 14
  color: "#2196F3"
```

```YAML
# Display entity attributes as title and subtitle
type: custom:large-display-card
entity_id: sensor.power_consumption
title:
  display: true
  attribute: friendly_name
  size: 16
subtitle:
  display: true
  attribute: device_class
  size: 14
```

```YAML
# Template-based title and subtitle (dynamic based on state)
type: custom:large-display-card
entity_id: sensor.temperature
title:
  display: true
  text: >
    {% if states('sensor.temperature') | float > 25 %}
      Hot 🔥
    {% else %}
      Cool ❄️
    {% endif %}
  size: 20
  color: >
    {% if states('sensor.temperature') | float > 25 %}
      #FF5722
    {% else %}
      #2196F3
    {% endif %}
subtitle:
  display: true
  text: "{{ now().strftime('%H:%M') }}"
  size: 14
```

```YAML
# Title only (no subtitle)
type: custom:large-display-card
text: "42"
title:
  display: true
  text: "Answer to Everything"
  font: "Rubik"
  size: 20
```

**Configuration Options:**

**Configuration Options:**

Below are all supported configuration keys, their types, defaults (from `src/const.ts`) and short descriptions. Use these inside your card definition (YAML or UI editor).

| Name | Type | Default | Description |
| ---- | :--: | :-----: | ----------- |
| `entity_id` | string | `''` | (Optional) The entity whose state/value will be displayed. If empty, set `text` to display a static value. |
| `text` | string | `''` | (Optional) Static text to display instead of reading from an entity. Useful for labels or fixed values. |
| `animation` | string|null | `null` | Animation type for value changes. Supported values: `none` (or omit), `fade`, `slide-horizontal`, `slide-vertical`, `zoom`. `null` (default) means no animation. |
| `number` | object | see nested defaults | Controls the main numeric value rendering (size, color, font, decimals, weight). |
| `number.size` | string|number | `'48'` | Font size for the number. Can be provided as a number or string (e.g. `48` or `'48'`). |
| `number.color` | string | `'#FFFFFF'` | CSS color used for the number text. Accepts hex, rgb(a), named colors, or templated values. |
| `number.font_weight` | string|number | `'bold'` | Font weight for the number text (e.g. `normal`, `bold`, `700`). |
| `number.decimals` | number | `1` | Number of decimal places to display (used when formatting numeric entity states). |
| `number.font` | string | `'Home Assistant'` | Font family for the number. Predefined fonts are listed in the README; custom/system fonts are allowed. |
| `unit_of_measurement` | object | see nested defaults | Controls rendering of the unit/measurement label. |
| `unit_of_measurement.display` | boolean | `true` | Whether to show the unit of measurement text. |
| `unit_of_measurement.as_prefix` | boolean | `false` | When true, render the unit before the number (prefix) instead of after (suffix). |
| `unit_of_measurement.display_text` | string|null | `null` | Override text to use for the unit instead of the entity's unit_of_measurement. Set to `null` to use the entity-provided unit. |
| `unit_of_measurement.size` | string|number | `'24'` | Font size for the unit text. Can be number or string. |
| `unit_of_measurement.color` | string | `'#FFFFFF'` | CSS color for the unit text. |
| `unit_of_measurement.font_weight` | string|number | `'normal'` | Font weight for the unit text. |
| `unit_of_measurement.font` | string | `'Home Assistant'` | Font family for the unit text. |
| `title` | object | see nested defaults | Controls rendering of optional title text above the main value. |
| `title.display` | boolean | `false` | Whether to show the title text. |
| `title.text` | string|null | `null` | Static text or Home Assistant template to display. Takes precedence over `attribute`. |
| `title.attribute` | string|null | `null` | Entity attribute name to display (e.g., `friendly_name`). Used when `text` is not provided. |
| `title.size` | string|number | `'16'` | Font size for the title text. |
| `title.color` | string | `'#FFFFFF'` | CSS color for the title text. |
| `title.font_weight` | string|number | `'normal'` | Font weight for the title text. |
| `title.font` | string | `'Home Assistant'` | Font family for the title text. |
| `subtitle` | object | see nested defaults | Controls rendering of optional subtitle text below the main value. |
| `subtitle.display` | boolean | `false` | Whether to show the subtitle text. |
| `subtitle.text` | string|null | `null` | Static text or Home Assistant template to display. Takes precedence over `attribute`. |
| `subtitle.attribute` | string|null | `null` | Entity attribute name to display (e.g., `device_class`). Used when `text` is not provided. |
| `subtitle.size` | string|number | `'16'` | Font size for the subtitle text. |
| `subtitle.color` | string | `'#FFFFFF'` | CSS color for the subtitle text. |
| `subtitle.font_weight` | string|number | `'normal'` | Font weight for the subtitle text. |
| `subtitle.font` | string | `'Home Assistant'` | Font family for the subtitle text. |
| `card` | object | `{ color: null, background: null }` | Card-level styling options. See "Card Background Configuration" above for usage. |
| `card.color` | string|null | `null` | Legacy single-color value used when `card.background` is not provided. Accepts any CSS color or template. |
| `card.background` | string|null | `null` | Preferred background option. Any valid CSS background value is accepted (colors, gradients). Supports Home Assistant template syntax. |

Notes:
- Values shown as strings in defaults (for sizes) are accepted as numbers as well; the card normalizes them internally. 
- The font registry and available predefined fonts are defined in `src/const.ts` (the README includes a list of commonly used fonts). For custom Google fonts not in the registry, ensure the font is loaded in your Home Assistant resources.

## My Other Cards

Other Home Assistant cards by the same author:

- [Analogue clock](https://github.com/gaco79/clock-simple)
- [Time in Words](https://github.com/gaco79/gcclock-words)

## Development

To develop the card:

- Clone this repository
- Run `docker compose up -d` from the cloned directory
- Run `npm start`
- Browse to `http://localhost:8123/` and configure your home assistant development build
- Add the card to a dashboard as described above

