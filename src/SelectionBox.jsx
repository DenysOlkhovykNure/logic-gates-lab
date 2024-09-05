import React, { useState, useRef } from "react";

let dragging = false;

const SelectionBox = ({
  selectionStart,
  setSelectionStart,
  selectionEnd,
  setSelectionEnd,
  contentRef,
  buttons,
  gates,
  lamps,
}) => {
  const draggableRef = useRef(null);
  const [position, setPosition] = useState({
    offsetX: 0,
    offsetY: 0,
  });

  const triggerEventForSelected = (elements, e, eventName) => {
    elements.forEach((element, index) => {
      if (element.isSelected) {
        const simulatedEvent = new MouseEvent(eventName, {
          bubbles: true,
          cancelable: true,
          clientX: e.clientX,
          clientY: e.clientY,
          button: e.button,
        });

        let elementIndex = element.index;

        if (element.type === "gate") {
          elementIndex += buttons.length;
        } else if (element.type === "lamp") {
          elementIndex += buttons.length + gates.length;
        }

        const domElement = document.querySelectorAll(".object")[elementIndex];
        if (domElement) {
          setTimeout(() => {
            domElement.dispatchEvent(simulatedEvent);
          }, index * 10); // Невелика затримка між подіями
        }
      }
    });
  };

  const startDragging = (e) => {
    if (e.button === 0) {
      dragging = true;
      const rect = draggableRef.current.getBoundingClientRect();
      setPosition({
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      });
    }

    const elements = [
      ...buttons.map((button, index) => ({ ...button, index, type: "button" })),
      ...gates.map((gate, index) => ({ ...gate, index, type: "gate" })),
      ...lamps.map((lamp, index) => ({ ...lamp, index, type: "lamp" })),
    ];
    triggerEventForSelected(elements, e, "mousedown");
  };

  const updateDraggingPosition = (e) => {
    if (e.button === 0 && dragging) {
      const contentRect = contentRef.current.getBoundingClientRect();

      let newLeft = e.clientX - position.offsetX;
      let newTop = e.clientY - position.offsetY;

      if (newLeft < contentRect.left) {
        newLeft = contentRect.left;
      } else if (newLeft + Math.abs(selectionStart.x - selectionEnd.x) > contentRect.right) {
        newLeft = contentRect.right - Math.abs(selectionStart.x - selectionEnd.x);
      }
      if (newTop < contentRect.top) {
        newTop = contentRect.top;
      } else if (newTop + Math.abs(selectionStart.y - selectionEnd.y) > contentRect.bottom) {
        newTop = contentRect.bottom - Math.abs(selectionStart.y - selectionEnd.y);
      }

      setSelectionStart({ x: newLeft, y: newTop });
      setSelectionEnd({
        x: newLeft + Math.abs(selectionStart.x - selectionEnd.x),
        y: newTop + Math.abs(selectionStart.y - selectionEnd.y),
      });

      const elements = [
        ...buttons.map((button, index) => ({ ...button, index, type: "button" })),
        ...gates.map((gate, index) => ({ ...gate, index, type: "gate" })),
        ...lamps.map((lamp, index) => ({ ...lamp, index, type: "lamp" })),
      ];
      triggerEventForSelected(elements, e, "mousemove");
    }
  };

  const stopDragging = (e) => {
    dragging = false;
    const elements = [
      ...buttons.map((button, index) => ({ ...button, index, type: "button" })),
      ...gates.map((gate, index) => ({ ...gate, index, type: "gate" })),
      ...lamps.map((lamp, index) => ({ ...lamp, index, type: "lamp" })),
    ];
    triggerEventForSelected(elements, e, "mouseup");
  };

  if (!selectionStart || !selectionEnd) {
    return null;
  } else {
    const left = Math.min(selectionStart.x, selectionEnd.x);
    const top = Math.min(selectionStart.y, selectionEnd.y);
    const width = Math.abs(selectionStart.x - selectionEnd.x);
    const height = Math.abs(selectionStart.y - selectionEnd.y);

    return (
      <div
        ref={draggableRef}
        onMouseDown={startDragging}
        onMouseMove={updateDraggingPosition}
        onMouseUp={stopDragging}
        style={{
          position: "absolute",
          left: `${left}px`,
          top: `${top}px`,
          width: `${width}px`,
          height: `${height}px`,
          border: "1px dashed blue",
          backgroundColor: "rgba(173, 216, 230, 0.2)",
          cursor: "move",
          pointerEvents: "all",
        }}
      ></div>
    );
  }
};

export default SelectionBox;
