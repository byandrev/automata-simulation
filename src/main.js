import Split from "split.js";
import { verifyAFD } from "./afd.js";
import { renderError, renderOut, renderOutString } from "./animateNode.js";
import { createAutomata, clearAutomata } from "./automata.js";
import { startDragTools } from "./dragTools.js";
import { CANVAS_HEIGHT, initGraph } from "./graph.js";
import { CircleShape, FILL_NODE_FINAL, NODE_WIDTH } from "./shapes.js";
import MicroModal from "micromodal"; // es6 module

const { graph, paper } = initGraph();
const inputString = document.querySelector("#input-string");
const inputEl = document.querySelector("#input-label-name");
const inputLabel = document.querySelector("#input-label-name");
const inputState = document.querySelector("#input-state-name");
const btnClearAll = document.querySelector("#btn-clear-all");

const automata = createAutomata();

function run() {
  const data = graph.toJSON();
  const elements = paper.model.getElements();
  const states = {};
  const finalStates = [];
  const alphabet = [];
  const string = inputString.value;
  const statesArr = [];
  const transitions = [];

  // clear errors
  renderError(null);

  elements.forEach((el) => {
    if (el.attributes.type === "Circle") {
      states[el.attributes.id] = {
        text: el.attributes.attrs.label.text,
        id: el.attributes.id,
      };

      if (el.attributes.attrs.body.fill === FILL_NODE_FINAL) {
        finalStates.push(el.attributes.attrs.label.text);
      }
    }
  });

  data.cells.forEach((el) => {
    if (el.type === "Link") {
      alphabet.push(...el.labels[0].attrs.text.text.split(","));

      transitions.push({
        state: states[el.source.id].text,
        symbol: el.labels[0].attrs.text.text.split(",") || "transition",
        nextState: states[el.target.id].text,
      });
    }
  });

  Object.values(states).forEach((state) => statesArr.push(state.text));

  if (statesArr.length <= 0) {
    renderError("No states");
    return;
  }

  if (!statesArr.includes("q0")) {
    renderError("Initial state not found: q0");
    return;
  }

  automata.alphabet = alphabet;
  automata.initialState = "q0";
  automata.states = statesArr;
  automata.finalStates = finalStates;
  automata.transitions = transitions;

  console.log(automata);

  renderOut("Loading ...");
  renderOutString(string);
  verifyAFD(paper, graph, automata, string);
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

window.addEventListener("DOMContentLoaded", () => {
  MicroModal.init();
  Split(["#paper", "#split-1"], { sizes: [80, 20], minSize: 300 });

  startDragTools(graph);

  const circle = new CircleShape({
    position: { x: 50, y: CANVAS_HEIGHT / 2 - NODE_WIDTH },
    attrs: { label: { text: "q0" } },
  });

  circle.addTo(graph);

  document.querySelector("#run").addEventListener("click", run);
});

// RESIZE WINDOW
window.addEventListener("resize", () => {
  paper.setDimensions(document.body.clientWidth);
});

// Button change label name
// document.querySelector("#btn-label-name").addEventListener("click", () => {});

inputLabel.addEventListener("keydown", (e) => {
  if (e.code === "Enter") {
    changeLabelName();
  }
});

// Button change state name
// document
//   .querySelector("#btn-state-name")
//   .addEventListener("click", changeStateName);

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
