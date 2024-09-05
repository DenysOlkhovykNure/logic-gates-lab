export const formula = [
  ["(v0)AND(v1)"],
  ["(v0)OR(v1)"],
  ["NOT(v0)"],
  ["BUFFER(v0)"],
  ["((NOT(v0))AND(v1))OR((v0)AND(NOT(v1)))"],
  ["NOT((v0)OR(v1))"],
  ["NOT((v0)AND(v1))"],
  ["NOT((v0)OR(NOT((o3)OR(v1))))", "NOT((NOT((v0)OR(o3)))OR(v1))"],
  [
    "((NOT(((NOT(v0))AND(v1))OR((v0)AND(NOT(v1)))))AND(v2))OR((((NOT(v0))AND(v1))OR((v0)AND(NOT(v1))))AND(NOT(v2)))",
    "((((NOT(v0))AND(v1))OR((v0)AND(NOT(v1))))AND(v2))OR((v0)AND(v1))",
  ],
];

// "NOT((NOT((NOT((v0)AND(v1)))AND(o7)))AND(NOT((NOT((v0)AND(v1)))AND(v1))))"
// "NOT((NOT((v0)AND(v1)))AND(NOT((o7)AND(NOT((NOT((v0)AND(v1)))AND(v1))))))"

//"(NOT((v0)OR(NOT((o3)OR(v1)))))OR(NOT((NOT((v0)OR(o3)))OR(v1)))"

export const img = [
  "/logic-gates-lab/and 2-1.png",
  "/logic-gates-lab/or 2-1.png",
  "/logic-gates-lab/not 1-1.png",
  "/logic-gates-lab/buffer 1-1.png",
  "/logic-gates-lab/xor 2-1.png",
  "/logic-gates-lab/nor 2-1.png",
  "/logic-gates-lab/nand 2-1.png",
  "/logic-gates-lab/rs trigger 2-2.png",
  "/logic-gates-lab/sum 3-2.png",
];

export const connectors = [
  [
    { id: 1, type: "output", top: 11, left: 83 },
    { id: 2, type: "input", top: 1, left: -8 },
    { id: 3, type: "input", top: 21, left: -8 },
  ],
  [
    { id: 1, type: "output", top: 11, left: 83 },
    { id: 2, type: "input", top: 1, left: -8 },
    { id: 3, type: "input", top: 21, left: -8 },
  ],
  [
    { id: 1, type: "output", top: 13, left: 83 },
    { id: 2, type: "input", top: 13, left: -10 },
  ],
  [
    { id: 1, type: "output", top: 13, left: 83 },
    { id: 2, type: "input", top: 13, left: -10 },
  ],
  [
    { id: 1, type: "output", top: 11, left: 83 },
    { id: 2, type: "input", top: 1, left: -8 },
    { id: 3, type: "input", top: 21, left: -8 },
  ],
  [
    { id: 1, type: "output", top: 11, left: 83 },
    { id: 2, type: "input", top: 1, left: -8 },
    { id: 3, type: "input", top: 21, left: -8 },
  ],
  [
    { id: 1, type: "output", top: 11, left: 83 },
    { id: 2, type: "input", top: 1, left: -8 },
    { id: 3, type: "input", top: 21, left: -8 },
  ],
  [
    { id: 1, type: "output", top: 13, left: 166.5 },
    { id: 2, type: "output", top: 95, left: 166.5 },
    { id: 3, type: "input", top: 1.5, left: -4 },
    { id: 4, type: "input", top: 105, left: -4 },
  ],
  [
    { id: 1, type: "output", top: 30, left: 272.5 },
    { id: 2, type: "output", top: 139, left: 272.5 },
    { id: 3, type: "input", top: 5.5, left: -7 },
    { id: 4, type: "input", top: 32.5, left: -7 },
    { id: 5, type: "input", top: 60, left: -7 },
  ],
];

export let names = [
  { id: 0, name: "AND", inputs: 2, outputs: 1 },
  { id: 1, name: "OR", inputs: 2, outputs: 1 },
  { id: 2, name: "NOT", inputs: 1, outputs: 1 },
  { id: 3, name: "BUFFER", inputs: 1, outputs: 1 },
  { id: 4, name: "XOR", inputs: 2, outputs: 1 },
  { id: 5, name: "NOR", inputs: 2, outputs: 1 },
  { id: 6, name: "NAND", inputs: 2, outputs: 1 },
  { id: 7, name: "RS-Trigger", inputs: 2, outputs: 2 },
  { id: 8, name: "Sum", inputs: 3, outputs: 2 },
];

export let highlight = [false, false, false, false, false, false, false, false, false];

const GateButtons = ({ ObjectId, setObjectId, gates, setGates, searchingMask }) => {
  const addGate = (index) => {
    const position = { top: 150, left: 300 };
    const newGate = {
      id: ObjectId,
      connectors: connectors[index],
      formula: formula[index],
      img: img[index],
      isSelected: false,
      position: position,
    };

    highlight[index] = false;
    setObjectId(ObjectId + 1);
    setGates([...gates, newGate]);
  };

  const formatText = (count, single, plural) => {
    if (count === 0) return "";
    if (count === 1) return `${count} ${single}`;
    return `${count} ${plural}`;
  };

  const filteredNames = names.filter((gate) => {
    const nameMatches = gate.name.toLowerCase().includes(searchingMask.name.toLowerCase());
    const inputsMatch = searchingMask.inputs === 0 || gate.inputs >= searchingMask.inputs;
    const outputsMatch = searchingMask.outputs === 0 || gate.outputs >= searchingMask.outputs;

    return nameMatches && inputsMatch && outputsMatch;
  });

  return (
    <div>
      {filteredNames.map((gate, id) => (
        <button
          key={gate.id}
          onClick={() => addGate(gate.id)}
          className={highlight[gate.id] ? "highlighted-button" : ""}
        >
          <img src={img[gate.id]} alt={gate.name} />
          <div>
            {gate.name}
            <div className="characteristics">
              {`${formatText(gate.inputs, "Input", "Inputs")}${
                gate.inputs > 0 && gate.outputs > 0 ? ", " : ""
              }${formatText(gate.outputs, "Output", "Outputs")}`}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default GateButtons;
