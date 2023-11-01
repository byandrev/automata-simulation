import { animateNode, renderError, renderOut } from "./animateNode.js";

function verifyAFND(paper, graph, automata, string) {
  // function epsilonClosure(states) {
  //   const epsilonClosureStates = new Set(states);
  //   const stack = Array.from(states);

  //   while (stack.length > 0) {
  //     const state = stack.pop();

  //     if (automata.transitions[state] && automata.transitions[state]["ε"]) {
  //       for (const nextState of automata.transitions[state]["ε"]) {
  //         if (!epsilonClosureStates.has(nextState)) {
  //           epsilonClosureStates.add(nextState);
  //           stack.push(nextState);
  //         }
  //       }
  //     }
  //   }

  //   return epsilonClosureStates;
  // }

  // function move(states, symbol) {
  //   const nextStates = new Set();

  //   for (const state of states) {
  //     setTimeout(() => {
  //       animateNode(
  //         paper,
  //         graph,
  //         state,
  //         symbol,
  //         automata.finalStates.includes(state)
  //       );

  //       if (
  //         automata.transitions[state] &&
  //         automata.transitions[state][symbol]
  //       ) {
  //         for (const nextState of automata.transitions[state][symbol]) {
  //           nextStates.add(nextState);
  //         }
  //       }
  //     }, 1000);
  //   }
  //   return nextStates;
  // }

  // let i = 0;
  // let currentStates = epsilonClosure(new Set([automata.initialState]));
  // let symbol = string[i];

  // const interval = setInterval(() => {
  //   currentStates = epsilonClosure(move(currentStates, symbol));

  //   if (i >= string.length) {
  //     for (const state of currentStates) {
  //       if (automata.finalStates.includes(state)) {
  //         console.log("YES");
  //         return true;
  //       }
  //     }

  //     clearInterval(interval);
  //   }

  //   i++;
  //   symbol = string[i];
  // }, 1000);

  const getNextStates = (states, symbol) => {
    const nextStates = new Set();

    for (const state of states) {
      if (automata.transitions[state] && automata.transitions[state][symbol]) {
        for (const nextState of automata.transitions[state][symbol]) {
          nextStates.add(nextState);
        }
      }
    }

    return nextStates;
  };

  let currentStates = [automata.initialState];

  const verify = (states, symbol) => {
    let i = 0;
    let state = states[0];

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
        return;
      }

      states = getNextStates(states, symbol);

      if (states.length <= 0) {
        return;
      }

      console.log("Current: ", states);

      i++;
      symbol = string[i];

      verify(states, symbol);
    }, 1000);
  };

  verify(currentStates, string[0]);

  return false;
}

export { verifyAFND };
