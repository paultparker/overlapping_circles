# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple HTML5 Canvas-based interactive visualization that allows users to create overlapping colored circles with additive blending effects. The application consists of an HTML file for structure/styling and a separate JavaScript file for functionality.

## Architecture

- **Two-file application**: HTML structure in `overlapping_circles.html`, JavaScript logic in `overlapping_circles.js`
- **Canvas-based rendering**: Uses HTML5 Canvas with 2D context for drawing
- **Event-driven interaction**: Click events place circles, UI controls modify behavior
- **State management**: Simple JavaScript variables track circles array, current color/size, and background mode
- **Additive blending**: Uses `globalCompositeOperation = 'screen'` for color mixing effects

## Key Components

- **Circle rendering system**: Manages drawing circles with transparency and additive blending
- **Color cycling**: Automatically cycles through predefined colors (Forest Green, Royal Blue, Deep Blue-Purple)
- **Interactive controls**: Size selection, undo functionality, clear canvas, background toggle
- **Responsive canvas**: Automatically resizes to window dimensions

## Development

**Running the application:**
```bash
# Simply open the HTML file in a web browser
open overlapping_circles.html
```

**No build process required** - this is a static HTML file with no dependencies or compilation steps.

## Code Structure

The JavaScript is organized into several key components:
- `Circle` class: Encapsulates circle properties and rendering with `draw()`, `isValid()`, and `containsPoint()` methods
- `redrawAll()`: Clears and redraws entire canvas with all stored circles
- `updateSize()`, `clearCanvas()`, `undoLastCircle()`, `toggleBackground()`: UI control handlers
- Event listeners for canvas clicks and window resize

The application stores circle data as Circle class instances in a global `circles` array.