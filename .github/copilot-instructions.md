# Instrucciones rápidas para agentes AI (Copilot)

Propósito: ayudar a un agente a ser productivo rápidamente en este repositorio (sitio web estático multi-idioma para GitHub Pages).

- Tipo de proyecto: sitio estático HTML/CSS/JS. No hay compilación por defecto (el `package.json` actual está vacío). Deploy típico: push a `main` / GitHub Pages.
- Estructura relevante:
  - `/index.html` — página raíz que detecta idioma y redirige a `/es/index.html` o `/en/index.html`.
  - `/es/` y `/en/` — contenido por idioma (páginas HTML estáticas).
  - `/css/`, `/js/`, `/img/` — activos estáticos. `js/mobile-menu.js` gestiona el menú móvil (patrón DOMContentLoaded, querySelector, toggles).
  - `sw.js` — Service Worker: estrategia Network First con fallback a caché; lista `STATIC_RESOURCES` debe actualizarse manualmente al añadir páginas estáticas.
  - `offline.html` — página offline usada por `sw.js`.
  - `optimize-images.sh` — script local para optimizar imágenes (útil antes de subir cambios pesados en `img/`).

Pautas concretas (cosas que el agente puede hacer automáticamente):
1. Añadir nueva página estática (ej. `/es/nueva.html`):
   - Crear el HTML en la carpeta correspondiente (`/es/` o `/en/`).
   - Añadir la ruta a `sw.js` -> `STATIC_RESOURCES` para que el SW la cachee.
   - Si es página de index por idioma, actualizar también los enlaces hreflang en `/index.html`.

2. Cambios en JS/CSS/recursos críticos:
   - `index.html` pre-carga (`preload`) recursos críticos — mantener coherencia entre `preload` y lo que incluye `sw.js`.
   - `js/mobile-menu.js` y los scripts inline siguen el patrón: escucha `DOMContentLoaded`, consulta elementos con `querySelector` y añade listeners. Mantener este patrón para consistencia.

3. Service Worker (`sw.js`) notas muy importantes:
   - Cache name: `guillermobadia-cache-v1`. Cuando se cambia `STATIC_RESOURCES` actualice también la versión del cache (p.ej. `v2`) para forzar limpieza.
   - Para forzar activación del SW desde UI usan el mensaje `{ type: 'SKIP_WAITING' }` y `controllerchange` recarga la página — respetar ese flujo cuando se despliegue una actualización.
   - `sw.js` contiene funciones de sincronización offline para analytics (IndexedDB `analyticsDB` y store `analyticsQueue`). Evitar romper esas funciones al modificar fetch/POST.

4. SEO / Performance patterns a preservar:
   - Muchas páginas incluyen meta tags OG y JSON-LD; mantener la estructura y `og:image` tamaños (1200x630) cuando se cambien imágenes.
   - Uso de `preload` y `preconnect` en `index.html` y páginas de idioma: no eliminar sin medir impacto en LCP.

5. Flujo de desarrollo local (recomendado para preview):
   - Es un sitio estático; sirve los archivos con un servidor estático. Ejemplos: `python3 -m http.server 8000` o `npx serve -s .` (ejecutar desde la raíz del repo). Ver páginas en `http://localhost:8000/`.

6. Convenciones del proyecto:
   - Rutas relativas y estructura por idioma (`/es/` y `/en/`) son la convención. No usar rutas absolutas con `localhost` en los enlaces internos.
   - Archivos de utilidades/`tools` (en `en/tools` y `es/herramientas`) son HTML autónomos — trátalos como pequeños micro-aplicativos (no esperan bundler).
   - Evitar introducir dependencias nodejs nuevas sin proponer un `package.json` con scripts claros (actualmente está vacío `{}`).

7. Seguridad / secretos:
   - Hay placeholders para verificación (p.ej. `YOUR_GOOGLE_VERIFICATION_CODE`) y el ID GA en `index.html`. No exponer credenciales; si se requiere configuración, usar secrets de GitHub Actions (no hardcodear en el repo).

Ejemplos rápidos (líneas para editar):
- Añadir página al caché: editar `sw.js` -> actualizar array `STATIC_RESOURCES` (ver top del archivo).
- Forzar nueva versión de cache: cambiar `CACHE_NAME = 'guillermobadia-cache-v1'` → `'...-v2'`.
- Hreflang: abrir `/index.html` y editar las etiquetas `<link rel="alternate" hreflang=...>`.

Qué NO inventar: no asumir que hay build tools (webpack/parcel/etc.) — el repo es HTML estático salvo que se añada configuración explícita.

Si necesitas más contexto, dime qué parte quieres que amplíe (por ejemplo: política de cache más detallada, scripts de analytics offline, o un procedimiento de despliegue con GitHub Actions). Gracias — ¿quieres que añada ejemplos de GitHub Action para deploy?