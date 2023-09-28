import { animateNode, renderError, renderOut } from "./animateNode.js";

function verifyAFD(paper, graph, automata, string) {
  let i = 0;
  let state = automata.initialState;
  let symbol = string[i];

  const interval = setInterval(() => {
    animateNode(
      paper,
      graph,
      state,
      symbol,
      automata.finalStates.includes(state)
    );

    if (i >= string.length) {
      clearInterval(interval);

      if (automata.finalStates.includes(state)) {
        renderOut("VALID");
        return;
      }

      renderOut("INVALID");
      renderError("I do not end in a final state");
      return;
    }

    document
      .querySelector("#string-out")
      .querySelector(`span:nth-child(${i + 1})`).className =
      "symbol text-blue-500 font-bold symbol-active";

    const isState = automata.transitions.find(
      (el) => el.state === state && el.symbol.includes(symbol)
    );

    if (!isState) {
      clearInterval(interval);

      renderOut("INVALID");
      return;
    }

    i++;
    state = isState.nextState;
    symbol = string[i];
  }, 1000);
}

export { verifyAFD };
