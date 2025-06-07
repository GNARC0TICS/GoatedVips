# Component Organization Guide

This document outlines the component organization strategy for the GoatedVIPs frontend.

## 📁 **Directory Structure**

```
components/
├── ui/               # Reusable UI primitives (shadcn/ui components)
├── features/         # Feature-specific components
├── profile/          # Profile-related components
├── mvp/              # MVP cards and related components  
├── skeletons/        # Loading skeleton components
├── icons/            # Custom icon components
├── username/         # Username display components
├── chat/             # Chat interface components
├── memory-bank/      # Documentation and guides
└── layout/           # Layout and navigation components (NEW)
```

## 🎯 **Component Categories**

### **Layout Components** (`layout/`)
- Header.tsx
- Footer.tsx
- Layout.tsx
- NavigationLinks.tsx
- MobileNavigation.tsx
- AdminMenu.tsx

### **Feature Components** (`features/`)
- FeatureCarousel.tsx
- FeatureSection.tsx
- BonusCodeHeroCard.tsx
- CryptoSwapHomeWidget.tsx
- CryptoSwapWidget.tsx
- CryptoSwapTooltip.tsx

### **User Interface** (`ui/`)
- All shadcn/ui components
- LoadingSpinner.tsx
- ErrorFallback.tsx
- PreLoader.tsx

### **Data Display** (`data/`)
- LeaderboardTable.tsx
- AffiliateStats.tsx
- RaceTimer.tsx
- CountdownTimer.tsx

### **Interactive** (`interactive/`)
- UserSearch.tsx
- UsernameSearch.tsx
- MobileSearchDropdown.tsx
- WheelSpinIndicator.tsx

### **Effects & Animation** (`effects/`)
- ParticleBackground.tsx
- PageTransition.tsx
- ScrollToTop.tsx

## 🏗️ **Refactoring Strategy**

### Phase 1: Create Organized Directories ✅ 
- [x] Create layout/ directory
- [x] Create data/ directory  
- [x] Create interactive/ directory
- [x] Create effects/ directory

### Phase 2: Move Components
- [ ] Move layout components to layout/
- [ ] Move data components to data/
- [ ] Move interactive components to interactive/
- [ ] Move effects components to effects/

### Phase 3: Update Imports
- [ ] Update all import paths across the codebase
- [ ] Update index.ts files for clean exports

## 📋 **Import Guidelines**

```typescript
// ✅ Good - Use barrel exports
import { Header, Footer } from '@/components/layout';
import { LeaderboardTable } from '@/components/data';
import { UserSearch } from '@/components/interactive';

// ❌ Avoid - Direct file imports when barrel exports exist
import { Header } from '@/components/layout/Header';
```

## 🧹 **Cleanup Rules**

1. **No loose files** in the root components/ directory
2. **Consistent naming** - PascalCase for components, kebab-case for files  
3. **Clear separation** - Each directory has a single responsibility
4. **Barrel exports** - Each directory exports through index.ts
5. **Documentation** - Each directory has a README explaining its purpose 