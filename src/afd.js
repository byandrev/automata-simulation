import { animateNode, renderError, renderOut } from "./animateNode.js";
const header = document.querySelector("#table thead tr");

function verifyAFD(paper, graph, automata, string) {
  let i = 0;
  let state = automata.initialState;
  let symbol = string[i];
  const tableResult = document.getElementById("table");
  const principalRow = document.getElementById("body");
  const statesSaved = new Set();
  const statesIndex = new Array();
  const row = document.querySelector("tbody");
  row.innerHTML = "";
  reload(tableResult);

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


    if (symbol[0] && !statesSaved.has(isState.symbol[0])) {
      
      statesIndex.push(isState.symbol[0]);
      const column = document.createElement("th");
      column.textContent = isState.symbol[0];
      column.classList.add("px-6", "py-3", "bg-gray-300");
     

      statesSaved.add(isState.symbol[0]);

      header.appendChild(column);
      tableResult.appendChild(header);
    }

    if (!statesSaved.has(isState.state)) {
      statesSaved.add(isState.state);
    

      const newRow = document.createElement("tr");
      const newRowState = document.createElement("th");
      newRowState.textContent = isState.state;
      newRowState.classList.add(
        "px-6",
        "py-4",
        "font-medium",
        "text-gray-900",
        "whitespace-nowrap"
      );

      newRow.appendChild(newRowState);

      const nextState = document.createElement("th");
      nextState.textContent = isState.nextState; 
      nextState.classList.add(
        "px-6",
        "py-4",
        "font-medium",
        "text-gray-900",
        "whitespace-nowrap"
      );
      let index = statesIndex.indexOf(isState.symbol[0]);
      while (index > 0) {
        const nextState = document.createElement("th");
        nextState.textContent = "{}"; 
        nextState.classList.add(
          "px-6",
          "py-4",
          "font-medium",
          "text-gray-900",
          "whitespace-nowrap"
        );
        newRow.appendChild(nextState);
        index--;
      }

      newRow.appendChild(nextState);
      principalRow.appendChild(newRow);
      tableResult.appendChild(principalRow);
    }

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


function reload(tableResult){
  header.innerHTML = "";
  const column = document.createElement("th");
  column.textContent = "States";
  column.classList.add("px-6", "py-3", "bg-gray-300");
  header.appendChild(column);
  tableResult.appendChild(header);
};

