function createMachine() {
    const machine = {
      states: [],
      alphabet: [],
      transitions: [],
      moveSet: [],
      initialState: "",
      finalStates: [],
    };
    return machine;
  }
  
  function clearMachine(automata) {
    machine.states = [];
    machine.alphabet = [];
    machine.transitions = [];
    moveSet = [];
    machine.initialState = "";
    machine.finalStates = [];
    return machines;
  }
  
  function createTMTransition(automata, state, symbol, nextState) {
    machine.transitions.push({ state, symbol, nextState });
    return machine;
  }
  
  export { createMachine, createTMTransition, clearMachine };
  