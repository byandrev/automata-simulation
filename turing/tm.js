import MicroModal from "micromodal";

import { animateNode } from "../src/animateNode.js";
import { clearAutomata, createAutomata } from "../src/automata.js";
import { startDragTools } from "../src/dragTools.js";
import { initGraph } from "../src/graph.js";
import { CircleShape, FILL_NODE_FINAL } from "../src/shapes.js";
import download from "../src/utils/download.js";

const { graph, paper } = initGraph();
const inputString = document.querySelector("#input-string");
const inputLabel = document.querySelector("#input-label-name");
const inputState = document.querySelector("#input-state-name");
const btnClearAll = document.querySelector("#btn-clear-all");
const btnDownload = document.querySelector("#btn-download");
const btnLoad = document.querySelector("#btn-load");
const btnRun = document.querySelector("#btn-run");
const tapeItems = document.querySelectorAll("#tape > .tape-item");

let tape = Array(200).fill("");
let head = parseInt(tape.length / 2);
let running = false;

const machine = createAutomata();

function run() {
  const LIMIT = 100;
  const steps = [];

  running = true;

  let currentTape = Array(200).fill("");
  let currentHead = parseInt(currentTape.length / 2);
  let input = inputString.value;

  head = parseInt(tape.length / 2);
  loadTape(input, currentTape);
  loadTape(input, tape);

  const verify = (machine) => {
    let currentState = machine.initialState;
    let currentSymbol = "";

    if (machine.finalStates.includes(currentState)) {
      return true;
    }

    let i = 0;

    while (!machine.finalStates.includes(currentState) && i < LIMIT) {
      currentSymbol = currentTape[currentHead];

      const state = currentState
        ? machine.transitions[currentState].filter(
            (el) => el[1] == currentSymbol
          )
        : [];

      // Transicion
      if (state && state.length === 1) {
        const [nextState, symbol, moveTape, symbolToTape] = state[0];

        steps.push([
          currentState,
          symbol,
          nextState,
          currentTape[currentHead],
          moveTape,
          symbolToTape,
        ]);

        setTape(symbolToTape, currentTape, currentHead);

        if (moveTape === "R") {
          currentHead++;
        } else {
          currentHead--;
        }

        currentState = nextState;
      } else {
        break;
      }

      // console.log(i);
      i++;
    }
  };

  running = false;
  const res = verify(machine);

  console.log("Resultado: " + res);
  console.log(steps);

  console.log("Tape: ");
  console.log(currentTape);

  console.log("Head: ", currentHead);

  let indexStep = 0;

  const interval = setInterval(() => {
    if (indexStep >= steps.length) {
      running = false;
      clearInterval(interval);
      return;
    }

    const step = steps[indexStep];
    console.log(step);
    setTape(step[5], tape, head);
    moveTape(step[4] === "R" ? "right" : "left", tape, head);
    renderTape(tape, head);
    console.log("Head => ", head);

    console.log(tape);

    animateNode(
      paper,
      graph,
      step[0],
      step[1],
      machine.finalStates.includes(step[0]),
      step[2]
    );

    indexStep++;
  }, 1000);
}

function loadTape(input, tape) {
  head = parseInt(tape.length / 2);

  clearTapeDisplay();

  renderTape(tape, head);

  for (let i = 0; i < input.length; i++) {
    tape[head + i] = input[i];
  }

  for (let i = 0; i < tape.length && i + 5 < tapeItems.length; i++) {
    tapeItems[i + 5].textContent = tape[head + i];
  }
}

function loadMachine() {
  // Load Automata in Machine
  const data = graph.toJSON();
  const elements = paper.model.getElements();
  const states = {};
  const finalStates = [];
  const alphabet = [];
  const statesArr = [];
  const transitions = {};

  // clear errors
  // renderError(null);

  elements.forEach((el) => {
    if (el.attributes.type === "Circle") {
      states[el.attributes.id] = {
        text: el.attributes.attrs.label.text,
        id: el.attributes.id,
      };

      transitions[el.attributes.attrs.label.text] = {};

      if (el.attributes.attrs.body.fill === FILL_NODE_FINAL) {
        finalStates.push(el.attributes.attrs.label.text);
      }
    }
  });

  data.cells.forEach((el) => {
    if (el.type === "Link") {
      alphabet.push(...el.labels[0].attrs.text.text.split(","));

      el.labels[0].attrs.text.text.split(",").forEach((allLabel) => {
        const label = allLabel.split(";");

        if (label.length < 3) {
          alert("Connection error");
          return;
        }

        if (transitions[states[el.source.id].text].length >= 0) {
          transitions[states[el.source.id].text].push([
            states[el.target.id].text,
            label[0],
            label[1],
            label[2],
          ]);
        } else {
          transitions[states[el.source.id].text] = [
            [states[el.target.id].text, label[0], label[1], label[2]],
          ];
        }
      });
    }
  });

  Object.values(states).forEach((state) => statesArr.push(state.text));

  if (statesArr.length <= 0) {
    // renderError("No states");
    alert("NO states");
    return;
  }

  if (!statesArr.includes("q0")) {
    // renderError("Initial state not found: q0");
    alert("Initial state not found: q0");
    return;
  }

  machine.alphabet = alphabet;
  machine.initialState = "q0";
  machine.states = statesArr;
  machine.finalStates = finalStates;
  // [nextState, symbol, moveTape, setTape]
  machine.transitions = transitions;
}

function moveTape(direction = "right") {
  if (direction === "right") head += 1;
  else head -= 1;

  for (let i = 0; i < tape.length && i < tapeItems.length; i++) {
    tapeItems[i].textContent = tape[head + i - 5];
  }
}

function setTape(element, tape, head) {
  tape[head] = element;
}

function renderTape(tape, head) {
  for (let i = 0; i < tape.length && i < tapeItems.length; i++) {
    tapeItems[i].textContent = tape[head + i - 5];
  }
}

function changeLabelName() {
  const id = inputLabel.getAttribute("link-id");
  const currentLink = graph.getLinks().find((link) => link.id === id);

  currentLink.label(0, {
    attrs: {
      text: {
        text: inputLabel.value || "λ",
      },
    },
  });

  inputLabel.value = "";
  MicroModal.close("modal-label-name");
}

function changeStateName() {
  const id = inputState.getAttribute("state-id");
  const data = paper.model.getElements().find((el) => {
    return el.id === id;
  });

  if (data) data.attr("label/text", inputState.value);

  inputState.value = "";
  MicroModal.close("modal-state-name");
}

function clearTapeDisplay() {
  for (let i = 0; i < tapeItems.length; i++) {
    tapeItems[i].textContent = "";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  MicroModal.init();

  startDragTools(graph);

  const circle = new CircleShape({
    position: { x: 50, y: 250 },
    attrs: { label: { text: "q0" } },
  });

  circle.addTo(graph);

  // document.querySelector("#run").addEventListener("click", run);
});

// RESIZE WINDOW
window.addEventListener("resize", () => {
  paper.setDimensions(document.body.clientWidth);
});

inputLabel.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    changeLabelName();
  }
});

inputState.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    changeStateName();
  }
});

// Clear all
btnClearAll.addEventListener("click", () => {
  clearAutomata(automata);
  graph.clear();
});

// Run
btnRun.addEventListener("click", () => {
  if (running) return;

  loadMachine();
  run();
});

btnLoad.addEventListener("click", () => {
  tape = Array(200).fill("");
  loadTape(inputString.value, tape);
});
btnDownload.addEventListener("click", download);
