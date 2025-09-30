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
card:
  color: red
number:
  size: 96
  font_family: "Rubik Microbe"
unit_of_measurement:
  display: false
```

#### Card Background Configuration

The card supports flexible background styling through two configuration options:

**`card.background`** (Recommended) - Accepts any valid CSS background value and supports Home Assistant templating:

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

**`card.color`** (Legacy) - Used only when `card.background` is not specified. Creates a solid gradient:

```YAML
type: custom:large-display-card
card:
  color: red  # Creates: linear-gradient(135deg, red, red)
```

**Note:** `card.color2` has been removed. For gradient backgrounds, use `card.background` with CSS gradient syntax.

#### Font Configuration

The card supports custom fonts for both the number and unit of measurement. Fonts are loaded dynamically only when needed.

**Available Predefined Fonts:**
- `Home Assistant` (default) - Uses the default Home Assistant font
- `Rubik Microbe` - Expressive Google Font with a playful style
- `Rubik Doodle Shadow` - Bold shadowed Google Font
- `Monofett` - Stylized monospace Google Font

**Usage Examples:**

```YAML
# Use a Google Font for the number only
type: custom:large-display-card
entity_id: sensor.temperature
number:
  size: 64
  font_family: "Rubik Microbe"
  color: "#FFFFFF"
unit_of_measurement:
  display: true
  font_family: "Home Assistant"
```

```YAML
# Use the same custom font for both number and unit
type: custom:large-display-card
entity_id: sensor.power
number:
  size: 48
  font_family: "Monofett"
unit_of_measurement:
  display: true
  font_family: "Monofett"
  size: 16
```

**Custom Fonts:**
You can also specify any system font or custom font name. For Google Fonts not in the predefined list, ensure they are loaded elsewhere in your Home Assistant setup.

**Configuration Options:**

**Configuration Options:**

| Name                    |  Type  |                      Default                      | Description |
| ----------------------- | :----: | :-----------------------------------------------: | ----------- |
| `card`                  | object |   `{ color: null, background: null }`           | Card styling options |
| `number`                | object |   `{ size: 48, color: '#FFFFFF', font_weight: 'bold', decimals: 1, font_family: 'Home Assistant' }` | Number display options |
| `number.font_family`    | string |   `'Home Assistant'`                            | Font family for the number |
| `unit_of_measurement`   | object |   `{ display: true, as_prefix: false, size: 24, color: '#FFFFFF', font_weight: 'normal', font_family: 'Home Assistant' }` | Unit display options |
| `unit_of_measurement.font_family` | string | `'Home Assistant'`                     | Font family for the unit |

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

