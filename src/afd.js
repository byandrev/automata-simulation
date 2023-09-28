import { animateNode, renderOut } from "./animateNode.js";

function verifyAFD(paper, graph, automata, string) {
  let i = 0;
  let state = automata.initialState;
  let symbol = string[i];

  const interval = setInterval(() => {
    if (i >= string.length) {
      clearInterval(interval);

      if (automata.finalStates.includes(state)) {
        renderOut("VALID");
        return;
      }

      renderOut("INVALID");
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

    animateNode(paper, graph, state, symbol);

    i++;
    state = isState.nextState;
    symbol = string[i];
  }, 1000);
}

export { verifyAFD };
