import html2canvas from "html2canvas";

function download() {
  const canvas = document.querySelector("#paper");
  html2canvas(canvas).then((result) => {
    const a = document.createElement("a");
    a.href = result.toDataURL("image/png");
    a.download = `automata-${Date.now()}.png`;
    a.click();
  });
}

export default download;
