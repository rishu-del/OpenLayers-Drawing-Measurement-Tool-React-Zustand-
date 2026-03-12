import React from "react";
import {
  AiFillEye,
  AiFillEyeInvisible,
  AiFillDelete,
  AiFillRightCircle,
  AiFillEdit,
} from "react-icons/ai";

import MapState, { type DrawType } from "../../services/mapStore";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import "./mapdataFields.css";

const MapdataFields: React.FC = () => {
  const {
    items,
    removeItem,
    updateItem,
    toggleDraw,
    toggleEdit,
    createNewMeasure,
  } = MapState();

  // Add geometry
  const handleAdd = () => {
    const select = document.getElementById("Draw01") as HTMLSelectElement;
    const type = select.value as DrawType;

    const defaultColor = "#00ffae";
    createNewMeasure(type, defaultColor);
  };

  // Toggle layer visibility
  const toggleVisibility = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const newVisiblety = !item.layer.getVisible();
    item.layer.setVisible(newVisiblety);
    updateItem(id, { visible: newVisiblety });
  };

//  hdl color change
const handleColorChange = (id: number, color: string) => {
  const item = items.find((i) => i.id === id);
  if (!item) return;

  const newStyle = new Style({
    fill: new Fill({
      color: `${color}33`, 
    }),
    stroke: new Stroke({
      color: color, 
      width: 3,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: `${color}55`, 
      }),
      stroke: new Stroke({
        color: color, 
        width: 3,
      }),
    }),
  });

  item.layer.setStyle(newStyle);
  updateItem(id, { color: color });
};

  return (
    <div className="cont0">
      {/* Geometry Selection */}
      <section className="option-drawTypes">
        <select id="Draw01">
          <option value="Polygon">Polygon</option>
          <option value="LineString">LineString</option>
          <option value="MultiPoint">Points</option>
        </select>
        <button onClick={handleAdd}>Add Geometry</button>
      </section>

      {/* Measurements List */}
      <section className="DataContainers">
        {items.map((item) => (
          <ul key={item.id} className="measurement-item">
            {/* Color Picker */}
            <li className="vector-legend">
              <div className="colorSelector">
                <input
                  type="color"
                  value={item.color || "#00ffae"}
                  onChange={(e) => handleColorChange(item.id, e.target.value)}
                />
              </div>
            </li>
            

           
            {/* <li>{item.color || "-"}</li> */}

           
            <li>{item.type}</li>

            {/* Toggle Visibility */}
            <li onClick={() => toggleVisibility(item.id)}>
              {item.visible ? (
                <AiFillEye style={{ color: "green" }} />
              ) : (
                <AiFillEyeInvisible style={{ color: "black" }} />
              )}
            </li>

            {/* Delete */}
            <li onClick={() => removeItem(item.id)}>
              <AiFillDelete className="del-btn" />
            </li>

            {/* Edit */}
            <li onClick={() => toggleEdit(item.id)}>
              <AiFillEdit style={{ color: item.isEditing ? "green" : "gray" }} />
            </li>

            {/* Measurement */}
         <li className="measur_li">
          {item.area !== undefined
          ? `${(item.area / 1_000_000).toFixed(2)} km²`: item.length !== undefined
          ? `${(item.length / 1000).toFixed(2)} km`: item.numPoints !== undefined
            ? `${item.numPoints} places`: "-"} 
         </li>

            {/* Toggle Drawing */}
            <li className="show-vector" onClick={() => toggleDraw(item.id)}>
              <AiFillRightCircle
                size={30}
                color={item.isDrawing ? "green" : "gray"}
              />
            </li>
          </ul>
        ))}
      </section>
    </div>
  );
};

export default MapdataFields;