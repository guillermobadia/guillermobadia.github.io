/*
 * Tienda — renderiza el catálogo desde products.json, integra el overlay de
 * Lemon Squeezy (Merchant of Record) y dispara eventos de analítica GA4.
 *
 * Uso en la página:
 *   <script src="https://assets.lemonsqueezy.com/lemon.js" defer></script>
 *   <script src="../../js/tienda.js"></script>
 *   <script>Tienda.init({ lang: 'es', productsUrl: '../../products.json' });</script>
 */
(function () {
    'use strict';

    var I18N = {
        es: {
            soon: 'Próximamente',
            buy: 'Comprar',
            all: 'Todo',
            from: 'IVA incluido',
            empty: 'No hay productos en esta categoría todavía.',
            loading: 'Cargando productos…',
            error: 'No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.',
            types: { template: 'Plantilla', skill: 'Skill', course: 'Curso', service: 'Servicio' }
        },
        en: {
            soon: 'Coming soon',
            buy: 'Buy',
            all: 'All',
            from: 'VAT included',
            empty: 'No products in this category yet.',
            loading: 'Loading products…',
            error: 'Could not load the catalog. Please try again later.',
            types: { template: 'Template', skill: 'Skill', course: 'Course', service: 'Service' }
        }
    };

    var TYPE_ICON_FALLBACK = {
        template: 'fa-file-lines',
        skill: 'fa-cubes',
        course: 'fa-graduation-cap',
        service: 'fa-comments'
    };

    function track(name, params) {
        if (typeof window.gtag === 'function') {
            window.gtag('event', name, params || {});
        }
    }

    function isPlaceholder(url) {
        return !url || url.indexOf('REPLACE-ME') !== -1;
    }

    function el(tag, className, html) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (html != null) node.innerHTML = html;
        return node;
    }

    function formatPrice(price, currency, lang) {
        try {
            return new Intl.NumberFormat(lang === 'en' ? 'en-IE' : 'es-ES', {
                style: 'currency',
                currency: currency || 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(price);
        } catch (e) {
            return price + ' ' + (currency || 'EUR');
        }
    }

    function buildCard(product, lang, t) {
        var loc = product[lang] || product.es || {};
        var card = el('div', 'shop-card type-' + product.type);
        card.setAttribute('data-type', product.type);

        var icon = product.icon || TYPE_ICON_FALLBACK[product.type] || 'fa-tag';
        var badge = (t.types[product.type] || product.type);

        var top = el('div', 'shop-card-top');
        top.appendChild(el('div', 'shop-card-icon', '<i class="fas ' + icon + '"></i>'));
        top.appendChild(el('span', 'shop-badge', badge));
        card.appendChild(top);

        card.appendChild(el('h2', null, loc.name || ''));
        card.appendChild(el('p', 'shop-card-desc', loc.desc || ''));

        var foot = el('div', 'shop-card-foot');
        foot.appendChild(el('div', 'shop-price',
            formatPrice(product.price, product.currency, lang) +
            ' <small>' + t.from + '</small>'));

        if (isPlaceholder(product.checkoutUrl)) {
            var soon = el('span', 'shop-buy is-soon', '<i class="fas fa-clock"></i> ' + t.soon);
            foot.appendChild(soon);
        } else {
            var sep = product.checkoutUrl.indexOf('?') === -1 ? '?' : '&';
            var href = product.checkoutUrl + sep + 'embed=1&media=0';
            var buy = el('a', 'shop-buy lemonsqueezy-button',
                '<i class="fas fa-cart-shopping"></i> ' + t.buy);
            buy.setAttribute('href', href);
            buy.setAttribute('rel', 'noopener');
            buy.addEventListener('click', function () {
                track('begin_checkout', {
                    currency: product.currency || 'EUR',
                    value: product.price,
                    items: [{
                        item_id: product.id,
                        item_name: loc.name,
                        item_category: product.type,
                        price: product.price
                    }]
                });
            });
            foot.appendChild(buy);
        }

        card.appendChild(foot);
        return card;
    }

    function buildFilters(types, lang, t, onSelect) {
        var bar = el('div', 'shop-filters');
        var all = ['all'].concat(types);
        all.forEach(function (type, i) {
            var label = type === 'all' ? t.all : (t.types[type] || type);
            var btn = el('button', 'shop-filter' + (i === 0 ? ' active' : ''), label);
            btn.setAttribute('type', 'button');
            btn.setAttribute('data-filter', type);
            btn.addEventListener('click', function () {
                bar.querySelectorAll('.shop-filter').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                onSelect(type);
            });
            bar.appendChild(btn);
        });
        return bar;
    }

    function injectStructuredData(products, lang, baseUrl) {
        try {
            var items = products.map(function (p, i) {
                var loc = p[lang] || p.es || {};
                return {
                    '@type': 'ListItem',
                    position: i + 1,
                    item: {
                        '@type': 'Product',
                        name: loc.name,
                        description: loc.desc,
                        category: p.type,
                        offers: {
                            '@type': 'Offer',
                            price: p.price,
                            priceCurrency: p.currency || 'EUR',
                            availability: isPlaceholder(p.checkoutUrl)
                                ? 'https://schema.org/PreOrder'
                                : 'https://schema.org/InStock',
                            url: baseUrl
                        }
                    }
                };
            });
            var json = {
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name: lang === 'en' ? 'Store' : 'Tienda',
                itemListElement: items
            };
            var s = document.createElement('script');
            s.type = 'application/ld+json';
            s.textContent = JSON.stringify(json);
            document.head.appendChild(s);
        } catch (e) { /* JSON-LD opcional, no bloquea la tienda */ }
    }

    var Tienda = {
        init: function (config) {
            config = config || {};
            var lang = config.lang === 'en' ? 'en' : 'es';
            var t = I18N[lang];
            var gridSel = config.gridSelector || '#shop-grid';
            var filtersSel = config.filtersSelector || '#shop-filters';
            var grid = document.querySelector(gridSel);
            if (!grid) return;

            grid.innerHTML = '<p class="shop-loading">' + t.loading + '</p>';

            fetch(config.productsUrl || '../../products.json', { cache: 'no-cache' })
                .then(function (res) {
                    if (!res.ok) throw new Error('HTTP ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    var products = (data && data.products) || [];
                    var types = [];
                    products.forEach(function (p) {
                        if (types.indexOf(p.type) === -1) types.push(p.type);
                    });

                    function render(filter) {
                        grid.innerHTML = '';
                        var visible = products.filter(function (p) {
                            return filter === 'all' || p.type === filter;
                        });
                        if (!visible.length) {
                            grid.appendChild(el('p', 'shop-empty', t.empty));
                            return;
                        }
                        visible.forEach(function (p) {
                            grid.appendChild(buildCard(p, lang, t));
                        });
                        // Re-vincula el overlay de Lemon Squeezy a los nuevos botones.
                        if (typeof window.createLemonSqueezy === 'function') {
                            window.createLemonSqueezy();
                        }
                    }

                    var filtersHost = document.querySelector(filtersSel);
                    if (filtersHost && types.length > 1) {
                        filtersHost.appendChild(buildFilters(types, lang, t, render));
                    }

                    render('all');
                    injectStructuredData(products, lang,
                        lang === 'en'
                            ? 'https://guillermobadia.com/en/store/'
                            : 'https://guillermobadia.com/es/tienda/');
                    track('view_item_list', { item_list_name: 'shop_' + lang });
                })
                .catch(function () {
                    grid.innerHTML = '<p class="shop-empty">' + t.error + '</p>';
                });
        }
    };

    window.Tienda = Tienda;
})();
