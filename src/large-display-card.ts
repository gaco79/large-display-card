import { version } from '../package.json';
import { customElement } from 'lit/decorators.js';
import { DEFAULT_CONFIG, FONT_REGISTRY } from './const';
import style from './style';

/**
 * Large Display Card
 *
 * A lightweight Home Assistant custom element (<large-display-card>) that displays a single
 * large value with an optional unit of measurement. The element watches the
 * Home Assistant `hass` object (setter `hass`) and re-renders whenever the underlying
 * state for the configured `entity_id` changes.
 *
 * Responsibilities
 * - Merge user configuration with a DEFAULT_CONFIG using a deep merge so nested config
 *   objects (e.g. `number`, `unit_of_measurement`, `card`) are merged rather than replaced.
 * - Render a simple card (ha-card) with centered content and a configurable gradient
 *   background, text color and typographic styles for the number and unit.
 * - Handle different display states: loading (when hass not available), unknown (when
 *   entity not found) and the actual entity state string. If a unit is present in the
 *   entity attributes it will be shown according to the `unit_of_measurement` config.
 *
 * Example
 * @example
 * // Typical configuration passed to setConfig
 * {
 *   entity_id: "sensor.temperature",
 *   number: { size: 48, font_weight: "700", color: "#fff" },
 *   unit_of_measurement: { display: true, size: 14, as_prefix: false, color: "#eee" },
 *   card: { background: "linear-gradient(135deg,#2196F3,#21CBF3)" }
 * }
 *
 * Properties
 * @property {HTMLElement | undefined} content - Root card element (ha-card) appended to this custom element.
 * @property {any} config - Effective configuration (DEFAULT_CONFIG deep-merged with user config).
 * @property {any} _hass - Internal reference to the latest Home Assistant `hass` object.
 * @property {HTMLElement | undefined} numberEl - Container element that holds the numeric value and unit.
 *
 * Methods
 * @method
 * set hass(hass: any)
 * @param {any} hass - Home Assistant object. Setter stores the value internally and triggers re-render.
 *
 * @method
 * updateContent(): void
 * @remarks
 * Compute the display text from the merged `config` and the current `_hass` states,
 * create the DOM structure on first render (ha-card + number container) or update the
 * existing DOM elements on subsequent renders. Applies card and layout styles derived
 * from `config.card` and delegates number/unit rendering to updateNumberDisplay.
 *
 * @method
 * updateNumberDisplay(display: string, unit_of_measurement_text: string): void
 * @param {string} display - The text to render as the primary numeric value (usually an entity state).
 * @param {string} unit_of_measurement_text - The unit text to render (may be empty).
 * @remarks
 * Ensures the number and unit <span> elements exist, updates their textContent and styles
 * (font size, weight, color) using values from `config.number` and `config.unit_of_measurement`.
 * When `unit_of_measurement.as_prefix` is true the layout direction is reversed so the unit
 * appears before the number.
 *
 * @method
 * private deepMerge(target: any, source: any): any
 * @param {any} target - The target object to merge into (usually DEFAULT_CONFIG or a nested portion).
 * @param {any} source - The source object whose values overwrite or extend target values.
 * @returns {any} A new object representing a deep merge of target and source. Nested plain objects are merged;
 *          primitive values and arrays are replaced by the source.
 * @private
 *
 * @method
 * setConfig(config: any): void
 * @param {any} config - User provided configuration object. This is deep-merged with DEFAULT_CONFIG.
 * @remarks
 * If `entity_id` is missing a console warning is emitted. After merging the configuration the card is rendered/updated.
 *
 * @method
 * getCardSize(): number
 * @returns {number} The approximate height/size of the card (used by Home Assistant layout). This card returns 2.
 *
 * Notes
 * - This class is written as a native custom element (extends HTMLElement) and expects to be
 *   registered as @customElement("large-display-card") elsewhere in the codebase.
 * - Types are intentionally loose (any) for `hass` and `config` because the component is
 *   primarily configured with plain JS objects and integrates with Home Assistant's dynamic shape.
 */
@customElement('large-display-card')
class LargeDisplayCard extends HTMLElement {
  content;
  config;
  _hass;
  numberEl;
  card;

  /** Shadow config holds rendered/template-resolved values */
  shadowConfig;

  /** Track loaded fonts to avoid duplicate loading */
  private loadedFonts = new Set<string>();

  /** Track previous displayed value to detect changes */
  private previousDisplayValue: string | null = null;

  // --- new debounce state for setConfig ---
  private pendingConfig = null;
  private setConfigTimer: number | null = null;
  private readonly SET_CONFIG_DEBOUNCE_MS = 400;
  // --- end new debounce state ---

  constructor() {
    super();
    // Attach shadow DOM and add styles
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const styleSheet = document.createElement('style');
    styleSheet.textContent = style.cssText;
    shadowRoot.appendChild(styleSheet);

    // Ensure we always have a sane config immediately so hass updates before setConfig don't crash.
    // Use deepMerge to clone DEFAULT_CONFIG into this.config/shadowConfig.
    // ...deepMerge is defined later on the prototype, calling it here is safe.
    this.config = this.deepMerge({}, DEFAULT_CONFIG);
    this.shadowConfig = this.deepMerge({}, this.config);
  }

  /**
   * Load a font if it's not already loaded and is in the font registry
   */
  private loadFont(font: string): void {
    if (!font || font === 'Home Assistant') {
      return; // No loading needed for default font
    }

    if (this.loadedFonts.has(font)) {
      return; // Already loaded
    }

    const fontUrl = FONT_REGISTRY[font as keyof typeof FONT_REGISTRY];
    if (fontUrl) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
      this.loadedFonts.add(font);
    } else {
      // For custom fonts or fonts not in registry, assume they're available
      // Could be system fonts or fonts loaded elsewhere
      this.loadedFonts.add(font);
    }
  }

  set hass(hass) {
    // store hass internally and re-render when it changes
    this._hass = hass;
    this.updateContent();
  }

  /**
   * Compute the display text and unit from hass + config.
   */
  private computeDisplayTexts() {
    let state_display_text = '0';
    let unit_of_measurement_text = '';
    let title_text = '';
    let subtitle_text = '';

    const hasEntityId = this.config && this.config.entity_id;
    const hassStates = this._hass && this._hass.states;

    if (hasEntityId && hassStates) {
      const stateObj = hassStates[this.config.entity_id];

      if (stateObj) {
        const rawState = stateObj.state;
        const parsed = Number(rawState);

        if (!Number.isFinite(parsed)) {
          // non-numeric state – keep original text (e.g. "unknown", "on")
          state_display_text = String(rawState);
        } else {
          const decimalsCfgRaw = this?.config?.number?.decimals ?? DEFAULT_CONFIG.number.decimals;
          const decimalsCfg = Number.isFinite(Number(decimalsCfgRaw))
            ? Number(decimalsCfgRaw)
            : DEFAULT_CONFIG.number.decimals;
          const useDecimals = Number.isInteger(decimalsCfg) && decimalsCfg >= 0;
          state_display_text = useDecimals ? parsed.toFixed(decimalsCfg) : String(parsed);
        }

        // unit if available
        // prefer explicit display_text from config when provided (not null/undefined)
        const cfgUnitText = this?.config?.unit_of_measurement?.display_text;
        if (cfgUnitText !== null && cfgUnitText !== undefined) {
          unit_of_measurement_text = String(cfgUnitText);
        } else if (stateObj.attributes && stateObj.attributes.unit_of_measurement) {
          unit_of_measurement_text = stateObj.attributes.unit_of_measurement;
        }

        // title: prefer explicit text, then attribute, then empty
        const cfgTitleText = this?.shadowConfig?.title?.text ?? this?.config?.title?.text;
        const cfgTitleAttr = this?.config?.title?.attribute;
        if (cfgTitleText !== null && cfgTitleText !== undefined) {
          title_text = String(cfgTitleText);
        } else if (
          cfgTitleAttr &&
          stateObj.attributes &&
          stateObj.attributes[cfgTitleAttr] !== undefined
        ) {
          title_text = String(stateObj.attributes[cfgTitleAttr]);
        }

        // subtitle: prefer explicit text, then attribute, then empty
        const cfgSubtitleText = this?.shadowConfig?.subtitle?.text ?? this?.config?.subtitle?.text;
        const cfgSubtitleAttr = this?.config?.subtitle?.attribute;
        if (cfgSubtitleText !== null && cfgSubtitleText !== undefined) {
          subtitle_text = String(cfgSubtitleText);
        } else if (
          cfgSubtitleAttr &&
          stateObj.attributes &&
          stateObj.attributes[cfgSubtitleAttr] !== undefined
        ) {
          subtitle_text = String(stateObj.attributes[cfgSubtitleAttr]);
        }
      } else {
        state_display_text = 'unknown';
      }
    } else if (hasEntityId && !hassStates) {
      // hass not yet available
      state_display_text = 'loading';
    } else if (!hasEntityId) {
      // no entity configured: use the `text` config key as fallback
      const cfgText = this?.config?.text;
      state_display_text = String(cfgText ?? '');

      // unit: prefer explicit display_text from unit_of_measurement config when provided
      const cfgUnitText = this?.config?.unit_of_measurement?.display_text;

      if (cfgUnitText != null) {
        unit_of_measurement_text = String(cfgUnitText);
      }

      // title and subtitle: use static text if provided
      const cfgTitleText = this?.shadowConfig?.title?.text ?? this?.config?.title?.text;
      if (cfgTitleText !== null && cfgTitleText !== undefined) {
        title_text = String(cfgTitleText);
      }

      const cfgSubtitleText = this?.shadowConfig?.subtitle?.text ?? this?.config?.subtitle?.text;
      if (cfgSubtitleText !== null && cfgSubtitleText !== undefined) {
        subtitle_text = String(cfgSubtitleText);
      }
    }

    return { state_display_text, unit_of_measurement_text, title_text, subtitle_text };
  }

  /**
   * If card.background, title.text, or subtitle.text is a template, render it via hass.callApi and update shadowConfig.
   */
  private async applyTemplates() {
    if (!this.config) return;

    // ensure shadowConfig exists (clone of this.config)
    if (!this.shadowConfig) {
      this.shadowConfig = this.deepMerge({}, this.config);
    }

    // Apply card.background template
    if (this.config.card) {
      this.shadowConfig.card = this.shadowConfig.card || {};
      const cardCfg = this.config.card || {};
      const keys = ['background'];

      for (const key of keys) {
        const tpl = cardCfg[key];
        // if no value, ensure shadow has something sensible
        if (!tpl && this.shadowConfig.card[key]) continue;

        if (typeof tpl === 'string' && (tpl.includes('{{') || tpl.includes('{%'))) {
          if (this._hass && typeof this._hass.callApi === 'function') {
            try {
              const rendered: string = await this._hass.callApi('POST', 'template', {
                template: tpl,
              });
              if (typeof rendered === 'string' && rendered.trim() !== '') {
                this.shadowConfig.card[key] = rendered.trim();
              } else {
                // fallback to previous shadow value or original template text
                this.shadowConfig.card[key] = this.shadowConfig.card[key] || tpl;
              }
            } catch (err) {
              console.warn(`large-display-card: template render failed for card.${key}`, err);
              this.shadowConfig.card[key] = this.shadowConfig.card[key] || tpl;
            }
          } else {
            // no hass.callApi available yet; keep previous shadow or raw template
            this.shadowConfig.card[key] = this.shadowConfig.card[key] || tpl;
          }
        } else {
          // static value: copy into shadow so background can use it uniformly
          this.shadowConfig.card[key] = tpl;
        }
      }
    }

    // Apply title.text template
    if (this.config.title) {
      this.shadowConfig.title = this.shadowConfig.title || {};
      const titleText = this.config.title.text;

      if (
        titleText &&
        typeof titleText === 'string' &&
        (titleText.includes('{{') || titleText.includes('{%'))
      ) {
        if (this._hass && typeof this._hass.callApi === 'function') {
          try {
            const rendered: string = await this._hass.callApi('POST', 'template', {
              template: titleText,
            });
            if (typeof rendered === 'string') {
              this.shadowConfig.title.text = rendered;
            } else {
              this.shadowConfig.title.text = this.shadowConfig.title.text || titleText;
            }
          } catch (err) {
            console.warn('large-display-card: template render failed for title.text', err);
            this.shadowConfig.title.text = this.shadowConfig.title.text || titleText;
          }
        } else {
          this.shadowConfig.title.text = this.shadowConfig.title.text || titleText;
        }
      } else {
        this.shadowConfig.title.text = titleText;
      }
    }

    // Apply subtitle.text template
    if (this.config.subtitle) {
      this.shadowConfig.subtitle = this.shadowConfig.subtitle || {};
      const subtitleText = this.config.subtitle.text;

      if (
        subtitleText &&
        typeof subtitleText === 'string' &&
        (subtitleText.includes('{{') || subtitleText.includes('{%'))
      ) {
        if (this._hass && typeof this._hass.callApi === 'function') {
          try {
            const rendered: string = await this._hass.callApi('POST', 'template', {
              template: subtitleText,
            });
            if (typeof rendered === 'string') {
              this.shadowConfig.subtitle.text = rendered;
            } else {
              this.shadowConfig.subtitle.text = this.shadowConfig.subtitle.text || subtitleText;
            }
          } catch (err) {
            console.warn('large-display-card: template render failed for subtitle.text', err);
            this.shadowConfig.subtitle.text = this.shadowConfig.subtitle.text || subtitleText;
          }
        } else {
          this.shadowConfig.subtitle.text = this.shadowConfig.subtitle.text || subtitleText;
        }
      } else {
        this.shadowConfig.subtitle.text = subtitleText;
      }
    }

    // debug
    // console.log("large-display-card: shadow card config", this.shadowConfig.card.background);
  }

  /**
   * Ensure the ha-card and number container exist and are initialized.
   */
  private ensureCard() {
    if (this.content) return;

    this.card = document.createElement('ha-card');

    this.card.style.display = 'flex';
    this.card.style.flexDirection = 'column';
    this.card.style.justifyContent = 'center';
    this.card.style.alignItems = 'center';
    this.card.style.padding = '16px';
    this.card.style.color = 'white';

    // Create title container
    const titleContainer = document.createElement('div');
    titleContainer.id = 'title-container';
    titleContainer.style.display = 'flex';
    titleContainer.style.justifyContent = 'center';
    titleContainer.style.alignItems = 'center';
    titleContainer.style.width = '100%';

    // Create number container (horizontal layout for number and unit)
    const numberBox = document.createElement('div');
    numberBox.style.display = 'flex';
    numberBox.style.flexDirection = 'row';
    numberBox.style.justifyContent = 'center';
    numberBox.style.alignItems = 'center';
    numberBox.style.margin = '16px';

    // Create subtitle container
    const subtitleContainer = document.createElement('div');
    subtitleContainer.id = 'subtitle-container';
    subtitleContainer.style.display = 'flex';
    subtitleContainer.style.justifyContent = 'center';
    subtitleContainer.style.alignItems = 'center';
    subtitleContainer.style.width = '100%';

    this.numberEl = numberBox;

    this.card.appendChild(titleContainer);
    this.card.appendChild(numberBox);
    this.card.appendChild(subtitleContainer);

    if (this.shadowRoot) {
      this.shadowRoot.appendChild(this.card);
    }

    this.content = this.card;
  }

  async updateContent() {
    // Check if we should update (value changed)
    if (!this.shouldUpdate()) {
      return;
    }

    // evaluate templates in card color, title, and subtitle if needed
    await this.applyTemplates();

    // compute display text from hass + config (after templates are applied)
    const { state_display_text, unit_of_measurement_text, title_text, subtitle_text } =
      this.computeDisplayTexts();

    // create card and number container if this is first render
    this.ensureCard();

    // update number & unit elements and styles
    if (this.numberEl) {
      this.updateNumberDisplay(state_display_text, unit_of_measurement_text);
    }

    // update title and subtitle
    this.updateTitleAndSubtitle(title_text, subtitle_text);
  }

  /**
   * Animate the value change using CSS animations
   */
  private animateValueChange(element: Element, newValue: string, animationType: string) {
    // Map animation type to CSS class pairs
    const animationMap = {
      fade: { out: 'animate-fade-out', in: 'animate-fade-in' },
      'slide-horizontal': { out: 'animate-slide-out-left', in: 'animate-slide-in-right' },
      'slide-vertical': { out: 'animate-slide-out-up', in: 'animate-slide-in-up' },
      zoom: { out: 'animate-zoom-out', in: 'animate-zoom-in' },
      stretch: { out: 'animate-stretch-out', in: 'animate-stretch-in' },
    };

    const animations = animationMap[animationType];
    if (!animations) {
      // Unknown animation type, just update without animation
      element.textContent = newValue;
      return;
    }

    // Remove any existing animation classes
    element.className = '';

    // Start out animation
    element.classList.add(animations.out);

    // After animation completes, update value and animate in
    setTimeout(() => {
      element.textContent = newValue;
      element.classList.remove(animations.out);
      element.classList.add(animations.in);

      // Clean up animation class after it completes
      setTimeout(() => {
        element.classList.remove(animations.in);
      }, 300);
    }, 300);
  }

  updateNumberDisplay(state_display_text, unit_of_measurement_text) {
    // Use local config references with safe fallbacks to DEFAULT_CONFIG to avoid
    // reading properties of undefined if this.config wasn't set yet.
    const cfg = this.config || DEFAULT_CONFIG;
    const cfgNumber = cfg && cfg.number ? cfg.number : DEFAULT_CONFIG.number;
    const uomCfg =
      cfg && cfg.unit_of_measurement ? cfg.unit_of_measurement : DEFAULT_CONFIG.unit_of_measurement;

    // apply card background using shadowConfig (rendered values) if available
    const shadowCard =
      this.shadowConfig && this.shadowConfig.card
        ? this.shadowConfig.card
        : cfg && cfg.card
          ? cfg.card
          : {};
    // Use card.background if available. Background supports any valid CSS background value
    if (shadowCard && shadowCard.background) {
      if (this.card) {
        this.card.style.background = shadowCard.background;
      }
    }

    // Load fonts if needed
    const numberFontFamily = cfgNumber.font || DEFAULT_CONFIG.number.font;
    this.loadFont(numberFontFamily);

    // ensure number span
    let number = this.numberEl.querySelector('span#number');
    if (!number) {
      number = document.createElement('span');
      number.id = 'number';
      // small separation to unit handled by unit element margin
    }

    // Check if value changed and animation is configured
    const valueChanged =
      this.previousDisplayValue !== null && this.previousDisplayValue !== state_display_text;
    const animationType = cfg.animation;

    if (valueChanged && animationType && animationType !== 'none') {
      // Apply animation
      this.animateValueChange(number, state_display_text, animationType);
    } else {
      // No animation, just update the value
      number.textContent = state_display_text;
    }

    // Update previous value
    this.previousDisplayValue = state_display_text;

    number.style.fontSize = (cfgNumber.size ?? DEFAULT_CONFIG.number.size) + 'px';
    number.style.fontWeight = cfgNumber.font_weight ?? DEFAULT_CONFIG.number.font_weight;
    number.style.color = cfgNumber.color ?? DEFAULT_CONFIG.number.color;
    number.style.fontFamily =
      numberFontFamily === 'Home Assistant'
        ? 'var(--ha-card-header-font-family, inherit)'
        : numberFontFamily;

    // append or re-append ensures ordering when direction changes
    if (!number.parentElement) {
      this.numberEl.appendChild(number);
    }

    // handle unit if displayed (guard in case unit_of_measurement is missing or null)
    if (uomCfg && uomCfg.display) {
      // Load font for unit if different from number font
      const unitFontFamily = uomCfg.font || DEFAULT_CONFIG.unit_of_measurement.font;
      this.loadFont(unitFontFamily);

      let unit_of_measurement_element = this.numberEl.querySelector('span#unit_of_measurement');

      if (!unit_of_measurement_element) {
        unit_of_measurement_element = document.createElement('span');
        unit_of_measurement_element.id = 'unit_of_measurement';
      }

      unit_of_measurement_element.textContent = unit_of_measurement_text;
      unit_of_measurement_element.style.fontSize =
        (uomCfg.size ?? DEFAULT_CONFIG.unit_of_measurement.size) + 'px';
      unit_of_measurement_element.style.fontWeight =
        uomCfg.font_weight ?? DEFAULT_CONFIG.unit_of_measurement.font_weight;
      unit_of_measurement_element.style.color =
        uomCfg.color ?? DEFAULT_CONFIG.unit_of_measurement.color;
      unit_of_measurement_element.style.fontFamily =
        unitFontFamily === 'Home Assistant'
          ? 'var(--ha-card-header-font-family, inherit)'
          : unitFontFamily;
      unit_of_measurement_element.style.margin = '0 8px';

      if (!unit_of_measurement_element.parentElement) {
        this.numberEl.appendChild(unit_of_measurement_element);
      }
    } else {
      // remove unit element if present and not desired
      const existingUnit = this.numberEl.querySelector('span#unit_of_measurement');
      if (existingUnit && existingUnit.parentElement) {
        existingUnit.parentElement.removeChild(existingUnit);
      }
    }

    // layout direction when unit is prefix
    if (uomCfg && uomCfg.display && uomCfg.as_prefix) {
      this.numberEl.style.flexDirection = 'row-reverse';
    } else {
      this.numberEl.style.flexDirection = 'row';
    }
  }

  /**
   * Update title and subtitle elements
   */
  updateTitleAndSubtitle(title_text: string, subtitle_text: string) {
    const cfg = this.config || DEFAULT_CONFIG;
    const titleCfg = cfg && cfg.title ? cfg.title : DEFAULT_CONFIG.title;
    const subtitleCfg = cfg && cfg.subtitle ? cfg.subtitle : DEFAULT_CONFIG.subtitle;

    // Update title
    const titleContainer = this.card?.querySelector('#title-container');
    if (titleContainer && titleCfg && titleCfg.display && title_text) {
      // Load font for title
      const titleFontFamily = titleCfg.font || DEFAULT_CONFIG.title.font;
      this.loadFont(titleFontFamily);

      let titleElement = titleContainer.querySelector('span#title');
      if (!titleElement) {
        titleElement = document.createElement('span');
        titleElement.id = 'title';
        titleContainer.appendChild(titleElement);
      }

      titleElement.textContent = title_text;
      titleElement.style.fontSize = (titleCfg.size ?? DEFAULT_CONFIG.title.size) + 'px';
      titleElement.style.fontWeight = titleCfg.font_weight ?? DEFAULT_CONFIG.title.font_weight;
      titleElement.style.color = titleCfg.color ?? DEFAULT_CONFIG.title.color;
      titleElement.style.fontFamily =
        titleFontFamily === 'Home Assistant'
          ? 'var(--ha-card-header-font-family, inherit)'
          : titleFontFamily;
      titleElement.style.marginBottom = '8px';
    } else if (titleContainer) {
      // Remove title element if not displayed
      const existingTitle = titleContainer.querySelector('span#title');
      if (existingTitle && existingTitle.parentElement) {
        existingTitle.parentElement.removeChild(existingTitle);
      }
    }

    // Update subtitle
    const subtitleContainer = this.card?.querySelector('#subtitle-container');
    if (subtitleContainer && subtitleCfg && subtitleCfg.display && subtitle_text) {
      // Load font for subtitle
      const subtitleFontFamily = subtitleCfg.font || DEFAULT_CONFIG.subtitle.font;
      this.loadFont(subtitleFontFamily);

      let subtitleElement = subtitleContainer.querySelector('span#subtitle');
      if (!subtitleElement) {
        subtitleElement = document.createElement('span');
        subtitleElement.id = 'subtitle';
        subtitleContainer.appendChild(subtitleElement);
      }

      subtitleElement.textContent = subtitle_text;
      subtitleElement.style.fontSize = (subtitleCfg.size ?? DEFAULT_CONFIG.subtitle.size) + 'px';
      subtitleElement.style.fontWeight =
        subtitleCfg.font_weight ?? DEFAULT_CONFIG.subtitle.font_weight;
      subtitleElement.style.color = subtitleCfg.color ?? DEFAULT_CONFIG.subtitle.color;
      subtitleElement.style.fontFamily =
        subtitleFontFamily === 'Home Assistant'
          ? 'var(--ha-card-header-font-family, inherit)'
          : subtitleFontFamily;
      subtitleElement.style.marginTop = '8px';
    } else if (subtitleContainer) {
      // Remove subtitle element if not displayed
      const existingSubtitle = subtitleContainer.querySelector('span#subtitle');
      if (existingSubtitle && existingSubtitle.parentElement) {
        existingSubtitle.parentElement.removeChild(existingSubtitle);
      }
    }
  }

  /**
    Deep merge helper to merge nested config objects like number, unit_of_measurement, card
  */
  private deepMerge(target: object | unknown[], source: object | unknown[]): object | unknown[] {
    const out: object | unknown[] = Array.isArray(target) ? [...target] : { ...target };

    if (source && typeof source === 'object') {
      for (const key of Object.keys(source)) {
        const val = source[key];
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          out[key] = this.deepMerge(target ? target[key] : {}, val);
        } else {
          out[key] = val;
        }
      }
    }

    return out;
  }

  shouldUpdate() {
    // Compute current display text
    const { state_display_text } = this.computeDisplayTexts();

    // If this is the first render or if displayed value changed, allow update
    if (this.previousDisplayValue === null || this.previousDisplayValue !== state_display_text) {
      return true;
    }

    return false;
  }

  /**
   * Set the configuration for the card.
   * Debounced to avoid rapid repeated merges/errors while editing YAML.
   */
  setConfig(config) {
    // store the latest requested config and debounce applying it
    this.pendingConfig = config;

    if (this.setConfigTimer !== null) {
      window.clearTimeout(this.setConfigTimer);
    }

    this.setConfigTimer = window.setTimeout(() => {
      try {
        this._applyConfig(this.pendingConfig);
      } finally {
        this.setConfigTimer = null;
        this.pendingConfig = null;
      }
    }, this.SET_CONFIG_DEBOUNCE_MS);
  }

  /**
   * Apply configuration immediately (extracted from previous synchronous setConfig).
   */
  private _applyConfig(config) {
    this.config = this.deepMerge(DEFAULT_CONFIG, config || {});
    // initialize shadowConfig as a clone so templates can be re-rendered into it
    this.shadowConfig = this.deepMerge({}, this.config);

    if (!this.config.entity_id && !this.config.text) {
      console.warn('large-display-card: no entity_id or text provided in config');
    }

    this.updateContent();
  }

  getCardSize() {
    return 2;
  }
}

// Add this type declaration to fix TypeScript error re customCard
declare global {
  interface Window {
    customCards: Array<{
      type: string;
      name: string;
      description: string;
      preview: boolean;
    }>;
  }
}

/* eslint no-console: 0 */
console.info(
  `%c large-display-card ${version}`,
  'color: white; background-color:rgba(109, 51, 109, 1); font-weight: 700;'
);

export default LargeDisplayCard;

// This puts the card into the UI card picker dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'large-display-card',
  name: 'Large Number',
  description: 'Card displaying a large value.',
  preview: true,
});
