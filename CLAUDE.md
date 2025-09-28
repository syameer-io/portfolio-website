# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static portfolio website for a netcentric student at UiTM aspiring to become a full-stack developer. The website features a professional dark blue theme with smooth animations and full responsiveness.

## Architecture

The project follows a traditional client-side architecture with three main layers:

- **HTML Structure** (`index.html`): Single-page application with semantic sections (hero, about, skills, projects, education, contact)
- **CSS Styling** (`css/`): Modular CSS with custom properties, main styles, and responsive breakpoints
- **JavaScript Functionality** (`js/script.js`): Vanilla JavaScript with modular architecture using IIFE pattern

### Key Design Patterns

**CSS Architecture:**
- CSS custom properties (`:root`) define the dark blue theme palette and design tokens
- Component-based styling with BEM-like naming conventions
- Separate responsive stylesheet (`responsive.css`) with mobile-first approach
- Extensive use of CSS Grid and Flexbox for layouts

**JavaScript Architecture:**
- IIFE (Immediately Invoked Function Expression) encapsulation
- Module pattern with separate concerns: `navigation`, `animations`, `formHandler`, `interactiveFeatures`
- State management through centralized `state` object
- Event-driven architecture with proper cleanup and error handling

## Development Workflow

**Local Development:**
```bash
# Serve the website locally (use any static server)
python -m http.server 8000
# OR
npx serve .
# OR simply open index.html in a browser
```

**File Structure:**
```
/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Main stylesheet with theme
│   └── responsive.css     # Responsive design
├── js/
│   └── script.js          # All JavaScript functionality
└── assets/
    ├── images/            # Profile and project images
    └── icons/             # Favicons and icons
```

## Theme Customization

The dark blue theme is defined in CSS custom properties at the top of `style.css`:

- Primary colors: `--primary-color` (#0B1426), `--secondary-color` (#1E3A8A)
- Accent colors: `--accent-color` (#60A5FA) and variants
- Typography: Inter (main) and JetBrains Mono (code/technical)

## Key JavaScript Modules

**Core Modules:**
- `loadingScreen`: Manages initial loading animation
- `navigation`: Handles navbar, mobile menu, smooth scrolling, and active section tracking
- `animations`: Manages scroll-triggered animations, skill bar animations, and typing effects
- `formHandler`: Contact form validation and submission with real-time feedback
- `interactiveFeatures`: Project cards, back-to-top button, and other UI interactions

**Utility Functions:**
- `utils.smoothScrollTo()`: Custom smooth scrolling implementation
- `utils.debounce()` and `utils.throttle()`: Performance optimization helpers
- Form validation helpers with real-time error display

## Content Customization

**Personal Information:**
- Update name, title, and description in the hero section
- Modify about section text and highlights
- Add actual contact information in the contact section

**Skills Section:**
- Update skill percentages in `data-width` attributes
- Modify skill categories and items as needed

**Projects Section:**
- Replace placeholder content with actual projects
- Add project images to `assets/images/`
- Update GitHub/demo links

**Assets:**
- Add profile photo to `assets/images/`
- Add project screenshots
- Add favicon to `assets/icons/`

## Browser Compatibility

- Modern browsers with ES6+ support
- CSS Grid and Flexbox support required
- IntersectionObserver API used for scroll animations (with fallbacks)
- Responsive design tested on mobile, tablet, and desktop viewports