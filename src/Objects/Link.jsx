import React from "react";

const deleteLink = (e, id, links, setLinks) => {
  if (e.button === 1) {
    const filteredLinks = links.filter((link) => link.id !== id);
    setLinks(filteredLinks);
  }
};

const Link = ({ id, coordinates, state, cursorPosition, links, setLinks, isGrid }) => {
  let color = "black";
  const points = coordinates.x.map((x, index) => ({
    x,
    y: coordinates.y[index],
  }));

  if (points[points.length - 1].x === 0 && points[points.length - 1].y === 0) {
    if (isGrid) {
      let oldX = points[points.length - 2].x;
      let oldY = points[points.length - 2].y;
      if (Math.abs(oldX - cursorPosition.x) > Math.abs(oldY - cursorPosition.y)) {
        points[points.length - 1] = {
          x: cursorPosition.x,
          y: oldY,
        };
      } else {
        points[points.length - 1] = {
          x: oldX,
          y: cursorPosition.y,
        };
      }
    } else {
      points[points.length - 1] = {
        x: cursorPosition.x,
        y: cursorPosition.y,
      };
    }
  }

  if (state) {
    color = "red";
  }

  return (
    <svg
      style={{
        position: "absolute",
        overflow: "visible",
        width: "100%",
        height: "100%",
        pointerEvents: "auto",
      }}
      onMouseDown={(e) => deleteLink(e, id, links, setLinks)}
    >
      {points.map((point, index) => {
        if (index < points.length - 1) {
          const nextPoint = points[index + 1];
          return (
            <React.Fragment key={index}>
              <line
                x1={point.x}
                y1={point.y}
                x2={nextPoint.x}
                y2={nextPoint.y}
                stroke={color}
                strokeWidth="2"
              />
            </React.Fragment>
          );
        }
        return null;
      })}
      <circle cx={points[0].x} cy={points[0].y} r="2" fill="black" />
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r="2"
        fill="black"
      />
    </svg>
  );
};

export default Link;
