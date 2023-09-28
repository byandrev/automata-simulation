function animateNode(paper, graph, state = "q0", symbol, color = "orange") {
  const data = paper.model
    .getElements()
    .find((el) => el.attributes.attrs.label.text === state);
  data.attr("body/stroke", color);

  const links = graph.getConnectedLinks(data, { outbound: true });

  const currentLink = links.find((el) =>
    el.attributes.labels[0].attrs.text.text.split(",").includes(symbol)
  );

  if (currentLink) currentLink.attr("line/stroke", "#ff0000");

  setTimeout(() => {
    data.attr("body/stroke", "black");
    if (currentLink) currentLink.attr("line/stroke", "black");

    document
      .querySelector("#string-out")
      .querySelectorAll("span")
      .forEach((el) => (el.className = "symbol"));
  }, 500);
}

function renderOut(value) {
  document.querySelector("#out").textContent = `${value}`;
}

function renderOutString(value) {
  document.querySelector("#string-out").innerHTML = `${value
    .split("")
    .map((el) => `<span class='symbol'>${el}</span>`)
    .join("")}`;
}

export { animateNode, renderOut, renderOutString };
