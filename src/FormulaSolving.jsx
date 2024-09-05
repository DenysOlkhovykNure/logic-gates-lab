export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function applyLogicalOp(a, b, op, variables, operationCounter) {
  if (op === "AND") {
    variables[`o${operationCounter}`] = a && b;
    operationCounter++;
    return [a && b, operationCounter];
  }
  if (op === "OR") {
    variables[`o${operationCounter}`] = a || b;
    operationCounter++;
    return [a || b, operationCounter];
  }
  return [false, operationCounter];
}

async function calculateRemainingOp(values, ops, variables, operationCounter) {
  while (ops.length > 0 && ops[ops.length - 1] !== "(") {
    const op = ops.pop();
    if (op === "NOT") {
      const val = values.pop();
      variables[`o${operationCounter}`] = !val;
      operationCounter++;
      values.push(!val);
    } else if (op === "BUFFER") {
      const val = values.pop();
      await sleep(500);
      variables[`o${operationCounter}`] = val;
      operationCounter++;
      values.push(val);
    } else {
      const val2 = values.pop();
      const val1 = values.pop();
      const [result, newCounter] = applyLogicalOp(val1, val2, op, variables, operationCounter);
      operationCounter = newCounter;
      values.push(result);
    }
  }
  return operationCounter;
}

export async function evaluateLogicalExpression(expression, variables) {
  const values = [];
  const ops = [];
  let operationCounter = 0;
  for (let i = 0; i < expression.length; i++) {
    if (/\s/.test(expression[i])) continue;
    if (/[a-zA-Z0-9]/.test(expression[i])) {
      let varName = "";
      while (i < expression.length && /[a-zA-Z0-9]/.test(expression[i])) {
        varName += expression[i];
        i++;
      }
      if (varName === "AND" || varName === "OR") {
        operationCounter = await calculateRemainingOp(values, ops, variables, operationCounter);
        ops.push(varName);
      } else if (varName === "NOT" || varName === "BUFFER") {
        ops.push(varName);
      } else {
        if (varName.startsWith("o")) {
          let value = varName.slice(1);
          if (
            variables["o" + (parseInt(operationCounter) + parseInt(value)).toString()] !== undefined
          ) {
            values.push(variables["o" + (parseInt(operationCounter) + parseInt(value)).toString()]);
          } else {
            values.push(false);
          }
        } else {
          values.push(variables[varName]);
        }
      }
      i--;
    } else if (expression[i] === "(") {
      ops.push("(");
    } else if (expression[i] === ")") {
      operationCounter = await calculateRemainingOp(values, ops, variables, operationCounter);
      if (ops.length > 0) ops.pop();
    }
  }

  operationCounter = await calculateRemainingOp(values, ops, variables, operationCounter);
  return values[values.length - 1];
}
