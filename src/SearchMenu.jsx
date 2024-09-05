import React, { useState, useEffect } from "react";

const SearchMenu = ({ setSearchingMask }) => {
  const [name, setName] = useState("");
  const [inputs, setInputs] = useState("");
  const [outputs, setOutputs] = useState("");
  const [shouldSearch, setShouldSearch] = useState(false);

  const handleSearch = () => {
    const newSearchingMask = { name: name, inputs: inputs, outputs: outputs };
    setSearchingMask(newSearchingMask);
  };

  useEffect(() => {
    if (shouldSearch) {
      handleSearch();
      setShouldSearch(false);
    }
  }, [name, inputs, outputs, shouldSearch]);

  const reset = () => {
    setName("");
    setInputs("");
    setOutputs("");
    setShouldSearch(true);
  };

  return (
    <div className="search-menu">
      <div className="search-container">
        <div className="search-field">
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="search-field">
          <label>Inputs:</label>
          <input type="number" value={inputs} min="0" onChange={(e) => setInputs(e.target.value)} />
        </div>

        <div className="search-field">
          <label>Outputs:</label>
          <input
            type="number"
            value={outputs}
            min="0"
            onChange={(e) => setOutputs(e.target.value)}
          />
        </div>
      </div>
      <div>
        <button onClick={handleSearch}>
          <img src="/logic-gates-lab/find.png" />
        </button>
        <button onClick={reset}>
          <img src="/logic-gates-lab/reset.png" />
        </button>
      </div>
    </div>
  );
};

export default SearchMenu;
