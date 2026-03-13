import React, { useRef, useState, useEffect } from "react";
import { Map } from "ol";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { getArea, getLength } from "ol/sphere";
import { Polygon, LineString, MultiPoint } from "ol/geom";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import MapState, {
  type DrawType,
  type MeasureItem,
} from "../../services/MapStates";
import MapdataFieldsView from "./mapDataFieldsView";

interface LayerMap {
  [id: number]: VectorLayer<VectorSource>;
}

const MapdataFields: React.FC<{ map: Map }> = ({ map }) => {
  const {
    items,
    addItem,
    updateItem,
    removeItem,
    toggleDraw,
    toggleEdit,
    activeItemId,
  } = MapState();
  const layersRef = useRef<LayerMap>({});
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);

  const [drawtype, setDrawtype] = useState<DrawType>("Polygon");

  // --- Create OL style
  const createStyle = (color: string) =>
    new Style({
      fill: new Fill({ color: `${color}33` }),
      stroke: new Stroke({ color, width: 2 }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: `${color}55` }),
      }),
    });

  const handleAdd = () => {
    try {
      if (!map) throw new Error("Map not initialized");

      const defaultColor = "#00ffae";
      const source = new VectorSource();
      const layer = new VectorLayer({
        source,
        style: createStyle(defaultColor),
      });

      map.addLayer(layer);

      const newItem: MeasureItem = {
        id: items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1,
        type: drawtype,
        color: defaultColor,
        visible: true,
        isDrawing: true,
        isEditing: false,
      };

      addItem(newItem);
      layersRef.current[newItem.id] = layer;
      toggleDraw(newItem.id);

      // --- Start OL Draw interaction
      const draw = new Draw({ source, type: drawtype });
      draw.on("drawend", (e) => {
        const geom = e.feature.getGeometry();
        if (!geom) return;

        if (geom instanceof Polygon)
          updateItem(newItem.id, { area: getArea(geom), isDrawing: false });
        else if (geom instanceof LineString)
          updateItem(newItem.id, { length: getLength(geom), isDrawing: false });
        else if (geom instanceof MultiPoint)
          updateItem(newItem.id, {
            numPoints: source.getFeatures().length,
            isDrawing: false,
          });

        map.removeInteraction(draw);
        drawRef.current = null;
      });

      map.addInteraction(draw);
      drawRef.current = draw;
    } catch (err) {
      console.error("Failed to add measurement:", err);
    }
  };

  // --- Toggle visibility
  const toggleVisibility = (id: number) => {
    try {
      const layer = layersRef.current[id];
      if (!layer) throw new Error("Layer not found");

      const newVisible = !layer.getVisible();
      layer.setVisible(newVisible);
      updateItem(id, { visible: newVisible });
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    }
  };

  // --- Remove item
  const handleRemove = (id: number) => {
    try {
      const layer = layersRef.current[id];
      if (layer) {
        layer.getSource()?.clear();
        map.removeLayer(layer);
        delete layersRef.current[id];
      }
      removeItem(id);
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  // --- Change color
  const handleColorChange = (id: number, color: string) => {
    try {
      const layer = layersRef.current[id];
      if (!layer) throw new Error("Layer not found");

      layer.setStyle(createStyle(color));
      updateItem(id, { color });
    } catch (err) {
      console.error("Failed to change color:", err);
    }
  };

  useEffect(() => {
    if (!map || activeItemId === null) return;
    const activeItem = items.find((i) => i.id === activeItemId);
    if (!activeItem) return;

    const source = layersRef.current[activeItemId]?.getSource();
    if (!source) return;

    // Remove old interactions
    if (drawRef.current) map.removeInteraction(drawRef.current);
    if (modifyRef.current) map.removeInteraction(modifyRef.current);
    drawRef.current = null;
    modifyRef.current = null;

    // Drawing
    if (activeItem.isDrawing) {
      const draw = new Draw({ source, type: activeItem.type });
      draw.on("drawend", (e) => {
        const geom = e.feature.getGeometry();
        if (!geom) return;

        if (geom instanceof Polygon)
          updateItem(activeItem.id, { area: getArea(geom), isDrawing: false });
        else if (geom instanceof LineString)
          updateItem(activeItem.id, {
            length: getLength(geom),
            isDrawing: false,
          });
        else if (geom instanceof MultiPoint)
          updateItem(activeItem.id, {
            numPoints: source.getFeatures().length,
            isDrawing: false,
          });

        // map.removeInteraction(draw);
        drawRef.current = null;
      });
      map.addInteraction(draw);
      drawRef.current = draw;
    }

    // Editing
    if (activeItem.isEditing) {
      const modify = new Modify({ source });
      modify.on("modifyend", (e) => {
        e.features.forEach((f) => {
          const geom = f.getGeometry();
          if (!geom) return;
          if (geom instanceof Polygon)
            updateItem(activeItem.id, { area: getArea(geom) });
          else if (geom instanceof LineString)
            updateItem(activeItem.id, { length: getLength(geom) });
          else if (geom instanceof MultiPoint)
            updateItem(activeItem.id, {
              numPoints: geom.getCoordinates().length,
            });
        });
      });
      map.addInteraction(modify);
      modifyRef.current = modify;
    }

    // Cleanup
    return () => {
      if (drawRef.current) map.removeInteraction(drawRef.current);
      if (modifyRef.current) map.removeInteraction(modifyRef.current);
    };
  }, [activeItemId, items, map, updateItem]);

  return (
    <MapdataFieldsView
      items={items}
      drawtype={drawtype}
      setDrawtype={setDrawtype}
      handleAdd={handleAdd}
      toggleVisibility={toggleVisibility}
      removeItem={handleRemove}
      toggleDraw={toggleDraw}
      toggleEdit={toggleEdit}
      handleColorChange={handleColorChange}
    />
  );
};

export default MapdataFields;
