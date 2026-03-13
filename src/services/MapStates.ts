import { create } from "zustand";

export type DrawType = "Polygon" | "LineString" | "MultiPoint";

export type MeasureItem = {
  id: number;
  type: DrawType;
  color: string;
  area?: number;
  length?: number;
  numPoints?: number;
  visible: boolean;
  isDrawing: boolean;
  isEditing: boolean;
};

interface MapState {
  items: MeasureItem[];
  activeItemId: number | null;
  addItem: (item: MeasureItem) => void;
  updateItem: (id: number, data: Partial<MeasureItem>) => void;
  removeItem: (id: number) => void;
  toggleDraw: (id: number) => void;
  toggleEdit: (id: number) => void;
}

const MapState = create<MapState>((set) => ({
  items: [],
  activeItemId: null,

  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),

  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, ...data } : i)),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
      activeItemId: state.activeItemId === id ? null : state.activeItemId,
    })),

  toggleDraw: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? { ...i, isDrawing: !i.isDrawing }
          : { ...i, isDrawing: false },
      ),
      activeItemId: id,
    })),

  toggleEdit: (id) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.id === id
          ? { ...i, isEditing: !i.isEditing, isDrawing: false }
          : { ...i, isEditing: false },
      ),
      activeItemId: id,
    })),
}));

export default MapState;
