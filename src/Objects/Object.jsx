let dragging = false;
let isConnector = false;
let isStart = true;
let startConnectorType = 0;
let linkId = 0;

export const increaseLinkId = () => {
  const copy = linkId;
  linkId++;
  return copy;
};

const createNewLink = () => ({
  id: linkId++,
  coordinates: {
    x: [],
    y: [],
  },
  idObject1: 0,
  idConnector1: 0,
  idObject2: 0,
  idConnector2: 0,
  state: false,
});

let newLink = createNewLink();

export const writeState = (id, links, setLinks, connectorId, state) => {
  const updatedLinks = links.map((link) => {
    if (
      (link.idObject1 === id && link.idConnector1 === connectorId) ||
      (link.idObject2 === id && link.idConnector2 === connectorId)
    ) {
      link.state = state;
    }
    return link;
  });
  setLinks(updatedLinks);
};

export const readState = (id, links, connectorId) => {
  const filteredLinks = links.filter(
    (link) =>
      (link.idObject1 === id && link.idConnector1 === connectorId) ||
      (link.idObject2 === id && link.idConnector2 === connectorId)
  );
  if (filteredLinks.length > 1) {
    const firstState = filteredLinks[0].state;
    const allSameState = filteredLinks.every((link) => link.state === firstState);
    return allSameState ? firstState : !filteredLinks[0].state;
  }
  return filteredLinks.length > 0 ? filteredLinks[0].state : undefined;
};

export const stopCreatingLink = (links, setLinks) => {
  if (!isStart) {
    isStart = true;
    const tempLinks = [...links];
    tempLinks.pop();
    newLink = createNewLink();
    setLinks([...tempLinks]);
  }
};

export const startDragging = (e, draggableRef, setPosition, position) => {
  if (!isConnector) {
    dragging = true;
    const rect = draggableRef.current.getBoundingClientRect();
    setPosition({
      ...position,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    });
  }
};

export const updateDraggingPosition = (
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
) => {
  if (dragging && !isConnector) {
    const contentRect = contentRef.current.getBoundingClientRect();
    const draggableRect = draggableRef.current.getBoundingClientRect();

    let newLeft = e.clientX - position.offsetX;
    let newTop = e.clientY - position.offsetY;
    if (newLeft < contentRect.left) {
      newLeft = contentRect.left;
    } else if (newLeft + draggableRect.width > contentRect.right) {
      newLeft = contentRect.right - draggableRect.width;
    }
    if (newTop < contentRect.top) {
      newTop = contentRect.top;
    } else if (newTop + draggableRect.height > contentRect.bottom) {
      newTop = contentRect.bottom - draggableRect.height;
    }

    if (isGrid) {
      newTop = Math.round(newTop / 20) * 20;
      newLeft = Math.round(newLeft / 20) * 20 + 11;
    }
    setPosition({
      ...position,
      top: newTop,
      left: newLeft,
    });

    const updatedLinks = links.map((link) => {
      const connector1 = connectors[link.idConnector1 - 1];
      const connector2 = connectors[link.idConnector2 - 1];
      if (link.idObject1 === id && connector1) {
        link.coordinates.x[0] = newLeft + connector1.left - 209;
        link.coordinates.y[0] = newTop + connector1.top - 77;
      } else if (link.idObject2 === id && connector2) {
        link.coordinates.x[link.coordinates.x.length - 1] = newLeft + connector2.left - 209;
        link.coordinates.y[link.coordinates.y.length - 1] = newTop + connector2.top - 77;
      }
      return link;
    });
    setLinks(updatedLinks);
  } else if (isConnector) {
    dragging = false;
  }
};

export const stopDragging = () => {
  isConnector = false;
  dragging = false;
};

export const addJoint = (e, isGrid) => {
  if (!isStart) {
    if (
      newLink.coordinates.x[newLink.coordinates.x.length - 1] === 0 &&
      newLink.coordinates.y[newLink.coordinates.y.length - 1] === 0
    ) {
      if (isGrid) {
        let oldX = newLink.coordinates.x[newLink.coordinates.x.length - 2];
        let oldY = newLink.coordinates.y[newLink.coordinates.y.length - 2];
        if (Math.abs(oldX - (e.clientX - 215)) > Math.abs(oldY - (e.clientY - 85))) {
          newLink.coordinates.x[newLink.coordinates.x.length - 1] = e.clientX - 215;
          newLink.coordinates.y[newLink.coordinates.y.length - 1] = oldY;
        } else {
          newLink.coordinates.x[newLink.coordinates.x.length - 1] = oldX;
          newLink.coordinates.y[newLink.coordinates.y.length - 1] = e.clientY - 85;
        }
      } else {
        newLink.coordinates.x[newLink.coordinates.x.length - 1] = e.clientX - 215;
        newLink.coordinates.y[newLink.coordinates.y.length - 1] = e.clientY - 85;
      }
    }
    newLink.coordinates.x.push(0);
    newLink.coordinates.y.push(0);
  }
};

export const onConnectorClick = (id, idConnector, position, connectors, links, setLinks) => {
  isConnector = true;
  const connector = connectors[idConnector - 1];

  const hasInputConnection = links.some(
    (link) =>
      (link.idObject2 === id && link.idConnector2 === idConnector) ||
      (link.idObject1 === id && link.idConnector1 === idConnector)
  );
  if (connector.type === "input" && hasInputConnection) {
    //сhecking that ONLY INPUT connector dont have another connections
    if (!isStart) {
      stopCreatingLink(links, setLinks);
    }
    return;
  }

  if (isStart) {
    newLink.coordinates.x.push(position.left + connector.left - 209);
    newLink.coordinates.y.push(position.top + connector.top - 77);
    newLink.idObject1 = id;
    newLink.idConnector1 = idConnector;

    isStart = false;
    startConnectorType = connector.type;

    setLinks([...links, newLink]);
  } else {
    if (newLink.idObject1 !== id) {
      // Checking that the object is not the same
      if (startConnectorType === connector.type) {
        // Checking that the connectors are not the same type
        isStart = true;
        return;
      }
      newLink.coordinates.x[newLink.coordinates.x.length - 1] =
        position.left + connector.left - 209;
      newLink.coordinates.y[newLink.coordinates.y.length - 1] = position.top + connector.top - 77;

      newLink.idObject2 = id;
      newLink.idConnector2 = idConnector;

      // Remove any duplicate links
      const updatedLinks = links.filter(
        (link) =>
          !(
            (link.idObject1 === newLink.idObject1 &&
              link.idConnector1 === newLink.idConnector1 &&
              link.idObject2 === newLink.idObject2 &&
              link.idConnector2 === newLink.idConnector2) ||
            (link.idObject1 === newLink.idObject2 &&
              link.idConnector1 === newLink.idConnector2 &&
              link.idObject2 === newLink.idObject1 &&
              link.idConnector2 === newLink.idConnector1)
          )
      );

      setLinks([...updatedLinks, newLink]);
      newLink = createNewLink();
    }
    isStart = true;
  }
};

export const deleteObject = (id, links, setLinks, objects, setObjects) => {
  const filteredLinks = links.filter((link) => link.idObject1 !== id && link.idObject2 !== id);
  setLinks(filteredLinks);

  const filteredObjects = objects.filter((object) => object.id !== id);
  setObjects(filteredObjects);
};
