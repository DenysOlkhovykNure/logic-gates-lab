import React, { useState, useEffect } from "react";
import { formula, img, connectors, names } from "./GateButtons";
import { saveImgToGoogleDrive, saveTxtToGoogleDrive } from "./GoogleDriveSaving";

const SaveMenu = ({ isSaveMenu, setisSaveMenu }) => {
  const [inputValue, setInputValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setInputValue(localStorage.getItem("savedURL"));
  }, []);

  async function SaveToLocalStorage() {
    if (inputValue.trim() === "") {
      alert("Please enter a URL before saving.");
      return;
    }
    localStorage.setItem("savedURL", inputValue);
  }

  async function SaveToGoogleDrive() {
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
    setisSaveMenu(false);
  }

  async function handleSave() {
    setIsLoading(true);
    SaveToLocalStorage();
    if (isChecked) {
      await SaveToGoogleDrive();
    }
    setisSaveMenu(false);
    setIsLoading(false);
  }

  const handleDelete = () => {
    setInputValue("");
    setisSaveMenu(false);
    localStorage.removeItem("savedURL");
  };

  const handleCancel = () => {
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
        <div className="save">
          <button onClick={handleSave}>Save</button>
          <label>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            Upload to Google Drive
          </label>
        </div>
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleCancel}>Cancel</button>
        {isLoading && (
          <div className="loader-container">
            <div className="loader2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveMenu;
