# Final can labels — going live

The site shows the final can labels (Mango, Jamun, Mixed Berries, from the client's Illustrator
PDFs, 19 Oct 2026). They went live on 20 Oct 2026: the product images were replaced and the theme
pushed within the same minute (section 2, kept as the record). Section 1 still needs the client,
and the Apps Script in 2c still needs the new links.

Files that only exist on this Mac (not in git): `.qa/labels-2026-10-19/`
- `upload/` — the replacement Shopify product images (step 2b)
- `pack/pack-before-after.mp4` — the drink-page box animation, old next to new
- `out/sheet-jamun.jpg`, `sheet-mango.jpg`, `sheet-print.jpg` — every can photo, old above new

## 1. Confirm with the client first (label vs. what the site says)

These are product claims, so nothing here has been changed on the site. Several are printed on
the can itself, so they may need fixing in the artwork before it goes to print.

| | Final label says | Site says (where) |
|---|---|---|
| Sweeteners | "Contains non-caloric sweetener", "admixture of sucralose & steviol glycoside" (INS955, INS960) | "Nothing is sweetened up to cover a flat recipe" (homepage Zero sugar benefit, About page) |
| Caffeine | 33.75 mg per 250 ml | 100 mg per can / 40 mg per 100 ml (homepage, FAQ, product page details); 34.5 mg (product page spec card) |
| Sodium | 33.75 mg (same figure as caffeine; possibly copy-pasted) | 14 mg (product page nutrition) |
| Magnesium | 110 mg, as magnesium chloride | 60 mg magnesium bisglycinate (homepage FAQ, product page) |
| B vitamins | B3 8.0 mg, B6 1.5 mg, B12 2.0 mcg | B6 1.4 mg, B12 2.5 µg, no B3 |
| L-theanine | no amount printed | 200 mg (homepage, FAQ, product page details); 100 mg (product page spec card) |
| Flavour name | "MIXED BERRIES FLAVOR" | product "Wild Magenta", "Rose and pink guava" |
| Spelling | "FLAVOR" (Mixed Berries) vs "FLAVOUR" (Mango, Jamun) | — |
| Tagline | "AMBITION FUEL" | "Ambition Tonic" everywhere (splash, footer, SEO title, shop, carton in the drink-page animation) |
| Placeholders | "[phone #]", "[email id]", "Lic. No.:--------" | — |

## 2. Go live (done 20 Oct 2026, except the Apps Script in c)

Rolling back: the replaced originals are saved in `.qa/labels-2026-10-19/media-backup-2026-10-20/`.
`python3 .qa/labels-2026-10-19/tools/swap_media.py swap media-backup-2026-10-20` puts them back in
the same slots; then revert commits 55e0fb0 and 1bf1eac and push.

**a. Push the theme**

```bash
cd ~/Desktop/drinkasmaan
git pull --rebase origin main    # Archit pushes to main too; rebase over his commits
git push origin main             # live within about a minute
```

If the rebase stops on `assets/asmaan-prototype.js`, keep both sides: our change there is only
`ICON_COLUMN_U` / `ICON_V` near the top. Theme-editor saves arrive as "Update from Shopify" commits
on `templates/*.json`; rebasing over them is fine.

**b. Replace the product images** (Shopify admin › Products), straight after the push

| Product | Replace with (from `.qa/labels-2026-10-19/upload/`) |
|---|---|
| Kala Jamun | `kala-jamun/` — all 5 images |
| Alphonso Mango | `alphonso-mango/` — all 5 images |
| Wild Magenta | `wild-magenta/` — all 5 images |
| The Ambition Box | `the-ambition-box/` — image 2 (`02-box-open.jpg`) and image 6 (`06-cans.jpg`) only |

Keep the order: 01 front, 02 left, 03 right, 04 back, **05 label texture last**. The 3D cans take
their label from each product's last image.

Why together: the theme now aims the homepage close-up spotlight and the product-page view
buttons at the new label. Until the images are swapped, the 3D cans still wear the old label, and
the spotlight lands beside the icons.

(Done through the Admin API on 20 Oct: `fileUpdate` replaced each file in place, keeping the same
image slots, IDs and order.)

**c. Update the free-sample email script** (done in `PRELAUNCH_SETUP.md`; the Apps Script still needs it)

The Google Apps Script hardcodes the can photos' CDN links (`CANS`). The file names did not change,
only the `?v=` number, and links with the old numbers keep serving the old cans. Copy the three
`CANS` links from `PRELAUNCH_SETUP.md` into the Apps Script and redeploy (Deploy › Manage
deployments › edit › New version).

## 3. Check once it's live (hard-refresh; the CDN can lag a few minutes)

- Homepage: all three cans show the new print. Scroll to the benefits close-up: the spotlight
  should sit on each icon (research backed, stress response, sugar free, focus).
- A product page: Front / Botanical / Nutritional / Disclaimer turn the can to the wordmark,
  founder's note, nutrition panel and benefit icons. Gallery thumbnails are the new cans.
- About, Contact, Ambassador: new cans. The Ambition Box page: new cans in the opened box and in
  the three-can strip.
- Drink page: the box animation shows the new can rising out of the carton.
- Cart and checkout thumbnails come from the product images (step 2b).

## Store policies (published 20 Oct 2026)

Privacy, Refund, Shipping and Terms of service are live (Settings › Policies, `/policies/...`),
from the client's four documents, plus Contact information (`/policies/contact-information`) and a
Pricing details page (Online Store › Pages, on the "legal" template, `/pages/pricing-details`).
Shopify's old auto-generated privacy policy is saved in `.qa/policies-2026-10-20/backup-before.json`.

How the documents' blanks were filled, and what still needs the client:
- Website: `xhp0ym-sn.myshopify.com` (no custom domain is connected; drinkasmaan.com does not
  exist yet). When a domain is connected, update the URL in all four policies.
- Email: `drinkasmaan@gmail.com` (the store's contact email). The contact page now shows it
  too (it used `hello@drinkasmaan.com`, which cannot receive mail until that domain exists).
- Phone: none known, so the phone lines were left out. Add a real support number (payment
  providers such as Razorpay usually expect one).
- The policies name Asmaan Beverages and Nutrition Pvt Ltd (Dwarka, Delhi); the can label names
  OFLO BLUSH Pvt Ltd; Shopify's billing address is Bandra West, Mumbai.
- Terms send disputes to Mumbai courts although the registered office is in Delhi.
- The shipping policy charges shipping at actuals; the site advertises free shipping across India
  (and a ₹999 free-shipping threshold in the cart).

## 4. Optional follow-ups

- The product-page view buttons are still named "Botanical", "Nutritional", "Disclaimer"; they now
  show the founder's note, the nutrition panel and the benefit icons.
- If the flavour becomes "Mixed Berries": the product title and description, the range callout
  copy, and the homepage stage/range blocks (they point at the `wild-magenta` handle; changing a
  handle breaks links, so add a URL redirect).
- If the tagline becomes "Ambition Fuel": theme settings (splash, footer), password page, homepage
  SEO title, shop filter, merch tagline, FAQ, ambassador copy. The carton in the drink-page
  animation also prints "24 CANS · AMBITION TONIC" (it's in the video frames).
- The Vercel prototype (`~/Desktop/asmaan`, asmaan-one.vercel.app) still shows the old labels.
- `VIEW_SPIN` was patched straight into the built `assets/asmaan-can-engine.js`. Port it (with the
  earlier `autoSpin` patch) to `~/Desktop/asmaan/shopify/src/engine.js` before rebuilding the engine.
