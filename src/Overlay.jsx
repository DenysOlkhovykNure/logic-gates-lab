import React, { useState, useEffect } from "react";
import { formula, img, connectors, highlight, names } from "./GateButtons";

const Overlay = ({
  isOverlay,
  setisOverlay,
  newFormula = [],
  lamps = [],
  buttons = [],
  links = [],
}) => {
  const [image, setImage] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [settingsName, setSettingsName] = useState("");
  const [settingsСonnectors, setSettingsConnectors] = useState([]);
  const [activeConnector, setActiveConnector] = useState(null);
  const scale = 1.25;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        setImageSize({
          width: img.width,
          height: img.height,
        });
      };
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseDown = (connector, e) => {
    setActiveConnector({
      id: connector.id,
      offsetX: parseInt(e.clientX - connector.left * scale),
      offsetY: parseInt(e.clientY - connector.top * scale),
    });
  };

  const handleMouseMove = (e) => {
    if (!activeConnector) return;

    const { clientX, clientY } = e;
    setSettingsConnectors((prevConnectors) =>
      prevConnectors.map((connector) =>
        connector.id === activeConnector.id
          ? {
              ...connector,
              left: parseInt((clientX - activeConnector.offsetX) / scale),
              top: parseInt((clientY - activeConnector.offsetY) / scale),
            }
          : connector
      )
    );
  };

  const handleMouseUp = () => setActiveConnector(null);

  const handleCoordinateChange = (index, key, value) => {
    setSettingsConnectors((prevConnectors) => {
      const updatedConnectors = [...prevConnectors];
      updatedConnectors[index] = {
        ...updatedConnectors[index],
        [key]: parseFloat(value),
      };
      return updatedConnectors;
    });
  };

  const replaceInFormula = (str, replacementMap, pattern, defaultReplacement) => {
    return str.replace(pattern, (match, p1) => {
      if (!(match in replacementMap)) {
        replacementMap[match] = defaultReplacement;
        if (defaultReplacement[0] === "v") {
          defaultReplacement = `v${Object.keys(replacementMap).length}`;
        }
      }
      return replacementMap[match];
    });
  };

  const Create = () => {
    let replacementMap = {};
    let finalFormula = newFormula.map((formula) =>
      replaceInFormula(formula, replacementMap, /b(\d)/g, `v${Object.keys(replacementMap).length}`)
    );

    replacementMap = {};
    finalFormula = finalFormula.map((formula) =>
      replaceInFormula(formula, replacementMap, /\b(\d)\b/g, `false`)
    );

    formula.push(finalFormula);
    img.push(image);
    console.log(settingsСonnectors);
    connectors.push(
      settingsСonnectors.map((connector) => ({
        ...connector,
        top: connector.top - 1,
      }))
    );
    console.log(settingsСonnectors);

    highlight.push(true);

    const outputCount = settingsСonnectors.filter((conn) => conn.type === "output").length;
    const newName = {
      id: names[names.length - 1].id + 1,
      name: settingsName,
      inputs: settingsСonnectors.length - outputCount,
      outputs: outputCount,
    };
    names.push(newName);

    setisOverlay(false);
  };

  useEffect(() => {
    if (!isOverlay) {
      setSettingsConnectors([]);
      setImage(null);
      setImageSize({ width: 0, height: 0 });
      setSettingsName("");
    }
  }, [isOverlay]);

  if (!isOverlay) return null;

  if (newFormula.length > 0 && settingsСonnectors.length === 0) {
    let newConnectors = [];
    for (let i = 0; i < newFormula.length; i++) {
      const lamp = lamps[i];
      const coord1 = links.find((link) => link.idObject1 === lamp.id);
      const coord2 = links.find((link) => link.idObject2 === lamp.id);
      if (coord1) {
        newConnectors.push({
          id: i + 1,
          type: "output",
          left: Math.round(coord1.coordinates.x[0] / 10),
          top: Math.round(coord1.coordinates.y[0] / 20),
        });
      } else if (coord2) {
        newConnectors.push({
          id: i + 1,
          type: "output",
          left: Math.round(coord2.coordinates.x[coord2.coordinates.x.length - 1] / 10),
          top: Math.round(coord2.coordinates.y[coord2.coordinates.y.length - 1] / 20),
        });
      }
    }

    for (let i = 0; i < newFormula.length; i++) {
      for (let j = 0; j < newFormula[i].length - 1; j++) {
        if (newFormula[i][j] === "b") {
          let numberStr = "";
          let k = j + 1;
          while (k < newFormula[i].length && /\d/.test(newFormula[i][k])) {
            numberStr += newFormula[i][k];
            k++;
          }
          const buttonId = parseInt(numberStr, 10);
          const button = buttons.find((but) => buttonId === but.id);
          const coord1 = links.find((link) => link.idObject1 === button.id);
          const coord2 = links.find((link) => link.idObject2 === button.id);
          if (coord1 || coord2) {
            const element = {
              id: newConnectors.length + 1,
              type: "input",
              left: Math.round(
                (coord1
                  ? coord1.coordinates.x[0]
                  : coord2.coordinates.x[coord2.coordinates.x.length - 1]) / 10
              ),
              top: Math.round(
                (coord1
                  ? coord1.coordinates.y[0]
                  : coord2.coordinates.y[coord2.coordinates.y.length - 1]) / 20
              ),
            };
            if (
              !newConnectors.some(
                (e) => e.type === element.type && e.left === element.left && e.top === element.top
              )
            ) {
              newConnectors.push(element);
            }
          }
        }
      }
    }
    setSettingsConnectors(newConnectors);
  }

  const objectSize = {
    width: `${imageSize.width * 0.5}px`,
    height: `${imageSize.height * 0.5}px`,
  };

  return (
    <div id="overlay" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div className="menu">
        <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            placeholder="Enter name"
            value={settingsName}
            onChange={(e) => setSettingsName(e.target.value)}
          />
        </div>
        <div className="container">
          <div className="header">
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="gateField">
            <div className="content">
              {image && (
                <div className="image-container">
                  <img
                    style={{
                      width: objectSize.width,
                      height: objectSize.height,
                    }}
                    src={image}
                    alt="Uploaded"
                  />
                  {settingsСonnectors.map((connector) => (
                    <div
                      key={connector.id}
                      className={connector.type}
                      style={{
                        left: connector.left * scale,
                        top: connector.top * scale,
                      }}
                      onMouseDown={(e) => handleMouseDown(connector, e)}
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="sidebar">
              {settingsСonnectors.map((connector, index) => (
                <div className={"connector-" + connector.type} key={connector.id}>
                  <label>
                    x =
                    <input
                      min="-10"
                      max="86"
                      className="input-number"
                      type="number"
                      style={{ width: `${connector.left.toString().length}ch` }}
                      value={connector.left}
                      onChange={(e) => handleCoordinateChange(index, "left", e.target.value)}
                    />
                  </label>
                  <label>
                    y =
                    <input
                      min="-10"
                      max="65"
                      className="input-number"
                      type="number"
                      style={{ width: `${connector.top.toString().length}ch` }}
                      value={connector.top}
                      onChange={(e) => handleCoordinateChange(index, "top", e.target.value)}
                    />
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button onClick={Create}>Create</button>
        <button onClick={() => setisOverlay(false)}>Cancel</button>
      </div>
    </div>
  );
};

export default Overlay;
