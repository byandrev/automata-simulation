function createAutomata() {
  const automata = {
    states: [],
    alphabet: [],
    transitions: [],
    initialState: "",
    finalStates: [],
  };
  return automata;
}

function clearAutomata(automata) {
  automata.states = [];
  automata.alphabet = [];
  automata.transitions = [];
  automata.initialState = "";
  automata.finalStates = [];
  return automata;
}

function createTransition(automata, state, symbol, nextState) {
  automata.transitions.push({ state, symbol, nextState });
  return automata;
}

export { createAutomata, createTransition, clearAutomata };
