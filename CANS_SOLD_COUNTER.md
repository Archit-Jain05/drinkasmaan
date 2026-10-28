# Cans sold counter + Mixed Pack (2026-10-28)

## What is where

- **Counter** (product pages, big slot-machine figure under the range intro): **cans left** =
  `batch size (1000) - already sold (70) - shop metafield asmaan.cans_sold`, so it starts at 930.
  Both numbers are Product range section settings (*Cans left: batch size / already sold*).
  The metafield exists (definition "Cans sold", number, storefront readable) and is 0.
- **Mixed Pack**: product `mixed-pack`, one variant "6 Cans (2 of each)", SKU `ASM-MIX-6`, Rs. 599,
  published to Online Store. Inventory is **not tracked** (it never sells out and does not draw down
  the flavour stock). It shows as a third "Mixed 6 · 2 of each" option in each flavour's pack
  selector (section setting *Mixed pack > Mixed pack product*). Its own page stays behind the
  pre-launch lock.
- The old "First-batch cans left" counter (Apps Script sign-ups) is switched off in
  templates/product.json, not deleted.

## The Flow workflow that makes the number go down (one-time, in admin)

Shopify admin > Apps > **Flow** > Create workflow:

1. Trigger: **Order created**.
2. Action: **Send Admin API request**, mutation **metafieldsSet**, body:

```liquid
{%- assign cans = 0 -%}
{%- for lineItems_item in order.lineItems -%}
  {%- assign per = lineItems_item.variantTitle | split: " " | first | plus: 0 -%}
  {%- assign cans = lineItems_item.quantity | times: per | plus: cans -%}
{%- endfor -%}
{%- assign current = 0 -%}
{%- for metafields_item in shop.metafields -%}
  {%- if metafields_item.namespace == "asmaan" and metafields_item.key == "cans_sold" -%}
    {%- assign current = metafields_item.value | plus: 0 -%}
  {%- endif -%}
{%- endfor -%}
{
  "metafields": [
    {
      "ownerId": "gid://shopify/Shop/80824008936",
      "namespace": "asmaan",
      "key": "cans_sold",
      "type": "number_integer",
      "value": "{{ current | plus: cans }}"
    }
  ]
}
```

3. Name it "Cans sold", turn it on.

Cans per line = the first number in the variant title ("6 Cans" = 6, "12 Cans" = 12,
"6 Cans (2 of each)" = 6), times quantity. Merch variants (S/M/L) count 0.

Limits: cancelled/refunded orders are not subtracted, and two orders in the same second can read
the same old value (one of them is lost). Fine for a launch counter, not for accounting.

## Check / reset from the terminal

```sh
shopify store execute --store xhp0ym-sn.myshopify.com --query '{ shop { metafield(namespace: "asmaan", key: "cans_sold") { value } } }'
```

To reset (e.g. after a test order), run `metafieldsSet` with value "0" (see
.qa/mixed-pack-2026-10-28/setup.py, `counter`).
