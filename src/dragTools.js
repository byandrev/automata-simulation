import { NODE_WIDTH, FILL_NODE_FINAL, CircleShape } from "./shapes.js";

function dragEnter(e) {
  e.preventDefault();
}

function dragOver(e) {
  e.preventDefault();
}

function dragLeave(e) {}

function drop(e, graph) {
  const className = e.dataTransfer.getData("text/plain");

  let paddingY = window.location.pathname.includes("turing") ? 170 : 70;

  const circle = new CircleShape({
    position: { x: e.clientX - NODE_WIDTH / 2, y: e.clientY - paddingY },
    attrs: {
      label: {
        text: className,
      },
      body: {
        fill: className.includes("qf") ? FILL_NODE_FINAL : "#ffffff",
      },
    },
  });

  circle.addTo(graph);
}

function startDragTools(graph) {
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
  $canvas.addEventListener("drop", (e) => drop(e, graph));
}

export { startDragTools };
