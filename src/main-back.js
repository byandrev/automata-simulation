const { dia, shapes, elementTools, linkTools, connectors } = joint;
const { Polygon, Ellipse, Rect, toDeg } = g;
const { TangentDirections } = connectors.curve;

const inputAlphabet = document.querySelector("#input-alphabet");
const inputString = document.querySelector("#input-string");
const outString = document.querySelector("#string-out");

const CANVAS_WIDTH = document.body.clientWidth - 30;
const CANVAS_HEIGHT = document.body.scrollHeight - 100;
const NODE_WIDTH = 50;
const FILL_NODE_FINAL = "#e0e0e0";

// Theme

const highlighterAttributes = {
  stroke: "#4666E5",
  "stroke-width": 2,
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
};

const connectToolAttributes = {
  fill: "none",
  "stroke-width": 10,
  "stroke-opacity": 0.4,
  stroke: "#4666E5",
  cursor: "cell",
};

const lineAttributes = {
  stroke: "#333333",
  strokeWidth: 2,
};

const labelAttributes = {
  textVerticalAnchor: "middle",
  textAnchor: "middle",
  x: "calc(.5*w)",
  y: "calc(.5*h)",
  fill: "#333333",
  fontSize: 13,
  fontWeight: "bold",
  fontFamily: "sans-serif",
  pointerEvents: "none",
};

const bodyAttributes = {
  fill: "#FCFCFC",
  stroke: "#333333",
  strokeWidth: 2,
  cursor: "grab",
};

const ShapeTypes = {
  BASE: "Base",
  CIRCLE: "Circle",
  LINK: "Link",
};

// Setup

const graph = new dia.Graph({}, { cellNamespace: shapes });
const paper = new dia.Paper({
  el: document.getElementById("paper"),
  model: graph,
  cellViewNamespace: shapes,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  gridSize: 1,
  async: true,
  sorting: dia.Paper.sorting.APPROX,
  background: { color: "#F3F7F6" },
  snapLinks: true,
  interactive: { labelMove: false },
  labelsLayer: true,

  highlighting: {
    default: {
      name: "mask",
      options: {
        attrs: {
          ...highlighterAttributes,
        },
      },
    },
  },
  // This demo does not use the connection points
  defaultConnectionPoint: { name: "anchor" },
  connectionStrategy: function (end, view, _, coords) {
    const { x, y } = view.model.getBoundaryPoint(coords);
    end.anchor = {
      name: "topLeft",
      args: {
        dx: x,
        dy: y,
        rotate: true,
      },
    };
  },
  defaultConnector: function (sourcePoint, targetPoint, route, _, linkView) {
    const { model: link } = linkView;
    const targetElement = link.getTargetElement();
    const sourceElement = link.getSourceElement();
    const options = {
      targetDirection: targetElement
        ? targetElement.getCurveDirection(targetPoint)
        : TangentDirections.AUTO,
      sourceDirection: sourceElement
        ? sourceElement.getCurveDirection(sourcePoint)
        : TangentDirections.AUTO,
    };
    return connectors.curve(sourcePoint, targetPoint, route, options, linkView);
  },
  defaultLink: () => new Link(),

  linkView: joint.dia.LinkView.extend({
    pointerdblclick: function (linkView, evt, x, y) {
      const label = prompt("Label name?");
      this.model.label(0, { attrs: { text: { text: label } } });
    },
  }),
});

paper.svg.style.overflow = "visible";
paper.el.style.border = "1px solid #E5E5E5";
paper.on({
  "cell:mouseenter": (view) => {
    addTools(view);
  },
  "cell:mouseleave": (view) => {
    removeTools(view);
  },
});

graph.on({
  add: (cell) => {
    addTools(cell.findView(paper));
  },
});

paper.on("element:pointerdblclick", function (elementView, evt) {
  const currentElement = elementView.model;
  const label = prompt("Label name?");
  currentElement.attr("label/text", label);
});

const BaseShape = dia.Element.define(
  ShapeTypes.BASE,
  {
    z: 1,
  },
  {
    getConnectToolMarkup() {
      return [
        {
          tagName: "rect",
          attributes: {
            ...this.size(),
            ...connectToolAttributes,
          },
        },
      ];
    },

    getCurveDirection() {
      return TangentDirections.AUTO;
    },

    getBoundaryPoint(point, snapRadius = 20) {
      const bbox = this.getBBox();
      const angle = this.angle();
      // Relative to the element's position
      const relPoint = point
        .clone()
        .rotate(bbox.center(), angle)
        .difference(bbox.topLeft());
      const relBBox = new Rect(0, 0, bbox.width, bbox.height);
      if (!relBBox.containsPoint(relPoint)) {
        const relCenter = relBBox.center();
        const relTop = relBBox.topMiddle();
        const relLeft = relBBox.leftMiddle();
        if (Math.abs(relTop.x - relPoint.x) < snapRadius) {
          return relCenter.y > relPoint.y ? relTop : relBBox.bottomMiddle();
        }
        if (Math.abs(relLeft.y - relPoint.y) < snapRadius) {
          return relCenter.x > relPoint.x ? relLeft : relBBox.rightMiddle();
        }
      }
      return this.getClosestBoundaryPoint(relBBox, relPoint);
    },

    getClosestBoundaryPoint(bbox, point) {
      return bbox.pointNearestToPoint(point);
    },

    getTools() {
      return [
        new elementTools.Connect({
          focusOpacity: 0,
          markup: this.getConnectToolMarkup(),
        }),
        new joint.elementTools.Remove({
          x: "0%",
          y: "0%",
          offset: {
            x: 4,
            y: 4,
          },
        }),
      ];
    },
  }
);

const Link = shapes.standard.Link.define(
  ShapeTypes.LINK,
  {
    attrs: {
      line: {
        ...lineAttributes,
      },
    },
    z: 2,
    labels: [
      {
        attrs: {
          text: {
            text: "transition",
            fontWeight: "bold",
          },
        },
      },
    ],
  },
  {
    getTools() {
      return [
        new linkTools.Vertices(),
        new linkTools.Remove(),
        new linkTools.SourceArrowhead(),
        new linkTools.TargetArrowhead(),
      ];
    },
  }
);

const CircleShape = BaseShape.define(
  ShapeTypes.CIRCLE,
  {
    size: { width: NODE_WIDTH, height: NODE_WIDTH },
    attrs: {
      root: {
        highlighterSelector: "body",
      },
      body: {
        cx: "calc(.5*w)",
        cy: "calc(.5*h)",
        rx: "calc(.5*w)",
        ry: "calc(.5*h)",
        ...bodyAttributes,
      },
      label: {
        text: "q",
        ...labelAttributes,
      },
    },
  },
  {
    markup: [
      {
        tagName: "ellipse",
        selector: "body",
      },
      {
        tagName: "text",
        selector: "label",
      },
    ],

    getConnectToolMarkup() {
      const { width, height } = this.size();
      return [
        {
          tagName: "ellipse",
          attributes: {
            rx: width / 2,
            ry: height / 2,
            cx: width / 2,
            cy: height / 2,
            ...connectToolAttributes,
          },
        },
      ];
    },

    getCurveDirection() {
      return TangentDirections.OUTWARDS;
    },

    getClosestBoundaryPoint(bbox, point) {
      const circle = Ellipse.fromRect(bbox);
      return circle.intersectionWithLineFromCenterToPoint(point);
    },
  }
);

const circle = new CircleShape({
  position: { x: 50, y: CANVAS_HEIGHT / 2 - NODE_WIDTH },
  attrs: { label: { text: "q0" } },
});

circle.addTo(graph);

// Tools

function addTools(view) {
  const { paper, model } = view;
  paper.removeTools();
  const tools = new dia.ToolsView({ tools: model.getTools() });
  view.el.classList.add("active");
  view.addTools(tools);
}

function removeTools(view) {
  view.el.classList.remove("active");
  view.removeTools();
}

// RESIZE WINDOW
window.addEventListener("resize", () => {
  paper.setDimensions(document.body.clientWidth - 30, CANVAS_HEIGHT - 100);
});

const $elements = document.querySelectorAll(".element");

$elements.forEach((element) => {
  element.addEventListener("dragstart", (evt) => {
    evt.dataTransfer.setData("text/plain", evt.target.textContent.trim());
  });
});

const $canvas = document.querySelector("#paper");
$canvas.addEventListener("dragenter", dragEnter);
$canvas.addEventListener("dragover", dragOver);
$canvas.addEventListener("dragleave", dragLeave);
$canvas.addEventListener("drop", drop);

// AUTOMATA
const automata = {
  states: [],
  alphabet: [],
  transitions: [],
  initialState: "",
  finalStates: [],
};

function createAutomata(alphabet, states, initialState, finalStates) {
  automata.alphabet = alphabet;
  automata.states = states;
  automata.initialState = initialState;
  automata.finalStates = finalStates;
}

function clearAutomata() {
  automata.states = [];
  automata.alphabet = [];
  automata.transitions = [];
  automata.initialState = "";
  automata.finalStates = [];
}

function createTransition(state, symbol, nextState) {
  automata.transitions.push({ state, symbol, nextState });
}

function renderOut(res) {
  document.querySelector("#out").textContent = `${res}`;
}

function renderOutString(res) {
  outString.innerHTML = `${res
    .split("")
    .map((el) => `<span>${el}</span>`)
    .join("")}`;
}

function dragEnter(e) {
  e.preventDefault();
}

function dragOver(e) {
  e.preventDefault();
}

function dragLeave(e) {}

function drop(e) {
  const className = e.dataTransfer.getData("text/plain");

  //  draggable.textContent.trim()
  const circle = new CircleShape({
    position: { x: e.clientX - NODE_WIDTH, y: e.clientY - 112 },
    attrs: {
      body: {
        fill: className.includes("qf") ? FILL_NODE_FINAL : "#ffffff",
      },
    },
  });
  circle.addTo(graph);

  // GET JSON INFO
  const jsonObj = graph.toJSON();
  // console.log(jsonObj);

  // ANIMATE ELEMENTS
  // circle.attr("body/stroke", "orange");

  //  console.log(paper.model.getElements()[0].attr("body/stroke", "orange"));
}

function animateNode(state = "q0", symbol, color = "orange") {
  // all model changes should happen in a transaction
  const data = paper.model
    .getElements()
    .find((el) => el.attributes.attrs.label.text === state);
  data.attr("body/stroke", color);

  console.log("LInks");
  // console.log(symbol);
  const links = graph.getConnectedLinks(data, { outbound: true });

  const currentLink = links.find((el) =>
    el.attributes.labels[0].attrs.text.text.split(",").includes(symbol)
  );
  console.log(currentLink);
  if (currentLink) currentLink.attr("line/stroke", "#ff0000");

  setTimeout(() => {
    data.attr("body/stroke", "black");
    if (currentLink) currentLink.attr("line/stroke", "black");
    outString.querySelectorAll("span").forEach((el) => (el.className = ""));
  }, 500);
}

function verify(automata, string) {
  let state = automata.initialState;
  let i = 0;
  let symbol = string[i];

  const interval = setInterval(() => {
    console.log(state);
    console.log("i: ", i);
    console.log("symbol: ", symbol);

    if (i >= string.length) {
      console.log(i);
      clearInterval(interval);

      if (automata.finalStates.includes(state)) {
        renderOut("VALID");
        return "VALID";
      }

      renderOut("INVALID");
      return "INVALID";
    }

    outString.querySelector(`span:nth-child(${i + 1})`).className =
      "text-blue-500 font-bold";

    const isState = automata.transitions.find(
      (el) => el.state === state && el.symbol.includes(symbol)
    );

    if (!isState) {
      clearInterval(interval);
      console.log("sale");
      renderOut("INVALID");
      return "INVALID";
    }
    animateNode(state, symbol);

    i++;
    state = isState.nextState;
    symbol = string[i];
  }, 1000);
}

/*
 AFND
*/

// function epsilonCierre(estado, automata) {
//   // Esta función calcula el conjunto de estados alcanzables por transiciones epsilon (ε) desde un estado dado.
//   const cierreEpsilon = new Set();
//   let pila = [estado];

//   while (pila.length > 0) {
//     estadoActual = pila.pop();
//     cierreEpsilon.add(estadoActual);

//     for (let transicion of automata.transitions) {
//       // console.log(transicion);
//       if (!cierreEpsilon.has(transicion.nextState)) {
//         pila.push(transicion.nextState);
//       }
//     }
//   }

//   return cierreEpsilon;
// }

// function verificarCadena(automata, cadena) {
//   let estadosActuales = epsilonCierre(automata.initialState, automata);
//   // console.log(estadosActuales);

//   for (const simbolo of cadena) {
//     let nuevosEstados = new Set();

//     for (const estado of estadosActuales) {
//       for (const transicion of automata.transitions) {
//         if (
//           estado === transicion.nextState &&
//           transicion.symbol.includes(simbolo)
//         ) {
//           nuevosEstados = new Set([
//             ...nuevosEstados,
//             ...epsilonCierre(transicion.nextState, automata),
//           ]);
//         }
//       }
//     }

//     console.log("Nuevos estados");
//     console.log(nuevosEstados);
//     estadosActuales = nuevosEstados;
//   }

//   for (const estadoFinal of estadosActuales) {
//     if (automata.finalStates.includes(estadoFinal)) {
//       return "Cadena válida";
//     }
//   }

//   return "Cadena no válida";
// }

function verifyAFND(automata, string) {
  // Inicializamos un conjunto de estados actuales con el estado inicial
  let estados_actuales = [automata.initialState];
  //let i = 0;
  //let symbol = string[i];
  let symbolI = 0;

  // Iteramos a través de cada símbolo en la cadena de entrada
  //const interval = setInterval(() => {
  for (let symbol of string) {
    // Creamos un nuevo conjunto de estados actuales vacío
    let nuevos_estados = new Set();
    let estado_actual = estados_actuales[0];
    let estadoIndex = 0;

    // Iteramos a través de cada estado actual
    const intervalStates = setInterval(() => {
      console.log("Estado Index: ", estadoIndex);
      console.log("Estado Actuales: ", estados_actuales);
      console.log("Symbol I: ", symbolI);

      // if (estados_actuales.size === 0 || estadoIndex >= estados_actuales.size) {
      if (symbolI >= string.length) {
        console.log("FINISH");
        // Después de procesar toda la cadena, verificamos si al menos uno de los estados actuales es un estado de aceptación
        clearInterval(intervalStates);
        return;
        // for (let estado of estados_actuales) {
        //   if (automata.finalStates.includes(estado)) {
        //     alert("VALID");
        //     clearInterval(intervalStates);
        //     return;
        //   }
        // }
        // alert("INVALID");
        // clearInterval(intervalStates);
      }

      // for (let estado_actual of estados_actuales) {
      console.log(estado_actual);
      animateNode(estado_actual, symbol);

      // Buscamos todas las transiciones posibles para el símbolo actual desde el estado actual
      transiciones = automata.transitions.filter(
        (transition) =>
          transition.state === estado_actual &&
          transition.symbol.includes(symbol)
      );

      console.log("estado_actual: ", estado_actual);
      console.log("Simbolo: ", symbol);
      console.log("Transiciones: ", transiciones);

      // Agregamos los estados alcanzables por estas transiciones al nuevo conjunto de estados actuales
      nuevos_estados = new Set([
        ...nuevos_estados,
        ...transiciones.map((el) => el.nextState),
      ]);

      estadoIndex++;
      symbolI++;
      estado_actual = estados_actuales[estadoIndex];
    }, 1000);

    // i++;
    // symbol = string[i];

    // Actualizamos el conjunto de estados actuales con los nuevos estados
    estados_actuales = nuevos_estados;
  }
  //}, 1000);

  // Después de procesar toda la cadena, verificamos si al menos uno de los estados actuales es un estado de aceptación
  for (let estado of estados_actuales) {
    if (automata.finalStates.includes(estado)) {
      return true;
    }
  }

  // Si no hay estados de aceptación en los estados actuales, la cadena no es aceptada
  return false;
}

/*
  AFND FIN
*/

function run() {
  const data = graph.toJSON();
  const elements = paper.model.getElements();
  const states = {};
  const finalStates = [];

  clearAutomata();

  console.log(elements);

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
      createTransition(
        states[el.source.id].text,
        el.labels[0].attrs.text.text.split(",") || "transition",
        states[el.target.id].text
      );
    }
  });

  const statesArr = [];
  Object.values(states).forEach((state) => {
    statesArr.push(state.text);
  });

  const alphabet = inputAlphabet.value.split(",");
  const string = inputString.value;

  console.log(finalStates);

  if (statesArr.length <= 0) {
    alert("No states");
    return;
  }

  createAutomata(alphabet, statesArr, "q0", finalStates);
  console.log(automata);
  renderOut("Loading ...");
  renderOutString(string);
  // verify(automata, string);
  console.log(verifyAFND(automata, string));
}

document.querySelector("#run").addEventListener("click", run);
