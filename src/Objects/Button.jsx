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

let pos = [];
export const getPositionButton = (id) => {
  return pos[id];
};

const Button = ({
  id,
  contentRef,
  defaultPosition,
  connectors = [],
  links = [],
  setLinks,
  isGrid,
  buttons,
  setButtons,
  isSelected,
}) => {
  let className = "object-image";

  const draggableRef = useRef(null);
  const [position, setPosition] = useState(defaultPosition);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  // Зміна розміру зображення
  useEffect(() => {
    const imgElement = new Image();
    const imgSrc = readState(id, links, connectors[0]?.id)
      ? "/logic-gates-lab/button-on.png"
      : "/logic-gates-lab/button-off.png";
    imgElement.src = imgSrc;
    imgElement.onload = () => {
      setImageSize({
        width: imgElement.width,
        height: imgElement.height,
      });
    };
  }, [id, links, connectors]);

  const pressButton = (e, draggableRef, setPosition, position) => {
    const buttonRect = draggableRef.current.getBoundingClientRect();
    const clickY = e.clientY - buttonRect.top;
    const isUpperHalf = clickY < buttonRect.height / 2;
    const isOnButton =
      buttonRect.left < e.clientX &&
      buttonRect.left + buttonRect.width > e.clientX &&
      buttonRect.top < e.clientY &&
      buttonRect.top + buttonRect.height > e.clientY;

    if (isUpperHalf && isOnButton) {
      writeState(id, links, setLinks, connectors[0].id, !readState(id, links, connectors[0].id));
    }
    if (e.button === 0) {
      startDragging(e, draggableRef, setPosition, position);
    } else if (e.button === 1) {
      deleteObject(id, links, setLinks, buttons, setButtons);
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

  const imgSrc = readState(id, links, connectors[0]?.id)
    ? "/logic-gates-lab/button-on.png"
    : "/logic-gates-lab/button-off.png";

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
      onMouseDown={(e) => pressButton(e, draggableRef, setPosition, position)}
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
      <img src={imgSrc} className={className} draggable="false" style={{ pointerEvents: "none" }} />
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
        />
      ))}
      {/* {id} */}
    </div>
  );
};

export default Button;
