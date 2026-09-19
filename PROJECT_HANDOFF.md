# Asmaan — Engineering Project Handoff & Shopify OS 2.0 Conversion Guide
> **Repository:** [github.com/Archit-Jain05/drinkasmaan](https://github.com/Archit-Jain05/drinkasmaan) (`main` branch)  
> **Shopify Store:** [xhp0ym-sn.myshopify.com](https://xhp0ym-sn.myshopify.com/)  
> **Source Prototype:** `D:\Asmaan\Prototype` (Next.js 14, Tailwind CSS, Framer Motion)  
> **Active Shopify Theme Directory:** `D:\Asmaan\Shopify Files`  
> **Target Audience for this Document:** Successor AI engineers (Claude 3.7 / Claude 3.5 Sonnet), Senior Frontend Engineers, and Shopify Technical Leads.

---

## Table of Contents
1. [Executive Summary & Brand Philosophy](#1-executive-summary--brand-philosophy)
2. [Codebase Architecture & File Tree](#2-codebase-architecture--file-tree)
3. [Deep-Dive: The 3D Pack Canvas Scroll Animation](#3-deep-dive-the-3d-pack-canvas-scroll-animation)
4. [Conversion Methodology: Next.js/React Prototype to Shopify OS 2.0](#4-conversion-methodology-nextjsreact-prototype-to-shopify-os-20)
5. [Page-by-Page Technical Breakdown](#5-page-by-page-technical-breakdown)
   - [5.1 Main Drink Product Page (`/pages/drink`)](#51-main-drink-product-page-pagesdrink)
   - [5.2 Wear Page (`/pages/wear`)](#52-wear-page-pageswear)
   - [5.3 Merch Page (`/pages/merch`)](#53-merch-page-pagesmerch)
   - [5.4 Designs & 360 Visualizer (`/pages/designs`)](#54-designs--360-visualizer-pagesdesigns)
6. [Global Features: Cart Drawer, Predictive Search, & Audio](#6-global-features-cart-drawer-predictive-search--audio)
7. [Shopify Backend Integration: Wiring Live Products, Variants & Subscriptions](#7-shopify-backend-integration-wiring-live-products-variants--subscriptions)
8. [Deployment, Git Workflow, & CLI Environment](#8-deployment-git-workflow--cli-environment)
9. [Pending Tasks & Claude's Next Action Items](#9-pending-tasks--claudes-next-action-items)

---

## 1. Executive Summary & Brand Philosophy

**Asmaan** is a luxury functional sparkling wellness beverage brand inspired by Vedic adaptogens and modern cyber-aesthetic design. The brand voice is crisp, high-tech, and sensory.

### Core Visual Elements:
- **Typography:**
  - Headings & Logomarks: `Syne` (900 weight, bold geometric sans).
  - Body & UI: `Outfit` (clean geometric humanistic sans).
  - Data, Nutrition, & Labels: `JetBrains Mono` (technical, editorial monospace).
- **Color Palette:**
  - Base: Cosmic Deep Black (`#050505` to `#0A0A0A`) with subtle glassmorphic borders (`rgba(255, 255, 255, 0.08)`).
  - Dynamic Taste Themes (governed by CSS variables `--taste-primary` and `--taste-secondary`):
    - **Kala Jamun:** Electric Violet / Jamun Purple (`#6B21A8` & `#9333EA`).
    - **Alphonso Mango:** Golden Amber / Mango Sun (`#D97706` & `#F59E0B`).
    - **Wild Magenta:** Cyber Dragonfruit / Electric Magenta (`#BE185D` & `#EC4899`).

---

## 2. Codebase Architecture & File Tree

The project was migrated from a standalone Next.js prototype (`D:\Asmaan\Prototype`) to a production-grade Shopify Online Store 2.0 Theme (`D:\Asmaan\Shopify Files`).

```
D:\Asmaan\Shopify Files
├── assets/
│   ├── asmaan-drink.js          # Core interactive logic for Drink page
│   ├── asmaan-theme.css         # Global design tokens, resets & typography
│   ├── cart-drawer.js           # AJAX slide-out cart, threshold bar, item mutations
│   ├── predictive-search.js     # Fast keyboard-navigable search
│   ├── pack-frame-01.webp       # Extracted 3D pack frame sequence (1 to 150)
│   ├── ...                      # (Total 150 transparent WebP frames)
│   ├── pack-frame-150.webp
│   └── can-angle-front.png      # 4-angle visualizer renders
├── config/
│   └── settings_schema.json     # Shopify Theme Customizer settings
├── layout/
│   └── theme.liquid             # Root HTML shell, fonts, global scripts
├── sections/
│   ├── asmaan-navbar.liquid     # Sticky glass header, nav drawer, search toggle
│   ├── asmaan-footer.liquid     # Brand manifesto, newsletter, legal links
│   ├── main-drink.liquid        # Flagship product page: 3D canvas, multi-angle can, swatches, tiers
│   ├── main-wear.liquid         # Streetwear drop showcase & size selector
│   ├── main-merch.liquid        # Lifestyle gear grid & interactive quick-look
│   └── main-designs.liquid      # 4-angle label viewer & 360° unwrapped flat print mode
├── snippets/
│   ├── cart-drawer.liquid       # Drawer markup & free shipping progress meter
│   ├── asmaan-drop-modal.liquid # VIP drop notification modal
│   └── predictive-search.liquid # Live search modal markup
└── templates/
    ├── page.drink.json          # OS 2.0 template pointing to main-drink section
    ├── page.wear.json           # Points to main-wear section
    ├── page.merch.json          # Points to main-merch section
    ├── page.designs.json        # Points to main-designs section
    └── page.shop.json           # Route alias for /shop
```

---

## 3. Deep-Dive: The 3D Pack Canvas Scroll Animation

The client requested an opening 3D beverage box animation inspired by [voidenergy.com/products/void-energy-12-pack](https://voidenergy.com/products/void-energy-12-pack). 

### 3.1 The Production Pipeline
1. **Video Generation:** Generated a high-resolution animation video using Google Flow (`Beverage_box_opening_product_ani…_20260919220243.mp4`).
2. **Frame Extraction:** Extracted 150 individual frames at 30fps using `ffmpeg-static`.
3. **Background & Watermark Removal (Native Alpha WebP):**
   - Built an automated Node.js processing pipeline using `sharp`.
   - Luminance/Chroma thresholding: Identified the background pixels and converted them to pure transparent alpha (`rgba(0,0,0,0)`).
   - Watermark Masking: Detected the bottom-right Google Gemini logo bounding box (`x > 620, y > 310`) and zeroed out pixel alpha.
   - Result: 150 transparent WebP frames (`pack-frame-01.webp` through `pack-frame-150.webp`), averaging ~24KB each (total ~3.6MB payload).

### 3.2 The Anti-Flicker Canvas Architecture
A major issue encountered was browser flickering when swapping image elements on scroll. Modern browsers execute image decoding asynchronously, causing 1-2 frame white/blank flashes.

**The Solution Implemented in `main-drink.liquid` and `asmaan-drink.js`:**
1. **Dual-Layer Visual Stack:**
   - Layer 1 (`<img id="pack-scroll-poster">`): Immediately displays the static 1st frame on initial page render. This guarantees zero pop-in delay before JavaScript loads.
   - Layer 2 (`<canvas id="pack-scroll-canvas">`): Hidden during initialization, smoothly fades in once the image buffer is loaded.
2. **Double-Buffered Atomic GPU Drawing:**
   - All 150 frames are preloaded into memory: `const frameImages = new Array(150);`.
   - Drawing occurs via `ctx.drawImage(frameImages[index], 0, 0, width, height)`.
   - The canvas retains its existing frame until the incoming frame is guaranteed to be available, completely eliminating white/black flickering.
3. **Lerp Scroll Smoothing (Linear Interpolation):**
   - Instead of snapping directly to the raw scroll position, the animation uses a `requestAnimationFrame` loop with an interpolation factor:
     ```javascript
     currentFrame += (targetFrame - currentFrame) * 0.22;
     ```
   - This provides fluid 60fps rendering even on high-refresh-rate trackpads and mobile touch scrolling.
4. **Frosted Ingredient Card Reveal:**
   - 3 floating glass cards (`KSM-66 Ashwagandha 300mg`, `L-Theanine 200mg`, `Natural Caffeine 100mg`) are tethered to scroll milestones:
     - Card 1 triggers at `progress >= 0.20`
     - Card 2 triggers at `progress >= 0.45`
     - Card 3 triggers at `progress >= 0.70`

---

## 4. Conversion Methodology: Next.js/React Prototype to Shopify OS 2.0

When converting components from Next.js (`D:\Asmaan\Prototype`) into Shopify Liquid, use the following translation protocol:

| React / Next.js Pattern | Shopify Online Store 2.0 Equivalent | Implementation Rule |
| :--- | :--- | :--- |
| **Component JSX (`.tsx`)** | Section (`sections/*.liquid`) or Snippet (`snippets/*.liquid`) | Use `sections/` for major blocks that need schema controls. Use `snippets/` for reusable partials rendered via `{% render 'snippet-name' %}`. |
| **`useState()`** | DOM Data Attributes + CSS Variables | Store state on root containers (e.g. `data-taste="jamun"`, `data-tier="24"`). Update global CSS variables (`--taste-primary`). |
| **`useEffect()` & Lifecycle** | Vanilla JS IIFE / Class in `assets/*.js` | Use `DOMContentLoaded` or `customElements.define()` with `IntersectionObserver` and event delegation. |
| **Framer Motion (`motion.div`)** | GPU-accelerated CSS Transitions + Keyframes | Use `transform: translate3d()`, `will-change: transform, opacity`, and CSS classes toggled by JavaScript. |
| **Static Hardcoded Data** | Shopify Liquid Schema Settings & Blocks | Wrap text, badges, prices, and media in Liquid tags (`{{ section.settings.title }}`) and JSON schema definitions. |
| **`next/image`** | `{{ image \| image_url: width: 800 \| image_tag }}` | Use Shopify's built-in CDN image filters with `loading="lazy"` and `srcset`. |
| **Client-Side Navigation** | `templates/*.json` routing | Map routes to JSON templates (`page.drink.json`, `page.wear.json`) and assign them to Shopify Pages in Admin. |

---

## 5. Page-by-Page Technical Breakdown

### 5.1 Main Drink Product Page (`/pages/drink`)
- **File Location:** `sections/main-drink.liquid`, `assets/asmaan-drink.js`
- **Features:**
  1. **Multi-Angle 3D Can Rotator:**
     - 4 view buttons: `0° FRONT`, `90° RIGHT`, `180° BACK`, `270° LEFT`.
     - Toggles high-resolution studio renders with a smooth perspective rotation effect.
  2. **Taste & Color Swatches:**
     - Swapping swatches triggers a seamless cross-fade of the can body art and updates the ambient gradient background.
  3. **Tier Selector & Math Engine:**
     - **12-Pack:** ₹1,199 (₹99 / can)
     - **24-Pack:** ₹2,199 (₹91 / can) — *Tag: "MOST POPULAR — SAVE 15%"*
     - **36-Pack:** ₹2,999 (₹83 / can) — *Tag: "BEST VALUE — SAVE 25%"*
     - Live subtotal calculator instantly updates when quantity steppers or pack sizes change.
  4. **Subscription Selector:**
     - One-time purchase vs. Subscribe & Save (10% recurring discount).
     - Reveals delivery frequency selector (Every 2, 3, or 4 Weeks).
  5. **Sticky "DrinkBar" Bottom Dock:**
     - Hidden on hero view; an `IntersectionObserver` watching the hero buy box reveals the bottom bar when the user scrolls down.
     - Keeps Flavor, Pack Tier, Price, and "Add to Cart" accessible anywhere on the page.
  6. **Interactive Formula Section:**
     - 5 Active Ingredients breakdown with clinical dosage cards.
     - "View Full Nutrition Facts" opens an authentic regulatory modal displaying calories, carbohydrates, vitamins, and zero-sugar certifications.

### 5.2 Wear Page (`/pages/wear`)
- **File Location:** `sections/main-wear.liquid`, `templates/page.wear.json`, `snippets/asmaan-drop-modal.liquid`
- **Features:**
  - Streetwear showcase for limited-edition apparel (e.g. Asmaan Cyber Hoodie, Vedic Acid-Wash Tee).
  - Size pills (S, M, L, XL, XXL) with dynamic inventory alerts ("Only 3 left in L").
  - "Notify for Next Drop" button launches `asmaan-drop-modal.liquid` with SMS/Email subscription input.

### 5.3 Merch Page (`/pages/merch`)
- **File Location:** `sections/main-merch.liquid`, `templates/page.merch.json`
- **Features:**
  - Curated gear grid: Laser-etched stainless steel tumbler, heavy-canvas tote, embroidered dad hat.
  - Hover zoom and quick-add actions hooked into the cart drawer.

### 5.4 Designs & 360 Visualizer (`/pages/designs`)
- **File Location:** `sections/main-designs.liquid`, `templates/page.designs.json`
- **Features:**
  - Label artwork inspector designed for brand review.
  - Interactive 360° unwrapped flat print visualizer showing full cylindrical graphics, typography alignment, and barcoding.

---

## 6. Global Features: Cart Drawer, Predictive Search, & Audio

### 6.1 Slide-Out Cart Drawer (`snippets/cart-drawer.liquid`, `assets/cart-drawer.js`)
- **Drawer Trigger:** Any click on `[data-cart-drawer-trigger]` or programmatically via `window.AsmaanCart.open()`.
- **Free Shipping Threshold Bar:**
  - Threshold constant: ₹999.
  - Dynamically calculates: `const remaining = 999 - (cart.total_price / 100);`
  - Updates progress bar width (`0%` to `100%`) and displays "Add ₹X for Free Express Shipping" or "Unlocked Free Express Shipping!".
- **AJAX Mutations:**
  - Quantity increment/decrement sends payload to `/cart/change.js`.
  - Re-renders line items without full-page refresh.

### 6.2 Predictive Search (`snippets/predictive-search.liquid`, `assets/predictive-search.js`)
- Debounced fetch targeting `/search/suggest.json?q={query}&resources[type]=product`.
- Results render instantly in a frosted glass modal with pricing, badge, and direct links.

### 6.3 Sound & Motion Mode
- Top navbar features an ambient audio & motion control toggle.
- Allows users to enable/disable subtle UI click audio and ambient motion effects.

---

## 7. Shopify Backend Integration: Wiring Live Products, Variants & Subscriptions

Currently, the prototype uses dynamic client-side state. To connect this to live Shopify inventory:

### 7.1 Product & Variant Mapping
1. In Shopify Admin, create a Product titled **"Asmaan Functional Sparkling Energy"**.
2. Configure 2 Options:
   - **Option 1 (Flavor):** `Kala Jamun`, `Alphonso Mango`, `Wild Magenta`
   - **Option 2 (Pack Size):** `12 Cans`, `24 Cans`, `36 Cans`
   - *(Total 9 variants generated)*.
3. In `main-drink.liquid`, render a variant lookup table in JSON:
   ```liquid
   <script id="product-variants-json" type="application/json">
     {{ product.variants | json }}
   </script>
   ```
4. In `assets/asmaan-drink.js`, match active selections to variant IDs:
   ```javascript
   function getSelectedVariantId(flavor, packSize) {
     const variants = JSON.parse(document.getElementById('product-variants-json').textContent);
     const match = variants.find(v => v.option1 === flavor && v.option2 === packSize);
     return match ? match.id : null;
   }
   ```
5. Pass this variant ID into the hidden form field `<input type="hidden" name="id" value="...">` used by the "Add to Cart" button.

### 7.2 Subscription Selling Plans
- When a user chooses "Subscribe & Save (10% Off)", Shopify requires a `selling_plan` ID.
- Use Shopify Subscriptions API or an app like **Appstle** or **Recharge**.
- In the form payload:
  ```javascript
  const payload = {
    id: selectedVariantId,
    quantity: selectedQuantity,
    selling_plan: isSubscription ? selectedSellingPlanId : undefined
  };
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  ```

---

## 8. Deployment, Git Workflow, & CLI Environment

- **Git Remote:**
  ```bash
  git remote -v
  # origin  https://github.com/Archit-Jain05/drinkasmaan.git (fetch)
  # origin  https://github.com/Archit-Jain05/drinkasmaan.git (push)
  ```
- **Shopify GitHub Integration:**
  - The live theme on `xhp0ym-sn.myshopify.com` is connected directly to the `main` branch.
  - Every `git push origin main` triggers an automatic background deployment to the Shopify live store.
- **Node.js Environment Note (Windows):**
  - If running PowerShell, script execution policies may block standard `npm` aliases.
  - Always execute npm and node commands using full executable paths:
    ```powershell
    & "C:\Program Files\nodejs\npm.cmd" run <script>
    & "C:\Program Files\nodejs\node.exe" <script.js>
    ```

---

## 9. Pending Tasks & Claude's Next Action Items

When picking up from this point, prioritize the following tasks:

1. **Wire Live Shopify AJAX Cart Submission:**
   - In `assets/asmaan-drink.js`, replace the placeholder cart addition alert with a direct `fetch('/cart/add.js')` call that immediately triggers `window.AsmaanCart.refreshAndOpen()`.
2. **Shopify Theme Customizer Schema Integration:**
   - Add `{% schema %}` blocks to `main-drink.liquid` and `main-wear.liquid` so marketing text, prices, and trust badges can be edited natively in the Shopify Admin Customizer without touching Liquid files.
3. **Customer Reviews Snippet:**
   - Create `snippets/reviews-slider.liquid` or integrate a Shopify reviews app block (e.g. Judge.me or Loox) into `main-drink.liquid`.
4. **Checkout Branding & Styling:**
   - Ensure theme accent colors (`#6B21A8`, `#D97706`) and logo assets are linked in `config/settings_data.json` for Shopify Plus checkout branding.
5. **Mobile Viewport Optimization for 3D Canvas:**
   - Verify touch scrolling performance on iOS Safari and Android Chrome. If necessary, tune the canvas frame step on low-powered mobile devices (e.g. step by 2 frames on low memory).

---
*Document prepared and verified by Antigravity Engineering. All code and frame assets are committed to `main`.*
