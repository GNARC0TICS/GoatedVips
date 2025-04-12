# GoatedVIPs Interface Patterns & Design System

## Visual Identity

### Color System
- **Primary**: `#D7FF00` (Neon Yellow/Green) - Brand identity color used for CTAs and highlights
- **Background**: `#14151A` (Dark Grey/Black) - Main application background
- **Secondary Background**: `#1A1B21` (Slightly Lighter Grey) - Card backgrounds, containers
- **Border**: `#2A2B31` (Medium Grey) - Subtle borders and separators
- **Text Primary**: `#FFFFFF` (White) - Main text color
- **Text Secondary**: `#8A8B91` (Light Grey) - Secondary and descriptive text
- **Accent**: Various tier-specific colors for user status indicators

### Typography
- **Heading Font**: MonaSans family
  - `font-mona-sans-expanded` for large headings with expanded style
  - `font-mona-sans-condensed` for compact headings and labels
- **Body Font**: System UI stack with sans-serif fallbacks
- **Monospace**: Geist Mono for code or technical content

### Iconography
- **UI Icons**: Lucide React library for consistent interface elements
- **Custom Icons**: SVG-based tier emblems and achievement markers
- **Animated Icons**: Framer Motion animations for interactive elements

## Component Architecture

### Core Layout Components
- **Layout**: Main application wrapper with navigation and authentication state
- **PageTransition**: Wrapper for smooth page transitions with Framer Motion
- **QuickProfile**: Reusable profile preview component with avatar and stats

### UI Component Library
Based on shadcn/ui patterns with custom styling:

#### Form Elements
- **Button**: Multi-variant button component with hover effects
  ```tsx
  <Button
    variant="secondary"
    className="bg-[#1A1B21]/80 hover:bg-[#1A1B21]"
  >
    This month
  </Button>
  ```

- **Input**: Customized text input with consistent styling
  ```tsx
  <Input
    placeholder="Search"
    className="pl-8 pr-7 bg-[#14151A] border-[#2A2B31] focus:border-[#D7FF00]"
  />
  ```

- **Select**: Dropdown selection component
  ```tsx
  <Select
    value={selectedOption}
    onValueChange={setSelectedOption}
    defaultValue="daily"
  >
    <SelectTrigger className="bg-[#1A1B21] border-[#2A2B31]">
      <SelectValue placeholder="Select race type" />
    </SelectTrigger>
    <SelectContent className="bg-[#1A1B21] border-[#2A2B31]">
      <SelectItem value="daily">Daily</SelectItem>
      <SelectItem value="weekly">Weekly</SelectItem>
      <SelectItem value="monthly">Monthly</SelectItem>
    </SelectContent>
  </Select>
  ```

#### Display Components
- **Card**: Container for grouped content
  ```tsx
  <Card className="bg-[#1A1B21]/80 border-[#2A2B31] p-6">
    <CardHeader>
      <CardTitle>Profile Stats</CardTitle>
    </CardHeader>
    <CardContent>
      Content goes here
    </CardContent>
  </Card>
  ```

- **Table**: Data display with consistent styling
  ```tsx
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Username</TableHead>
        <TableHead className="text-right">Wagered</TableHead>
        <TableHead className="text-right">Prize</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.username}</TableCell>
          <TableCell className="text-right">${row.wagered}</TableCell>
          <TableCell className="text-right">${row.prize}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
  ```

- **Dialog**: Modal overlay for focused interactions
  ```tsx
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline">View Details</Button>
    </DialogTrigger>
    <DialogContent className="bg-[#1A1B21] border-[#2A2B31]">
      <DialogHeader>
        <DialogTitle>Race Details</DialogTitle>
        <DialogDescription>
          View detailed information about this race
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">Content goes here</div>
    </DialogContent>
  </Dialog>
  ```

#### Feedback Components
- **Toast**: Non-intrusive notification system
  ```tsx
  const { toast } = useToast();
  
  toast({
    title: "Action successful",
    description: "Your changes have been saved",
    variant: "default"
  });
  ```

- **LoadingSpinner**: Consistent loading indicator
  ```tsx
  <LoadingSpinner />
  ```

### Custom Components

#### Profile Components
- **ProfileEmblem**: Visual representation of user with initials and color
  ```tsx
  <ProfileEmblem 
    username={user.username}
    color={user.profileColor || "#D7FF00"}
    size="md"
  />
  ```

- **TierBadge**: Display user tier with appropriate icon and color
  ```tsx
  <TierBadge 
    tier={getTierFromWager(user.wagered?.all_time || 0)}
    showLabel={true}
  />
  ```

#### Race Components
- **RacePodium**: Visual display of top 3 race participants
  ```tsx
  <RacePodium
    leaders={top3Players}
    showPrizes={true}
    raceStatus="live"
  />
  ```

- **CountdownTimer**: Dynamic timer for race start/end events
  ```tsx
  <CountdownTimer
    endDate={raceEndDate.toISOString()}
    large={true}
    onComplete={() => setRaceStatus("completed")}
  />
  ```

## Animation System

### Animation Presets
```typescript
// Defined in animation-presets.ts
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export const popIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { type: "spring", stiffness: 300, damping: 20 }
};
```

### Usage Examples
```tsx
// Page transition
<PageTransition>
  <div className="container mx-auto">
    Page content here
  </div>
</PageTransition>

// Component animation
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center"
>
  <h1 className="text-6xl font-heading">$500</h1>
</motion.div>

// Animated button
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="button"
>
  Click Me
</motion.button>

// List item animations
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.05 * index }}
  >
    {item.name}
  </motion.div>
))}
```

## Responsive Design System

### Breakpoint Strategy
- **Mobile First**: Base styling for mobile devices
- **Responsive Classes**: TailwindCSS breakpoint classes for adaptivity
  - `sm`: ≥640px
  - `md`: ≥768px
  - `lg`: ≥1024px
  - `xl`: ≥1280px
  - `2xl`: ≥1536px

### Layout Patterns
- **Stacked to Horizontal**: Elements stack vertically on mobile, horizontal on larger screens
  ```tsx
  <div className="flex flex-col md:flex-row gap-4">
    <div className="w-full md:w-1/3">Sidebar</div>
    <div className="w-full md:w-2/3">Main content</div>
  </div>
  ```

- **Responsive Grid**: Dynamic grid layout adjusting to screen sizes
  ```tsx
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {items.map(item => (
      <Card key={item.id}>Item content</Card>
    ))}
  </div>
  ```

- **Responsive Typography**: Text size adjustments across screen sizes
  ```tsx
  <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading">
    Heading Text
  </h1>
  ```

### Mobile Adaptations
- **Mobile Navigation**: Collapsible menu for small screens
  ```tsx
  <Sheet open={openMobile} onOpenChange={setOpenMobile}>
    <SheetTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
      >
        <Menu className="h-6 w-6" />
      </Button>
    </SheetTrigger>
    <SheetContent side="left" className="w-[300px]">
      <div className="py-4">Mobile navigation content</div>
    </SheetContent>
  </Sheet>
  ```

- **Condensed Views**: Simplified display for small screens
  ```tsx
  <div className="hidden md:block">
    {/* Detailed desktop view */}
    <DetailedComponent data={data} />
  </div>
  <div className="block md:hidden">
    {/* Simplified mobile view */}
    <SimpleComponent data={data} />
  </div>
  ```

## Interaction Patterns

### Loading States
- **Skeleton Loading**: Used for content that's loading initially
  ```tsx
  {isLoading ? (
    <div className="space-y-2">
      <div className="h-6 bg-[#1A1B21] rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-[#1A1B21] rounded animate-pulse w-1/2"></div>
    </div>
  ) : (
    <div>Actual content</div>
  )}
  ```

- **Inline Loading**: Used for actions in progress
  ```tsx
  <Button disabled={isSubmitting}>
    {isSubmitting ? (
      <>
        <span className="animate-spin mr-2">⟳</span>
        Submitting...
      </>
    ) : (
      'Submit'
    )}
  </Button>
  ```

### Error States
- **Form Validation**: Inline error messages for form fields
  ```tsx
  <div className="space-y-1">
    <Label htmlFor="username">Username</Label>
    <Input
      id="username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className={errors.username ? "border-red-500" : ""}
    />
    {errors.username && (
      <p className="text-red-500 text-sm">{errors.username}</p>
    )}
  </div>
  ```

- **API Error Handling**: User-friendly error messages
  ```tsx
  {error && (
    <div className="bg-red-500/10 border border-red-500 rounded-md p-4 my-4">
      <h3 className="text-red-500 font-medium">Error</h3>
      <p className="text-red-400">{error.message}</p>
    </div>
  )}
  ```

### Micro-Interactions
- **Button Feedback**: Visual confirmation of button interactions
  ```tsx
  <Button
    onClick={handleAction}
    className="relative overflow-hidden group"
  >
    <span className="relative z-10">Click Me</span>
    <span className="absolute inset-0 bg-[#D7FF00]/10 transform scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-transform duration-300 rounded-lg"></span>
  </Button>
  ```

- **Hover Effects**: Consistent hover state styling
  ```tsx
  <div className="transition-colors duration-200 hover:bg-[#1A1B21] cursor-pointer p-4 rounded-md">
    Hover over me
  </div>
  ```

- **Focus Indicators**: Accessible focus styles
  ```tsx
  <input
    className="focus:ring-2 focus:ring-[#D7FF00] focus:outline-none"
  />
  ```

## Dark Mode Optimization

The application uses a dark-mode-first approach with careful consideration for:

- **Text Contrast**: Ensuring readable text against dark backgrounds
- **Element Boundaries**: Using subtle borders to define component boundaries
- **Emphasis Hierarchy**: Using color and brightness to create visual hierarchy
- **Eye Strain Reduction**: Avoiding pure white (#FFFFFF) for large text areas
- **Accent Color Usage**: Strategic placement of bright accent colors

## Accessibility Considerations

### Keyboard Navigation
- Proper tab order for interactive elements
- Focus indicators visible for keyboard users
- Keyboard shortcuts for common actions

### Screen Reader Support
- Semantic HTML structure
- ARIA attributes for complex components
- Alt text for images and visual elements

### Color Contrast
- Meeting WCAG AA standards for text contrast
- Not relying solely on color to convey information
- Additional indicators alongside color-based status

### Reduced Motion
- Respecting user preferences for reduced motion
  ```tsx
  const prefersReducedMotion = 
    typeof window !== "undefined" 
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches 
      : false;
  
  <motion.div
    animate={{ x: 100 }}
    transition={{ 
      duration: prefersReducedMotion ? 0 : 0.5
    }}
  >
    Content
  </motion.div>
  ```