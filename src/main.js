import MicroModal from "micromodal";
import Split from "split.js";
// import { verifyAFD } from "./afd.js";
import { verifyAFND } from "./afnd.js";
import { renderError, renderOut, renderOutString } from "./animateNode.js";
import { clearAutomata, createAutomata } from "./automata.js";
import { startDragTools } from "./dragTools.js";
import { initGraph } from "./graph.js";
import { CircleShape, FILL_NODE_FINAL } from "./shapes.js";
import download from "./utils/download.js";

const { graph, paper } = initGraph();
const inputString = document.querySelector("#input-string");
// const inputEl = document.querySelector("#input-label-name");
const inputLabel = document.querySelector("#input-label-name");
const inputState = document.querySelector("#input-state-name");
const btnClearAll = document.querySelector("#btn-clear-all");
const btnDownload = document.querySelector("#btn-download");
const header = document.querySelector("#table thead tr");
const automata = createAutomata();

function run() {
  const data = graph.toJSON();
  const elements = paper.model.getElements();
  const states = {};
  const finalStates = [];
  const alphabet = [];
  const string = inputString.value;
  const statesArr = [];
  const transitions = {};
  const tableResult = document.getElementById("table");
  
  const principalRow = document.getElementById("body");
  const row = document.querySelector("tbody");
  const symbolIndex = new Array();
  
  

  // clear errors
  renderError(null);

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

      el.labels[0].attrs.text.text.split(",").forEach((symbol) => {
        if (transitions[states[el.source.id].text].length >= 0) {
          transitions[states[el.source.id].text].push([
            states[el.target.id].text,
            symbol,
          ]);
        } else {
          transitions[states[el.source.id].text] = [
            [states[el.target.id].text, symbol],
          ];
        }
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


  
  
  
  //Transition table
  row.innerHTML = "";
  reload(tableResult, header);

  //console.log(automata.alphabet);
  automata.alphabet.forEach((x) => {
    if(symbolIndex.indexOf(x) == -1){
    symbolIndex.push(x);
    const column = document.createElement("th");
    column.textContent = x;
    column.classList.add("px-6", "py-3", "bg-gray-300");
    header.appendChild(column);
    tableResult.appendChild(header);
    }
  });

  let index = 0;
  
  
  //Add States in a Row
  //automata.states.forEach((x) => {
    for(let i = 0; i < automata.states.length; i++){
    const newRow = document.createElement("tr");
    const newRowState = document.createElement("th");
    newRowState.textContent = automata.states[i];
    newRowState.classList.add(
      "px-6",
      "py-4",
      "font-medium",
      "text-gray-900",
      "whitespace-nowrap"
    );
    
    //State in column State
    newRow.appendChild(newRowState);
    const infoStates = []

    
    //Get nextState
    const states =  Object.values(automata.transitions);
    console.log(states[index], index);
    let stateNumber = states[index].length;
  
    //Iterate States
    let elements;
    

    for(let i=0; i < stateNumber; i++){
      let info = states[index][i][0];
      console.log("Info", info);
      let found = symbolIndex.indexOf(states[index][i][1]);
      console.log("Simbolo", states[index][i][1]);
      //console.log("Simbolo ", found);
      if(infoStates[found]){
        infoStates[found] += "," + info;
        elements = infoStates[found];
      }else{
        infoStates[found] = info;
      }
      }

      if(elements){automata.states.push(elements);}
      //console.log("Elementos", elements)

      index++;
      
      let count = 0;
      infoStates.forEach((x) => {
      const newRowState1 = document.createElement("th");
      newRowState1.textContent = x;
      newRowState1.classList.add(
        "px-6",
        "py-4",
        "font-medium",
        "text-gray-900",
        "whitespace-nowrap"
      );

      let size = infoStates.length;
      let indexState = infoStates.indexOf(x);
      console.log(x);
      while (size--) {
        const aux = document.createElement("th");
        if(count == indexState){
          newRow.appendChild(newRowState1);
          count++;
          break;
        }else{
          newRow.appendChild(aux);
        }
        count++;
      }
      principalRow.appendChild(newRow);
      tableResult.appendChild(principalRow);
    });
   // });
  }

    

  renderOut("Loading ...");
  renderOutString(string);
  // verifyAFD(paper, graph, automata, string);

  const res = verifyAFND(paper, graph, automata, string);
  console.log(res);
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

function reload(tableResult, header){
  header.innerHTML = "";
  const column = document.createElement("th");
  column.textContent = "States";
  column.classList.add("px-6", "py-3", "bg-gray-300");
  header.appendChild(column);
  tableResult.appendChild(header);
};

window.addEventListener("DOMContentLoaded", () => {
  MicroModal.init();
  Split(["#paper", "#split-1"], { sizes: [80, 20], minSize: 300 });

  startDragTools(graph);

  const circle = new CircleShape({
    position: { x: 50, y: 250 },
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

// Download png
btnDownload.addEventListener("click", download);
