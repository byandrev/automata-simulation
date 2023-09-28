import MicroModal from "micromodal";
import { Link } from "./shapes";

const { dia, shapes, connectors } = joint;
const { TangentDirections } = connectors.curve;

const CANVAS_WIDTH = document.querySelector("#paper").clientWidth;
const CANVAS_HEIGHT = document.body.scrollHeight - 50;

// Theme
const highlighterAttributes = {
  stroke: "#4666E5",
  "stroke-width": 2,
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
};

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

function initGraph() {
  const graph = new dia.Graph({}, { cellNamespace: shapes });
  const paper = new dia.Paper({
    el: document.getElementById("paper"),
    model: graph,
    cellViewNamespace: shapes,
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
      return connectors.curve(
        sourcePoint,
        targetPoint,
        route,
        options,
        linkView
      );
    },
    defaultLink: () => new Link(),

    linkView: joint.dia.LinkView.extend({
      pointerdblclick: function (linkView, evt, x, y) {
        const inputEl = document.querySelector("#input-label-name");
        MicroModal.show("modal-label-name");
        inputEl.setAttribute("link-id", this.model.id);
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
    // const label = prompt("Label name?");
    // currentElement.attr("label/text", label);
    console.log(currentElement);
    const inputEl = document.querySelector("#input-state-name");
    MicroModal.show("modal-state-name");
    inputEl.setAttribute("state-id", currentElement.id);
  });

  return { graph, paper };
}

export { CANVAS_HEIGHT, initGraph };
