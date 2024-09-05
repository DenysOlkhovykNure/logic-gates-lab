class TreeNode {
  constructor(value, idObject, idConnector) {
    this.value = value;
    this.idObject = idObject;
    this.idConnector = idConnector;
    this.children = [];
    this.isCopy = false;
    this.idAncestor = 0;
    this.ancestorValues = new Set();
  }

  addChild(node) {
    this.children.push(node);
  }
}

class Tree {
  constructor(rootValue) {
    this.root = new TreeNode(rootValue);
    this.flag = false;
    this.count = 0;
  }

  setKey(idObject, idConnector) {
    this.key = `${idObject}_${idConnector}`;
  }

  findMinChildNode(node = this.root, ancestors = new Set()) {
    let minNode = node;
    let minValue = Number.isInteger(parseInt(node.value)) ? parseInt(node.value, 10) : Infinity;
    const nodeKey = `${node.idObject}_${node.idConnector}`;

    node.ancestorValues = new Set(ancestors);
    if (nodeKey !== "undefined_undefined") {
      node.ancestorValues.add(nodeKey);
    }

    if (node.children.length > 0) {
      for (const child of node.children) {
        const { minNode: childMinNode, minValue: childMinValue } = this.findMinChildNode(
          child,
          node.ancestorValues
        );

        if (childMinValue < minValue) {
          minNode = childMinNode;
          minValue = childMinValue;
        }
      }
    }

    if (minNode.idObject === undefined) {
      if (minNode.ancestorValues.has(this.key)) {
        minNode.isCopy = true;
        minNode.idAncestor = this.key;
      } else {
        minNode.isCopy = false;
      }
    }

    return { minNode, minValue };
  }

  replaceInputs(str, lastNumber) {
    const replacementMap = {};
    const regex = /v(\d)/g;

    const newStr = str.replace(regex, (match, p1) => {
      if (!(p1 in replacementMap)) {
        replacementMap[p1] = lastNumber++;
      }
      return replacementMap[p1];
    });
    return { str: newStr, lastNumber };
  }

  connectFormula(str, lastNumber, formula) {
    if (str === "") {
      const result = this.replaceInputs(formula, lastNumber);
      str = result.str;
      lastNumber = result.lastNumber;
    } else {
      const regex = /\b(\d+)\b/g;
      const numbers = [];
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (regex.lastIndex === match.index + match[0].length || str[match.index - 1] === "(") {
          numbers.push(match[1]);
        }
      }
      if (numbers.length > 0) {
        const minNumber = Math.min(...numbers.map(Number));
        const minNumberStr = minNumber.toString();
        const newRegex = new RegExp(`\\b${minNumberStr}\\b`, "g");
        str = str.replace(newRegex, formula);
        const result = this.replaceInputs(str, lastNumber);
        str = result.str;
        lastNumber = result.lastNumber;
      }
    }
    return { str, lastNumber };
  }

  generateFormulaFromTree(replacementMap) {
    let str = "";
    let lastNumber = Object.keys(replacementMap).length;
    const queue = [this.root];

    while (queue.length > 0) {
      const node = queue.shift();

      let sum = 0;
      if (/o\d/.test(node.value)) {
        if (node.idAncestor !== 0) {
          this.flag = false;
          this.count = 0;
          this.traverseAndCount(node.idAncestor, node.ancestorValues, this.root);
          sum = this.count;
          node.value = node.value.replace(/o\d/, `o${sum - 1}`);
        }
      }

      const result = this.connectFormula(str, lastNumber, node.value);
      str = result.str;
      lastNumber = result.lastNumber;

      if (node.children.length > 0) {
        for (const child of node.children) {
          queue.push(child);
        }
      }
    }

    return str;
  }

  traverseAndCount(idAncestor, ancestorValues, node) {
    const keywords = ["AND", "OR", "NOT", "BUFFER"];
    console.log(node.value, this.flag, this.count);

    if (idAncestor === `${node.idObject}_${node.idConnector}` && /o\d/.test(node.value)) {
      this.flag = true;
    }

    for (const child of node.children) {
      this.traverseAndCount(idAncestor, ancestorValues, child);
    }

    if (this.flag) {
      for (const word of keywords) {
        const regex = new RegExp(`\\b${word}\\b`, "g");
        this.count += (node.value.match(regex) || []).length;
      }
    }

    if (idAncestor === `${node.idObject}_${node.idConnector}` && !/o\d/.test(node.value)) {
      this.flag = false;
    }
  }
}

const updateFormula = (tree, lastNumber, formula, idObject, idConnector, numberOfChildren) => {
  tree.setKey(idObject, idConnector);

  const { minNode } = tree.findMinChildNode();

  if (!minNode.isCopy) {
    minNode.value = formula;
    minNode.idObject = idObject;
    minNode.idConnector = idConnector;
    for (let i = 0; i < numberOfChildren; i++) {
      const newNode = new TreeNode(lastNumber.toString());
      minNode.addChild(newNode);
      lastNumber++;
    }
  } else {
    minNode.value = "o" + minNode.idAncestor[0];
    minNode.idObject = idObject;
    minNode.idConnector = idConnector;
  }
  tree.findMinChildNode();
  return lastNumber;
};

export const generateFormula = (gates, lamps, buttons, links) => {
  const result = [];
  let lastNumber = 1;
  const formula = [];

  for (let i = 0; i < lamps.length; i++) {
    const lampId = lamps[i].id;
    result[i] = [];
    formula[i] = new Tree(lastNumber.toString());
    for (let j = 0; j < links.length; j++) {
      if (links[j].idObject1 === lampId) {
        let element = {
          id: links[j].id,
          inObject: links[j].idObject1,
          inConector: links[j].idConnector1,
          outObject: links[j].idObject2,
          outConector: links[j].idConnector2,
        };
        result[i].push(element);
      } else if (links[j].idObject2 === lampId) {
        let element = {
          id: links[j].id,
          inObject: links[j].idObject2,
          inConector: links[j].idConnector2,
          outObject: links[j].idObject1,
          outConector: links[j].idConnector1,
        };
        result[i].push(element);
      }
    }
  }

  const processLinks = (currentLinks, currentFormula) => {
    const newResult = [];

    for (let i = 0; i < currentLinks.length; i++) {
      const but = buttons.find((but) => but.id === currentLinks[i].outObject);
      const gate = gates.find((gate) => gate.id === currentLinks[i].outObject);

      if (but) {
        lastNumber = updateFormula(formula[currentFormula], lastNumber, "b" + but.id, but.id, 0, 0);
      } else if (gate) {
        const outputIndex = gate.connectors.findIndex(
          (connector) => connector.id === currentLinks[i].outConector
        );
        const connectors = gate.connectors;
        let counter = 0;
        for (const connector of connectors) {
          if (connector.type === "input") {
            counter++;
          }
        }

        let copyLastNumber = lastNumber;
        lastNumber = updateFormula(
          formula[currentFormula],
          lastNumber,
          gate.formula[outputIndex],
          gate.id,
          outputIndex,
          counter
        );
        if (copyLastNumber !== lastNumber) {
          for (const connector of connectors) {
            if (connector.type === "input") {
              for (const link of links) {
                if (link.idObject1 === gate.id && link.idConnector1 === connector.id) {
                  let element = {
                    id: link.id,
                    inObject: link.idObject1,
                    inConector: link.idConnector1,
                    outObject: link.idObject2,
                    outConector: link.idConnector2,
                  };
                  newResult.push(element);
                }
                if (link.idObject2 === gate.id && link.idConnector2 === connector.id) {
                  let element = {
                    id: link.id,
                    inObject: link.idObject2,
                    inConector: link.idConnector2,
                    outObject: link.idObject1,
                    outConector: link.idConnector1,
                  };
                  newResult.push(element);
                }
              }
            }
          }
        }
      }
    }
    return newResult;
  };

  for (let i = 0; i < result.length; i++) {
    let currentLinks = result[i];
    lastNumber = 1;
    let protectionFromInfinityCycle = 0;
    while (currentLinks.length > 0 && protectionFromInfinityCycle < 30) {
      currentLinks = processLinks(currentLinks, i);
      protectionFromInfinityCycle++;
    }
  }

  let replacementMap = {};
  let finalFormula = [];
  for (let i = 0; i < formula.length; i++) {
    finalFormula[i] = formula[i].generateFormulaFromTree(replacementMap);
  }
  return finalFormula;
};
