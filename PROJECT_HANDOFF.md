# Asmaan — Shopify Theme Handoff

- **Repository:** [github.com/Archit-Jain05/drinkasmaan](https://github.com/Archit-Jain05/drinkasmaan) (`main`)
- **Store:** [xhp0ym-sn.myshopify.com](https://xhp0ym-sn.myshopify.com/). The live theme is connected to `main` through the Shopify GitHub integration, so every push to `main` deploys immediately. The storefront is publicly reachable.
- **Source prototype:** `D:\Asmaan\Prototype` (Next.js 14, Tailwind, Framer Motion). The theme in this folder is the conversion of that prototype.
- **Status:** pre-launch. Buy buttons open a waitlist form until pre-launch mode is switched off on the drink page.

## Content model

The rule for this theme: nothing about a product is hardcoded. Product data comes from Shopify; everything else is a section setting or block in the theme editor.

### Products

Each flavour is its own Shopify product:

| Flavour | Handle |
| --- | --- |
| Kala Jamun | `kala-jamun` |
| Alphonso Mango | `alphonso-mango` |
| Wild Magenta | `wild-magenta` |

Product images are expected in this order: 1 front, 2 left, 3 right, 4 back, and last the unwrapped 360° label texture (used for the 3D can and the Designs flat-print view). Image positions are configurable on the drink and designs sections.

Optional product metafields (namespace `custom`) that sections read when present: `tagline`, `blurb`, `accent_color`, `primary_color`, `spec`, `shipping_details`, `label_image`. Block settings in the editor override metafields.

Pack sizes are **variants**. A drink "Pack tier" block (e.g. 24 cans) is matched to the variant whose option value contains that number, e.g. an option `Pack` with values `12 Cans`, `24 Cans`, `36 Cans`. Until matching variants exist, the block's fallback price is shown and the tier cannot be bought outside pre-launch mode.

Subscriptions use the product's selling plans (requires a subscriptions app). Without selling plans, the Subscribe option is display-only in pre-launch mode and hidden otherwise.

### Section map

| Page | Template | Section | Data source |
| --- | --- | --- | --- |
| Home | `index.json` | `asmaan-stage` | Flavour blocks (product picker), else collection |
| Home / Range | `index.json`, `page.range.json` | `asmaan-range` | Product card blocks, else collection |
| Drink (`/pages/drink`, also `page.shop.json`) | `page.drink.json` | `main-drink` + `assets/asmaan-drink.js` | Flavour, pack, badge, active, fact, review, FAQ blocks; `@app` blocks for a reviews app |
| Merch | `page.merch.json` | `main-merch` + `assets/asmaan-merch.js` | Garment piece blocks, optionally linked to products |
| Designs | `page.designs.json` | `main-designs` | Flavour blocks (product images) |
| Wear | `page.wear.json` | `main-wear` | Settings (drop teaser + waitlist) |
| Ambassador | `page.ambassador.json` | `main-ambassador` + `assets/asmaan-ambassador.js` | Perk and FAQ blocks, form settings |
| Product | `product.json` | `main-product` | Product; accent from metafield, then the section's "Accent colour per product" list |

Global pieces: `asmaan-navbar`, `asmaan-footer`, `cart-drawer` (+ `assets/cart-drawer.js`, exposes `window.asmaanCart.open/close/refresh`), `predictive-search` (+ `assets/predictive-search.js`).

Pages `designs`, `range` and `shop` have templates but no Shopify Page yet; create the pages in Admin and assign the templates to publish them.

### Conventions

- Prices are formatted client-side with the shop's own money format (`shop.money_format`), mirroring Liquid's `money_without_trailing_zeros`. Change the currency symbol in Admin › Settings › General, not in code.
- Text that mentions the free-shipping amount uses the token `[free_shipping_threshold]`, replaced with Theme settings › Cart › Free shipping threshold.
- JavaScript reads section data from a `<script type="application/json">` tag rendered by the section (`#drink-data`, `#predictive-search-labels`, `#designs-panel-labels`, `window.ASMAAN_AMBASSADOR_LABELS`). Add new labels as settings and pass them the same way.
- The compiled Tailwind file (`assets/asmaan-prototype.css`) is a static build: utility classes that were not in the prototype (for example responsive `sm:`/`lg:` grid classes) do not exist. Use scoped `<style>` in the section instead, as `asmaan-range` does.
- Beware `'key' | t | default: '...'`: a missing translation renders "translation missing", so the default never applies. Add the key to `locales/en.default.json` instead.

## Drink page pack animation

`main-drink` renders a scroll-scrubbed box-opening animation from 150 transparent WebP frames (`assets/pack-frame-01.webp` … `pack-frame-150.webp`), drawn to a canvas with a poster image shown until the first frame loads, and eased with `current += (target - current) * 0.22`. The frame count is a section setting. Up to three "Active ingredient" blocks flagged "Show as card in pack scene" appear as floating cards as the animation plays.

## Validating and deploying

There is no local Shopify CLI. Validate with Shopify's standalone theme checker before pushing:

```bash
npm i @shopify/theme-check-node   # in a scratch folder
node -e "require('@shopify/theme-check-node').themeCheckRun('<path to this folder>', undefined, () => {}).then(r => r.offenses.forEach(o => console.log(o.severity, o.check, o.uri, o.start.line + 1, o.message)))"
```

`ExcessiveSettingsCount` warnings are expected on the drink section; they are a style guideline, not a platform limit. After pushing, the store updates within about a minute; check pages for `Liquid error` or `translation missing` in the HTML.

On Windows PowerShell, if script execution policy blocks `npm`, call `& "C:\Program Files\nodejs\npm.cmd"` directly.

## Before launch (Shopify Admin)

1. Add pack-size variants with prices to each flavour product.
2. Set the currency format (e.g. `₹{{amount}}`) in Settings › General.
3. Review the free-shipping threshold in Theme settings › Cart.
4. Install a subscriptions app if Subscribe & Save is wanted.
5. Optionally fill the `custom.*` metafields so product data, not block overrides, drives the copy and colours.
6. Switch off "Pre-launch mode" on the drink section.
