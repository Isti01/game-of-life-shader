import "normalize.css";
import "./style.css";
import starterImage from "../assets/starter.png";
import { runSimulation } from "./simulation/gameOfLife.ts";

const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl2", { antialias: false });

if (gl === null) {
  document.body.appendChild(
    document.createTextNode("Could not create WebGL2 context")
  );
} else {
  document.body.appendChild(canvas);
  resizeCanvas(canvas);
  window.addEventListener("resize", () => resizeCanvas(canvas));
  runSimulation(gl, starterImage).then(success => {
    if (!success) {
      document.body.appendChild(
        document.createTextNode("Failed to initialize simulation")
      );
    }
  });
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}