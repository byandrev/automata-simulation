import { animateNode, renderError, renderOut } from "./animateNode.js";

function verifyAFND(paper, graph, automata, string) {
  const steps = [];

  const verify = (afd, currentState, string) => {
    if (string.length <= 0) {
      return afd.finalStates.includes(currentState);
    }

    for (let i = 0; i < afd.transitions[currentState].length; i++) {
      const [nextState, symbol] = afd.transitions[currentState][i];

      if (symbol === string[0]) {
        steps.push([currentState, symbol, nextState, string[0]]);

        if (verify(afd, nextState, string.slice(1))) {
          return true;
        }
      } else if (symbol === "λ") {
        steps.push([currentState, symbol, nextState, string[0]]);

        if (verify(afd, nextState, string)) {
          return true;
        }
      }
    }

    return false;
  };

  const res = verify(automata, automata.initialState, string);

  let indexStep = 0;
  document.querySelector("#string-out").textContent = "";

  const interval = setInterval(() => {
    if (indexStep >= steps.length) {
      if (!res) {
        renderOut("INVALID");
      } else {
        renderOut("VALID");
      }

      clearInterval(interval);
      return;
    }

    const step = steps[indexStep];

    animateNode(
      paper,
      graph,
      step[0],
      step[1],
      automata.finalStates.includes(step[0]),
      step[2],
    );

    // document.querySelector("#string-out").textContent += step[3];

    indexStep++;
  }, 1000);

  return res;
}

export { verifyAFND };
