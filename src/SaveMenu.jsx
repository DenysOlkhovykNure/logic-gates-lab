import React, { useState, useEffect } from "react";
import { formula, img, connectors, names } from "./GateButtons";
import { saveImgToGoogleDrive, saveTxtToGoogleDrive } from "./GoogleDriveSaving";

const SaveMenu = ({ isSaveMenu, setisSaveMenu }) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(localStorage.getItem("savedURL"));
  }, []);

  async function handleSave() {
    if (inputValue.trim() === "") {
      alert("Please enter a URL before saving.");
      return;
    }
    localStorage.setItem("savedURL", inputValue);

    try {
      // Паралельно завантажуємо всі зображення
      const gates = await Promise.all(
        names.map(async (item, index) => ({
          name: item.name,
          inputs: item.inputs,
          outputs: item.outputs,
          formula: formula[index],
          img: await saveImgToGoogleDrive(img[index], item.name), // Очікуємо завантаження кожного зображення
          connectors: connectors[index],
        }))
      );

      // Паралельно зберігаємо всі текстові дані
      await Promise.all(gates.map(async (element) => saveTxtToGoogleDrive(element)));

      alert("All files uploaded successfully!");
    } catch (error) {
      console.error("Error during parallel upload:", error);
      alert("An error occurred. See console for details.");
    }
  }

  const handleCancel = () => {
    setInputValue("");
    setisSaveMenu(false);
  };

  if (!isSaveMenu) return null;

  return (
    <div id="overlay">
      <div className="menu">
        <img src="/logic-gates-lab/guide.png" alt="Guide" />
        <input
          type="text"
          placeholder="Enter URL"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
    </div>
  );
};

export default SaveMenu;
