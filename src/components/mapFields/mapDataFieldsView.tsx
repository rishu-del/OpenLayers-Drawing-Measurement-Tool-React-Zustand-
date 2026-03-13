import React from "react";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillDelete,
  AiFillRightCircle,
  AiFillEdit,
} from "react-icons/ai";
import type { DrawType, MeasureItem } from "../../services/MapStates";
import "./mapDataFieldsView.css";

interface Props {
  items: MeasureItem[];
  drawtype: DrawType;
  setDrawtype: (type: DrawType) => void;
  handleAdd: () => void;
  toggleVisibility: (id: number) => void;
  removeItem: (id: number) => void;
  toggleEdit: (id: number) => void;
  toggleDraw: (id: number) => void;
  handleColorChange: (id: number, color: string) => void;
}

const MapdataFieldsView: React.FC<Props> = ({
  items,
  drawtype,
  setDrawtype,
  handleAdd,
  toggleVisibility,
  removeItem,
  toggleEdit,
  toggleDraw,
  handleColorChange,
}) => {
  return (
    <div className="cont0">
      <section className="option-drawTypes">
        <select
          value={drawtype}
          onChange={(e) => setDrawtype(e.target.value as DrawType)}
        >
          <option value="Polygon">Polygon</option>
          <option value="LineString">LineString</option>
          <option value="MultiPoint">Points</option>
        </select>

        <button onClick={handleAdd}>Add Geometry</button>
      </section>

      <section className="DataContainers">
        {items.map((item) => (
          <ul key={item.id} className="measurement-item">
            <li className="vector-legend">
              <input
                type="color"
                value={item.color}
                onChange={(e) => handleColorChange(item.id, e.target.value)}
              />
            </li>

            <li>{item.type}</li>

            <li onClick={() => toggleVisibility(item.id)}>
              {item.visible ? (
                <AiFillEye className="icon-visible" />
              ) : (
                <AiFillEyeInvisible className="icon-hidden" />
              )}
            </li>

            <li onClick={() => removeItem(item.id)}>
              <AiFillDelete className="icon-delete" />
            </li>

            <li onClick={() => toggleEdit(item.id)}>
              <AiFillEdit
                className={item.isEditing ? "icon-edit-active" : "icon-edit"}
              />
            </li>

            <li className="measurement-list">
              {item.area !== undefined
                ? `${(item.area / 1_000_000).toFixed(2)} km²`
                : item.length !== undefined
                  ? `${(item.length / 1000).toFixed(2)} km`
                  : item.numPoints !== undefined
                    ? `${item.numPoints} points`
                    : "-"}
            </li>

            <li className="show-vector" onClick={() => toggleDraw(item.id)}>
              <AiFillRightCircle
                className={item.isDrawing ? "icon-draw-active" : "icon-draw"}
              />
            </li>
          </ul>
        ))}
      </section>
    </div>
  );
};

export default MapdataFieldsView;
