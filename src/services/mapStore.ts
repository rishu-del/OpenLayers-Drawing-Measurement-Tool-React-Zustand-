import { create } from "zustand";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style";

export type DrawType = "Polygon" | "LineString" | "MultiPoint";

export type MeasureItem = {
  id: number;
  type: DrawType;
  color:string;
  area?: number;
  length?: number;
  coordinates?: number[];
  numPoints?: number;
  visible: boolean;
  isDrawing: boolean;
  isEditing: boolean;
  layer: VectorLayer<VectorSource>;
};

interface MapState {
  map: Map | null;
  items: MeasureItem[];
  activeItemId: number | null;
  setMap: (map: Map) => void;
  setItems: (items: MeasureItem[]) => void;
  setActiveItemId: (id: number | null) => void;
  addItem: (item: MeasureItem) => void;
  updateItem: (id: number, data: Partial<MeasureItem>) => void;
  removeItem: (id: number) => void;
  toggleDraw: (id: number) => void;
  toggleEdit: (id: number) => void;
  createNewMeasure: (type: DrawType, color: string) => void;
}

const MapState = create<MapState>((set, get) => ({
  map: null,
  items: [],
  activeItemId: null,
  setMap: (map) => set({ map }),
  setItems: (items) => set({ items }),
  setActiveItemId: (id) => set({ activeItemId: id }),
  addItem: (item) => set((state) => ({ items: [ item,...state.items] })),
  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => {
      const item = state.items.find((i) => i.id === id);

      if (item && state.map) {
        state.map.removeLayer(item.layer);
        item.layer.getSource()?.clear();
      }

      return {
        items: state.items.filter((item) => item.id !== id),
        activeItemId: state.activeItemId === id ? null : state.activeItemId,
      };
    }),
  toggleDraw: (id) =>
    set((state) => {
      const updatedItems = state.items.map((item) => {
        if (item.id === id) return { ...item, isDrawing: !item.isDrawing };
        return { ...item, isDrawing: false };
      });

      return { items: updatedItems, activeItemId: id };
    }),
  toggleEdit: (id) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id)
          return { ...item, isEditing: !item.isEditing, isDrawing: false };
        return { ...item, isEditing: false };
      }),
      activeItemId: id,
    })),


  createNewMeasure: (type: DrawType, color:string) => {
    const { map, addItem, items } = get();
    if (!map) return;

    const vectorSource = new VectorSource();
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: `${color}55`,
        }),
        stroke: new Stroke({
          color: `${color}FF`,
          width: 2,
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: `${color}`, 
          }),
        }),
      }),
    });

    map.addLayer(vectorLayer); 

    const newItem: MeasureItem = {
      id: items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1,
      type,
      color,
      visible: true,
      isDrawing: false,
      isEditing: false,
      layer: vectorLayer,
    };

    addItem(newItem);
  },
}));

export default MapState;