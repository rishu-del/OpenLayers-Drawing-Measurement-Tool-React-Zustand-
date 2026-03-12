# OpenLayers Drawing & Measurement Tool

A simple **React + TypeScript + OpenLayers** application that allows users to draw geometries on a map and measure them. State management is handled using **Zustand**.

## Features

* Draw geometries: **Polygon, LineString, MultiPoint**
* Measure **area, length, and number of points**
* Edit existing geometries
* Change geometry **color**
* **Show / hide** layers
* **Delete** geometries
* Real-time measurement updates while editing

## Tech Stack

* React
* TypeScript
* OpenLayers
* Zustand
* React Icons

## Installation

```bash
git clone 
cd openlayers-measure-tool
pnpm install
pnpm run dev
```

## How It Works

1. The map is initialized using **OpenLayers + OSM layer**.
2. Each geometry is stored as a **vector layer**.
3. **Draw interaction** allows creating shapes.
4. **Modify interaction** enables editing.
5. Measurements are calculated using:

   * `getArea()` for polygons
   * `getLength()` for lines
   * point count for multipoints.

## Measurements

* **Polygon:** Area (km²)
* **LineString:** Length (km)
* **MultiPoint:** Number of points


## file struture 
src/ │ 
├── services/
 │
 └── mapStore.ts # Zustand state management
  │
  ├── components/
  │
  └── map/ 
  │ 
  ├── mapProvider.tsx # Map initialization & interactions
  │ 
  ├── mapdataFields.tsx # UI for geometry controls 
  │
   └── mapProvider.css 
   │ 
   └── App.tsx
## License

MIT
