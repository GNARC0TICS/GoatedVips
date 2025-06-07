# GoatedVips Home Page Module System

## Purpose

This document describes the modular, mobile-first responsive system for the Home page. It is designed for easy onboarding, rapid design iteration, and clean code ownership. All major sections are extracted into reusable, well-documented components with optimized mobile experiences.

---

## Extracted Components

- **HeroVideo** (`components/home/HeroVideo.tsx`): Mobile-optimized hero video with responsive sizing, fallback support, and aspect ratio preservation. Add overlays, gradients, or hero text as needed.
- **PromoBanner** (`components/home/PromoBanner.tsx`): Mobile-first promo banner with enhanced touch targets, mobile-visible descriptions, and desktop hover tooltips.
- **FeatureCard** (`components/home/FeatureCard.tsx`): Responsive feature card with mobile-optimized layout, proper touch targets, and accessibility improvements. Includes locked state visuals for auth-required features.
- **FeatureCardGrid** (`components/home/FeatureCardGrid.tsx`): Mobile-first responsive grid with section header and staggered animations. Uses breakpoint-aware column layout.
- **CallToAction** (`components/home/CallToAction.tsx`): Enhanced CTA section with mobile-optimized button sizing, trust indicators, and responsive layout.
- **AnimatedSection** (`components/shared/AnimatedSection.tsx`): Wraps children in motion.div with mobile-friendly animations. Uses presets from `animationPresets.ts`.

---

## Mobile-First Design System

### Responsive Breakpoints
- **Base (mobile)**: < 640px - Single column, touch-optimized
- **sm**: ≥ 640px - Two columns where appropriate
- **lg**: ≥ 1024px - Three columns for feature grid
- **xl**: ≥ 1280px - Maximum layout width

### Touch Targets
- All interactive elements have minimum 44px touch targets
- Enhanced button sizing for mobile accessibility
- Proper spacing for thumb navigation

### Typography Hierarchy
- Mobile-first font sizing with responsive scaling
- Improved line heights for mobile readability
- Consistent heading structure for accessibility

---

## Animation System

- All section transitions use presets from `lib/animationPresets.ts`.
- Mobile-optimized animation delays and durations.
- Staggered card animations for better perceived performance.
- Add or adjust animation variants as needed for new sections.

---

## Feature Card Config

- All feature cards are defined in `data/homeFeatures.ts`.
- Each card must match the `FeatureCardProps` interface.
- Icons must match keys in `lib/iconMap.ts`.
- To add a new card, add an object to the array in `homeFeatures.ts`.
- Cards automatically adapt to mobile layout with enhanced spacing.

---

## Auth-Based Visibility

- Cards with `requiresAuth: true` show proper locked states with visual indicators.
- Mobile-friendly lock icons and accessibility improvements.
- Use the `isAuthenticated` prop in `FeatureCard` for conditional rendering.

---

## Mobile Optimizations

### Header System
- Fixed header with mobile-first responsive design
- Proper z-index management and backdrop blur
- Touch-optimized navigation menu
- Content offset handling for fixed header

### Touch & Accessibility
- `-webkit-tap-highlight-color: transparent` for clean touch interactions
- `touch-action: manipulation` for improved touch response
- Proper ARIA labels and semantic structure
- Minimum 44px touch targets throughout

### Performance
- Optimized image loading with proper aspect ratios
- Reduced animation complexity on mobile
- Efficient CSS with mobile-first approach

---

## Design Tokens & Theming

- Mobile-first color system with proper contrast ratios
- Responsive spacing scale (4/6/8 → 6/8/12 → 8/12/16)
- Typography system optimized for mobile readability
- Touch-friendly component sizing

---

## Accessibility & Performance

- Semantic HTML structure throughout
- Proper heading hierarchy (h1 → h2 → h3)
- ARIA attributes for screen readers
- Keyboard navigation support
- Mobile-optimized image loading
- Efficient CSS with reduced reflow/repaint

---

## Responsive Layout System

### Container Breakpoints
```css
.layout-container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
.section-spacing: py-8 sm:py-12 md:py-16 lg:py-24
.content-spacing: space-y-4 sm:space-y-6 md:space-y-8
```

### Grid System
- Mobile: 1 column
- Small: 2 columns for cards
- Large: 3 columns for feature grid
- Responsive gap sizing: gap-4 sm:gap-5 lg:gap-6

---

## Onboarding Notes for Future Agents

- **Mobile-First Approach**: Always design for mobile first, then enhance for larger screens
- **Touch Targets**: Ensure all interactive elements meet 44px minimum size
- **Performance**: Consider mobile data usage and loading times
- **Accessibility**: Test with screen readers and keyboard navigation

### Quick Tasks
- To add a new feature card: Update `homeFeatures.ts` and ensure icon exists in `iconMap.ts`
- For new animations: Add presets to `animationPresets.ts` and use in `AnimatedSection`
- For design polish: Check component comments for specific enhancement areas
- For responsive issues: Use mobile-first breakpoints and test on actual devices

### Testing Checklist
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Verify touch targets are appropriate size
- [ ] Check text readability at different sizes
- [ ] Ensure proper keyboard navigation
- [ ] Test with screen readers
- [ ] Validate performance on slower connections 