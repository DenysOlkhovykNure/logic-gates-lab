import React, { useState, useRef } from "react";
import "./App.css";
import Overlay from "./Overlay";
import GateButtons from "./GateButtons";
import SearchMenu from "./SearchMenu";
import SelectionBox from "./SelectionBox";
import Gate from "./Objects/Gate";
import Lamp from "./Objects/Lamp";
import Link from "./Objects/Link";
import Button from "./Objects/Button";
import { stopCreatingLink, onConnectorClick, addJoint, increaseLinkId } from "./Objects/Object";
import { generateFormula } from "./FormulaBilding";
import { getPositionLamp } from "./Objects/Lamp";
import { getPositionGate } from "./Objects/Gate";
import { getPositionButton } from "./Objects/Button";

let formula = 0;
let contentClass = "content";

//TODO

// Refactoring Overlay
// Constants
// Label
// Types Button and lamps
// Colors settings

function App() {
  const contentRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);

  const [buttons, setButtons] = useState([]);
  const [gates, setGates] = useState([]);
  const [lamps, setLamps] = useState([]);
  const [links, setLinks] = useState([]);
  const [copyData, setCopyData] = useState({
    elements: [],
    links: [],
  });

  const [ObjectId, setObjectId] = useState(0);

  const [searchingMask, setSearchingMask] = useState({ name: "", inputs: 0, outputs: 0 });
  const [isOverlay, setisOverlay] = useState(false);
  const [isGrid, setisGrid] = useState(false);

  const addButton = () => {
    const connectors = [{ id: 1, type: "output", top: 33, left: 31 }];
    const position = { top: 150, left: 300 };
    const newButton = {
      id: ObjectId,
      connectors,
      isSelected: false,
      position: position,
    };

    setObjectId(ObjectId + 1);
    setButtons([...buttons, newButton]);
  };

  const addLamp = () => {
    const connectors = [{ id: 1, type: "input", top: 53, left: 10 }];
    const position = { top: 150, left: 300 };
    const newLamp = {
      id: ObjectId,
      connectors,
      isSelected: false,
      position: position,
    };

    setObjectId(ObjectId + 1);
    setLamps([...lamps, newLamp]);
  };

  function checkOverlappingCoordinates() {
    const coordinates = {};

    const checkAndLog = (obj, type, getPosition) => {
      obj.connectors.forEach((connector, index) => {
        const pos = getPosition(obj.id);
        const x = pos.left + connector.left;
        const y = pos.top + connector.top;

        let foundOverlap = false;
        for (const coordKey in coordinates) {
          const [storedX, storedY] = coordKey.split(",").map(Number);
          if (Math.abs(storedX - x) <= 10 && Math.abs(storedY - y) <= 10) {
            const other = coordinates[coordKey];

            const existingLink = links.find(
              (link) =>
                (link.idObject1 === obj.id &&
                  link.idConnector1 === index + 1 &&
                  link.idObject2 === other.id &&
                  link.idConnector2 === other.connectorId + 1) ||
                (link.idObject1 === other.id &&
                  link.idConnector1 === other.connectorId + 1 &&
                  link.idObject2 === obj.id &&
                  link.idConnector2 === index + 1)
            );

            if (!existingLink) {
              onConnectorClick(
                other.id,
                other.connectorId + 1,
                { top: other.baseY, left: other.baseX },
                other.connectors,
                links,
                setLinks
              );
              onConnectorClick(
                obj.id,
                index + 1,
                { top: pos.top, left: pos.left },
                obj.connectors,
                links,
                setLinks
              );
            }

            foundOverlap = true;
            break;
          }
        }

        if (!foundOverlap) {
          coordinates[`${x},${y}`] = {
            id: obj.id,
            connectorId: index,
            type: type,
            connectors: obj.connectors,
            baseX: pos.left,
            baseY: pos.top,
          };
        }
      });
    };

    buttons.forEach((button) => checkAndLog(button, "Button", getPositionButton));
    gates.forEach((gate) => checkAndLog(gate, "Gate", getPositionGate));
    lamps.forEach((lamp) => checkAndLog(lamp, "Lamp", getPositionLamp));
  }

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX - 215, y: e.clientY - 85 });

    if (isGrid) {
      checkOverlappingCoordinates();
    }

    if (isSelecting) {
      setSelectionEnd({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseDown = (e) => {
    if (e.button === 2) {
      setIsSelecting(true);
      buttons.forEach((button) => (button.isSelected = false));
      gates.forEach((gate) => (gate.isSelected = false));
      lamps.forEach((lamp) => (lamp.isSelected = false));
      setSelectionStart({ x: e.clientX, y: e.clientY });
      setSelectionEnd({ x: e.clientX, y: e.clientY });
    } else if (e.button === 1) {
      stopCreatingLink(links, setLinks);

      if (
        selectionStart &&
        selectionEnd &&
        e.clientX > Math.min(selectionStart.x, selectionEnd.x) &&
        e.clientX < Math.max(selectionStart.x, selectionEnd.x) &&
        e.clientY > Math.min(selectionStart.y, selectionEnd.y) &&
        e.clientY < Math.max(selectionStart.y, selectionEnd.y)
      ) {
        setSelectionStart(null);
        setSelectionEnd(null);
      }
    } else if (e.button === 0) {
      addJoint(e, isGrid);

      if (
        selectionStart &&
        selectionEnd &&
        !(
          e.clientX > Math.min(selectionStart.x, selectionEnd.x) &&
          e.clientX < Math.max(selectionStart.x, selectionEnd.x) &&
          e.clientY > Math.min(selectionStart.y, selectionEnd.y) &&
          e.clientY < Math.max(selectionStart.y, selectionEnd.y)
        )
      ) {
        setSelectionStart(null);
        setSelectionEnd(null);
        buttons.forEach((button) => (button.isSelected = false));
        gates.forEach((gate) => (gate.isSelected = false));
        lamps.forEach((lamp) => (lamp.isSelected = false));
      }
    }
  };

  const handleMouseUp = (e) => {
    if (isSelecting) {
      setIsSelecting(false);

      const setSelectedObjects = (obj, getPosition) => {
        const pos = getPosition(obj.id);
        if (
          pos.left > Math.min(selectionStart.x, selectionEnd.x) &&
          pos.left < Math.max(selectionStart.x, selectionEnd.x) &&
          pos.top > Math.min(selectionStart.y, selectionEnd.y) &&
          pos.top < Math.max(selectionStart.y, selectionEnd.y)
        ) {
          obj.isSelected = true;
        }
      };

      buttons.forEach((button) => setSelectedObjects(button, getPositionButton));
      gates.forEach((gate) => setSelectedObjects(gate, getPositionGate));
      lamps.forEach((lamp) => setSelectedObjects(lamp, getPositionLamp));
    }
  };

  const toggleOverlayMenu = (value) => {
    setisOverlay(value);
    formula = generateFormula(gates, lamps, buttons, links);
  };

  const toggleGrid = (value) => {
    if (isGrid) {
      contentClass = "content";
    } else {
      contentClass = "content-grid";
    }
    setisGrid(value);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && (e.key === "c" || e.key === "с")) {
      const selectedElements = [
        ...buttons
          .filter((button) => button.isSelected)
          .map((button) => ({
            ...button,
            type: "button",
            position: {
              top: getPositionButton(button.id).top - selectionStart.y,
              left: getPositionButton(button.id).left - selectionStart.x,
            },
          })),
        ...gates
          .filter((gate) => gate.isSelected)
          .map((gate) => ({
            ...gate,
            type: "gate",
            position: {
              top: getPositionGate(gate.id).top - selectionStart.y,
              left: getPositionGate(gate.id).left - selectionStart.x,
            },
          })),
        ...lamps
          .filter((lamp) => lamp.isSelected)
          .map((lamp) => ({
            ...lamp,
            type: "lamp",
            position: {
              top: getPositionLamp(lamp.id).top - selectionStart.y,
              left: getPositionLamp(lamp.id).left - selectionStart.x,
            },
          })),
      ];
      const selectedIds = selectedElements.map((element) => element.id);

      const selectedLinks = links
        .filter(
          (link) => selectedIds.includes(link.idObject1) && selectedIds.includes(link.idObject2)
        )
        .map((link) => ({
          ...link,
          coordinates: {
            x: link.coordinates.x.map((x) => x - selectionStart.x),
            y: link.coordinates.y.map((y) => y - selectionStart.y),
          },
        }));

      setCopyData({
        elements: selectedElements,
        links: selectedLinks,
      });
    }

    if (e.ctrlKey && (e.key === "v" || e.key === "м")) {
      let id = ObjectId;

      const newButtons = [];
      const newGates = [];
      const newLamps = [];

      const copyElements = copyData.elements;
      copyElements.forEach((element) => {
        switch (element.type) {
          case "button":
            newButtons.push({
              id: id,
              connectors: element.connectors,
              isSelected: false,
              position: {
                top: element.position.top + cursorPosition.y + 85,
                left: element.position.left + cursorPosition.x + 215,
              },
            });
            id++;
            break;

          case "gate":
            newGates.push({
              id: id,
              connectors: element.connectors,
              formula: element.formula,
              img: element.img,
              isSelected: false,
              position: {
                top: element.position.top + cursorPosition.y + 85,
                left: element.position.left + cursorPosition.x + 215,
              },
            });
            id++;
            break;

          case "lamp":
            newLamps.push({
              id: id,
              connectors: element.connectors,
              isSelected: false,
              position: {
                top: element.position.top + cursorPosition.y + 85,
                left: element.position.left + cursorPosition.x + 215,
              },
            });
            id++;
            break;

          default:
            console.log("Unknown element type:", element.type);
            break;
        }
      });

      setButtons([...buttons, ...newButtons]);
      setGates([...gates, ...newGates]);
      setLamps([...lamps, ...newLamps]);
      setObjectId(id);

      const selectedIds = copyElements.map((element) => element.id);
      const selectedLinks = copyData.links.map((link) => ({
        ...link,
        id: increaseLinkId(),
        idObject1: ObjectId + selectedIds.indexOf(link.idObject1),
        idObject2: ObjectId + selectedIds.indexOf(link.idObject2),
        coordinates: {
          x: link.coordinates.x.map((x) => x + cursorPosition.x + 215),
          y: link.coordinates.y.map((y) => y + cursorPosition.y + 85),
        },
      }));
      setLinks((prevLinks) => [...prevLinks, ...selectedLinks]);
    }
  };

  return (
    <div className="grid-container">
      <div className="search">
        <SearchMenu setSearchingMask={setSearchingMask}></SearchMenu>
      </div>
      <div className="header">
        <div>
          <button onClick={addLamp}>
            <img src="public\lamp-on.png" />
          </button>
          {/* <button onClick={addButton}>
            <img src="src/assets/button-off.png" />
          </button> */}
          <button onClick={() => toggleOverlayMenu(!isOverlay)}>
            <img src="src/assets/compression.png" />
          </button>
        </div>
        <div>
          <button onClick={() => toggleGrid(!isGrid)}>
            <img src="src/assets/grid.png" />
          </button>
        </div>
      </div>
      <div className="sidebar">
        <GateButtons
          ObjectId={ObjectId}
          setObjectId={setObjectId}
          gates={gates}
          setGates={setGates}
          searchingMask={searchingMask}
        />
      </div>
      <div
        className={contentClass}
        ref={contentRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {buttons.map((button) => (
          <Button
            key={button.id}
            id={button.id}
            contentRef={contentRef}
            defaultPosition={button.position}
            connectors={button.connectors}
            links={links}
            setLinks={setLinks}
            isGrid={isGrid}
            buttons={buttons}
            setButtons={setButtons}
            isSelected={button.isSelected}
          />
        ))}
        {gates.map((gate) => (
          <Gate
            key={gate.id}
            id={gate.id}
            contentRef={contentRef}
            defaultPosition={gate.position}
            connectors={gate.connectors}
            links={links}
            setLinks={setLinks}
            img={gate.img}
            formula={gate.formula}
            isGrid={isGrid}
            gates={gates}
            setGates={setGates}
            isSelected={gate.isSelected}
          />
        ))}
        {lamps.map((lamp) => (
          <Lamp
            key={lamp.id}
            id={lamp.id}
            contentRef={contentRef}
            defaultPosition={lamp.position}
            connectors={lamp.connectors}
            links={links}
            setLinks={setLinks}
            isGrid={isGrid}
            lamps={lamps}
            setLamps={setLamps}
            isSelected={lamp.isSelected}
          />
        ))}
        <svg className="line-container">
          {links.map((link) => (
            <Link
              key={link.id}
              id={link.id}
              coordinates={link.coordinates}
              state={link.state}
              cursorPosition={cursorPosition}
              links={links}
              setLinks={setLinks}
              isGrid={isGrid}
            />
          ))}
        </svg>
        <SelectionBox
          selectionStart={selectionStart}
          setSelectionStart={setSelectionStart}
          selectionEnd={selectionEnd}
          setSelectionEnd={setSelectionEnd}
          contentRef={contentRef}
          buttons={buttons}
          gates={gates}
          lamps={lamps}
        />
      </div>
      <div className="Overlay">
        <Overlay
          isOverlay={isOverlay}
          setisOverlay={setisOverlay}
          newFormula={formula}
          lamps={lamps}
          buttons={buttons}
          links={links}
        />
      </div>
    </div>
  );
}

export default App;
