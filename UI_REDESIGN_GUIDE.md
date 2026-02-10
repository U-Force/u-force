# UI Redesign Guide - Reactor Control Room View

## Overview

The U-FORCE simulator interface has been redesigned to feature a full-screen reactor control room viewport with collapsible sidebar controls, inspired by modern flight simulator interfaces.

## New Layout Structure

### 1. **Full-Screen Viewport** (Main Display)
- Large background showing a reactor control room scene
- Uses Unsplash placeholder image (industrial control room)
- Gradient overlay for depth and readability
- Immersive experience that simulates being in an actual control room

### 2. **Top Status Bar**
- Fixed at top of screen
- Shows U-FORCE logo, title, and current mode
- Real-time status indicator (READY, RUNNING, PAUSED, TRIP)
- Semi-transparent with blur effect

### 3. **Left Sidebar** (Collapsible)
- Width: 380px when expanded, 40px when collapsed
- Toggle button to show/hide
- Organized into collapsible sections:
  - **Simulation Controls**: Start/Stop, Speed, Rods, Pump, SCRAM, Boron
  - **Detailed Displays**: Power history graph, temperatures, reactivity breakdown
  - **Quick Guide**: Helpful tips

### 4. **Right Overlay Panels**
- Floating semi-transparent cards
- Shows critical metrics:
  - Reactor Power (large display)
  - Fuel Temperature
  - Coolant Temperature
  - Total Reactivity
- Always visible for quick reference

## Customizing the Background Image

### Option 1: Use a Local Image
1. Place your reactor control room image in `public/images/`
2. Update line ~97 in `app/page.tsx`:
```tsx
<img
  src="/images/your-control-room.jpg"
  alt="Reactor Control Room"
  style={viewportImage}
/>
```

### Option 2: Use a Different Stock Photo
Replace the Unsplash URL with any of these themes:
- Industrial control room: Current URL
- Nuclear facility: `https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1920`
- Command center: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920`
- Dark industrial: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920`

### Option 3: Animated Background (Advanced)
For a more dynamic experience, you could add:
- Video background of control room footage
- Animated SVG elements (blinking lights, gauges)
- CSS animations for ambient movement

## Key Design Features

### Semi-Transparent Panels
All UI elements use `rgba()` colors with `backdropFilter: 'blur(10px)'` for a modern glass-morphism effect.

### Collapsible Sections
Users can expand/collapse sections to customize their workspace:
- Collapse sidebar for maximum viewport
- Expand specific control sections as needed
- Responsive to different workflows

### Status Indicators
- Color-coded status badges (green=running, orange=paused, red=trip)
- Animated blinking on trip conditions
- Visual feedback on all interactive elements

## Future Enhancement Ideas

1. **Multiple Camera Views**
   - Add buttons to switch between different control room angles
   - Reactor core view
   - Instrument panel close-ups

2. **3D Reactor Visualization**
   - Replace static image with Three.js 3D model
   - Show control rods moving in real-time
   - Visualize coolant flow and heat

3. **Picture-in-Picture**
   - Small video feeds of reactor components
   - Real-time schematics overlay

4. **Dark/Light Themes**
   - Toggle between different control room lighting
   - Simulate day/night operations

5. **Custom Layouts**
   - Let users drag and position overlay panels
   - Save layout preferences
   - Multiple workspace configurations

## Accessibility Notes

- All critical information remains accessible with sidebar collapsed
- High contrast text on semi-transparent backgrounds
- Keyboard navigation support maintained
- Screen reader compatible (describe viewport changes)

## Performance Considerations

- Background image is optimized and cached
- Semi-transparent overlays use GPU acceleration
- Sidebar collapse/expand is CSS-based (hardware accelerated)
- No impact on simulation performance

## Responsive Design

The current design is optimized for desktop (1920x1080+). For smaller screens:
- Consider making sidebar overlay instead of fixed
- Stack right panels vertically
- Reduce viewport image resolution
- Add mobile-specific breakpoints

## Getting High-Quality Control Room Images

### Recommended Sources:
1. **Stock Photos**
   - Unsplash (free, high quality)
   - Pexels (free)
   - Shutterstock (paid, premium quality)

2. **Search Terms**
   - "nuclear control room"
   - "reactor control center"
   - "industrial control panel"
   - "power plant control room"
   - "command center dashboard"

3. **Custom Photography**
   - Visit actual control room simulators (if accessible)
   - Create 3D renders using Blender
   - Commission custom artwork

4. **Video Backgrounds**
   - YouTube Creative Commons footage
   - Stock video sites (Videvo, Pexels Videos)
   - Loop short clips for ambient movement

## Color Scheme

The design uses a consistent color palette:
- Primary: `#10b981` (emerald green) - Running status, active indicators
- Warning: `#f59e0b` (amber) - Paused state
- Danger: `#ef4444` (red) - Trip conditions, alerts
- Background: `rgba(10, 15, 20, 0.9)` - Dark blue-black
- Accent: `#6ee7b7` (light teal) - Text, borders

This maintains consistency with the nuclear industry's standard color coding.
