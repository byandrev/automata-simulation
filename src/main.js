import Split from "split.js";
import { verifyAFD } from "./afd.js";
import { renderOut, renderOutString } from "./animateNode.js";
import { createAutomata } from "./automata.js";
import { startDragTools } from "./dragTools.js";
import { CANVAS_HEIGHT, initGraph } from "./graph.js";
import { CircleShape, FILL_NODE_FINAL, NODE_WIDTH } from "./shapes.js";
import MicroModal from "micromodal"; // es6 module

const { graph, paper } = initGraph();
const inputString = document.querySelector("#input-string");
const inputEl = document.querySelector("#input-label-name");

function run() {
  const data = graph.toJSON();
  const elements = paper.model.getElements();
  const states = {};
  const finalStates = [];
  const alphabet = [];
  const string = inputString.value;
  const statesArr = [];
  const transitions = [];

  const automata = createAutomata();

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
    alert("No states");
    return;
  }

  console.log(transitions);

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

document.querySelector("#btn-label-name").addEventListener("click", () => {
  const inputLabel = document.querySelector("#input-label-name");
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
});
