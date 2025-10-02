export const DEFAULT_CONFIG = {
  entity_id: '',
  text: '',
  animation: null,
  // Root-level styling that cascades to all text elements
  font: 'Home Assistant',
  font_weight: 'normal',
  color: '#FFFFFF',
  size: '48',
  number: {
    size: null,
    color: null,
    font_weight: null,
    decimals: 1,
    font: null,
  },
  unit_of_measurement: {
    display: true,
    as_prefix: false,
    display_text: null,
    size: null,
    color: null,
    font_weight: null,
    font: null,
  },
  title: {
    display: false,
    text: null,
    attribute: null,
    size: null,
    color: null,
    font_weight: null,
    font: null,
  },
  subtitle: {
    display: false,
    text: null,
    attribute: null,
    size: null,
    color: null,
    font_weight: null,
    font: null,
  },
  card: { color: null, background: null },
};

// Font registry for predefined Google Fonts
export const FONT_REGISTRY = {
  'Home Assistant': null, // Default font - no import needed
  Rubik: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;700&display=swap',
  'Rubik Beastly': 'https://fonts.googleapis.com/css2?family=Rubik+Beastly&display=swap',
  'Rubik Bubbles': 'https://fonts.googleapis.com/css2?family=Rubik+Bubbles&display=swap',
  'Rubik Doodle Shadow':
    'https://fonts.googleapis.com/css2?family=Rubik+Doodle+Shadow&display=swap',
  'Rubik Dirt': 'https://fonts.googleapis.com/css2?family=Rubik+Dirt&display=swap',
  'Rubik Glitch': 'https://fonts.googleapis.com/css2?family=Rubik+Glitch&display=swap',
  'Rubik Iso': 'https://fonts.googleapis.com/css2?family=Rubik+Iso&display=swap',
  'Rubik Microbe': 'https://fonts.googleapis.com/css2?family=Rubik+Microbe&display=swap',
  'Rubik Moonrocks': 'https://fonts.googleapis.com/css2?family=Rubik+Moonrocks&display=swap',
  'Rubik Pixels': 'https://fonts.googleapis.com/css2?family=Rubik+Pixels&display=swap',
  'Rubik Puddles': 'https://fonts.googleapis.com/css2?family=Rubik+Puddles&display=swap',
  'Rubik Scribble': 'https://fonts.googleapis.com/css2?family=Rubik+Scribble&display=swap',
  'Rubik Spray Paint': 'https://fonts.googleapis.com/css2?family=Rubik+Spray+Paint&display=swap',
  'Rubik Vinyl': 'https://fonts.googleapis.com/css2?family=Rubik+Vinyl&display=swap',
  'Rubik Wet Paint': 'https://fonts.googleapis.com/css2?family=Rubik+Wet+Paint&display=swap',
};
