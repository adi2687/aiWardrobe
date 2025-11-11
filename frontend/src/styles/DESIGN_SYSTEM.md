# Outfit AI Design System

## 🎨 Visual Philosophy

**Theme**: Monochrome (black, white, gray tones) for minimalism and futuristic look.

**Typography**: Clean sans-serif fonts (Inter, Poppins) for tech vibe.

**Layout**: Flexbox/Grid-based layouts with balanced whitespace and rounded edges.

**Effects**: Soft glows, glassmorphism, subtle shadows, hover transitions.

**Motion**: Smooth transitions (300ms) and micro-animations.

---

## 📦 Usage Guide

### 1. Colors

```jsx
// Backgrounds
<div className="bg-black">...</div>
<div className="bg-white">...</div>
<div className="bg-gray-900">...</div>

// Text
<p className="text-white">...</p>
<p className="text-black">...</p>

// Borders
<div className="border border-white">...</div>
<div className="border border-gray-600">...</div>

// Hover States
<button className="hover:bg-white hover:text-black">...</button>
```

### 2. Layout

```jsx
// Flexbox
<div className="flex items-center justify-center">
  <div>Centered Content</div>
</div>

// Grid
<div className="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

// Spacing & Shadows
<div className="p-4 m-2 rounded-2xl shadow-lg">
  Content with padding, margin, rounded corners, and shadow
</div>
```

### 3. Cards & Containers

```jsx
// Basic Card
<div className="card">
  Card content with hover effect
</div>

// White Card
<div className="card card-white">
  White card with black border
</div>

// Black Card
<div className="card card-black">
  Black card with white border
</div>
```

### 4. Buttons

```jsx
// Glass Button (White outline, inverts on hover)
<button className="btn-glass">
  Glass Button
</button>

// Black Button
<button className="btn-black">
  Black Button
</button>

// White Button
<button className="btn-white">
  White Button
</button>
```

### 5. Navbar / Floating Menu

```jsx
// Floating Navigation Bar
<nav className="navbar-blur">
  <div className="navbar-icon">Icon 1</div>
  <div className="navbar-icon">Icon 2</div>
  <div className="navbar-icon">Icon 3</div>
</nav>
```

### 6. Typography

```jsx
// Headings
<h1 className="font-sans font-semibold tracking-wide text-2xl">
  Title
</h1>

// Body Text
<p className="font-sans text-xl">
  Body text
</p>

// Labels
<span className="font-sans text-sm">
  Label
</span>

// Glow Text Effect
<h1 className="glow-text">
  Glowing Text
</h1>
```

### 7. Animations

```jsx
// Fade In Animation
<div className="fade-in">
  Content fades in
</div>

// Pulse Animation
<div className="animate-pulse">
  Pulsing element
</div>

// Smooth Transitions
<div className="transition-all duration-300">
  Smooth transitions on all properties
</div>
```

### 8. Glassmorphism

```jsx
// Glass Panel (Light)
<div className="glass-panel">
  Glass effect with white tint
</div>

// Glass Panel (Dark)
<div className="glass-panel-dark">
  Glass effect with dark tint
</div>
```

### 9. Utility Classes

```jsx
// Full Width/Height
<div className="w-full h-full">...</div>

// Minimum Screen Height
<div className="min-h-screen">...</div>

// Positioning
<div className="fixed bottom-6 left-1/2">...</div>
<div className="absolute top-0 right-0">...</div>

// Z-Index
<div className="z-10">...</div>
<div className="z-1000">...</div>

// Cursor
<div className="cursor-pointer">...</div>

// Hide Scrollbar
<div className="scrollbar-hide">...</div>
```

---

## 🎯 Component Examples

### Card Component
```jsx
<div className="card card-white p-6 rounded-2xl shadow-lg transition-all duration-300">
  <h2 className="font-sans font-semibold text-2xl text-black mb-4">
    Card Title
  </h2>
  <p className="text-black mb-4">
    Card content goes here
  </p>
  <button className="btn-glass">
    Action Button
  </button>
</div>
```

### Floating Navigation
```jsx
<nav className="navbar-blur">
  <div className="navbar-icon">
    <HomeIcon />
  </div>
  <div className="navbar-icon">
    <ProfileIcon />
  </div>
  <div className="navbar-icon">
    <SettingsIcon />
  </div>
</nav>
```

### Button Group
```jsx
<div className="flex gap-4">
  <button className="btn-glass">Primary</button>
  <button className="btn-white">Secondary</button>
  <button className="btn-black">Tertiary</button>
</div>
```

---

## 🎨 Color Palette

- **Black**: `#000000` - Primary dark color
- **White**: `#ffffff` - Primary light color
- **Gray-900**: `#111827` - Dark gray
- **Gray-800**: `#1f2937` - Medium-dark gray
- **Gray-700**: `#374151` - Medium gray
- **Gray-600**: `#4b5563` - Light gray
- **Gray-100**: `#f3f4f6` - Very light gray

---

## 📱 Responsive Design

All classes work with standard responsive breakpoints. Use media queries in your CSS for custom responsive behavior.

---

## ⚡ Performance Tips

1. Use `transition-all duration-300` sparingly - prefer specific properties
2. Glassmorphism effects use `backdrop-filter` which can be performance-intensive
3. Use `will-change` property for animated elements
4. Prefer CSS transforms over position changes for animations

---

## 🔗 Integration with Framer Motion

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="card card-white"
>
  Content
</motion.div>
```

Combine Framer Motion animations with design system classes for best results.

