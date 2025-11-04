# Guillermo Badia - Professional Portfolio Website

A multilingual professional portfolio website showcasing expertise in project management, digital transformation, JD Edwards, and cybersecurity.

## Overview

This is a static website built with modern web technologies, optimized for performance and SEO. The site features automatic language detection and supports Spanish and English versions.

**Live Site**: [https://guillermobadia.com](https://guillermobadia.com)

## Features

- **Multilingual Support**: Automatic language detection (Spanish/English)
- **SEO Optimized**: Comprehensive meta tags, structured data (Schema.org), and semantic HTML
- **Performance Optimized**: Service Worker for offline support, resource preloading, and critical CSS inlining
- **Analytics Integration**: Google Analytics 4 with consent management
- **Responsive Design**: Mobile-first approach with optimized layouts
- **Accessibility**: ARIA labels and semantic markup
- **Progressive Web App**: Offline support via Service Worker

## Project Structure

```
.
├── index.html              # Language redirect page
├── es/                     # Spanish version
│   ├── index.html
│   ├── experiencia.html
│   ├── habilidades.html
│   ├── proyectos.html
│   ├── publicaciones.html
│   ├── contacto.html
│   └── herramientas/
├── en/                     # English version
│   ├── index.html
│   ├── experience.html
│   ├── skills.html
│   ├── projects.html
│   ├── publications.html
│   ├── contact.html
│   └── tools/
├── css/                    # Stylesheets
├── js/                     # JavaScript files
├── img/                    # Images and media
├── blog/                   # Blog content
├── medium/                 # Medium articles integration
├── sw.js                   # Service Worker
├── sitemap.xml             # XML sitemap
├── robots.txt              # Robots configuration
├── .htaccess               # Apache server configuration
└── offline.html            # Offline fallback page
```

## Key Technologies

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with responsive design
- **JavaScript**: Vanilla JS for interactivity and language detection
- **Service Worker**: PWA capabilities and offline support
- **Google Analytics 4**: Advanced tracking with consent management
- **Schema.org**: Structured data for enhanced SEO
- **Open Graph & Twitter Cards**: Social media optimization

## SEO Features

### Structured Data

The site implements multiple Schema.org types:
- **Person**: Professional profile information
- **ProfessionalService**: Service offerings
- **Award**: Recognition and achievements (INCIBE Finalist 2025)

### Metadata

- Comprehensive meta descriptions and keywords
- Open Graph tags for social media
- Twitter Card support
- Canonical URLs
- Hreflang tags for multilingual content
- Sitemap.xml for search engines

### Performance Optimizations

- Critical CSS inlining for faster First Contentful Paint (FCP)
- Resource preloading and preconnecting
- DNS prefetching for external resources
- Lazy loading for images
- Service Worker caching strategy
- Optimized font loading

## Analytics Configuration

Google Analytics 4 is configured with:
- Cookie consent management
- Custom dimensions and metrics
- Language detection tracking
- User interaction events
- Privacy-focused configuration

## Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/guillermobadia/web.git
cd web
```

2. Serve locally using a simple HTTP server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

3. Open [http://localhost:8000](http://localhost:8000) in your browser

### File Structure

- Main language redirect at root (`/index.html`)
- Spanish content in `/es/` directory
- English content in `/en/` directory
- Shared assets in `/css/`, `/js/`, and `/img/`

## Deployment

The site is configured for deployment on static hosting platforms:

- **GitHub Pages**: Via CNAME file
- **Apache Server**: Uses `.htaccess` for redirects and optimization
- **CDN Support**: Preconnect hints for CDN resources

### Build Process

No build process required - this is a static site. Simply upload the files to your hosting provider.

### Service Worker

The Service Worker (`sw.js`) provides:
- Offline functionality
- Asset caching
- Performance improvements

Update the Service Worker version when deploying changes to ensure cache invalidation.

## Configuration Files

### robots.txt
Controls search engine crawling behavior and includes sitemap reference.

### sitemap.xml
XML sitemap for search engines covering all pages in both languages.

### .htaccess
Apache server configuration for:
- URL redirects
- MIME types
- Cache control
- Security headers

### google-my-business.json
Google Business Profile configuration data.

### performance-monitoring.json
Performance metrics and monitoring configuration.

## Content Management

### Adding New Pages

1. Create HTML file in both `/es/` and `/en/` directories
2. Update `sitemap.xml` with new URLs
3. Add navigation links to existing pages
4. Update hreflang tags for language alternates

### Updating Content

- Maintain consistency between Spanish and English versions
- Update meta descriptions for SEO
- Keep structured data in sync
- Update sitemap modified dates

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers
- Graceful degradation for no-JavaScript scenarios

## Performance Metrics

Target metrics:
- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.9s
- **Cumulative Layout Shift (CLS)**: < 0.1

## Accessibility

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance
- Alt text for images

## Security

- HTTPS enforcement
- Content Security Policy headers
- Cookie consent management
- No sensitive data exposure
- Secure external resource loading

## Maintenance

### Regular Tasks

- Update sitemap when adding pages
- Monitor Analytics data
- Check broken links
- Update dependencies
- Review and update content
- Optimize images

### Image Optimization

Use the included script:
```bash
./optimize-images.sh
```

## Analytics & Monitoring

- Google Analytics 4 (GA4)
- Google Search Console verification
- Performance monitoring via Lighthouse
- Custom event tracking

## Social Media Integration

Profile links:
- LinkedIn: [linkedin.com/in/guillermobadia](https://linkedin.com/in/guillermobadia)
- Medium: [@guillermo.badia](https://medium.com/@guillermo.badia)
- Twitter: [@guillermobadia](https://twitter.com/guillermobadia)
- GitHub: [github.com/guillermobadia](https://github.com/guillermobadia)

## Contact

**Guillermo Badia Marti**
- Email: contacto@guillermobadia.com
- Website: [guillermobadia.com](https://guillermobadia.com)
- Location: Valencia, Spain

## License

All rights reserved. This is a personal portfolio website.

## Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Cloudflare CDN for asset delivery

---

**Last Updated**: November 2025
**Version**: 1.0
**Status**: Production
