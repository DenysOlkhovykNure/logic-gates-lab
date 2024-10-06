import React, { useState, useRef, useEffect } from "react";
import {
  startDragging,
  updateDraggingPosition,
  stopDragging,
  onConnectorClick,
  writeState,
  readState,
  deleteObject,
} from "./Object";
import { evaluateLogicalExpression } from "/src/FormulaSolving.jsx";

let pos = [];
export const getPositionGate = (id) => {
  return pos[id];
};

const Gate = ({
  id,
  contentRef,
  defaultPosition,
  connectors = [],
  links = [],
  setLinks,
  img,
  formula,
  isGrid,
  gates,
  setGates,
  isSelected,
}) => {
  let className = "object-image";
  const draggableRef = useRef(null);
  const [position, setPosition] = useState(defaultPosition);
  const [variables, setVariables] = useState([]);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const imgElement = new Image();
    imgElement.src = img;
    imgElement.onload = () => {
      setImageSize({
        width: imgElement.width,
        height: imgElement.height,
      });
    };
  }, [img]);

  useEffect(() => {
    const evaluate = async () => {
      const inputs = connectors
        .filter((connector) => connector.type === "input")
        .map((connector) => readState(id, links, connector.id));

      for (let i = 0; i < connectors.length; i++) {
        const connector = connectors[i];
        if (connector.type === "output") {
          const newVariables = { ...(variables[i] || {}) };
          inputs.forEach((input, index) => {
            if (input !== undefined) {
              newVariables[`v${index}`] = input;
            } else {
              newVariables[`v${index}`] = false;
            }
          });

          const result = await evaluateLogicalExpression(formula[i], newVariables);
          if (
            result !== readState(id, links, connector.id) &&
            readState(id, links, connector.id) !== undefined
          ) {
            writeState(id, links, setLinks, connector.id, result);
          }
          setVariables((prevVariables) => {
            const updatedVariables = [...prevVariables];
            updatedVariables[i] = newVariables;
            return updatedVariables;
          });
        }
      }
    };

    evaluate();
  }, [links, setLinks, formula]);

  const mouseDown = (e, draggableRef, setPosition, position) => {
    if (e.button === 0) {
      startDragging(e, draggableRef, setPosition, position);
    } else if (e.button === 1) {
      deleteObject(id, links, setLinks, gates, setGates);
    }
  };

  pos[id] = position;

  if (isSelected) {
    className = "object-image glow";
  }

  const objectSize = {
    width: `${imageSize.width * 0.4}px`,
    height: `${imageSize.height * 0.4}px`,
  };

  const handleDrag = (event) => {
    event.preventDefault();
  };

  return (
    <div
      ref={draggableRef}
      className="object"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: objectSize.width,
        height: objectSize.height,
      }}
      onMouseDown={(e) => mouseDown(e, draggableRef, setPosition, position)}
      onMouseMove={(e) =>
        updateDraggingPosition(
          e,
          contentRef,
          draggableRef,
          setPosition,
          position,
          links,
          id,
          connectors,
          setLinks,
          isGrid
        )
      }
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onDrag={handleDrag}
      onDragStart={handleDrag}
    >
      <img src={img} className={className} draggable="false" style={{ pointerEvents: "none" }} />
      {connectors.map((connector) => (
        <div
          key={connector.id}
          className={connector.type}
          style={{
            top: `${connector.top}px`,
            left: `${connector.left}px`,
          }}
          onMouseDown={() =>
            onConnectorClick(id, connector.id, position, connectors, links, setLinks)
          }
        >
          {/* {readState(id, links, connector.id) !== undefined ? readState(id, links, connector.id).toString() : ''} */}
        </div>
      ))}
      {/* {(id, formula)} */}
      {/* {id} */}
    </div>
  );
};

export default Gate;
