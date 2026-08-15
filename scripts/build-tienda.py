#!/usr/bin/env python3
"""Pre-renderiza el catálogo de products.json dentro de las páginas de tienda.

El grid se pintaba solo en cliente (js/tienda.js), así que el HTML servido no
contenía ni un producto ni un precio: cualquier revisor, crawler o navegador sin
JS veía una página vacía. Este script vuelca las tarjetas y el JSON-LD en el
HTML entre marcadores, y el JS sigue hidratando y filtrando encima.

Uso:  python3 scripts/build-tienda.py     (desde la raíz del repo)
Ejecutar de nuevo cada vez que cambie products.json.
"""

import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

PAGES = [
    ("es", ROOT / "es/tienda/index.html", "https://guillermobadia.com/es/tienda/"),
    ("en", ROOT / "en/store/index.html", "https://guillermobadia.com/en/store/"),
]

I18N = {
    "es": {
        "soon": "Próximamente", "buy": "Comprar", "all": "Todo", "vat": "IVA incluido",
        "types": {"template": "Plantilla", "skill": "Skill", "course": "Curso", "service": "Servicio"},
    },
    "en": {
        "soon": "Coming soon", "buy": "Buy", "all": "All", "vat": "VAT included",
        "types": {"template": "Template", "skill": "Skill", "course": "Course", "service": "Service"},
    },
}

TYPE_ICON_FALLBACK = {
    "template": "fa-file-lines", "skill": "fa-cubes",
    "course": "fa-graduation-cap", "service": "fa-comments",
}

GRID_START = "<!-- BUILD:shop-grid:start -->"
GRID_END = "<!-- BUILD:shop-grid:end -->"
FILTERS_START = "<!-- BUILD:shop-filters:start -->"
FILTERS_END = "<!-- BUILD:shop-filters:end -->"
LD_START = "<!-- BUILD:shop-jsonld:start -->"
LD_END = "<!-- BUILD:shop-jsonld:end -->"


def is_placeholder(url):
    return not url or "REPLACE-ME" in url


def format_price(price, currency, lang):
    symbol = {"EUR": "€", "USD": "$"}.get(currency or "EUR", currency)
    amount = ("%g" % price).replace(".", ",") if lang == "es" else ("%g" % price)
    return f"{amount} {symbol}" if lang == "es" else f"{symbol}{amount}"


def card_html(p, lang, t):
    loc = p.get(lang) or p.get("es") or {}
    icon = p.get("icon") or TYPE_ICON_FALLBACK.get(p["type"], "fa-tag")
    badge = t["types"].get(p["type"], p["type"])
    name = html.escape(loc.get("name", ""))
    desc = html.escape(loc.get("desc", ""))
    price = format_price(p["price"], p.get("currency", "EUR"), lang)

    if is_placeholder(p.get("checkoutUrl")):
        action = f'<span class="shop-buy is-soon"><i class="fas fa-clock"></i> {t["soon"]}</span>'
    else:
        url = p["checkoutUrl"]
        sep = "?" if "?" not in url else "&"
        href = html.escape(f"{url}{sep}embed=1&media=0")
        action = (
            f'<a class="shop-buy lemonsqueezy-button" href="{href}" rel="noopener">'
            f'<i class="fas fa-cart-shopping"></i> {t["buy"]}</a>'
        )

    return f"""            <div class="shop-card type-{p['type']}" data-type="{p['type']}">
                <div class="shop-card-top">
                    <div class="shop-card-icon"><i class="fas {icon}"></i></div>
                    <span class="shop-badge">{badge}</span>
                </div>
                <h2>{name}</h2>
                <p class="shop-card-desc">{desc}</p>
                <div class="shop-card-foot">
                    <div class="shop-price">{price} <small>{t['vat']}</small></div>
                    {action}
                </div>
            </div>"""


def filters_html(types, t):
    buttons = [('all', t["all"])] + [(ty, t["types"].get(ty, ty)) for ty in types]
    out = ['        <div class="shop-filters">']
    for i, (value, label) in enumerate(buttons):
        active = " active" if i == 0 else ""
        out.append(
            f'            <button class="shop-filter{active}" type="button" '
            f'data-filter="{value}">{label}</button>'
        )
    out.append("        </div>")
    return "\n".join(out)


def jsonld_html(products, lang, base_url):
    items = []
    for i, p in enumerate(products):
        loc = p.get(lang) or p.get("es") or {}
        items.append({
            "@type": "ListItem",
            "position": i + 1,
            "item": {
                "@type": "Product",
                "name": loc.get("name"),
                "description": loc.get("desc"),
                "category": p["type"],
                "offers": {
                    "@type": "Offer",
                    "price": p["price"],
                    "priceCurrency": p.get("currency", "EUR"),
                    "availability": "https://schema.org/PreOrder" if is_placeholder(p.get("checkoutUrl")) else "https://schema.org/InStock",
                    "url": base_url,
                },
            },
        })
    data = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Store" if lang == "en" else "Tienda",
        "itemListElement": items,
    }
    body = json.dumps(data, ensure_ascii=False, indent=4)
    return '    <script type="application/ld+json">\n' + body + "\n    </script>"


def replace_block(text, start, end, payload, anchor_pattern, anchor_template):
    """Sustituye el bloque entre marcadores; si no existen, los crea sobre el ancla."""
    if start in text and end in text:
        return re.sub(
            re.escape(start) + r".*?" + re.escape(end),
            lambda _: f"{start}\n{payload}\n{' ' * 8}{end}",
            text,
            flags=re.S,
        )
    return re.sub(anchor_pattern, anchor_template.format(payload=payload), text, count=1)


def main():
    products = json.loads((ROOT / "products.json").read_text(encoding="utf-8"))["products"]
    types, seen = [], set()
    for p in products:
        if p["type"] not in seen:
            seen.add(p["type"])
            types.append(p["type"])

    for lang, path, base_url in PAGES:
        t = I18N[lang]
        text = path.read_text(encoding="utf-8")

        grid = "\n".join(card_html(p, lang, t) for p in products)
        text = replace_block(
            text, GRID_START, GRID_END, grid,
            r'<div id="shop-grid" class="shop-grid">.*?</div>\n',
            '<div id="shop-grid" class="shop-grid">\n        '
            + GRID_START + "\n{payload}\n        " + GRID_END + "\n        </div>\n",
        )
        text = replace_block(
            text, FILTERS_START, FILTERS_END, filters_html(types, t),
            r'<div id="shop-filters"></div>',
            '<div id="shop-filters">\n        ' + FILTERS_START
            + "\n{payload}\n        " + FILTERS_END + "\n        </div>",
        )
        text = replace_block(
            text, LD_START, LD_END, jsonld_html(products, lang, base_url),
            r"</head>",
            "    " + LD_START + "\n{payload}\n    " + LD_END + "\n</head>",
        )

        path.write_text(text, encoding="utf-8")
        print(f"{path.relative_to(ROOT)}: {len(products)} productos pre-renderizados")


if __name__ == "__main__":
    main()
