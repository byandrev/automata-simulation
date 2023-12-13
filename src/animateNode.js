import { FILL_NODE_FINAL } from "./shapes";

function animateNode(
  paper,
  graph,
  state = "q0",
  symbol,
  isFinal,
  target,
  color = "#f8d6ac"
) {
  const elements = paper.model.getElements();

  const data = paper.model
    .getElements()
    .find((el) => el.attributes.attrs.label.text === state);

  data.attr("body/stroke", color);
  data.attr("body/fill", color);

  const links = graph.getConnectedLinks(data, { outbound: true });

  const nodeTarget = elements.find(
    (el) => el.attributes.attrs.label.text === target
  );
  const currentLink = links.find(
    (el) =>
      el.attributes.labels[0].attrs.text.text.split(",").includes(symbol) &&
      el.attributes.target.id === nodeTarget.id
  );

  if (currentLink) {
    currentLink.attr("line/stroke", "orange");
    const svg = document.querySelector(`g[model-id="${currentLink.id}"]`);
    svg.classList.add("current");
  }

  setTimeout(() => {
    data.attr("body/stroke", "black");

    if (!isFinal) data.attr("body/fill", "#ffffff");
    else data.attr("body/fill", FILL_NODE_FINAL);

    if (currentLink) {
      currentLink.attr("line/stroke", "black");
      const svg = document.querySelector(`g[model-id="${currentLink.id}"]`);
      svg.classList.remove("current");
    }

    /*
    document
      .querySelector("#string-out")
      .querySelectorAll("span")
      .forEach((el) => (el.className = "symbol"));
      */
  }, 500);
}

function renderOut(value) {
  document.querySelector("#out").innerHTML = `
    <div class="animate__fadeIn">
      ${
        value === "VALID"
          ? `<i class="fa-solid fa-circle-check text-sm text-green-500"></i>`
          : value === "INVALID"
          ? `<i class="fa-solid fa-circle-exclamation text-sm text-red-500"></i>`
          : ""
      }
      <span class="${
        value === "VALID"
          ? "text-green-400"
          : value === "INVALID"
          ? "text-red-400"
          : ""
      }">${value}</span>
    </div>
  `;
}

function renderOutString(value) {
  document.querySelector("#string-out").innerHTML = `${value
    .split("")
    .map((el) => `<span class='symbol'>${el}</span>`)
    .join("")}`;
}

function renderError(error) {
  const errorEl = document.querySelector("#error");

  if (!error) {
    errorEl.innerHTML = "";
    return;
  }

  errorEl.innerHTML = `<p class="animate__fadeIn">
    <span class="font-bold block text-red-500">Error:</span>
    ${error}
  </p>`;
}

export { animateNode, renderError, renderOut, renderOutString };
