import { useEffect, useRef } from "react";
import Map from "ol/Map";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import Draw ,{DrawEvent} from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import { Polygon, LineString, MultiPoint } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { getArea, getLength } from "ol/sphere";
import "./mapProvider.css";
import MapdataFields from "./mapdataFields";
import MapState from "../../services/mapStore";
import {defaults as defaultInteractions} from "ol/interaction";

export default function MapProvider() {

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<Map | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);

  const { items, updateItem, activeItemId } = MapState();

  // Initialize map
  useEffect(() => {

    if (!mapRef.current) return;

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 0]),
        zoom: 2,
      }),
      interactions: defaultInteractions({
      doubleClickZoom: false,
       }),
       controls: []
    });

    mapInstance.current = map;  
    MapState.getState().setMap(map);

    return () => map.setTarget(undefined);

  }, []);

  // Handle Draw / Modify interactions
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || activeItemId === null) return;
    const activeItem = items.find((i) => i.id === activeItemId);
    if (!activeItem) return;
    const source = activeItem.layer.getSource();
    if (!source) return;


    // remove old interactions 
    if (drawRef.current) map.removeInteraction(drawRef.current);
    if (modifyRef.current) map.removeInteraction(modifyRef.current);
   
    // DRAW MODE
  
    if (activeItem.isDrawing) {
      const draw = new Draw({
        source,
        type: activeItem.type,
      });

      map.addInteraction(draw);
      drawRef.current = draw;

      const onDrawEnd = (e: DrawEvent) => {

        const geom = e.feature.getGeometry();

        if (!geom) return;

        if (geom instanceof Polygon) {
          updateItem(activeItemId, {
            area: getArea(geom),
            length: undefined,
          });
        }

        else if (geom instanceof LineString) {
          updateItem(activeItemId, {
            length: getLength(geom),
            area: undefined,
          });
        }

        else if (geom instanceof MultiPoint) {

          const numPoints = source.getFeatures().length+1;

          updateItem(activeItemId, { numPoints });

        }

        map.removeInteraction(draw);
        drawRef.current = null;

      };

      draw.on("drawend", onDrawEnd);

      return () => draw.un("drawend", onDrawEnd);
    }

   
    // EDIT 
   
    if (activeItem.isEditing) {
      const modify = new Modify({
        source,
      });
      map.addInteraction(modify);
      modifyRef.current = modify;
      modify.on("modifyend", (e) => {
        const feature = e.features.item(0);
        const geom = feature.getGeometry();
        if (!geom) return;
        if (geom instanceof Polygon) {
          updateItem(activeItemId, { area: getArea(geom),});
          console.log(getArea(geom));
        }

        else if (geom instanceof LineString) {
          updateItem(activeItemId, {length: getLength(geom),});
          console.log(getLength(geom));
        }
        else if (geom instanceof MultiPoint) {

          const numPoints = geom.getCoordinates().length;
          updateItem(activeItemId, { numPoints});
          console.log(numPoints);
        }
      });
    }

  }, [items, activeItemId, updateItem]);

  return (
    <>
      <div className="map-container">
        <div className="map" ref={mapRef} />
      </div>

      <MapdataFields />
    </>
  );
}