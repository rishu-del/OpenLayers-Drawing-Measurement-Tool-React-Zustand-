import { useEffect, useRef, useState } from "react";
import Map from "ol/Map";
import View from "ol/View";
import OSM from "ol/source/OSM";
import TileLayer from "ol/layer/Tile";
import { defaults as defaultInteractions } from "ol/interaction";
import MapdataFields from "../mapFields/MapdataFields.tsx";
import Loader from "../loading/Loader";
import "./MapProvider.css";

export default function MapProvider() {
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState<Map | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize OpenLayers map
  useEffect(() => {
    if (loading) return;
    if (!mapRef.current) return;

    let newMap: Map | null = null;

    try {
      newMap = new Map({
        target: mapRef.current,
        layers: [new TileLayer({ source: new OSM() })],
        view: new View({ center: [0, 0], zoom: 2 }),
        interactions: defaultInteractions({ doubleClickZoom: false }),
        controls: [],
      });
      setMap(newMap);
    } catch (err) {
      console.error("Failed to initialize map:", err);
    }

    return () => {
      try {
        newMap?.setTarget(undefined);
      } catch (err) {
        console.warn("Failed to clean up map:", err);
      }
      setMap(null);
    };
  }, [loading]);

  return (
    <>
      <div className="map-container">
        {loading && <Loader />}
        <div className="map" ref={mapRef} />
      </div>

      {/* Render MapdataFields only when map instance is ready */}
      {map && <MapdataFields map={map} />}
    </>
  );
}
